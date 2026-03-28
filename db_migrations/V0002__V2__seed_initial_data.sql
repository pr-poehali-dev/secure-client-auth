
INSERT INTO t_p4289422_secure_client_auth.employees (id, identifier, password, name, role, position, branch, phone, email)
VALUES
  ('emp-001', 'varikabank', 'ural', 'Вадим Иванов', 'senior_operator', 'Старший операционист', 'Головной офис', '+7 (912) 345-67-89', 'v.ivanov@sbol.pro'),
  ('emp-002', 'timasber', '11062014', 'Шевченко Тимофей', 'employee', 'Операционист', 'Головной офис', '+7 (913) 456-78-90', 't.shevchenko@sbol.pro'),
  ('emp-003', 'sber_emp01', 'sber2024', 'Сотрудник Сбер 1', 'employee', 'Операционист', 'Отделение №1', '+7 (900) 111-22-33', 'emp01@sbol.pro'),
  ('emp-004', 'sber_emp02', 'sber2024', 'Сотрудник Сбер 2', 'employee', 'Кассир', 'Отделение №2', '+7 (900) 222-33-44', 'emp02@sbol.pro'),
  ('emp-005', 'sber_emp03', 'sber2024', 'Сотрудник Сбер 3', 'employee', 'Старший кассир', 'Отделение №3', '+7 (900) 333-44-55', 'emp03@sbol.pro'),
  ('emp-006', 'sber_emp04', 'sber2024', 'Сотрудник Сбер 4', 'employee', 'Специалист по кредитам', 'Отделение №4', '+7 (900) 444-55-66', 'emp04@sbol.pro'),
  ('emp-007', 'sber_emp05', 'sber2024', 'Сотрудник Сбер 5', 'employee', 'Менеджер по картам', 'Отделение №5', '+7 (900) 555-66-77', 'emp05@sbol.pro')
ON CONFLICT (id) DO NOTHING;

INSERT INTO t_p4289422_secure_client_auth.clients (id, full_name, phone, passport, email, address, birth_date)
VALUES
  ('cli-001', 'Петров Александр Николаевич', '+7 (916) 234-56-78', '4510 123456', 'petrov@mail.ru', 'г. Москва, ул. Ленина, д. 15, кв. 42', '1985-06-15'),
  ('cli-002', 'Козлова Мария Сергеевна', '+7 (926) 345-67-89', '4511 234567', 'kozlova@gmail.com', 'г. Москва, пр. Мира, д. 88, кв. 15', '1992-11-23'),
  ('cli-003', 'Сидоров Дмитрий Павлович', '+7 (936) 456-78-90', '4512 345678', 'sidorov@yandex.ru', 'г. Москва, ул. Арбат, д. 7, кв. 3', '1978-03-08')
ON CONFLICT (id) DO NOTHING;

INSERT INTO t_p4289422_secure_client_auth.accounts (id, client_id, number, type, currency, balance, is_active)
VALUES
  ('acc-001', 'cli-001', '40817810000000001234', 'checking', 'RUB', 125000.50, TRUE),
  ('acc-002', 'cli-001', '40817810000000005678', 'savings', 'RUB', 350000.00, TRUE),
  ('acc-003', 'cli-002', '40817810000000009012', 'checking', 'RUB', 47500.75, TRUE),
  ('acc-004', 'cli-003', '40817810000000003456', 'checking', 'RUB', 89200.00, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO t_p4289422_secure_client_auth.terminals (id, name, ip_address, port, status, type, branch)
VALUES
  ('term-001', 'Терминал Сбер #1', '192.168.1.101', 8080, 'online', 'Платёжный', 'Головной офис'),
  ('term-002', 'Терминал Сбер #2', '192.168.1.102', 8080, 'offline', 'Платёжный', 'Отделение №1'),
  ('term-003', 'Терминал Сбер #3', '192.168.1.103', 8080, 'online', 'Информационный', 'Отделение №2')
ON CONFLICT (id) DO NOTHING;
