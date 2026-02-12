import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";
import { MessageSquare, Hash, AtSign } from "lucide-react";

interface MessagePaneProps {
  channelId: Id<"channels"> | null;
  dmUserId: Id<"users"> | null;
}

export function MessagePane({ channelId, dmUserId }: MessagePaneProps) {
  const channelMessages = useQuery(
    api.messages.listByChannel,
    channelId ? { channelId } : "skip"
  );
  const dmMessages = useQuery(
    api.messages.listByDM,
    dmUserId ? { otherUserId: dmUserId } : "skip"
  );
  const messages = channelId ? channelMessages : dmMessages;
  const markAsRead = useMutation(api.messages.markAsRead);
  const currentUser = useQuery(api.auth.loggedInUser);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const typingUsers = useQuery(
    api.typing.getTypingUsers,
    channelId
      ? { channelId }
      : dmUserId && currentUser
        ? { dmParticipants: [currentUser._id, dmUserId] }
        : "skip"
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages && currentUser) {
      messages.forEach((msg) => {
        if (msg.authorId !== currentUser._id && !msg.isRead) {
          markAsRead({ messageId: msg._id });
        }
      });
    }
  }, [messages, currentUser, markAsRead]);

  if (!channelId && !dmUserId) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col bg-background min-w-0">
      <ScrollArea className="flex-1">
        <div className="py-3">
          {messages?.map((message, idx) => {
            const prevMsg = messages[idx - 1];
            const showAvatar =
              !prevMsg ||
              prevMsg.authorId !== message.authorId ||
              message._creationTime - prevMsg._creationTime > 300000;

            const isOwn = currentUser?._id === message.authorId;
            return (
              <div
                key={message._id}
                className={`flex w-full ${isOwn ? "justify-end" : "justify-start"} ${
                  showAvatar && idx > 0 ? "mt-3" : ""
                }`}
              >
                <MessageBubble
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                />
              </div>
            );
          })}
          <TypingIndicator users={typingUsers} />
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <MessageInput channelId={channelId} dmUserId={dmUserId} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center animate-fade-in px-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
          bg-accent border border-border mb-5">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-2">
          Pick a conversation
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Select a <Hash className="inline h-3.5 w-3.5 -mt-0.5" /> channel or{" "}
          <AtSign className="inline h-3.5 w-3.5 -mt-0.5" /> direct message
          from the sidebar to start chatting.
        </p>
      </div>
    </div>
  );
}
