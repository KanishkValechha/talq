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
    <div className={`group flex items-start gap-3 px-5 py-1 hover:bg-accent/30
      transition-colors duration-150 ${!showAvatar ? "pl-[68px]" : ""}`}>
      {showAvatar && (
        <Avatar className="h-9 w-9 flex-shrink-0 mt-0.5 ring-2 ring-transparent
          group-hover:ring-border transition-all duration-200">
          {message.avatarUrl && (
            <AvatarImage src={message.avatarUrl} alt={message.authorName} />
          )}
          <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
            {message.authorName[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-sm font-semibold text-foreground">
              {message.authorName}
            </span>
            <span className="text-[10px] text-muted-foreground opacity-0
              group-hover:opacity-100 transition-opacity duration-200">
              {formatTime(message._creationTime)}
            </span>
          </div>
        )}

        <div className="flex items-end gap-2">
          <p className="text-sm text-secondary-foreground leading-relaxed">
            {message.content}
          </p>

          {!showAvatar && (
            <span className="text-[10px] text-muted-foreground opacity-0
              group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
              {formatTime(message._creationTime)}
            </span>
          )}
        </div>

        {isOwn && (
          <div className="flex items-center mt-0.5">
            {message.readCount > 0 ? (
              <CheckCheck className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Check className="h-3.5 w-3.5 text-muted-foreground/50" />
            )}
          </div>
        )}
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
