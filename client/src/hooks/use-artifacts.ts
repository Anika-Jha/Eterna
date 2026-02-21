import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type ArtifactInput, type CommentInput } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useArtifacts() {
  return useQuery({
    queryKey: [api.artifacts.list.path],
    queryFn: async () => {
      const res = await fetch(api.artifacts.list.path);
      if (!res.ok) throw new Error("Failed to fetch artifacts");
      return api.artifacts.list.responses[200].parse(await res.json());
    },
  });
}

export function useArtifact(id: number) {
  return useQuery({
    queryKey: [api.artifacts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.artifacts.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch artifact");
      return api.artifacts.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateArtifact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: ArtifactInput) => {
      const res = await fetch(api.artifacts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to preserve artifact");
      }
      return api.artifacts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.artifacts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      toast({
        title: "Artifact Preserved",
        description: "Your memory has been archived in the museum.",
      });
    },
    onError: (error) => {
      toast({
        title: "Preservation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useSupportArtifact() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, action }: { id: number; action: "vote" | "stake" | "interact" }) => {
      const url = buildUrl(api.artifacts.support.path, { id });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      if (!res.ok) throw new Error("Failed to support artifact");
      return api.artifacts.support.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Optimistic update or refetch
      queryClient.invalidateQueries({ queryKey: [api.artifacts.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.artifacts.get.path, data.id] });
      queryClient.invalidateQueries({ queryKey: [api.dashboard.stats.path] });
      
      toast({
        title: "Support Registered",
        description: "Your interaction has delayed the fading of this artifact.",
      });
    },
  });
}

export function useArtifactComments(artifactId: number) {
  return useQuery({
    queryKey: [api.artifacts.comments.list.path, artifactId],
    queryFn: async () => {
      const url = buildUrl(api.artifacts.comments.list.path, { id: artifactId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch comments");
      return api.artifacts.comments.list.responses[200].parse(await res.json());
    },
    enabled: !!artifactId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ artifactId, content }: { artifactId: number; content: string }) => {
      const url = buildUrl(api.artifacts.comments.create.path, { id: artifactId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      
      if (!res.ok) throw new Error("Failed to post comment");
      return api.artifacts.comments.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.artifacts.comments.list.path, variables.artifactId] });
      toast({
        title: "Reflection Added",
        description: "Your thought has been attached to this artifact.",
      });
    },
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.stats.responses[200].parse(await res.json());
    },
  });
}
