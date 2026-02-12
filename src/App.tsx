import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { AppSidebar } from "./components/Sidebar";
import { MessagePane } from "./components/MessagePane";
import { Header } from "./components/Header";
import { ProfileEditor } from "./components/ProfileEditor";
import { Id } from "../convex/_generated/dataModel";
import { MessageSquare, Zap, Shield, Users } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useTheme } from "./hooks/use-theme";

export default function App() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen">
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedApp />
      </Unauthenticated>
      <Toaster
        theme={resolvedTheme}
        toastOptions={{
          className: "bg-card border-border text-foreground",
        }}
      />
    </div>
  );
}

function AuthenticatedApp() {
  const [selectedChannel, setSelectedChannel] = useState<Id<"channels"> | null>(null);
  const [selectedDM, setSelectedDM] = useState<Id<"users"> | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [highlightMessageId, setHighlightMessageId] = useState<Id<"messages"> | null>(null);
  const updatePresence = useMutation(api.users.updatePresence);

  useEffect(() => {
    updatePresence();
    const interval = setInterval(() => updatePresence(), 60000);
    return () => clearInterval(interval);
  }, [updatePresence]);

  const handleSearchResultClick = ({
    channelId,
    dmUserId,
    messageId,
  }: {
    channelId: Id<"channels"> | null;
    dmUserId: Id<"users"> | null;
    messageId: Id<"messages">;
  }) => {
    setSelectedChannel(channelId);
    setSelectedDM(dmUserId);
    setHighlightMessageId(messageId);
  };

  return (
    <SidebarProvider>
      <AppSidebar
        selectedChannel={selectedChannel}
        selectedDM={selectedDM}
        onSelectChannel={(id) => {
          setSelectedChannel(id);
          setSelectedDM(null);
        }}
        onSelectDM={(id) => {
          setSelectedDM(id);
          setSelectedChannel(null);
        }}
        onShowProfile={() => setShowProfile(true)}
      />
      <SidebarInset className="h-svh flex flex-col relative z-10">
        <Header onSearchResultClick={handleSearchResultClick} />
        <div className="flex-1 flex overflow-hidden">
          <MessagePane
            channelId={selectedChannel}
            dmUserId={selectedDM}
            highlightMessageId={highlightMessageId}
            onHighlightSeen={() => setHighlightMessageId(null)}
          />
        </div>
      </SidebarInset>
      {showProfile && (
        <ProfileEditor onClose={() => setShowProfile(false)} />
      )}
    </SidebarProvider>
  );
}

function UnauthenticatedApp() {
  return (
    <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
            bg-primary/10 border border-primary/20 mb-6">
            <MessageSquare className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2 tracking-tight">
            Welcome to Talq
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time messaging, beautifully simple.
          </p>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-border
          rounded-2xl p-8 shadow-xl">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
