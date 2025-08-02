import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface StyleLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyStyle?: (style: any) => void;
}

export function StyleLibraryModal({ open, onOpenChange, onApplyStyle }: StyleLibraryModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stylesData, isLoading } = useQuery({
    queryKey: ["/api/styles", user?.id],
    enabled: !!user?.id && open,
  });

  const deleteStyleMutation = useMutation({
    mutationFn: (styleId: string) => api.deleteStyle(styleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/styles", user?.id] });
      toast({
        title: "Style deleted",
        description: "The style has been removed from your library",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the style",
        variant: "destructive",
      });
    },
  });

  const styles = stylesData?.styles || [];

  const handleApplyStyle = (style: any) => {
    onApplyStyle?.(style);
    onOpenChange(false);
    toast({
      title: "Style applied",
      description: `Applied "${style.name}" to your generation settings`,
    });
  };

  const handleDeleteStyle = (styleId: string) => {
    deleteStyleMutation.mutate(styleId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-neutral-900">
            Style Library
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-neutral-500">Loading styles...</div>
            </div>
          ) : styles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500">No saved styles yet.</p>
              <p className="text-sm text-neutral-400 mt-1">
                Generate images and save styles to build your library!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {styles.map((style: any) => (
                <div
                  key={style.id}
                  className="bg-neutral-50 rounded-xl p-4 hover:bg-neutral-100 transition-colors cursor-pointer"
                  onClick={() => handleApplyStyle(style)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-neutral-900">{style.name}</h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-neutral-400 hover:text-neutral-600"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStyle(style.id);
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-sm text-neutral-600 mb-2">
                    {style.refinement || style.baseStyle}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {style.baseStyle}
                    </Badge>
                    {style.tags?.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="text-xs text-neutral-400">
                    Used {style.usageCount || 0} times
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
