import { useTheme } from '../hooks/useTheme';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function PublicNav() {
  const { theme, setTheme } = useTheme();

  const changeTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
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
  );
}