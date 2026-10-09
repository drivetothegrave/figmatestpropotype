export type PaymentStatus = 'done' | 'progress' | 'sign' | 'credited' | 'second-sign' | 'docs';

export interface Payment {
  id: string;
  /** Сумма: отрицательная — списание, положительная — поступление */
  sum: number;
  /** Валюта, если не рубли — в рублёвые итоги не попадает */
  currency?: 'USD';
  status: PaymentStatus;
  counterparty: string;
  description: string;
  meta: string;
  avatarLabel: string;
  dateTime: string;
  operationName: string;
  recipient: string;
  inn: string;
  kpp: string;
  account: string;
  bik: string;
  bank: string;
  corrAccount: string;
  /** Для платежей на подпись */
  createdAt?: string;
  createdBy?: string;
}

export interface PaymentDay {
  title: string;
  payments: Payment[];
}

export const STATUS_LABEL: Record<PaymentStatus, string> = {
  done: 'Исполнено',
  progress: 'В процессе',
  sign: 'На подпись',
  credited: 'Зачислено',
  'second-sign': 'Ожидает вторую подпись',
  docs: 'Нужны документы',
};

export const STATUS_COLOR: Record<PaymentStatus, string> = {
  done: 'var(--primitive-success)',
  progress: 'var(--primitive-neutral-4)',
  sign: 'var(--primitive-brand)',
  credited: 'var(--primitive-success)',
  'second-sign': 'var(--primitive-secondary)',
  docs: 'var(--primitive-brand)',
};

const rub = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 });

/** 250000 → «250 000 ₽» */
export function formatRub(value: number): string {
  return `${rub.format(Math.abs(value))} ₽`;
}

const usd = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** −250000 → «– 250 000 ₽», 50000 → «+ 50 000 ₽», валюта — «+ 12 400,00 $» */
export function formatAmount(sum: number, currency?: 'USD'): string {
  const value = currency === 'USD' ? `${usd.format(Math.abs(sum))} $` : formatRub(sum);
  return `${sum < 0 ? '–' : '+'} ${value}`;
}

/** Рублёвые платежи — для итогов и сумм */
export const inRub = <T extends { currency?: string }>(payments: T[]) => payments.filter((p) => !p.currency);

/** plural(3, ['платёж', 'платежа', 'платежей']) → «платежа» */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export const paymentsWord = (n: number) => `${n} ${plural(n, ['платёж', 'платежа', 'платежей'])}`;

const requisites = {
  inn: '8176 9703 71',
  kpp: '771 001 001',
  account: '4070 2810 0022 7000 2495',
  bik: '044 525 104',
  bank: 'АО «АЛЬФА-БАНК»',
  corrAccount: '3010 1810 8452 5000 0999',
};

const signInfo = {
  createdBy: 'Солодов Олег Алексеевич',
};

export const PAYMENT_DAYS: PaymentDay[] = [
  {
    title: 'Сегодня, 2 апреля',
    payments: [
      {
        id: 'p0',
        sum: -250000,
        status: 'done',
        counterparty: 'УФК по Сибирской области',
        description: 'Оплата налогов за 3 квартал 2026',
        meta: '№6891, 14:05',
        avatarLabel: 'УФК',
        dateTime: '2 апреля 2026, 14:05',
        operationName: 'Налоговый платёж №6891',
        recipient: 'УФК по Сибирской области (Межрайонная ИФНС №4)',
        ...requisites,
      },
      {
        id: 'v1',
        sum: 12400,
        currency: 'USD',
        status: 'docs',
        counterparty: 'Global Trade Ltd',
        description: 'Входящий валютный платёж. Загрузите документы для валютного контроля',
        meta: 'USD ··0091, 11:45',
        avatarLabel: 'G',
        dateTime: '2 апреля 2026, 11:45',
        operationName: 'Входящий валютный платёж',
        recipient: 'Global Trade Ltd',
        ...requisites,
      },
      {
        id: 'i1',
        sum: 62600,
        status: 'credited',
        counterparty: 'Анютикина С.И., ИП',
        description: 'Оплата маркетинговых услуг по договору №18',
        meta: '№3090, 11:00',
        avatarLabel: 'А',
        dateTime: '2 апреля 2026, 11:00',
        operationName: 'Входящий платёж №3090',
        recipient: 'Анютикина С.И., ИП',
        ...requisites,
      },
      {
        id: 'p1',
        sum: -250000,
        status: 'done',
        counterparty: 'Лаванда, ООО',
        description:
          'Оплата лицензионного вознаграждения за использование базовой лицензии за период с 01.11.22 по 30.11.22. НДС не предусмотрен.',
        meta: '№6884, 13:40',
        avatarLabel: 'Л',
        dateTime: '2 апреля 2026, 13:40',
        operationName: 'Платёж по реквизитам №6884',
        recipient: 'Лаванда, ООО',
        ...requisites,
      },
      {
        id: 's1',
        sum: -180000,
        status: 'sign',
        counterparty: 'БЦ Лесная, ООО',
        description: 'Арендная плата за апрель 2026 по договору №14/А от 01.02.2025. НДС не облагается',
        meta: '№6890, 12:15',
        avatarLabel: 'БЦ',
        dateTime: '2 апреля 2026, 12:15',
        operationName: 'Платёж по реквизитам №6890',
        recipient: 'Бизнес-центр «Лесная», ООО',
        createdAt: '2 апреля 2026, 12:15',
        ...signInfo,
        ...requisites,
      },
      {
        id: 's2',
        sum: -95000,
        status: 'sign',
        counterparty: 'Склад-Сервис, ООО',
        description: 'Аренда складского помещения за апрель 2026 по договору №7 от 15.01.2025, в т. ч. НДС 20%',
        meta: '№6889, 11:02',
        avatarLabel: 'СС',
        dateTime: '2 апреля 2026, 11:02',
        operationName: 'Платёж по реквизитам №6889',
        recipient: 'Склад-Сервис, ООО',
        createdAt: '2 апреля 2026, 11:02',
        ...signInfo,
        ...requisites,
      },
      {
        id: 'p2',
        sum: -2000,
        status: 'progress',
        counterparty: 'Дмитрий Олегович С.',
        description: '+7 (906) 917‑10‑18',
        meta: '№6884, 13:40',
        avatarLabel: 'ДС',
        dateTime: '2 апреля 2026, 13:40',
        operationName: 'Перевод по номеру телефона',
        recipient: 'Дмитрий Олегович С.',
        ...requisites,
      },
      {
        id: 'i2',
        sum: 249700,
        status: 'credited',
        counterparty: 'Лаванда, ООО',
        description: 'Оплата за использование ПО «Онлайн-касса»',
        meta: '№6372, 10:30',
        avatarLabel: 'Л',
        dateTime: '2 апреля 2026, 10:30',
        operationName: 'Входящий платёж №6372',
        recipient: 'Лаванда, ООО',
        ...requisites,
      },
    ],
  },
  {
    title: 'Вчера, 1 апреля',
    payments: [
      {
        id: 'p3',
        sum: -250000,
        status: 'sign',
        counterparty: 'Величко, Д.А., ИП',
        description: 'По договору №8923 от 10 октября 2022 в т.ч. НДС 20%',
        meta: '№6884, 13:40',
        avatarLabel: 'В',
        dateTime: '1 апреля 2026, 13:40',
        operationName: 'Платёж по реквизитам №6884',
        recipient: 'Величко Дмитрий Александрович, ИП',
        createdAt: '1 апреля 2026, 13:40',
        ...signInfo,
        ...requisites,
      },
      {
        id: 's3',
        sum: -12500,
        status: 'sign',
        counterparty: 'БЦ Лесная, ООО',
        description: 'Возмещение коммунальных услуг за март 2026 по договору №14/А от 01.02.2025',
        meta: '№6881, 10:30',
        avatarLabel: 'БЦ',
        dateTime: '1 апреля 2026, 10:30',
        operationName: 'Платёж по реквизитам №6881',
        recipient: 'Бизнес-центр «Лесная», ООО',
        createdAt: '1 апреля 2026, 10:30',
        ...signInfo,
        ...requisites,
      },
      {
        id: 'p4',
        sum: 50000,
        status: 'credited',
        counterparty: 'Промт, ООО',
        description: 'Оплата услуг контрагенту по договору подряда №206 от 12.03.2019, в т. ч. НДС 18%',
        meta: '№6884, 13:40',
        avatarLabel: 'П',
        dateTime: '1 апреля 2026, 13:40',
        operationName: 'Входящий платёж №6884',
        recipient: 'Промт, ООО',
        ...requisites,
      },
      {
        id: 'i3',
        sum: 18500,
        status: 'credited',
        counterparty: 'Ромашка, ООО',
        description: 'Возврат аванса по соглашению о расторжении',
        meta: '№6838, 12:10',
        avatarLabel: 'Р',
        dateTime: '1 апреля 2026, 12:10',
        operationName: 'Входящий платёж №6838',
        recipient: 'Ромашка, ООО',
        ...requisites,
      },
    ],
  },
  {
    title: '22 марта',
    payments: [
      {
        id: 'p5',
        sum: -250000,
        status: 'second-sign',
        counterparty: 'Засыпкина Д.В., ИП',
        description: 'По договору №8923 от 10 октября 2022 в т.ч. НДС 20%',
        meta: '№6884, 13:40',
        avatarLabel: 'З',
        dateTime: '22 марта 2026, 13:40',
        operationName: 'Платёж по реквизитам №6884',
        recipient: 'Засыпкина Дарья Викторовна, ИП',
        ...requisites,
      },
      {
        id: 'i4',
        sum: 303200,
        status: 'credited',
        counterparty: 'Лотос, ИП',
        description: 'Оплата подписки «Финансы» за сервис аналитики',
        meta: '№4162, 14:45',
        avatarLabel: 'Л',
        dateTime: '22 марта 2026, 14:45',
        operationName: 'Входящий платёж №4162',
        recipient: 'Лотос, ИП',
        ...requisites,
      },
      {
        id: 'p6',
        sum: -77000,
        status: 'done',
        counterparty: 'Кириенко С.В., ИП',
        description: 'Оплата услуг контрагенту по договору подряда №206 от 12.03.2019, в т. ч. НДС 10%',
        meta: '№126, 13:40',
        avatarLabel: 'К',
        dateTime: '22 марта 2026, 13:40',
        operationName: 'Платёж по реквизитам №126',
        recipient: 'Кириенко Сергей Владимирович, ИП',
        ...requisites,
      },
    ],
  },
];

/** Платежи на подпись сразу «протегированы» — чтобы было что фильтровать */
export const DEFAULT_COMMENTS: Record<string, string> = {
  s1: 'Аренда офиса',
  s2: 'Аренда склада',
  s3: 'Аренда офиса',
  p3: 'Покупка оборудования',
};

/* ---------- Демо: генерация новых платежей на подпись ---------- */

const DEMO_TEMPLATES: { counterparty: string; recipient: string; avatarLabel: string; description: string; comment: string; sums: number[] }[] = [
  {
    counterparty: 'БЦ Лесная, ООО',
    recipient: 'Бизнес-центр «Лесная», ООО',
    avatarLabel: 'БЦ',
    description: 'Арендная плата по договору №14/А от 01.02.2025. НДС не облагается',
    comment: 'Аренда офиса',
    sums: [180000, 12500, 24000],
  },
  {
    counterparty: 'Склад-Сервис, ООО',
    recipient: 'Склад-Сервис, ООО',
    avatarLabel: 'СС',
    description: 'Аренда складского помещения по договору №7 от 15.01.2025, в т. ч. НДС 20%',
    comment: 'Аренда склада',
    sums: [95000, 47500],
  },
  {
    counterparty: 'Телеком Плюс, АО',
    recipient: 'Телеком Плюс, АО',
    avatarLabel: 'ТП',
    description: 'Оплата услуг связи и интернета по счёту №5521, в т. ч. НДС 20%',
    comment: 'Связь и интернет',
    sums: [8900, 14300],
  },
  {
    counterparty: 'Техносфера, ООО',
    recipient: 'Техносфера, ООО',
    avatarLabel: 'Т',
    description: 'Оплата по счёту №318 за ноутбуки и мониторы, в т. ч. НДС 20%',
    comment: 'Покупка оборудования',
    sums: [312000, 86000],
  },
  {
    counterparty: 'Петрова А.С.',
    recipient: 'Петрова Анна Сергеевна',
    avatarLabel: 'ПА',
    description: 'Заработная плата за март 2026. НДФЛ удержан',
    comment: 'Зарплата',
    sums: [64000, 72500],
  },
];

/** Новый платёж на подпись «на сегодня» со случайным шаблоном и комментарием */
export function createDemoSignPayment(): { payment: Payment; comment: string } {
  const template = DEMO_TEMPLATES[Math.floor(Math.random() * DEMO_TEMPLATES.length)];
  const sum = template.sums[Math.floor(Math.random() * template.sums.length)];
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const number = 6900 + Math.floor(Math.random() * 100);
  return {
    comment: template.comment,
    payment: {
      id: `demo-${now.getTime()}-${Math.floor(Math.random() * 1000)}`,
      sum: -sum,
      status: 'sign',
      counterparty: template.counterparty,
      description: template.description,
      meta: `№${number}, ${time}`,
      avatarLabel: template.avatarLabel,
      dateTime: `2 апреля 2026, ${time}`,
      operationName: `Платёж по реквизитам №${number}`,
      recipient: template.recipient,
      createdAt: `2 апреля 2026, ${time}`,
      ...signInfo,
      ...requisites,
    },
  };
}
