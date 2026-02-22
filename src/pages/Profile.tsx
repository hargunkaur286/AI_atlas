import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building2, MapPin, Pencil, Briefcase } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [stats, setStats] = useState({ connections: 0, accepted: 0, responseRate: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [profileRes, actionsRes, totalMatchesRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id).single(),
        supabase.from("match_actions").select("status").eq("user_id", user.id),
        supabase.from("matches").select("id").eq("user_id", user.id),
      ]);
      if (profileRes.data) setProfile(profileRes.data);
      const accepted = actionsRes.data?.filter((a) => a.status === "accepted").length || 0;
      const total = totalMatchesRes.data?.length || 0;
      const acted = actionsRes.data?.length || 0;
      setStats({
        connections: accepted,
        accepted,
        responseRate: total > 0 ? Math.round((acted / total) * 100) : 0,
      });
      setLoading(false);
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  const interests = [
    ...(profile?.adjacent_domains || []),
    ...(profile?.interests || []),
  ];
  const primaryRole = profile?.primary_interest || profile?.job_title || "Participant";

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border/50 px-6 md:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="font-serif text-lg tracking-wide text-foreground">
            Proof of Talk <span className="text-primary font-semibold">Atlas</span>
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
        </Button>
      </nav>

      <div className="container mx-auto px-6 md:px-16 py-10 max-w-5xl">
        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl font-serif bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h1 className="text-3xl font-serif text-foreground">{displayName}</h1>
                  <p className="text-muted-foreground font-sans mt-1">{profile?.job_title || "—"}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground font-sans">
                    {profile?.company && (
                      <span className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> {profile.company}
                      </span>
                    )}
                    {profile?.linkedin_url && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> LinkedIn
                      </span>
                    )}
                  </div>
                  {primaryRole && (
                    <Badge variant="outline" className="mt-4 border-primary/50 text-primary font-sans text-xs tracking-wider uppercase">
                      {primaryRole}
                    </Badge>
                  )}
                </div>
              </div>
              <Separator className="my-6" />
              <Button variant="heroOutline" onClick={() => navigate("/profile/edit")}>
                <Pencil className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="md:col-span-2 space-y-6">
            {/* About */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                    {profile?.bio || profile?.asymmetric_opportunity || "No bio added yet. Edit your profile to tell others about yourself."}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Interests */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-serif italic">Interests & Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  {interests.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {interests.map((tag) => (
                        <Badge key={tag} variant="outline" className="border-border text-foreground font-sans text-xs px-3 py-1.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground font-sans">No interests added yet.</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Strategic Profile */}
            {(profile?.strategic_outcomes?.length || profile?.capital_leverage?.length) && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-serif italic">Strategic Profile</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {profile?.strategic_outcomes && profile.strategic_outcomes.length > 0 && (
                      <div>
                        <p className="text-xs tracking-wider uppercase text-muted-foreground mb-2 font-sans">Outcomes</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.strategic_outcomes.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs font-sans">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile?.capital_leverage && profile.capital_leverage.length > 0 && (
                      <div>
                        <p className="text-xs tracking-wider uppercase text-muted-foreground mb-2 font-sans">Capital & Leverage</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.capital_leverage.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs font-sans">{s}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right column — Stats & Activity */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-3xl font-serif text-foreground">{stats.connections}</p>
                    <p className="text-xs tracking-widest uppercase text-muted-foreground font-sans">Connections</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-3xl font-serif text-foreground">{stats.accepted}</p>
                    <p className="text-xs tracking-widest uppercase text-primary font-sans">Matches Accepted</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-3xl font-serif text-foreground">{stats.responseRate}%</p>
                    <p className="text-xs tracking-widest uppercase text-muted-foreground font-sans">Response Rate</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-b border-border pb-3">
                    <p className="text-xs text-primary font-sans">Just now</p>
                    <p className="text-sm text-foreground font-sans">Viewed profile</p>
                  </div>
                  {profile?.onboarding_complete && (
                    <div className="border-b border-border pb-3">
                      <p className="text-xs text-primary font-sans">Recently</p>
                      <p className="text-sm text-foreground font-sans">Completed strategic profile</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-primary font-sans">On join</p>
                    <p className="text-sm text-foreground font-sans">Account created</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
