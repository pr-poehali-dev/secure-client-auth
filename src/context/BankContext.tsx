import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppState, Employee, Client, Account, Transaction, Credit, QueueTicket, Terminal, Card } from '../types/bank';
import { EMPLOYEES, CLIENTS, ACCOUNTS, TRANSACTIONS, CREDITS, QUEUE, TERMINALS, CARDS } from '../data/initialData';

const STORAGE_KEY = 'sbol_pro_state';

function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Partial<AppState>;
  } catch { /* ignore */ }
  return {};
}

function saveState(state: AppState) {
  try {
    const toSave = {
      employees: state.employees,
      clients: state.clients,
      accounts: state.accounts,
      transactions: state.transactions,
      credits: state.credits,
      queue: state.queue,
      terminals: state.terminals,
      cards: state.cards,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore */ }
}

interface BankContextType {
  state: AppState;
  login: (identifier: string, password: string) => boolean;
  logout: () => void;
  navigate: (page: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'accounts'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  addAccount: (account: Omit<Account, 'id' | 'openedAt'>) => Account;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Transaction;
  addCredit: (credit: Omit<Credit, 'id'>) => Credit;
  addQueueTicket: (ticket: Omit<QueueTicket, 'id' | 'createdAt'>) => QueueTicket;
  updateQueueTicket: (id: string, data: Partial<QueueTicket>) => void;
  addTerminal: (terminal: Omit<Terminal, 'id'>) => Terminal;
  updateTerminal: (id: string, data: Partial<Terminal>) => void;
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt'>) => Employee;
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  addCard: (card: Omit<Card, 'id' | 'issuedAt'>) => Card;
  sendSmsCode: (phone: string) => string;
  verifySmsCode: (code: string) => boolean;
  setSmsOperation: (phone: string, data: Record<string, unknown>) => void;
  getClientAccounts: (clientId: string) => Account[];
  getClientByPhone: (phone: string) => Client | undefined;
  getAccountByNumber: (number: string) => Account | undefined;
}

const BankContext = createContext<BankContextType | null>(null);

export function BankProvider({ children }: { children: React.ReactNode }) {
  const saved = loadState();

  const [state, setState] = useState<AppState>({
    isAuthenticated: false,
    currentUser: null,
    currentPage: 'login',
    employees: saved.employees || EMPLOYEES,
    clients: saved.clients || CLIENTS,
    accounts: saved.accounts || ACCOUNTS,
    cards: saved.cards || CARDS,
    transactions: saved.transactions || TRANSACTIONS,
    credits: saved.credits || CREDITS,
    queue: saved.queue || QUEUE,
    terminals: saved.terminals || TERMINALS,
    smsVerification: {
      pending: false,
      phone: '',
      code: '',
      sentCode: '',
      operationData: {},
    },
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  const login = useCallback((identifier: string, password: string): boolean => {
    const emp = state.employees.find(
      e => e.identifier === identifier && e.password === password
    );
    if (emp) {
      setState(s => ({ ...s, isAuthenticated: true, currentUser: emp, currentPage: 'dashboard' }));
      return true;
    }
    return false;
  }, [state.employees]);

  const logout = useCallback(() => {
    setState(s => ({ ...s, isAuthenticated: false, currentUser: null, currentPage: 'login' }));
  }, []);

  const navigate = useCallback((page: string) => {
    setState(s => ({ ...s, currentPage: page }));
  }, []);

  const addClient = useCallback((data: Omit<Client, 'id' | 'createdAt' | 'accounts'>): Client => {
    const client: Client = {
      ...data,
      id: 'cli-' + Date.now(),
      createdAt: new Date().toISOString(),
      accounts: [],
    };
    setState(s => ({ ...s, clients: [...s.clients, client] }));
    return client;
  }, []);

  const updateClient = useCallback((id: string, data: Partial<Client>) => {
    setState(s => ({ ...s, clients: s.clients.map(c => c.id === id ? { ...c, ...data } : c) }));
  }, []);

  const addAccount = useCallback((data: Omit<Account, 'id' | 'openedAt'>): Account => {
    const account: Account = {
      ...data,
      id: 'acc-' + Date.now(),
      openedAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, accounts: [...s.accounts, account] }));
    return account;
  }, []);

  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'createdAt'>): Transaction => {
    const tx: Transaction = {
      ...data,
      id: 'txn-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, transactions: [tx, ...s.transactions] }));
    return tx;
  }, []);

  const addCredit = useCallback((data: Omit<Credit, 'id'>): Credit => {
    const credit: Credit = { ...data, id: 'crd-' + Date.now() };
    setState(s => ({ ...s, credits: [...s.credits, credit] }));
    return credit;
  }, []);

  const addQueueTicket = useCallback((data: Omit<QueueTicket, 'id' | 'createdAt'>): QueueTicket => {
    const ticket: QueueTicket = {
      ...data,
      id: 'q-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, queue: [...s.queue, ticket] }));
    return ticket;
  }, []);

  const updateQueueTicket = useCallback((id: string, data: Partial<QueueTicket>) => {
    setState(s => ({ ...s, queue: s.queue.map(q => q.id === id ? { ...q, ...data } : q) }));
  }, []);

  const addTerminal = useCallback((data: Omit<Terminal, 'id'>): Terminal => {
    const terminal: Terminal = { ...data, id: 'term-' + Date.now() };
    setState(s => ({ ...s, terminals: [...s.terminals, terminal] }));
    return terminal;
  }, []);

  const updateTerminal = useCallback((id: string, data: Partial<Terminal>) => {
    setState(s => ({ ...s, terminals: s.terminals.map(t => t.id === id ? { ...t, ...data } : t) }));
  }, []);

  const addEmployee = useCallback((data: Omit<Employee, 'id' | 'createdAt'>): Employee => {
    const emp: Employee = { ...data, id: 'emp-' + Date.now(), createdAt: new Date().toISOString() };
    setState(s => ({ ...s, employees: [...s.employees, emp] }));
    return emp;
  }, []);

  const updateEmployee = useCallback((id: string, data: Partial<Employee>) => {
    setState(s => ({ ...s, employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e) }));
  }, []);

  const addCard = useCallback((data: Omit<Card, 'id' | 'issuedAt'>): Card => {
    const card: Card = { ...data, id: 'card-' + Date.now(), issuedAt: new Date().toISOString() };
    setState(s => ({ ...s, cards: [...s.cards, card] }));
    return card;
  }, []);

  const sendSmsCode = useCallback((phone: string): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setState(s => ({
      ...s,
      smsVerification: { ...s.smsVerification, pending: true, phone, sentCode: code, code: '' },
    }));
    console.log(`[SMS DEBUG] Код для ${phone}: ${code}`);
    return code;
  }, []);

  const verifySmsCode = useCallback((code: string): boolean => {
    let result = false;
    setState(s => {
      if (s.smsVerification.sentCode === code) {
        result = true;
        return { ...s, smsVerification: { ...s.smsVerification, pending: false, code } };
      }
      return s;
    });
    return result;
  }, []);

  const setSmsOperation = useCallback((phone: string, data: Record<string, unknown>) => {
    setState(s => ({
      ...s,
      smsVerification: { ...s.smsVerification, phone, operationData: data },
    }));
  }, []);

  const getClientAccounts = useCallback((clientId: string) => {
    return state.accounts.filter(a => a.clientId === clientId);
  }, [state.accounts]);

  const getClientByPhone = useCallback((phone: string) => {
    return state.clients.find(c => c.phone === phone);
  }, [state.clients]);

  const getAccountByNumber = useCallback((number: string) => {
    return state.accounts.find(a => a.number === number);
  }, [state.accounts]);

  return (
    <BankContext.Provider value={{
      state, login, logout, navigate,
      addClient, updateClient, addAccount,
      addTransaction, addCredit,
      addQueueTicket, updateQueueTicket,
      addTerminal, updateTerminal,
      addEmployee, updateEmployee,
      addCard,
      sendSmsCode, verifySmsCode, setSmsOperation,
      getClientAccounts, getClientByPhone, getAccountByNumber,
    }}>
      {children}
    </BankContext.Provider>
  );
}

export function useBank() {
  const ctx = useContext(BankContext);
  if (!ctx) throw new Error('useBank must be used within BankProvider');
  return ctx;
}
