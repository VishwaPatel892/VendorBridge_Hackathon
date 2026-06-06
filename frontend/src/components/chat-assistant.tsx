import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Minimize2 } from "lucide-react";

const SUGGESTIONS = [
  "How many pending approvals?",
  "What's our total spend?",
  "Any fraud alerts?",
  "How many open RFQs?",
  "Show vendor info",
];

export function ChatAssistant() {
  const { user, chatMessages, sendChatMessage } = useStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized, chatMessages.length]);

  if (!user) return null;

  function handleSend() {
    const msg = input.trim();
    if (!msg) return;
    sendChatMessage(msg);
    setInput("");
  }

  function handleSuggestion(s: string) {
    sendChatMessage(s);
  }

  // Format assistant messages with basic markdown-like rendering
  function formatContent(content: string) {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      // Bold text **text**
      const formatted = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      if (line.startsWith("- ")) {
        return (
          <li key={i} className="ml-3 list-disc" dangerouslySetInnerHTML={{ __html: formatted.slice(2) }} />
        );
      }
      return <p key={i} className="leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  }

  return (
    <>
      {/* Floating Bubble */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-primary/30 bg-primary text-primary-foreground transition-all hover:scale-110 hover:shadow-xl hover:shadow-primary/40 active:scale-95"
          aria-label="Open Procurement Assistant"
        >
          <MessageCircle className="h-6 w-6" />
          {chatMessages.length === 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-[9px] font-bold text-warning-foreground animate-bounce">
              AI
            </span>
          )}
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border bg-card shadow-2xl shadow-primary/20 transition-all duration-300 ${
            minimized ? "h-14 w-72" : "h-[480px] w-80 sm:w-96"
          }`}
          style={{ boxShadow: "0 20px 60px -10px color-mix(in oklab, var(--color-primary) 25%, transparent)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 rounded-t-2xl bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight">Procurement Assistant</div>
              {!minimized && <div className="text-[10px] text-primary-foreground/70">AI-powered · Always available</div>}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                onClick={() => setMinimized((m) => !m)}
              >
                <Minimize2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-primary-foreground/70 hover:bg-primary-foreground/20 hover:text-primary-foreground"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Welcome message */}
                {chatMessages.length === 0 && (
                  <div className="flex gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-xs max-w-[85%] space-y-1">
                      <p className="font-medium text-foreground">Hi {user.name.split(" ")[0]}! 👋</p>
                      <p className="text-muted-foreground">I'm your VendorBridge AI Procurement Assistant. Ask me anything about your procurement data!</p>
                    </div>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    }`}>
                      {msg.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                    </div>
                    <div className={`rounded-2xl px-3 py-2 text-xs max-w-[85%] space-y-0.5 ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted text-foreground"
                    }`}>
                      {formatContent(msg.content)}
                      <div className={`text-[9px] mt-1 ${msg.role === "user" ? "text-primary-foreground/50" : "text-muted-foreground"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Suggestions (only shown when no messages) */}
              {chatMessages.length === 0 && (
                <div className="px-3 pb-2">
                  <div className="text-[10px] text-muted-foreground mb-1.5 font-medium">QUICK QUESTIONS</div>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSuggestion(s)}
                        className="rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[10px] text-primary transition-all hover:bg-primary/15 hover:border-primary/50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2 border-t p-3">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ask about RFQs, approvals..."
                  className="h-8 text-xs"
                />
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend} disabled={!input.trim()}>
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
