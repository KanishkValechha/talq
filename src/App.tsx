import { Authenticated, Unauthenticated, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { MessagePane } from "./components/MessagePane";
import { Header } from "./components/Header";
import { ProfileEditor } from "./components/ProfileEditor";
import { Id } from "../convex/_generated/dataModel";
import { MessageSquare, Zap, Shield, Users } from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen noise-bg">
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedApp />
      </Unauthenticated>
      <Toaster
        theme="dark"
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
  const updatePresence = useMutation(api.users.updatePresence);

  useEffect(() => {
    updatePresence();
    const interval = setInterval(() => updatePresence(), 60000);
    return () => clearInterval(interval);
  }, [updatePresence]);

  return (
    <div className="h-screen flex flex-col relative z-10">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
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
        <MessagePane channelId={selectedChannel} dmUserId={selectedDM} />
      </div>
      {showProfile && (
        <ProfileEditor onClose={() => setShowProfile(false)} />
      )}
    </div>
  );
}

function UnauthenticatedApp() {
  const features = [
    { icon: Zap, label: "Real-time messaging" },
    { icon: Users, label: "Channels & DMs" },
    { icon: Shield, label: "Read receipts" },
  ];

  return (
    <div className="min-h-screen gradient-mesh relative z-10 flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl
            bg-primary/10 border border-primary/20 mb-6 glow-primary">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-display font-bold text-foreground mb-3 tracking-tight">
            Welcome to Talq
          </h1>
        </div>

        <div className="bg-card/60 backdrop-blur-xl border border-border
          rounded-2xl p-8 shadow-2xl shadow-black/20">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
