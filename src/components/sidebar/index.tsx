import { UserCircle, MessageSquare } from "lucide-react";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useProfileStore } from "../../zustand/profile";
import { ChannelsSection } from "./channels-section";
import { DirectMessagesSection } from "./direct-messages-section";

export function AppSidebar() {
  const { openProfile } = useProfileStore();

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
        <ChannelsSection />
        <SidebarSeparator />
        <DirectMessagesSection />
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={openProfile} tooltip="Edit Profile">
              <UserCircle className="h-4 w-4" />
              <span>Edit Profile</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
}
