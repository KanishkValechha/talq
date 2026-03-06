export function OnlineDot({ online }: { online: boolean }) {
  return (
    <span className="relative shrink-0">
      <span
        className={`block w-2 h-2 rounded-full ${online ? "bg-emerald-400" : "bg-muted-foreground/40"}`}
      />
      {online && (
        <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400/40 animate-pulse-soft" />
      )}
    </span>
  );
}
