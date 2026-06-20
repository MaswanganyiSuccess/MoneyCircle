import { useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import authService from "@/api";
//import authService from '/src/api/index.ts'
export default function LandingPage() {
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
        const stored = localStorage.getItem('theme');
        return stored === 'dark' || stored === 'light' ? stored : 'system';
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); 
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    useEffect(() => {
        const root = window.document.documentElement;
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = theme === 'dark' || (theme === 'system' && systemDark);
        root.classList.toggle('dark', isDark);
        localStorage.setItem('theme', theme);
    }, [theme]);
    const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
        setTheme(newTheme);
    };
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            if (authMode === 'login') {
                // Trigger login API call
                const response = await authService.login({ email, password });
                setSuccessMessage(response.message || 'Login successful!');

                // Redirect or update local application layout state here
                console.log('Logged-in user context:', response.data.user);
            } else {
                // Placeholder placeholder until signup variables are dropped in
                alert('Signup integration is up next!');
            }
        } catch (err) {
            // Displays precise backend error message returned by interceptor
            setErrorMessage(err.message || 'Authentication failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
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
            <main className="flex-1 flex items-center justify-center">
                <div className="w-full h-[80vh] min-h-[600px] grid grid-cols-1 md:grid-cols-12 border dark:bg-background/70 shadow-2xl backdrop-blur-2xl overflow-hidden">


                    <div className="hidden md:flex md:col-span-5 relative flex-col justify-between p-10 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-background to-background border-r border-border/20">
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
                </div>
                    <div className="col-span-1 md:col-span-7 flex flex-col justify-center px-6 py-6 md:py-12 sm:px-16 md:px-20 overflow-y-auto bg-background/30 dark:bg-background/10">
                        <div className="w-full max-w-sm mx-auto space-y-2 text-center md:text-left ">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-normal my-2">
                                {authMode === 'login'
                                    ? 'Enter your email and password to access your account!'
                                    : 'Sign up to start borrowing or investing.'}
                            </p>
                        </div>
                        {errorMessage && (
                            <div className="w-full max-w-sm mx-auto p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-medium text-destructive text-center">
                                {errorMessage}
                            </div>
                        )}

                        {successMessage && (
                            <div className="w-full max-w-sm mx-auto p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-500 text-center">
                                {successMessage}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-5">
                            {authMode === 'signup' && (
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <label className="text-xs font-semibold tracking-wide text-foreground/80">
                                            Full Name
                                        </label>
                                       
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        disabled={loading}
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="flex h-11 w-full rounded-xl border border-input bg-background/50 dark:bg-black/20 px-3.5 py-2 text-sm shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary focus-visible:outline-none disabled:opacity-50"
                                    />
                                </div>
                            )}
                            
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold tracking-wide text-foreground/80">
                                        Email
                                    </label>

                                </div>
                                <input
                                    type="email"
                                    required
                                    disabled={loading}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="flex h-11 w-full rounded-xl border border-input bg-background/50 dark:bg-black/20 px-3.5 py-2 text-sm shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary focus-visible:outline-none disabled:opacity-50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-semibold tracking-wide text-foreground/80">
                                        Password
                                    </label>
                                    {authMode === 'login' && (
                                        <a
                                            href="#forgot"
                                            className="text-xs font-medium text-sky-400 underline hover:text-primary transition-colors"
                                        >
                                            Forgot Password?
                                        </a>
                                    )}
                                </div>
                                <input
                                    type="password"
                                    required
                                    disabled={loading}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    className="flex h-11 w-full rounded-xl border border-input bg-background/50 dark:bg-black/20 px-3.5 py-2 text-sm shadow-sm transition-all focus:border-primary focus:ring-1 focus:ring-primary focus-visible:outline-none disabled:opacity-50"
                                />
                            </div>

                            {authMode === 'login' && (
                                <div className="flex items-center space-x-2 py-0.5">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        disabled={loading}
                                        className="h-4 w-4 rounded border-input text-primary focus:ring-primary bg-background/50 disabled:opacity-50"
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="text-xs font-medium text-muted-foreground select-none cursor-pointer"
                                    >
                                        Remember me
                                    </label>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full flex h-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow transition-all hover:opacity-90 active:scale-[0.99] mt-2"
                            >
                                {loading ? 'Processing...' : authMode === 'login' ? 'Sign In' : 'Sign Up'}
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                className="w-full flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background/40 hover:bg-accent text-sm font-medium transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                <span>Sign In with Google</span>
                            </button>
                        </form>

                        <div className="mt-8 text-center text-xs text-muted-foreground">
                            {authMode === 'login' ? (
                                <>
                                    Don't have an account?{' '}
                                    <button
                                        onClick={() => setAuthMode('signup')}
                                        className="text-primary font-bold hover:underline transition-all"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => setAuthMode('login')}
                                        className="text-primary font-bold hover:underline transition-all"
                                    >
                                        Sign In
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}