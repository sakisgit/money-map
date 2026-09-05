import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AppContext } from "../context/AppContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { askZenn, buildZennSnapshot, ZENN_SUGGESTIONS } from "../utils/zenn";

const WELCOME = {
  id: "welcome",
  from: "zenn",
  text: "Hi, I'm Zenn — your Money Map assistant. Ask me about your balance, your spending, your work hours, or how anything here works.",
};

let messageId = 0;
const nextId = () => {
  messageId += 1;
  return `msg-${messageId}`;
};

const ZennChat = ({ open, onClose }) => {
  const ctx = useContext(AppContext);
  const { formatMoney } = ctx;
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const isMobile =
    typeof window !== "undefined" && window.matchMedia("(max-width: 575.98px)").matches;
  useBodyScrollLock(open && isMobile);

  const snapshot = useMemo(() => buildZennSnapshot(ctx), [ctx]);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  const send = (rawText) => {
    const text = String(rawText || "").trim();
    if (!text || typing) return;

    setMessages((prev) => [...prev, { id: nextId(), from: "user", text }]);
    setInput("");
    setTyping(true);

    const answer = askZenn(text, snapshot, formatMoney);
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId(), from: "zenn", text: answer }]);
      setTyping(false);
    }, 450);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  const clearChat = () => {
    window.clearTimeout(timerRef.current);
    setTyping(false);
    setMessages([WELCOME]);
    setInput("");
  };

  if (!open) return null;

  return createPortal(
    <>
      <div className="zenn__backdrop" onClick={onClose} aria-hidden />

      <section
        className="zenn"
        role="dialog"
        aria-modal="true"
        aria-label="Zenn assistant"
      >
        <header className="zenn__header">
          <span className="zenn__avatar" aria-hidden>
            <i className="fa-solid fa-robot"></i>
          </span>
          <div className="zenn__heading">
            <p className="zenn__name mb-0">Zenn</p>
            <p className="zenn__status mb-0">Your Money Map assistant</p>
          </div>
          <button
            type="button"
            className="zenn__icon-btn"
            onClick={clearChat}
            aria-label="Clear conversation"
            title="Clear conversation"
          >
            <i className="fa-solid fa-rotate-left" aria-hidden></i>
          </button>
          <button
            type="button"
            className="zenn__icon-btn"
            onClick={onClose}
            aria-label="Close Zenn"
            title="Close"
          >
            <i className="fa-solid fa-xmark" aria-hidden></i>
          </button>
        </header>

        <div className="zenn__messages" ref={listRef} aria-live="polite">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`zenn__msg zenn__msg--${message.from}`}
            >
              {message.text}
            </div>
          ))}

          {typing && (
            <div className="zenn__msg zenn__msg--zenn zenn__typing" aria-label="Zenn is typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        <div className="zenn__suggestions">
          {ZENN_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="zenn__chip"
              onClick={() => send(suggestion)}
              disabled={typing}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form className="zenn__form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="zenn-input">
            Message Zenn
          </label>
          <input
            id="zenn-input"
            ref={inputRef}
            type="text"
            className="zenn__input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Zenn anything..."
            autoComplete="off"
            maxLength={300}
          />
          <button
            type="submit"
            className="zenn__send"
            disabled={!input.trim() || typing}
            aria-label="Send message"
          >
            <i className="fa-solid fa-paper-plane" aria-hidden></i>
          </button>
        </form>
      </section>
    </>,
    document.body
  );
};

export default ZennChat;
