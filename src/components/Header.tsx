import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";

export function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchResults = useQuery(
    api.messages.search,
    searchTerm.trim() ? { searchTerm } : "skip"
  );

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 relative z-10">
      <div className="flex-1 max-w-2xl mx-auto relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Search messages..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
        />
        {showResults && searchResults && searchResults.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {searchResults.map((result) => (
              <div
                key={result._id}
                className="p-3 hover:bg-gray-50 border-b last:border-b-0"
              >
                <div className="flex items-center space-x-2 mb-1">
                  {result.avatarUrl ? (
                    <img
                      src={result.avatarUrl}
                      alt={result.authorName}
                      className="w-6 h-6 rounded object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded bg-purple-500 flex items-center justify-center text-white text-xs">
                      {result.authorName[0].toUpperCase()}
                    </div>
                  )}
                  <span className="font-semibold text-sm">{result.authorName}</span>
                  {result.channelName && (
                    <span className="text-xs text-gray-500">in #{result.channelName}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700">{result.content}</p>
                <span className="text-xs text-gray-400">
                  {new Date(result._creationTime).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
        {showResults && searchTerm && searchResults?.length === 0 && (
          <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
            No messages found
          </div>
        )}
      </div>
      <div className="ml-4">
        <SignOutButton />
      </div>
    </header>
  );
}
