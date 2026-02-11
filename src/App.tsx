import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { MessagePane } from "./components/MessagePane";
import { Header } from "./components/Header";
import { ProfileEditor } from "./components/ProfileEditor";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Authenticated>
        <AuthenticatedApp />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedApp />
      </Unauthenticated>
      <Toaster />
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
    const interval = setInterval(() => {
      updatePresence();
    }, 60000);
    return () => clearInterval(interval);
  }, [updatePresence]);

  if (showProfile) {
    return <ProfileEditor onClose={() => setShowProfile(false)} />;
  }

  return (
    <div className="h-screen flex flex-col">
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
        <MessagePane
          channelId={selectedChannel}
          dmUserId={selectedDM}
        />
      </div>
    </div>
  );
}

function UnauthenticatedApp() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <h2 className="text-xl font-semibold text-primary">Chat App</h2>
        <SignOutButton />
      </header>
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto">
          <div className="flex flex-col gap-section">
            <div className="text-center">
              <h1 className="text-5xl font-bold text-primary mb-4">Welcome to Chat</h1>
              <p className="text-xl text-secondary">Sign in to get started</p>
            </div>
            <SignInForm />
          </div>
        </div>
      </main>
    </>
  );
}
