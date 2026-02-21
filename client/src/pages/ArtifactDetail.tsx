import { useArtifact, useArtifactComments, useCreateComment, useSupportArtifact } from "@/hooks/use-artifacts";
import { useRoute, Link } from "wouter";
import { Loader2, ArrowLeft, Heart, Shield, MessageCircle, Clock, Activity, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

export default function ArtifactDetail() {
  const [, params] = useRoute("/artifact/:id");
  const id = parseInt(params?.id || "0");
  const { data: artifact, isLoading } = useArtifact(id);
  const { data: comments, isLoading: loadingComments } = useArtifactComments(id);
  const { mutate: postComment, isPending: postingComment } = useCreateComment();
  const { mutate: support, isPending: supporting } = useSupportArtifact();
  
  const [commentText, setCommentText] = useState("");

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    postComment({ artifactId: id, content: commentText }, {
      onSuccess: () => setCommentText("")
    });
  };

  if (isLoading || !artifact) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
      </div>
    );
  }

  // Visuals based on fade level
  const fadeBlur = (artifact.fadeLevel / 20);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Navigation Back */}
      <div className="container mx-auto px-6 py-8">
        <Link href="/">
          <Button variant="ghost" className="gap-2 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Back to Gallery
          </Button>
        </Link>
      </div>

      <div className="container mx-auto grid gap-12 px-6 lg:grid-cols-2">
        {/* Left Column: Image & Visuals */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20 shadow-lg">
            <img
              src={artifact.imageUrl}
              alt={artifact.title}
              className="w-full object-cover"
              style={{
                filter: `grayscale(${artifact.fadeLevel}%) blur(${fadeBlur}px)`,
                opacity: Math.max(0.2, 1 - artifact.fadeLevel / 120),
                transition: "filter 1s ease, opacity 1s ease"
              }}
            />
            {artifact.fadeLevel > 80 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <p className="font-serif text-2xl font-bold text-white/80">Fading Memory...</p>
              </div>
            )}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 rounded-xl border border-border bg-card p-4 text-center">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Extinction Risk</p>
              <p className={`text-2xl font-bold ${artifact.extinctionRisk > 70 ? "text-destructive" : "text-primary"}`}>
                {artifact.extinctionRisk}%
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Fade Level</p>
              <p className="text-2xl font-bold text-foreground">{artifact.fadeLevel}%</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Total Support</p>
              <p className="text-2xl font-bold text-foreground">{artifact.supportCount}</p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Info & Interaction */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {artifact.type}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Preserved {formatDistanceToNow(new Date(artifact.createdAt || new Date()), { addSuffix: true })}
              </span>
            </div>
            <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl">
              {artifact.title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {artifact.description}
            </p>
            
            {artifact.aiNarrative && (
              <div className="mt-6 rounded-lg bg-muted/30 p-4 border border-border/50">
                <h4 className="flex items-center gap-2 font-serif font-bold text-primary mb-2">
                  <Activity className="h-4 w-4" />
                  Curator's Note
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  {artifact.aiNarrative}
                </p>
              </div>
            )}
          </div>

          {/* Interaction Buttons */}
          <div className="flex flex-wrap gap-4 py-6 border-y border-border/50">
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5"
              onClick={() => support({ id: artifact.id, action: "vote" })}
              disabled={supporting}
            >
              <Heart className="h-5 w-5 text-destructive" />
              Vote to Remember
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="gap-2 border-primary/20 hover:border-primary hover:bg-primary/5"
              onClick={() => support({ id: artifact.id, action: "stake" })}
              disabled={supporting}
            >
              <Shield className="h-5 w-5 text-primary" />
              Stake to Preserve
            </Button>
          </div>

          {/* Comments Section */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold">Reflections</h3>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="relative">
              <Textarea 
                placeholder="Leave a reflection so this is not forgotten..." 
                className="min-h-[100px] resize-none pr-12"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <Button 
                type="submit" 
                size="icon" 
                className="absolute bottom-3 right-3 h-8 w-8 rounded-full"
                disabled={postingComment || !commentText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {/* Comments List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingComments ? (
                <div className="text-center py-4 text-muted-foreground">Loading reflections...</div>
              ) : comments?.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground italic">
                  No reflections yet. Be the first to remember this.
                </p>
              ) : (
                comments?.map((comment) => (
                  <div key={comment.id} className="rounded-lg bg-card p-4 shadow-sm border border-border/50">
                    <p className="text-sm text-foreground">{comment.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt || new Date()), { addSuffix: true })}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageCircle className="h-3 w-3" />
                        <span>{comment.supportCount}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
