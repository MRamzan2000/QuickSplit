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

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}