/**
 * 设备检测页（ 根据任务类别的不同， 进入不同的检测页面 ）
 * 客户端模式、浏览器模式
 * 考试模式、练习模式
 */

import React, { PureComponent } from 'react';
import { connect } from "dva";
import cs from "classnames";
import { formatMessage, FormattedMessage } from 'umi/locale';
import tool from '@/frontlib/utils/instructions';
import PaperTimeProcess from "../../Components/PaperTimeProcess";
import Modal from "@/components/Modal/popupModal";
import InfoForModal from "../../Components/InfoForModal"
import styles from './index.less';
import exampPic1 from '@/frontlib/assets/preExamCheck/examp_pic_1.png';
import exampPic2 from '@/frontlib/assets/preExamCheck/examp_pic_2.png';
import IconButton from '../../../IconButton';


const {
  setMute,                      // 设置禁音放音控制
} = tool;


// 标准的麦克风和耳机音量（ client使用 ）
// const standardEarphoneValue = 30;
// const standardMicphoneValue = 5;

/**
 * 考前检测组件
 */
@connect(({examBlock,loading})=>{
  const { taskId, taskModel, taskType, envState } = examBlock;
  const { player, recorder } = envState;
  return {
    taskId,                            // 任务id，如果id==="autoCheck", 为一键检测
    taskModel,                         // 考试的模式（brower: b/s模式，即线上平台; client: c/s模式,即考中平台 )
    taskType,                          // 任务的模式类型（ exam: 考试模式， practice 练习模式 ）
    player,
    recorder,
    envState : player && recorder,
    checking : loading.effects["examBlock/checkEarAndMicphoneStatus"]
  }
})
class DeviceCheck extends PureComponent {

  state = {
    // 显示的主按钮
    btnShow  : "",
    // 显示的step2 中的提示语
    tipShow  : "playOrigin",
  }

  componentDidMount() {
    this.checkDeviceState();
  }

  componentWillReceiveProps(nextProps){
    const { envState : nextEnvState } = nextProps;
    const { envState } = this.props;
    if( nextEnvState !== envState && nextEnvState ){
      // 重新开始检测
      this.checkDeviceState();
    }
  }

  // 获取当前的设备状态
  getDeviceStatus = async ()=>{
    const { dispatch } = this.props;
    const data = await dispatch({
      type : "examBlock/checkEarAndMicphoneStatus",
    });
    return data;
  }

  // 重新检测（点击重新检测的话，如果和老的设备状态不一样，或者 没有权限则重新处理）
  reCheck = async ()=>{
    tool.getRecorderManager().enumerateDevices("manual");
  }



  /**
   * 状态更新
   * state : loading 测试中， succes： 测试成功 fail 测试失败
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

  // 设备检测
  checkDeviceState = async ()=>{
    const { taskId, taskModel } = this.props;

    // 默认取消静音
    setMute({player:true,recorder:true});

    // 通知外部检测中
    this.changeState("loading");

    // 状态初始化
    this.setState({
      processNode : 'free',
      btnShow     : "",
      tipShow     : "playOrigin",
    });

    // 获取耳机和麦克风的状态
    await this.getDeviceStatus();

    const { recorder, player  } = this.props;

    if( recorder && player ){
      // 判断是否需要进入一键检测状态
      if( taskId === "autoCheck" ){
        // 进入一键检测
        this.autoCheck();
      }else if( taskModel === "brower" ){
        // 播放准备音
        this.palyStep1();
      }else if( taskModel === "client" ){
        // 只有在客户端才进行音量检测（ 浏览器获取的音量非系统音量，不具有参考价值 ）
        this.checkEarAndMicphoneVolume();
      }
    }

  }


  /**
   * 一键检测中的自检过程
   */
  // autoCheck = async ()=>{

  //   {
  //     // 判断设备是否可用
  //     const { envState } = this.props;
  //     if( !envState ) return;
  //     // 1、 设备提示音
  //     await new Promise(resolve=>{
  //       this.palyStep1(()=>{
  //         resolve();
  //       });
  //     });
  //     await delay(1000);
  //   }

  //   {
  //     // 判断设备是否可用
  //     const { envState } = this.props;
  //     if( !envState ) return;
  //     // 2、播放原音
  //     await new Promise(resolve=>{
  //       this.playOriginSound(()=>{
  //         resolve();
  //       });
  //     });
  //     await delay(1000);
  //   }

  //   {
  //     // 判断设备是否可用
  //     const { envState } = this.props;
  //     if( !envState ) return;
  //     // 开始录音
  //     this.startRecord();
  //   }

  //   // 4、听回放
  //   // await delay(2000);
  //   // this.soundPlayback();
  // }


  // 检测耳机麦克风音量
  // 参考设计文档10.2.2的优化设计，选择后，不进行重新检测环节
  // checkEarAndMicphoneVolume = () => {
  //   const { instructions } = this.props;
  //   const { getEarphoneVolume, getMicphoneVolume } = instructions;
  //   // 耳机音量
  //   const earVolume = getEarphoneVolume();
  //   if (earVolume <= standardEarphoneValue) {
  //     showEarphoneVolumeModal({
  //       dataSource: {
  //         type: 'earphone',
  //         volume: earVolume,
  //         instructions
  //       },
  //       callback: () => {
  //         const micVolume = getMicphoneVolume();
  //         if (micVolume <= standardMicphoneValue) {
  //           showEarphoneVolumeModal({
  //             dataSource: {
  //               type: 'micphone',
  //               volume: micVolume,
  //               instructions
  //             },
  //             callback: () => {
  //               this.palyStep1();
  //             }
  //           })
  //         } else {
  //           this.palyStep1();
  //         }
  //       }
  //     })
  //   } else {
  //     // 耳机正常  麦克风检测
  //     const micVolume = getMicphoneVolume();
  //     if (micVolume <= standardMicphoneValue) {
  //       showEarphoneVolumeModal({
  //         dataSource: {
  //           type: 'micphone',
  //           volume: micVolume,
  //           instructions
  //         },
  //         callback: () => {
  //           this.palyStep1();
  //         }
  //       })
  //     } else {
  //       this.palyStep1();
  //     }
  //   }
  // }

  // ============================ 按钮方法集合 =========================================

  // 0、 palyStep1              播放提示音
  // 1、 playOriginSound        播放原音
  // 2、 againPlayOriginSound   重新播放
  // 3、 startRecord            开始录音
  // 4、 endRecord              结束路由
  // 5、 soundPlayback          听回放
  // 6、 soundClear             清晰
  // 7、 soundUnClear           不清晰


  /**
   * 放音方法
   * @param {String} resourceType : 系统提供的声音
   * @param {String} tokenId      : 录音时候的回调的tokenId
   * @param {String} title        : 显示的文本
   */
  playSystem = async ( {resourceType,tokenId,title} )=>{
    const { dispatch } = this.props;
    await dispatch({
      type : "examBlock/playSystem",
      payload : { resourceType,tokenId , title }
    });
  }

  /**
   * 放音方法
   * @param {Number} duration    录音时长
   * @param {String} type        如果是test 则是测试录音，否则为正常录音
   * @param {Function} onVolumeMeter     音量回调
   * @param {Function} onCountDown       倒计时回调
   */
  recordSound= async ( params )=>{
    const { dispatch } = this.props;
    const tokenId = await dispatch({
      type    : "examBlock/recordSound",
      payload : params
    });
    return tokenId;
  }

  /**
   * 耳机麦克风检测成功后发送指令 播放Step1“正确佩戴耳机”语音
   * 播放提示音
   */
  palyStep1 = async () => {
    await this.playSystem({ resourceType : "TYPE_D1", title : formatMessage({id:"app.listen.to.guidance",defaultMessage:"听指导"}) });
    this.setState({ btnShow : "playOrigin" });
  }

  /**
   * 播放原音
   */
  playOriginSound = async () => {
    // 隐藏按钮,并提示播放原因
    this.setState({
      btnShow: false,
      tipShow : "playOrigin"
    });
    // 播放提示音
    await this.playSystem({ resourceType : "TYPE_D5", title : formatMessage({id:"app.text.listensound",defaultMessage:"听原音"}) });
    // 显示开始录音，结束录音按钮和提示
    this.setState({
      btnShow : "beginRecord",
      tipShow : "beginRecord"
    });
  }

  /**
   * 重新放音
   */
  againPlayOriginSound = () => {
    this.playOriginSound();
  }

  /**
   * 开始录音
   */
  startRecord = async () => {
    const { taskModel,dispatch } = this.props;

    // 1、提示 结束录音
    this.setState({
      btnShow : false,
      tipShow : 'stopRecord'
    });

    // 2、播放开始路由
    await this.playSystem({ resourceType : "TYPE_D2", title : formatMessage({id:"app.button.startrecord",defaultMessage:"开始录音"}) });

    // 3、显示 结束的按钮
    this.setState({ btnShow: 'stopRecord' });

    // 4、开始录音
    this.tokenId = await this.recordSound({
      duration : 10,
      type     : taskModel === "client" && "test",    // 只有 vbclien 才有test 模式
      onVolumeMeter : ()=>{},
      onCountDown : ()=>{},
      ...(taskModel === "client"?{}:{
        request: {
          attachAudio: true,
          kernelType: "eval.sent.en",
          precision: 0.5,
          rank: 100,
          reference: {
            answers: [{
              text : "a good book is a good friend"
            }],
            questionId: "9d17b4e73fca454692057dbf9d7"
          }
        }
      })
    });

    // 5、播放停止录音提示
    this.setState({ btnShow : "" });
    await this.playSystem({ resourceType : "TYPE_D3", title : formatMessage({id:"app.text.recordend",defaultMessage:"录音结束"}) });

    // 录音完成
    dispatch({
      type : "examBlock/updateProcessPropState",
      payload : { state:"finish" }
    })

    // 6、录音结束以后，跳转到听回放
    this.setState({
      btnShow : "playRecord",
      tipShow : "playRecord"
    });
  }

  /**
   * 结束录音（手动）
   */
  endRecord = () => {
    const {dispatch} = this.props;
    dispatch({ type : "examBlock/stopSound" });
  }


  /**
   * 听回放
   */
  soundPlayback = async () => {
    this.setState({ btnShow : "" });
    await this.playSystem({tokenId:this.tokenId,title : formatMessage({id:"app.button.listensound",defaultMessage:"听回放"}) });
    this.setState({
      btnShow : "selectState",
      tipShow : "selectState"
    });
  }

  /**
   * 清晰
   */
  soundClear = () => {
    this.changeState("success");
  }

  /**
   * 不清晰
   */
  soundUnClear = () => {
    // 重新开始检测
    this.checkDeviceState()
  }

  // 根据录音测试的结果生成不同的页面
  getRecordTestResult = ()=>{
    const { testResult,processNode } = this.state;
    let tip = "";
    // 只有录制结束才有测试结果
    if( !testResult || processNode !== "recordEnd"  ){
      tip = "";
    }else if( testResult === "Snr" ){
      // Snr，信噪比不正常
      tip = formatMessage({id:"app.message.noisetip",defaultMessage:"系统检测到您的测试录音有噪声，可能会影响考试评分"});
    }else if( testResult === "Clip" ){
      tip = formatMessage({id:"app.message.nofinishrecord",defaultMessage:"系统检测到您的测试录音可能不完整"});
    }else if( testResult === "Volume" ){
      tip = formatMessage({id:"app.message.lowvoice",defaultMessage:"系统检测到您的测试录音音量可能会影响考试评分"});
    }else{
      tip = "";
    }
    if( tip === "" ){
      return null;
    }
    return <div className={styles.notice}>{tip}</div>;
  }




  // ============================ 页面生成集合 =========================================

  /**
   * 根据条件显示按钮
   */
  renderBtnTpl=()=>{
    const { btnShow } = this.state;
    switch( btnShow ){
      // 播放原音按钮
      case "playOrigin" :
        return <IconButton text={formatMessage({id:"app.message.playsound",defaultMessage:"播放原音"})} iconName="icon-v-play" type="button" className={cs(styles.btn,styles.blueBtn)} onClick={this.playOriginSound} />;
      // 开始录音
      case "beginRecord" :
        return (
          <>
            <IconButton text={formatMessage({id:"app.button.startrecord",defaultMessage:"开始录音"})} iconName="icon-microphone" type="button" className={cs(styles.btn,styles.yellowBtn)} onClick={this.startRecord} />
            <IconButton text={formatMessage({id:"app.button.replaysound",defaultMessage:"重新播放"})} iconName="icon-v-play" type="button" className={cs(styles.btn,styles.blueBtn)} onClick={this.againPlayOriginSound} />
          </>
        );
      // 停止录音
      case "stopRecord" :
        return <IconButton text={formatMessage({id:"app.button.stoprecord",defaultMessage:"结束录音"})} iconName="icon-v-stop" type="button" className={cs(styles.btn,styles.yellowBtn)} onClick={this.endRecord} />
      // 听回放
      case "playRecord" :
        return <IconButton text={formatMessage({id:"app.button.listensound",defaultMessage:"听回放"})} iconName="icon-v-play" type="button" className={cs(styles.btn,styles.blueBtn)} onClick={this.soundPlayback} />
      // 清晰，不清晰
      case "selectState" :
        return (
          <>
            <IconButton text={formatMessage({id:"app.text.clear",defaultMessage:"清晰"})} iconName="" type="button" className={cs(styles.btn,styles.blueBtn)} onClick={this.soundClear} />
            <IconButton text={formatMessage({id:"app.text.noclear",defaultMessage:"不清晰"})} iconName="" type="button" className={cs(styles.btn,styles.yellowBtn)} onClick={this.soundUnClear} />
          </>
        );
      default : return null;
    }
  }

  /**
   * 显示第二步，不同状态下的文案
   * tipShow : "free",
   * 检测步骤free空闲中,listenOrigin听原音,recording录音中,recordEnd录音结束,playBacksound放音中,playBacksoundEnd放音结束
   *
   */
  renderTipTpl=()=>{
    // 更加 tipShow 显示第二布的提示
    const { tipShow } = this.state;
    switch( tipShow ){
      // 播放原音
      case "playOrigin" :
        return (
          <FormattedMessage
            id="app.text.click.button.to.listen.connect"
            defaultMessage="点击{text}按钮，试听下面的句子。"
            values={{
              text:(
                <span className={styles.tag} style={{color:'#03C46B'}}>
                  {formatMessage({id:"app.message.playsound",defaultMessage:"播放原音"})}
                </span>
              )
            }}
          />
        );
      // 开始录音
      case "beginRecord" :
        return (
          <FormattedMessage
            id="app.text.click.button.to.record.or.replay"
            defaultMessage="点击{btn1}按钮，朗读下面的句子，或点击{btn2}按钮，重新试听。"
            values={{
              btn1 : (
                <span className={styles.tag} style={{color:'#FF9900'}}>
                  {formatMessage({id:"app.button.startrecord",defaultMessage:"开始录音"})}
                </span>
              ),
              btn2 : (
                <span className={styles.tag} style={{color:'#03C46B'}}>
                  {formatMessage({id:"app.button.replaysound",defaultMessage:"重新播放"})}
                </span>
              )
            }}
          />
        );
      // 停止录音
      case "stopRecord" :
        return (
          <FormattedMessage
            id="app.text.click.button.after.record"
            defaultMessage="朗读完成后点击{btn}按钮。"
            values={{
              btn : (
                <span className={styles.tag} style={{color:'#FF6E4A'}}>
                  {formatMessage({id:"app.button.stoprecord",defaultMessage:"结束录音"})}
                </span>
              )
            }}
          />
        );
      // 听回放
      case "playRecord" :
        return (
          <FormattedMessage
            id="app.text.click.button.to.play.record"
            defaultMessage="点击{btn}按钮，系统将播放您的录音。"
            values={{
              btn : (
                <span className={styles.tag} style={{color:'#03C46B'}}>
                  {formatMessage({id:"app.button.listensound",defaultMessage:"听回放"})}
                </span>
              )
            }}
          />
        );
        // 清晰，不清晰
      case "selectState" :
        return <span>{formatMessage({id:"app.message.examtip_j",defaultMessage:"您听到的回放是否清晰？"})}</span>;

      default : return null;
    }
  }


  /**
   * 耳机设备掉落的弹出框
   */
  lostDeviceModal = ()=>{
    const { recorder, player, checking } = this.props;
    let msg = null;
    let icon = null;

    if( !recorder && !player ){
      // 耳机，麦克风都不存在
      icon = "icon-warning";
      msg = formatMessage({id:"app.message.no.earphone.and.microphone",defaultMessage:"未检测到耳机和麦克风，请确认耳机和麦克风都已正确接入！"});
    }else if( !recorder ){
      // 没有麦克风
      icon = "icon-microphone";
      msg = formatMessage({id:"app.message.no.check.microphone",defaultMessage:"未检测到麦克风，请确认麦克风已正确接入！"});
    }else if( !player ){
      // 没有耳机
      icon = "icon-earphone";
      msg = formatMessage({id:"app.message.earphone_tip_a",defaultMessage:"未检测到耳机，请确认耳机已正确接入！"});
    }

    return (
      <Modal
        title={null}
        visible={!recorder || !player}
        footer={null}
        wrapClassName={styles.infoForModal}
        closable={false}
        width="auto"
        bodyStyle={{padding:"0px"}}
      >
        <InfoForModal
          type="warn"
          text={msg}
          icon={<span className={cs('iconfont',icon,styles.icon)} />}
          buttons={[
            {
              title   : "重新检测",
              onClick : ()=>{this.reCheck()},
              loading : checking,
              type    : "minor",
              shape   : "round",
            }
          ]}
        />
      </Modal>
    )
  }



  render() {
    return (
      <div className={styles.preExamCheck}>

        {/* step1 */}
        <div className={cs(styles.step1,styles.stepBox)}>
          <div className={styles.title}>Step1： {formatMessage({id:"app.message.pictips",defaultMessage:"请按图示指示正确佩戴耳机"})}</div>
          <div className={styles.example}>
            <div className={styles.pic1}>
              <img width="275" height="160" src={exampPic1} alt="" />
              <div className={styles.info}>
                {formatMessage({id:"app.message.examtip_a",defaultMessage:"麦克风上的绿色荧光朝外，麦克风略低于嘴巴，且离嘴巴有两个手指的距离"})}
              </div>
            </div>
            <div className={styles.pic2}>
              <img width="420" height="160" src={exampPic2} alt="" />
              <div className={styles.infoBox}>
                <div className={styles.p}>
                  {formatMessage({id:"app.message.examtip_b",defaultMessage:"录音过程中用手碰麦克风"})}
                </div>
                <div className={styles.p}>
                  {formatMessage({id:"app.message.examtip_c",defaultMessage:"麦克风离嘴太远"})}
                </div>
                <div className={styles.p}>
                  {formatMessage({id:"app.message.examtip_d",defaultMessage:"麦克风离嘴太近"})}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* step2 */}
        <div className={cs(styles.step2,styles.stepBox)}>
          <div className={styles.title}>Step2： {formatMessage({id:"app.message.examtip_e",defaultMessage:"放音录音设备测试"})}</div>
          <div className={styles.example}>

            {/* 录音结果展示 */}
            { this.getRecordTestResult() }

            {/* 提示信息 */}
            <div className={styles.tip}>
              <i className="iconfont icon-tip" />
              {/* 根据条件显示不同的提示信息 */}
              {this.renderTipTpl()}
            </div>
            <div className={styles.content}>A good book is a good friend！</div>
          </div>
        </div>

        {/* 根据条件显示不同的按钮 */}
        <div className={styles.btnBox}>
          {this.renderBtnTpl()}
        </div>

        <div className={styles.footer}>
          <PaperTimeProcess />
        </div>

        {/* 设备缺失的弹出框 */}
        { this.lostDeviceModal() }

      </div>
    )
  }
}

export default DeviceCheck;
