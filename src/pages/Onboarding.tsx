import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Target, Zap, Globe, Shield } from "lucide-react";

const strategicOutcomeOptions = [
  "Capital formation",
  "Distribution / customer acquisition",
  "Regulatory positioning",
  "Infrastructure scaling",
  "Liquidity event preparation",
  "Cross-border expansion",
  "Strategic M&A",
  "Ecosystem influence / thought leadership",
];

const capitalLeverageOptions = [
  "Deployable financial capital",
  "Institutional LP relationships",
  "Distribution channels (enterprise / retail)",
  "Regulatory access / policy influence",
  "Technical infrastructure",
  "Media / narrative leverage",
  "Strategic corporate balance sheet",
  "Developer ecosystem",
  "None (operator only)",
];

const counterpartyOptions = [
  "Early-stage builder",
  "Late-stage scaleup",
  "Institutional allocator",
  "Sovereign / public sector",
  "Infrastructure provider",
  "Global brand / distribution partner",
  "Specialist operator",
  "Co-investor",
  "Regulatory stakeholder",
];

const adjacentDomainOptions = [
  "AI & data infrastructure",
  "Financial infrastructure / tokenization",
  "Energy & compute",
  "Digital identity & privacy",
  "Defense / resilience",
  "Biotech / longevity",
  "Media & narrative systems",
  "Emerging markets infrastructure",
  "Climate & carbon markets",
  "Luxury / cultural capital",
];

const counterpartyStageOptions = [
  "Concept / research stage",
  "Early revenue",
  "Scaling (> $5M revenue)",
  "Institutional / enterprise grade",
  "Sovereign / national level",
  "Public markets",
];

type FormData = {
  strategic_outcomes: string[];
  asymmetric_opportunity: string;
  capital_leverage: string[];
  counterparty_types: string[];
  adjacent_domains: string[];
  counterparty_stage: string;
  hard_constraints: string;
};

const ToggleChip = ({ label, selected, onClick, disabled }: { label: string; selected: boolean; onClick: () => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled && !selected}
    className={`px-3 py-1.5 rounded-full text-xs font-sans tracking-wide border transition-all duration-200 ${
      selected
        ? "border-primary bg-primary/10 text-primary"
        : disabled
        ? "border-border text-muted-foreground/40 cursor-not-allowed"
        : "border-border text-muted-foreground hover:border-primary/50"
    }`}
  >
    {label}
  </button>
);

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState<FormData>({
    strategic_outcomes: [],
    asymmetric_opportunity: "",
    capital_leverage: [],
    counterparty_types: [],
    adjacent_domains: [],
    counterparty_stage: "",
    hard_constraints: "",
  });

  const toggleArray = (field: keyof FormData, value: string, max?: number) => {
    setFormData((prev) => {
      const arr = prev[field] as string[];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter((v) => v !== value) };
      }
      if (max && arr.length >= max) return prev;
      return { ...prev, [field]: [...arr, value] };
    });
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        strategic_outcomes: formData.strategic_outcomes,
        asymmetric_opportunity: formData.asymmetric_opportunity,
        capital_leverage: formData.capital_leverage,
        counterparty_types: formData.counterparty_types,
        adjacent_domains: formData.adjacent_domains,
        counterparty_stage: formData.counterparty_stage,
        hard_constraints: formData.hard_constraints,
        onboarding_complete: true,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error saving profile", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Strategic profile complete. Welcome to Atlas." });
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const sectionIcons = [Target, Zap, Globe, Shield];
  const sectionTitles = [
    "Strategic Direction",
    "Capital & Leverage Profile",
    "Cross-Industry Optionality",
    "Constraints & Deal Filters",
  ];
  const sectionSubtitles = [
    "Trajectory & Intent",
    "Power Map & Complementarity",
    "Adjacent Domains & Stage Fit",
    "Non-Negotiables & Risk Thresholds",
  ];

  const Icon = sectionIcons[step - 1];

  const slideVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-sans tracking-widest uppercase text-primary">
            Strategic Alignment Survey — Section {step} of {totalSteps}
          </span>
        </div>

        <h1 className="text-3xl font-serif mb-1 text-foreground">{sectionTitles[step - 1]}</h1>
        <p className="text-sm text-muted-foreground mb-8">{sectionSubtitles[step - 1]}</p>

        {/* Progress bar */}
        <div className="flex gap-2 mb-10">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i < step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-sans font-medium text-foreground">Section A — Strategic Direction</span>
              </div>

              <div className="space-y-3">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">
                  1. What outcome are you optimizing for in the next 12–18 months? (Select up to 2)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {strategicOutcomeOptions.map((opt) => (
                    <ToggleChip
                      key={opt}
                      label={opt}
                      selected={formData.strategic_outcomes.includes(opt)}
                      onClick={() => toggleArray("strategic_outcomes", opt, 2)}
                      disabled={formData.strategic_outcomes.length >= 2}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60 italic">→ Extracts: Intent Vector + Time Horizon Signal</p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">
                  2. Where do you believe asymmetric opportunity is emerging in 2025–2027?
                </Label>
                <Textarea
                  value={formData.asymmetric_opportunity}
                  onChange={(e) => setFormData({ ...formData, asymmetric_opportunity: e.target.value })}
                  className="bg-card border-border text-foreground min-h-[120px]"
                  placeholder="Share your thesis — trends, niches, inefficiencies you see emerging..."
                  maxLength={1000}
                />
                <p className="text-xs text-muted-foreground/60 italic">→ Extracts: Trend Alignment + Intellectual Depth Signal</p>
              </div>

              <Button variant="hero" size="xl" className="w-full" onClick={() => setStep(2)}>
                Continue <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-sans font-medium text-foreground">Section B — Capital & Leverage Profile</span>
              </div>

              <div className="space-y-3">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">
                  3. What form of capital or leverage do you currently control or influence? (Select all that apply)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {capitalLeverageOptions.map((opt) => (
                    <ToggleChip
                      key={opt}
                      label={opt}
                      selected={formData.capital_leverage.includes(opt)}
                      onClick={() => toggleArray("capital_leverage", opt)}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60 italic">→ Extracts: Power Map + Complementarity Potential</p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">
                  4. What type of counterparty creates the most leverage for you right now? (Select up to 2)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {counterpartyOptions.map((opt) => (
                    <ToggleChip
                      key={opt}
                      label={opt}
                      selected={formData.counterparty_types.includes(opt)}
                      onClick={() => toggleArray("counterparty_types", opt, 2)}
                      disabled={formData.counterparty_types.length >= 2}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60 italic">→ Extracts: Counterparty Vector + Matchmaking Directionality</p>
              </div>

              <div className="flex gap-3">
                <Button variant="heroOutline" size="xl" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button variant="hero" size="xl" className="flex-1" onClick={() => setStep(3)}>
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-sans font-medium text-foreground">Section C — Cross-Industry Optionality</span>
              </div>

              <div className="space-y-3">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">
                  5. Outside your core industry, which adjacent domains are strategically relevant to you? (Select up to 3)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {adjacentDomainOptions.map((opt) => (
                    <ToggleChip
                      key={opt}
                      label={opt}
                      selected={formData.adjacent_domains.includes(opt)}
                      onClick={() => toggleArray("adjacent_domains", opt, 3)}
                      disabled={formData.adjacent_domains.length >= 3}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60 italic">→ Extracts: Cross-Industry Viability Matrix</p>
              </div>

              <div className="space-y-3">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">
                  6. What stage of counterparties are you best positioned to work with?
                </Label>
                <div className="flex flex-wrap gap-2">
                  {counterpartyStageOptions.map((opt) => (
                    <ToggleChip
                      key={opt}
                      label={opt}
                      selected={formData.counterparty_stage === opt}
                      onClick={() => setFormData({ ...formData, counterparty_stage: formData.counterparty_stage === opt ? "" : opt })}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/60 italic">→ Extracts: Execution Compatibility Signal</p>
              </div>

              <div className="flex gap-3">
                <Button variant="heroOutline" size="xl" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button variant="hero" size="xl" className="flex-1" onClick={() => setStep(4)}>
                  Continue <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="s4" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-sans font-medium text-foreground">Section D — Constraints & Deal Filters</span>
              </div>

              <div className="space-y-3">
                <Label className="text-xs tracking-wider uppercase text-muted-foreground">
                  7. What are your hard constraints or non-negotiables?
                </Label>
                <Textarea
                  value={formData.hard_constraints}
                  onChange={(e) => setFormData({ ...formData, hard_constraints: e.target.value })}
                  className="bg-card border-border text-foreground min-h-[160px]"
                  placeholder="Regulatory requirements, geography restrictions, ticket size, governance preferences, timeline constraints, reputation considerations..."
                  maxLength={1500}
                />
                <p className="text-xs text-muted-foreground/60 italic">→ Extracts: Friction Filter + Risk Threshold</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="heroOutline" size="xl" className="flex-1" onClick={() => setStep(3)}>Back</Button>
                <Button variant="hero" size="xl" className="flex-1" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Saving..." : "Complete Strategic Profile"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Onboarding;
