🔐 CodeGuard AI — AI-Powered Code Security Analyzer

CodeGuard AI is a production-grade code security analyzer that combines static analysis and AI-assisted reasoning to detect, explain, and track security vulnerabilities in source code.

Unlike tools that rely purely on LLMs, CodeGuard AI uses a hybrid detection pipeline to minimize false positives and provide actionable, trustworthy results.

🚀 Key Features

Hybrid Security Analysis

Static pattern checks + AI reasoning

Reduces hallucinations and false positives

Multi-Language Support

Python, JavaScript, TypeScript, Java, C/C++, Go, PHP, and more

Detailed Vulnerability Reports

CWE mapping

Severity levels (Critical / High / Medium / Low)

Line-level detection

Confidence indicators

AI-Generated Fix Recommendations

Secure, production-ready remediation guidance

Explanation modes: Junior / Senior / Security Lead

Security Scoring

Transparent 0–100 score

Justified based on impact and codebase size

Scan History & Trend Tracking

Track improvements over time

Compare scans and detect regressions

GitHub Pull Request Security Checks

Automatic scanning on PRs

Blocks merges on critical vulnerabilities

Clean, non-spam PR comments

False Positive Management

Mark and persist false positives

Prevents score inflation

Feedback used to refine future analysis

API Access

Programmatic scanning via secure API keys

Suitable for CI/CD and internal tooling

🧠 Design Philosophy

AI assists — it does not guess

Detections are deterministic

Every finding is explainable

Security decisions are traceable

This project intentionally avoids “black-box AI” and prioritizes trust, clarity, and developer usability.

🏗️ Architecture Overview

Frontend: React

Backend: Node.js / API Routes

Authentication: Supabase Auth

Database: PostgreSQL (Supabase)

AI Engine: Google Gemini (reasoning & explanations)

Static Analysis: Regex + rule-based detection

Payments: Stripe (subscription-based)

Integrations: GitHub Webhooks & API

🔍 Example Detection
query = f"SELECT * FROM users WHERE username = '{username}'"


Detected Issue: SQL Injection (CWE-89)
Severity: Critical
Confidence: High
Recommended Fix: Parameterized queries

📈 Current Status

Core analysis engine: ✅ Complete

GitHub PR integration: ✅ Ready

False positive feedback loop: ✅ Implemented

Usage-based pricing: ✅ Implemented

IDE plugins: ⏳ Planned

🎯 Why This Project Exists

Most security scanners either:

Flood developers with false positives, or

Act as opaque AI black boxes

CodeGuard AI is built to be:

Accurate

Explainable

Developer-friendly

Production-ready

📌 Disclaimer

CodeGuard AI is designed to assist secure development practices.
It does not replace professional security audits or penetration testing.
