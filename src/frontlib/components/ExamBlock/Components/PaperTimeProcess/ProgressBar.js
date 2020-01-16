import React, { PureComponent } from 'react';
import styles from './index.less';

/*
    倒计时进度条组件
  * @Author    tina.zhang
  * @DateTime  2018-10-17
  * @param     {[type]}    time          倒计时时长
 */

export default class ProgressBar extends PureComponent {

  state = {
    endTime   : 0,   // 进度条总时长*1000
    addTime   : 0,   // 累计时间 20ms 一累加
    step      : 20,  // 累加的长度
  }

  componentDidMount() {
    const { isPlay, endTime, step=50, startTime=0 } = this.props;

    this.setState({
      endTime : endTime*1000,
      addTime : startTime*1000 || 0, // startTime 初始的秒数，用于已经偶几秒
      step
    },()=>{
      if (isPlay) {
        this.myAutoRun();
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { isPlay : next } = nextProps;
    const { isPlay : current } = this.props
    if( next !== current ){
      if( next ){
        this.myAutoRun();
      }else{
        clearInterval(this.timer);
      }
    }
  }

  componentWillUnmount(){
    clearInterval(this.timer);
  }

  /**
   * 流程定时器
   * @author tina.zhang
   * @DateTime 2018-12-05T11:53:28+0800
   * @return   {[type]}                 [description]
   */
  myAutoRun() {
    const { endTime, addTime, step  } = this.state;
    this.addTime = addTime;
    this.timer = setInterval(() => {
      this.addTime += step;
      this.setState({ addTime: this.addTime })
      if( this.addTime >= endTime ){
        clearInterval(this.timer);
      }
    },step);
  }


  render() {
    const { endTime, addTime } = this.state;
    return (
      <div className={styles.progress}>
        <div className={styles.finishline} style={{ width: `${addTime/endTime*100}%` }} />
      </div>
    );
  }
}
