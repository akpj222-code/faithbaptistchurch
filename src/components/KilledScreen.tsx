import { Crown, Skull } from "lucide-react";

export const KilledScreen = () => {
  return (
    <div className="min-h-screen bg-[#0f0720] flex flex-col items-center justify-center p-6 text-center overflow-hidden relative selection:bg-amber-500/30">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
        
        {/* The Icon Container with Golden Border */}
        <div className="mx-auto mb-8 w-24 h-24 rounded-full border-2 border-amber-500/30 bg-gradient-to-b from-purple-900/50 to-black/50 flex items-center justify-center backdrop-blur-sm shadow-[0_0_30px_rgba(217,119,6,0.2)] animate-pulse">
          <div className="relative">
            {/* A Crown sitting on top of a Skull */}
            <Crown className="absolute -top-6 -left-1 w-8 h-8 text-amber-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
            <Skull className="w-10 h-10 text-neutral-200" strokeWidth={1.5} />
          </div>
        </div>

        {/* Main Heading with Fancy Font */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight" style={{ fontFamily: '"Playfair Display", serif' }}>
          Dearest Visitor,
        </h1>

        {/* The "Fancily Killed" Message */}
        <div className="mb-8 space-y-2">
          <p className="text-xl md:text-2xl text-neutral-300 font-light" style={{ fontFamily: '"Playfair Display", serif' }}>
            This site has been
          </p>
          <p className="text-5xl md:text-7xl bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-sm py-2" 
             style={{ fontFamily: '"Great Vibes", cursive' }}>
            Fancily Killed x_x
          </p>
        </div>

        {/* Elegant Subtext */}
        <div className="max-w-md mx-auto space-y-6">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          
          <p className="text-neutral-400 text-sm leading-relaxed font-sans tracking-wide uppercase">
            We are currently orchestrating a <br/> 
            <span className="text-amber-500 font-semibold">Mandatory Maintenance Interval</span>
          </p>
          
          <p className="text-xs text-neutral-600 italic font-serif">
            "Patience is a virtue, and good code takes time."
          </p>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        </div>

      </div>

      {/* Footer Branding - subtle */}
      <div className="absolute bottom-8 text-center opacity-30 hover:opacity-100 transition-opacity duration-500">
        <span className="text-[10px] text-amber-100/50 uppercase tracking-[0.3em]" style={{ fontFamily: '"Playfair Display", serif' }}>
          Rest In Peace
        </span>
      </div>
    </div>
  );
};
