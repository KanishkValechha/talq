import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

interface MessageInputProps {
  channelId: Id<"channels"> | null;
  dmUserId: Id<"users"> | null;
}

export function MessageInput({ channelId, dmUserId }: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.setTyping);
  const currentUser = useQuery(api.auth.loggedInUser);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (channelId) {
        await sendMessage({ channelId, content: newMessage });
      } else if (dmUserId && currentUser) {
        await sendMessage({
          dmParticipants: [currentUser._id, dmUserId],
          content: newMessage,
        });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = () => {
    if (channelId) {
      setTyping({ channelId });
    } else if (dmUserId && currentUser) {
      setTyping({ dmParticipants: [currentUser._id, dmUserId] });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend(e);
    }
  };

  return (
    <div className="px-3 md:px-5 pb-3 md:pb-5 pt-2">
      <form
        onSubmit={handleSend}
        className="relative bg-card border border-border rounded-xl
          focus-within:border-primary/30 focus-within:ring-1 focus-within:ring-primary/10
          transition-all duration-200"
      >
        <textarea
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          rows={1}
          className="w-full resize-none bg-transparent text-sm text-foreground
            placeholder:text-muted-foreground px-4 py-3 pr-14
            outline-none min-h-[44px] max-h-32"
        />
        <div className="absolute right-2 bottom-2 flex items-center">
          <Button
            type="submit"
            size="icon"
            disabled={!newMessage.trim()}
            className="h-8 w-8 rounded-lg bg-primary text-primary-foreground
              hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200
              disabled:shadow-none"
          >
            <SendHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
