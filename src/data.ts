export type PaymentStatus = 'done' | 'progress' | 'sign' | 'credited' | 'second-sign';

export interface Payment {
  id: string;
  amount: string;
  isIncome?: boolean;
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
};

export const STATUS_COLOR: Record<PaymentStatus, string> = {
  done: 'var(--primitive-success)',
  progress: 'var(--primitive-neutral-4)',
  sign: 'var(--primitive-brand)',
  credited: 'var(--primitive-success)',
  'second-sign': 'var(--primitive-secondary)',
};

const requisites = {
  inn: '8176 9703 71',
  kpp: '771 001 001',
  account: '4070 2810 0022 7000 2495',
  bik: '044 525 104',
  bank: 'АО «АЛЬФА-БАНК»',
  corrAccount: '3010 1810 8452 5000 0999',
};

export const PAYMENT_DAYS: PaymentDay[] = [
  {
    title: 'Сегодня, 2 апреля',
    payments: [
      {
        id: 'p1',
        amount: '– 250 000 ₽',
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
        id: 'p2',
        amount: '– 2 000 ₽',
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
    ],
  },
  {
    title: 'Вчера, 1 апреля',
    payments: [
      {
        id: 'p3',
        amount: '– 250 000 ₽',
        status: 'sign',
        counterparty: 'Величко, Д.А., ИП',
        description: 'По договору №8923 от 10 октября 2022 в т.ч. НДС 20%',
        meta: '№6884, 13:40',
        avatarLabel: 'В',
        dateTime: '1 апреля 2026, 13:40',
        operationName: 'Платёж по реквизитам №6884',
        recipient: 'Величко Дмитрий Александрович, ИП',
        ...requisites,
      },
      {
        id: 'p4',
        amount: '+ 50 000 ₽',
        isIncome: true,
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
    ],
  },
  {
    title: '22 марта',
    payments: [
      {
        id: 'p5',
        amount: '– 250 000 ₽',
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
        id: 'p6',
        amount: '– 77 000 ₽',
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
