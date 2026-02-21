import { useArtifacts } from "@/hooks/use-artifacts";
import { ArtifactCard } from "@/components/ArtifactCard";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Gallery() {
  const { data: artifacts, isLoading, error } = useArtifacts();
  const [search, setSearch] = useState("");

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center text-center">
        <h2 className="font-serif text-2xl font-bold text-destructive">Failed to load the gallery</h2>
        <p className="mt-2 text-muted-foreground">The museum is temporarily closed for maintenance.</p>
      </div>
    );
  }

  const filteredArtifacts = artifacts?.filter(art => 
    art.title.toLowerCase().includes(search.toLowerCase()) || 
    art.description.toLowerCase().includes(search.toLowerCase()) ||
    art.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 px-6 py-24 text-center">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative container mx-auto max-w-3xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif text-5xl font-bold tracking-tight text-foreground md:text-6xl"
          >
            Eterna Gallery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 text-lg text-muted-foreground font-medium italic"
          >
            "Preserve it or watch it ghost."
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-2 text-base text-muted-foreground"
          >
            A collection of fading memories, skills, and rituals. Stake your support to keep them alive.
          </motion.p>
        </div>
      </section>

      {/* Search and Filter */}
      <div className="container mx-auto mt-12 px-6">
        <div className="relative mx-auto max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-border bg-background py-3 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Artifact Grid */}
      <div className="container mx-auto mt-12 grid gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredArtifacts?.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <p className="text-lg text-muted-foreground">No artifacts found matching your search.</p>
          </div>
        ) : (
          filteredArtifacts?.map((artifact) => (
            <ArtifactCard key={artifact.id} artifact={artifact} />
          ))
        )}
      </div>
    </div>
  );
}
