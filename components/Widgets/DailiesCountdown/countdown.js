import React, { Component } from 'react';
import PropTypes from 'prop-types'
import s from './Countdown.module.css';

/**
 * Note : 
 * If you're using react v 15.4 or less
 * You can directly import PropTypes from react instead. 
 * Refer to this : https://reactjs.org/warnings/dont-call-proptypes.html
 */

class Countdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      days: 0,
      hours: 0,
      min: 0,
      sec: 0,
    }
  }

  componentDidMount() {
    // update every second
    this.interval = setInterval(() => {
      const date = this.calculateCountdown(this.props.date);
      date ? this.setState(date) : this.stop();
    }, 1000);
  }

  componentWillUnmount() {
    this.stop();
  }

  calculateCountdown(endDate) {
    let diff = (Date.parse(new Date(endDate)) - Date.parse(new Date())) / 1000;

    // clear countdown when date is reached
    if (diff <= 0) return false;

    const timeLeft = {
      years: 0,
      days: 0,
      hours: 0,
      min: 0,
      sec: 0
    };

    // calculate time difference between now and expected date
    if (diff >= (365.25 * 86400)) { // 365.25 * 24 * 60 * 60
      timeLeft.years = Math.floor(diff / (365.25 * 86400));
      diff -= timeLeft.years * 365.25 * 86400;
    }
    if (diff >= 86400) { // 24 * 60 * 60
      timeLeft.days = Math.floor(diff / 86400);
      diff -= timeLeft.days * 86400;
    }
    if (diff >= 3600) { // 60 * 60
      timeLeft.hours = Math.floor(diff / 3600);
      diff -= timeLeft.hours * 3600;
    }
    if (diff >= 60) {
      timeLeft.min = Math.floor(diff / 60);
      diff -= timeLeft.min * 60;
    }
    timeLeft.sec = diff;

    return timeLeft;
  }

  stop() {
    clearInterval(this.interval);
  }

  addLeadingZeros(value) {
    value = String(value);
    while (value.length < 2) {
      value = '0' + value;
    }
    return value;
  }

  render() {
    const countDown = this.state;
    if(countDown.days == 0 && countDown.hours == 0 && countDown.min == 0 && countDown.sec == 1 ){
      console.log("It's midnight! Refresh the page.")
    }

    return (
      <div className={s.Countdown}>
        {/* <span className={s.Countdowncol}>
          <span className={s.Countdowncolelement}>
              <strong>{this.addLeadingZeros(countDown.days)}</strong>
              <span className={s.Countdowncolformat}>{countDown.days === 1 ? 'Day' : 'Days'}</span>
          </span>
        </span> */}
        
        <div className={s.Countdowndesc}>Bonus Resets...</div>
        <span className={s.Countdowncol}>
          <span className={s.Countdowncolelement}>
            <strong>{this.addLeadingZeros(countDown.hours)}</strong>
            <span className={s.Countdowncolformat}>Hrs</span>
          </span>
        </span>


        <span className={s.Countdowncol}>
          <span className={s.Countdowncolelement}>
            <strong>{this.addLeadingZeros(countDown.min)}</strong>
            <span className={s.Countdowncolformat}>Min</span>
          </span>
        </span>

        <span className={s.Countdowncol}>
          <span className={s.Countdowncolelement}>
            <strong>{this.addLeadingZeros(countDown.sec)}</strong>
            <span className={s.Countdowncolformat}>Sec</span>
          </span>
        </span>
      </div>
    );
  }
}

Countdown.propTypes = {
  date: PropTypes.string.isRequired
};

Countdown.defaultProps = {
  date: new Date()
};

export default Countdown;