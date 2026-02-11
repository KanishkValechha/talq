import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";

interface MessagePaneProps {
  channelId: Id<"channels"> | null;
  dmUserId: Id<"users"> | null;
}

export function MessagePane({ channelId, dmUserId }: MessagePaneProps) {
  const channelMessages = useQuery(
    api.messages.listByChannel,
    channelId ? { channelId } : "skip"
  );
  const dmMessages = useQuery(
    api.messages.listByDM,
    dmUserId ? { otherUserId: dmUserId } : "skip"
  );
  const messages = channelId ? channelMessages : dmMessages;

  const [newMessage, setNewMessage] = useState("");
  const sendMessage = useMutation(api.messages.send);
  const markAsRead = useMutation(api.messages.markAsRead);
  const setTyping = useMutation(api.typing.setTyping);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useQuery(api.auth.loggedInUser);

  const typingUsers = useQuery(
    api.typing.getTypingUsers,
    channelId
      ? { channelId }
      : dmUserId && currentUser
      ? { dmParticipants: [currentUser._id, dmUserId] }
      : "skip"
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (messages && currentUser) {
      messages.forEach((msg) => {
        if (msg.authorId !== currentUser._id && !msg.isRead) {
          markAsRead({ messageId: msg._id });
        }
      });
    }
  }, [messages, currentUser, markAsRead]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (channelId) {
        await sendMessage({ channelId, content: newMessage });
      } else if (dmUserId && currentUser) {
        await sendMessage({
          dmParticipants: [currentUser._id, dmUserId],
          content: newMessage,
        });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = () => {
    if (channelId) {
      setTyping({ channelId });
    } else if (dmUserId && currentUser) {
      setTyping({ dmParticipants: [currentUser._id, dmUserId] });
    }
  };

  if (!channelId && !dmUserId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-gray-500">
          <p className="text-xl">Select a channel or DM to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => (
          <div key={message._id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {message.avatarUrl ? (
                <img
                  src={message.avatarUrl}
                  alt={message.authorName}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white font-semibold">
                  {message.authorName[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <span className="font-semibold text-gray-900">
                  {message.authorName}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message._creationTime).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800 mt-1">{message.content}</p>
              {currentUser && message.authorId === currentUser._id && (
                <div className="flex items-center mt-1 space-x-1">
                  {message.readCount > 0 ? (
                    <span className="text-blue-500 text-xs">✓✓</span>
                  ) : (
                    <span className="text-gray-400 text-xs">✓✓</span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {typingUsers && typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic">
            {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
