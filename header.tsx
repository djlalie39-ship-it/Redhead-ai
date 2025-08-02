import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [location] = useLocation();
  const { user, signOut, isAuthenticated } = useAuth();

  const navItems = [
    { path: "/", label: "Generate" },
    { path: "/gallery", label: "Gallery" },
    { path: "/styles", label: "Styles" },
    { path: "/history", label: "History" },
  ];

  if (!isAuthenticated) {
    return (
      <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand-red)] to-[var(--brand-purple)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-xl font-bold gradient-text">red.head.ai</h1>
            </div>
            <div className="text-sm text-neutral-600">
              Please sign in to use the app
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand-red)] to-[var(--brand-purple)] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <h1 className="text-xl font-bold gradient-text">red.head.ai</h1>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={`font-medium transition-colors cursor-pointer ${
                    location === item.path
                      ? "text-[var(--brand-purple)]"
                      : "text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-neutral-100 rounded-full px-3 py-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-neutral-600 font-mono">
                {user?.credits || 0} credits
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="w-8 h-8 bg-gradient-to-br from-[var(--brand-purple)] to-[var(--brand-red)] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.username?.slice(0, 2).toUpperCase() || "U"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuItem className="flex flex-col items-start">
                  <div className="font-medium">{user?.username}</div>
                  <div className="text-sm text-neutral-500">{user?.email}</div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
