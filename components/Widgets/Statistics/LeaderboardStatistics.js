import s from './LeaderboardStatistics.module.css';

export default function LeaderboardStatistics({
  players,
  wins_earned,
  exp_earned,
  levels_earned,
  gold_earned,
}) {

    return (

      //   <span className={s.Countdowncol}>
      //     <span className={s.Countdowncolelement}>
      //         <strong>{wins_earned}</strong>
      //         <span className={s.Countdowncolformat}>{wins_earned === 1 ? 'Win' : 'Wins'}</span>
      //     </span>
      //   </span>

      <div className={s.Countdown}>
      
      <span className={s.Countdowncol}>
        <span className={s.Countdowncolelement}>
          <strong>{players}</strong>
          <span className={s.Countdowncolformat}>{players === 1 ? 'Player' : 'Players'}</span>
        </span>
      </span>
      
        <span className={s.Countdowncol}>
          <span className={s.Countdowncolelement}>
            <strong>{levels_earned}</strong>
            <span className={s.Countdowncolformat}>{levels_earned === 1 ? 'Level Up' : 'Level Ups'}</span>
          </span>
        </span>

        <span className={s.Countdowncol}>
          <span className={s.Countdowncolelement}>
            <strong>{exp_earned}</strong>
            <span className={s.Countdowncolformat}>EXP Earned</span>
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