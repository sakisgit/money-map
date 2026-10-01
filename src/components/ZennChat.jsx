import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { useBodyScrollLock } from "../hooks/useBodyScrollLock";
import { askZenn, buildZennSnapshot, ZENN_SUGGESTIONS } from "../utils/zenn";
import { getFirstName } from "../utils/profile";

const makeWelcome = (firstName = "") => ({
  id: "welcome",
  from: "zenn",
  text: `Hi${firstName ? ` ${firstName}` : ""}, I'm Zenn — your Money Map assistant. Ask about your balance, spending, work hours or days off, for any month. One word is enough, like "hours" or "August".`,
  actions: [],
  time: new Date(),
});

const pad = (n) => String(n).padStart(2, "0");
/** "29/09/2026, 16:04" — the app's day/month/year order, 24-hour clock. */
const formatStamp = (date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}, ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;

let messageId = 0;
const nextId = () => {
  messageId += 1;
  return `msg-${messageId}`;
};

const ZennChat = ({ open, onClose }) => {
  const ctx = useContext(AppContext);
  const { formatMoney } = ctx;
  const navigate = useNavigate();
  const [messages, setMessages] = useState(() => [makeWelcome(getFirstName(ctx.profile?.name))]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [suggestions, setSuggestions] = useState(ZENN_SUGGESTIONS);
  // Suggestions show until the first question; after that only on request.
  const [showSuggestions, setShowSuggestions] = useState(true);
  const lastIntentRef = useRef(null);
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

    setMessages((prev) => [...prev, { id: nextId(), from: "user", text, time: new Date() }]);
    setInput("");
    setTyping(true);
    setShowSuggestions(false);

    const answer = askZenn(text, snapshot, formatMoney, lastIntentRef.current);
    if (answer.intent) lastIntentRef.current = answer.intent;

    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          from: "zenn",
          text: answer.text,
          actions: answer.actions,
          options: answer.options,
          time: new Date(),
        },
      ]);
      setSuggestions(answer.suggestions);
      setTyping(false);
    }, 350);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    send(input);
  };

  // Arrow Up on an empty field brings back the last question.
  const handleInputKeyDown = (event) => {
    if (event.key !== "ArrowUp" || input) return;
    const lastQuestion = [...messages].reverse().find((m) => m.from === "user");
    if (lastQuestion) {
      event.preventDefault();
      setInput(lastQuestion.text);
    }
  };

  const openPage = (to) => {
    navigate(to);
    if (isMobile) onClose();
  };

  const clearChat = () => {
    window.clearTimeout(timerRef.current);
    setTyping(false);
    setMessages([makeWelcome(getFirstName(ctx.profile?.name))]);
    setSuggestions(ZENN_SUGGESTIONS);
    setShowSuggestions(true);
    lastIntentRef.current = null;
    setInput("");
    inputRef.current?.focus();
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
            <span className="zenn__avatar-status"></span>
          </span>
          <div className="zenn__heading">
            <p className="zenn__name mb-0">
              Zenn
              <span className="zenn__badge">Assistant</span>
            </p>
            <p className="zenn__status mb-0">Online</p>
          </div>
          <button
            type="button"
            className="zenn__icon-btn zenn__icon-btn--labeled"
            onClick={clearChat}
            aria-label="Start a new chat"
            title="New chat"
          >
            <i className="fa-solid fa-pen-to-square" aria-hidden></i>
            <span className="zenn__icon-label">New chat</span>
          </button>
          <button
            type="button"
            className="zenn__icon-btn"
            onClick={onClose}
            aria-label="Minimize Zenn — your chat is kept"
            title="Minimize"
          >
            <i className="fa-solid fa-chevron-down" aria-hidden></i>
          </button>
        </header>

        <div className="zenn__messages" ref={listRef} aria-live="polite">
          {messages.map((message) => {
            const isUser = message.from === "user";
            return (
              <div key={message.id} className={`zenn__row zenn__row--${message.from}`}>
                <span className={`zenn__avatar-sm zenn__avatar-sm--${message.from}`} aria-hidden>
                  <i className={`fa-solid ${isUser ? "fa-user" : "fa-robot"}`}></i>
                </span>
                <div className="zenn__bubble">
                  <div className={`zenn__msg zenn__msg--${message.from}`}>
                    {message.text}
                    {message.options?.length > 0 && (
                      <div className="zenn__options">
                        {message.options.map((option) => (
                          <button
                            key={option.text}
                            type="button"
                            className="zenn__option"
                            onClick={() => send(option.text)}
                            disabled={typing}
                          >
                            {option.text}
                            <i className="fa-solid fa-arrow-right" aria-hidden></i>
                          </button>
                        ))}
                      </div>
                    )}
                    {message.actions?.length > 0 && (
                      <div className="zenn__actions">
                        {message.actions.map((action) => (
                          <button
                            key={action.to}
                            type="button"
                            className="zenn__action"
                            onClick={() => openPage(action.to)}
                          >
                            <i className={`fa-solid ${action.icon}`} aria-hidden></i>
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <time className="zenn__time" dateTime={message.time.toISOString()}>
                    {isUser ? "You" : "Zenn"} · {formatStamp(message.time)}
                  </time>
                </div>
              </div>
            );
          })}

          {typing && (
            <div className="zenn__row zenn__row--zenn">
              <span className="zenn__avatar-sm zenn__avatar-sm--zenn" aria-hidden>
                <i className="fa-solid fa-robot"></i>
              </span>
              <div className="zenn__msg zenn__msg--zenn zenn__typing" aria-label="Zenn is typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>

        {showSuggestions && (
          <div className="zenn__suggestions" aria-label="Suggested questions">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.text}
                type="button"
                className="zenn__chip"
                onClick={() => send(suggestion.text)}
                disabled={typing}
              >
                {suggestion.text}
              </button>
            ))}
          </div>
        )}

        <form className="zenn__form" onSubmit={handleSubmit}>
          <button
            type="button"
            className={`zenn__ideas${showSuggestions ? " is-active" : ""}`}
            onClick={() => setShowSuggestions((prev) => !prev)}
            aria-pressed={showSuggestions}
            aria-label={showSuggestions ? "Hide suggestions" : "Show suggestions"}
            title={showSuggestions ? "Hide suggestions" : "Show suggestions"}
          >
            <i className="fa-solid fa-lightbulb" aria-hidden></i>
          </button>
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
            onKeyDown={handleInputKeyDown}
            placeholder='Try "hours in August"'
            autoComplete="off"
            enterKeyHint="send"
            maxLength={300}
          />
          <button
            type="submit"
            className="zenn__send"
            disabled={!input.trim() || typing}
            aria-label="Send message"
            title="Send"
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
