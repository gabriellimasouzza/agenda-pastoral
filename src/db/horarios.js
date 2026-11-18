import { lerConfig, salvarConfig } from './mensagens';

// Horários dos avisos (formato 'HH:MM'). O padrão é o que o app sempre usou.
export const HORARIOS_PADRAO = {
  vespera: '18:00',      // aniversários e datas importantes, véspera
  dia: '07:00',          // aniversários e datas importantes, no dia
  compromissos: '07:00', // lembrete de compromissos
  pendencias: '07:00',   // aviso diário das pendências
};

export function hhmmParaHM(txt) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(txt || '');
  if (!m) return null;
  const h = Number(m[1]), mi = Number(m[2]);
  if (h > 23 || mi > 59) return null;
  return { h, m: mi };
}

export function formatarHM(h, m) {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export async function lerHorarios() {
  const out = {};
  for (const k of Object.keys(HORARIOS_PADRAO)) {
    const v = await lerConfig(`horario_${k}`);
    out[k] = hhmmParaHM(v) ? v : HORARIOS_PADRAO[k];
  }
  return out;
}

export async function salvarHorario(chave, hhmm) {
  await salvarConfig(`horario_${chave}`, hhmm);
}
