import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: {
    _id: string;
    _creationTime: number;
    authorId: string;
    authorName: string;
    avatarUrl: string | null;
    content: string;
    readCount: number;
    isRead?: boolean;
  };
  isOwn: boolean;
  showAvatar: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar }: MessageBubbleProps) {
  return (
    <div
      className={`flex items-end gap-1.5 md:gap-2 px-2 md:px-4 py-1 md:py-1.5 ${
        isOwn ? "flex-row-reverse" : ""
      }`}
    >
      {!isOwn && showAvatar && (
        <Avatar className="h-6 w-6 md:h-8 md:w-8 flex-shrink-0 mb-1">
          {message.avatarUrl && (
            <AvatarImage src={message.avatarUrl} alt={message.authorName} />
          )}
          <AvatarFallback className="bg-primary/15 text-primary text-[10px] md:text-xs font-bold">
            {message.authorName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={`max-w-[85%] md:max-w-[75%] px-3 md:px-4 py-2 md:py-2.5 rounded-2xl shadow-sm ${
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        }`}
      >
        {!isOwn && showAvatar && (
          <div className="text-xs font-semibold text-primary mb-1">
            {message.authorName}
          </div>
        )}

        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>

        <div
          className={`flex items-center gap-1.5 mt-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-[10px] ${
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {formatTime(message._creationTime)}
          </span>
          {isOwn && (
            <span className="text-primary-foreground/80">
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
