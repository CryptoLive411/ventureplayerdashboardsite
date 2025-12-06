import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { User, Shield } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-venture-navy flex flex-col">
      {/* Background with subtle overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-venture-navy via-venture-navy/95 to-venture-navy" />
      
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="container mx-auto flex items-center justify-center">
          <Logo variant="light" size="lg" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 uppercase">
              Player Portal
            </h1>
            <p className="text-lg text-white/60">
              Access your recruitment dashboard
            </p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            <Link to="/auth" className="block">
              <Button 
                className="w-full bg-venture-blue hover:bg-venture-blue/90 text-white py-6 text-lg font-semibold flex items-center justify-center gap-3 rounded-xl transition-all hover:scale-[1.02]"
              >
                <User className="w-5 h-5" />
                Player Login
              </Button>
            </Link>
            
            <Link to="/auth?mode=signup" className="block">
              <Button 
                className="w-full bg-transparent border-2 border-white/30 text-white hover:bg-white/10 py-6 text-lg font-semibold flex items-center justify-center gap-3 rounded-xl transition-all hover:scale-[1.02]"
              >
                Create Account
              </Button>
            </Link>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-venture-navy px-4 text-sm text-white/40">or</span>
              </div>
            </div>

            <Link to="/auth?admin=true" className="block">
              <Button 
                className="w-full bg-venture-gold hover:bg-venture-gold/90 text-venture-navy py-6 text-lg font-bold flex items-center justify-center gap-3 rounded-xl transition-all hover:scale-[1.02]"
              >
                <Shield className="w-5 h-5" />
                Admin Dashboard
              </Button>
            </Link>
          </div>

          {/* Division Badges */}
          <div className="mt-12 flex items-center justify-center gap-6">
            <div className="w-12 h-12 rounded-full bg-[#003087] flex items-center justify-center">
              <span className="text-white font-black text-xs">NCAA</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#00A3E0] flex items-center justify-center">
              <span className="text-white font-black text-[10px]">NJCAA</span>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#C41230] flex items-center justify-center border-2 border-[#0A2240]">
              <span className="text-white font-black text-xs">NAIA</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center">
        <p className="text-white/30 text-sm">
          © {new Date().getFullYear()} Venture Sports USA
        </p>
      </footer>
    </div>
  );
};

export default Landing;
