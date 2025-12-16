import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Static rule-based checks (run before AI for deterministic detection)
interface StaticCheck {
  type: 'vulnerability' | 'bug' | 'code_smell';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  pattern: string;
  fix: string;
}

const staticChecks: { pattern: RegExp; check: StaticCheck }[] = [
  // Hardcoded secrets
  {
    pattern: /(?:api[_-]?key|apikey|secret|password|passwd|pwd|token|auth)[\s]*[:=][\s]*["'][\w\-]{16,}["']/gi,
    check: {
      type: 'vulnerability',
      severity: 'critical',
      title: 'Hardcoded Secret Detected',
      description: 'Credentials or API keys are hardcoded in the source code. This is a critical security risk.',
      pattern: 'Hardcoded credential pattern',
      fix: 'Move secrets to environment variables or a secure secret management service.'
    }
  },
  // SQL Injection patterns
  {
    pattern: /(?:execute|query|exec)\s*\(\s*["'`].*\$\{|\.query\s*\(\s*`[^`]*\$\{|["'].*\+.*(?:req|request|params|query|body)\./gi,
    check: {
      type: 'vulnerability',
      severity: 'critical',
      title: 'Potential SQL Injection',
      description: 'User input appears to be directly concatenated into SQL queries without proper sanitization.',
      pattern: 'String concatenation in SQL query',
      fix: 'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL.'
    }
  },
  // Command Injection
  {
    pattern: /(?:exec|spawn|execSync|spawnSync|execFile)\s*\([^)]*(?:\+|`|\$\{)/gi,
    check: {
      type: 'vulnerability',
      severity: 'critical',
      title: 'Potential Command Injection',
      description: 'User input may be passed to shell commands without proper sanitization.',
      pattern: 'Dynamic command execution',
      fix: 'Avoid shell commands with user input. If necessary, use allowlists and escape all input.'
    }
  },
  // XSS in innerHTML
  {
    pattern: /\.innerHTML\s*=|dangerouslySetInnerHTML/gi,
    check: {
      type: 'vulnerability',
      severity: 'high',
      title: 'Potential XSS Vulnerability',
      description: 'Direct HTML injection can lead to Cross-Site Scripting attacks.',
      pattern: 'innerHTML assignment',
      fix: 'Use textContent instead of innerHTML, or sanitize HTML with DOMPurify.'
    }
  },
  // Eval usage
  {
    pattern: /\beval\s*\(|new\s+Function\s*\(/gi,
    check: {
      type: 'vulnerability',
      severity: 'high',
      title: 'Dangerous eval() Usage',
      description: 'eval() can execute arbitrary code and is a security risk.',
      pattern: 'eval() or Function constructor',
      fix: 'Avoid eval(). Use JSON.parse() for JSON data, or refactor to avoid dynamic code execution.'
    }
  },
  // Weak crypto
  {
    pattern: /(?:md5|sha1)\s*\(|createHash\s*\(\s*["'](?:md5|sha1)["']\)/gi,
    check: {
      type: 'vulnerability',
      severity: 'medium',
      title: 'Weak Cryptographic Hash',
      description: 'MD5 and SHA1 are cryptographically weak and should not be used for security purposes.',
      pattern: 'Weak hash algorithm',
      fix: 'Use SHA-256 or stronger hashing algorithms. For passwords, use bcrypt or Argon2.'
    }
  },
  // Console.log with sensitive data
  {
    pattern: /console\.log\s*\([^)]*(?:password|secret|token|key|auth|credential)/gi,
    check: {
      type: 'code_smell',
      severity: 'medium',
      title: 'Sensitive Data in Logs',
      description: 'Logging sensitive information can expose credentials in production logs.',
      pattern: 'Sensitive data logging',
      fix: 'Remove or mask sensitive data before logging. Use structured logging with redaction.'
    }
  },
  // TODO/FIXME security
  {
    pattern: /(?:\/\/|#|\/\*)\s*(?:TODO|FIXME|HACK|XXX).*(?:security|auth|password|encrypt)/gi,
    check: {
      type: 'code_smell',
      severity: 'low',
      title: 'Security-Related TODO',
      description: 'There are unresolved security-related tasks in the code.',
      pattern: 'Security TODO comment',
      fix: 'Address the security concern before deploying to production.'
    }
  },
  // Disabled SSL verification
  {
    pattern: /rejectUnauthorized\s*:\s*false|NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*["']?0|verify\s*=\s*False|ssl\s*=\s*False/gi,
    check: {
      type: 'vulnerability',
      severity: 'high',
      title: 'SSL Verification Disabled',
      description: 'Disabling SSL verification makes the application vulnerable to man-in-the-middle attacks.',
      pattern: 'SSL verification disabled',
      fix: 'Enable SSL verification. Fix certificate issues properly instead of disabling verification.'
    }
  },
  // Hardcoded IP/localhost in production
  {
    pattern: /["'](?:localhost|127\.0\.0\.1|0\.0\.0\.0):\d+["']/gi,
    check: {
      type: 'code_smell',
      severity: 'low',
      title: 'Hardcoded Localhost',
      description: 'Hardcoded localhost addresses may cause issues in production environments.',
      pattern: 'Localhost URL',
      fix: 'Use environment variables for host configuration.'
    }
  }
];

function runStaticChecks(code: string): { issues: StaticCheck[]; lines: number[] }[] {
  const results: { issues: StaticCheck[]; lines: number[] }[] = [];
  const lines = code.split('\n');

  for (const { pattern, check } of staticChecks) {
    const matches: number[] = [];
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        matches.push(index + 1);
      }
      // Reset regex lastIndex for global patterns
      pattern.lastIndex = 0;
    });

    if (matches.length > 0) {
      results.push({ issues: [check], lines: matches });
    }
  }

  return results;
}

// Confidence scoring based on detection method agreement
type ConfidenceLevel = 'High' | 'Medium' | 'Low';

interface IssueWithConfidence {
  type: string;
  severity: string;
  title: string;
  description: string;
  line?: number;
  fix: string;
  source: 'static' | 'ai';
  confidence: ConfidenceLevel;
  confidence_reason: string;
  detection_methods: string[];
}

function calculateConfidence(
  issue: any,
  staticIssues: any[],
  aiIssues: any[]
): { confidence: ConfidenceLevel; reason: string; methods: string[] } {
  const issueTitle = issue.title?.toLowerCase() || '';
  const issueType = issue.type?.toLowerCase() || '';
  
  // Check if this issue was detected by static analysis
  const staticMatch = staticIssues.find(s => 
    s.title?.toLowerCase().includes(issueTitle.split(' ')[0]) ||
    issueTitle.includes(s.title?.toLowerCase().split(' ')[0] || '') ||
    s.type === issueType
  );
  
  // Check if this issue was detected by AI
  const aiMatch = aiIssues.find(a => 
    a.title?.toLowerCase().includes(issueTitle.split(' ')[0]) ||
    issueTitle.includes(a.title?.toLowerCase().split(' ')[0] || '') ||
    a.type === issueType
  );
  
  const methods: string[] = [];
  if (staticMatch || issue.source === 'static') methods.push('Static Pattern Match');
  if (aiMatch || issue.source === 'ai') methods.push('AI Reasoning');
  
  // Static + AI agreement → High confidence
  if (methods.length >= 2 || (staticMatch && aiMatch)) {
    return {
      confidence: 'High',
      reason: 'Detected by both static analysis and AI reasoning, indicating high reliability.',
      methods: ['Static Pattern Match', 'AI Reasoning']
    };
  }
  
  // Static only → Medium confidence
  if (issue.source === 'static' || (staticMatch && !aiMatch)) {
    return {
      confidence: 'Medium',
      reason: 'Detected by static pattern matching only; may require manual verification.',
      methods: ['Static Pattern Match']
    };
  }
  
  // AI-only reasoning → Low confidence
  return {
    confidence: 'Low',
    reason: 'Detected by AI reasoning only; recommend code review for confirmation.',
    methods: ['AI Reasoning']
  };
}

function getExplanationPrompt(level: 'junior' | 'senior' | 'lead'): string {
  switch (level) {
    case 'junior':
      return `Explain issues in simple terms for a junior developer. Use analogies and step-by-step explanations. 
              Assume limited security knowledge. Be encouraging but clear about risks.
              Example: "This is like leaving your house key under the doormat - anyone who knows to look there can get in."`;
    case 'senior':
      return `Provide concise, technical explanations for an experienced developer. 
              Include specific CWE references where applicable. Focus on impact and efficient fixes.
              Skip basic explanations - get to the point.`;
    case 'lead':
      return `Provide detailed analysis for a security lead or architect. 
              Include threat modeling context, attack vectors, compliance implications (OWASP, PCI-DSS, SOC2).
              Discuss defense-in-depth strategies and systemic fixes.
              Reference specific CVEs or CWEs where relevant.`;
    default:
      return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, explanationLevel = 'senior', userId, saveToHistory = false } = await req.json();
    
    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: "Code and language are required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    // Initialize Supabase client for usage tracking and history
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check usage limits if userId provided
    if (userId) {
      const { data: usage, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!usageError && usage) {
        // Reset monthly count if needed
        const billingStart = new Date(usage.billing_period_start);
        const now = new Date();
        if (now.getMonth() !== billingStart.getMonth() || now.getFullYear() !== billingStart.getFullYear()) {
          await supabase
            .from('usage_tracking')
            .update({ 
              scans_this_month: 0, 
              billing_period_start: now.toISOString() 
            })
            .eq('user_id', userId);
        } else if (usage.scans_this_month >= usage.scans_limit) {
          return new Response(
            JSON.stringify({ 
              error: "Monthly scan limit reached",
              limit: usage.scans_limit,
              used: usage.scans_this_month,
              tier: usage.subscription_tier
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    console.log(`Analyzing ${language} code snippet (${code.length} chars) at ${explanationLevel} level`);

    // Step 1: Run static checks first (deterministic)
    const staticResults = runStaticChecks(code);
    const staticIssues = staticResults.flatMap(r => 
      r.issues.map(issue => ({
        ...issue,
        line: r.lines[0],
        source: 'static'
      }))
    );

    console.log(`Static analysis found ${staticIssues.length} issues`);

    // Step 2: Run AI analysis
    const explanationContext = getExplanationPrompt(explanationLevel as 'junior' | 'senior' | 'lead');
    
    const systemPrompt = `You are a security expert and code analyzer. ${explanationContext}

Analyze the provided code for:
1. Security vulnerabilities (SQL injection, XSS, buffer overflow, etc.)
2. Common bugs and logic errors
3. Poor coding practices
4. Performance issues

${staticIssues.length > 0 ? `
IMPORTANT: The following issues were already detected by static analysis. Do NOT repeat these, but you may expand on them with more context:
${staticIssues.map(i => `- ${i.title}: ${i.description}`).join('\n')}
` : ''}

For each NEW issue found, provide:
- Type: The category of the issue (vulnerability, bug, code_smell, performance)
- Severity: critical, high, medium, or low
- Line: Approximate line number if applicable
- Description: Clear explanation of the issue (appropriate for ${explanationLevel} level)
- Fix: Specific code fix or recommendation

Respond in JSON format:
{
  "summary": "Brief overview of findings",
  "issues": [
    {
      "type": "vulnerability|bug|code_smell|performance",
      "severity": "critical|high|medium|low",
      "title": "Short title",
      "line": 1,
      "description": "Detailed explanation",
      "fix": "Code or recommendation to fix"
    }
  ],
  "fixed_code": "The complete corrected code if fixes are needed",
  "score": 0-100
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      analysis = {
        summary: content,
        issues: [],
        score: 50
      };
    }

    // Combine static and AI issues with confidence scoring
    const staticIssuesWithSource = staticIssues.map(i => ({ ...i, source: 'static' as const }));
    const aiIssuesWithSource = (analysis.issues || []).map((i: any) => ({ ...i, source: 'ai' as const }));
    
    const allIssues: IssueWithConfidence[] = [
      ...staticIssuesWithSource,
      ...aiIssuesWithSource
    ].map(issue => {
      const { confidence, reason, methods } = calculateConfidence(
        issue,
        staticIssuesWithSource,
        aiIssuesWithSource
      );
      return {
        ...issue,
        confidence,
        confidence_reason: reason,
        detection_methods: methods
      };
    });

    // Calculate severity counts
    const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
    const highCount = allIssues.filter(i => i.severity === 'high').length;
    const mediumCount = allIssues.filter(i => i.severity === 'medium').length;
    const lowCount = allIssues.filter(i => i.severity === 'low').length;

    // Calculate confidence distribution
    const confidenceCounts = {
      high: allIssues.filter(i => i.confidence === 'High').length,
      medium: allIssues.filter(i => i.confidence === 'Medium').length,
      low: allIssues.filter(i => i.confidence === 'Low').length
    };

    // Adjust score based on static findings
    let finalScore = analysis.score || 50;
    finalScore = Math.max(0, finalScore - (criticalCount * 20) - (highCount * 10) - (mediumCount * 5));

    const finalAnalysis = {
      summary: analysis.summary,
      issues: allIssues,
      fixed_code: analysis.fixed_code,
      score: finalScore,
      static_checks: staticIssues,
      severity_counts: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount
      },
      confidence_distribution: confidenceCounts
    };

    // Update usage and save to history if requested
    if (userId) {
      // Increment usage directly
      const { data: currentUsage } = await supabase
        .from('usage_tracking')
        .select('scans_this_month')
        .eq('user_id', userId)
        .single();
      
      if (currentUsage) {
        await supabase
          .from('usage_tracking')
          .update({ scans_this_month: currentUsage.scans_this_month + 1 })
          .eq('user_id', userId);
      }

      // Save to history if requested
      if (saveToHistory) {
        const codeHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(code))
          .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

        await supabase.from('scan_history').insert({
          user_id: userId,
          code_hash: codeHash,
          language,
          score: finalScore,
          summary: finalAnalysis.summary,
          issues_count: allIssues.length,
          critical_count: criticalCount,
          high_count: highCount,
          medium_count: mediumCount,
          low_count: lowCount,
          issues: allIssues,
          fixed_code: analysis.fixed_code,
          static_checks: staticIssues
        });
      }
    }

    console.log(`Analysis complete: ${allIssues.length} total issues (${staticIssues.length} static, ${analysis.issues?.length || 0} AI)`);

    return new Response(
      JSON.stringify(finalAnalysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in analyze-code function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
