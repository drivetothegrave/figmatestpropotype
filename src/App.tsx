import React from 'react';
import { Alert } from '@pluginwoman/t-ds';
import { LeftBar } from './components/LeftBar';
import { AppNavigationBar, AppPage } from './components/AppNavigationBar';
import { MainPage } from './components/MainPage';
import { OperationsPage, OperationsTab } from './components/OperationsPage';
import { PaymentHistory } from './components/PaymentHistory';
import { SignList } from './components/SignList';
import { PaymentDrawer } from './components/PaymentDrawer';
import { CommentModal } from './components/CommentModal';
import { SignConfirmModal } from './components/SignConfirmModal';
import { DemoPanel } from './components/DemoPanel';
import {
  DEFAULT_COMMENTS,
  PAYMENT_DAYS,
  Payment,
  PaymentDay,
  createDemoSignPayment,
  formatRub,
  paymentsWord,
} from './data';

const COMMENTS_KEY = 'payment-comments';
const HISTORY_KEY = 'comment-history';
const SIGNED_KEY = 'signed-payments';
const EXTRA_KEY = 'extra-payments';
// Примеры из макета — чтобы подсказки были видны с первого открытия
const DEFAULT_HISTORY = ['Аренда офиса', 'Аренда склада', 'Покупка оборудования'];

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
  const [comments, setComments] = React.useState<Record<string, string>>(() => load(COMMENTS_KEY, DEFAULT_COMMENTS));
  const [history, setHistory] = React.useState<string[]>(() => load(HISTORY_KEY, DEFAULT_HISTORY));
  const [signedIds, setSignedIds] = React.useState<string[]>(() => load(SIGNED_KEY, []));
  // Платежи, добавленные через панель настроек прототипа
  const [extraPayments, setExtraPayments] = React.useState<Payment[]>(() => load(EXTRA_KEY, []));
  const [paymentId, setPaymentId] = React.useState<string>();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  // Платёж, к которому редактируем комментарий (может отличаться от открытого в дровере)
  const [commentTarget, setCommentTarget] = React.useState<Payment>();
  const isModalOpen = commentTarget !== undefined;
  const [signRequest, setSignRequest] = React.useState<Payment[]>([]);
  const [successMessage, setSuccessMessage] = React.useState<string>();
  // Навигация: главная (компактный таймлайн) ↔ «Операции» (развёрнутый)
  const [page, setPage] = React.useState<AppPage>('main');
  const [operationsTab, setOperationsTab] = React.useState<OperationsTab>('all');
  const [operationsQuery, setOperationsQuery] = React.useState('');

  // Подписанные платежи уходят в историю со статусом «В процессе»
  const days: PaymentDay[] = PAYMENT_DAYS.map((day, index) => ({
    ...day,
    // Новые демо-платежи — сверху сегодняшнего дня
    payments: [...(index === 0 ? [...extraPayments].reverse() : []), ...day.payments].map((p) =>
      signedIds.includes(p.id) ? { ...p, status: 'progress' as const } : p,
    ),
  }));
  const signDays = days
    .map((day) => ({ ...day, payments: day.payments.filter((p) => p.status === 'sign') }))
    .filter((day) => day.payments.length > 0);
  const signCount = signDays.reduce((acc, day) => acc + day.payments.length, 0);
  const signSum = signDays.flatMap((day) => day.payments).reduce((acc, p) => acc + Math.abs(p.sum), 0);
  const allPayments = days.flatMap((day) => day.payments);
  const payment = allPayments.find((p) => p.id === paymentId);

  const navigate = (next: AppPage) => {
    setPage(next);
    if (next === 'operations') {
      setOperationsTab('all');
      setOperationsQuery('');
    }
    window.scrollTo({ top: 0 });
  };

  // С главной: инсайд «На подпись», «Все операции», поиск/подсказка — в нужную вкладку с запросом
  const openOperations = (tab: 'all' | 'sign', query = '') => {
    setOperationsTab(tab);
    setOperationsQuery(query);
    setPage('operations');
    window.scrollTo({ top: 0 });
  };

  const updateHistory = (next: string[]) => {
    setHistory(next);
    save(HISTORY_KEY, next);
  };

  const openPayment = (next: Payment) => {
    setPaymentId(next.id);
    setIsDrawerOpen(true);
  };

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

  const confirmSign = () => {
    const ids = signRequest.map((p) => p.id);
    const next = [...signedIds, ...ids.filter((id) => !signedIds.includes(id))];
    setSignedIds(next);
    save(SIGNED_KEY, next);
    const total = signRequest.reduce((acc, p) => acc + Math.abs(p.sum), 0);
    setSuccessMessage(
      signRequest.length === 1
        ? `Платёж на ${formatRub(total)} подписан`
        : `Подписано ${paymentsWord(signRequest.length)} на ${formatRub(total)}`,
    );
    setSignRequest([]);
  };

  const addDemoSignPayment = () => {
    const { payment: next, comment } = createDemoSignPayment();
    const nextExtra = [...extraPayments, next];
    setExtraPayments(nextExtra);
    save(EXTRA_KEY, nextExtra);
    const nextComments = { ...comments, [next.id]: comment };
    setComments(nextComments);
    save(COMMENTS_KEY, nextComments);
  };

  const restoreSigned = () => {
    setSignedIds([]);
    save(SIGNED_KEY, []);
  };

  const resetPrototype = () => {
    [COMMENTS_KEY, HISTORY_KEY, SIGNED_KEY, EXTRA_KEY].forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // без localStorage сбрасываем только состояние
      }
    });
    setComments(DEFAULT_COMMENTS);
    setHistory(DEFAULT_HISTORY);
    setSignedIds([]);
    setExtraPayments([]);
    setIsDrawerOpen(false);
    setSuccessMessage(undefined);
  };

  return (
    <div className="app">
      <AppNavigationBar page={page} onNavigate={navigate} />

      {successMessage && (
        <Alert key={successMessage} type="success" onHide={() => setSuccessMessage(undefined)}>
          {successMessage}
        </Alert>
      )}

      {page === 'main' ? (
        <div className="app__body">
          <LeftBar />
          <main className="app__main">
            <MainPage
              payments={allPayments}
              comments={comments}
              signCount={signCount}
              signSum={signSum}
              selectedId={isDrawerOpen ? paymentId : undefined}
              onOpenPayment={openPayment}
              onComment={openComment}
              onOpenOperations={openOperations}
            />
          </main>
        </div>
      ) : (
        <main className="app__operations">
          <OperationsPage
            tab={operationsTab}
            onTabChange={setOperationsTab}
            signCount={signCount}
            history={
              <PaymentHistory
                days={days}
                comments={comments}
                query={operationsQuery}
                onQueryChange={setOperationsQuery}
                selectedId={isDrawerOpen ? paymentId : undefined}
                onSelect={openPayment}
                onComment={openComment}
              />
            }
            signList={
              <SignList
                days={signDays}
                comments={comments}
                selectedId={isDrawerOpen ? paymentId : undefined}
                successMessage={successMessage}
                onSelect={openPayment}
                onComment={openComment}
                onSign={setSignRequest}
              />
            }
          />
        </main>
      )}

      <PaymentDrawer
        payment={payment}
        comment={payment ? comments[payment.id] : undefined}
        isOpen={isDrawerOpen}
        // Escape закрывает сначала модалку, а не дровер под ней
        onClose={() => !isModalOpen && signRequest.length === 0 && setIsDrawerOpen(false)}
        onCommentClick={() => payment && openComment(payment)}
        onSign={(p) => setSignRequest([p])}
      />

      <CommentModal
        isOpen={isModalOpen}
        initialValue={commentTarget ? comments[commentTarget.id] ?? '' : ''}
        history={history}
        onRemoveFromHistory={(item) => updateHistory(history.filter((h) => h !== item))}
        onClose={closeComment}
        onSave={saveComment}
      />

      <DemoPanel
        signCount={signCount}
        signedCount={signedIds.length}
        onAddSignPayment={addDemoSignPayment}
        onRestoreSigned={restoreSigned}
        onReset={resetPrototype}
      />

      <SignConfirmModal
        isOpen={signRequest.length > 0}
        payments={signRequest}
        comments={comments}
        onClose={() => setSignRequest([])}
        onConfirm={confirmSign}
      />
    </div>
  );
};
