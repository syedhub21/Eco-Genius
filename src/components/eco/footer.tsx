import { Leaf, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-auto pt-16 pb-8 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      {/* Aurora gradient bleed from above */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-gradient-to-b from-cyan-500/5 to-transparent blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto text-center relative z-10">
        <div className="flex justify-center items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-emerald-500 rounded-xl flex items-center justify-center text-slate-950">
            <Leaf className="w-5 h-5" />
          </div>
          <span className="font-bold text-2xl text-white">
            Eco<span className="text-cyan-400">Genius</span>
          </span>
        </div>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Empowering homeowners and businesses to make data-driven decisions
          for a sustainable future.
        </p>
        <div className="flex justify-center gap-6 mb-12">
          {[
            { icon: Github, label: "GitHub" },
            { icon: Twitter, label: "Twitter" },
            { icon: Linkedin, label: "LinkedIn" },
          ].map((s) => (
            <a
              key={s.label}
              href="#"
              aria-label={s.label}
              className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-400/40 hover:-translate-y-1 transition-all"
            >
              <s.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 text-sm text-slate-500">
          © {new Date().getFullYear()} Eco-Genius. Built for a greener tomorrow. 🌍
        </div>
      </div>
    </footer>
  );
}
