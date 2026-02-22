import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles } from "lucide-react";

const primaryInterestOptions = [
  "Investment",
  "Infrastructure",
  "Regulation",
  "Strategic Partnerships",
  "Innovation",
  "Other",
];

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    jobTitle: "",
    company: "",
    linkedinUrl: "",
    primaryInterest: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName || !formData.jobTitle || !formData.company || !formData.primaryInterest) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (formData.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          job_title: formData.jobTitle,
          company: formData.company,
          linkedin_url: formData.linkedinUrl,
          primary_interest: formData.primaryInterest,
        },
      },
    });

    if (error) {
      toast({ title: error.message, variant: "destructive" });
    } else {
      // Update the profile with basic info immediately
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").update({
          full_name: formData.fullName,
          job_title: formData.jobTitle,
          company: formData.company,
          linkedin_url: formData.linkedinUrl,
          primary_interest: formData.primaryInterest,
        }).eq("user_id", user.id);
      }
      toast({ title: "Account created! Let's complete your strategic profile." });
      navigate("/onboarding");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-sans tracking-widest uppercase text-primary">Join Atlas</span>
        </div>

        <h1 className="text-3xl font-serif mb-2 text-foreground">Create Your Account</h1>
        <p className="text-sm text-muted-foreground mb-8">Join 2,500 decision makers shaping the future of digital assets.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Full Name *</Label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-card border-border text-foreground h-12"
                placeholder="Your full name"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Title *</Label>
              <Input
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="bg-card border-border text-foreground h-12"
                placeholder="e.g. Managing Partner"
                maxLength={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">Company *</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-card border-border text-foreground h-12"
                placeholder="Your company"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs tracking-wider uppercase text-muted-foreground">LinkedIn URL</Label>
              <Input
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="bg-card border-border text-foreground h-12"
                placeholder="linkedin.com/in/..."
                maxLength={255}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground">Email *</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-card border-border text-foreground h-12"
              placeholder="you@company.com"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground">Password *</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-card border-border text-foreground h-12"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs tracking-wider uppercase text-muted-foreground">Primary Interest *</Label>
            <Select value={formData.primaryInterest} onValueChange={(val) => setFormData({ ...formData, primaryInterest: val })}>
              <SelectTrigger className="bg-card border-border text-foreground h-12">
                <SelectValue placeholder="Select your primary interest" />
              </SelectTrigger>
              <SelectContent>
                {primaryInterestOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="hero" size="xl" className="w-full mt-2" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Continue to Strategic Profile"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
