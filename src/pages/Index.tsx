import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { HeroBackground } from "@/components/HeroBackground";
import { CodeScanner } from "@/components/CodeScanner";
import { FeatureCard } from "@/components/FeatureCard";
import { StatCard } from "@/components/StatCard";
import { Footer } from "@/components/Footer";
import {
  Shield,
  Zap,
  GitBranch,
  Code2,
  Lock,
  Cpu,
  ArrowRight,
  Check,
  Terminal,
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16">
        <HeroBackground />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Floating badge with glow effect */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm mb-8 animate-float backdrop-blur-sm shadow-[0_0_30px_hsl(var(--primary)/0.2)]">
              <Cpu className="w-4 h-4 animate-pulse" />
              <span className="font-medium tracking-wide">Powered by Advanced ML Models</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>

            {/* Main heading with enhanced typography */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-[0.95] tracking-tight">
              <span className="block text-foreground drop-shadow-[0_0_35px_hsl(var(--primary)/0.3)]">Catch Vulnerabilities</span>
              <span className="block gradient-text mt-2 animate-glow">Before Hackers Do</span>
            </h1>

            {/* Subheading with glassmorphism card */}
            <div className="relative max-w-2xl mx-auto mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 blur-xl" />
              <p className="relative text-lg md:text-xl text-muted-foreground leading-relaxed backdrop-blur-sm bg-card/30 rounded-xl px-6 py-4 border border-border/50">
                AI-powered static analysis that detects bugs, security flaws, and
                poor practices in your code — then suggests{" "}
                <span className="text-primary font-semibold">context-aware fixes</span>{" "}
                automatically.
              </p>
            </div>

            {/* CTA buttons with enhanced styling */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
              <Button variant="hero" size="xl" className="group shadow-[0_0_40px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_60px_hsl(var(--primary)/0.5)] transition-all duration-300">
                Start Free Analysis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="heroOutline" size="xl" className="group backdrop-blur-sm">
                <Terminal className="w-5 h-5 group-hover:text-primary transition-colors" />
                View CLI Docs
              </Button>
            </div>

            {/* Trust badges with improved layout */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span>Free for open source</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                  <Check className="w-3 h-3 text-success" />
                </div>
                <span>SOC 2 compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <StatCard value="150+" label="CWE Types Detected" />
            <StatCard value="5M" suffix="+" label="Scans Completed" />
            <StatCard value="98" suffix="%" label="Fix Accuracy" />
            <StatCard value="<2s" label="Avg. Scan Time" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Enterprise-Grade Security,
              <br />
              <span className="gradient-text">Developer-Friendly UX</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on transformer models trained on real vulnerabilities from
              7,500+ commits across 295 open-source projects.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={Shield}
              title="Vulnerability Detection"
              description="Identifies SQL injection, XSS, buffer overflows, and 150+ CWE types with ML-powered semantic analysis."
              highlight="18,945+ training samples"
            />
            <FeatureCard
              icon={Zap}
              title="AI-Generated Fixes"
              description="Get contextual code patches that actually work. Our CodeT5 model generates accurate fixes, not generic suggestions."
              highlight="87% recall rate"
            />
            <FeatureCard
              icon={GitBranch}
              title="CI/CD Integration"
              description="Native GitHub Actions and GitLab CI support. Block vulnerable code before it reaches production."
              highlight="Zero-config setup"
            />
            <FeatureCard
              icon={Code2}
              title="Multi-Language Support"
              description="Analyze Python, JavaScript, TypeScript, Java, C++, Go, and more with language-aware AST parsing."
              highlight="8+ languages"
            />
            <FeatureCard
              icon={Lock}
              title="Secrets Detection"
              description="Catch hardcoded API keys, tokens, and credentials before they leak. Integrates with secret managers."
              highlight="Real-time scanning"
            />
            <FeatureCard
              icon={Cpu}
              title="IDE Plugins"
              description="VS Code and JetBrains extensions for instant feedback as you code. No context switching needed."
              highlight="Coming soon"
            />
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-24 bg-card/30 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              See It In Action
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Watch as our AI scans vulnerable code, identifies security issues,
              and generates production-ready fixes in real-time.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <CodeScanner />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative p-12 rounded-2xl gradient-border bg-card overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Start Securing Your Code Today
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Join thousands of developers who trust CodeGuard AI to catch
                  vulnerabilities before they become breaches.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="lg">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="lg">
                    Schedule Demo
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
