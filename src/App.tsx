import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Challenge, GameStatus, Guess, LetterStatus, MAX_ATTEMPTS, Stats,
  evaluateGuess, getDailyChallenge, getKeyboardStatuses, isAllowedWord, normalizeWord, updateStats
} from './game';

const EMPTY_STATS: Stats = { currentStreak: 0, bestStreak: 0, totalGames: 0, totalWins: 0 };
const LETTERS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch { return fallback; }
}

function App() {
  const challenge = useMemo(() => getDailyChallenge(), []);
  const [screen, setScreen] = useState<'home' | 'game' | 'stats'>('home');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [current, setCurrent] = useState('');
  const [status, setStatus] = useState<GameStatus>('playing');
  const [notice, setNotice] = useState('');
  const [stats, setStats] = useState<Stats>(() => readJSON('palaviva:v1:stats', EMPTY_STATS));
  const [finishedToday, setFinishedToday] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = readJSON<{date?: string; guesses?: Guess[]; status?: GameStatus}>('palaviva:v1:game', {});
    if (saved.date === challenge.date) {
      setGuesses(saved.guesses ?? []);
      setStatus(saved.status ?? 'playing');
      setFinishedToday(saved.status === 'won' || saved.status === 'lost');
    }
  }, [challenge.date]);

  useEffect(() => {
    localStorage.setItem('palaviva:v1:game', JSON.stringify({ date: challenge.date, guesses, status }));
  }, [challenge.date, guesses, status]);

  useEffect(() => { localStorage.setItem('palaviva:v1:stats', JSON.stringify(stats)); }, [stats]);

  const keyStatuses = getKeyboardStatuses(guesses);
  const attemptsLeft = MAX_ATTEMPTS - guesses.length;
  const winRate = stats.totalGames ? Math.round((stats.totalWins / stats.totalGames) * 100) : 0;

  function addLetter(letter: string) {
    if (status !== 'playing' || finishedToday) return;
    setCurrent(prev => prev.length < challenge.word.length ? prev + letter : prev);
    setNotice('');
  }

  function removeLetter() {
    if (status !== 'playing' || finishedToday) return;
    setCurrent(prev => prev.slice(0, -1));
  }

  function submitGuess() {
    if (status !== 'playing' || finishedToday) return;
    const word = normalizeWord(current);
    if (word.length !== challenge.word.length) {
      setNotice(`Digite uma palavra com ${challenge.word.length} letras.`);
      return;
    }
    if (!isAllowedWord(word, challenge)) {
      setNotice('Essa palavra não está na lista de palavras permitidas. Tente outra!');
      return;
    }
    if (guesses.some(g => normalizeWord(g.word) === word)) {
      setNotice('Você já tentou essa palavra. Experimente outra!');
      return;
    }

    const feedback = evaluateGuess(word, challenge.word);
    const nextGuesses = [...guesses, { word, feedback }];
    const nextStatus: GameStatus = word === challenge.word ? 'won' : nextGuesses.length >= MAX_ATTEMPTS ? 'lost' : 'playing';
    setGuesses(nextGuesses);
    setCurrent('');
    setNotice('');
    setStatus(nextStatus);

    if (nextStatus !== 'playing') {
      setFinishedToday(true);
      setStats(prev => updateStats(prev, nextStatus === 'won', challenge.date, challenge.word));
    }
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (screen !== 'game' || showHelp || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Enter') { event.preventDefault(); submitGuess(); }
      else if (event.key === 'Backspace' && document.activeElement !== inputRef.current) { event.preventDefault(); removeLetter(); }
      else if (/^[a-zA-Záéíóúâêôãõç]$/.test(event.key) && document.activeElement !== inputRef.current) {
        event.preventDefault(); addLetter(normalizeWord(event.key));
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  function startGame() {
    setScreen('game');
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }

  function makeShareText() {
    const rows = guesses.map(g => g.feedback.map(s => s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬜').join('')).join('\n');
    return `Palaviva · Desafio diário\nTema: ${challenge.category}\nResultado: ${status === 'won' ? guesses.length : 'X'}/${MAX_ATTEMPTS}\n\n${rows}\n\nConsegue descobrir a palavra de hoje?`;
  }

  async function shareResult() {
    const text = makeShareText();
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Meu resultado no Palaviva', text });
        setShareMessage('Resultado compartilhado!');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setShareMessage('Resultado copiado para compartilhar!');
      } else {
        window.prompt('Copie seu resultado:', text);
      }
    } catch {
      setShareMessage('Compartilhamento cancelado ou indisponível.');
    }
  }

  const boardRows = Array.from({ length: MAX_ATTEMPTS }, (_, i) => guesses[i]);
  const answerFeedback: LetterStatus[] = [];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen('home')} aria-label="Palaviva, tela inicial">
          <span className="brand-mark" aria-hidden="true">P</span>
          <span>palaviva<span className="brand-dot">.</span></span>
        </button>
        <nav className="header-actions" aria-label="Menu principal">
          <button className="icon-button" onClick={() => setShowHelp(true)} aria-label="Como jogar" title="Como jogar">?</button>
          <button className="icon-button" onClick={() => setScreen('stats')} aria-label="Estatísticas" title="Estatísticas">▥</button>
        </nav>
      </header>

      <main>
        {screen === 'home' && (
          <section className="home-screen" aria-labelledby="home-title">
            <div className="hero-copy">
              <div className="eyebrow"><span className="sparkle">✦</span> SEU DESAFIO DIÁRIO</div>
              <h1 id="home-title">Uma palavra.<br/><span>Seis chances.</span></h1>
              <p>Descubra a palavra secreta de hoje. Cada tentativa dá uma pista nova!</p>
              <div className="challenge-card">
                <div className="category-icon" aria-hidden="true">{challenge.category === 'Animais' ? '🐾' : challenge.category === 'Comida' ? '🍓' : challenge.category === 'Ciência' ? '🔬' : '🌿'}</div>
                <div className="challenge-meta"><span>O TEMA DE HOJE</span><strong>{challenge.category}</strong></div>
                <div className="letter-count" aria-label={`${challenge.word.length} letras`}>{challenge.word.length}<small>LETRAS</small></div>
              </div>
              <button className="primary-button start-button" onClick={startGame}>Jogar agora <span aria-hidden="true">→</span></button>
              <div className="microcopy"><span aria-hidden="true">◷</span> Leva menos de 3 min <span className="dot-sep">•</span> Grátis e sem cadastro</div>
            </div>
            <div className="hero-art" aria-label="Exemplo de tabuleiro com feedback por cores">
              <div className="floating-star star-one">✦</div><div className="floating-star star-two">✳</div>
              <div className="sample-board">
                <div className="sample-top"><span>EXEMPLO</span><span>01 / 06</span></div>
                {[
                  ['G','A','T','O','S'],
                  ['P','A','T','O','S'],
                  ['M','A','N','G','A']
                ].map((row, ri) => <div className="sample-row" key={ri}>{row.map((l, i) => <div key={i} className={`tile ${ri === 0 && i === 0 ? 'correct' : ri === 0 && i === 2 ? 'present' : ri === 1 && i === 0 ? 'absent' : ri === 2 ? (i < 2 ? 'correct' : 'empty') : 'empty'}`}>{l}</div>)}</div>)}
                <div className="sample-caption"><span className="legend-dot green"></span> Na posição certa <span className="legend-dot yellow"></span> Em outra posição</div>
              </div>
              <div className="art-note"><span>💡</span> Cada cor é uma pista!</div>
            </div>
          </section>
        )}

        {screen === 'game' && (
          <section className="game-screen" aria-labelledby="game-title">
            <div className="game-heading">
              <button className="back-button" onClick={() => setScreen('home')} aria-label="Voltar à tela inicial">←</button>
              <div><div className="eyebrow">DESAFIO DE HOJE</div><h1 id="game-title">{challenge.category}</h1></div>
              <div className="attempt-counter">{Math.max(0, attemptsLeft)} <span>tentativas<br/>restantes</span></div>
            </div>
            <p className="game-instructions">Descubra a palavra de <strong>{challenge.word.length} letras</strong>.</p>
            <div className="game-board" role="group" aria-label="Tabuleiro de seis tentativas">
              {boardRows.map((guess, rowIndex) => (
                <div className="guess-row" key={rowIndex} aria-label={guess ? `Tentativa ${rowIndex + 1}` : `Tentativa ${rowIndex + 1}, vazia`}>
                  {Array.from({ length: challenge.word.length }, (_, colIndex) => {
                    const letter = guess?.word[colIndex] ?? (rowIndex === guesses.length && status === 'playing' ? current[colIndex] ?? '' : '');
                    const tileStatus = guess?.feedback[colIndex];
                    return <div key={colIndex} className={`tile game-tile ${tileStatus ?? (letter ? 'filled' : 'empty')} ${tileStatus ?? ''}`} aria-label={tileStatus ? `${letter}, ${tileStatus === 'correct' ? 'correta e na posição certa' : tileStatus === 'present' ? 'presente em outra posição' : 'ausente'}` : letter ? `Letra ${letter}` : 'Vazio'}>{letter}</div>;
                  })}
                </div>
              ))}
            </div>
            <div className="input-row">
              <label className="visually-hidden" htmlFor="guess-input">Digite sua palavra</label>
              <input
                ref={inputRef}
                id="guess-input"
                className="guess-input"
                value={current}
                onChange={e => { setCurrent(normalizeWord(e.target.value).slice(0, challenge.word.length)); setNotice(''); }}
                onKeyDown={e => { if (e.key === 'Enter') submitGuess(); }}
                maxLength={challenge.word.length}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                disabled={status !== 'playing' || finishedToday}
                placeholder={`Digite ${challenge.word.length} letras`}
                aria-describedby="guess-help"
              />
              <button className="primary-button submit-button" onClick={submitGuess} disabled={status !== 'playing' || finishedToday}>Enviar</button>
            </div>
            <p id="guess-help" className="input-help">Use o teclado da tela ou do seu dispositivo.</p>
            <div className="virtual-keyboard" aria-label="Teclado virtual">
              {LETTERS.map((row, ri) => <div className="keyboard-row" key={ri}>{[...row].map(letter => (
                <button key={letter} className={`key ${keyStatuses[letter] ?? ''}`} onClick={() => addLetter(letter)} disabled={status !== 'playing' || finishedToday} aria-label={`Letra ${letter}`}>{letter}</button>
              ))}{ri === 2 && <><button className="key key-action" onClick={removeLetter} disabled={status !== 'playing' || finishedToday} aria-label="Apagar última letra">⌫</button><button className="key key-action enter-key" onClick={submitGuess} disabled={status !== 'playing' || finishedToday} aria-label="Enviar tentativa">↵</button></>}</div>)}
            </div>
            <div className="notice" role="status" aria-live="polite">{notice}</div>
            {status !== 'playing' && (
              <div className={`result-card ${status}`} role="status">
                <div className="result-icon">{status === 'won' ? '🎉' : '🌱'}</div>
                <div><h2>{status === 'won' ? 'Você conseguiu!' : 'Boa tentativa!'}</h2><p>{status === 'won' ? `Você descobriu em ${guesses.length} ${guesses.length === 1 ? 'tentativa' : 'tentativas'}.` : 'A palavra de hoje era:'} <strong>{challenge.word}</strong></p></div>
                <button className="secondary-button" onClick={shareResult}>Compartilhar</button>
                {shareMessage && <p className="share-message" role="status">{shareMessage}</p>}
              </div>
            )}
            <div className="legend"><span><i className="legend-dot green"></i> Correta</span><span><i className="legend-dot yellow"></i> Em outra posição</span><span><i className="legend-dot gray"></i> Não tem</span></div>
          </section>
        )}

        {screen === 'stats' && (
          <section className="stats-screen" aria-labelledby="stats-title">
            <button className="back-button" onClick={() => setScreen('home')}>← Voltar</button>
            <div className="eyebrow">SEU PROGRESSO</div>
            <h1 id="stats-title">Olha só você! <span>✨</span></h1>
            <p className="stats-intro">Cada desafio é uma chance de aprender algo novo.</p>
            <div className="stats-grid">
              <div className="stat-card"><strong>{stats.currentStreak}</strong><span>🔥 Sequência atual</span></div>
              <div className="stat-card"><strong>{stats.bestStreak}</strong><span>🏆 Melhor sequência</span></div>
              <div className="stat-card"><strong>{stats.totalGames}</strong><span>🎯 Partidas concluídas</span></div>
              <div className="stat-card"><strong>{winRate}%</strong><span>🌟 Taxa de acerto</span></div>
            </div>
            <div className="stats-tip"><span>💡</span><div><strong>Pequenos passos contam!</strong><p>Volte amanhã para manter sua sequência diária.</p></div></div>
            <button className="primary-button" onClick={startGame}>Voltar ao desafio <span aria-hidden="true">→</span></button>
          </section>
        )}
      </main>

      <footer><span>feito para mentes curiosas</span><span>PALAVIVA <b>✦</b> DESAFIO DIÁRIO</span></footer>

      {showHelp && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowHelp(false); }}>
        <section className="help-modal" role="dialog" aria-modal="true" aria-labelledby="help-title">
          <button className="modal-close" onClick={() => setShowHelp(false)} aria-label="Fechar instruções">×</button>
          <div className="modal-icon">🧩</div><h2 id="help-title">Como jogar?</h2>
          <p>Descubra a palavra secreta em até seis tentativas. Todas as tentativas precisam ter {challenge.word.length} letras.</p>
          <ul><li><span className="example-tile correct">A</span> Letra certa no lugar certo.</li><li><span className="example-tile present">B</span> A letra existe, mas está em outro lugar.</li><li><span className="example-tile absent">C</span> Essa letra não aparece na palavra.</li></ul>
          <button className="primary-button" onClick={() => setShowHelp(false)}>Entendi, vamos jogar!</button>
        </section>
      </div>}
    </div>
  );
}

export default App;