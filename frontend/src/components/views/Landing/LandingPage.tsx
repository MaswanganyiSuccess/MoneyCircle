import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sun, Moon, Laptop, Users, HandCoins, TrendingUp, Loader2,
} from 'lucide-react';
import { useTheme } from './../../hooks/useTheme';

export default function LandingPage() {
    // Theme from custom hook
    const { theme, setTheme } = useTheme();

    // Login form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const navigate = useNavigate();

    const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
    };

    // Handle login
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Login failed');
            setSuccessMessage(data.message || 'Login successful!');
            localStorage.setItem('accessToken', data.data.tokens.accessToken);
            localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
            navigate('/dashboard');
        } catch (err: any) {
            setErrorMessage(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Stats (4 items)
    const stats = [
        { label: 'Total Loans Funded', value: 'ZAR 12.5M+', icon: HandCoins },
        { label: 'Active Investors', value: '3,842', icon: Users },
        { label: 'Borrowers Served', value: '1,296', icon: Users },
        { label: 'Average Return', value: '11.8%', icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Navbar */}
            <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/60 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2 tracking-tight">
                        <img
                            src="/logos/moneycircle-logo.svg"
                            alt="MoneyCircle Logo"
                            className="h-10 w-auto object-contain block dark:hidden"
                        />
                        <img
                            src="/logos/moneycircle-logo-dark.svg"
                            alt="MoneyCircle Logo"
                            className="h-10 w-auto object-contain hidden dark:block"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 rounded-full border border-border/40 bg-muted/40 p-1 backdrop-blur-sm">
                            <button
                                onClick={() => changeTheme('light')}
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                                    theme === 'light'
                                        ? 'bg-background text-foreground shadow-sm scale-105'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="Light Mode"
                            >
                                <Sun className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => changeTheme('system')}
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                                    theme === 'system'
                                        ? 'bg-background text-foreground shadow-sm scale-105'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="System Theme"
                            >
                                <Laptop className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => changeTheme('dark')}
                                className={`inline-flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                                    theme === 'dark'
                                        ? 'bg-background text-foreground shadow-sm scale-105'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                                title="Dark Mode"
                            >
                                <Moon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main */}
            <main className="flex-1 flex items-center justify-center">
                <div className="w-full h-[80vh] min-h-[600px] grid grid-cols-1 md:grid-cols-12 border dark:bg-background/70 shadow-2xl backdrop-blur-2xl overflow-hidden">
                    
                    {/* Left – Brand + 4 Stats */}
                    <div className="hidden md:flex md:col-span-5 relative flex-col justify-between p-8 lg:p-10 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-background to-background border-r border-border/20">
                        <div className="absolute -inset-10 opacity-30 dark:opacity-20 pointer-events-none bg-gradient-to-tr from-primary via-pink-500 to-blue-500 blur-3xl rounded-full transform -rotate-12 animate-pulse" />

                        <div className="relative z-10 text-xs font-semibold uppercase tracking-widest text-primary/80 flex items-center gap-1">
                            <span className="h-1 w-3 bg-primary rounded-full" />
                            <p>BORROW · INVEST · GROW</p>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
                                Get{' '}
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Everything
                                </span>{' '}
                                You Want
                            </h2>
                            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                                You can get everything you want if you work hard, trust the process, and stick to the plan.
                            </p>
                        </div>

                        {/* 4 Stats (2x2 grid) */}
                        <div className="relative z-10 grid grid-cols-2 gap-3 mt-4">
                            {stats.map((stat, idx) => (
                                <div key={idx} className="bg-background/40 backdrop-blur-sm rounded-lg p-3 border border-border/30 shadow-sm">
                                    <div className="flex items-center gap-2 text-primary">
                                        <stat.icon className="h-4 w-4" />
                                        <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                                    </div>
                                    <p className="text-lg font-bold text-foreground mt-0.5">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right – Login Form */}
                    <div className="col-span-1 md:col-span-7 flex flex-col justify-center px-6 py-8 md:py-12 sm:px-12 md:px-16 overflow-y-auto bg-background/50 dark:bg-background/10">
                        <div className="w-full max-w-md mx-auto">
                            {/* Header */}
                            <div className="mb-8 text-center md:text-left">
                                <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                                    Welcome Back
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Sign in to access your dashboard and manage your finances.
                                </p>
                            </div>

                            {/* Messages */}
                            {errorMessage && (
                                <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
                                    {errorMessage}
                                </div>
                            )}
                            {successMessage && (
                                <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-500 text-center">
                                    {successMessage}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">
                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-foreground/80 tracking-wide">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        disabled={loading}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full h-12 px-4 rounded-xl border border-input bg-background/60 dark:bg-black/20 text-sm shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none disabled:opacity-60"
                                    />
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-medium text-foreground/80 tracking-wide">
                                            Password
                                        </label>
                                        <a
                                            href="#forgot"
                                            className="text-xs font-medium text-primary hover:underline transition-colors"
                                        >
                                            Forgot Password?
                                        </a>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        disabled={loading}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••••••"
                                        className="w-full h-12 px-4 rounded-xl border border-input bg-background/60 dark:bg-black/20 text-sm shadow-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 focus-visible:outline-none disabled:opacity-60"
                                    />
                                </div>

                                {/* Remember me */}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        disabled={loading}
                                        className="w-4 h-4 text-primary border-input rounded focus:ring-primary/20"
                                    />
                                    <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                                        Remember me
                                    </label>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Signing In…
                                        </>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>

                                {/* Divider */}
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="px-2 bg-background/80 text-muted-foreground">or</span>
                                    </div>
                                </div>

                                {/* Google */}
                                <button
                                    type="button"
                                    disabled={loading}
                                    className="w-full h-12 rounded-xl border border-border bg-background/60 hover:bg-accent/5 text-sm font-medium transition-all flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] disabled:opacity-60"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span>Sign In with Google</span>
                                </button>
                            </form>

                            {/* Sign up link */}
                            <div className="mt-8 text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-primary font-medium hover:underline transition-colors">
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}