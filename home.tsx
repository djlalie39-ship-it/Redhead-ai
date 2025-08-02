import { useState, useEffect } from "react";
import { useAuth } from "@/lib/supabase";
import { Header } from "@/components/header";
import { GenerationPanel } from "@/components/generation-panel";
import { ImageGallery } from "@/components/image-gallery";
import { FloatingActionMenu } from "@/components/floating-action-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const { user, signIn, signUp, isAuthenticated } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [latestImages, setLatestImages] = useState<string[]>([]);
  const [latestPrompt, setLatestPrompt] = useState<string>("");
  const [latestHistoryId, setLatestHistoryId] = useState<string>("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, username, password);
      } else {
        await signIn(email, username);
      }
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const handleGenerate = (images: string[], historyId: string) => {
    setLatestImages(images);
    setLatestHistoryId(historyId);
    // Get the latest prompt from the generation panel form
    // This is a simplified version - in a real app you'd pass the prompt through
    setLatestPrompt("Latest generated image");
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">
                <div className="gradient-text text-2xl font-bold mb-2">
                  Welcome to red.head.ai
                </div>
                <p className="text-sm text-neutral-600 font-normal">
                  {isSignUp ? "Create your account" : "Sign in to your account"}
                </p>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                {isSignUp && (
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-[var(--brand-red)] to-[var(--brand-purple)]"
                >
                  {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
              </form>
              
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-sm"
                >
                  {isSignUp 
                    ? "Already have an account? Sign in" 
                    : "Don't have an account? Sign up"
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <GenerationPanel onGenerate={handleGenerate} />
          </div>
          
          <div className="lg:col-span-2">
            <ImageGallery 
              latestImages={latestImages}
              latestPrompt={latestPrompt}
              latestHistoryId={latestHistoryId}
            />
          </div>
        </div>
      </main>
      
      <FloatingActionMenu onQuickGenerate={scrollToTop} />
    </div>
  );
}
