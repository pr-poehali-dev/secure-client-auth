const BASE_URL = 'https://functions.poehali.dev/db08fa24-eb72-474a-884f-84d0ab58a84b';

async function request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  const url = `${BASE_URL}/?endpoint=${encodeURIComponent(endpoint)}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json() as T;
  if (!res.ok) {
    const errData = data as { error?: string };
    throw new Error(errData.error || `HTTP ${res.status}`);
  }
  return data;
}

const get = <T>(endpoint: string) => request<T>('GET', endpoint);
const post = <T>(endpoint: string, body: unknown) => request<T>('POST', endpoint, body);
const put = <T>(endpoint: string, body: unknown) => request<T>('PUT', endpoint, body);

export const bankApi = {
  // Auth
  login: (identifier: string, password: string) =>
    post<{ employee: import('../types/bank').Employee }>('auth/login', { identifier, password }),

  // Employees
  getEmployees: () => get<import('../types/bank').Employee[]>('employees'),
  addEmployee: (data: unknown) => post<import('../types/bank').Employee>('employees', data),
  updateEmployee: (id: string, data: unknown) => put<{ ok: boolean }>(`employees/${id}`, data),

  // Clients
  getClients: () => get<import('../types/bank').Client[]>('clients'),
  addClient: (data: unknown) => post<import('../types/bank').Client>('clients', data),
  updateClient: (id: string, data: unknown) => put<{ ok: boolean }>(`clients/${id}`, data),

  // Accounts
  getAccounts: () => get<import('../types/bank').Account[]>('accounts'),
  addAccount: (data: unknown) => post<import('../types/bank').Account>('accounts', data),
  updateBalance: (number: string, delta: number) => put<{ ok: boolean }>(`accounts/balance/${number}`, { delta }),

  // Transactions
  getTransactions: () => get<import('../types/bank').Transaction[]>('transactions'),
  addTransaction: (data: unknown) => post<import('../types/bank').Transaction>('transactions', data),

  // Credits
  getCredits: () => get<import('../types/bank').Credit[]>('credits'),
  addCredit: (data: unknown) => post<import('../types/bank').Credit>('credits', data),

  // Queue
  getQueue: () => get<import('../types/bank').QueueTicket[]>('queue'),
  addQueueTicket: (data: unknown) => post<import('../types/bank').QueueTicket>('queue', data),
  updateQueueTicket: (id: string, data: unknown) => put<{ ok: boolean }>(`queue/${id}`, data),

  // Terminals
  getTerminals: () => get<import('../types/bank').Terminal[]>('terminals'),
  addTerminal: (data: unknown) => post<import('../types/bank').Terminal>('terminals', data),
  updateTerminal: (id: string, data: unknown) => put<{ ok: boolean }>(`terminals/${id}`, data),

  // Cards
  getCards: () => get<import('../types/bank').Card[]>('cards'),
  addCard: (data: unknown) => post<import('../types/bank').Card>('cards', data),
};
