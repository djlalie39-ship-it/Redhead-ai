import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ImageGalleryProps {
  latestImages?: string[];
  latestPrompt?: string;
  latestHistoryId?: string;
}

export function ImageGallery({ latestImages, latestPrompt, latestHistoryId }: ImageGalleryProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: historyData } = useQuery({
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
      
      toast({
        title: "Download started",
        description: "Your image is being downloaded",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {/* Latest Generation */}
      {latestImages && latestImages.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Latest Generation</h3>
            <div className="flex items-center space-x-2 text-sm text-neutral-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Generated just now</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {latestImages.map((imageUrl, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-200"
              >
                <img
                  src={imageUrl}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button
                    onClick={() => downloadImage(imageUrl, `generation-${index + 1}.jpg`)}
                    className="bg-white/90 text-neutral-900 px-4 py-2 rounded-lg font-medium shadow-lg backdrop-blur-sm hover:bg-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {latestPrompt && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-neutral-600">
                <span className="font-mono bg-neutral-100 px-2 py-1 rounded">Prompt:</span>
                <span className="ml-2">"{latestPrompt}"</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Recent History</h3>
          <Button variant="ghost" className="text-sm text-neutral-600 hover:text-neutral-900">
            View All
          </Button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-500">No images generated yet.</p>
            <p className="text-sm text-neutral-400 mt-1">
              Create your first image to see it here!
            </p>
          </div>
        ) : (
          <div className="image-grid">
            {history.map((item: any) => (
              <div key={item.id} className="image-grid-item group cursor-pointer">
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-md transition-all duration-200">
                  {item.imageUrls && item.imageUrls[0] && (
                    <img
                      src={item.imageUrls[0]}
                      alt="Historical generation"
                      className="w-full h-auto"
                    />
                  )}
                  <div className="p-3">
                    <p className="text-xs text-neutral-500 truncate">
                      {item.prompt?.slice(0, 50)}...
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(item.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
