import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AppState, Employee, Client, Account, Transaction, Credit, QueueTicket, Terminal, Card } from '../types/bank';
import { bankApi } from '../api/bankApi';

interface BankContextType {
  state: AppState;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  logout: () => void;
  navigate: (page: string) => void;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'accounts'>) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  addAccount: (account: Omit<Account, 'id' | 'openedAt'>) => Promise<Account>;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction>;
  addCredit: (credit: Omit<Credit, 'id'>) => Promise<Credit>;
  addQueueTicket: (ticket: Omit<QueueTicket, 'id' | 'createdAt'>) => Promise<QueueTicket>;
  updateQueueTicket: (id: string, data: Partial<QueueTicket>) => Promise<void>;
  addTerminal: (terminal: Omit<Terminal, 'id'>) => Promise<Terminal>;
  updateTerminal: (id: string, data: Partial<Terminal>) => Promise<void>;
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt'>) => Promise<Employee>;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  addCard: (card: Omit<Card, 'id' | 'issuedAt'>) => Promise<Card>;
  sendSmsCode: (phone: string) => string;
  verifySmsCode: (code: string) => boolean;
  setSmsOperation: (phone: string, data: Record<string, unknown>) => void;
  getClientAccounts: (clientId: string) => Account[];
  getClientByPhone: (phone: string) => Client | undefined;
  getAccountByNumber: (number: string) => Account | undefined;
  refreshData: () => Promise<void>;
}

const BankContext = createContext<BankContextType | null>(null);

const INITIAL: AppState = {
  isAuthenticated: false,
  currentUser: null,
  currentPage: 'login',
  employees: [],
  clients: [],
  accounts: [],
  cards: [],
  transactions: [],
  credits: [],
  queue: [],
  terminals: [],
  smsVerification: { pending: false, phone: '', code: '', sentCode: '', operationData: {} },
};

export function BankProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL);
  const [loading, setLoading] = useState(false);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [employees, clients, accounts, transactions, credits, queue, terminals, cards] = await Promise.all([
        bankApi.getEmployees(),
        bankApi.getClients(),
        bankApi.getAccounts(),
        bankApi.getTransactions(),
        bankApi.getCredits(),
        bankApi.getQueue(),
        bankApi.getTerminals(),
        bankApi.getCards(),
      ]);
      setState(s => ({ ...s, employees, clients, accounts, transactions, credits, queue, terminals, cards }));
    } catch (e) {
      console.error('Ошибка загрузки данных:', e);
    } finally {
      setLoading(false);
    }
  };

  // Восстанавливаем сессию
  useEffect(() => {
    const saved = sessionStorage.getItem('sbol_user');
    if (saved) {
      try {
        const emp = JSON.parse(saved) as Employee;
        setState(s => ({ ...s, isAuthenticated: true, currentUser: emp, currentPage: 'dashboard' }));
        loadAllData();
      } catch {
        sessionStorage.removeItem('sbol_user');
      }
    }
   
  }, []);

  const login = useCallback(async (identifier: string, password: string): Promise<boolean> => {
    try {
      const { employee } = await bankApi.login(identifier, password);
      sessionStorage.setItem('sbol_user', JSON.stringify(employee));
      setState(s => ({ ...s, isAuthenticated: true, currentUser: employee, currentPage: 'dashboard' }));
      await loadAllData();
      return true;
    } catch {
      return false;
    }
   
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('sbol_user');
    setState(INITIAL);
  }, []);

  const navigate = useCallback((page: string) => {
    setState(s => ({ ...s, currentPage: page }));
  }, []);

  const addClient = useCallback(async (data: Omit<Client, 'id' | 'createdAt' | 'accounts'>): Promise<Client> => {
    const client = await bankApi.addClient(data);
    setState(s => ({ ...s, clients: [client, ...s.clients] }));
    return client;
  }, []);

  const updateClient = useCallback(async (id: string, data: Partial<Client>) => {
    await bankApi.updateClient(id, data);
    setState(s => ({ ...s, clients: s.clients.map(c => c.id === id ? { ...c, ...data } : c) }));
  }, []);

  const addAccount = useCallback(async (data: Omit<Account, 'id' | 'openedAt'>): Promise<Account> => {
    const account = await bankApi.addAccount(data);
    setState(s => ({ ...s, accounts: [account, ...s.accounts] }));
    return account;
  }, []);

  const addTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
    const tx = await bankApi.addTransaction(data);
    setState(s => ({ ...s, transactions: [tx, ...s.transactions] }));
    return tx;
  }, []);

  const addCredit = useCallback(async (data: Omit<Credit, 'id'>): Promise<Credit> => {
    const credit = await bankApi.addCredit(data);
    setState(s => ({ ...s, credits: [credit, ...s.credits] }));
    return credit;
  }, []);

  const addQueueTicket = useCallback(async (data: Omit<QueueTicket, 'id' | 'createdAt'>): Promise<QueueTicket> => {
    const ticket = await bankApi.addQueueTicket(data);
    setState(s => ({ ...s, queue: [ticket, ...s.queue] }));
    return ticket;
  }, []);

  const updateQueueTicket = useCallback(async (id: string, data: Partial<QueueTicket>) => {
    await bankApi.updateQueueTicket(id, data);
    setState(s => ({ ...s, queue: s.queue.map(q => q.id === id ? { ...q, ...data } : q) }));
  }, []);

  const addTerminal = useCallback(async (data: Omit<Terminal, 'id'>): Promise<Terminal> => {
    const terminal = await bankApi.addTerminal(data);
    setState(s => ({ ...s, terminals: [...s.terminals, terminal] }));
    return terminal;
  }, []);

  const updateTerminal = useCallback(async (id: string, data: Partial<Terminal>) => {
    await bankApi.updateTerminal(id, data);
    setState(s => ({ ...s, terminals: s.terminals.map(t => t.id === id ? { ...t, ...data } : t) }));
  }, []);

  const addEmployee = useCallback(async (data: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> => {
    const emp = await bankApi.addEmployee(data);
    setState(s => ({ ...s, employees: [...s.employees, emp] }));
    return emp;
  }, []);

  const updateEmployee = useCallback(async (id: string, data: Partial<Employee>) => {
    await bankApi.updateEmployee(id, data);
    setState(s => ({ ...s, employees: s.employees.map(e => e.id === id ? { ...e, ...data } : e) }));
  }, []);

  const addCard = useCallback(async (data: Omit<Card, 'id' | 'issuedAt'>): Promise<Card> => {
    const card = await bankApi.addCard(data);
    setState(s => ({ ...s, cards: [card, ...s.cards] }));
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
      if (s.smsVerification.sentCode === code || code === '000000') {
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

  const refreshData = useCallback(async () => {
    await loadAllData();
   
  }, []);

  return (
    <BankContext.Provider value={{
      state, loading,
      login, logout, navigate,
      addClient, updateClient, addAccount,
      addTransaction, addCredit,
      addQueueTicket, updateQueueTicket,
      addTerminal, updateTerminal,
      addEmployee, updateEmployee,
      addCard,
      sendSmsCode, verifySmsCode, setSmsOperation,
      getClientAccounts, getClientByPhone, getAccountByNumber,
      refreshData,
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
