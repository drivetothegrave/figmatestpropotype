import React from 'react';
import { MainPageNavigationBar } from '@pluginwoman/t-ds';
import { LeftBar } from './components/LeftBar';
import { PaymentHistory } from './components/PaymentHistory';
import { PaymentDrawer } from './components/PaymentDrawer';
import { CommentModal } from './components/CommentModal';
import { Payment } from './data';

const COMMENTS_KEY = 'payment-comments';
const HISTORY_KEY = 'comment-history';
// Примеры из макета — чтобы подсказки были видны с первого открытия
const DEFAULT_HISTORY = ['Аренда офиса', 'Покупка оборудования'];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // прототип работает и без localStorage
  }
}

export const App: React.FC = () => {
  const [comments, setComments] = React.useState<Record<string, string>>(() => load(COMMENTS_KEY, {}));
  const [history, setHistory] = React.useState<string[]>(() => load(HISTORY_KEY, DEFAULT_HISTORY));
  const [payment, setPayment] = React.useState<Payment>();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  // Платёж, к которому редактируем комментарий (может отличаться от открытого в дровере)
  const [commentTarget, setCommentTarget] = React.useState<Payment>();
  const isModalOpen = commentTarget !== undefined;

  const updateHistory = (next: string[]) => {
    setHistory(next);
    save(HISTORY_KEY, next);
  };

  const openPayment = (next: Payment) => {
    setPayment(next);
    setIsDrawerOpen(true);
  };

  // Из быстрых действий в списке — сразу модалка, без дровера
  const openComment = (next: Payment) => setCommentTarget(next);
  const closeComment = () => setCommentTarget(undefined);

  const saveComment = (value: string) => {
    if (!commentTarget) return;
    const next = { ...comments };
    if (value) next[commentTarget.id] = value;
    else delete next[commentTarget.id];
    setComments(next);
    save(COMMENTS_KEY, next);
    // Новый комментарий — в начало истории подсказок
    if (value) updateHistory([value, ...history.filter((item) => item !== value)]);
    closeComment();
  };

  return (
    <div className="app">
      <MainPageNavigationBar activeNavItem="main" customer="Носковец О.Н., ИП" avatarInitials="НО" />

      <div className="app__body">
        <LeftBar />
        <main className="app__main">
          <PaymentHistory
            comments={comments}
            selectedId={isDrawerOpen ? payment?.id : undefined}
            onSelect={openPayment}
            onComment={openComment}
          />
        </main>
      </div>

      <PaymentDrawer
        payment={payment}
        comment={payment ? comments[payment.id] : undefined}
        isOpen={isDrawerOpen}
        // Escape закрывает сначала модалку, а не дровер под ней
        onClose={() => !isModalOpen && setIsDrawerOpen(false)}
        onCommentClick={() => payment && openComment(payment)}
      />

      <CommentModal
        isOpen={isModalOpen}
        initialValue={commentTarget ? comments[commentTarget.id] ?? '' : ''}
        history={history}
        onRemoveFromHistory={(item) => updateHistory(history.filter((h) => h !== item))}
        onClose={closeComment}
        onSave={saveComment}
      />
    </div>
  );
};
