import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Loader2, PencilLine } from "lucide-react";
import { useProfileStore } from "../zustand/profile";

export function ProfileEditor() {
  const { showProfile, closeProfile } = useProfileStore();
  const profile = useQuery(api.users.getCurrentUserProfile);
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showProfile) {
      setDisplayName(profile?.displayName || "");
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  }, [showProfile, profile?.displayName]);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isEditingName]);

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
        className="bg-card border-border w-[95vw] max-w-[380px] p-0 
        shadow-2xl animate-fade-in rounded-2xl overflow-hidden"
      >
        <div className="relative">
          <div className="h-20 bg-linear-to-r from-indigo-500/20 via-primary/10 to-violet-500/20" />
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
            <div className="relative">
              <div className="h-24 w-24 rounded-2xl bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-card overflow-hidden">
                <Avatar className="h-full w-full">
                  {avatarSrc && (
                    <AvatarImage
                      src={avatarSrc}
                      alt="Profile"
                      className="object-cover"
                    />
                  )}
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-3xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="absolute inset-0 rounded-xl bg-black/40 opacity-0 hover:opacity-100 
                  transition-all duration-200 flex items-center justify-center cursor-pointer
                  group-hover:opacity-100"
              >
                <div className="flex flex-col items-center gap-1">
                  <Camera className="h-5 w-5 text-white" />
                  <span className="text-[10px] text-white font-medium">
                    Change
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <input
          type="file"
          ref={imageInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        <div className="px-6 pt-14 pb-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-display font-bold text-foreground">
              {displayName || profile?.displayName || "User"}
            </h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Display Name
              </label>
              <div className="relative">
                <Input
                  ref={nameInputRef}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onFocus={() => setIsEditingName(true)}
                  onBlur={() => setIsEditingName(false)}
                  placeholder={profile?.displayName || "Enter your name"}
                  className="h-11 bg-secondary/60 border-border text-foreground pr-10
                    placeholder:text-muted-foreground focus-visible:ring-2 
                    focus-visible:ring-primary/30 focus-visible:border-primary
                    transition-all duration-200 rounded-lg"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isEditingName ? (
                    <PencilLine className="h-4 w-4 text-primary animate-pulse" />
                  ) : (
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <PencilLine className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {previewUrl && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/40 border border-border/50">
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
              className="flex-1 h-11 font-display font-semibold text-sm
                transition-all duration-300 rounded-lg disabled:opacity-50
                disabled:cursor-not-allowed bg-primary hover:bg-primary/90"
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
