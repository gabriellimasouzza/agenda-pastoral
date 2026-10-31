// Datas sempre no fuso LOCAL do aparelho (formato 'YYYY-MM-DD').
// Não usar toISOString() para isso: ele devolve a data em UTC e, no Brasil,
// depois das 21h já viraria o dia seguinte.

export function dataLocalStr(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function strParaData(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function somarDias(date, dias) {
  const nova = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  nova.setDate(nova.getDate() + dias);
  return nova;
}

export function inicioDoDia(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export const DIAS_SEMANA_NOME = [
  'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado',
];
export const MESES_ABREV = [
  'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ',
];
