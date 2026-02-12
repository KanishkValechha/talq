import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Hash, Plus, X, UserCircle, ChevronDown, ChevronRight, MessageSquare,
} from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  selectedChannel: Id<"channels"> | null;
  selectedDM: Id<"users"> | null;
  onSelectChannel: (id: Id<"channels">) => void;
  onSelectDM: (id: Id<"users">) => void;
  onShowProfile: () => void;
}

export function AppSidebar({
  selectedChannel,
  selectedDM,
  onSelectChannel,
  onSelectDM,
  onShowProfile,
}: AppSidebarProps) {
  const channels = useQuery(api.channels.list) || [];
  const users = useQuery(api.users.listOnlineUsers) || [];
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true);
  const createChannel = useMutation(api.channels.create);
  const { setOpenMobile, isMobile } = useSidebar();

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    try {
      const channelId = await createChannel({ name: newChannelName });
      setNewChannelName("");
      setShowNewChannel(false);
      onSelectChannel(channelId);
      if (isMobile) setOpenMobile(false);
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  const handleSelectChannel = (id: Id<"channels">) => {
    onSelectChannel(id);
    if (isMobile) setOpenMobile(false);
  };

  const handleSelectDM = (id: Id<"users">) => {
    onSelectDM(id);
    if (isMobile) setOpenMobile(false);
  };

  return (
    <ShadcnSidebar>
      <SidebarHeader className="h-14 px-5 flex-row items-center border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
          </div>
          <h2 className="font-display font-bold text-sidebar-foreground text-sm tracking-tight">
            Talq
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Channels */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="cursor-pointer select-none text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            onClick={() => setChannelsOpen(!channelsOpen)}
          >
            {channelsOpen ? (
              <ChevronDown className="h-3 w-3 mr-1" />
            ) : (
              <ChevronRight className="h-3 w-3 mr-1" />
            )}
            Channels
          </SidebarGroupLabel>
          <SidebarGroupAction
            onClick={() => setShowNewChannel(!showNewChannel)}
            title={showNewChannel ? "Cancel" : "New Channel"}
          >
            {showNewChannel ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          </SidebarGroupAction>

          {showNewChannel && (
            <form onSubmit={handleCreateChannel} className="px-2 mb-1">
              <Input
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="channel-name"
                autoFocus
                className="h-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-muted"
              />
            </form>
          )}

          {channelsOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {channels.map((ch) => (
                  <SidebarMenuItem key={ch._id}>
                    <SidebarMenuButton
                      isActive={selectedChannel === ch._id}
                      onClick={() => handleSelectChannel(ch._id)}
                      tooltip={ch.name}
                    >
                      <Hash className={`h-3.5 w-3.5 shrink-0 ${selectedChannel === ch._id ? "text-primary" : ""}`} />
                      <span className="truncate">{ch.name}</span>
                    </SidebarMenuButton>
                    {ch.unreadCount > 0 && (
                      <SidebarMenuBadge>
                        <Badge className="h-5 min-w-5 px-1.5 border-0 text-[10px] font-bold bg-primary/20 text-primary hover:bg-primary/20">
                          {ch.unreadCount}
                        </Badge>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>

        <SidebarSeparator />

        {/* Direct Messages */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="cursor-pointer select-none text-sidebar-muted hover:text-sidebar-foreground transition-colors"
            onClick={() => setDmsOpen(!dmsOpen)}
          >
            {dmsOpen ? (
              <ChevronDown className="h-3 w-3 mr-1" />
            ) : (
              <ChevronRight className="h-3 w-3 mr-1" />
            )}
            Direct Messages
          </SidebarGroupLabel>

          {dmsOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {users.map((u) => (
                  <SidebarMenuItem key={u.userId}>
                    <SidebarMenuButton
                      isActive={selectedDM === u.userId}
                      onClick={() => handleSelectDM(u.userId)}
                      tooltip={u.displayName}
                    >
                      <OnlineDot online={u.isOnline} />
                      <span className="truncate">{u.displayName}</span>
                    </SidebarMenuButton>
                    {u.unreadCount > 0 && (
                      <SidebarMenuBadge>
                        <Badge className="h-5 min-w-5 px-1.5 border-0 text-[10px] font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/20">
                          {u.unreadCount}
                        </Badge>
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onShowProfile} tooltip="Edit Profile">
              <UserCircle className="h-4 w-4" />
              <span>Edit Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}

function OnlineDot({ online }: { online: boolean }) {
  return (
    <span className="relative shrink-0">
      <span className={`block w-2 h-2 rounded-full ${online ? "bg-emerald-400" : "bg-muted-foreground/40"}`} />
      {online && <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400/40 animate-pulse-soft" />}
    </span>
  );
}
