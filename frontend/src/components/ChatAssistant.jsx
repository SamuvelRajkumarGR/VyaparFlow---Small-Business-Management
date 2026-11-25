import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendChatMessageAPI } from '../services/api';

const LOCAL_SUGGESTED_QUESTIONS = [
  'What are my total sales?',
  'What is my net profit?',
  'What was my biggest expense?',
];
const GENERAL_SUGGESTED_QUESTIONS = [
  'What are simple ways to reduce operating costs?',
  'How can a small shop attract more customers?',
  'How can a business encourage repeat purchases?',
];

const renderInlineMarkdown = (text) => text
  .split(/(\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g)
  .map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });

const renderAssistantMarkdown = (text) => {
  const blocks = [];
  let paragraph = [];
  let list = [];
  let listType = null;
  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: listType, items: list });
      list = [];
      listType = null;
    }
  };

  text.split(/\r?\n/).forEach((line) => {
    const listItem = line.match(/^\s*(?:[*-]|(\d+)[.)])\s+(.+)$/);
    if (listItem) {
      flushParagraph();
      const nextListType = listItem[1] ? 'ordered-list' : 'unordered-list';
      if (listType && listType !== nextListType) flushList();
      listType = nextListType;
      list.push(listItem[2]);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  });
  flushParagraph();
  flushList();

  return blocks.map((block, index) => (
    block.type === 'ordered-list' || block.type === 'unordered-list'
      ? (
        block.type === 'ordered-list'
          ? (
            <ol key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          )
          : (
            <ul key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          )
      )
      : <p key={index}>{renderInlineMarkdown(block.text)}</p>
  ));
};

const ChatAssistant = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I can summarize your sales, expenses, and profit from your account, and answer general business questions.',
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const messageListRef = useRef(null);

  useEffect(() => {
    messageListRef.current?.scrollTo({
      top: messageListRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, isSending, error]);

  if (!user || user.role === 'admin') return null;

  const askQuestion = async (question) => {
    const prompt = question.trim();
    if (!prompt || !acknowledged || isSending) return;

    setError('');
    setMessage('');
    setMessages((current) => [...current, { role: 'user', text: prompt }]);
    setIsSending(true);

    try {
      const result = await sendChatMessageAPI(prompt);
      setMessages((current) => [...current, { role: 'assistant', text: result.answer }]);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        'Could not get a reply. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    askQuestion(message);
  };

  return (
    <>
      {isOpen && (
        <section
          className="vfc-panel"
          role="dialog"
          aria-label="VyaparFlow business assistant"
        >
          <header className="vfc-header">
            <div className="vfc-heading">
              <span className="vfc-icon"><Sparkles size={17} /></span>
              <div>
                <strong>VyaparFlow Assistant</strong>
                <span>Business summaries · General questions</span>
              </div>
            </div>
            <button
              type="button"
              className="vfc-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close assistant"
            >
              <X size={19} />
            </button>
          </header>

          <div className="vfc-notice">
            <p>
              Sales, expense, profit, comparison, and expense-category questions are answered
              by VyaparFlow. General questions may be processed outside VyaparFlow. Do not include
              real business or personal information in general questions.
            </p>
            <label className="vfc-consent">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
              />
              <span>I understand and want to continue.</span>
            </label>
          </div>

          <div className="vfc-messages" ref={messageListRef} aria-live="polite">
            {messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`vfc-message vfc-message--${item.role}`}>
                {item.role === 'assistant' ? renderAssistantMarkdown(item.text) : item.text}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="vfc-suggestions">
                <div className="vfc-suggestion-group">
                  <strong>Ask about your VyaparFlow data</strong>
                  {LOCAL_SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      type="button"
                      key={question}
                      disabled={!acknowledged || isSending}
                      onClick={() => askQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
                <div className="vfc-suggestion-group">
                  <strong>General business questions (processed outside VyaparFlow)</strong>
                  {GENERAL_SUGGESTED_QUESTIONS.map((question) => (
                    <button
                      type="button"
                      key={question}
                      disabled={!acknowledged || isSending}
                      onClick={() => askQuestion(question)}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isSending && <div className="vfc-status">Thinking…</div>}
            {error && <div className="vfc-error" role="alert">{error}</div>}
          </div>

          <form className="vfc-form" onSubmit={handleSubmit}>
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={600}
              disabled={!acknowledged || isSending}
              placeholder={acknowledged ? 'Ask about your business…' : 'Acknowledge the notice to start'}
              aria-label="Ask the demo assistant"
            />
            <button
              type="submit"
              disabled={!acknowledged || isSending || !message.trim()}
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </form>
        </section>
      )}

      <style>{`
            .vfc-panel {
              position: fixed;
              z-index: 1200;
              right: 1.25rem;
              bottom: 5.5rem;
              width: min(390px, calc(100vw - 2rem));
              height: min(610px, calc(100dvh - 7rem));
              display: flex;
              flex-direction: column;
              overflow: hidden;
              color: var(--text-primary);
              background: var(--bg-surface);
              border: 1px solid var(--border);
              border-radius: var(--r-xl);
              box-shadow: var(--shadow-lg);
            }
            .vfc-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 1rem;
              border-bottom: 1px solid var(--border);
            }
            .vfc-heading {
              display: flex;
              align-items: center;
              gap: 0.65rem;
            }
            .vfc-heading strong, .vfc-heading span:last-child {
              display: block;
            }
            .vfc-heading strong { font-size: 0.9rem; }
            .vfc-heading span:last-child {
              margin-top: 0.15rem;
              color: var(--text-muted);
              font-size: 0.7rem;
            }
            .vfc-icon {
              display: grid;
              width: 34px;
              height: 34px;
              place-items: center;
              color: white;
              background: var(--brand);
              border-radius: 11px;
            }
            .vfc-close {
              display: grid;
              width: 34px;
              height: 34px;
              place-items: center;
              color: var(--text-secondary);
              background: transparent;
              border: 0;
              border-radius: var(--r-md);
              cursor: pointer;
            }
            .vfc-close:hover { background: var(--bg-hover); }
            .vfc-notice {
              padding: 0.55rem 1rem;
              color: var(--text-primary);
              background: var(--amber-light);
              border-bottom: 1px solid var(--border);
              font-size: 0.7rem;
              line-height: 1.45;
            }
            .vfc-notice p { margin: 0; }
            .vfc-consent {
              display: flex;
              align-items: center;
              gap: 0.45rem;
              margin-top: 0.5rem;
              color: var(--text-primary);
              font-weight: 700;
              cursor: pointer;
            }
            .vfc-consent input { accent-color: var(--brand); }
            .vfc-messages {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 0.65rem;
              padding: 1rem;
              overflow-y: auto;
            }
            .vfc-message {
              max-width: 88%;
              padding: 0.7rem 0.8rem;
              border-radius: 14px;
              font-size: 0.82rem;
              line-height: 1.5;
              white-space: pre-wrap;
              overflow-wrap: anywhere;
            }
            .vfc-message p, .vfc-message ul, .vfc-message ol { margin: 0; }
            .vfc-message p + p, .vfc-message p + ul, .vfc-message p + ol,
            .vfc-message ul + p, .vfc-message ol + p { margin-top: 0.55rem; }
            .vfc-message ul, .vfc-message ol { padding-left: 1.2rem; }
            .vfc-message li + li { margin-top: 0.2rem; }
            .vfc-message--assistant {
              color: var(--text-primary);
              background: var(--bg-hover);
              border-bottom-left-radius: 4px;
            }
            .vfc-message--user {
              align-self: flex-end;
              color: white;
              background: var(--brand);
              border-bottom-right-radius: 4px;
            }
            .vfc-suggestions {
              display: grid;
              gap: 0.8rem;
              width: 100%;
            }
            .vfc-suggestion-group {
              display: grid;
              gap: 0.45rem;
            }
            .vfc-suggestion-group strong {
              color: var(--text-muted);
              font-size: 0.7rem;
            }
            .vfc-suggestions button {
              padding: 0.55rem 0.7rem;
              color: var(--brand);
              background: transparent;
              border: 1px solid var(--border);
              border-radius: var(--r-md);
              text-align: left;
              font: inherit;
              font-size: 0.75rem;
              cursor: pointer;
            }
            .vfc-suggestions button:hover:not(:disabled) {
              border-color: var(--brand);
              background: var(--brand-subtle);
            }
            .vfc-suggestions button:disabled { opacity: 0.5; cursor: not-allowed; }
            .vfc-status, .vfc-error {
              color: var(--text-muted);
              font-size: 0.75rem;
            }
            .vfc-error { color: var(--red); }
            .vfc-form {
              display: flex;
              gap: 0.5rem;
              padding: 0.75rem;
              border-top: 1px solid var(--border);
            }
            .vfc-form input {
              min-width: 0;
              flex: 1;
              padding: 0.7rem 0.8rem;
              color: var(--text-primary);
              background: var(--bg-input);
              border: 1px solid var(--border);
              border-radius: var(--r-md);
              font: inherit;
              font-size: 0.8rem;
            }
            .vfc-form input:focus { outline: 2px solid var(--brand); outline-offset: 1px; }
            .vfc-form button {
              display: grid;
              width: 40px;
              flex: 0 0 40px;
              place-items: center;
              color: white;
              background: var(--brand);
              border: 0;
              border-radius: var(--r-md);
              cursor: pointer;
            }
            .vfc-form button:disabled { opacity: 0.45; cursor: not-allowed; }
            .vfc-launcher {
              position: fixed;
              z-index: 1200;
              right: 1.25rem;
              bottom: 1.25rem;
              display: flex;
              align-items: center;
              gap: 0.55rem;
              padding: 0.8rem 1rem;
              color: white;
              background: var(--brand);
              border: 0;
              border-radius: var(--r-full);
              box-shadow: var(--shadow-lg);
              font: inherit;
              font-size: 0.82rem;
              font-weight: 700;
              cursor: pointer;
              transition: background var(--transition), transform var(--transition);
            }
            .vfc-launcher:hover { background: var(--brand-hover); transform: translateY(-2px); }
            @media (max-width: 480px) {
              .vfc-panel {
                right: 0.5rem;
                bottom: 4.75rem;
                width: calc(100vw - 1rem);
                height: calc(100dvh - 5.5rem);
              }
              .vfc-launcher { right: 0.75rem; bottom: 0.75rem; }
            }
      `}</style>

      <button
        type="button"
        className="vfc-launcher"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close VyaparFlow assistant' : 'Open VyaparFlow assistant'}
      >
        {isOpen ? <X size={18} /> : <MessageCircle size={18} />}
        <span>{isOpen ? 'Close' : 'Ask VyaparFlow'}</span>
      </button>
    </>
  );
};

export default ChatAssistant;
