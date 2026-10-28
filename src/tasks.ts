/** Задачи клиента (экран «Задачи», макет 300:257342) — данные прототипа */
export type TaskGroup = 'urgent' | 'today' | 'week';

export interface Task {
  id: string;
  category: string;
  title: string;
  text: string;
  group: TaskGroup;
  /** Критичная (красная): её нельзя удалить или отложить */
  isImportant?: boolean;
}

export const TASKS: Task[] = [
  {
    id: 'compliance',
    category: 'Комплаенс',
    title: 'Ответьте на запрос, чтобы избежать ограничений',
    text: 'До 29 ноября не позднее 23:59',
    group: 'urgent',
    isImportant: true,
  },
  {
    id: 'acquiring-docs',
    category: 'Эквайринг',
    title: 'Загрузите документы',
    text: 'Вам нужно загрузить подписанные документы. После этого начнётся подключение мобильного эквайринга.',
    group: 'today',
  },
  {
    id: 'acquiring-kkt',
    category: 'Эквайринг',
    title: 'Начните регистрацию кассы',
    text: 'Введите регистрационный номер',
    group: 'today',
  },
  {
    id: 'usn-declaration',
    category: 'Бухгалтерия',
    title: 'Отправьте декларацию по УСН за 2022 год',
    text: 'До 25 апреля 2023 года',
    group: 'week',
  },
  {
    id: 'income-fees',
    category: 'Бухгалтерия',
    title: 'Уплатите взносы с доходов',
    text: 'До 1 июля 2024 вам нужно уплатить 150 022,58 ₽ за 2023 год',
    group: 'week',
  },
  {
    id: 'fixed-fees',
    category: 'Бухгалтерия',
    title: 'Уплатите фиксированные взносы',
    text: 'До 30 сентября 2024 вам нужно уплатить 24 750 ₽ за 2024 год',
    group: 'week',
  },
];

/** Что клиент сделал с задачами: удалил или отложил на следующую неделю */
export interface TasksState {
  deleted: string[];
  postponed: string[];
}

export const DEFAULT_TASKS_STATE: TasksState = { deleted: [], postponed: [] };

/** Задачи, которые клиент видит: без удалённых; критичная — только когда она включена в настройках */
export const visibleTasks = (state: TasksState, hasCritical: boolean) =>
  TASKS.filter((t) => !state.deleted.includes(t.id) && (hasCritical || !t.isImportant));
