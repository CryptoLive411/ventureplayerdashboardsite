import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft, Loader2, Shield, UserPlus } from 'lucide-react';
import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const AdminAuth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, userRole, loading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!loading && user) {
      if (userRole === 'admin') {
        navigate('/admin');
      }
    }
  }, [user, userRole, loading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        // Validate signup form
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        // Create account
        const { error: signUpError } = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        );

        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            toast.error('This email is already registered.');
          } else {
            toast.error(signUpError.message);
          }
          setIsSubmitting(false);
          return;
        }

        // Wait a moment for the user to be created, then get the session
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the user ID from the session
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;

        if (userId) {
          // Create pending admin request
          const { error: requestError } = await supabase
            .from('pending_admin_requests')
            .insert({
              user_id: userId,
              email: formData.email,
              first_name: formData.firstName,
              last_name: formData.lastName,
            });

          if (requestError) {
            console.error('Error creating admin request:', requestError);
          }
        }

        // Sign out the user after creating request
        await supabase.auth.signOut();
        setRequestSubmitted(true);
        toast.success('Request submitted! You will be notified when approved.');
      } else {
        // Sign in flow
        const result = signInSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast.error('Invalid email or password.');
          } else {
            toast.error(error.message);
          }
        }
      }
    } catch (err) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-venture-navy">
        <Loader2 className="h-8 w-8 animate-spin text-venture-gold" />
      </div>
    );
  }

  // Show success message after request submitted
  if (requestSubmitted) {
    return (
      <div className="min-h-screen bg-venture-navy flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-venture-gold/20 mb-6">
            <Shield className="w-10 h-10 text-venture-gold" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Request Submitted
          </h1>
          <p className="text-white/60 mb-8">
            Your staff account request has been submitted. You will receive access once an administrator approves your request.
          </p>
          <Link to="/">
            <Button className="bg-venture-gold hover:bg-venture-gold/90 text-venture-navy font-bold">
              Return to Portal
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-venture-navy flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-venture-navy via-venture-navy-dark to-venture-navy" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6">
        <div className="container mx-auto">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portal
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-venture-gold mb-6">
              {isSignUp ? <UserPlus className="w-8 h-8 text-venture-navy" /> : <Shield className="w-8 h-8 text-venture-navy" />}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isSignUp ? 'Request Staff Access' : 'Staff Login'}
            </h1>
            <p className="text-white/60">
              {isSignUp 
                ? 'Create an account to request admin access'
                : 'Venture Sports Administration Portal'}
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white/80">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-venture-gold ${errors.firstName ? 'border-red-500' : ''}`}
                    />
                    {errors.firstName && (
                      <p className="text-xs text-red-400">{errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white/80">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-venture-gold ${errors.lastName ? 'border-red-500' : ''}`}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-400">{errors.lastName}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="staff@venturesports.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-venture-gold ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-xs text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-venture-gold pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password}</p>
                )}
              </div>

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-venture-gold ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-venture-gold hover:bg-venture-gold/90 text-venture-navy font-bold py-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {isSignUp ? 'Submitting Request...' : 'Signing In...'}
                  </>
                ) : (
                  isSignUp ? 'Submit Request' : 'Sign In to Dashboard'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrors({});
                }}
                className="text-white/60 hover:text-white text-sm transition-colors"
              >
                {isSignUp ? 'Already have access? Sign in' : 'Need access? Request an account'}
              </button>
            </div>
          </div>

          {/* Logo */}
          <div className="mt-10 flex justify-center">
            <Logo variant="light" size="sm" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAuth;
