import React, { PureComponent } from 'react';
import styles from './index.less';

/*
    倒计时组件
  * @Author    tina.zhang
  * @DateTime  2018-10-17
  * @param     {[type]}    time          倒计时时长
 */

export default class CountDown extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      end_time: props.time,
    };
  }

  componentDidMount() {
    // let time = this.state.end_time;
    // const timer1 = setInterval(() => {
    //   time -= 1;
    //   this.setState({ end_time: time }, () => {
    //     if (this.state.end_time == 0 || this.state.end_time < 0) {
    //       clearInterval(timer1);
    //     }
    //   });
    // }, 1000);
  }

  componentWillReceiveProps(nextProps) {
    // console.log(nextProps)
  }

  render() {
    const { time } = this.props;
    return (
      <div style={{ width: 90 }}>
        <span className={styles.little_text}>倒计时</span>
        <span className={styles.redtext}>{time}</span>
        <span className={styles.little_text}>秒</span>
      </div>
    );
  }
}
