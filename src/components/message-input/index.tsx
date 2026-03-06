import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { useNavigationStore } from "../../zustand/navigation";

export function MessageInput() {
  const [newMessage, setNewMessage] = useState("");
  const sendMessage = useMutation(api.messages.send);
  const setTyping = useMutation(api.typing.setTyping);
  const currentUser = useQuery(api.auth.loggedInUser);
  const { selectedChannel, selectedDM } = useNavigationStore();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (selectedChannel) {
        await sendMessage({ channelId: selectedChannel, content: newMessage });
      } else if (selectedDM && currentUser) {
        await sendMessage({
          dmParticipants: [currentUser._id, selectedDM],
          content: newMessage,
        });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = () => {
    if (selectedChannel) {
      setTyping({ channelId: selectedChannel });
    } else if (selectedDM && currentUser) {
      setTyping({ dmParticipants: [currentUser._id, selectedDM] });
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
            outline-hidden min-h-[44px] max-h-32"
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
