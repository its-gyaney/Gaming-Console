import { useEffect, useRef, useState } from 'react'
import './birdstorm.css'
import './snake-controls.css'

const games = [
  { id: 'snake', icon: '◈', title: 'Neon Snake', tag: 'ARCADE', description: 'Eat, grow, and avoid the edge.', color: '#b5ff45' },
  { id: 'breaker', icon: '▣', title: 'Brick Blitz', tag: 'REFLEX', description: 'Clear the deck in a neon breakout.', color: '#8c6cff' },
  { id: 'memory', icon: '✦', title: 'Pixel Pairs', tag: 'PUZZLE', description: 'Find every matching signal.', color: '#ff6bba' },
]

games.push({ id: 'birdstorm', icon: '●', title: 'Birdstorm 3D', tag: 'SLINGSHOT', description: 'Launch, smash, and rescue the eggs.', color: '#ff9e3d' })

const bestKey = (game) => `arcadia-best-${game}`

function App() {
  const [active, setActive] = useState(null)
  const [sound, setSound] = useState(true)
  const [best, setBest] = useState(() => Object.fromEntries(games.map(g => [g.id, Number(localStorage.getItem(bestKey(g.id))) || 0])))
  const close = () => setActive(null)
  const score = (id, value) => setBest(old => {
    if (value <= old[id]) return old
    localStorage.setItem(bestKey(id), value)
    return { ...old, [id]: value }
  })
  return <main className="shell">
    <nav><a className="brand" href="#top"><span>◉</span> ARCADIA</a><div className="nav-links"><a href="#games">Games</a><a href="#about">About</a><button className="sound" onClick={() => setSound(!sound)} aria-label="toggle sound">{sound ? '♬ ON' : '♬ OFF'}</button></div></nav>
    <section className="hero" id="top">
      <div className="hero-copy"><p className="eyebrow">YOUR BROWSER. YOUR ARCADE.</p><h1>PLAY<br/><i>BEYOND.</i></h1><p className="lead">A pocket-sized game room built for instant play. No downloads, no waiting — just press start.</p><a className="cta" href="#games">EXPLORE GAMES <b>→</b></a></div>
      <div className="orb-wrap"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="arcade-orb"><span>◉</span><small>READY<br/>PLAYER</small></div><div className="spark s1">✦</div><div className="spark s2">✦</div></div>
    </section>
    <section className="games-section" id="games"><div className="section-head"><div><p className="eyebrow">CHOOSE YOUR RUN</p><h2>GAME LIBRARY</h2></div><span>03 GAMES</span></div><div className="game-grid">
      {games.map((game, i) => <article className={'game-card game-' + game.id} key={game.id} style={{ '--accent': game.color }}><div className="card-no">0{i + 1}</div><div className="game-icon">{game.icon}</div><div className="game-info"><p>{game.tag}</p><h3>{game.title}</h3><span>{game.description}</span></div><div className="card-bottom"><strong>BEST {best[game.id].toString().padStart(4, '0')}</strong><button onClick={() => setActive(game.id)}>PLAY <b>→</b></button></div></article>)}
    </div></section>
    <section className="about" id="about"><div className="about-mark">◉</div><div><p className="eyebrow">INSTANT PLAY</p><h2>THE ARCADE,<br/>REIMAGINED.</h2></div><p>Arcadia is a lightweight web gaming console built for any modern browser. Pick a game and jump right in — your high scores stay on this device.</p></section>
    <footer><span>© 2026 ARCADIA</span><span>MADE FOR PLAY</span></footer>
    {active && active !== 'birdstorm' && <GameModal game={active} onClose={close} onScore={score} />}
    {active === 'birdstorm' && <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="game-modal bird-modal"><button className="close" onClick={close}>X</button><Birdstorm onScore={score}/></div></div>}
  </main>
}

function GameModal({ game, onClose, onScore }) {
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="game-modal"><button className="close" onClick={onClose}>×</button>{game === 'snake' && <Snake onScore={onScore}/>} {game === 'breaker' && <Breaker onScore={onScore}/>} {game === 'memory' && <Memory onScore={onScore}/>}</div></div>
}

const dirs = { ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0], w:[0,-1], s:[0,1], a:[-1,0], d:[1,0] }
function Snake({ onScore }) {
  const [snake, setSnake] = useState([[8,8],[7,8],[6,8]])
  const [food, setFood] = useState([13,5])
  const [dir, setDir] = useState([1,0])
  const [running, setRunning] = useState(false)
  const [over, setOver] = useState(false)
  const steer = (next) => setDir(current => next[0] === -current[0] && next[1] === -current[1] ? current : next)
  const reset = () => { setSnake([[8,8],[7,8],[6,8]]); setFood([13,5]); setDir([1,0]); setOver(false); setRunning(true) }
  useEffect(() => { const key = e => { const next = dirs[e.key]; if (!next) return; e.preventDefault(); setDir(d => next[0] === -d[0] && next[1] === -d[1] ? d : next) }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key) }, [])
  useEffect(() => { if (!running || over) return; const timer = setInterval(() => setSnake(old => { const head = [old[0][0] + dir[0], old[0][1] + dir[1]]; if (head[0] < 0 || head[0] > 15 || head[1] < 0 || head[1] > 15 || old.some(([x,y]) => x === head[0] && y === head[1])) { setOver(true); setRunning(false); onScore('snake', (old.length - 3) * 10); return old } const hit = head[0] === food[0] && head[1] === food[1]; const next = [head, ...old]; if (hit) { let f; do { f = [Math.floor(Math.random()*16), Math.floor(Math.random()*16)] } while(next.some(([x,y]) => x === f[0] && y === f[1])); setFood(f) } else next.pop(); return next }), 130); return () => clearInterval(timer) }, [running, over, dir, food, onScore])
  const score = (snake.length - 3) * 10
  return <GameFrame title="NEON SNAKE" subtitle="ARROW KEYS / WASD / TOUCH TO STEER" score={score} onStart={reset} action={running ? 'RESTART' : over ? 'PLAY AGAIN' : 'START GAME'}><div className="snake-board">{Array.from({length:256}, (_,i) => { const x=i%16,y=Math.floor(i/16); const isSnake=snake.some(p=>p[0]===x&&p[1]===y); const isFood=food[0]===x&&food[1]===y; return <i key={i} className={(isSnake?'snake-cell ':'')+(isFood?'food':'')}/> })}</div><div className="snake-touch-controls" aria-label="Snake direction controls"><button className="snake-up" onClick={() => steer([0,-1])} aria-label="Move up">^</button><button onClick={() => steer([-1,0])} aria-label="Move left">&lt;</button><button onClick={() => steer([0,1])} aria-label="Move down">v</button><button onClick={() => steer([1,0])} aria-label="Move right">&gt;</button></div>{over && <div className="game-over">RUN OVER</div>}</GameFrame>
}

function Breaker({ onScore }) {
  const [state, setState] = useState({ paddle: 42, ball: [50, 75, 1.1, -1.25], bricks: Array.from({length:28}, (_,i)=>i), score: 0, live: false, message: 'READY?' })
  const reset = () => setState({ paddle: 42, ball: [50,75,1.1,-1.25], bricks: Array.from({length:28}, (_,i)=>i), score:0, live:true, message:'' })
  useEffect(() => { const move=e => { if(['ArrowLeft','a','ArrowRight','d'].includes(e.key)) {e.preventDefault();setState(s=>({...s,paddle:Math.max(0,Math.min(84,s.paddle+(e.key==='ArrowLeft'||e.key==='a'?-8:8)))}))} };window.addEventListener('keydown',move);return()=>window.removeEventListener('keydown',move)},[])
  useEffect(() => { if(!state.live) return; const tick=setInterval(()=>setState(s=>{let [x,y,dx,dy]=s.ball; x+=dx;y+=dy;if(x<1||x>99)dx*=-1;if(y<1){dy*=-1;y=1}if(y>84&&y<89&&x>=s.paddle&&x<=s.paddle+16)dy=-Math.abs(dy);if(y>100){onScore('breaker',s.score);return{...s,live:false,message:'GAME OVER'}}let hit=-1;for(const b of s.bricks){const bx=(b%7)*14+1,by=Math.floor(b/7)*9+4;if(x>=bx&&x<=bx+12&&y>=by&&y<=by+7){hit=b;dy*=-1;break}}if(hit>=0){const bricks=s.bricks.filter(b=>b!==hit),score=s.score+10;if(!bricks.length){onScore('breaker',score);return{...s,bricks,score,live:false,message:'DECK CLEARED!'}}return{...s,ball:[x,y,dx,dy],bricks,score}}return{...s,ball:[x,y,dx,dy]}}),25);return()=>clearInterval(tick)},[state.live,onScore])
  return <GameFrame title="BRICK BLITZ" subtitle="ARROW KEYS / A D TO MOVE" score={state.score} onStart={reset} action={state.live?'RESTART':state.message==='GAME OVER'?'PLAY AGAIN':'LAUNCH'}><div className="breaker-board">{state.bricks.map(b=><i key={b} className="brick" style={{left:`${(b%7)*14+1}%`,top:`${Math.floor(b/7)*9+4}%`}}/>)}<i className="ball" style={{left:`${state.ball[0]}%`,top:`${state.ball[1]}%`}}/><i className="paddle" style={{left:`${state.paddle}%`}}/>{state.message&&<div className="game-over">{state.message}</div>}</div></GameFrame>
}

const symbols = ['✦','◆','●','▲','✚','☾']
function Memory({ onScore }) { const make = () => [...symbols,...symbols].sort(()=>Math.random()-.5).map((v,i)=>({v,i,open:false,done:false})); const [cards,setCards]=useState(make);const [pick,setPick]=useState([]);const [moves,setMoves]=useState(0);const [locked,setLocked]=useState(false);const [won,setWon]=useState(false);const reset=()=>{setCards(make());setPick([]);setMoves(0);setLocked(false);setWon(false)};const choose=i=>{if(locked||cards[i].open||cards[i].done)return;const next=cards.map(c=>c.i===i?{...c,open:true}:c);const p=[...pick,i];setCards(next);if(p.length===2){setMoves(m=>m+1);setLocked(true);setTimeout(()=>{if(next[p[0]].v===next[p[1]].v){const done=next.map(c=>p.includes(c.i)?{...c,done:true}:c);setCards(done);if(done.every(c=>c.done)){setWon(true);onScore('memory',Math.max(10,200-(moves+1)*10))}}else setCards(next.map(c=>p.includes(c.i)?{...c,open:false}:c));setPick([]);setLocked(false)},550)}else setPick(p)};const score=won?Math.max(10,200-moves*10):0;return <GameFrame title="PIXEL PAIRS" subtitle="MATCH ALL SIX SIGNALS" score={score} onStart={reset} action={won?'PLAY AGAIN':'NEW BOARD'}><div className="memory-board">{cards.map(c=><button key={c.i} className={'memory-card '+((c.open||c.done)?'revealed':'')} onClick={()=>choose(c.i)}>{c.open||c.done?c.v:'?'}</button>)}</div><div className="moves">MOVES: {moves.toString().padStart(2,'0')}</div>{won&&<div className="game-over">SIGNAL FOUND!</div>}</GameFrame> }
function GameFrame({title,subtitle,score,onStart,action,children}) { return <section className="game-frame"><header><div><p className="eyebrow">{subtitle}</p><h2>{title}</h2></div><div className="score">SCORE <b>{score.toString().padStart(4,'0')}</b></div></header><div className="play-area">{children}</div><button className="game-action" onClick={onStart}>{action} <b>→</b></button></section> }

export default App

function Birdstorm({ onScore }) {
  const start = { x: 15, y: 73, vx: 0, vy: 0, flying: false }
  const targets = [{ id: 1, x: 76, y: 73 }, { id: 2, x: 86, y: 73 }, { id: 3, x: 81, y: 57 }]
  const sceneRef = useRef(null)
  const [bird, setBird] = useState(start)
  const [pigs, setPigs] = useState(targets)
  const [ammo, setAmmo] = useState(3)
  const [points, setPoints] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState('PULL BACK TO LAUNCH')
  const [bursts, setBursts] = useState([])
  const reset = () => { setBird(start); setPigs(targets); setAmmo(3); setPoints(0); setDragging(false); setStatus('PULL BACK TO LAUNCH'); setBursts([]) }
  const cursor = (event) => {
    const rect = sceneRef.current.getBoundingClientRect()
    return { x: Math.max(4, Math.min(18, (event.clientX - rect.left) / rect.width * 100)), y: Math.max(48, Math.min(88, (event.clientY - rect.top) / rect.height * 100)) }
  }
  const pull = (event) => { if (!dragging) return; setBird(b => ({ ...b, ...cursor(event) })) }
  const launch = () => {
    if (!dragging) return
    setDragging(false)
    setBird(b => ({ ...b, vx: Math.max(1.25, (15 - b.x) * 0.22), vy: (73 - b.y) * 0.15 - 0.45, flying: true }))
    setStatus('BIRD IN FLIGHT')
  }
  useEffect(() => {
    if (!bird.flying) return
    const timer = setInterval(() => setBird(current => {
      const next = { ...current, x: current.x + current.vx, y: current.y + current.vy, vy: current.vy + 0.095 }
      const hit = pigs.filter(pig => Math.hypot(next.x - pig.x, next.y - pig.y) < 7)
      if (hit.length) {
        const ids = new Set(hit.map(pig => pig.id))
        const remaining = pigs.filter(pig => !ids.has(pig.id))
        const gained = hit.length * 500
        setPigs(remaining)
        setPoints(score => { const total = score + gained; onScore('birdstorm', total); return total })
        setBursts(old => [...old, ...hit.map(pig => ({ ...pig, key: `${pig.id}-${Date.now()}` }))])
        setTimeout(() => setBursts(old => old.slice(hit.length)), 450)
        if (!remaining.length) { setStatus('NEST CLEARED!'); return { ...next, flying: false } }
      }
      if (next.x > 108 || next.y > 103 || next.y < -12) {
        setAmmo(left => { const remaining = left - 1; setStatus(remaining ? 'READY FOR NEXT BIRD' : 'FLOCK EMPTY - RESET'); return remaining })
        return { ...next, flying: false }
      }
      return next
    }), 28)
    return () => clearInterval(timer)
  }, [bird.flying, pigs, onScore])
  const canPull = !bird.flying && ammo > 0 && pigs.length > 0
  return <section className="bird-game">
    <header className="bird-header"><div><p className="eyebrow">SLINGSHOT SHOWDOWN</p><h2>BIRDSTORM <i>3D</i></h2></div><div className="bird-score"><span>HIGH IMPACT</span><b>{points.toString().padStart(4, '0')}</b></div></header>
    <div className="bird-hud"><span className="objective-dot"/> <b>{status}</b><span className="ammo">BIRDS {Array.from({ length: 3 }, (_, i) => <i className={i < ammo ? 'loaded' : ''} key={i}/>)}</span></div>
    <div className="sling-scene" ref={sceneRef} onPointerMove={pull} onPointerUp={launch} onPointerLeave={launch}>
      <div className="sun-glow"/><div className="cloud cloud-one"/><div className="cloud cloud-two"/><div className="ridge ridge-back"/><div className="ridge ridge-front"/><div className="ground-grid"/>
      <div className="slingshot"><i/><b/></div>
      {!bird.flying && <svg className="sling-bands" viewBox="0 0 100 100" preserveAspectRatio="none"><line x1="13" y1="61" x2={bird.x} y2={bird.y}/><line x1="18" y1="67" x2={bird.x} y2={bird.y}/></svg>}
      <button className={'launch-bird ' + (dragging ? 'aiming' : '')} style={{ left: `${bird.x}%`, top: `${bird.y}%` }} onPointerDown={event => { if (!canPull) return; event.currentTarget.setPointerCapture(event.pointerId); setDragging(true); setStatus('AIM FOR THE PIGS') }} aria-label="Pull back the bird to launch"><i/><b/><em/></button>
      <div className="fort"><div className="platform"/><div className="wood-block block-left"/><div className="wood-block block-right"/><div className="wood-block block-top"/><div className="stone-block"/></div>
      {pigs.map(pig => <div className="pig" key={pig.id} style={{ left: `${pig.x}%`, top: `${pig.y}%` }}><i/><b/></div>)}
      {bursts.map(burst => <div className="impact" key={burst.key} style={{ left: `${burst.x}%`, top: `${burst.y}%` }}>+500</div>)}
      <div className="scene-label"><span>01</span> BREAK THE FORT</div>
    </div>
    <div className="bird-controls"><p>DRAG THE RED BIRD BACK, THEN RELEASE TO LAUNCH.</p><button onClick={reset}>RESET LEVEL</button></div>
  </section>
}
