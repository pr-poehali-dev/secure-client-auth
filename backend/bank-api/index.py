"""
АС ЕФС СБОЛ.про — Главный API банковской системы.
Обрабатывает все операции: сотрудники, клиенты, счета, транзакции, кредиты, очередь, терминалы, карты.
"""
import json
import os
import psycopg2
from datetime import datetime, date
import uuid

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p4289422_secure_client_auth')

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
    'Content-Type': 'application/json',
}


def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def ok(data):
    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS_HEADERS, 'body': json.dumps({'error': msg}, ensure_ascii=False)}


def row_to_employee(r):
    return {
        'id': r[0], 'identifier': r[1], 'password': r[2], 'name': r[3],
        'role': r[4], 'position': r[5] or '', 'branch': r[6] or '',
        'phone': r[7] or '', 'email': r[8] or '',
        'createdAt': r[9].isoformat() if r[9] else '',
    }


def row_to_client(r):
    return {
        'id': r[0], 'fullName': r[1], 'phone': r[2] or '', 'passport': r[3] or '',
        'email': r[4] or '', 'address': r[5] or '',
        'birthDate': str(r[6]) if r[6] else '',
        'createdAt': r[7].isoformat() if r[7] else '',
        'accounts': [],
    }


def row_to_account(r):
    return {
        'id': r[0], 'clientId': r[1], 'number': r[2], 'type': r[3],
        'currency': r[4], 'balance': float(r[5]), 'isActive': r[6],
        'openedAt': r[7].isoformat() if r[7] else '',
    }


def row_to_transaction(r):
    return {
        'id': r[0], 'type': r[1], 'amount': float(r[2]), 'currency': r[3],
        'fromAccount': r[4] or '', 'toAccount': r[5] or '',
        'clientId': r[6] or '', 'clientName': r[7] or '',
        'employeeId': r[8] or '', 'employeeName': r[9] or '',
        'status': r[10], 'description': r[11] or '', 'okudCode': r[12] or '',
        'createdAt': r[13].isoformat() if r[13] else '',
    }


def row_to_credit(r):
    return {
        'id': r[0], 'clientId': r[1], 'clientName': r[2] or '',
        'accountId': r[3] or '', 'amount': float(r[4]), 'rate': float(r[5]),
        'term': r[6], 'monthlyPayment': float(r[7]) if r[7] else 0,
        'type': r[8], 'status': r[9],
        'startDate': str(r[10]) if r[10] else '',
        'endDate': str(r[11]) if r[11] else '',
        'remainingAmount': float(r[12]) if r[12] else 0,
        'createdAt': r[13].isoformat() if r[13] else '',
    }


def row_to_queue(r):
    return {
        'id': r[0], 'number': r[1], 'code': r[2],
        'clientName': r[3] or '', 'clientPhone': r[4] or '',
        'operation': r[5] or '', 'operationType': r[6] or '',
        'status': r[7], 'window': r[8],
        'createdAt': r[9].isoformat() if r[9] else '',
        'servedAt': r[10].isoformat() if r[10] else None,
    }


def row_to_terminal(r):
    return {
        'id': r[0], 'name': r[1], 'ipAddress': r[2], 'port': r[3],
        'status': r[4], 'type': r[5] or '', 'branch': r[6] or '',
        'lastPing': r[7].isoformat() if r[7] else '',
    }


def row_to_card(r):
    return {
        'id': r[0], 'clientId': r[1], 'accountId': r[2] or '',
        'cardNumber': r[3], 'cardHolder': r[4] or '',
        'expiry': r[5] or '', 'type': r[6], 'status': r[7],
        'issuedAt': r[8].isoformat() if r[8] else '',
    }


def handler(event: dict, context) -> dict:
    """Главный API банковской системы СБОЛ.про"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    raw_path = event.get('path', '/')
    # Нормализуем путь — убираем первый сегмент (ID функции в прокси)
    parts = [p for p in raw_path.strip('/').split('/') if p]
    if len(parts) == 0:
        path = '/'
    elif len(parts) == 1:
        # Один сегмент — может быть functionId или endpoint
        # Если похоже на endpoint (auth, employees, clients...) — используем как есть
        known = ['auth', 'employees', 'clients', 'accounts', 'transactions', 'credits', 'queue', 'terminals', 'cards']
        if parts[0] in known:
            path = '/' + parts[0]
        else:
            # functionId без sub-path
            path = '/'
    else:
        known = ['auth', 'employees', 'clients', 'accounts', 'transactions', 'credits', 'queue', 'terminals', 'cards']
        if parts[0] in known:
            path = '/' + '/'.join(parts)
        else:
            path = '/' + '/'.join(parts[1:])
    # Также проверяем query param endpoint
    qs = event.get('queryStringParameters') or {}
    if 'endpoint' in qs:
        path = '/' + qs['endpoint'].lstrip('/')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor()
    S = SCHEMA

    try:
        # ===== AUTH =====
        if path == '/auth/login' and method == 'POST':
            ident = body.get('identifier', '')
            pwd = body.get('password', '')
            cur.execute(
                f"SELECT id, identifier, password, name, role, position, branch, phone, email, created_at FROM {S}.employees WHERE identifier = '{ident}' AND password = '{pwd}'"
            )
            row = cur.fetchone()
            if not row:
                return err('Неверный идентификатор или пароль', 401)
            emp = row_to_employee(row)
            # log
            cur.execute(f"INSERT INTO {S}.operation_logs (employee_id, action, details) VALUES ('{emp['id']}', 'login', '{{}}')")
            conn.commit()
            return ok({'employee': emp})

        # ===== EMPLOYEES =====
        elif path == '/employees' and method == 'GET':
            cur.execute(f"SELECT id, identifier, password, name, role, position, branch, phone, email, created_at FROM {S}.employees ORDER BY created_at")
            rows = cur.fetchall()
            return ok([row_to_employee(r) for r in rows])

        elif path == '/employees' and method == 'POST':
            d = body
            eid = d.get('id') or ('emp-' + str(uuid.uuid4())[:8])
            cur.execute(
                f"INSERT INTO {S}.employees (id, identifier, password, name, role, position, branch, phone, email) VALUES ('{eid}', '{d['identifier']}', '{d['password']}', '{d['name']}', '{d.get('role','employee')}', '{d.get('position','')}', '{d.get('branch','')}', '{d.get('phone','')}', '{d.get('email','')}') ON CONFLICT (id) DO NOTHING RETURNING id, identifier, password, name, role, position, branch, phone, email, created_at"
            )
            row = cur.fetchone()
            conn.commit()
            return ok(row_to_employee(row) if row else d)

        elif path.startswith('/employees/') and method == 'PUT':
            eid = path.split('/')[-1]
            d = body
            sets = []
            if 'name' in d: sets.append(f"name = '{d['name']}'")
            if 'position' in d: sets.append(f"position = '{d['position']}'")
            if 'branch' in d: sets.append(f"branch = '{d['branch']}'")
            if 'phone' in d: sets.append(f"phone = '{d['phone']}'")
            if 'email' in d: sets.append(f"email = '{d['email']}'")
            if 'password' in d: sets.append(f"password = '{d['password']}'")
            if sets:
                cur.execute(f"UPDATE {S}.employees SET {', '.join(sets)} WHERE id = '{eid}'")
                conn.commit()
            return ok({'ok': True})

        # ===== CLIENTS =====
        elif path == '/clients' and method == 'GET':
            cur.execute(f"SELECT id, full_name, phone, passport, email, address, birth_date, created_at FROM {S}.clients ORDER BY created_at DESC")
            rows = cur.fetchall()
            clients = [row_to_client(r) for r in rows]
            cur.execute(f"SELECT id, client_id, number, type, currency, balance, is_active, opened_at FROM {S}.accounts WHERE is_active = TRUE")
            accs = [row_to_account(r) for r in cur.fetchall()]
            for c in clients:
                c['accounts'] = [a for a in accs if a['clientId'] == c['id']]
            return ok(clients)

        elif path == '/clients' and method == 'POST':
            d = body
            cid = d.get('id') or ('cli-' + str(uuid.uuid4())[:8])
            bd = f"'{d['birthDate']}'" if d.get('birthDate') else 'NULL'
            cur.execute(
                f"INSERT INTO {S}.clients (id, full_name, phone, passport, email, address, birth_date) VALUES ('{cid}', '{d['fullName']}', '{d.get('phone','')}', '{d.get('passport','')}', '{d.get('email','')}', '{d.get('address','')}', {bd}) RETURNING id, full_name, phone, passport, email, address, birth_date, created_at"
            )
            row = cur.fetchone()
            conn.commit()
            c = row_to_client(row)
            c['accounts'] = []
            return ok(c)

        elif path.startswith('/clients/') and method == 'PUT':
            cid = path.split('/')[-1]
            d = body
            sets = []
            if 'fullName' in d: sets.append(f"full_name = '{d['fullName']}'")
            if 'phone' in d: sets.append(f"phone = '{d['phone']}'")
            if 'passport' in d: sets.append(f"passport = '{d['passport']}'")
            if 'email' in d: sets.append(f"email = '{d['email']}'")
            if 'address' in d: sets.append(f"address = '{d['address']}'")
            if sets:
                cur.execute(f"UPDATE {S}.clients SET {', '.join(sets)} WHERE id = '{cid}'")
                conn.commit()
            return ok({'ok': True})

        # ===== ACCOUNTS =====
        elif path == '/accounts' and method == 'GET':
            cur.execute(f"SELECT id, client_id, number, type, currency, balance, is_active, opened_at FROM {S}.accounts ORDER BY opened_at DESC")
            return ok([row_to_account(r) for r in cur.fetchall()])

        elif path == '/accounts' and method == 'POST':
            d = body
            aid = d.get('id') or ('acc-' + str(uuid.uuid4())[:8])
            cur.execute(
                f"INSERT INTO {S}.accounts (id, client_id, number, type, currency, balance, is_active) VALUES ('{aid}', '{d['clientId']}', '{d['number']}', '{d.get('type','checking')}', '{d.get('currency','RUB')}', {d.get('balance',0)}, TRUE) RETURNING id, client_id, number, type, currency, balance, is_active, opened_at"
            )
            row = cur.fetchone()
            conn.commit()
            return ok(row_to_account(row))

        elif path.startswith('/accounts/balance/') and method == 'PUT':
            acc_num = path.split('/')[-1]
            delta = float(body.get('delta', 0))
            cur.execute(f"UPDATE {S}.accounts SET balance = balance + {delta} WHERE number = '{acc_num}'")
            conn.commit()
            return ok({'ok': True})

        # ===== TRANSACTIONS =====
        elif path == '/transactions' and method == 'GET':
            cur.execute(f"SELECT id, type, amount, currency, from_account, to_account, client_id, client_name, employee_id, employee_name, status, description, okud_code, created_at FROM {S}.transactions ORDER BY created_at DESC LIMIT 500")
            return ok([row_to_transaction(r) for r in cur.fetchall()])

        elif path == '/transactions' and method == 'POST':
            d = body
            tid = d.get('id') or ('txn-' + str(uuid.uuid4())[:8])
            fa = d.get('fromAccount') or ''
            ta = d.get('toAccount') or ''
            cur.execute(
                f"INSERT INTO {S}.transactions (id, type, amount, currency, from_account, to_account, client_id, client_name, employee_id, employee_name, status, description, okud_code) VALUES ('{tid}', '{d['type']}', {d['amount']}, '{d.get('currency','RUB')}', '{fa}', '{ta}', '{d.get('clientId','')}', '{d.get('clientName','')}', '{d.get('employeeId','')}', '{d.get('employeeName','')}', '{d.get('status','completed')}', '{d.get('description','')}', '{d.get('okudCode','')}') RETURNING id, type, amount, currency, from_account, to_account, client_id, client_name, employee_id, employee_name, status, description, okud_code, created_at"
            )
            row = cur.fetchone()
            # update balances
            if d['type'] == 'cashout' and fa:
                cur.execute(f"UPDATE {S}.accounts SET balance = balance - {d['amount']} WHERE number = '{fa}'")
            elif d['type'] == 'cashin' and ta:
                cur.execute(f"UPDATE {S}.accounts SET balance = balance + {d['amount']} WHERE number = '{ta}'")
            elif d['type'] == 'transfer':
                if fa:
                    cur.execute(f"UPDATE {S}.accounts SET balance = balance - {d['amount']} WHERE number = '{fa}'")
                if ta:
                    cur.execute(f"UPDATE {S}.accounts SET balance = balance + {d['amount']} WHERE number = '{ta}'")
            conn.commit()
            return ok(row_to_transaction(row))

        # ===== CREDITS =====
        elif path == '/credits' and method == 'GET':
            cur.execute(f"SELECT id, client_id, client_name, account_id, amount, rate, term, monthly_payment, type, status, start_date, end_date, remaining_amount, created_at FROM {S}.credits ORDER BY created_at DESC")
            return ok([row_to_credit(r) for r in cur.fetchall()])

        elif path == '/credits' and method == 'POST':
            d = body
            cid = 'crd-' + str(uuid.uuid4())[:8]
            cur.execute(
                f"INSERT INTO {S}.credits (id, client_id, client_name, account_id, amount, rate, term, monthly_payment, type, status, start_date, end_date, remaining_amount) VALUES ('{cid}', '{d['clientId']}', '{d.get('clientName','')}', '{d.get('accountId','')}', {d['amount']}, {d['rate']}, {d['term']}, {d.get('monthlyPayment',0)}, '{d.get('type','credit')}', 'active', '{d.get('startDate',str(date.today()))}', '{d.get('endDate',str(date.today()))}', {d.get('remainingAmount', d['amount'])}) RETURNING id, client_id, client_name, account_id, amount, rate, term, monthly_payment, type, status, start_date, end_date, remaining_amount, created_at"
            )
            row = cur.fetchone()
            conn.commit()
            return ok(row_to_credit(row))

        # ===== QUEUE =====
        elif path == '/queue' and method == 'GET':
            cur.execute(f"SELECT id, number, code, client_name, client_phone, operation, operation_type, status, window_num, created_at, served_at FROM {S}.queue_tickets ORDER BY created_at DESC LIMIT 200")
            return ok([row_to_queue(r) for r in cur.fetchall()])

        elif path == '/queue' and method == 'POST':
            d = body
            qid = 'q-' + str(uuid.uuid4())[:8]
            cur.execute(
                f"INSERT INTO {S}.queue_tickets (id, number, code, client_name, client_phone, operation, operation_type, status) VALUES ('{qid}', '{d['number']}', '{d['code']}', '{d.get('clientName','')}', '{d.get('clientPhone','')}', '{d.get('operation','')}', '{d.get('operationType','')}', 'waiting') RETURNING id, number, code, client_name, client_phone, operation, operation_type, status, window_num, created_at, served_at"
            )
            row = cur.fetchone()
            conn.commit()
            return ok(row_to_queue(row))

        elif path.startswith('/queue/') and method == 'PUT':
            qid = path.split('/')[-1]
            d = body
            sets = []
            if 'status' in d: sets.append(f"status = '{d['status']}'")
            if 'window' in d and d['window']: sets.append(f"window_num = {d['window']}")
            if d.get('status') in ('done', 'cancelled'): sets.append(f"served_at = NOW()")
            if sets:
                cur.execute(f"UPDATE {S}.queue_tickets SET {', '.join(sets)} WHERE id = '{qid}'")
                conn.commit()
            return ok({'ok': True})

        # ===== TERMINALS =====
        elif path == '/terminals' and method == 'GET':
            cur.execute(f"SELECT id, name, ip_address, port, status, type, branch, last_ping FROM {S}.terminals ORDER BY name")
            return ok([row_to_terminal(r) for r in cur.fetchall()])

        elif path == '/terminals' and method == 'POST':
            d = body
            tid = 'term-' + str(uuid.uuid4())[:8]
            cur.execute(
                f"INSERT INTO {S}.terminals (id, name, ip_address, port, status, type, branch) VALUES ('{tid}', '{d['name']}', '{d['ipAddress']}', {d.get('port',8080)}, 'offline', '{d.get('type','')}', '{d.get('branch','')}') RETURNING id, name, ip_address, port, status, type, branch, last_ping"
            )
            row = cur.fetchone()
            conn.commit()
            return ok(row_to_terminal(row))

        elif path.startswith('/terminals/') and method == 'PUT':
            tid = path.split('/')[-1]
            d = body
            sets = []
            if 'status' in d: sets.append(f"status = '{d['status']}'")
            sets.append("last_ping = NOW()")
            cur.execute(f"UPDATE {S}.terminals SET {', '.join(sets)} WHERE id = '{tid}'")
            conn.commit()
            return ok({'ok': True})

        # ===== CARDS =====
        elif path == '/cards' and method == 'GET':
            cur.execute(f"SELECT id, client_id, account_id, card_number, card_holder, expiry, type, status, issued_at FROM {S}.cards ORDER BY issued_at DESC")
            return ok([row_to_card(r) for r in cur.fetchall()])

        elif path == '/cards' and method == 'POST':
            d = body
            cardid = 'card-' + str(uuid.uuid4())[:8]
            acc_id = d.get('accountId') or ''
            cur.execute(
                f"INSERT INTO {S}.cards (id, client_id, account_id, card_number, card_holder, expiry, type, status) VALUES ('{cardid}', '{d['clientId']}', '{acc_id}', '{d['cardNumber']}', '{d.get('cardHolder','')}', '{d.get('expiry','')}', '{d.get('type','debit')}', 'active') RETURNING id, client_id, account_id, card_number, card_holder, expiry, type, status, issued_at"
            )
            row = cur.fetchone()
            conn.commit()
            return ok(row_to_card(row))

        else:
            return err(f'Endpoint not found: {method} {path}', 404)

    except Exception as e:
        conn.rollback()
        return err(f'Внутренняя ошибка: {str(e)}', 500)
    finally:
        cur.close()
        conn.close()