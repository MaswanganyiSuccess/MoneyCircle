import { Link } from 'react-router-dom';
import OnboardingFlow from '@/components/views/Signup/OnboardingFlow';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 rounded-3xl border border-border/70 bg-background/90 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Create your MoneyCircle account</p>
              <h1 className="text-3xl font-semibold">Start your onboarding</h1>
            </div>
            <div className="space-x-3">
              <Link
                to="/"
                className="rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm font-medium transition hover:bg-muted/40"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>

        <OnboardingFlow />
      </div>
    </div>
  );
}
