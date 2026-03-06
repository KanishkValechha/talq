interface TypingIndicatorProps {
  users?: string[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (!users || users.length === 0) return null;

  const text =
    users.length === 1
      ? `${users[0]} is typing`
      : users.length === 2
        ? `${users[0]} and ${users[1]} are typing`
        : `${users[0]} and ${users.length - 1} others are typing`;

  return (
    <div className="flex items-center gap-2 px-3 md:px-5 py-2 animate-fade-in">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot typing-dot" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot typing-dot" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-typing-dot typing-dot" />
      </div>
      <span className="text-xs text-muted-foreground italic">{text}</span>
    </div>
  );
}
