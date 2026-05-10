import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'XORAS Sentry // Institutional Code Integrity',
  description: 'AST-powered, local-first security auditing for the sovereign software engineer. Catch hardcoded secrets and hallucinations before the market does.',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
      
      {/* NAV */}
      <nav className="flex justify-between items-center px-6 py-5 border-b border-white/5 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-50">
        <div className="font-mono font-bold text-cyan-400 text-lg tracking-widest">XORAS</div>
        <div className="flex items-center gap-6">
          <a href="#how" className="text-zinc-400 text-sm hover:text-white transition-colors hidden md:block">How It Works</a>
          <a href="#compare" className="text-zinc-400 text-sm hover:text-white transition-colors hidden md:block">Compare</a>
          <a href="https://github.com/aoxendine3/xoras-sentry" className="text-zinc-400 text-sm hover:text-white transition-colors hidden md:block">GitHub</a>
          <a href="https://aoxendine.gumroad.com/l/xoras-sentry" className="px-5 py-2.5 bg-cyan-500 text-black font-bold rounded-lg text-sm hover:bg-cyan-400 transition-colors">
            Get Sentry
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 font-mono text-xs tracking-widest mb-8">
            V1.2.2 // INSTITUTIONAL RELEASE
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            The Market Will<br />Audit Your Secrets.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light">
            XORAS Sentry audits your code first. Local-first, AST-powered security for the sovereign software engineer.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
            <a href="https://aoxendine.gumroad.com/l/xoras-sentry" className="px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all">
              Get XORAS Sentry
            </a>
            <a href="https://github.com/aoxendine3/xoras-sentry" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors">
              View Repository
            </a>
          </div>
          {/* Mockup */}
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
            <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <div className="ml-4 text-[10px] text-zinc-500 font-mono">XORAS_SENTRY_CLI // live_audit_stream</div>
            </div>
            <Image src="/mockup.png" alt="XORAS Sentry CLI output showing real-time secret detection" width={1100} height={619} className="w-full" priority />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-5xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { stat: '$4.4M', label: 'Average Breach Cost', desc: "94% of leaks are due to 'structural blindness' in legacy tools. One missed template literal is all it takes." },
          { stat: '12 MIN', label: 'Time to Leak', desc: "From commit to indexed scraper. Scrapers don't care about your privacy; XORAS does." },
          { stat: '100%', label: 'Local-First', desc: 'Your source code never leaves your machine. No accounts. No telemetry. Zero cloud dependency.' },
        ].map((item, i) => (
          <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl font-bold text-red-500 font-mono mb-2">{item.stat}</div>
            <div className="text-lg font-bold mb-4">{item.label}</div>
            <p className="text-zinc-500 text-sm leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-cyan-400 font-mono text-xs tracking-widest uppercase mb-4">Protocol</div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-16">Three Steps to<br />Institutional Integrity</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { num: '01 // INSTALL', title: 'One Command Deploy', body: 'No account. No data upload. Run npx xoras-sentry . in any project directory.' },
            { num: '02 // SCAN', title: 'AST-Deep Analysis', body: 'The engine parses your code\'s abstract syntax tree—not regex patterns—to find secrets inside template literals and dynamic expressions.' },
            { num: '03 // REPORT', title: 'Institutional Audit Report', body: 'Get a structured, machine-readable report with file, line, and severity for every finding. Export HTML or pipe to CI.' },
          ].map((step, i) => (
            <div key={i}>
              <div className="text-cyan-400 font-mono text-xs tracking-widest mb-4">{step.num}</div>
              <h4 className="text-xl font-bold mb-3">{step.title}</h4>
              <p className="text-zinc-500 leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPARISON */}
      <section id="compare" className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-cyan-400 font-mono text-xs tracking-widest uppercase mb-4">Analysis</div>
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-12">XORAS vs. Legacy Tools</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {['Feature', 'Legacy Regex Scanners', 'XORAS Sentry'].map((h, i) => (
                  <th key={i} className="px-6 py-4 text-left text-xs font-mono text-zinc-500 uppercase tracking-widest border-b border-white/10">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Logic Awareness', 'No — Blind to context', '✓ AST-Deep Parsing'],
                ['Cloud Dependency', 'High — Data upload required', '✓ Zero — Fully Local'],
                ['Hallucination Detection', 'None', '✓ Schema-Based'],
                ['Audit Speed', 'Linear scan', '✓ 6x Faster (Parallelized)'],
                ['CI/CD Integration', 'Manual setup', '✓ GitHub Action included'],
                ['Idempotent Events', 'None', '✓ Tamper-evident ledger'],
              ].map(([feature, legacy, xoras], i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5 font-semibold">{feature}</td>
                  <td className="px-6 py-5 text-zinc-500">{legacy}</td>
                  <td className="px-6 py-5 text-cyan-400 font-semibold">{xoras}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FOOTER CTA */}
      <div className="max-w-5xl mx-auto px-6 mb-24">
        <div className="relative rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 text-center p-16 overflow-hidden">
          <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 font-mono text-xs tracking-widest mb-6">
              READY FOR FINALITY
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-6">Audit Before the<br />Market Does.</h2>
            <p className="text-zinc-400 mb-10 text-lg">One command. Zero cloud. Institutional integrity.</p>
            <a href="https://aoxendine.gumroad.com/l/xoras-sentry" className="inline-block px-10 py-5 bg-cyan-500 text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform mb-8">
              Get Institutional Access
            </a>
            <div className="flex items-center justify-center gap-4 bg-black/50 border border-white/10 rounded-xl px-8 py-4 w-fit mx-auto">
              <code className="font-mono text-cyan-400">npx xoras-sentry .</code>
              <span className="text-zinc-600 text-xs">No install required</span>
            </div>
          </div>
        </div>
      </div>

      <footer className="max-w-5xl mx-auto px-6 py-10 border-t border-white/5 flex justify-between items-center flex-wrap gap-4">
        <p className="text-zinc-600 text-sm">&copy; 2026 XORAS Institutional Core. BSL-1.1 License.</p>
        <div className="flex gap-6">
          <a href="https://github.com/aoxendine3/xoras-sentry" className="text-zinc-600 text-sm hover:text-white transition-colors">GitHub</a>
          <a href="https://aoxendine.gumroad.com/l/xoras-sentry" className="text-zinc-600 text-sm hover:text-white transition-colors">Purchase</a>
          <a href="https://github.com/aoxendine3/xoras-sentry/blob/main/SECURITY.md" className="text-zinc-600 text-sm hover:text-white transition-colors">Security</a>
        </div>
      </footer>
    </div>
  );
}
