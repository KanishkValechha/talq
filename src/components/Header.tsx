import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, X } from "lucide-react";

export function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchResults = useQuery(
    api.messages.search,
    searchTerm.trim() ? { searchTerm } : "skip"
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setShowResults(true);
      }
      if (e.key === "Escape") {
        setShowResults(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-14 bg-card/80 backdrop-blur-md border-b border-border
      flex items-center justify-between px-5 relative z-20">
      <div ref={searchRef} className="flex-1 max-w-xl mx-auto relative">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4
            text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => setShowResults(true)}
            placeholder="Search messages..."
            className="w-full h-9 pl-10 pr-20 rounded-lg bg-secondary/60 border border-border
              text-sm text-foreground placeholder:text-muted-foreground
              focus:bg-secondary focus:border-primary/40 focus:ring-1 focus:ring-primary/20
              outline-none transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(""); setShowResults(false); }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded
              border border-border bg-accent/50 px-1.5 font-mono text-[10px]
              text-muted-foreground">
              <span className="text-xs">&#8984;</span>K
            </kbd>
          </div>
        </div>

        {showResults && searchTerm && (
          <SearchResults results={searchResults} />
        )}
      </div>

      <div className="ml-4 flex-shrink-0">
        <SignOutButton />
      </div>
    </header>
  );
}

interface SearchResult {
  _id: string;
  _creationTime: number;
  content: string;
  authorName: string;
  avatarUrl: string | null;
  channelName: string | null;
}

function SearchResults({ results }: { results: SearchResult[] | undefined }) {
  if (!results) {
    return (
      <div className="absolute top-full mt-2 w-full bg-card border border-border
        rounded-xl shadow-2xl shadow-black/30 p-6 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse-soft" />
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse-soft stagger-2" />
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse-soft stagger-3" />
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="absolute top-full mt-2 w-full bg-card border border-border
        rounded-xl shadow-2xl shadow-black/30 p-6 text-center">
        <p className="text-sm text-muted-foreground">No messages found</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full mt-2 w-full bg-card border border-border
      rounded-xl shadow-2xl shadow-black/30 max-h-80 overflow-y-auto">
      {results.map((result, i) => (
        <div
          key={result._id}
          className={`flex items-start gap-3 p-3 hover:bg-accent/50
            transition-colors opacity-0 animate-fade-in stagger-${Math.min(i + 1, 5)}
            ${i > 0 ? "border-t border-border/50" : ""}`}
        >
          <Avatar className="h-7 w-7 flex-shrink-0">
            {result.avatarUrl && <AvatarImage src={result.avatarUrl} />}
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
              {result.authorName[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-xs font-semibold text-foreground">
                {result.authorName}
              </span>
              {result.channelName && (
                <span className="text-[10px] text-muted-foreground">
                  in #{result.channelName}
                </span>
              )}
            </div>
            <p className="text-xs text-secondary-foreground line-clamp-2">
              {result.content}
            </p>
            <span className="text-[10px] text-muted-foreground mt-1 block">
              {new Date(result._creationTime).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
