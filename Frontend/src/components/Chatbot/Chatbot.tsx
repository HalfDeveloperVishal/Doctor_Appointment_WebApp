import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I’m your Health Assistant. Ask me anything about health guidelines.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/patient/chatbot/", {
        message: input,
      });

      const botMessage = { sender: "bot", text: res.data.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 w-16 h-16 rounded-full bg-blue-500 shadow-xl flex items-center justify-center hover:bg-blue-600 transition"
        >
          <img
            src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
            alt="chatbot avatar"
            className="w-10 h-10 rounded-full bg-white p-1"
          />
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-5 right-5 w-80 bg-white rounded-2xl shadow-2xl flex flex-col h-[65vh] transition-all">
          {/* Header */}
          <div className="p-3 bg-blue-500 text-white rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
                alt="bot avatar"
                className="w-8 h-8 rounded-full bg-white p-1"
              />
              <h2 className="font-semibold">Health Assistant</h2>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="text-white text-xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {/* Bot Avatar */}
                {msg.sender === "bot" && (
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
                    alt="bot avatar"
                    className="w-8 h-8 rounded-full bg-white p-1 border"
                  />
                )}

                {/* Message Bubble */}
                <div
                  className={`px-4 py-2 rounded-xl max-w-[70%] text-sm ${msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800"
                    }`}
                >
                  {msg.text}
                </div>

                {/* User Avatar */}
                {msg.sender === "user" && (
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
                    alt="user avatar"
                    className="w-8 h-8 rounded-full bg-white p-1 border"
                  />
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
                  alt="bot avatar"
                  className="w-8 h-8 rounded-full bg-white p-1 border"
                />
                <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-sm animate-pulse">
                  Typing...
                </div>
              </div>
            )}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 border-t flex items-center space-x-2">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
