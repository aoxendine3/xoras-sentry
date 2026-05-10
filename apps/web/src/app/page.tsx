import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Abstract Glow */}
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="container mx-auto max-w-6xl px-6 pt-32 pb-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-400 font-mono text-xs tracking-widest mb-8 animate-fade-in">
            V1.2.2 // INSTITUTIONAL RELEASE
          </div>
          
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
            The Market Will <br /> Audit Your Secrets.
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light">
            XORAS Sentry audits your code first. Local-first, AST-powered security for the sovereign software engineer.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a 
              href="https://aoxendine.gumroad.com/l/xoras-sentry" 
              className="px-8 py-4 bg-cyan-500 text-black font-bold rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition-transform"
            >
              Get XORAS Sentry
            </a>
            <a 
              href="https://github.com/aoxendine3/xoras-sentry" 
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-colors"
            >
              View Repository
            </a>
          </div>

          <div className="mt-20 rounded-2xl border border-white/10 bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/50" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
              <div className="w-3 h-3 rounded-full bg-green-500/50" />
              <div className="ml-4 text-[10px] text-zinc-500 font-mono">XORAS_SENTRY_CLI // live_audit_stream</div>
            </div>
            <div className="p-8 aspect-video bg-[#0a0a0a] flex items-center justify-center">
              <div className="text-center">
                <div className="text-cyan-500 font-mono text-xl mb-4 animate-pulse">[INSTITUTIONAL_CORE_LOADED]</div>
                <div className="text-zinc-500 font-mono text-xs">Awaiting local Sentry node uplink...</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="container mx-auto max-w-6xl px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { stat: "$4.4M", label: "Average Breach Cost", desc: "94% of leaks are due to 'structural blindness' in legacy tools." },
          { stat: "12 MIN", label: "Time to Leak", desc: "From commit to indexed scraper. Scrapers don't care about privacy." },
          { stat: "100%", label: "Local-First", desc: "Your source code never leaves your machine. No accounts. No cloud." }
        ].map((item, i) => (
          <div key={i} className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-colors">
            <div className="text-4xl font-bold text-red-500 font-mono mb-2">{item.stat}</div>
            <div className="text-lg font-bold mb-4">{item.label}</div>
            <p className="text-zinc-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto max-w-4xl px-6 py-24">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready for Finality?</h2>
          <p className="text-zinc-400 mb-10">Audit your code before the market audits you.</p>
          <code className="block bg-black p-4 rounded-xl border border-white/5 font-mono text-zinc-400 mb-10">
            npx xoras-sentry .
          </code>
          <a 
            href="https://aoxendine.gumroad.com/l/xoras-sentry" 
            className="inline-block px-10 py-5 bg-cyan-500 text-black font-bold rounded-xl shadow-lg hover:scale-105 transition-transform"
          >
            Start Audit Now
          </a>
        </div>
      </div>

      <footer className="py-12 border-t border-white/5 text-center text-zinc-600 text-sm">
        <p>&copy; 2026 XORAS Institutional Core. All rights reserved. BSL-1.1 License.</p>
      </footer>
    </div>
  );
}
