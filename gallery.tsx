import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";

export default function Gallery() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text mb-4">Gallery</h1>
          <p className="text-neutral-600 mb-8">Browse your generated images</p>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-neutral-500">Gallery page coming soon!</p>
              <p className="text-sm text-neutral-400 mt-2">
                This page will showcase all your generated images in a beautiful gallery layout.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
