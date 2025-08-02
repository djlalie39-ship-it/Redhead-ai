import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/lib/supabase";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function History() {
  const { user } = useAuth();

  const { data: historyData, isLoading } = useQuery({
    queryKey: ["/api/history", user?.id],
    enabled: !!user?.id,
  });

  const history = historyData?.history || [];

  const downloadImage = async (imageUrl: string, filename?: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `redhead-ai-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-4">Generation History</h1>
          <p className="text-neutral-600">All your previously generated images</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">Loading your history...</p>
          </div>
        ) : history.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="text-neutral-500">No generation history yet.</p>
              <p className="text-sm text-neutral-400 mt-2">
                Start generating images to see them here!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {history.map((item: any) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-square relative group">
                  {item.imageUrls && item.imageUrls[0] && (
                    <>
                      <img
                        src={item.imageUrls[0]}
                        alt="Generated image"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          onClick={() => downloadImage(item.imageUrls[0], `generation-${item.id}.jpg`)}
                          className="bg-white/90 text-neutral-900 px-4 py-2 rounded-lg font-medium shadow-lg backdrop-blur-sm hover:bg-white"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </>
                  )}
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-neutral-600 line-clamp-2 mb-2">
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{item.style}</span>
                    <span>{new Date(item.generatedAt).toLocaleDateString()}</span>
                  </div>
                  {item.imageUrls && item.imageUrls.length > 1 && (
                    <p className="text-xs text-neutral-500 mt-1">
                      +{item.imageUrls.length - 1} more images
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
