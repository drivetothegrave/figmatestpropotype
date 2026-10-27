import React from 'react';
import { AccordeonCell, Avatar, Cell, Chip, Dropdown, Footer, Input, NavigationBar, TabsCarousel, TextArea } from '@pluginwoman/t-ds';
import { DotsThreeHorizontal } from '@pluginwoman/t-ds/icons';
import russiaLogo from '../../assets/logos/Russia.svg';

const RECIPIENT_TABS = ['Бизнесу', 'Физлицу', 'Самозанятому', 'В бюджет', 'За границу'];
const VAT = ['НДС 20%', 'НДС 10%', 'НДС 7%', 'НДС 5%', 'НДС 0%', 'Без НДС'];
const BANKS = ['044525104 — АО «Точка»', '044525225 — ПАО Сбербанк', '044525974 — АО «Т-Банк»', '044525593 — АО «Альфа-Банк»'];
const ACCOUNTS = ['50 275,37 ₽ — Расчётный, **9804', '2 374,77 ₽ — Операционный, **8934'];

interface PaymentPageProps {
  onBack: () => void;
}

/** Внутренняя страница «Платёж по реквизитам» (макет 293:254827) — пример экрана, на который ведут переходы */
export const PaymentPage: React.FC<PaymentPageProps> = ({ onBack }) => {
  const [tab, setTab] = React.useState(0);
  const [form, setForm] = React.useState({ inn: '', recipient: '', account: '', amount: '', purpose: '', email: '' });
  const [bank, setBank] = React.useState('');
  const [fromAccount, setFromAccount] = React.useState(ACCOUNTS[0]);
  const [vat, setVat] = React.useState<string>();
  const set = (key: keyof typeof form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="payment-page">
      <aside className="payment-page__nav">
        <NavigationBar
          hasBackButton
          hasActionButton={false}
          onBackClick={onBack}
          backButtonLabel="Назад"
          title="Платёж по реквизитам"
          items={[
            'Платёж по номеру телефона',
            'Платёж по номеру карты',
            'Перевод между счетами',
            'Валютный платёж',
            'Пополнить счёт',
          ].map((label) => ({ kind: 'link' as const, key: label, label }))}
        />
      </aside>

      <div className="payment-page__content">
        <div className="payment-page__form">
          <button type="button" className="payment-page__recognize hoverOpacity">
            <span className="ts-500-l payment-page__recognize-title">Распознать платёж</span>
            <span className="ts-400-s payment-page__secondary">Фото, 1С или PDF</span>
          </button>

          <div className="payment-page__fields">
            <TabsCarousel
              size="xl"
              className="payment-page__tabs"
              selectedIndex={tab}
              onTabChange={setTab}
              tabs={RECIPIENT_TABS.map((label) => ({ label }))}
            />
            <Input label="ИНН" placeholder="10 или 12 цифр" value={form.inn} onChange={set('inn')} />
            <Input label="Получатель" placeholder="Название контрагента" value={form.recipient} onChange={set('recipient')} />
            <Input label="Номер счёта" placeholder="0000 0000 0000 0000 0000" value={form.account} onChange={set('account')} />
            <Dropdown label="БИК банка" placeholder="Выберите из списка" value={bank}>
              {BANKS.map((b) => (
                <Cell key={b} title={b} verticalPadding="2x" onClick={() => setBank(b)} />
              ))}
            </Dropdown>
            <Input label="Сумма" placeholder="0 ₽" format="currency" value={form.amount} onChange={set('amount')} />
            <Dropdown
              label="Со счёта"
              value={fromAccount}
              right={<Avatar size={32} shape="circle" imageUrl={russiaLogo} label="Расчётный счёт" />}
            >
              {ACCOUNTS.map((a) => (
                <Cell key={a} title={a} verticalPadding="2x" onClick={() => setFromAccount(a)} />
              ))}
            </Dropdown>
            <TextArea
              label="Назначение платежа"
              placeholder="Опишите, за что платите контрагенту. Если есть акт, счёт или договор, укажите его номер, дату и выберите НДС"
              maxLength={210}
              value={form.purpose}
              onChange={set('purpose')}
            />
            <div className="payment-page__vat">
              {VAT.map((v) => (
                <Chip key={v} variant="chip" isSelected={vat === v} onClick={() => setVat(vat === v ? undefined : v)}>
                  {v}
                </Chip>
              ))}
            </div>
          </div>

          <section className="payment-page__send">
            <h2 className="ts-600-xl">Отправить платёжку</h2>
            <Input placeholder="Электронная почта" type="email" value={form.email} onChange={set('email')} />
          </section>

          <AccordeonCell title="Дополнительно" size="xl" chevronPosition="title" hasDescription={false} hasRightAccessory={false}>
            <p className="ts-400-s payment-page__secondary">Код вида дохода, очерёдность платежа и УИН — появятся здесь</p>
          </AccordeonCell>
        </div>

        <Footer
          layout="3-buttons"
          className="payment-page__footer"
          iconAction={{ ariaLabel: 'Ещё действия', icon: <DotsThreeHorizontal /> }}
          secondaryAction={{ label: 'Сохранить на подпись' }}
          primaryAction={{ label: 'Подписать и оплатить' }}
        />
      </div>
    </div>
  );
};
