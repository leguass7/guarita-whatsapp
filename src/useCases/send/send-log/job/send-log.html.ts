import { format } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';

import { SendLog } from '../send-log.entity';

export interface MailFailedBody {
  date: Date;
  successLength: number;
  failedList: SendLog[];
  tryingLength?: number;
}

type Row = SendLog & { index: number | string; count?: number };

function row({ to, createdAt, scheduled, message, count, index, eventType }: Row): string {
  const fDate = (d: Date) => {
    const tz = zonedTimeToUtc(d, 'America/Fortaleza');
    return format(tz, 'dd/MM/yyyy HH:mm:ss');
  };
  const props = 'align="left" style="border-bottom:1px dashed #ccc;text-align:left"';
  return `
    <tr>
      <td ${props}>${index}</td>
      <td ${props}>${to}</td>
      <td ${props}>${message}<br/><i>${eventType}</i></td>
      <td ${props}>${fDate(scheduled)}</td>
      <td ${props}>${fDate(createdAt)}</td>
      <td ${props}>${count}</td>
    </tr>
    `;
}

function failedTable(failedList: SendLog[]): string {
  const list = failedList.reduce((acc, log, i) => {
    const found = acc.find(f => f.to === log.to);
    if (found) found.count += 1;
    else {
      const index = acc.length + 1;
      acc.push({ ...log, count: 1, index: `${index}/${i + 1}` });
    }

    return acc;
  }, [] as Row[]);
  return `
   <p>
     <i>Destinat&aacute;rios repetido foram ocultados</i><br />
     Total na lista: <strong>${list.length}</strong>
   </p>
   <table cellpadding="2px" cellspacing="0" style="font-family:'Courier New';font-size: 12px;width:100%;">
     <tr>
       <th align="left">Item/Ordem</th>  
       <th align="left">Destinat&aacute;rio</th>
       <th align="left">Erro</th>
       <th align="left">Agendado em</th>
       <th align="left">Falha em</th>
       <th align="left">Qtde</th>
     </tr>
     ${list.map(row).join(' ')}
   </table>
`;
}

export function buildMailBody({
  date,
  successLength = 0,
  failedList = [],
  tryingLength = 0,
}: MailFailedBody): string {
  const title = `<h2>Relat&oacute;rio de envio de ${format(date, 'dd/MM/yyyy')}</h2>`;
  const subtitle = `
  <p>Enviados com sucesso: <strong>${successLength}</strong><br />
  Total de falhas: <strong>${failedList.length}</strong><br />
  Total de tentativas: <strong>${tryingLength}</strong> (<i>Ainda pode haver envios em processo de tentativa</i>)<br />
  </p>`;
  const body = `
  <!doctype html>
  <html>
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    </head>
    <body>
      ${title} 
      ${subtitle} 
      ${failedList.length ? failedTable(failedList) : '<p>Nenhuma falha registrada.</p>'}
    </body>
  </html>
  `;
  return body;
}
