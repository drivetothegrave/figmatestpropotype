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
import { DEFAULT_FAVORITES, DEFAULT_RECENT, SideMenu } from './components/v2/SideMenu';
import { HomePage } from './components/v2/HomePage';
import { PaymentPage } from './components/v2/PaymentPage';
import { TasksPage } from './components/v2/TasksPage';
import { DEFAULT_TASKS_STATE, TasksState, visibleTasks } from './tasks';
import { FloatingActions } from './components/v2/FloatingActions';
import { AssistantChat, useAssistant } from './components/v2/AssistantChat';
import { AssistantAction, nowTime } from './assistant';
import { BusinessState, FutureState, FutureWidgetId, ThreadStatus } from './future';
import { BUSINESSES, DEFAULT_FUTURE_STATE, currentProposal, dialogStateOf, editDialogOf, nextDialog, routeQuestion } from './businesses';
import { FutureHomePage } from './components/future/FutureHomePage';
import { DialogPage } from './components/future/DialogPage';
import { DEFAULT_HOME_WIDGETS, HomeWidgetId } from './components/v2/homeWidgets';
import { InsightNoticeBanner, RecommendationBanner, TaskChips } from './components/InsightBanners';
import { DEFAULT_INSIGHTS, InsightSettings, riskOf } from './insights';
import { FilterState, parseQuery, toFilterState } from './smartQuery';
import {
  DEFAULT_COMMENTS,
  BASE_PAYMENTS,
  HISTORY_COMMENTS,
  groupByDay,
  Payment,
  PaymentDay,
  formatRub,
  paymentsWord,
} from './data';

const COMMENTS_KEY = 'payment-comments';
const HISTORY_KEY = 'comment-history';
const SIGNED_KEY = 'signed-payments';
const EXTRA_KEY = 'extra-payments';
const INSIGHTS_KEY = 'insight-settings';
const HOME_WIDGETS_KEY = 'home-widgets';
const FAVORITES_KEY = 'menu-favorites';
const RECENT_KEY = 'menu-recent';
const RECENT_LIMIT = 5;
/** Пункты избранного и недавних, которые ведут на страницы прототипа */
const PAGE_LABELS: Partial<Record<AppPage, string>> = { payment: 'Платёж по реквизитам', tasks: 'Задачи' };
const TASKS_KEY = 'tasks-state';
// v2: состояние концепта по типам бизнеса
const FUTURE_KEY = 'future-state-v2';
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
  const [comments, setComments] = React.useState<Record<string, string>>(() => load(COMMENTS_KEY, { ...HISTORY_COMMENTS, ...DEFAULT_COMMENTS }));
  const [history, setHistory] = React.useState<string[]>(() => load(HISTORY_KEY, DEFAULT_HISTORY));
  const [signedIds, setSignedIds] = React.useState<string[]>(() => load(SIGNED_KEY, []));
  // Платежи, добавленные через панель настроек прототипа
  const [extraPayments, setExtraPayments] = React.useState<Payment[]>(() => load(EXTRA_KEY, []));
  const [paymentId, setPaymentId] = React.useState<string>();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  // Платежи, которым редактируем комментарий: один (строка, дровер) или несколько (выделение)
  const [commentTargets, setCommentTargets] = React.useState<Payment[]>([]);
  const isModalOpen = commentTargets.length > 0;
  const [signRequest, setSignRequest] = React.useState<Payment[]>([]);
  const [successMessage, setSuccessMessage] = React.useState<string>();
  // Инсайды и рекомендация на главной — включаются в настройках прототипа
  // Настройки прототипа: прежние режимы (компактная главная, инсайды) больше не настраиваются —
  // целевой прототип с редизайном; из сохранённого берём только настройки нового прототипа
  const [insights, setInsights] = React.useState<InsightSettings>(() => {
    const saved = load<Partial<InsightSettings>>(INSIGHTS_KEY, {});
    return {
      ...DEFAULT_INSIGHTS,
      financePromo: saved.financePromo ?? DEFAULT_INSIGHTS.financePromo,
      fundRecommendation: saved.fundRecommendation ?? DEFAULT_INSIGHTS.fundRecommendation,
      accountsList: saved.accountsList ?? DEFAULT_INSIGHTS.accountsList,
      criticalTask: saved.criticalTask ?? DEFAULT_INSIGHTS.criticalTask,
      future: saved.future ?? DEFAULT_INSIGHTS.future,
      futureAssistant: saved.futureAssistant === 'proposal' ? 'proposal' : 'calm',
      futureBusiness: ['solo', 'marketplace', 'director'].includes(saved.futureBusiness ?? '')
        ? saved.futureBusiness as 'solo' | 'marketplace' | 'director'
        : 'coffee',
      // Инсайт в «Истории» на главной — из макетов есть только дубль и рост риска
      notice: saved.notice === 'duplicate' || saved.notice === 'risk-medium' ? saved.notice : 'off',
    };
  });
  const updateInsights = (next: InsightSettings) => {
    setInsights(next);
    save(INSIGHTS_KEY, next);
    // Снова включили предложение виджета — ассистент приходит с ним заново
    if (next.futureAssistant === 'proposal' && insights.futureAssistant !== 'proposal') {
      updateBusiness(
        (prev) => ({ ...prev, decided: prev.decided.filter((id) => id !== 'revenue'), pinned: prev.pinned.filter((id) => id !== 'revenue') }),
        'coffee',
      );
    }
    // Другой тип бизнеса или обычный вариант — со страницы ветки на главную
    if ((!next.future || next.futureBusiness !== insights.futureBusiness) && page === 'thread') setPage('main');
  };
  // Навигация: главная (компактный таймлайн) ↔ «Операции» (развёрнутый)
  const [page, setPage] = React.useState<AppPage>('main');
  const [operationsTab, setOperationsTab] = React.useState<OperationsTab>('all');
  const [operationsQuery, setOperationsQuery] = React.useState('');
  // Фильтры «Операций» в чипах — заполняются и из умного поиска
  const [operationsFilters, setOperationsFilters] = React.useState<FilterState>({});
  // Вид списка (подробный/компактный) — общий для вкладок «Операций»
  const [isCompactView, setIsCompactView] = React.useState(false);
  // Виджеты главной (редизайн) — порядок и состав из «Настройки главной»
  const [homeWidgets, setHomeWidgets] = React.useState<HomeWidgetId[]>(() =>
    load(HOME_WIDGETS_KEY, DEFAULT_HOME_WIDGETS),
  );
  const updateHomeWidgets = (next: HomeWidgetId[]) => {
    setHomeWidgets(next);
    save(HOME_WIDGETS_KEY, next);
  };
  // Избранное в левом меню — добавляется и убирается через «⋯» у пунктов
  const [favorites, setFavorites] = React.useState<string[]>(() => load(FAVORITES_KEY, DEFAULT_FAVORITES));
  const updateFavorites = (next: string[]) => {
    setFavorites(next);
    save(FAVORITES_KEY, next);
  };
  // Недавние действия — страницы, на которые переходил клиент (новые сверху)
  const [recent, setRecent] = React.useState<string[]>(() => load(RECENT_KEY, DEFAULT_RECENT));
  const updateRecent = (next: string[]) => {
    setRecent(next);
    save(RECENT_KEY, next);
  };
  // Задачи: удалённые и отложенные на следующую неделю
  const [tasksState, setTasksState] = React.useState<TasksState>(() => load(TASKS_KEY, DEFAULT_TASKS_STATE));
  const updateTasksState = (next: TasksState) => {
    setTasksState(next);
    save(TASKS_KEY, next);
  };
  // Концепт «из будущего»: у каждого типа бизнеса свои ветки, виджеты и ход разговоров
  const [future, setFuture] = React.useState<FutureState>(() => {
    const saved = load<Partial<FutureState>>(FUTURE_KEY, {});
    // После перезагрузки ассистент уже не «думает» — ответ готов
    const settle = (s: BusinessState): BusinessState => ({
      ...s,
      threads: s.threads.map((t) => (t.status === 'working' && s.dialogs[t.id] ? { ...t, status: 'unread' } : t)),
    });
    return {
      coffee: settle(saved.coffee ?? DEFAULT_FUTURE_STATE.coffee),
      solo: settle(saved.solo ?? DEFAULT_FUTURE_STATE.solo),
      marketplace: settle(saved.marketplace ?? DEFAULT_FUTURE_STATE.marketplace),
      director: settle(saved.director ?? DEFAULT_FUTURE_STATE.director),
    };
  });
  const business = BUSINESSES[insights.futureBusiness];
  const bizState = future[insights.futureBusiness];
  const updateBusiness = (fn: (prev: BusinessState) => BusinessState, id = insights.futureBusiness) =>
    setFuture((prev) => {
      const next = { ...prev, [id]: fn(prev[id]) };
      save(FUTURE_KEY, next);
      return next;
    });
  const [threadId, setThreadId] = React.useState<string>();
  // Ветка, в которой ассистент сейчас готовит ответ
  const [thinkingId, setThinkingId] = React.useState<string>();

  // Высота закреплённой шапки — под неё встают контент и левое меню
  const [navHeight, setNavHeight] = React.useState(0);

  // Подписанные платежи уходят в историю со статусом «В процессе»; демо-платежи — к остальным
  const allPayments: Payment[] = [...extraPayments, ...BASE_PAYMENTS].map((p) =>
    signedIds.includes(p.id) ? { ...p, status: 'progress' as const } : p,
  );
  const days: PaymentDay[] = groupByDay(allPayments);
  const signDays = days
    .map((day) => ({ ...day, payments: day.payments.filter((p) => p.status === 'sign') }))
    .filter((day) => day.payments.length > 0);
  const signCount = signDays.reduce((acc, day) => acc + day.payments.length, 0);
  const signSum = signDays.flatMap((day) => day.payments).reduce((acc, p) => acc + Math.abs(p.sum), 0);
  const payment = allPayments.find((p) => p.id === paymentId);

  // Откуда пришли — для стрелки «назад» на внутренних страницах
  const [previousPage, setPreviousPage] = React.useState<AppPage>('main');
  const navigate = (next: AppPage) => {
    if (next !== page) setPreviousPage(page);
    setPage(next);
    // Посещённая страница — первой в «Недавних действиях» левого меню
    const label = PAGE_LABELS[next];
    if (label) updateRecent([label, ...recent.filter((r) => r !== label)].slice(0, RECENT_LIMIT));
    if (next === 'operations') {
      setOperationsTab('all');
      setOperationsQuery('');
      setOperationsFilters({});
    }
    window.scrollTo({ top: 0 });
  };

  // С главной: инсайд «На подпись», «Все операции», поиск/подсказка — в нужную вкладку с запросом
  const openOperations = (tab: 'all' | 'sign', query = '') => {
    setOperationsTab(tab);
    // Распознанное из запроса — сразу в чипы, в поле остаётся свободный текст
    const parsed = parseQuery(query, allPayments.map((p) => p.counterparty));
    setOperationsFilters(toFilterState(parsed));
    setOperationsQuery(parsed.text);
    if (insights.fullTimeline && !insights.redesign && page === 'main') {
      // Полный таймлайн на главной — остаёмся здесь и прокручиваем к нему
      document.querySelector('.main-page__timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setPage('operations');
    window.scrollTo({ top: 0 });
  };

  // Ассистент: вопрос из поля на главной или плавающей кнопки — чат в модалке
  const [isAssistantOpen, setIsAssistantOpen] = React.useState(false);
  const assistant = useAssistant({
    payments: allPayments,
    signCount,
    signSum,
    tasksCount: visibleTasks(tasksState, insights.criticalTask).length,
  });
  const askAssistant = (question: string) => {
    assistant.ask(question);
    setIsAssistantOpen(true);
  };
  const openAssistant = () => {
    assistant.greet();
    setIsAssistantOpen(true);
  };
  const runAssistantAction = (action: AssistantAction) => {
    if (action.kind === 'ask') return assistant.ask(action.text);
    if (action.kind === 'reply') return assistant.say(action.text);
    setIsAssistantOpen(false);
    if (action.kind === 'pay') navigate('payment');
    else if (action.kind === 'tasks') navigate('tasks');
    else if (action.kind === 'sign') openOperations('sign');
    else openOperations('all', action.query);
  };

  const withThreadStatus = (prev: BusinessState, id: string, status: ThreadStatus): BusinessState => ({
    ...prev,
    threads: prev.threads.map((t) => (t.id === id ? { ...t, status } : t)),
  });
  // Открыта ли ветка прямо сейчас — чтобы вернувшийся ответ не стал «непрочитанным»
  const openedThreadRef = React.useRef<string | undefined>(undefined);
  openedThreadRef.current = page === 'thread' ? threadId : undefined;

  const openThread = (id: string) => {
    updateBusiness((prev) => withThreadStatus(prev, id, prev.threads.find((t) => t.id === id)?.status === 'working' ? 'working' : 'read'));
    // Страница есть только у разговоров из сценария — остальные ветки для вида
    if (!business.dialogs.some((d) => d.id === id)) return;
    setThreadId(id);
    navigate('thread');
  };

  /** Вопрос по сценарию: ветка появляется в меню, ассистент «работает» и возвращается с ответом */
  const askInDialog = (dialogId: string, question: string) => {
    const def = business.dialogs.find((d) => d.id === dialogId);
    if (!def || thinkingId || dialogStateOf(bizState, dialogId).questions.length >= def.questions.length) return;
    const time = nowTime();
    const biz = insights.futureBusiness;
    updateBusiness((prev) => {
      const dialog = dialogStateOf(prev, dialogId);
      const hasThread = prev.threads.some((t) => t.id === dialogId);
      const threads = hasThread
        ? prev.threads.map((t) => (t.id === dialogId ? { ...t, status: 'working' as const } : t))
        : [{ id: dialogId, title: def.title, status: 'working' as const }, ...prev.threads];
      return {
        ...prev,
        threads,
        dialogs: { ...prev.dialogs, [dialogId]: { ...dialog, questions: [...dialog.questions, question], times: [...dialog.times, time] } },
      };
    });
    setThinkingId(dialogId);
    window.setTimeout(() => {
      setThinkingId(undefined);
      updateBusiness((prev) => withThreadStatus(prev, dialogId, openedThreadRef.current === dialogId ? 'read' : 'unread'), biz);
    }, 1800);
  };

  /** Вопрос с главной — в подходящий разговор по сценарию, его ветка открывается */
  const askFromFutureHome = (question: string) => {
    const def = routeQuestion(business, bizState, question);
    if (!def) return;
    askInDialog(def.id, question);
    setThreadId(def.id);
    navigate('thread');
  };

  /** Закрепить виджет — встаёт последним */
  const pin = (prev: BusinessState, id: FutureWidgetId): BusinessState => ({
    ...prev,
    pinned: prev.pinned.includes(id) ? prev.pinned : [...prev.pinned, id],
  });

  const decideCard = (decision: 'added' | 'dismissed') => {
    const def = business.dialogs.find((d) => d.id === threadId);
    const widget = def?.offer?.widget;
    if (!def || !widget) return;
    updateBusiness((prev) => {
      const next = decision === 'added' ? pin(prev, widget) : prev;
      return { ...next, dialogs: { ...next.dialogs, [def.id]: { ...dialogStateOf(prev, def.id), card: decision, cardTime: nowTime() } } };
    });
  };

  const proposal = currentProposal(business, bizState, insights);
  const decideProposal = (accept: boolean) => {
    if (!proposal) return;
    updateBusiness((prev) => {
      const next = accept ? pin(prev, proposal.widget) : prev;
      return { ...next, decided: [...next.decided, proposal.id] };
    });
  };

  const hideWidget = (id: FutureWidgetId) =>
    updateBusiness((prev) => ({ ...prev, pinned: prev.pinned.filter((p) => p !== id) }));

  /** «⋯ → Изменить»: ветка разговора про виджет; у виджета из предложения она появляется в меню */
  const editWidget = (id: FutureWidgetId) => {
    const def = editDialogOf(business, id);
    if (!def) return;
    updateBusiness((prev) =>
      prev.threads.some((t) => t.id === def.id)
        ? prev
        : { ...prev, threads: [{ id: def.id, title: def.title, status: 'read' }, ...prev.threads] },
    );
    setThreadId(def.id);
    navigate('thread');
  };

  /** Этап для демо — главная ИП через 2 недели, 2 месяца, полгода */
  const jumpToStage = (index: number) => {
    const stage = business.stages?.[index];
    if (!stage) return;
    updateBusiness(() => stage.state());
    setThinkingId(undefined);
    navigate('main');
  };

  const updateHistory = (next: string[]) => {
    setHistory(next);
    save(HISTORY_KEY, next);
  };

  const openPayment = (next: Payment) => {
    setPaymentId(next.id);
    setIsDrawerOpen(true);
  };

  const openComment = (next: Payment) => setCommentTargets([next]);
  const openBulkComment = (next: Payment[]) => setCommentTargets(next);
  const closeComment = () => setCommentTargets([]);

  // Общий комментарий выбранных платежей — если он у всех одинаковый
  const commentInitial = (() => {
    const values = Array.from(new Set(commentTargets.map((p) => comments[p.id] ?? '')));
    return values.length === 1 ? values[0] : '';
  })();

  const saveComment = (value: string) => {
    if (commentTargets.length === 0) return;
    const next = { ...comments };
    commentTargets.forEach((target) => {
      if (value) next[target.id] = value;
      else delete next[target.id];
    });
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

  const resetPrototype = () => {
    [COMMENTS_KEY, HISTORY_KEY, SIGNED_KEY, EXTRA_KEY, INSIGHTS_KEY, HOME_WIDGETS_KEY, FAVORITES_KEY, RECENT_KEY, TASKS_KEY, FUTURE_KEY].forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // без localStorage сбрасываем только состояние
      }
    });
    setComments({ ...HISTORY_COMMENTS, ...DEFAULT_COMMENTS });
    setHistory(DEFAULT_HISTORY);
    setSignedIds([]);
    setExtraPayments([]);
    setInsights(DEFAULT_INSIGHTS);
    setHomeWidgets(DEFAULT_HOME_WIDGETS);
    setFavorites(DEFAULT_FAVORITES);
    setRecent(DEFAULT_RECENT);
    setTasksState(DEFAULT_TASKS_STATE);
    setFuture(DEFAULT_FUTURE_STATE);
    setThreadId(undefined);
    setThinkingId(undefined);
    if (page === 'thread') setPage('main');
    setIsDrawerOpen(false);
    setSuccessMessage(undefined);
  };

  // Полный таймлайн включили, стоя на «Операциях», — пункта в шапке больше нет, возвращаемся на главную
  React.useEffect(() => {
    if (insights.fullTimeline && !insights.redesign && page === 'operations') setPage('main');
  }, [insights.fullTimeline, insights.redesign, page]);

  const vedPayments = allPayments.filter((p) => p.status === 'docs');

  // Список «Все операции» и «На подпись» — общий для «Операций» и полного таймлайна на главной
  const renderOperations = (isOnMain: boolean) => (
    <OperationsPage
      tab={operationsTab}
      onTabChange={setOperationsTab}
      signCount={signCount}
      risk={riskOf(insights.notice)}
      history={
        <PaymentHistory
          days={days}
          comments={comments}
          query={operationsQuery}
          onQueryChange={setOperationsQuery}
          filters={operationsFilters}
          onFiltersChange={setOperationsFilters}
          selectedId={isDrawerOpen ? paymentId : undefined}
          onSelect={openPayment}
          onComment={openComment}
          onBulkComment={openBulkComment}
          isCompactView={isCompactView}
          onViewChange={setIsCompactView}
          {...(isOnMain && {
            layout: 'combined' as const,
            beforeList: (
              <>
                <InsightNoticeBanner insights={insights} />
                <RecommendationBanner insights={insights} />
              </>
            ),
            extraChips: (
              <TaskChips
                insights={insights}
                signCount={signCount}
                signSum={signSum}
                vedPayments={vedPayments}
                onOpenSign={() => setOperationsTab('sign')}
                onOpenVed={(p) => setOperationsQuery(p.counterparty)}
              />
            ),
          })}
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
          isCompactView={isCompactView}
          onViewChange={setIsCompactView}
        />
      }
    />
  );

  return (
    <div
      className={['app', insights.redesign ? 'app--v2' : ''].filter(Boolean).join(' ')}
      style={{ '--app-nav-height': `${navHeight}px` } as React.CSSProperties}
    >
      <AppNavigationBar
        page={page}
        onNavigate={navigate}
        hasOperations={!insights.fullTimeline}
        isMinimal={insights.redesign}
        onHeightChange={setNavHeight}
      />

      {successMessage && (
        <Alert key={successMessage} type="success" onHide={() => setSuccessMessage(undefined)}>
          {successMessage}
        </Alert>
      )}

      {insights.redesign ? (
        // Редизайн: левое меню и колонка контента 900px
        <div className="app__body app-v2">
          <SideMenu
            page={page}
            onNavigate={navigate}
            operationsBadge={signCount}
            favorites={favorites}
            onFavoritesChange={updateFavorites}
            recent={recent}
            onOpenShortcut={(label) => {
              const target = (Object.keys(PAGE_LABELS) as AppPage[]).find((p) => PAGE_LABELS[p] === label);
              if (target) navigate(target);
            }}
            threads={insights.future ? bizState.threads : undefined}
            activeThreadId={threadId}
            onOpenThread={openThread}
          />
          <main
            className={[
              'app-v2__main',
              page === 'payment' || page === 'tasks' ? 'app-v2__main--wide' : '',
              insights.future && (page === 'main' || page === 'thread') ? 'app-v2__main--future' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <div className="app-v2__column">
              {insights.future && page === 'main' ? (
                <FutureHomePage
                  name={business.name}
                  proposal={proposal}
                  onAcceptProposal={() => decideProposal(true)}
                  onDeclineProposal={() => decideProposal(false)}
                  line={business.homeLine(bizState)}
                  onLineAction={(flag) => updateBusiness((prev) => ({ ...prev, flags: [...prev.flags, flag] }))}
                  money={business.money(bizState)}
                  pinned={bizState.pinned}
                  onHide={hideWidget}
                  onEdit={editWidget}
                  askPlaceholder={nextDialog(business, bizState)?.questions[0]}
                  onAsk={askFromFutureHome}
                  onPay={() => navigate('payment')}
                />
              ) : page === 'thread' && business.dialogs.some((d) => d.id === threadId) ? (
                <DialogPage
                  def={business.dialogs.find((d) => d.id === threadId)!}
                  dialog={dialogStateOf(bizState, threadId!)}
                  isThinking={thinkingId === threadId}
                  onAsk={(question) => askInDialog(threadId!, question)}
                  onCardDecision={decideCard}
                  onOpenHome={() => navigate('main')}
                />
              ) : page === 'main' ? (
                <HomePage
                  settings={insights}
                  payments={days.flatMap((day) => day.payments)}
                  comments={comments}
                  signCount={signCount}
                  signSum={signSum}
                  selectedId={isDrawerOpen ? paymentId : undefined}
                  onOpenPayment={openPayment}
                  onComment={openComment}
                  onOpenOperations={openOperations}
                  widgets={homeWidgets}
                  onWidgetsChange={updateHomeWidgets}
                  onPay={() => navigate('payment')}
                  tasksCount={visibleTasks(tasksState, insights.criticalTask).length}
                  onOpenTasks={() => navigate('tasks')}
                  onAsk={askAssistant}
                />
              ) : page === 'tasks' ? (
                <TasksPage
                  state={tasksState}
                  onStateChange={updateTasksState}
                  hasCritical={insights.criticalTask}
                  onBack={() => navigate(previousPage === 'tasks' ? 'main' : previousPage)}
                />
              ) : page === 'payment' ? (
                <PaymentPage onBack={() => navigate(previousPage === 'payment' ? 'main' : previousPage)} />
              ) : (
                renderOperations(false)
              )}
            </div>
          </main>
          <FloatingActions onOpenAssistant={openAssistant} hasAssistant={!insights.future} />
          <AssistantChat
            isOpen={isAssistantOpen}
            onClose={() => setIsAssistantOpen(false)}
            messages={assistant.messages}
            status={assistant.status}
            onAsk={assistant.ask}
            onAction={runAssistantAction}
          />
        </div>
      ) : page === 'main' ? (
        <div className="app__body">
          <LeftBar />
          <main className="app__main">
            <MainPage
              payments={days.flatMap((day) => day.payments)}
              comments={comments}
              signCount={signCount}
              signSum={signSum}
              selectedId={isDrawerOpen ? paymentId : undefined}
              onOpenPayment={openPayment}
              onComment={openComment}
              onOpenOperations={openOperations}
              insights={insights}
              timeline={insights.fullTimeline ? renderOperations(true) : undefined}
            />
          </main>
        </div>
      ) : (
        <main className="app__operations">{renderOperations(false)}</main>
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
        initialValue={commentInitial}
        title={commentTargets.length > 1 ? `Комментарий к ${commentTargets.length} платежам` : undefined}
        history={history}
        onRemoveFromHistory={(item) => updateHistory(history.filter((h) => h !== item))}
        onClose={closeComment}
        onSave={saveComment}
      />

      <DemoPanel
        onReset={resetPrototype}
        settings={insights}
        onSettingsChange={updateInsights}
        stages={insights.future ? business.stages?.map((st) => st.label) : undefined}
        onStage={jumpToStage}
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
