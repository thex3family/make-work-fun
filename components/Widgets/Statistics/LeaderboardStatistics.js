import s from './LeaderboardStatistics.module.css';

// These numbers arrive from an async fetch after the component has mounted (and
// after SSR rendered them as 0). react-countup v5 latches its value at mount and
// never reflected the update -- not on prop change, not even on a keyed remount
// -- so the hero numbers sat at 0. Rendering the value directly is correct
// regardless of when the data lands.
const fmt = (n) => Number(n || 0).toLocaleString();

export default function LeaderboardStatistics({
  players,
  wins_earned,
  exp_earned,
  levels_earned,
  gold_earned
}) {
  return (
    //   <span className={s.Countdowncol}>
    //     <span className={s.Countdowncolelement}>
    //         <strong>{wins_earned}</strong>
    //         <span className={s.Countdowncolformat}>{wins_earned === 1 ? 'Win' : 'Wins'}</span>
    //     </span>
    //   </span>

    <div className={`${s.Countdown} overflow-x-auto`}>
      <span className={s.Countdowncol}>
        <span className={s.Countdowncolelement}>
          <strong>
            {fmt(players)}{' '}
            <i className="fas fa-running" />
          </strong>
          <div className={`${s.Countdowncolformat} bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500`}>
            {players === 1 ? 'Player' : 'Players'}
          </div>
        </span>
      </span>

      <span className={s.Countdowncol}>
        <span className={s.Countdowncolelement}>
          <strong>
            {fmt(levels_earned)}{' '}
            <i className="fas fa-angle-double-up" />
          </strong>
          <div className={`${s.Countdowncolformat} bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500`}>
            {levels_earned === 1 ? 'Level Up' : 'Level Ups'}
          </div>
        </span>
      </span>

      <span className={s.Countdowncol}>
        <span className={s.Countdowncolelement}>
          <strong>
            {fmt(exp_earned)}{' '}
            XP
          </strong>
          <div className={`${s.Countdowncolformat} bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-blue-500`}>EXP Earned</div>
        </span>
      </span>

      {/* 
        <span className={s.Countdowncol}>
          <span className={s.Countdowncolelement}>
            <strong>{gold_earned}</strong>
            <span className={s.Countdowncolformat}>Gold</span>
          </span>
        </span> */}
    </div>
  );
}
