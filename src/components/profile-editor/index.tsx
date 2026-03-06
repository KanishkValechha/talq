import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2 } from "lucide-react";
import { useProfileStore } from "../../zustand/profile";

export function ProfileEditor() {
  const { showProfile, closeProfile } = useProfileStore();
  const profile = useQuery(api.users.getCurrentUserProfile);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showProfile) {
      setDisplayName(profile?.displayName || "");
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  }, [showProfile, profile?.displayName]);

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

  const hasChanges =
    displayName !== (profile?.displayName || "") || selectedImage !== null;

  return (
    <Dialog open={showProfile} onOpenChange={(open) => !open && closeProfile()}>
      <DialogContent
        className="bg-card border-border w-[90vw] max-w-[360px] p-0 
        shadow-xl animate-fade-in rounded-2xl overflow-hidden"
      >
        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        <div className="px-6 pt-8 pb-6">
          <div className="flex flex-col items-center mb-6">
            <button
              onClick={() => imageInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <Avatar className="h-20 w-20 ring-4 ring-border">
                {avatarSrc && (
                  <AvatarImage
                    src={avatarSrc}
                    alt="Profile"
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-secondary text-secondary-foreground text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 
                group-hover:opacity-100 transition-opacity duration-200 
                flex items-center justify-center"
              >
                <Camera className="h-6 w-6 text-white" />
              </div>
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              Click avatar to change
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Display Name
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={profile?.displayName || "Enter your name"}
                className="h-11 bg-secondary border-border text-foreground
                  placeholder:text-muted-foreground focus-visible:ring-2 
                  focus-visible:ring-primary/30 focus-visible:border-primary
                  transition-all duration-200 rounded-lg"
              />
            </div>

            {previewUrl && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="h-10 w-10 rounded-md overflow-hidden bg-card">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedImage?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ready to upload
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl(null);
                  }}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="flex-1 h-11 font-semibold text-sm
                transition-all duration-300 rounded-lg disabled:opacity-50
                disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={closeProfile}
              className="flex-1 h-11 border-border hover:bg-accent
                transition-all duration-200 rounded-lg font-medium"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
