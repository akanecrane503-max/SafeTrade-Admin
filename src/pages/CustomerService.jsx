import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Circle } from "lucide-react";
import { supabase } from "../lib/supabase";
import * as supportService from "../services/supportService";

function playPing() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch (err) {
    console.warn("Could not play notification sound:", err);
  }
}

export default function CustomerService() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [adminId, setAdminId] = useState(null);
  const scrollRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const loadChats = useCallback(async () => {
    try {
      const data = await supportService.getChats();
      setChats(data);
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setAdminId(user?.id || null);
    }
    init();
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    const unsubscribe = supportService.subscribeToAllMessages((msg) => {
      loadChats();
      if (msg.sender_type === "user" && msg.chat_id !== activeChatRef.current?.id) {
        playPing();
      }
      if (msg.chat_id === activeChatRef.current?.id) {
        setMessages((prev) => [...prev, msg]);
        if (msg.sender_type === "user") {
          supportService.markChatRead(msg.chat_id);
        }
      }
    });
    return unsubscribe;
  }, [loadChats]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function openChat(chat) {
    setActiveChat(chat);
    try {
      const msgs = await supportService.getMessages(chat.id);
      setMessages(msgs);
      await supportService.markChatRead(chat.id);
      loadChats();
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || !activeChat || !adminId) return;
    const text = input.trim();
    setInput("");
    try {
      await supportService.sendMessage(activeChat.id, adminId, text);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  }

  const unreadByChat = {};
  // (Per-chat unread count is derived from read_by_admin flags fetched with chats if you extend getChats with a join;
  // for now the global ping + chat list refresh signal new activity.)

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      <div className="w-72 shrink-0 card p-3 overflow-y-auto">
        <h3 className="text-sm font-semibold text-slate-200 px-2 mb-3">Conversations</h3>
        {chats.length === 0 ? (
          <p className="text-sm text-slate-500 px-2">No conversations yet.</p>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => openChat(chat)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                  activeChat?.id === chat.id ? "bg-blue-600/15 text-blue-400" : "text-slate-300 hover:bg-slate-800/60"
                }`}
              >
                <div>
                  <p className="text-sm font-medium">UID {chat.uid}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(chat.last_message_at).toLocaleString()}
                  </p>
                </div>
                <Circle
                  className="w-2.5 h-2.5 shrink-0"
                  fill={chat.user_online ? "#34d399" : "#475569"}
                  color={chat.user_online ? "#34d399" : "#475569"}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 card flex flex-col overflow-hidden">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">
            Select a conversation to start replying.
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-200">UID {activeChat.uid}</p>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                  <Circle
                    className="w-2 h-2"
                    fill={activeChat.user_online ? "#34d399" : "#475569"}
                    color={activeChat.user_online ? "#34d399" : "#475569"}
                  />
                  {activeChat.user_online ? "Online" : "Left chat"}
                </p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-2.5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[70%] px-3.5 py-2 rounded-2xl text-sm ${
                    m.sender_type === "admin"
                      ? "ml-auto bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {m.message}
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex gap-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a reply..."
                className="input-base flex-1"
              />
              <button type="submit" className="btn-primary px-4 flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
