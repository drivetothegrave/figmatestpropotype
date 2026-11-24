/**
 * Концепт «из будущего»: главная — то, что банк принёс сам, плюс то, что клиент себе собрал.
 * Разговоры с ассистентом живут ветками в левом меню. У каждого типа бизнеса — свои вопросы,
 * свои предложения ассистента и своя главная, которая обрастает виджетами по мере пользования.
 */

/** Статус ветки: ассистент работает в фоне, вернулся с результатом (не прочитано) или всё прочитано */
export type ThreadStatus = 'working' | 'unread' | 'read';

export interface AssistantThread {
  id: string;
  title: string;
  status: ThreadStatus;
}

/** Тип бизнеса — выбирается в настройках прототипа */
export type BusinessId = 'coffee' | 'solo';

export const BUSINESS_LABEL: Record<BusinessId, string> = {
  coffee: 'Кофейни',
  solo: 'ИП-одиночка',
};

/** Кофейни: с чем ассистент пришёл на главную — выбирается в настройках прототипа */
export type FutureAssistantMode = 'calm' | 'proposal';

export const FUTURE_ASSISTANT_LABEL: Record<FutureAssistantMode, string> = {
  calm: 'Всё спокойно',
  proposal: 'Предлагает виджет',
};

/** Виджеты, которые ассистент приносит сам или собирает в разговоре; клиент закрепляет их на главной */
export type FutureWidgetId =
  | 'revenue'
  | 'products-salary'
  | 'withdraw'
  | 'debtors'
  | 'taxes'
  | 'clients'
  | 'self-transfer';

/** Что клиент решил про карточку, которую ассистент предложил в конце разговора */
export type CardDecision = 'pending' | 'added' | 'dismissed';

export interface DialogState {
  /** Вопросы клиента — сколько задано и в какое время */
  questions: string[];
  times: string[];
  card: CardDecision;
  cardTime?: string;
}

export const EMPTY_DIALOG: DialogState = { questions: [], times: [], card: 'pending' };

export interface BusinessState {
  threads: AssistantThread[];
  /** Виджеты на главной — в порядке закрепления */
  pinned: FutureWidgetId[];
  /** Предложения ассистента на главной, на которые клиент уже ответил */
  decided: string[];
  /** Ход разговоров по сценарию — по id ветки */
  dialogs: Record<string, DialogState>;
  /** Ответы на реплики ассистента без виджета — «Напомнить», «Не сейчас» */
  flags: string[];
}

export type FutureState = Record<BusinessId, BusinessState>;
