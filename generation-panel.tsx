import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const generateSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  style: z.string().min(1, "Style is required"),
  refinement: z.string().optional(),
  dimension: z.enum(["1:1", "4:5", "9:11", "16:9"]),
  applyMyStyle: z.boolean().optional(),
  saveThisStyle: z.boolean().optional(),
});

type GenerateForm = z.infer<typeof generateSchema>;

const styles = [
  { id: "dreamcore", name: "Dreamcore" },
  { id: "realism", name: "Realism" },
  { id: "anime", name: "Anime" },
  { id: "editorial", name: "Editorial" },
];

const dimensions = [
  { id: "1:1", name: "1:1", icon: "w-4 h-4" },
  { id: "4:5", name: "4:5", icon: "w-3 h-4" },
  { id: "16:9", name: "16:9", icon: "w-5 h-3" },
];

interface GenerationPanelProps {
  onGenerate: (images: string[], historyId: string) => void;
}

export function GenerationPanel({ onGenerate }: GenerationPanelProps) {
  const [selectedStyle, setSelectedStyle] = useState("dreamcore");
  const [selectedDimension, setSelectedDimension] = useState("4:5");
  const { user, updateCredits } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<GenerateForm>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      prompt: "",
      style: selectedStyle,
      refinement: "",
      dimension: "4:5" as const,
      applyMyStyle: true,
      saveThisStyle: false,
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: GenerateForm) => {
      if (!user) throw new Error("User not authenticated");
      
      return api.generateImages({
        prompt: data.prompt,
        style: data.style,
        refinement: data.refinement,
        dimension: data.dimension,
        userId: user.id,
        applyMyStyle: data.applyMyStyle,
      });
    },
    onSuccess: (data) => {
      updateCredits(data.creditsRemaining);
      onGenerate(data.images, data.historyId);
      form.reset({ ...form.getValues(), prompt: "" });
      toast({
        title: "Images generated successfully!",
        description: `${data.images.length} images created. ${data.creditsRemaining} credits remaining.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/history", user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate images",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateForm) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to generate images",
        variant: "destructive",
      });
      return;
    }

    if (user.credits < 4) {
      toast({
        title: "Insufficient credits",
        description: "You need at least 4 credits to generate images",
        variant: "destructive",
      });
      return;
    }

    generateMutation.mutate({
      ...data,
      style: selectedStyle,
      dimension: selectedDimension as any,
    });
  };

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-6">Create New Image</h2>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Prompt Input */}
          <div>
            <Label htmlFor="prompt" className="text-sm font-medium text-neutral-700 mb-2">
              Describe your vision
            </Label>
            <Textarea
              id="prompt"
              placeholder="A woman in a dark forest with butterfly wings, lit like a Vogue Italia shoot..."
              className="min-h-[8rem] resize-none"
              {...form.register("prompt")}
            />
            <div className="text-xs text-neutral-500 mt-1">
              No character limit • Be descriptive
            </div>
            {form.formState.errors.prompt && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.prompt.message}</p>
            )}
          </div>

          {/* Style Selector */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-3">Style</Label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((style) => (
                <Button
                  key={style.id}
                  type="button"
                  variant={selectedStyle === style.id ? "default" : "outline"}
                  className={`p-3 text-sm font-medium ${
                    selectedStyle === style.id
                      ? "border-2 border-[var(--brand-purple)] bg-[var(--brand-purple)]/5 text-[var(--brand-purple)]"
                      : "border border-neutral-300 text-neutral-600 hover:border-neutral-400"
                  }`}
                  onClick={() => setSelectedStyle(style.id)}
                >
                  {style.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Style Refinement */}
          <div>
            <Label htmlFor="refinement" className="text-sm font-medium text-neutral-700 mb-2">
              Refine Style
            </Label>
            <Input
              id="refinement"
              placeholder="Lotus Esprit vibe, 1990s Helmut Newton lighting..."
              {...form.register("refinement")}
            />
          </div>

          {/* Reference Upload */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2">Reference Image</Label>
            <div className="border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center hover:border-[var(--brand-purple)]/50 transition-colors cursor-pointer">
              <div className="w-12 h-12 mx-auto mb-3 text-neutral-400">
                <Upload className="w-full h-full" />
              </div>
              <p className="text-sm text-neutral-600">Click to upload or drag and drop</p>
              <p className="text-xs text-neutral-500 mt-1">PNG, JPG up to 10MB</p>
            </div>
          </div>

          {/* Dimension Selector */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-3">Dimensions</Label>
            <div className="flex space-x-2">
              {dimensions.map((dim) => (
                <Button
                  key={dim.id}
                  type="button"
                  variant={selectedDimension === dim.id ? "default" : "outline"}
                  className={`flex-1 p-3 text-sm font-medium ${
                    selectedDimension === dim.id
                      ? "border-2 border-[var(--brand-purple)] bg-[var(--brand-purple)]/5 text-[var(--brand-purple)]"
                      : "border border-neutral-300 text-neutral-600 hover:border-neutral-400"
                  }`}
                  onClick={() => setSelectedDimension(dim.id)}
                >
                  <div className="flex flex-col items-center">
                    <div className={`${dim.icon} bg-current rounded mx-auto mb-1 opacity-50`}></div>
                    {dim.name}
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="applyMyStyle"
                checked={form.watch("applyMyStyle")}
                onCheckedChange={(checked) => form.setValue("applyMyStyle", !!checked)}
              />
              <Label htmlFor="applyMyStyle" className="text-sm text-neutral-700">
                Apply My Style
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox
                id="saveThisStyle"
                checked={form.watch("saveThisStyle")}
                onCheckedChange={(checked) => form.setValue("saveThisStyle", !!checked)}
              />
              <Label htmlFor="saveThisStyle" className="text-sm text-neutral-700">
                Save This Style
              </Label>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            type="submit"
            disabled={generateMutation.isPending || !user}
            className="w-full bg-gradient-to-r from-[var(--brand-red)] to-[var(--brand-purple)] text-white font-semibold py-4 rounded-xl hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            {generateMutation.isPending ? "Generating..." : "Generate Images"}
          </Button>

          <div className="text-center">
            <span className="text-xs text-neutral-500">Cost: 4 credits per generation</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
