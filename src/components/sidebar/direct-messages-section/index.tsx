import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useNavigationStore } from "../../../zustand/navigation";
import { OnlineDot } from "../online-dot";

export function DirectMessagesSection() {
  const users = useQuery(api.users.listOnlineUsers) || [];
  const { selectedDM, selectDM } = useNavigationStore();
  const { setOpenMobile, isMobile } = useSidebar();
  const [dmsOpen, setDmsOpen] = useState(true);

  const handleSelectDM = (userId: Id<"users">) => {
    selectDM(userId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel
        className="cursor-pointer select-none text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        onClick={() => setDmsOpen((open) => !open)}
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
            {users.map((user) => (
              <SidebarMenuItem key={user.userId}>
                <SidebarMenuButton
                  isActive={selectedDM === user.userId}
                  onClick={() => handleSelectDM(user.userId)}
                  tooltip={user.displayName}
                >
                  <OnlineDot online={user.isOnline} />
                  <span className="truncate">{user.displayName}</span>
                </SidebarMenuButton>
                {user.unreadCount > 0 && (
                  <SidebarMenuBadge>
                    <Badge className="h-5 min-w-5 px-1.5 border-0 text-[10px] font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500/20">
                      {user.unreadCount}
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
