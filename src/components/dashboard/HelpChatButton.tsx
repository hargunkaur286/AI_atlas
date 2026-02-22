import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface HelpMsg {
  id: string;
  message: string;
  is_from_organizer: boolean;
  created_at: string;
}

const HelpChatButton = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<HelpMsg[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !user) return;

    const fetch = async () => {
      const { data } = await supabase
        .from("help_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetch();

    const channel = supabase
      .channel("help-chat")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "help_messages",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as HelpMsg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [open, user]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!newMsg.trim() || !user || sending) return;
    setSending(true);
    await supabase.from("help_messages").insert({
      user_id: user.id,
      message: newMsg.trim(),
      is_from_organizer: false,
    });
    setNewMsg("");
    setSending(false);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg glow-orange"
      >
        {open ? <X className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border/50 bg-secondary/30">
              <h3 className="font-serif text-sm text-foreground">Help & Support</h3>
              <p className="text-[10px] text-muted-foreground">Chat with conference organizers</p>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
              {messages.length === 0 && (
                <div className="text-center mt-12">
                  <HelpCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">How can we help you?</p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.is_from_organizer ? "justify-start" : "justify-end"}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${
                    msg.is_from_organizer
                      ? "bg-secondary text-secondary-foreground rounded-bl-sm"
                      : "bg-primary text-primary-foreground rounded-br-sm"
                  }`}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-border/50 flex gap-2">
              <Input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask anything..."
                className="text-xs h-8"
              />
              <Button size="icon" className="h-8 w-8 shrink-0" onClick={send} disabled={sending || !newMsg.trim()}>
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpChatButton;
