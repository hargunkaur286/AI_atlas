import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, UserCheck, UserX, Clock, TrendingUp, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface MatchWithProfile {
  matched_user_id: string;
  overall_score: number;
  ai_summary: string | null;
  strategic_alignment_score: number;
  meeting_value_score: number;
  complementarity_score: number;
  profile?: { full_name: string | null; company: string | null; job_title: string | null };
  action_status?: string;
}

const MyConnections = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState<MatchWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Fetch matches
      const { data: matches } = await supabase
        .from("matches")
        .select("matched_user_id, overall_score, ai_summary, strategic_alignment_score, meeting_value_score, complementarity_score")
        .eq("user_id", user.id)
        .order("overall_score", { ascending: false });

      if (!matches || matches.length === 0) { setLoading(false); return; }

      // Fetch match actions
      const { data: actions } = await supabase
        .from("match_actions")
        .select("matched_user_id, status")
        .eq("user_id", user.id);

      const actionMap = new Map((actions || []).map((a) => [a.matched_user_id, a.status]));

      // Fetch profiles for matched users
      const ids = matches.map((m) => m.matched_user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, company, job_title")
        .in("user_id", ids);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));

      setConnections(
        matches.map((m) => ({
          ...m,
          profile: profileMap.get(m.matched_user_id),
          action_status: actionMap.get(m.matched_user_id) || "pending",
        }))
      );
      setLoading(false);
    };
    load();
  }, [user]);

  const updateAction = async (matchedUserId: string, status: string) => {
    if (!user) return;
    await supabase.from("match_actions").upsert({
      user_id: user.id,
      matched_user_id: matchedUserId,
      status,
    }, { onConflict: "user_id,matched_user_id" });
    setConnections((prev) =>
      prev.map((c) => c.matched_user_id === matchedUserId ? { ...c, action_status: status } : c)
    );
  };

  const accepted = connections.filter((c) => c.action_status === "accepted");
  const declined = connections.filter((c) => c.action_status === "declined");
  const pending = connections.filter((c) => c.action_status === "pending");
  const avgScore = connections.length > 0
    ? (connections.reduce((s, c) => s + c.overall_score, 0) / connections.length).toFixed(0)
    : "0";

  const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
    <div className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
        <span className="text-xs font-sans text-muted-foreground tracking-wide uppercase">{label}</span>
      </div>
      <span className="text-2xl font-serif font-bold text-foreground">{value}</span>
    </div>
  );

  const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    accepted: { label: "Connected", icon: <UserCheck className="w-3 h-3" />, color: "text-green-400 bg-green-400/10 border-green-400/20" },
    declined: { label: "Declined", icon: <UserX className="w-3 h-3" />, color: "text-red-400 bg-red-400/10 border-red-400/20" },
    pending: { label: "Pending", icon: <Clock className="w-3 h-3" />, color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 px-6 md:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-serif text-lg tracking-wide text-foreground">
            Proof of Talk <span className="text-primary font-semibold">Atlas</span>
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
      </nav>

      <div className="container mx-auto px-6 md:px-16 py-10 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-1">My Connections</h1>
          <p className="text-muted-foreground font-sans text-sm">Your match history, stats, and connection status.</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          <StatCard icon={<Users className="w-4 h-4 text-primary" />} label="Total Matches" value={connections.length} color="bg-primary/10" />
          <StatCard icon={<UserCheck className="w-4 h-4 text-green-400" />} label="Accepted" value={accepted.length} color="bg-green-400/10" />
          <StatCard icon={<UserX className="w-4 h-4 text-red-400" />} label="Declined" value={declined.length} color="bg-red-400/10" />
          <StatCard icon={<TrendingUp className="w-4 h-4 text-primary" />} label="Avg Score" value={`${avgScore}%`} color="bg-primary/10" />
        </motion.div>

        {/* Connection List */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground text-sm">Loading connections…</div>
        ) : connections.length === 0 ? (
          <div className="text-center py-16 border border-border/50 rounded-xl bg-card/20">
            <Sparkles className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-sans">No matches yet. Generate matches from the dashboard first.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((c, i) => {
              const cfg = statusConfig[c.action_status || "pending"];
              return (
                <motion.div
                  key={c.matched_user_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm flex items-center gap-4 hover:border-primary/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-serif font-bold text-primary">
                      {(c.profile?.full_name || "?")[0]}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-sm text-foreground truncate">{c.profile?.full_name || "Anonymous"}</h3>
                    <p className="text-xs text-muted-foreground truncate">{c.profile?.job_title} · {c.profile?.company}</p>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs font-bold text-primary">{c.overall_score.toFixed(0)}%</span>
                  </div>

                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-sans font-medium shrink-0 ${cfg.color}`}>
                    {cfg.icon}
                    {cfg.label}
                  </div>

                  {c.action_status === "pending" && (
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 text-green-400 border-green-400/30 hover:bg-green-400/10"
                        onClick={() => updateAction(c.matched_user_id, "accepted")}>
                        Accept
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs h-7 px-2.5 text-red-400 border-red-400/30 hover:bg-red-400/10"
                        onClick={() => updateAction(c.matched_user_id, "declined")}>
                        Decline
                      </Button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyConnections;
