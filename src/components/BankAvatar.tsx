import React from 'react';
import { Avatar } from '@pluginwoman/t-ds';
import { bankAvatarStyle, bankOf } from '../banks';

interface BankAvatarProps {
  counterparty: string;
  size: 24 | 32 | 40;
}

/** Кружок с логотипом банка контрагента */
export const BankAvatar: React.FC<BankAvatarProps> = ({ counterparty, size }) => {
  const bank = bankOf(counterparty);
  return (
    <span title={bank.name} className="bank-avatar">
      <Avatar size={size} shape="circle" label={bank.mark} style={bankAvatarStyle(bank)} />
    </span>
  );
};
