import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";

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
    <div className="w-64 bg-purple-900 text-white flex flex-col">
      <div className="p-4 border-b border-purple-800">
        <h2 className="text-xl font-bold">Workspace</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-purple-300">Channels</h3>
            <button
              onClick={() => setShowNewChannel(!showNewChannel)}
              className="text-purple-300 hover:text-white text-xl"
            >
              +
            </button>
          </div>

          {showNewChannel && (
            <form onSubmit={handleCreateChannel} className="mb-2">
              <input
                type="text"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="channel-name"
                className="w-full px-2 py-1 text-sm bg-purple-800 border border-purple-700 rounded text-white placeholder-purple-400 focus:outline-none focus:border-purple-500"
                autoFocus
              />
            </form>
          )}

          <div className="space-y-1">
            {channels.map((channel) => (
              <button
                key={channel._id}
                onClick={() => onSelectChannel(channel._id)}
                className={`w-full text-left px-2 py-1 rounded flex items-center justify-between ${
                  selectedChannel === channel._id
                    ? "bg-purple-700"
                    : "hover:bg-purple-800"
                }`}
              >
                <span className="flex items-center">
                  <span className="mr-2">#</span>
                  {channel.name}
                </span>
                {channel.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {channel.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-purple-800">
          <h3 className="text-sm font-semibold text-purple-300 mb-2">Direct Messages</h3>
          <div className="space-y-1">
            {users.map((user) => (
              <button
                key={user.userId}
                onClick={() => onSelectDM(user.userId)}
                className={`w-full text-left px-2 py-1 rounded flex items-center justify-between ${
                  selectedDM === user.userId
                    ? "bg-purple-700"
                    : "hover:bg-purple-800"
                }`}
              >
                <span className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      user.isOnline ? "bg-green-400" : "bg-gray-400"
                    }`}
                  />
                  {user.displayName}
                </span>
                {user.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {user.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-purple-800">
        <button
          onClick={onShowProfile}
          className="w-full text-left px-2 py-2 rounded hover:bg-purple-800 flex items-center"
        >
          <span className="mr-2">👤</span>
          Edit Profile
        </button>
      </div>
    </div>
  );
}
