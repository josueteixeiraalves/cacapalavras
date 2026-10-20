export type LetterStatus = 'correct' | 'present' | 'absent';
export type GameStatus = 'playing' | 'won' | 'lost';

export interface Guess {
  word: string;
  feedback: LetterStatus[];
}

export interface Challenge {
  date: string;
  category: string;
  word: string;
  hint: string;
}

export interface Stats {
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
  totalWins: number;
  lastPlayedDate?: string;
  lastSolvedWord?: string;
}

export const MAX_ATTEMPTS = 6;

export function normalizeWord(value: string): string {
  return value.trim().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLocaleUpperCase('pt-BR');
}

export function evaluateGuess(rawGuess: string, rawAnswer: string): LetterStatus[] {
  const guess = normalizeWord(rawGuess);
  const answer = normalizeWord(rawAnswer);
  if (guess.length !== answer.length) throw new Error('A palavra tem tamanho incorreto.');

  const result: LetterStatus[] = Array(guess.length).fill('absent');
  const remaining: Record<string, number> = {};

  for (const letter of answer) remaining[letter] = (remaining[letter] ?? 0) + 1;

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 'correct';
      remaining[guess[i]]--;
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (result[i] === 'correct') continue;
    if ((remaining[guess[i]] ?? 0) > 0) {
      result[i] = 'present';
      remaining[guess[i]]--;
    }
  }

  return result;
}

const challenges: Omit<Challenge, 'date'>[] = [
  { category: 'Animais', word: 'GATOS', hint: 'Um animal que costuma ronronar.' },
  { category: 'Comida', word: 'MANGA', hint: 'Pode ser uma fruta ou parte de uma camisa.' },
  { category: 'Ciência', word: 'ATOMO', hint: 'Uma unidade muito pequena da matéria.' },
  { category: 'Esportes', word: 'RUGBY', hint: 'Esporte coletivo jogado com uma bola oval.' },
  { category: 'Natureza', word: 'FOLHA', hint: 'Parte de uma planta que costuma ser verde.' },
  { category: 'Objetos', word: 'LAPIS', hint: 'Material escolar usado para escrever.' },
  { category: 'Tecnologia', word: 'PIXEL', hint: 'Pequena unidade de uma imagem digital.' }
];

// A agenda é determinística para o protótipo. Em produção, a palavra deve vir de uma API
// para não ser exposta no JavaScript enviado ao navegador.
export function getDailyChallenge(date = new Date()): Challenge {
  const dateKey = date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0');
  const start = new Date(2026, 9, 20);
  const day = Math.floor((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - start.getTime()) / 86400000);
  const item = challenges[((day % challenges.length) + challenges.length) % challenges.length];
  return { ...item, date: dateKey, word: normalizeWord(item.word) };
}

export function isAllowedWord(raw: string, challenge: Challenge): boolean {
  const word = normalizeWord(raw);
  if (!/^[A-Z]+$/.test(word) || word.length !== challenge.word.length) return false;
  // Lista simples para o protótipo. Substituir por dicionário curado por categoria.
  const allowed = new Set([
    'GATOS','GATOA','MANGA','MANGÁ','ATOMO','ÁTOMO','RUGBY','FOLHA','LAPIS',
    'LÁPIS','PIXEL','TIGRE','PATOA','PATO','CACHO','CACHÊ','CASAS','CARRO','BOLAS',
    'MELAO','MELÃO','BANCO','NINHO','PEDRA','NUVEM','FOLHA','PRAIA','LIVRO','PONTO',
    'JOGOS','TERRA','VENTO','FOGOS','NOITE','SOLAR','COBRA','LEOES','LEÕES','RATOS',
    'PORCO','OVOAS','POTES','PAPEL','MOUSE','TELAS','FONES','DADOS','LINHA','BOTAO',
    'BOTÃO','MOTOR','FRUTA','SABOR','AREIA','PLUMA','PENAS','ARARA','ZEBRA','ONCAS',
    'ONÇAS','URUBU','CAVAL','BICHO','FESTA','SINAL','IDEIA','IDEÍA','NORTE','SULCO'
  ].map(normalizeWord));
  return allowed.has(word);
}

export function updateStats(previous: Stats, won: boolean, date: string, answer: string): Stats {
  if (previous.lastPlayedDate === date) return previous;
  const previousDay = previous.lastPlayedDate ? new Date(previous.lastPlayedDate + 'T12:00:00') : null;
  const currentDay = new Date(date + 'T12:00:00');
  const gap = previousDay ? Math.round((currentDay.getTime() - previousDay.getTime()) / 86400000) : Infinity;
  const currentStreak = gap === 1 ? previous.currentStreak + 1 : 1;
  return {
    currentStreak,
    bestStreak: Math.max(previous.bestStreak, currentStreak),
    totalGames: previous.totalGames + 1,
    totalWins: previous.totalWins + (won ? 1 : 0),
    lastPlayedDate: date,
    lastSolvedWord: won ? answer : previous.lastSolvedWord
  };
}

export function getKeyboardStatuses(guesses: Guess[]): Record<string, LetterStatus> {
  const rank: Record<LetterStatus, number> = { absent: 1, present: 2, correct: 3 };
  const statuses: Record<string, LetterStatus> = {};
  for (const guess of guesses) {
    [...guess.word].forEach((letter, i) => {
      const status = guess.feedback[i];
      if (!statuses[letter] || rank[status] > rank[statuses[letter]]) statuses[letter] = status;
    });
  }
  return statuses;
}