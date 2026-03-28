export type UserRole = 'employee' | 'client' | 'admin' | 'senior_operator';

export interface Employee {
  id: string;
  identifier: string;
  password: string;
  name: string;
  role: UserRole;
  position: string;
  branch: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface Client {
  id: string;
  fullName: string;
  phone: string;
  passport: string;
  email: string;
  address: string;
  birthDate: string;
  createdAt: string;
  accounts: Account[];
}

export interface Account {
  id: string;
  clientId: string;
  number: string;
  type: 'checking' | 'savings' | 'credit' | 'card';
  currency: string;
  balance: number;
  isActive: boolean;
  openedAt: string;
}

export interface Card {
  id: string;
  clientId: string;
  accountId: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  type: 'debit' | 'credit';
  status: 'active' | 'blocked' | 'pending';
  issuedAt: string;
}

export interface Transaction {
  id: string;
  type: 'cashout' | 'cashin' | 'transfer' | 'credit_issue' | 'card_issue' | 'payment';
  amount: number;
  currency: string;
  fromAccount?: string;
  toAccount?: string;
  clientId?: string;
  clientName?: string;
  employeeId: string;
  employeeName: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  description: string;
  createdAt: string;
  okudCode?: string;
}

export interface Credit {
  id: string;
  clientId: string;
  clientName: string;
  accountId: string;
  amount: number;
  rate: number;
  term: number;
  monthlyPayment: number;
  type: 'credit' | 'installment';
  status: 'active' | 'closed' | 'overdue' | 'pending';
  startDate: string;
  endDate: string;
  remainingAmount: number;
}

export interface QueueTicket {
  id: string;
  number: string;
  code: string;
  clientName?: string;
  clientPhone?: string;
  operation: string;
  operationType: string;
  status: 'waiting' | 'serving' | 'done' | 'cancelled';
  window?: number;
  createdAt: string;
  servedAt?: string;
}

export interface Terminal {
  id: string;
  name: string;
  ipAddress: string;
  port: number;
  status: 'online' | 'offline' | 'error';
  type: string;
  branch: string;
  lastPing: string;
}

export interface AppState {
  isAuthenticated: boolean;
  currentUser: Employee | null;
  currentPage: string;
  employees: Employee[];
  clients: Client[];
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
  credits: Credit[];
  queue: QueueTicket[];
  terminals: Terminal[];
  smsVerification: {
    pending: boolean;
    phone: string;
    code: string;
    sentCode: string;
     
    operationData: Record<string, unknown>;
  };
}