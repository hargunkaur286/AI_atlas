import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Camera } from "lucide-react";

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: "",
    job_title: "",
    company: "",
    bio: "",
    linkedin_url: "",
    primary_interest: "",
    interests: [] as string[],
  });
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, job_title, company, bio, linkedin_url, primary_interest, interests, avatar_url")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({
            full_name: data.full_name || "",
            job_title: data.job_title || "",
            company: data.company || "",
            bio: data.bio || "",
            linkedin_url: data.linkedin_url || "",
            primary_interest: data.primary_interest || "",
            interests: data.interests || [],
          });
          setAvatarUrl(data.avatar_url);
        }
        setFetching(false);
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: urlWithCacheBust }).eq("user_id", user.id);
    setAvatarUrl(urlWithCacheBust);
    toast({ title: "Avatar updated" });
    setUploading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        job_title: form.job_title,
        company: form.company,
        bio: form.bio,
        linkedin_url: form.linkedin_url,
        primary_interest: form.primary_interest,
        interests: form.interests,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully" });
      navigate("/profile");
    }
    setLoading(false);
  };

  const addInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !form.interests.includes(trimmed)) {
      setForm({ ...form, interests: [...form.interests, trimmed] });
      setInterestInput("");
    }
  };

  const removeInterest = (tag: string) => {
    setForm({ ...form, interests: form.interests.filter((i) => i !== tag) });
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border/50 px-6 md:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
          <span className="font-serif text-lg tracking-wide text-foreground">
            Proof of Talk <span className="text-primary font-semibold">Atlas</span>
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Profile
        </Button>
      </nav>

      <div className="container mx-auto px-6 md:px-16 py-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-serif text-foreground mb-1">Edit Profile</h1>
          <p className="text-sm text-muted-foreground mb-8 font-sans">Update your personal and professional information.</p>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar Upload */}
                <div className="flex items-center gap-5">
                  <div className="relative group">
                    <Avatar className="w-20 h-20 border-2 border-border">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback className="text-xl font-serif bg-primary/10 text-primary">
                        {(form.full_name || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera className="w-5 h-5 text-primary" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                  <div>
                    <Button variant="heroOutline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? "Uploading..." : "Change Photo"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 font-sans">JPG, PNG under 5MB</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase text-muted-foreground">Full Name</Label>
                    <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-card border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase text-muted-foreground">Job Title</Label>
                    <Input value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} className="bg-card border-border" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase text-muted-foreground">Company</Label>
                    <Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="bg-card border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs tracking-wider uppercase text-muted-foreground">LinkedIn URL</Label>
                    <Input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} className="bg-card border-border" placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="bg-card border-border min-h-[120px]"
                  placeholder="Tell others about your background, expertise, and what you're working on..."
                  maxLength={1000}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interests & Expertise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground">Primary Role / Interest</Label>
                  <Input value={form.primary_interest} onChange={(e) => setForm({ ...form, primary_interest: e.target.value })} className="bg-card border-border" placeholder="e.g. Investor, Builder, Operator" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs tracking-wider uppercase text-muted-foreground">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                      className="bg-card border-border flex-1"
                      placeholder="Add a tag and press Enter"
                    />
                    <Button variant="heroOutline" size="sm" onClick={addInterest}>Add</Button>
                  </div>
                  {form.interests.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.interests.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 text-xs border border-border rounded-full font-sans text-foreground flex items-center gap-1.5 cursor-pointer hover:border-destructive hover:text-destructive transition-colors"
                          onClick={() => removeInterest(tag)}
                        >
                          {tag} ×
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3 pt-2">
              <Button variant="heroOutline" size="xl" className="flex-1" onClick={() => navigate("/profile")}>
                Cancel
              </Button>
              <Button variant="hero" size="xl" className="flex-1" onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;
