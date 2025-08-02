import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Library, Plus } from "lucide-react";
import { StyleLibraryModal } from "./style-library-modal";

interface FloatingActionMenuProps {
  onQuickGenerate?: () => void;
}

export function FloatingActionMenu({ onQuickGenerate }: FloatingActionMenuProps) {
  const [isStyleLibraryOpen, setIsStyleLibraryOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 space-y-3 z-40">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setIsStyleLibraryOpen(true)}
            >
              <Library className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Style Library</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon"
              className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 bg-gradient-to-r from-[var(--brand-red)] to-[var(--brand-purple)] text-white"
              onClick={onQuickGenerate}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Quick Generate</TooltipContent>
        </Tooltip>
      </div>

      <StyleLibraryModal
        open={isStyleLibraryOpen}
        onOpenChange={setIsStyleLibraryOpen}
      />
    </>
  );
}
