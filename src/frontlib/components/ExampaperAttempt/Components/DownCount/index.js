import React, { Component } from 'react';
import cs from "classnames";
import styles from "./index.less";
import { formatMessage, defineMessages } from 'umi/locale';

class DownCount extends Component {

  state = {
    time : 5
  }

  componentDidMount(){
    this.downCount();
  }

  // 开始倒计时
  downCount = ()=>{
    setTimeout(()=>{
      const {time} = this.state;
      const newTime = time-1;
      if( newTime >= 0 ){
        this.setState({
          time :newTime
        });
        this.downCount();
      }else{
        // 刷新页面
        window.location.href="/";
      }
    },1000);
  }


  render() {
    const { teacherName } = this.props;
    const { time } = this.state;
    return (
      <div className={styles.content}>
        <span className={cs('iconfont','icon-warning',styles['icon-warning'])} />
        <div className={styles.info}>{formatMessage({id:"app.message.tasktip",defaultMessage:"任务被"})} <span className={styles.tag}>{teacherName}</span> {formatMessage({id:"app.text.stoptip",defaultMessage:"教师终止"})}，{time} {formatMessage({id:"app.text.endtip",defaultMessage:"秒后自动转到考试训练等待页"})}</div>
      </div>
    );
  }
}

export default DownCount;
