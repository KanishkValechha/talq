import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2 } from "lucide-react";
import { useProfileStore } from "../zustand/profile";

export function ProfileEditor() {
  const { showProfile, closeProfile } = useProfileStore();
  const profile = useQuery(api.users.getCurrentUserProfile);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useMutation(api.users.updateProfile);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarId = profile?.avatarId;

      if (selectedImage) {
        const uploadUrl = await generateUploadUrl();
        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": selectedImage.type },
          body: selectedImage,
        });
        const json = await result.json();
        if (!result.ok)
          throw new Error(`Upload failed: ${JSON.stringify(json)}`);
        avatarId = json.storageId;
      }

      await updateProfile({
        displayName: displayName || profile?.displayName || "User",
        avatarId,
      });

      toast.success("Profile updated!");
      closeProfile();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const avatarSrc = previewUrl || profile?.avatarUrl || "";
  const initials = (profile?.displayName || "U")[0].toUpperCase();

  return (
    <Dialog open={showProfile} onOpenChange={(open) => !open && closeProfile()}>
      <DialogContent
        className="bg-card border-border w-[90vw] max-w-sm sm:max-w-md p-0 gap-0
        shadow-xl animate-fade-in"
      >
        <div className="h-24 sm:h-28 rounded-t-lg bg-linear-to-br from-primary/20 via-primary/5 to-transparent relative">
          <div className="absolute -bottom-10 sm:-bottom-12 left-1/2 -translate-x-1/2">
            <div className="relative group">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 ring-4 ring-card">
                {avatarSrc && <AvatarImage src={avatarSrc} alt="Profile" />}
                <AvatarFallback className="bg-primary/15 text-primary text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0
                  group-hover:opacity-100 transition-opacity duration-200
                  flex items-center justify-center cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-8 pt-14 sm:pt-16 pb-6 space-y-5 sm:space-y-6">
          <DialogHeader className="text-center">
            <DialogTitle className="font-display text-xl sm:text-2xl font-bold">
              Edit Profile
            </DialogTitle>
          </DialogHeader>

          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Display Name
            </label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={profile?.displayName || "Enter your name"}
              className="h-12 sm:h-11 bg-secondary border-border text-foreground text-base sm:text-sm
                placeholder:text-muted-foreground focus-visible:ring-primary/50
                focus-visible:border-primary rounded-lg sm:rounded-md"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="order-1 sm:order-none flex-1 h-11 sm:h-10 font-display font-semibold text-sm
                transition-all duration-300 rounded-lg sm:rounded-md"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={closeProfile}
              className="order-2 sm:order-none flex-1 h-11 sm:h-10 border-border hover:bg-accent
                transition-all duration-200 rounded-lg sm:rounded-md"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
