import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { 
  GraduationCap, 
  Users, 
  Target, 
  Trophy,
  ArrowRight,
  CheckCircle2,
  Globe,
  Shield
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Personalized Recruitment',
    description: 'Get matched with colleges that fit your athletic and academic profile perfectly.',
  },
  {
    icon: GraduationCap,
    title: 'Academic Support',
    description: 'Navigate NCAA eligibility, SAT/ACT prep, and scholarship requirements with expert guidance.',
  },
  {
    icon: Globe,
    title: 'Global Network',
    description: 'Access to 500+ college programs across all NCAA divisions, NAIA, and NJCAA.',
  },
  {
    icon: Shield,
    title: 'Full Transparency',
    description: 'Track every step of your recruitment journey in your personal dashboard.',
  },
];

const stats = [
  { value: '500+', label: 'Athletes Placed' },
  { value: '95%', label: 'Success Rate' },
  { value: '200+', label: 'Partner Colleges' },
  { value: '$2M+', label: 'Scholarships Secured' },
];

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button variant="venture" size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 venture-gradient opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 mb-8 animate-fade-in">
              <Trophy className="h-4 w-4 text-venture-gold" />
              <span className="text-sm text-primary-foreground/90">Trusted by 500+ athletes worldwide</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 animate-slide-up leading-tight">
              Your Path to
              <span className="block text-venture-blue-light">College Soccer</span>
              Starts Here
            </h1>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto animate-slide-up stagger-1">
              Expert guidance, personalized support, and full transparency throughout your college recruitment journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2">
              <Link to="/auth?mode=signup">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Sign In to Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-3xl md:text-4xl font-bold text-venture-blue mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From initial profile building to signing day, we're with you every step of the way.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-venture-blue/30 hover:shadow-venture transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-12 w-12 rounded-xl bg-venture-blue/10 flex items-center justify-center mb-4 group-hover:bg-venture-blue/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-venture-blue" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A streamlined process designed to maximize your chances of success.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {[
              { step: '01', title: 'Create Your Profile', description: 'Sign up and complete your athletic and academic profile with our easy-to-use portal.' },
              { step: '02', title: 'Get Matched', description: 'Our team analyzes your profile and identifies the best college fits based on your goals.' },
              { step: '03', title: 'Active Outreach', description: 'We contact coaches on your behalf and keep you updated on every interaction.' },
              { step: '04', title: 'Secure Your Spot', description: 'Review offers, make your decision, and celebrate your college commitment!' },
            ].map((item, index) => (
              <div 
                key={item.step}
                className="flex gap-6 mb-8 last:mb-0 animate-slide-in-left"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="flex-shrink-0">
                  <div className="h-14 w-14 rounded-2xl venture-gradient flex items-center justify-center text-primary-foreground font-bold text-lg shadow-venture">
                    {item.step}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 venture-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyek0zNiAxNHYySDI0di0yaDF6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
            Join hundreds of athletes who have successfully navigated their college soccer journey with Venture.
          </p>
          <Link to="/auth?mode=signup">
            <Button variant="hero" size="xl">
              Create Your Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-venture-navy-dark">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Logo variant="light" size="sm" />
            <p className="text-primary-foreground/60 text-sm">
              © {new Date().getFullYear()} Venture Sports USA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
