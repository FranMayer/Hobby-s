import { COLLECTIONS } from './collections';

function escapeCell(val) {
  const s = val == null ? '' : String(val);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCSV(fields, items) {
  const headers = fields.map(f => f.key);
  const headerRow = [...headers, 'wishlist', 'notes', 'createdAt'].join(',');
  const rows = items.map(item =>
    [...headers, 'wishlist', 'notes', 'createdAt']
      .map(k => escapeCell(item[k]))
      .join(',')
  );
  return [headerRow, ...rows].join('\n');
}

function downloadFile(filename, content, mime = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['﻿' + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCollection(collectionId, items) {
  const col = COLLECTIONS[collectionId];
  const csv = toCSV(col.fields, items);
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(`hobbycount_${collectionId}_${date}.csv`, csv);
}

export function exportAll(all) {
  const sections = Object.entries(COLLECTIONS).map(([id, col]) => {
    const items = all[id] ?? [];
    const csv = toCSV(col.fields, items);
    return `### ${col.label} (${col.owner})\n${csv}`;
  });
  const date = new Date().toISOString().slice(0, 10);
  downloadFile(`hobbycount_backup_${date}.csv`, sections.join('\n\n'));
}

export function parseCSV(collectionId, text) {
  const col = COLLECTIONS[collectionId];
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  if (lines.length < 2) throw new Error('Archivo vacío o sin datos');

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const knownKeys = new Set(col.fields.map(f => f.key));

  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCSVLine(lines[i]);
    if (cells.length !== headers.length) continue;
    const item = {};
    headers.forEach((h, idx) => {
      if (knownKeys.has(h) || h === 'wishlist' || h === 'notes') {
        item[h] = cells[idx];
      }
    });
    if (item.wishlist !== undefined) item.wishlist = item.wishlist === 'true';
    items.push(item);
  }
  return items;
}

function splitCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(cur); cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}
