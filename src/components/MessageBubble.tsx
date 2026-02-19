import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, CheckCheck } from "lucide-react";
import type { MessageBubbleProps } from "../types/components";

export function MessageBubble({
  message,
  isOwn,
  showAvatar,
}: MessageBubbleProps) {
  return (
    <div
      className={`flex items-end gap-2 px-3 md:px-4 py-0.5 md:py-1 ${
        isOwn ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar for other users */}
      {!isOwn && showAvatar ? (
        <Avatar className="h-7 w-7 shrink-0 mb-1">
          {message.avatarUrl && (
            <AvatarImage src={message.avatarUrl} alt={message.authorName} />
          )}
          <AvatarFallback className="bg-primary/15 text-primary text-[10px] font-bold">
            {message.authorName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : !isOwn ? (
        <div className="w-7 shrink-0" />
      ) : null}

      {/* Message bubble */}
      <div
        className={`max-w-[85%] md:max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
          isOwn
            ? "bg-msg-own text-msg-own-foreground rounded-br-sm"
            : "bg-msg-other text-msg-other-foreground rounded-bl-sm"
        }`}
      >
        {!isOwn && showAvatar && (
          <div className="text-xs font-semibold text-primary mb-1">
            {message.authorName}
          </div>
        )}

        <p className="text-[14px] leading-relaxed whitespace-pre-wrap wrap-break-word">
          {message.content}
        </p>

        <div
          className={`flex items-center gap-1.5 mt-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-[10px] ${
              isOwn ? "text-msg-own-foreground/60" : "text-muted-foreground"
            }`}
          >
            {formatTime(message._creationTime)}
          </span>
          {isOwn && (
            <span className="text-msg-own-foreground/70">
              {message.readCount > 0 ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
