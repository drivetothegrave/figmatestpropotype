/**
 * Концепт «из будущего»: главная — то, что банк принёс сам, плюс то, что клиент себе собрал.
 * Разговоры с ассистентом живут ветками в левом меню.
 */

/** Статус ветки: ассистент работает в фоне, вернулся с результатом (не прочитано) или всё прочитано */
export type ThreadStatus = 'working' | 'unread' | 'read';

export interface AssistantThread {
  id: string;
  title: string;
  status: ThreadStatus;
}

/** Ветка с разобранным диалогом — «Сколько уходит на продукты и зарплату» */
export const DIALOG_THREAD_ID = 'products-salary';
export const DIALOG_TITLE = 'Сколько уходит на продукты и зарплату';

export const DEFAULT_THREADS: AssistantThread[] = [
  { id: 'bank-docs', title: 'Документы для банка', status: 'working' },
  { id: 'petrova-profit', title: 'Прибыль по Петровой', status: 'unread' },
  { id: 'expenses-growth', title: 'Почему выросли расходы', status: 'read' },
  { id: 'quarter-analytics', title: 'Аналитика за квартал', status: 'read' },
];

/** С чем ассистент пришёл на главную — выбирается в настройках прототипа */
export type FutureAssistantMode = 'calm' | 'proposal';

export const FUTURE_ASSISTANT_LABEL: Record<FutureAssistantMode, string> = {
  calm: 'Всё спокойно',
  proposal: 'Предлагает виджет',
};

/** Виджеты, которые ассистент приносит сам или собирает в разговоре; клиент закрепляет их на главной */
export type FutureWidgetId = 'revenue' | 'products-salary';

/**
 * Сценарий диалога: вопрос клиента → ответ ассистента. Вопрос можно задать своими словами —
 * ассистент всё равно отвечает по сценарию, это прототип.
 */
export const DIALOG_QUESTIONS = [
  'Сколько у нас уходит на продукты и зарплату?',
  'Да, почему на Арбате продукты 37%?',
  'А зарплата это нормально? Сколько вообще должно быть у кофейни?',
  'Понятно. Сокращу заказ выпечки на Арбате, а молоко попробую у Фермерского',
];

/** Что клиент решил про карточку, которую ассистент предложил в конце разговора */
export type CardDecision = 'pending' | 'added' | 'dismissed';

export interface FutureState {
  threads: AssistantThread[];
  /** Виджеты на главной — в порядке закрепления */
  pinned: FutureWidgetId[];
  /** Ответил ли клиент на предложение виджета «Выручка» на главной */
  revenueDecided: boolean;
  /** Сообщения клиента в диалоге — сколько задано и в какое время */
  dialog: { questions: string[]; times: string[]; card: CardDecision; cardTime?: string };
}

export const DEFAULT_FUTURE_STATE: FutureState = {
  threads: DEFAULT_THREADS,
  pinned: [],
  revenueDecided: false,
  dialog: { questions: [], times: [], card: 'pending' },
};
