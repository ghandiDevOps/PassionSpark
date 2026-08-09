import { toast } from 'sonner';

export function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers  = Object.keys(data[0]);
  const csvRows  = [
    headers.join(';'),
    ...data.map((row) => headers.map((h) => row[h] ?? '').join(';')),
  ];
  const blob = new Blob(['﻿' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success('EXPORT CSV RÉUSSI');
}

export function exportPDF(
  data:     Record<string, unknown>[],
  filename: string,
  title:    string,
) {
  if (!data.length) return;
  void filename; // utilisé dans le nom de fichier à l'impression

  const headers   = Object.keys(data[0]);
  const tableRows = data
    .map(
      (row) =>
        `<tr>${headers
          .map(
            (h) =>
              `<td style="padding:8px 12px;border-bottom:1px solid #333;color:#ccc;font-size:12px;">${row[h] ?? ''}</td>`,
          )
          .join('')}</tr>`,
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&display=swap');
        body  { background:#1a1a1a;color:white;font-family:'Barlow Condensed',sans-serif;padding:40px; }
        h1    { color:#FF7A00;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px; }
        h2    { color:#888;font-size:14px;font-weight:400;margin-bottom:24px;font-family:Inter,sans-serif; }
        table { width:100%;border-collapse:collapse; }
        th    { text-align:left;padding:10px 12px;background:#2a2a2a;color:#FF7A00;font-size:11px;text-transform:uppercase;letter-spacing:.1em;border-bottom:2px solid #FF7A00; }
        .footer { margin-top:40px;padding-top:16px;border-top:1px solid #333;color:#555;font-size:11px;text-align:center;font-family:Inter,sans-serif; }
      </style>
    </head>
    <body>
      <h1>PASSION SPARK — ${title}</h1>
      <h2>Exporté le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</h2>
      <table>
        <thead><tr>${headers.map((h) => `<th>${h.toUpperCase()}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
      <div class="footer">Passion Spark — Vis ta passion. Maintenant.</div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
    toast.success('EXPORT PDF LANCÉ');
  }
}
