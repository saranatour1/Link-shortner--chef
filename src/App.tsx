import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { LinkHistoryTable } from "./components/LinkHistoryTable";
import { LoginForm } from "./components/LoginForm";
import { Toaster } from "sonner";
import { Link } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-muted">
      <Authenticated>
        <div className="app-container">
          <header className="app-header">
            <div className="header-content">
              <h1 className="app-title">LinkShort</h1>
              <SignOutButton />
            </div>
          </header>
          
          <main className="main-content">
            <Content />
          </main>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
          <div className="flex w-full max-w-sm flex-col gap-6">
            <a href="#" className="flex items-center gap-2 self-center font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <Link className="size-4" />
              </div>
              LinkShort
            </a>
            <LoginForm />
          </div>
        </div>
      </Unauthenticated>
      
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center content-section">
        <h2 className="main-heading">
          Manage Your Links
        </h2>
        <p className="subtitle">
          Welcome back, {loggedInUser?.email ?? "friend"}!
        </p>
      </div>

      <div className="space-y-8">
        <LinkHistoryTable />
      </div>
    </div>
  );
}
