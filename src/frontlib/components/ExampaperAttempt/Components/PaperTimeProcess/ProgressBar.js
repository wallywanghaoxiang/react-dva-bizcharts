import React, { PureComponent } from 'react';
import styles from './index.less';

/*
    倒计时进度条组件
  * @Author    tina.zhang
  * @DateTime  2018-10-17
  * @param     {[type]}    time          倒计时时长
 */

export default class ProgressBar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      end_time: props.time,
      changing_time: 0,
      averageValue: 0,
    };
  }

  componentDidMount() {
    const { isPlay } = this.props;
    let totaltime = JSON.parse(JSON.stringify(this.state.end_time));
    let averageValue = 300 / (totaltime * 1000);
    this.state.averageValue = averageValue;
    this.changing_time = 0;

    if (isPlay) {
      this.myAutoRun();
    }
  }

  /**
   * 流程定时器
   * @author tina.zhang
   * @DateTime 2018-12-05T11:53:28+0800
   * @return   {[type]}                 [description]
   */
  myAutoRun() {
    this.time = this.state.end_time;
    let totaltime = JSON.parse(JSON.stringify(this.state.end_time));

    this.timer2 = setInterval(() => {
      this.changing_time += 10;
      this.setState({ changing_time: this.changing_time }, () => {
        if (this.state.changing_time >= totaltime * 1000) {
          clearInterval(this.timer2);
        }
      });
    }, 10);
  }

  componentWillReceiveProps(nextProps) {
    const { isPlay } = nextProps;
    if (isPlay != this.props.isPlay) {
      if (isPlay) {
        this.myAutoRun();
      } else {
        clearInterval(this.timer2);
      }
    }
  }

  render() {
    const { averageValue, changing_time } = this.state;
    return (
      <div className={styles.bgline2}>
        <div className={styles.finishline} style={{ width: averageValue * changing_time }} />
      </div>
    );
  }
}
