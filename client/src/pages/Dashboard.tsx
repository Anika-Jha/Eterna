import { useDashboardStats } from "@/hooks/use-artifacts";
import { Loader2, TrendingUp, AlertTriangle, Layers, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary/30" />
      </div>
    );
  }

  // Mock data for the chart since the API returns summary stats
  // In a real app, we'd fetch time-series data
  const chartData = [
    { name: "Risk < 20%", value: 12, color: "#22c55e" },
    { name: "Risk 20-50%", value: 8, color: "#eab308" },
    { name: "Risk 50-80%", value: 5, color: "#f97316" },
    { name: "Critical > 80%", value: stats.artifactsAtRisk, color: "#ef4444" },
  ];

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="font-serif text-4xl font-bold text-foreground">Curator Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Overview of the museum's health and preservation efforts.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard 
            title="Total Artifacts" 
            value={stats.totalArtifacts} 
            icon={Layers} 
            description="Memories archived"
          />
          <StatsCard 
            title="Avg Fade Level" 
            value={`${stats.averageFadeLevel.toFixed(1)}%`} 
            icon={Activity} 
            description="General visibility"
            trend={stats.averageFadeLevel > 50 ? "down" : "up"}
          />
          <StatsCard 
            title="Total Interactions" 
            value={stats.totalInteractions} 
            icon={TrendingUp} 
            description="Community support"
          />
          <StatsCard 
            title="Critical Risk" 
            value={stats.artifactsAtRisk} 
            icon={AlertTriangle} 
            description="Need immediate attention"
            urgent={stats.artifactsAtRisk > 0}
          />
        </div>

        {/* Charts Section */}
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Extinction Risk Distribution */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h3 className="mb-6 font-serif text-xl font-bold">Extinction Risk Distribution</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Preservation Activity (Mocked for visual) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h3 className="mb-4 font-serif text-xl font-bold">Preservation Activity</h3>
            <div className="flex h-[300px] flex-col items-center justify-center text-center text-muted-foreground">
              <p className="italic">"Data accumulation in progress..."</p>
              <p className="mt-2 text-sm">More insights will appear as the community interacts with the museum.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, description, trend, urgent }: any) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`rounded-xl border p-6 shadow-sm transition-all ${
        urgent ? "border-destructive/50 bg-destructive/5" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={`h-4 w-4 ${urgent ? "text-destructive" : "text-primary"}`} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className={`text-2xl font-bold ${urgent ? "text-destructive" : "text-foreground"}`}>{value}</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </motion.div>
  );
}
