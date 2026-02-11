import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Hash, Plus, X, UserCircle, ChevronDown, ChevronRight, MessageSquare,
} from "lucide-react";

interface SidebarProps {
  selectedChannel: Id<"channels"> | null;
  selectedDM: Id<"users"> | null;
  onSelectChannel: (id: Id<"channels">) => void;
  onSelectDM: (id: Id<"users">) => void;
  onShowProfile: () => void;
}

export function Sidebar({
  selectedChannel,
  selectedDM,
  onSelectChannel,
  onSelectDM,
  onShowProfile,
}: SidebarProps) {
  const channels = useQuery(api.channels.list) || [];
  const users = useQuery(api.users.listOnlineUsers) || [];
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const createChannel = useMutation(api.channels.create);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    try {
      const channelId = await createChannel({ name: newChannelName });
      setNewChannelName("");
      setShowNewChannel(false);
      onSelectChannel(channelId);
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  return (
    <div className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="h-14 px-5 flex items-center border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center border border-primary/20">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
          </div>
          <h2 className="font-display font-bold text-sidebar-foreground text-sm tracking-tight">Talq</h2>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-3">
          <div className="px-2">
            <div className="flex items-center justify-between px-2 mb-1">
              <button onClick={() => setChannelsOpen(!channelsOpen)}
                className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors">
                {channelsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                Channels
              </button>
              <Button variant="ghost" size="icon"
                className="h-6 w-6 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-active"
                onClick={() => setShowNewChannel(!showNewChannel)}>
                {showNewChannel ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
              </Button>
            </div>
            {showNewChannel && (
              <form onSubmit={handleCreateChannel} className="px-2 mb-2">
                <Input value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="channel-name" autoFocus
                  className="h-8 text-xs bg-sidebar-active border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-muted" />
              </form>
            )}
            {channelsOpen && (
              <div className="space-y-0.5">
                {channels.map((ch) => (
                  <SidebarItem key={ch._id} active={selectedChannel === ch._id}
                    onClick={() => onSelectChannel(ch._id)} unread={ch.unreadCount}
                    icon={<Hash className={`h-3.5 w-3.5 flex-shrink-0 ${selectedChannel === ch._id ? "text-primary" : ""}`} />}
                    label={ch.name} badgeColor="primary" />
                ))}
              </div>
            )}
          </div>

          <Separator className="my-2 bg-sidebar-border" />
          <div className="px-2">
            <button onClick={() => setDmsOpen(!dmsOpen)}
              className="flex items-center gap-1 px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-sidebar-muted hover:text-sidebar-foreground transition-colors">
              {dmsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              Direct Messages
            </button>
            {dmsOpen && (
              <div className="space-y-0.5">
                {users.map((u) => (
                  <SidebarItem key={u.userId} active={selectedDM === u.userId}
                    onClick={() => onSelectDM(u.userId)} unread={u.unreadCount}
                    icon={<OnlineDot online={u.isOnline} />}
                    label={u.displayName} badgeColor="amber" />
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <button onClick={onShowProfile}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-active transition-all duration-200 group">
          <UserCircle className="h-4 w-4 group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium">Edit Profile</span>
        </button>
      </div>
    </div>
  );
}

function SidebarItem({ active, onClick, icon, label, unread, badgeColor }: {
  active: boolean; onClick: () => void; icon: React.ReactNode;
  label: string; unread: number; badgeColor: "primary" | "amber";
}) {
  const badgeCls = badgeColor === "primary"
    ? "bg-primary/20 text-primary hover:bg-primary/20"
    : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/20";
  return (
    <button onClick={onClick}
      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-sm transition-all duration-150 group
        ${active ? "bg-sidebar-active text-sidebar-foreground" : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-active/50"}`}>
      <span className="flex items-center gap-2 truncate">
        {icon}
        <span className="truncate">{label}</span>
      </span>
      {unread > 0 && (
        <Badge className={`h-5 min-w-5 px-1.5 border-0 text-[10px] font-bold ${badgeCls}`}>{unread}</Badge>
      )}
    </button>
  );
}

function OnlineDot({ online }: { online: boolean }) {
  return (
    <span className="relative flex-shrink-0">
      <span className={`block w-2 h-2 rounded-full ${online ? "bg-emerald-400" : "bg-muted-foreground/40"}`} />
      {online && <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400/40 animate-pulse-soft" />}
    </span>
  );
}
