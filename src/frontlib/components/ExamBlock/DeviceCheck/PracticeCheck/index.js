/*
 * @Author: tina.zhang
 * @Date: 2019-01-05 11:47:08
 * @LastEditors: tina.zhang
 * @LastEditTime: 2019-03-28 18:06:00
 * @Description: 任务类型为练习的时候进行设备自检
 *
 * this.props = {
 *  checkItems : ['computerAi','earphone','microphone']   // 要检测的对象，已经相应的检测顺序
 * }
 *
 */
import React,{Component} from "react";
import {connect} from "dva";
import {Button,Icon,message} from "antd";
import cs from "classnames";
import { formatMessage } from 'umi/locale';
import delay from "@/frontlib/utils/delay";
import WaveImage from "../Components/Wave";
import PopEarSetting from "../Components/EarSetting/PopEarSetting";
import styles from "./index.less";


@connect(({examBlock})=>{
  const { envState:{player,recorder}, taskModel } = examBlock;
  return {
    player,         // 能否放音
    recorder,        // 能否录音
    taskModel
  }
})
class PracticeCheck extends Component{

  // 是否在检测中
  checking = false;

  // 麦克风音量（初始时候的值）
  micphoneVolume = "";

  // 耳机音量（初始时候的值）
  earphoneVolume = "";

  // 检测的对象
  checkItems=['computerAi','earphone','microphone'];

  // 检测状态
  state={
    computerAi   : "",     // ai 检测    checking : 检测中   success : 检测成功  fail : 检测失败
    earphone     : "",     // 耳机检测
    microphone   : "",     // 麦克风检测
    checking     : false   // 是否在测试中
  }

  constructor(props){
    super(props);
    const { checkItems } = props;
    this.checkItems = checkItems || this.checkItems;
  }

  componentDidMount(){
    // 开始检测
    this.beginCheck();
  }

  /**
   * @description: 开始设备检测
   * @param {type}
   * @return:
   */
  beginCheck = async ()=>{

    const { checking } = this.state;
    if( checking ) return;

    message.destroy();

    const {dispatch} = this.props;
    dispatch({
      type : "examBlock/checkEarAndMicphoneStatus",
    });

    // 记录测试中的状态
    this.changeState("loading");
    this.setState({ checking : true });

    // 还原初始状态
    this.setState({
      computerAi : "",
      earphone   : "",
      microphone : "",
    });

    // 开始进行设备检查
    try{
      await this.checkItems.reduce(async(promise,item)=>{
        await promise;
        if( item === "computerAi" ){
          await this.checkComputerAi();
        }
        if( item === "earphone" ){
          await this.checkEarphone();
        }
        if( item === "microphone" ){
          await this.checkMicrophone();
        }
        await delay(500);
      },Promise.resolve());
    }catch(err){
      // 设备检测失败
      this.changeState("fail");
    }
    this.setState({ checking : false });
  }

  /**
   * @description: 检验评分引擎
   * @param {type}
   * @return:
   */
  checkComputerAi = async ()=>{
    const { dispatch } = this.props;
    // 开始检测
    this.setState({ computerAi : "checking" });
    // 为了效果延迟1秒
    const result = await dispatch({
      type : "examBlock/checkComputerAi"
    });
    this.setState({ computerAi : result?"success":"fail" });
    if( !result ){
      throw String("评分引擎检测失败");
    }
  }

  /**
   * @description: 检验耳机
   * @param {type}
   * @return:
   */
  checkEarphone = async ()=>{
    // 开始检测
    this.setState({ earphone : "checking" });
    // 为了效果延迟1秒
    await delay(2000);
    const { player: result, taskModel } = this.props;
    this.setState({ earphone : result?"success":"fail" });
    if( !result ){
      if( taskModel === "brower" ){
        message.warning(formatMessage({id:"app.text.lost.audiooutput.device",defaultMessage:"请检查是否有放音设备，以及浏览器是否禁用！"}));
      }
      throw String("耳机检测失败");
    }
  }

  /**
   * @description: 检验麦克风
   * @param {type}
   * @return:
   */
  checkMicrophone = async ()=>{
    // 开始检测
    this.setState({ microphone : "checking" });
    // 为了效果延迟1秒
    await delay(2000);
    const { recorder: result, taskModel } = this.props;
    this.setState({ microphone : result?"success":"fail" });
    if( !result ){
      if( taskModel === "brower" ){
        message.warn(formatMessage({id:"app.text.lose.audioinput.device",defaultMessage:"请检查是否有录音设备，以及浏览器是否禁用！"}));
      }
      throw String("麦克风检测失败");
    }
  }

  /**
   * @description: 状态更新
   * @param {Boolean} state : loading 测试中， succes： 测试成功 fail 测试失败
   */
  changeState=(state)=>{
    const { dispatch, onChange } = this.props;
    dispatch({
      type : "examBlock/updateState",
      playload : {
        deviceCheckState : state
      }
    });
    if( typeof(onChange) === "function" ){
      onChange(state);
    }
  }


  /**
   * 进入练习事件
   */
  enterPractice = ()=>{
    //  发送检测成功
    this.changeState("success");
  }


  /**
   * @description: 显示不同的检测模块的具体逻辑样式
   * @param {type}
   * @return:
   */
  renderCheckStatus = ()=>{
    const { computerAi, earphone, microphone } = this.state;

    const modals = [
      {
        type   : "computerAi",
        title  : formatMessage({id:"app.assessment.engine",defaultMessage:"评分引擎"}),
        avator : "icon-computer-ai",
        status : computerAi
      },{
        type   : "earphone",
        title  : formatMessage({id:"app.text.earphone",defaultMessage:"耳机"}),
        avator : "icon-earphone",
        status : earphone
      },{
        type   : "microphone",
        title  : formatMessage({id:"app.text.microphone",defaultMessage:"麦克风"}),
        avator : "icon-microphone",
        status : microphone
      }
    ];

    const statusObj = {
      checking : { title : formatMessage({id:"app.text.device.checking",defaultMessage:"检测中"}),          icon : "loading",      color : "checking-color", mainClass : "avator-checking" },
      success  : { title : formatMessage({id:"app.text.device.check.success",defaultMessage:"通过检测"}),   icon : "check-circle", color : "success-color",  mainClass : "avator-success" },
      fail     : { title : formatMessage({id:"app.text.device.check.failed",defaultMessage:"未通过检测"}),  icon : "info-circle",  color : "fail-color",     mainClass : "avator-fail" },
    };
    return modals
    .filter(item=>this.checkItems.includes(item.type))
    .map(item=>{
      const { type,title,avator,status } = item;
      const obj = statusObj[status||"checking"];
      const classnames = cs(
        styles['avator-img'],
        'iconfont',
        avator,
        styles[obj.mainClass]
      );
      const avatorClass = cs(
        styles.avator,
        { [styles.checking] : status==="checking" }
      );

      return (
        <div key={type} className={styles.content}>
          <div className={avatorClass}>
            <span className={classnames} />
          </div>
          <div className={styles.title}>{title}</div>
          <div className={cs(styles.status,styles[obj.color])}>
            <Icon type={obj.icon} />{obj.title}
          </div>
        </div>
      );
    });
  }

  /**
   * @description: 检测的进度及三个进度点的样式
   * @param {type}
   * @return:
   */
  renderCheckProcess = ()=>{
    const { computerAi, earphone, microphone } = this.state;
    const data = { computerAi,earphone,microphone };
    const status = {
      checking : styles["checking-process"],
      success  : styles["checking-success"],
      fail     : styles["checking-fail"]
    }
    return (
      <div className={styles.dots}>
        {
          this.checkItems.map(item=>(
            <span key={item} className={status[data[item]]} />
          ))
        }
      </div>
    )
  }

  /**
   * 判断波动图是否变动
   * 1、当某个检测项，失败的时候停止波动
   * 2、所有的检测项，都通过检测的时候，停止波动
   */
  waveIseLoading =()=>{
    const { computerAi,earphone,microphone } = this.state;
    const data = { computerAi,earphone,microphone };
    let result = true;
    if( this.checkItems.some(item=>data[item]==="fail") ){
      result = false;
    }
    if( this.checkItems.every(item=>data[item]==="success")){
      result = false;
    }
    return result;
  }

  /**
   * 进入练习的按钮是否可用
   */
  enterBtnAble = ()=>{
    const { computerAi,earphone,microphone } = this.state;
    const data = { computerAi,earphone,microphone };
    return this.checkItems.every(item=>data[item]==="success");
  }

  /**
   * 主选项卡的位移，为了动态效果
   * 每一项检测success，后里面切入下一个选项卡
   * 但是第二还未开始检测的中间状态
   */
  stepStyle = ()=>{
    const { computerAi, earphone, microphone } = this.state;
    const data = { computerAi,earphone,microphone };

    let hasResult = false;
    let left = 0;
    this.checkItems.forEach((item,key)=>{
      const state = data[item];
      if( !hasResult && state !== "success" ){
        left = key*490;
        hasResult = true;
      }
    });
    if( !hasResult ){
      left = (this.checkItems.length-1)*490;
    }
    return {
      left       : `-${left}px`,
      transition : "left 0.5s ease 0s",
      width      : `${this.checkItems.length*100}%`,
    }
  }

  render(){
    const { checking } = this.state;
    const { taskModel } = this.props;

    // 根据数据，判断当期正在检测的页面
    const stepStyle = this.stepStyle();

    // 当全部通过检测，或者有一个错误的时候，波浪图停止
    const waveLoading = this.waveIseLoading();

    // 进度点模块
    const processTpl = this.renderCheckProcess();

    // 进入练习按钮是否可用
    const canEnterPracticeBtn = this.enterBtnAble() && !checking;

    return (
      <div className={styles['practice-container']}>
        <div className={styles.main}>
          <WaveImage key="WaveImage" className={styles.wave} loading={waveLoading} />
          <div className={styles.lamp} style={stepStyle}>
            { this.renderCheckStatus() }
          </div>
          {/* 进度点 */}
          { processTpl }
        </div>
        {/* 按钮事件 */}
        <div className={styles.footer}>
          <PopEarSetting>
            <Button className={cs(styles.btn,styles.setting)} style={{visibility: taskModel==="brower"?"hidden":"visible"}}>
              <span className="iconfont icon-set" />
              <span className={styles.text}>
                {formatMessage({id:"app.button.earphone.config",defaultMessage:"耳机设置"})}
              </span>
            </Button>
          </PopEarSetting>
          <Button className={cs(styles.btn,styles.enter)} onClick={this.enterPractice} disabled={!canEnterPracticeBtn}>
            {formatMessage({id:"app.button.into.task",defaultMessage:"进入练习"})}
          </Button>
          <Button className={cs(styles.btn,styles.reset)} onClick={this.beginCheck} loading={checking}>
            <span style={{display:checking?"none":"inline"}} className="iconfont icon-reset" />
            <span className={styles.text}>
              { checking ?
                  formatMessage({id:"app.text.device.checking",defaultMessage:"检测中"}):
                  formatMessage({id:"app.text.retest",defaultMessage:"重新检测"})
              }
            </span>
          </Button>
        </div>
      </div>
    );
  }
}


export default PracticeCheck;

