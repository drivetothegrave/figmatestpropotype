import { Payment, formatRub, paymentsWord, plural } from './data';

/** Куда ведёт ссылка в ответе ассистента */
export type AssistantAction =
  | { kind: 'pay' }
  | { kind: 'tasks' }
  | { kind: 'sign' }
  | { kind: 'operations'; query: string }
  /** Ассистент отвечает сам — «Скачать», «Подключить» */
  | { kind: 'reply'; text: string }
  /** Подсказка — уходит в чат как вопрос клиента */
  | { kind: 'ask'; text: string };

/** Строка ответа: текст или «Параметр: значение» с жирным значением */
export type AssistantLine = string | { label: string; value: string };

export interface AssistantReply {
  lines: AssistantLine[];
  links?: { label: string; action: AssistantAction }[];
  outro?: string;
}

export interface ChatMessage {
  id: number;
  from: 'user' | 'assistant';
  time: string;
  text?: string;
  reply?: AssistantReply;
}

/** Что ассистент знает о клиенте — для ответов про подпись, задачи и операции */
export interface AssistantContext {
  payments: Payment[];
  signCount: number;
  signSum: number;
  tasksCount: number;
}

const OUTRO = 'Могу помочь вам чем-то ещё?';

/** С чего начать — подсказки в приветствии и когда вопрос не понят */
const SUGGESTIONS = ['Перевести по номеру телефона', 'Как заплатить налоги?', 'Создать выписку', 'Найти сервис для бизнеса'];
const suggest = (): AssistantReply['links'] => SUGGESTIONS.map((text) => ({ label: text, action: { kind: 'ask', text } }));

export const GREETING: AssistantReply = {
  lines: ['Здравствуйте! Помогу с платежами, налогами и документами, найду операцию или сервис. Например:'],
  links: suggest(),
};

/** Сервисы банка — «найти такой-то сервис» */
const SERVICES: { re: RegExp; title: string; lines: AssistantLine[]; cta: string }[] = [
  {
    re: /эквайринг|терминал|оплат\w* карт/,
    title: 'Эквайринг',
    lines: [{ label: 'Комиссия: ', value: 'от 1,3%' }, 'Терминал бесплатно, деньги — на следующий день'],
    cta: 'Подключить эквайринг',
  },
  {
    re: /зарплат|сотрудник/,
    title: 'Зарплатный проект',
    lines: [{ label: 'Комиссия: ', value: '0 ₽ за выплаты' }, 'Карты сотрудникам выпустим за 1 день'],
    cta: 'Подключить зарплатный проект',
  },
  {
    re: /кредит|заём|займ|овердрафт|финансирован/,
    title: 'Кредит для бизнеса',
    lines: [{ label: 'Сумма: ', value: 'до 5 000 000 ₽' }, { label: 'Ставка: ', value: 'от 21,9%' }, 'Решение — за 15 минут'],
    cta: 'Узнать лимит',
  },
  {
    re: /бухгалт|отчётност|отчетност|декларац/,
    title: 'Бухгалтерия',
    lines: ['Сами посчитаем налоги и сдадим отчётность', { label: 'Стоимость: ', value: 'от 0 ₽ на УСН' }],
    cta: 'Подключить бухгалтерию',
  },
  {
    re: /вэд|валют|импорт|экспорт|за границ/,
    title: 'Валютный контроль',
    lines: ['Откроем валютный счёт и поможем с документами для ВЭД', { label: 'Счёт: ', value: 'за 1 день' }],
    cta: 'Открыть валютный счёт',
  },
  {
    re: /депозит|вклад|процент\w* на остат/,
    title: 'Депозиты',
    lines: [{ label: 'Ставка: ', value: 'до 17% годовых' }, 'Можно пополнять и снимать без потери процентов'],
    cta: 'Открыть депозит',
  },
  {
    re: /касс|онлайн-касс|чек/,
    title: 'Онлайн-касса',
    lines: ['Касса с фискальным накопителем и регистрацией в ФНС', { label: 'Аренда: ', value: 'от 990 ₽ в месяц' }],
    cta: 'Подобрать кассу',
  },
];

const done = (text: string): AssistantAction => ({ kind: 'reply', text });

/** Ответ на вопрос клиента — по ключевым словам */
export function answer(question: string, ctx: AssistantContext): AssistantReply {
  const q = question.toLowerCase().replace(/ё/g, 'е');

  if (/^(привет|здравств|добр\w* (утро|день|вечер))/.test(q)) return GREETING;

  if (/телефон|сбп|по номеру/.test(q)) {
    return {
      lines: [
        'Переведу по номеру телефона через СБП.',
        { label: 'Лимит: ', value: '1 000 000 ₽ в месяц без комиссии' },
        { label: 'Куда: ', value: 'на счёт физлица в любом банке' },
        'Нужны номер получателя, банк и сумма.',
      ],
      links: [{ label: 'Перевести', action: { kind: 'pay' } }],
      outro: OUTRO,
    };
  }

  if (/налог|усн|ндфл|взнос|фнс|ифнс/.test(q)) {
    return {
      lines: [
        'Ближайший налог — аванс по УСН за третий квартал.',
        { label: 'Сумма: ', value: '45 600 ₽' },
        { label: 'Срок: ', value: 'до 28 октября 2026' },
        { label: 'Получатель: ', value: 'Казначейство России (ФНС)' },
        'Реквизиты и КБК уже заполнил — останется подписать.',
      ],
      links: [{ label: 'Заплатить налог', action: { kind: 'pay' } }],
      outro: OUTRO,
    };
  }

  if (/выписк/.test(q)) {
    return {
      lines: [
        'Осталось проверить параметры выписки и сформировать её.',
        { label: 'Период: ', value: '9 октября 2026 — 9 октября 2026' },
        'Счёт: *3486',
        'Тип операций: Полная выписка',
        'Форматы: PDF',
      ],
      links: [{ label: 'Скачать', action: done('Готово — выписка в PDF скачана.') }],
      outro: OUTRO,
    };
  }

  if (/реквизит/.test(q)) {
    return {
      lines: [
        'Реквизиты расчётного счёта:',
        { label: 'Счёт: ', value: '4070 2810 0022 7000 3486' },
        { label: 'Банк: ', value: 'ТОЧКА ПАО БАНКА «ФК ОТКРЫТИЕ»' },
        { label: 'БИК: ', value: '044 525 999' },
      ],
      links: [{ label: 'Скопировать', action: done('Скопировал реквизиты — можно вставлять.') }],
      outro: OUTRO,
    };
  }

  if (/подпис/.test(q)) {
    if (ctx.signCount === 0) return { lines: ['Платежей на подпись нет — всё подписано.'], outro: OUTRO };
    return {
      lines: [`Ждут подписи ${paymentsWord(ctx.signCount)} на ${formatRub(ctx.signSum)}.`],
      links: [{ label: 'Открыть платежи на подпись', action: { kind: 'sign' } }],
      outro: OUTRO,
    };
  }

  if (/задач|дела|сделать/.test(q)) {
    return {
      lines: [`Сейчас ${ctx.tasksCount} ${plural(ctx.tasksCount, ['задача', 'задачи', 'задач'])}, самые срочные — сверху.`],
      links: [{ label: 'Все задачи', action: { kind: 'tasks' } }],
      outro: OUTRO,
    };
  }

  // Операции по контрагенту — «Промт», «Ромашка»
  const words = q.split(/[^a-zа-я0-9]+/).filter((w) => w.length >= 4);
  const found = ctx.payments.filter((p) =>
    words.some((w) => p.counterparty.toLowerCase().replace(/ё/g, 'е').includes(w)),
  );
  if (found.length > 0) {
    const name = found[0].counterparty;
    const total = found.reduce((acc, p) => acc + Math.abs(p.sum), 0);
    return {
      lines: [
        `Нашёл ${found.length} ${plural(found.length, ['операцию', 'операции', 'операций'])} с ${name}.`,
        { label: 'Сумма: ', value: formatRub(total) },
      ],
      links: [{ label: 'Показать в операциях', action: { kind: 'operations', query: question.trim() } }],
      outro: OUTRO,
    };
  }

  if (/заплатить|оплатить|платеж|перевест|перевод/.test(q)) {
    return {
      lines: ['Заполню платёж по реквизитам: нужны ИНН, счёт получателя, БИК и сумма.'],
      links: [{ label: 'Создать платёж', action: { kind: 'pay' } }],
      outro: OUTRO,
    };
  }

  const service = SERVICES.find((s) => s.re.test(q));
  if (service) {
    return {
      lines: [`Нашёл сервис «${service.title}».`, ...service.lines],
      links: [{ label: service.cta, action: done('Оставил заявку — менеджер позвонит сегодня до 18:00.') }],
      outro: OUTRO,
    };
  }

  if (/сервис|найти|где/.test(q)) {
    return {
      lines: ['Какой сервис ищете? Вот популярные:'],
      links: SERVICES.slice(0, 4).map((s) => ({ label: s.title, action: { kind: 'ask', text: s.title } })),
    };
  }

  return {
    lines: ['Пока не знаю ответа на этот вопрос, но могу помочь с этим:'],
    links: suggest(),
  };
}

export const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
