import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { ArrowRight, Check } from 'lucide-react';

// Import player images
import pedroBaisch from '@/assets/players/pedro-baisch.png';
import miloPeters from '@/assets/players/milo-peters.png';
import youssef from '@/assets/players/youssef.png';
import xavier from '@/assets/players/xavier.png';
import wassim from '@/assets/players/wassim.png';
import umberto from '@/assets/players/umberto.png';

const successStories = [
  { 
    image: pedroBaisch, 
    name: 'Pedro Baisch', 
    college: 'Merrimack College',
    division: 'NCAA D1',
    country: '🇧🇷 Brazil'
  },
  { 
    image: miloPeters, 
    name: 'Milo Peters', 
    college: 'Dartmouth',
    division: 'Ivy League',
    country: '🇩🇪 Germany'
  },
  { 
    image: youssef, 
    name: 'Youssef Shafei', 
    college: 'Central Connecticut',
    division: 'NCAA D1',
    country: '🇪🇬 Egypt'
  },
  { 
    image: xavier, 
    name: 'Xavier Souza', 
    college: 'UC Irvine',
    division: 'NCAA D1',
    country: '🇵🇹 Portugal'
  },
  { 
    image: wassim, 
    name: 'Wassim', 
    college: 'American University',
    division: 'NCAA D1',
    country: '🇫🇷 France'
  },
  { 
    image: umberto, 
    name: 'Umberto Pela', 
    college: 'Virginia',
    division: 'ACC',
    country: '🇮🇹 Italy'
  },
];

const whyUsaPoints = [
  'Combine studies and high-level sports',
  'Sports, academic and international scholarships',
  'Student-athletes are valued and supported',
  'Achieve bilingual level in English',
  'Professional opportunities: Boost your career after studies',
  'Access to the most complete academic & sports facilities',
  'Academic prestige demonstrated by world rankings',
  'International experience that increases growth',
];

const universities = [
  'Harvard', 'Stanford', 'UCLA', 'Virginia', 'Clemson', 
  'Columbia', 'Northwestern', 'Texas A&M', 'Cal Berkeley', 'Santa Clara'
];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-venture-navy">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-venture-navy/90 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Logo variant="light" size="md" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors">ABOUT</a>
            <a href="#athletes" className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors">OUR ATHLETES</a>
            <a href="#why-usa" className="text-white/70 hover:text-white text-sm font-medium tracking-wide transition-colors">WHY USA</a>
          </div>
          <Link to="/auth?mode=signup">
            <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-venture-navy px-6 py-5 text-sm font-bold tracking-widest transition-all">
              START YOUR JOURNEY
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop)',
          }}
        />
        <div className="absolute inset-0 bg-venture-navy/80" />
        
        <div className="container mx-auto px-6 relative z-10 text-center pt-20">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight mb-6 uppercase">
            Play. Study. Succeed.
          </h1>
          <p className="text-xl md:text-2xl text-white/80 font-medium tracking-wide uppercase mb-16">
            Your journey to college sports in the USA starts here.
          </p>
        </div>

        {/* Pathway Section - positioned at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row bg-venture-blue rounded-t-3xl overflow-hidden">
              <div className="flex-1 p-8 lg:p-12">
                <h2 className="text-xl md:text-2xl font-bold text-white uppercase tracking-wide mb-4">
                  The Pathway to the USA College System
                </h2>
                <p className="text-white/80 mb-6 max-w-xl">
                  We help student-athletes earn scholarships, study at top U.S. universities, and compete at the highest level — with expert guidance every step of the way.
                </p>
                <Link to="/auth?mode=signup">
                  <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-venture-blue px-6 py-5 text-sm font-bold tracking-widest transition-all">
                    START YOUR JOURNEY
                  </Button>
                </Link>
              </div>
              <div className="flex-1 bg-white p-8 lg:p-12 flex items-center justify-center gap-8 flex-wrap">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-[#003087] flex items-center justify-center">
                    <span className="text-white font-black text-lg">NCAA</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-[#00A3E0] flex items-center justify-center">
                    <span className="text-white font-black text-sm">NJCAA</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-[#C41230] flex items-center justify-center border-4 border-[#0A2240]">
                    <span className="text-white font-black text-lg">NAIA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universities Section */}
      <section className="py-16 bg-venture-navy-dark relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-wide">
              Over +3000 College Universities Are Looking for Talent
            </h3>
            <p className="text-white/60 mt-2">
              The American college system offers unparalleled opportunities for student-athletes
            </p>
          </div>
          
          {/* Scrolling logos */}
          <div className="relative overflow-hidden py-8">
            <div className="flex gap-12 animate-scroll">
              {[...universities, ...universities].map((uni, i) => (
                <div key={i} className="flex-shrink-0 px-8 py-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-white/80 font-semibold whitespace-nowrap">{uni}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why USA Section */}
      <section id="why-usa" className="py-20 md:py-28 bg-venture-navy relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide mb-4">
              Why the USA?
            </h2>
            <p className="text-xl text-white/60">
              Unmatched advantages, found nowhere else.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {whyUsaPoints.map((point, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-venture-gold flex items-center justify-center">
                  <Check className="w-4 h-4 text-venture-navy" />
                </div>
                <span className="text-white/90">{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Athletes Section */}
      <section id="athletes" className="py-20 md:py-28 bg-venture-navy-dark relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide mb-4">
              Our Athletes
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              See where Venture athletes are playing across the United States.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {successStories.map((story, index) => (
              <div 
                key={story.name}
                className="group relative overflow-hidden rounded-2xl aspect-[3/4] cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              >
                <img 
                  src={story.image} 
                  alt={story.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-venture-navy via-venture-navy/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="font-bold text-sm truncate">{story.name}</p>
                  <p className="text-xs text-white/80">{story.college}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 bg-venture-gold rounded text-venture-navy font-bold">
                      {story.division}
                    </span>
                    <span className="text-xs">{story.country}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-20 md:py-28 bg-venture-navy relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide mb-4">
              How It Works
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              A proven process designed to maximize your chances of success.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            {[
              { step: '01', title: 'Initial Assessment', description: 'We evaluate your athletic ability, academic profile, and goals to create a personalized recruitment strategy.' },
              { step: '02', title: 'Profile & Video Development', description: "Our team helps you build a compelling athletic profile with highlight videos that get coaches' attention." },
              { step: '03', title: 'Active Coach Outreach', description: 'We contact programs on your behalf, manage communications, and keep you updated on every interaction.' },
              { step: '04', title: 'Commit to Your Program', description: 'Review offers, visit campuses, and make your decision. Celebrate your college commitment!' },
            ].map((item) => (
              <div 
                key={item.step}
                className="flex gap-6 p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 rounded-xl bg-venture-blue flex items-center justify-center text-white font-bold text-lg group-hover:bg-venture-gold group-hover:text-venture-navy transition-colors">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-white/70">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-venture-blue relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-wide mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Join hundreds of international athletes who have achieved their American college soccer dreams with Venture.
          </p>
          <Link to="/auth?mode=signup">
            <Button className="bg-white text-venture-blue hover:bg-venture-gold hover:text-venture-navy px-10 py-6 text-lg font-bold tracking-widest transition-all">
              START YOUR JOURNEY
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-venture-navy-dark">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo variant="light" size="sm" />
            <p className="text-white/40 text-sm">
              © {new Date().getFullYear()} Venture Sports USA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
