import React, { PureComponent } from 'react';
import { countDown } from "@/utils/timeHandle";
import styles from './index.less';

export default class Timer extends PureComponent {
  state = {
    seconds: 0
  }

  componentDidMount() {
    window.interval = setInterval(() => this.tick(), 1000);
  }

  componentWillReceiveProps(nextProps) {
    const { isPlay, callback } = nextProps;
    if (isPlay && !this.props.isPlay) {
      window.interval = setInterval(() => this.tick(), 1000);
    } else if (!isPlay && this.props.isPlay) {
      clearInterval(window.interval);
      callback(this.state.seconds);
    }
  }

  componentWillUnmount() {
    clearInterval(window.interval);
  }


  tick = () => {
    const { seconds } = this.state;
    this.setState({
      seconds: seconds + 1
    })
  }

  render() {
    const {seconds} = this.state;
    return (
      <div className={styles.text_time}>{countDown(seconds)}</div>
    )
  }
}
