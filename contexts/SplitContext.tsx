import createContextHook from '@nkzw/create-context-hook';
import { useState } from 'react';

export interface Person {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  paidBy: string;
  sharedBy: string[];
}

export const [SplitProvider, useSplit] = createContextHook(() => {
  const [people, setPeople] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const resetSplit = () => {
    setPeople([]);
    setExpenses([]);
  };

  return {
    people,
    setPeople,
    expenses,
    setExpenses,
    resetSplit,
  };
});