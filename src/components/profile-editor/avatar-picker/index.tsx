import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

export function AvatarPicker({
  avatarSrc,
  initials,
  onSelect,
}: {
  avatarSrc: string
  initials: string
  onSelect: () => void
}) {
  return (
    <div className="flex flex-col items-center mb-6">
      <button onClick={onSelect} className="relative group cursor-pointer">
        <Avatar className="h-20 w-20 ring-4 ring-border">
          {avatarSrc && (
            <AvatarImage src={avatarSrc} alt="Profile" className="object-cover" />
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
      <p className="text-xs text-muted-foreground mt-2">Click avatar to change</p>
    </div>
  )
}
