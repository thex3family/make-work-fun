import s from './LeaderboardStatistics.module.css';
import CountUp from 'react-countup';

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
            <CountUp start={0} end={players} duration={1} separator="," />{' '}
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
            <CountUp start={0} end={levels_earned} duration={1} separator="," />{' '}
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
            <CountUp start={0} end={exp_earned} duration={1} separator="," />{' '}
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
