import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER' // Default role
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/login') {
      setIsLogin(true);
    } else {
      setIsLogin(false);
    }
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        toast.success('Successfully logged in!');
      } else {
        await register(formData.name, formData.email, formData.password, formData.role);
        toast.success('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden shadow-[0_4px_32px_rgba(58,48,42,0.06)] bg-surface-container-lowest min-h-[700px] border border-outline-variant/30">
        {/* Left Side: Branding & Visuals */}
        <div className="relative hidden md:flex flex-col justify-between p-12 mesh-gradient-bg overflow-hidden border-r border-outline-variant/40">
          {/* Decorative Elements */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl mix-blend-multiply"></div>
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-tertiary-container/10 rounded-full blur-3xl mix-blend-multiply"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary shadow-sm">
                <span className="material-symbols-outlined text-xl" style={{"fontVariationSettings":"'FILL' 1"}}>landscape</span>
              </div>
              <span className="font-headline text-3xl font-bold text-primary tracking-tight">Sahara</span>
            </div>
            <div className="max-w-md">
              <h1 className="font-headline text-5xl lg:text-6xl font-bold leading-[1.1] text-on-background mb-6">
                Sun-Baked<br/>Simplicity.
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
                Experience a new era of team management. Luxurious warmth meets disciplined minimalism in every interaction.
              </p>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container-high overflow-hidden">
                <img alt="Team member" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBw4YqUQoouN7_IkHQ9OlQ4qGy_ogjvw06wYseCDASsFjkGRM9oV5dUC2r4h6Y9HOa5H_RUW9bU6o-C7ptptwbY7ec-rb5vHeFcNsBBYvEjrTShnSC7NRraPo8CNgO6zmjdyuz9Vi-MWvkKlU6F7gjcjuwwUMMpgu-unYa4eXet1fsiUtGh_gsKROwR1oh66iKFyhSqVgFucrst9Zp4YupwbrbK-CJ42-ig_FhCXyEqe2ykkEQ7pEf1GxLdG5pc5LSOvmYTwvbkkQ"/>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-surface-container-high overflow-hidden">
                <img alt="Team member" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpQp3QVgApfJaaLVUNeX0Zp24DyN0homVbwBdH6zlnXx5eJJHYjZEp3tUBB8iS6UlffM0CwYzJ5LM5IKynsL5g9zDzshHtkInyukIQL59HsbfGhMFfLcDSs4Sf1XlpjxGVr4xAFIB_ItCqW3b031dE-4n_HAlVpmtWGTsPPSPtYKxxndHdOloH96XgxD498tDF1Up1lPUFtZ-lo3_iirmzEUoiN3IVwUOf4prYNjTwefADN6OCVG5CtYfDx_8I2hG4xsXVn-qgOHs"/>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-surface-container-lowest bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold">
                +12
              </div>
            </div>
            <div className="text-sm font-medium text-on-surface-variant">
              Join premium teams worldwide
            </div>
          </div>
        </div>

        {/* Right Side: Signup/Login Form */}
        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 bg-surface-container-lowest relative">
          <div className="w-full max-w-md mx-auto">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-3 mb-8 justify-center">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-xl" style={{"fontVariationSettings":"'FILL' 1"}}>landscape</span>
              </div>
              <span className="font-headline text-2xl font-bold text-primary">Sahara</span>
            </div>

            <div className="mb-10 text-center md:text-left">
              <h2 className="font-headline text-3xl font-bold text-on-background mb-2">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-on-surface-variant">
                {isLogin ? 'Sign in to manage your team.' : 'Start managing your team with elegant simplicity.'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input - Only for Signup */}
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-on-surface" htmlFor="name">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-on-surface-variant/70 text-[20px]">person</span>
                    </div>
                    <input 
                      className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant rounded-lg bg-surface hover:border-outline focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-on-surface placeholder:text-outline/70 shadow-sm sm:text-sm" 
                      id="name" name="name" placeholder="Jane Doe" type="text"
                      value={formData.name} onChange={handleChange} required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface" htmlFor="email">Work Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant/70 text-[20px]">mail</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant rounded-lg bg-surface hover:border-outline focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-on-surface placeholder:text-outline/70 shadow-sm sm:text-sm" 
                    id="email" name="email" placeholder="jane@company.com" type="email"
                    value={formData.email} onChange={handleChange} required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-on-surface" htmlFor="password">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant/70 text-[20px]">lock</span>
                  </div>
                  <input 
                    className="block w-full pl-10 pr-3 py-2.5 border border-outline-variant rounded-lg bg-surface hover:border-outline focus:ring-1 focus:ring-primary focus:border-primary transition-colors text-on-surface placeholder:text-outline/70 shadow-sm sm:text-sm" 
                    id="password" name="password" placeholder="••••••••" type="password"
                    value={formData.password} onChange={handleChange} required
                  />
                </div>
              </div>

              {/* Role Selector - Only for Signup */}
              {!isLogin && (
                <div className="space-y-2 pt-2">
                  <label className="block text-sm font-medium text-on-surface mb-2">Select your role</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`relative flex cursor-pointer rounded-xl border ${formData.role === 'ADMIN' ? 'border-primary ring-1 ring-primary' : 'border-outline-variant opacity-80'} bg-surface p-4 hover:bg-surface-container-low transition-all`}>
                      <input 
                        className="sr-only" name="role" type="radio" value="ADMIN"
                        checked={formData.role === 'ADMIN'} onChange={handleChange}
                      />
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${formData.role === 'ADMIN' ? 'text-primary' : 'text-on-surface-variant'}`} style={{"fontVariationSettings":"'FILL' 1"}}>shield_person</span>
                          <span className="text-sm font-medium text-on-surface">Admin</span>
                        </div>
                        <div className={`h-4 w-4 rounded-full border-4 ${formData.role === 'ADMIN' ? 'border-primary bg-surface-container-lowest' : 'border-transparent bg-outline'}`}></div>
                      </div>
                    </label>
                    <label className={`relative flex cursor-pointer rounded-xl border ${formData.role === 'MEMBER' ? 'border-primary ring-1 ring-primary' : 'border-outline-variant opacity-80'} bg-surface p-4 hover:bg-surface-container-low transition-all`}>
                      <input 
                        className="sr-only" name="role" type="radio" value="MEMBER"
                        checked={formData.role === 'MEMBER'} onChange={handleChange}
                      />
                      <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`material-symbols-outlined ${formData.role === 'MEMBER' ? 'text-primary' : 'text-on-surface-variant'}`}>group</span>
                          <span className="text-sm font-medium text-on-surface">Member</span>
                        </div>
                        <div className={`h-4 w-4 rounded-full border-4 ${formData.role === 'MEMBER' ? 'border-primary bg-surface-container-lowest' : 'border-transparent bg-outline'}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button 
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-on-primary bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors shadow-[0_2px_8px_rgba(194,101,42,0.25)] disabled:opacity-70" 
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </div>
            </form>

            <div className="mt-8 text-center text-sm text-on-surface-variant">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                className="font-semibold text-primary hover:text-primary-container underline underline-offset-4 decoration-primary/30 hover:decoration-primary transition-all" 
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Create one' : 'Sign in'}
              </button>
            </div>

            <div className="mt-6 text-center text-xs text-secondary max-w-xs mx-auto">
              By continuing, you agree to our <a className="underline decoration-secondary/30 hover:text-on-surface" href="#">Terms of Service</a> and <a className="underline decoration-secondary/30 hover:text-on-surface" href="#">Privacy Policy</a>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
