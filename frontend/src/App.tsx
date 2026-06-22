import { Routes, Route } from 'react-router-dom';
import LandingPage from "@/components/views/Landing/LandingPage.tsx";
import SignupPage from "@/components/views/Signup/SignupPage.tsx";
import DashboardLayout from '@/components/DashboardLayout';
import './App.css';

function App() {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <div className="rounded-2xl border border-border/40 bg-white/5 dark:bg-black/10 p-6 backdrop-blur-md shadow-xl">
                  <h2 className="text-xl font-bold tracking-tight">Main Content Workspace Canvas Loaded!</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your full platform metrics layout grids and widgets go directly inside this block.
                  </p>
                </div>
              </DashboardLayout>
            }
        />
      </Routes>
  );
}

export default App;