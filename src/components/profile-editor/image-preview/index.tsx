interface ImagePreviewProps {
  fileName?: string;
  previewUrl: string;
  onClear: () => void;
}

export function ImagePreview({
  fileName,
  previewUrl,
  onClear,
}: ImagePreviewProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
      <div className="h-10 w-10 rounded-md overflow-hidden bg-card">
        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
        <p className="text-xs text-muted-foreground">Ready to upload</p>
      </div>
      <button
        onClick={onClear}
        className="text-muted-foreground hover:text-destructive transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
