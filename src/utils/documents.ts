import type { Transaction } from '../types/bank';

export function generateQueueTicket(params: {
  number: string;
  code: string;
  operation: string;
  clientName?: string;
  date: string;
}) {
  const { number, code, operation, clientName, date } = params;
  const dt = new Date(date);
  const dateStr = dt.toLocaleDateString('ru-RU');
  const timeStr = dt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
  <title>Талон очереди ${number}</title>
  <style>
    body { font-family: 'Courier New', monospace; margin: 0; padding: 20px; background: #fff; }
    .ticket { width: 280px; border: 2px dashed #21A038; border-radius: 12px; padding: 20px; margin: 0 auto; }
    .logo { font-size: 11px; color: #6B7280; text-align: center; margin-bottom: 8px; }
    .bank { font-size: 14px; font-weight: bold; text-align: center; color: #1C3B2A; margin-bottom: 16px; }
    .num { font-size: 48px; font-weight: 900; text-align: center; color: #21A038; line-height: 1; margin-bottom: 4px; }
    .code { font-size: 12px; text-align: center; color: #9CA3AF; letter-spacing: 2px; margin-bottom: 16px; }
    .op { font-size: 13px; font-weight: bold; text-align: center; color: #1A1A2E; margin-bottom: 8px; padding: 8px; background: #E8F5EC; border-radius: 6px; }
    .client { font-size: 11px; color: #6B7280; text-align: center; margin-bottom: 8px; }
    .dt { font-size: 11px; color: #9CA3AF; text-align: center; border-top: 1px dashed #E5E7EB; padding-top: 12px; margin-top: 4px; }
    .footer { font-size: 9px; color: #D1D5DB; text-align: center; margin-top: 8px; }
    @media print { body { padding: 0; } }
  </style></head>
  <body>
    <div class="ticket">
      <div class="logo">АС ЕФС СБОЛ.про</div>
      <div class="bank">ПАО Сбербанк</div>
      <div class="num">${number}</div>
      <div class="code">${code}</div>
      <div class="op">${operation}</div>
      ${clientName ? `<div class="client">${clientName}</div>` : ''}
      <div class="dt">${dateStr} • ${timeStr}</div>
      <div class="footer">Сохраните талон до окончания обслуживания</div>
    </div>
    <script>window.onload = () => { window.print(); }</script>
  </body></html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `talion_${number}_${code}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateOKUD0402009(tx: Transaction & { clientName: string; clientPassport?: string; accountNumber: string; cashierName: string }) {
  const dt = new Date(tx.createdAt);
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
  <title>ОКУД 0402009 — Расходный кассовый ордер</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
    h2 { font-size: 13px; text-align: center; margin-bottom: 4px; }
    .sub { text-align: center; color: #666; font-size: 10px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    td, th { border: 1px solid #000; padding: 4px 6px; }
    th { background: #f0f0f0; font-weight: bold; text-align: center; }
    .row { display: flex; gap: 16px; margin-bottom: 8px; }
    .field { flex: 1; }
    .label { font-size: 9px; color: #666; }
    .value { border-bottom: 1px solid #000; min-height: 18px; padding: 2px 4px; font-weight: bold; }
    .signature { margin-top: 24px; display: flex; justify-content: space-between; }
    .sign-line { border-top: 1px solid #000; width: 160px; text-align: center; padding-top: 2px; font-size: 9px; color: #666; }
    .okud { position: absolute; top: 20px; right: 20px; font-size: 10px; border: 1px solid #000; padding: 4px 8px; }
  </style></head>
  <body style="position:relative">
    <div class="okud">ОКУД 0402009</div>
    <h2>РАСХОДНЫЙ КАССОВЫЙ ОРДЕР</h2>
    <div class="sub">Форма по ОКУД 0402009 | ПАО Сбербанк</div>
    <table>
      <tr><th>Дата</th><th>Номер документа</th><th>Сумма (цифрами)</th><th>Код валюты</th></tr>
      <tr>
        <td>${dt.toLocaleDateString('ru-RU')}</td>
        <td>${tx.id.toUpperCase()}</td>
        <td>${tx.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} руб.</td>
        <td>RUB (810)</td>
      </tr>
    </table>
    <div class="row">
      <div class="field"><div class="label">Получатель</div><div class="value">${tx.clientName}</div></div>
      <div class="field"><div class="label">Номер счёта</div><div class="value">${tx.accountNumber}</div></div>
    </div>
    <div class="row">
      <div class="field"><div class="label">Паспорт / Документ</div><div class="value">${tx.clientPassport || '—'}</div></div>
      <div class="field"><div class="label">Основание</div><div class="value">Выдача наличных по счёту клиента</div></div>
    </div>
    <div class="row">
      <div class="field"><div class="label">Сумма прописью</div><div class="value">${numberToWords(tx.amount)} рублей</div></div>
    </div>
    <div class="row">
      <div class="field"><div class="label">Кассир</div><div class="value">${tx.cashierName}</div></div>
      <div class="field"><div class="label">Время операции</div><div class="value">${dt.toLocaleTimeString('ru-RU')}</div></div>
    </div>
    <div class="signature">
      <div><div class="sign-line">Подпись получателя</div></div>
      <div><div class="sign-line">Подпись кассира</div></div>
      <div><div class="sign-line">Контролёр</div></div>
    </div>
    <p style="font-size:9px;color:#999;margin-top:16px;text-align:center">АС ЕФС СБОЛ.про • Документ сформирован автоматически • ${dt.toLocaleString('ru-RU')}</p>
    <script>window.onload = () => { window.print(); }</script>
  </body></html>`;
  downloadHtml(html, `OKUD_0402009_${tx.id}.html`);
}

export function generateOKUD0402008(tx: Transaction & { clientName: string; clientPassport?: string; accountNumber: string; cashierName: string }) {
  const dt = new Date(tx.createdAt);
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
  <title>ОКУД 0402008 — Приходный кассовый ордер</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
    h2 { font-size: 13px; text-align: center; margin-bottom: 4px; }
    .sub { text-align: center; color: #666; font-size: 10px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    td, th { border: 1px solid #000; padding: 4px 6px; }
    th { background: #f0f0f0; font-weight: bold; text-align: center; }
    .row { display: flex; gap: 16px; margin-bottom: 8px; }
    .field { flex: 1; }
    .label { font-size: 9px; color: #666; }
    .value { border-bottom: 1px solid #000; min-height: 18px; padding: 2px 4px; font-weight: bold; }
    .signature { margin-top: 24px; display: flex; justify-content: space-between; }
    .sign-line { border-top: 1px solid #000; width: 160px; text-align: center; padding-top: 2px; font-size: 9px; color: #666; }
    .okud { position: absolute; top: 20px; right: 20px; font-size: 10px; border: 1px solid #000; padding: 4px 8px; }
  </style></head>
  <body style="position:relative">
    <div class="okud">ОКУД 0402008</div>
    <h2>ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР</h2>
    <div class="sub">Форма по ОКУД 0402008 | ПАО Сбербанк</div>
    <table>
      <tr><th>Дата</th><th>Номер документа</th><th>Сумма (цифрами)</th><th>Код валюты</th></tr>
      <tr>
        <td>${dt.toLocaleDateString('ru-RU')}</td>
        <td>${tx.id.toUpperCase()}</td>
        <td>${tx.amount.toLocaleString('ru-RU', { minimumFractionDigits: 2 })} руб.</td>
        <td>RUB (810)</td>
      </tr>
    </table>
    <div class="row">
      <div class="field"><div class="label">Вноситель</div><div class="value">${tx.clientName}</div></div>
      <div class="field"><div class="label">Номер счёта</div><div class="value">${tx.accountNumber}</div></div>
    </div>
    <div class="row">
      <div class="field"><div class="label">Паспорт / Документ</div><div class="value">${tx.clientPassport || '—'}</div></div>
      <div class="field"><div class="label">Основание</div><div class="value">Взнос наличных на счёт клиента</div></div>
    </div>
    <div class="row">
      <div class="field"><div class="label">Сумма прописью</div><div class="value">${numberToWords(tx.amount)} рублей</div></div>
    </div>
    <div class="row">
      <div class="field"><div class="label">Кассир</div><div class="value">${tx.cashierName}</div></div>
      <div class="field"><div class="label">Время операции</div><div class="value">${dt.toLocaleTimeString('ru-RU')}</div></div>
    </div>
    <div class="signature">
      <div><div class="sign-line">Подпись вносителя</div></div>
      <div><div class="sign-line">Подпись кассира</div></div>
      <div><div class="sign-line">Контролёр</div></div>
    </div>
    <p style="font-size:9px;color:#999;margin-top:16px;text-align:center">АС ЕФС СБОЛ.про • Документ сформирован автоматически • ${dt.toLocaleString('ru-RU')}</p>
    <script>window.onload = () => { window.print(); }</script>
  </body></html>`;
  downloadHtml(html, `OKUD_0402008_${tx.id}.html`);
}

export function generateCreditCheck(params: {
  clientName: string; passport: string; account: string;
  amount: number; rate: number; term: number; monthlyPayment: number;
  type: string; employeeName: string;
}) {
  const dt = new Date();
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
  <title>Чек — ${params.type}</title>
  <style>
    body { font-family: 'Courier New', monospace; font-size: 11px; margin: 20px; }
    .check { width: 320px; margin: 0 auto; border: 1px solid #ccc; padding: 16px; border-radius: 4px; }
    h3 { text-align: center; margin: 0 0 8px; font-size: 13px; }
    .line { display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 4px 0; }
    .total { font-weight: bold; font-size: 14px; }
  </style></head>
  <body><div class="check">
    <h3>АС ЕФС СБОЛ.про</h3>
    <div style="text-align:center;font-size:10px;color:#666;margin-bottom:12px">ПАО Сбербанк • ${dt.toLocaleString('ru-RU')}</div>
    <div class="line"><span>Операция:</span><span>${params.type}</span></div>
    <div class="line"><span>Клиент:</span><span>${params.clientName}</span></div>
    <div class="line"><span>Паспорт:</span><span>${params.passport}</span></div>
    <div class="line"><span>Счёт/карта:</span><span>${params.account.slice(-8)}</span></div>
    <div class="line total"><span>Сумма:</span><span>${params.amount.toLocaleString('ru-RU')} ₽</span></div>
    <div class="line"><span>Ставка:</span><span>${params.rate}% годовых</span></div>
    <div class="line"><span>Срок:</span><span>${params.term} мес.</span></div>
    <div class="line"><span>Ежемес. платёж:</span><span>${params.monthlyPayment.toLocaleString('ru-RU')} ₽</span></div>
    <div class="line"><span>Сотрудник:</span><span>${params.employeeName}</span></div>
    <div style="text-align:center;margin-top:12px;font-size:9px;color:#999">Чек действителен при наличии печати банка</div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
  </body></html>`;
  downloadHtml(html, `credit_check_${Date.now()}.html`);
}

export function generateTransferCheck(params: {
  fromAccount: string; toAccount: string; amount: number;
  clientName: string; employeeName: string;
}) {
  const dt = new Date();
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
  <title>Чек перевода</title>
  <style>
    body { font-family: 'Courier New', monospace; font-size: 11px; margin: 20px; }
    .check { width: 320px; margin: 0 auto; border: 1px solid #ccc; padding: 16px; border-radius: 4px; }
    h3 { text-align: center; margin: 0 0 8px; font-size: 13px; }
    .line { display: flex; justify-content: space-between; border-bottom: 1px dotted #ccc; padding: 4px 0; }
    .total { font-weight: bold; font-size: 14px; }
  </style></head>
  <body><div class="check">
    <h3>АС ЕФС СБОЛ.про</h3>
    <div style="text-align:center;font-size:10px;color:#666;margin-bottom:12px">ПАО Сбербанк • ${dt.toLocaleString('ru-RU')}</div>
    <div class="line"><span>Операция:</span><span>Перевод</span></div>
    <div class="line"><span>Клиент:</span><span>${params.clientName}</span></div>
    <div class="line"><span>Со счёта:</span><span>...${params.fromAccount.slice(-6)}</span></div>
    <div class="line"><span>На счёт:</span><span>...${params.toAccount.slice(-6)}</span></div>
    <div class="line total"><span>Сумма:</span><span>${params.amount.toLocaleString('ru-RU')} ₽</span></div>
    <div class="line"><span>Статус:</span><span>✓ Выполнено</span></div>
    <div class="line"><span>Сотрудник:</span><span>${params.employeeName}</span></div>
    <div style="text-align:center;margin-top:12px;font-size:9px;color:#999">Чек действителен при наличии печати банка</div>
  </div>
  <script>window.onload = () => { window.print(); }</script>
  </body></html>`;
  downloadHtml(html, `transfer_check_${Date.now()}.html`);
}

function downloadHtml(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function numberToWords(n: number): string {
  const ones = ['', 'один', 'два', 'три', 'четыре', 'пять', 'шесть', 'семь', 'восемь', 'девять',
    'десять', 'одиннадцать', 'двенадцать', 'тринадцать', 'четырнадцать', 'пятнадцать',
    'шестнадцать', 'семнадцать', 'восемнадцать', 'девятнадцать'];
  const tens = ['', '', 'двадцать', 'тридцать', 'сорок', 'пятьдесят', 'шестьдесят', 'семьдесят', 'восемьдесят', 'девяносто'];
  const hundreds = ['', 'сто', 'двести', 'триста', 'четыреста', 'пятьсот', 'шестьсот', 'семьсот', 'восемьсот', 'девятьсот'];
  if (n === 0) return 'ноль';
  const int = Math.floor(n);
  if (int >= 1000000) return `${numberToWords(Math.floor(int / 1000000))} миллионов ${numberToWords(int % 1000000)}`;
  if (int >= 1000) return `${numberToWords(Math.floor(int / 1000))} тысяч ${numberToWords(int % 1000)}`;
  let result = '';
  if (int >= 100) result += hundreds[Math.floor(int / 100)] + ' ';
  const rem = int % 100;
  if (rem < 20) result += ones[rem];
  else result += tens[Math.floor(rem / 10)] + ' ' + ones[rem % 10];
  return result.trim();
}
