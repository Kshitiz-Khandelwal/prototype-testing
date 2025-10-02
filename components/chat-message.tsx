interface ChatMessageProps {
  text: string
  sender: "user" | "bot"
  timestamp: string
}

export function ChatMessage({ text, sender, timestamp }: ChatMessageProps) {
  const isBot = sender === "bot"

  return (
    <div
      className={`flex items-start gap-3 animate-fadeIn ${
        isBot ? "flex-row" : "flex-row-reverse"
      }`}
    >
      {/* Avatar */}
      {isBot ? (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
          V
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
          U
        </div>
      )}

      {/* Message Bubble + Timestamp */}
      <div className="flex flex-col gap-1 max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isBot
              ? "bg-secondary text-secondary-foreground rounded-tl-sm"
              : "bg-primary text-primary-foreground rounded-tr-sm"
          }`}
        >
          <p className="text-sm leading-relaxed">{text}</p>
        </div>
        <span
          className={`text-xs text-muted-foreground px-2 ${
            isBot ? "text-left" : "text-right"
          }`}
        >
          {timestamp}
        </span>
      </div>
    </div>
  )
}
