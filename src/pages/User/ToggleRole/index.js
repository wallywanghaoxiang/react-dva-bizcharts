import React, { PureComponent } from "react";
import router from "umi/router";
import {delay} from "@/utils/utils";
import logo from '@/assets/logo_icon.png';
import bg from './assets/browser_version_page_bg.png';
import pic from "./assets/auto_jump_page_pic.png";
import styles from "./index.less";

class ToggleRole extends PureComponent{

  state={
    time : 5
  };

  componentDidMount(){
    this.countDown();
  }

  // 更改 setState
  setStatePromise = (state)=>new Promise(resolve=>this.setState(state,resolve));

  // 开始倒计时
  countDown = async ()=>{
    const { time } = this.state;
    if( time > 0 ){
      await delay(1000);
      await this.setStatePromise({time:time-1});
      this.countDown();
    }else{
      router.replace("/")
    }
  }

  render(){
    const { time } = this.state;
    return (
      <div className={styles.body} style={{backgroundImage:`url(${bg})`}}>
        <div className={styles.header}>
          <div className={styles.logo} style={{backgroundImage:`url(${logo})`}} />
        </div>
        <div className={styles.connect}>
          <div className={styles.pic} style={{backgroundImage:`url(${pic})`}} />
          <div className={styles.title}>
            检测到您的登录身份发生变化
          </div>
          <div className={styles.countdown}>
            <span className={styles.tag}>{time}</span> 秒中后自动跳转到主页
          </div>
        </div>
      </div>
    )
  }
}


export default ToggleRole;
