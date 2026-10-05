import React from 'react';
import { MainPageNavigationBar } from '@pluginwoman/t-ds';
import { LeftBar } from './components/LeftBar';
import { PaymentHistory } from './components/PaymentHistory';
import { PaymentDrawer } from './components/PaymentDrawer';
import { CommentModal } from './components/CommentModal';
import { Payment } from './data';

const STORAGE_KEY = 'payment-comments';

function loadComments(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function saveComments(comments: Record<string, string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
  } catch {
    // прототип работает и без localStorage
  }
}

export const App: React.FC = () => {
  const [comments, setComments] = React.useState<Record<string, string>>(loadComments);
  const [payment, setPayment] = React.useState<Payment>();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openPayment = (next: Payment) => {
    setPayment(next);
    setIsDrawerOpen(true);
  };

  const saveComment = (value: string) => {
    if (!payment) return;
    const next = { ...comments };
    if (value) next[payment.id] = value;
    else delete next[payment.id];
    setComments(next);
    saveComments(next);
    setIsModalOpen(false);
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
          />
        </main>
      </div>

      <PaymentDrawer
        payment={payment}
        comment={payment ? comments[payment.id] : undefined}
        isOpen={isDrawerOpen}
        // Escape закрывает сначала модалку, а не дровер под ней
        onClose={() => !isModalOpen && setIsDrawerOpen(false)}
        onCommentClick={() => setIsModalOpen(true)}
      />

      <CommentModal
        isOpen={isModalOpen}
        initialValue={payment ? comments[payment.id] ?? '' : ''}
        onClose={() => setIsModalOpen(false)}
        onSave={saveComment}
      />
    </div>
  );
};
