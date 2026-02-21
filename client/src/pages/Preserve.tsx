import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertArtifactSchema } from "@shared/schema";
import { useCreateArtifact } from "@/hooks/use-artifacts";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Schema for the form, using the generated insert schema
const formSchema = insertArtifactSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Please provide a detailed description (min 20 chars)"),
  type: z.string().min(1, "Please select an artifact type"),
  imageUrl: z.string().min(1, "An image is required to preserve this memory"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Preserve() {
  const [, setLocation] = useLocation();
  const { mutate: createArtifact, isPending } = useCreateArtifact();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      type: "",
      description: "",
      imageUrl: "",
      tags: [],
    },
  });

  const onSubmit = (data: FormValues) => {
    createArtifact(data, {
      onSuccess: () => setLocation("/"),
    });
  };

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <h1 className="font-serif text-4xl font-bold text-foreground">Preserve a Memory</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            "Extinct? Not on my watch." Submit your artifact to the gallery.
          </p>
        </motion.div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artifact Image</FormLabel>
                    <FormControl>
                      <ImageUpload 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a high-quality image of the skill, object, or ritual.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. The Art of Sourdough" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="skill">Skill</SelectItem>
                          <SelectItem value="recipe">Recipe</SelectItem>
                          <SelectItem value="ritual">Ritual</SelectItem>
                          <SelectItem value="object">Object</SelectItem>
                          <SelectItem value="profession">Profession</SelectItem>
                          <SelectItem value="language">Language</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the significance, history, and details of this artifact..." 
                        className="min-h-[150px] resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                size="lg"
                className="w-full text-base font-semibold"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Preserving...
                  </>
                ) : (
                  "Archive Forever"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
