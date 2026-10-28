import React from 'react';
import { Avatar, Chip, Drawer, DrawerFooter, DrawerHeader } from '@pluginwoman/t-ds';
import { DotsThreeHorizontal, PauseCircle } from '@pluginwoman/t-ds/icons/24/Stroked';
import russiaLogo from '../../assets/logos/Russia.svg';
import fundLogo from '../../assets/logos/Fund.svg';
import depositLogo from '../../assets/logos/Deposit.svg';
import cardPurple from '../../assets/cards/purple.svg';
import cardTeal from '../../assets/cards/teal.svg';

export type AccountsTab = 'accounts' | 'funds' | 'deposits' | 'cards';

interface Item {
  name: string;
  amount: string;
  note: string;
  image: string;
  /** Автопополнение на паузе — иконка паузы у пункта */
  isPaused?: boolean;
  isCard?: boolean;
}

/** Все счета, фонды, депозиты и карты — данные прототипа (суммы сходятся с «Финансами») */
const TABS: Record<AccountsTab, { title: string; action: string; items: Item[] }> = {
  accounts: {
    title: 'Счета',
    action: 'Открыть счёт',
    items: [{ name: 'Расчётный **3486', amount: '22 785,37 ₽', note: '2 карты', image: russiaLogo }],
  },
  funds: {
    title: 'Фонды',
    action: 'Открыть фонд',
    items: [
      { name: 'Поставщикам и подрядчикам', amount: '126 876,32 ₽', note: '30% от доходных операций', image: fundLogo },
      { name: 'Налоги', amount: '30 000 ₽', note: '7% от доходных операций', image: fundLogo, isPaused: true },
      { name: 'Резерв', amount: '10 000 ₽', note: 'Нет автопополнения', image: fundLogo },
      { name: 'Зарплата', amount: '180 000 ₽', note: 'Пополнение 5-го числа', image: fundLogo },
      { name: 'Отпуск', amount: '75 909,05 ₽', note: '10% от доходных операций', image: fundLogo },
    ],
  },
  deposits: {
    title: 'Депозиты',
    action: 'Открыть депозит',
    items: [
      { name: 'На 6 месяцев', amount: '300 000 ₽', note: '16% годовых · до 12 марта', image: depositLogo },
      { name: 'На год', amount: '200 000 ₽', note: '15% годовых · до 3 октября', image: depositLogo },
    ],
  },
  cards: {
    title: 'Карты',
    action: 'Выпустить карту',
    items: [
      { name: 'Карта для бизнеса, **3486', amount: '22 785,37 ₽', note: 'К расчётному счёту', image: cardPurple, isCard: true },
      { name: 'Виртуальная, **8945', amount: '785,37 ₽', note: 'Для оплаты в интернете', image: cardTeal, isCard: true },
    ],
  },
};

const ORDER: AccountsTab[] = ['accounts', 'funds', 'deposits', 'cards'];

interface AccountsDrawerProps {
  /** Открытая вкладка; undefined — дровер закрыт */
  tab?: AccountsTab;
  onTabChange: (tab: AccountsTab) => void;
  onClose: () => void;
}

/** Дровер «Счета и карты» (макет «Фонды», 306:263005): все счета, фонды, депозиты и карты списком */
export const AccountsDrawer: React.FC<AccountsDrawerProps> = ({ tab, onTabChange, onClose }) => {
  // Пока дровер уезжает, показываем последнюю вкладку
  const [lastTab, setLastTab] = React.useState<AccountsTab>('funds');
  React.useEffect(() => {
    if (tab) setLastTab(tab);
  }, [tab]);
  const current = TABS[tab ?? lastTab];

  return (
    <Drawer
      isOpen={Boolean(tab)}
      onClose={onClose}
      className="accounts-drawer"
      header={<DrawerHeader title="Счета и карты" onClose={onClose} />}
      footer={<DrawerFooter layout="1-button" primaryAction={{ label: current.action, isSelected: true }} />}
    >
      <div className="accounts-drawer__content">
        <div className="accounts-drawer__tabs">
          {ORDER.map((id) => (
            <Chip key={id} variant="tab" isSelected={(tab ?? lastTab) === id} onClick={() => onTabChange(id)}>
              {TABS[id].title}
            </Chip>
          ))}
        </div>

        <div className="accounts-drawer__list">
          {current.items.map((item) => (
            <div key={item.name} className="accounts-drawer__item">
              {item.isCard ? (
                <span className="accounts-drawer__card">
                  <img src={item.image} alt="" />
                </span>
              ) : (
                <Avatar size={48} shape="circle" imageUrl={item.image} label={item.name} />
              )}
              <div className="accounts-drawer__text">
                <span className="ts-400-s accounts-drawer__secondary">{item.name}</span>
                <span className="ts-500-l">{item.amount}</span>
                <span className="ts-400-s accounts-drawer__secondary">{item.note}</span>
              </div>
              <div className="accounts-drawer__actions">
                {item.isPaused && (
                  <span className="ds-icon ds-icon--m accounts-drawer__paused" title="Автопополнение на паузе">
                    <PauseCircle />
                  </span>
                )}
                <button type="button" className="accounts-drawer__more hoverOpacity" aria-label={`Действия: ${item.name}`}>
                  <span className="ds-icon ds-icon--m" aria-hidden="true">
                    <DotsThreeHorizontal />
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
};
