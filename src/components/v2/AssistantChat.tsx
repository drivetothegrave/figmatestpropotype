import React from 'react';
import { Avatar, Modal, ModalHeader } from '@pluginwoman/t-ds';
import { Watch } from '@pluginwoman/t-ds/icons/20/Stroked';
import { AssistantAction, AssistantContext, AssistantReply, ChatMessage, GREETING, answer, nowTime } from '../../assistant';
import assistantAvatar from '../../assets/assistant/avatar.svg';

/** Пока ассистент готовит ответ — статус под последним сообщением */
const STATUS_STEPS: { text: string; ms: number }[] = [
  { text: 'Отправляем', ms: 300 },
  { text: 'Читаю ваше сообщение...', ms: 800 },
  { text: 'Готовлю ответ...', ms: 900 },
];

/** Переписка с ассистентом: вопрос → статусы → ответ */
export function useAssistant(ctx: AssistantContext) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [status, setStatus] = React.useState<string | null>(null);
  const nextId = React.useRef(1);
  const timers = React.useRef<number[]>([]);
  const ctxRef = React.useRef(ctx);
  ctxRef.current = ctx;

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const push = (message: Omit<ChatMessage, 'id' | 'time'>) =>
    setMessages((prev) => [...prev, { ...message, id: nextId.current++, time: nowTime() }]);

  /** Ответ после статусов «Отправляем → Читаю → Готовлю» */
  const respond = (reply: () => AssistantReply) => {
    timers.current.forEach(clearTimeout);
    let delay = 0;
    timers.current = STATUS_STEPS.map((step) => {
      const timer = window.setTimeout(() => setStatus(step.text), delay);
      delay += step.ms;
      return timer;
    });
    timers.current.push(
      window.setTimeout(() => {
        setStatus(null);
        push({ from: 'assistant', reply: reply() });
      }, delay),
    );
  };

  const ask = (text: string) => {
    const question = text.trim();
    if (!question) return;
    push({ from: 'user', text: question });
    respond(() => answer(question, ctxRef.current));
  };

  /** Открыли ассистента без вопроса — приветствие с подсказками */
  const greet = () => {
    if (messages.length === 0) push({ from: 'assistant', reply: GREETING });
  };

  const say = (text: string) => respond(() => ({ lines: [text], outro: 'Могу помочь вам чем-то ещё?' }));

  return { messages, status, ask, greet, say };
}

interface AssistantChatProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  status: string | null;
  onAsk: (text: string) => void;
  /** Ссылка в ответе: переход по прототипу или продолжение диалога */
  onAction: (action: AssistantAction) => void;
}

const AssistantBubble: React.FC<{ message: ChatMessage; onAction: (action: AssistantAction) => void }> = ({
  message,
  onAction,
}) => {
  const reply = message.reply!;
  return (
    <div className="chat-bubble chat-bubble--inbox">
      <div className="chat-bubble__header">
        <Avatar imageUrl={assistantAvatar} label="Ассистент" size={24} shape="circle" />
        <span className="ts-500-s">Ассистент</span>
      </div>
      <div className="chat-bubble__content ts-400-m">
        {reply.lines.map((line, i) =>
          typeof line === 'string' ? (
            <p key={i}>{line}</p>
          ) : (
            <p key={i}>
              {line.label}
              <span className="ts-500-m">{line.value}</span>
            </p>
          ),
        )}
        {reply.links?.map((link) => (
          <button
            key={link.label}
            type="button"
            className="chat-bubble__link ts-500-m hoverOpacity"
            onClick={() => onAction(link.action)}
          >
            {link.label}
          </button>
        ))}
        {reply.outro && <p>{reply.outro}</p>}
      </div>
      <span className="chat-bubble__time ts-400-xs">{message.time}</span>
    </div>
  );
};

export const AssistantChat: React.FC<AssistantChatProps> = ({ isOpen, onClose, messages, status, onAsk, onAction }) => {
  const [draft, setDraft] = React.useState('');
  const endRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Новое сообщение или статус — прокручиваем к низу переписки
  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages, status, isOpen]);

  React.useEffect(() => {
    if (isOpen) window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onAsk(draft);
    setDraft('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="assistant-chat"
      // Обёртка — чтобы Modal не дублировал заголовок крупным текстом в контенте
      header={
        <div>
          <ModalHeader title="Ассистент" onClose={onClose} />
        </div>
      }
      footer={
        <form className="assistant-chat__footer" onSubmit={send}>
          <div className="assistant-chat__input">
            <input
              ref={inputRef}
              className="ts-400-m"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Спросить или найти"
              aria-label="Спросить или найти"
            />
            <button
              type="submit"
              className="assistant-chat__send hoverOpacity"
              disabled={!draft.trim()}
              aria-label="Отправить"
            />
          </div>
        </form>
      }
    >
      <div className="assistant-chat__messages">
        {messages.map((message) =>
          message.from === 'user' ? (
            <div key={message.id} className="chat-bubble chat-bubble--outbox">
              <p className="chat-bubble__content ts-400-m">{message.text}</p>
              <span className="chat-bubble__time ts-400-xs">{message.time}</span>
            </div>
          ) : (
            <AssistantBubble key={message.id} message={message} onAction={onAction} />
          ),
        )}
        {status && (
          <div className="assistant-chat__status ts-400-xs">
            <span className="ds-icon assistant-chat__status-icon" aria-hidden="true">
              <Watch />
            </span>
            {status}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </Modal>
  );
};
