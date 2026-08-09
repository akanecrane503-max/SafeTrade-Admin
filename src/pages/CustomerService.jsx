import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Circle, Trash2, MessageSquarePlus, ListChecks, X, Plus, Pencil } from "lucide-react";
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

function TemplateManager({ open, onClose, onInsertQuickReply, onSendOptions }) {
  const [tab, setTab] = useState("quick_reply"); // 'quick_reply' | 'options'
  const [quickReplies, setQuickReplies] = useState([]);
  const [optionSets, setOptionSets] = useState([]);
  const [editing, setEditing] = useState(null); // template being created/edited, or null

  const loadAll = useCallback(async () => {
    try {
      const [qr, os] = await Promise.all([
        supportService.getTemplates("quick_reply"),
        supportService.getTemplates("options"),
      ]);
      setQuickReplies(qr);
      setOptionSets(os);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
  }, []);

  useEffect(() => {
    if (open) loadAll();
  }, [open, loadAll]);

  if (!open) return null;

  function startNew() {
    setEditing(
      tab === "quick_reply"
        ? { kind: "quick_reply", label: "", body: "" }
        : { kind: "options", label: "", body: "", options: [""] }
    );
  }

  async function handleSaveEdit() {
    try {
      const payload = {
        kind: editing.kind,
        label: editing.label,
        body: editing.body,
        options: editing.kind === "options" ? editing.options.filter((o) => o.trim()) : null,
      };
      if (editing.id) {
        await supportService.updateTemplate(editing.id, payload);
      } else {
        await supportService.createTemplate(payload);
      }
      setEditing(null);
      loadAll();
    } catch (err) {
      console.error("Failed to save template:", err);
    }
  }

  async function handleDelete(id) {
    try {
      await supportService.deleteTemplate(id);
      loadAll();
    } catch (err) {
      console.error("Failed to delete template:", err);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg card p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200">Message Templates</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-3">
          <button
            onClick={() => { setTab("quick_reply"); setEditing(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === "quick_reply" ? "bg-blue-600/15 text-blue-400" : "text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            Quick Replies
          </button>
          <button
            onClick={() => { setTab("options"); setEditing(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tab === "options" ? "bg-blue-600/15 text-blue-400" : "text-slate-400 hover:bg-slate-800/60"
            }`}
          >
            Option Sets
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {editing ? (
            <div className="space-y-3">
              <input
                value={editing.label}
                onChange={(e) => setEditing((f) => ({ ...f, label: e.target.value }))}
                placeholder="Template name"
                className="input-base w-full"
              />
              {editing.kind === "quick_reply" ? (
                <textarea
                  value={editing.body}
                  onChange={(e) => setEditing((f) => ({ ...f, body: e.target.value }))}
                  placeholder="Reply message..."
                  rows={3}
                  className="input-base w-full resize-none"
                />
              ) : (
                <>
                  <input
                    value={editing.body}
                    onChange={(e) => setEditing((f) => ({ ...f, body: e.target.value }))}
                    placeholder="Prompt shown above the choices (e.g. 'How can we help?')"
                    className="input-base w-full"
                  />
                  <div className="space-y-2">
                    {editing.options.map((opt, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={opt}
                          onChange={(e) => {
                            const next = [...editing.options];
                            next[i] = e.target.value;
                            setEditing((f) => ({ ...f, options: next }));
                          }}
                          placeholder={`Option ${i + 1}`}
                          className="input-base flex-1"
                        />
                        <button
                          onClick={() =>
                            setEditing((f) => ({
                              ...f,
                              options: f.options.filter((_, idx) => idx !== i),
                            }))
                          }
                          className="p-2 text-slate-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditing((f) => ({ ...f, options: [...f.options, ""] }))}
                      className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add option
                    </button>
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => setEditing(null)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button onClick={handleSaveEdit} className="btn-primary flex-1">
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={startNew}
                className="flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300"
              >
                <Plus className="w-3.5 h-3.5" />
                New {tab === "quick_reply" ? "quick reply" : "option set"}
              </button>

              {(tab === "quick_reply" ? quickReplies : optionSets).length === 0 ? (
                <p className="text-sm text-slate-500">Nothing saved yet.</p>
              ) : (
                (tab === "quick_reply" ? quickReplies : optionSets).map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200 truncate">{t.label}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {tab === "quick_reply" ? t.body : (t.options || []).join(" · ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {tab === "quick_reply" ? (
                        <button
                          onClick={() => onInsertQuickReply(t.body)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600/15 text-blue-400 hover:bg-blue-600/25"
                        >
                          Insert
                        </button>
                      ) : (
                        <button
                          onClick={() => onSendOptions(t.body, t.options)}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-blue-600/15 text-blue-400 hover:bg-blue-600/25"
                        >
                          Send
                        </button>
                      )}
                      <button
                        onClick={() =>
                          setEditing({
                            id: t.id,
                            kind: t.kind,
                            label: t.label,
                            body: t.body || "",
                            options: t.options || [""],
                          })
                        }
                        className="p-1.5 text-slate-500 hover:text-slate-200"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CustomerService() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
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

  async function handleDeleteMessage(messageId) {
    try {
      await supportService.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  }

  function handleInsertQuickReply(body) {
    setInput(body);
    setTemplatesOpen(false);
  }

  async function handleSendOptions(prompt, options) {
    if (!activeChat || !adminId) return;
    try {
      await supportService.sendOptionsMessage(activeChat.id, adminId, prompt, options);
      setTemplatesOpen(false);
    } catch (err) {
      console.error("Failed to send options message:", err);
    }
  }

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
              <button
                onClick={() => setTemplatesOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 text-slate-300 hover:bg-slate-800"
              >
                <ListChecks className="w-3.5 h-3.5" />
                Templates
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-2.5">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`group relative max-w-[70%] ${m.sender_type === "admin" ? "ml-auto" : ""}`}
                >
                  {m.message_type === "options" ? (
                    <div
                      className={`px-3.5 py-3 rounded-2xl text-sm ${
                        m.sender_type === "admin" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      <p className="mb-2">{m.message}</p>
                      <div className="flex flex-col gap-1.5">
                        {(m.options || []).map((opt, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium"
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`px-3.5 py-2 rounded-2xl text-sm ${
                        m.sender_type === "admin" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-200"
                      }`}
                    >
                      {m.message}
                    </div>
                  )}
                  {m.sender_type === "admin" && (
                    <button
                      onClick={() => handleDeleteMessage(m.id)}
                      className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-opacity"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-800 flex gap-3">
              <button
                type="button"
                onClick={() => setTemplatesOpen(true)}
                className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors shrink-0"
                title="Insert template"
              >
                <MessageSquarePlus className="w-4 h-4" />
              </button>
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

      <TemplateManager
        open={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onInsertQuickReply={handleInsertQuickReply}
        onSendOptions={handleSendOptions}
      />
    </div>
  );
}
