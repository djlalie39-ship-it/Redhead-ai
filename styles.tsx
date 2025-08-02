import { useState } from "react";
import { Header } from "@/components/header";
import { StyleLibraryModal } from "@/components/style-library-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Styles() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold gradient-text mb-4">Style Library</h1>
          <p className="text-neutral-600 mb-8">Manage your saved styles</p>
          
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-neutral-500 mb-4">
                Access your saved styles and create new ones
              </p>
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-[var(--brand-red)] to-[var(--brand-purple)]"
              >
                Open Style Library
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <StyleLibraryModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}
