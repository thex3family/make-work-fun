import s from './PartyStatistics.module.css';
import CountUp from 'react-countup';

export default function PartyStatistics({
  players,
  exp_earned,
  wins,
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
          <span className={s.Countdowncolformat + ' bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500'}>
            {players === 1 ? 'Player' : 'Players'}
          </span>
        </span>
      </span>

      <span className={s.Countdowncol}>
        <span className={s.Countdowncolelement}>
          <strong>
            <CountUp start={0} end={wins} duration={1} separator="," /> ⚔
          </strong>
          <span className={s.Countdowncolformat + ' bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500'}>
            {wins === 1 ? 'Win Complete' : 'Wins Complete'}
          </span>
        </span>
      </span>

      <span className={s.Countdowncol}>
        <span className={s.Countdowncolelement}>
          <strong>
            <CountUp start={0} end={exp_earned} duration={1} separator="," /> XP
          </strong>
          <span className={s.Countdowncolformat + ' bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-pink-500'}>
            EXP Earned</span>
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
