
CREATE TABLE IF NOT EXISTS t_p4289422_secure_client_auth.employees (
  id VARCHAR(64) PRIMARY KEY,
  identifier VARCHAR(128) UNIQUE NOT NULL,
  password VARCHAR(256) NOT NULL,
  name VARCHAR(256) NOT NULL,
  role VARCHAR(64) NOT NULL DEFAULT 'employee',
  position VARCHAR(256),
  branch VARCHAR(256),
  phone VARCHAR(64),
  email VARCHAR(256),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p4289422_secure_client_auth.clients (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(256) NOT NULL,
  phone VARCHAR(64),
  passport VARCHAR(64),
  email VARCHAR(256),
  address TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p4289422_secure_client_auth.accounts (
  id VARCHAR(64) PRIMARY KEY,
  client_id VARCHAR(64) NOT NULL REFERENCES t_p4289422_secure_client_auth.clients(id),
  number VARCHAR(32) UNIQUE NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'checking',
  currency VARCHAR(8) NOT NULL DEFAULT 'RUB',
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p4289422_secure_client_auth.cards (
  id VARCHAR(64) PRIMARY KEY,
  client_id VARCHAR(64) NOT NULL REFERENCES t_p4289422_secure_client_auth.clients(id),
  account_id VARCHAR(64) REFERENCES t_p4289422_secure_client_auth.accounts(id),
  card_number VARCHAR(32) NOT NULL,
  card_holder VARCHAR(256),
  expiry VARCHAR(8),
  type VARCHAR(16) NOT NULL DEFAULT 'debit',
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p4289422_secure_client_auth.transactions (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(32) NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'RUB',
  from_account VARCHAR(32),
  to_account VARCHAR(32),
  client_id VARCHAR(64),
  client_name VARCHAR(256),
  employee_id VARCHAR(64),
  employee_name VARCHAR(256),
  status VARCHAR(16) NOT NULL DEFAULT 'completed',
  description TEXT,
  okud_code VARCHAR(16),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p4289422_secure_client_auth.credits (
  id VARCHAR(64) PRIMARY KEY,
  client_id VARCHAR(64) NOT NULL REFERENCES t_p4289422_secure_client_auth.clients(id),
  client_name VARCHAR(256),
  account_id VARCHAR(64),
  amount NUMERIC(18,2) NOT NULL,
  rate NUMERIC(6,2) NOT NULL,
  term INTEGER NOT NULL,
  monthly_payment NUMERIC(18,2),
  type VARCHAR(16) NOT NULL DEFAULT 'credit',
  status VARCHAR(16) NOT NULL DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  remaining_amount NUMERIC(18,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p4289422_secure_client_auth.queue_tickets (
  id VARCHAR(64) PRIMARY KEY,
  number VARCHAR(16) NOT NULL,
  code VARCHAR(8) NOT NULL,
  client_name VARCHAR(256),
  client_phone VARCHAR(64),
  operation VARCHAR(128),
  operation_type VARCHAR(32),
  status VARCHAR(16) NOT NULL DEFAULT 'waiting',
  window_num INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  served_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS t_p4289422_secure_client_auth.terminals (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(256) NOT NULL,
  ip_address VARCHAR(64) NOT NULL,
  port INTEGER NOT NULL DEFAULT 8080,
  status VARCHAR(16) NOT NULL DEFAULT 'offline',
  type VARCHAR(64),
  branch VARCHAR(256),
  last_ping TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p4289422_secure_client_auth.operation_logs (
  id SERIAL PRIMARY KEY,
  employee_id VARCHAR(64),
  action VARCHAR(128),
  details JSONB,
  ip_address VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_client ON t_p4289422_secure_client_auth.accounts(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON t_p4289422_secure_client_auth.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON t_p4289422_secure_client_auth.transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_credits_client ON t_p4289422_secure_client_auth.credits(client_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON t_p4289422_secure_client_auth.queue_tickets(status);
CREATE INDEX IF NOT EXISTS idx_cards_client ON t_p4289422_secure_client_auth.cards(client_id);
