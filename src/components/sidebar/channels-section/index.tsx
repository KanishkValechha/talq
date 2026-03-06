import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Hash,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigationStore } from "@/zustand/navigation";

export function ChannelsSection() {
  const channels = useQuery(api.channels.list) || [];
  const createChannel = useMutation(api.channels.create);
  const { selectedChannel, selectChannel } = useNavigationStore();
  const { setOpenMobile, isMobile } = useSidebar();
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [channelsOpen, setChannelsOpen] = useState(true);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const channelId = await createChannel({ name: newChannelName });
      setNewChannelName("");
      setShowNewChannel(false);
      handleSelectChannel(channelId);
    } catch (error) {
      console.error("Failed to create channel:", error);
    }
  };

  const handleSelectChannel = (channelId: Id<"channels">) => {
    selectChannel(channelId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel
        className="cursor-pointer select-none text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        onClick={() => setChannelsOpen((open) => !open)}
      >
        {channelsOpen ? (
          <ChevronDown className="h-3 w-3 mr-1" />
        ) : (
          <ChevronRight className="h-3 w-3 mr-1" />
        )}
        Channels
      </SidebarGroupLabel>
      <SidebarGroupAction
        onClick={() => setShowNewChannel((open) => !open)}
        title={showNewChannel ? "Cancel" : "New Channel"}
      >
        {showNewChannel ? (
          <X className="h-3.5 w-3.5" />
        ) : (
          <Plus className="h-3.5 w-3.5" />
        )}
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
            {channels.map((channel) => (
              <SidebarMenuItem key={channel._id}>
                <SidebarMenuButton
                  isActive={selectedChannel === channel._id}
                  onClick={() => handleSelectChannel(channel._id)}
                  tooltip={channel.name}
                >
                  <Hash
                    className={`h-3.5 w-3.5 shrink-0 ${selectedChannel === channel._id ? "text-primary" : ""}`}
                  />
                  <span className="truncate">{channel.name}</span>
                </SidebarMenuButton>
                {channel.unreadCount > 0 && (
                  <SidebarMenuBadge>
                    <Badge className="h-5 min-w-5 px-1.5 border-0 text-[10px] font-bold bg-primary/20 text-primary hover:bg-primary/20">
                      {channel.unreadCount}
                    </Badge>
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}
