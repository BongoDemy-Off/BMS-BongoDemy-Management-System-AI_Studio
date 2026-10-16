const fs = require('fs');

let clientContent = fs.readFileSync('src/pages/ClientPortal.tsx', 'utf8');
clientContent = clientContent.replace(/\(n: Notification\) => boolean/g, "(n: ClientNotification) => boolean");
clientContent = clientContent.replace(/\(notif: Notification\)/g, "(notif: ClientNotification)");
clientContent = clientContent.replace(/export type ClientNotification = {/, "export type ClientNotification = {\n  createdAt?: string;");
fs.writeFileSync('src/pages/ClientPortal.tsx', clientContent);

let typeContent = fs.readFileSync('src/types.ts', 'utf8');
typeContent = typeContent.replace(/export type ClientNotification = {/, "export type ClientNotification = {\n  createdAt?: string;");
fs.writeFileSync('src/types.ts', typeContent);

// Fix Clients.tsx
let cl = fs.readFileSync('src/pages/Clients.tsx', 'utf8');
cl = cl.replace(/number \| string \| undefined/g, "any");
fs.writeFileSync('src/pages/Clients.tsx', cl);

let ex = fs.readFileSync('src/pages/Expense.tsx', 'utf8');
ex = ex.replace(/reminders\?: { id: string; date: string; note: string }\[\];/g, "");
fs.writeFileSync('src/pages/Expense.tsx', ex);
