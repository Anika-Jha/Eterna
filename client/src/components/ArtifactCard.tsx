import { motion } from "framer-motion";
import { Heart, Shield, MessageCircle, AlertTriangle, BadgeCheck } from "lucide-react";
import { type Artifact } from "@shared/schema";
import { useSupportArtifact } from "@/hooks/use-artifacts";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ArtifactCardProps {
  artifact: Artifact;
}

export function ArtifactCard({ artifact }: ArtifactCardProps) {
  const { mutate: support, isPending } = useSupportArtifact();
  
  // Visual calculation for fading
  const fadeOpacity = Math.max(0.1, 1 - (artifact.fadeLevel / 120)); // Never fully invisible
  const fadeBlur = (artifact.fadeLevel / 20); // Max 5px blur
  const isAtRisk = artifact.extinctionRisk > 75;

  const handleSupport = (e: React.MouseEvent, action: "vote" | "stake" | "interact") => {
    e.preventDefault();
    e.stopPropagation();
    support({ id: artifact.id, action });
  };

  const getRarityColor = (rarity?: string | null) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-orange-500 text-white border-orange-600';
      case 'epic': return 'bg-purple-500 text-white border-purple-600';
      case 'rare': return 'bg-blue-500 text-white border-blue-600';
      case 'uncommon': return 'bg-green-500 text-white border-green-600';
      default: return 'bg-slate-500 text-white border-slate-600';
    }
  };

  return (
    <div className="relative group cursor-pointer h-full block" onClick={() => window.location.href = `/artifact/${artifact.id}`}>
      <motion.div
        className="h-full relative overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all hover:shadow-md cursor-pointer flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.4 }}
      >
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
          <Badge className="bg-primary/90 text-primary-foreground flex items-center gap-1 shadow-sm">
            <BadgeCheck className="h-3 w-3" />
            Minted
          </Badge>
          {artifact.rarity && (
            <Badge className={cn("shadow-sm border", getRarityColor(artifact.rarity))}>
              {artifact.rarity}
            </Badge>
          )}
        </div>

        {/* Extinction Risk Indicator */}
        {isAtRisk && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 rounded-full bg-destructive/90 px-2 py-1 text-xs font-bold text-destructive-foreground shadow-sm">
            <AlertTriangle className="h-3 w-3" />
            <span>At Risk</span>
          </div>
        )}

        {/* Image Container with Fade Effects */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/20">
          <motion.img
            src={artifact.imageUrl}
            alt={artifact.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={{
              opacity: fadeOpacity,
              filter: `grayscale(${artifact.fadeLevel}%) blur(${fadeBlur}px)`,
            }}
          />
          
          {/* Overlay gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          {/* Title & Type on Image */}
          <div className="absolute bottom-0 left-0 p-4 w-full text-white">
            <p className="text-xs font-medium uppercase tracking-wider text-white/80 mb-1">
              {artifact.type} • {artifact.tokenId}
            </p>
            <h3 className="font-serif text-xl font-bold leading-tight line-clamp-2">
              {artifact.title}
            </h3>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
            {artifact.description}
          </p>

          <div className="flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <span className={cn(
                "h-2 w-2 rounded-full",
                artifact.fadeLevel < 30 ? "bg-green-500" :
                artifact.fadeLevel < 70 ? "bg-yellow-500" : "bg-red-500"
              )} />
              Fade Level: {artifact.fadeLevel}%
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={(e) => handleSupport(e, "vote")}
                    disabled={isPending}
                    className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Vote to Remember</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={(e) => handleSupport(e, "stake")}
                    disabled={isPending}
                    className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Stake to Preserve</TooltipContent>
              </Tooltip>
              
              <Link 
                href={`/artifact/${artifact.id}`}
                className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
