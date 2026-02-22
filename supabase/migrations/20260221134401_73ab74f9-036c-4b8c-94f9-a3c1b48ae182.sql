
-- Table for chat messages between matched users
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
ON public.chat_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.chat_messages FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receiver can mark as read"
ON public.chat_messages FOR UPDATE
USING (auth.uid() = receiver_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Table for match action statuses (accepted/declined/pending)
CREATE TABLE public.match_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  matched_user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, matched_user_id)
);

ALTER TABLE public.match_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own match actions"
ON public.match_actions FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can insert own match actions"
ON public.match_actions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own match actions"
ON public.match_actions FOR UPDATE
USING (auth.uid() = user_id);

CREATE TRIGGER update_match_actions_updated_at
BEFORE UPDATE ON public.match_actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Table for help/support messages to organizers
CREATE TABLE public.help_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_from_organizer BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.help_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own help messages"
ON public.help_messages FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can send help messages"
ON public.help_messages FOR INSERT
WITH CHECK (auth.uid() = user_id AND is_from_organizer = false);

ALTER PUBLICATION supabase_realtime ADD TABLE public.help_messages;
