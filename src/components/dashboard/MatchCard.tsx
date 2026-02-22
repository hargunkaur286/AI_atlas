import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Target, Zap, Globe, ChevronDown, ChevronUp, Eye, Phone, MessageCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import LiveChatDialog from "./LiveChatDialog";

export interface MatchedProfile {
  full_name: string;
  job_title: string;
  company: string;
  primary_interest: string;
  strategic_outcomes: string[];
  adjacent_domains: string[];
}

export interface Match {
  matched_user_id: string;
  strategic_alignment_score: number;
  meeting_value_score: number;
  complementarity_score: number;
  overall_score: number;
  ai_summary: string;
  match_reasons: {
    strategic_outcomes_overlap: number;
    domain_overlap: number;
    leverage_complementarity: number;
  };
  matched_profile: MatchedProfile;
}

const ScoreBar = ({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-sans text-muted-foreground">{label}</span>
      </div>
      <span className="text-xs font-sans font-semibold text-foreground">{score.toFixed(0)}</span>
    </div>
    <Progress value={score} className="h-1.5" />
  </div>
);

const MatchCard = ({ match, index }: { match: Match; index: number }) => {
  const [expanded, setExpanded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const handleCallInvite = () => {
    toast({ title: "5-min call invite sent", description: `Invitation sent to ${match.matched_profile.full_name}` });
  };

  const handleLiveChat = () => {
    setChatOpen(true);
  };

  const handleIntroEmail = () => {
    const subject = encodeURIComponent(`Introduction: ${match.matched_profile.full_name}`);
    const body = encodeURIComponent(
      `Hi ${match.matched_profile.full_name},\n\nI came across your profile at Proof of Talk and believe we have strong strategic alignment, particularly around ${match.matched_profile.primary_interest || "shared interests"}.\n\n${match.ai_summary || ""}\n\nWould you be open to a brief conversation?\n\nBest regards`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
    toast({ title: "Email draft generated" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="p-5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <span className="text-sm font-serif font-bold text-primary">
              {(match.matched_profile.full_name || "?")[0]}
            </span>
          </div>
          <div>
            <h3 className="font-serif text-base text-foreground leading-tight">{match.matched_profile.full_name || "Anonymous"}</h3>
            <p className="text-xs font-sans text-muted-foreground">
              {match.matched_profile.job_title} · {match.matched_profile.company}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shrink-0">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-sm font-sans font-bold text-primary">{match.overall_score.toFixed(0)}%</span>
        </div>
      </div>

      {/* Score Bars */}
      <div className="space-y-2 mb-4">
        <ScoreBar label="Strategic Alignment" score={match.strategic_alignment_score} icon={<Target className="w-3 h-3 text-primary" />} />
        <ScoreBar label="Meeting Value" score={match.meeting_value_score} icon={<Zap className="w-3 h-3 text-primary" />} />
        <ScoreBar label="Complementarity" score={match.complementarity_score} icon={<Globe className="w-3 h-3 text-primary" />} />
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Eye className="w-3 h-3" /> AI Insight
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">AI Match Insight</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{(match.matched_profile.full_name || "?")[0]}</span>
                </div>
                <div>
                  <p className="font-serif text-sm font-semibold">{match.matched_profile.full_name}</p>
                  <p className="text-xs text-muted-foreground">{match.matched_profile.job_title} · {match.matched_profile.company}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-sans tracking-widest uppercase text-primary font-semibold">Analysis</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{match.ai_summary || "No AI summary available yet."}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <span className="text-[10px] text-muted-foreground block">Outcome</span>
                  <span className="text-sm font-bold text-foreground">{(match.match_reasons.strategic_outcomes_overlap * 100).toFixed(0)}%</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <span className="text-[10px] text-muted-foreground block">Domain</span>
                  <span className="text-sm font-bold text-foreground">{(match.match_reasons.domain_overlap * 100).toFixed(0)}%</span>
                </div>
                <div className="text-center p-2 rounded-lg bg-secondary/50">
                  <span className="text-[10px] text-muted-foreground block">Leverage</span>
                  <span className="text-sm font-bold text-foreground">{(match.match_reasons.leverage_complementarity * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleCallInvite}>
          <Phone className="w-3 h-3" /> 5-min Call
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleLiveChat}>
          <MessageCircle className="w-3 h-3" /> Live Chat
        </Button>
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleIntroEmail}>
          <Mail className="w-3 h-3" /> Intro Email
        </Button>
      </div>

      {/* Expandable Details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-xs font-sans text-muted-foreground hover:text-primary transition-colors mt-auto"
      >
        {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {expanded ? "Less detail" : "More detail"}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-3 space-y-2"
          >
            {match.matched_profile.primary_interest && (
              <div>
                <span className="text-[10px] font-sans tracking-widest uppercase text-muted-foreground">Primary Focus</span>
                <p className="text-xs font-sans text-foreground/80">{match.matched_profile.primary_interest}</p>
              </div>
            )}
            {match.matched_profile.strategic_outcomes?.length > 0 && (
              <div>
                <span className="text-[10px] font-sans tracking-widest uppercase text-muted-foreground">Strategic Outcomes</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {match.matched_profile.strategic_outcomes.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-secondary text-secondary-foreground border border-border">{s}</span>
                  ))}
                </div>
              </div>
            )}
            {match.matched_profile.adjacent_domains?.length > 0 && (
              <div>
                <span className="text-[10px] font-sans tracking-widest uppercase text-muted-foreground">Adjacent Domains</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {match.matched_profile.adjacent_domains.map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded-full text-[10px] font-sans bg-secondary text-secondary-foreground border border-border">{d}</span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <LiveChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        matchedUserId={match.matched_user_id}
        matchedProfile={match.matched_profile}
      />
    </motion.div>
  );
};

export default MatchCard;
