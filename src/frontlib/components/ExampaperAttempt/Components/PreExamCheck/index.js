import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import IconButton from '../../../IconButton';
import RightBottom from './RightBottom';
import showEarphoneVolumeModal from './EarphoneVolumeModal/api';
import {showDeviceStatusModal} from './DeviceStatusModal/api';
import { playResource, delay } from '@/utils/utils';
import exampPic1 from '@/frontlib/assets/preExamCheck/examp_pic_1.png';
import exampPic2 from '@/frontlib/assets/preExamCheck/examp_pic_2.png';
import styles from './index.less';

const standardEarphoneValue = 30;
const standardMicphoneValue = 5;

let TASKID = "";
/**
 * 考前检测组件
 */
export default class PreExamCheck extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      processNode: 'free',    // free,listenOrigin,recording,recordEnd,playBacksound,playBacksoundEnd
      step1Played: false,     // 第一部播放完成
      hasSoundOrigin: false,  // 已播放原音
      recordTipPlayed: false, // 录音提示语已播放
      testResult : ""         // 测试录音的返回状态 "":初始状态;Normal录音质量正常;Snr信噪比不正常;Clip:声音有截幅;Volume:音量不正常;System:系统错误;
    }
    this.volumeMeter = [];    // 录音音量的数组
    if( window.TASKINFO && window.TASKINFO.taskId ){
      TASKID = window.TASKINFO.taskId;
    }
  }

  componentDidMount() {
    // 1.设备检测
    this.checkDeviceState();
  }

  componentWillReceiveProps( nextProps ){
    const {changePreTime} = this.props;
    // 如果当前状态设置为预览
    if( nextProps.changePreTime !== changePreTime  ){
      this.rightBottom.endRecord();
      this.setState({
        processNode: 'free', // free,listenOrigin,recording,recordEnd,playBacksound,playBacksoundEnd
        step1Played: false, // 第一部播放完成
        hasSoundOrigin: false, // 已播放原音
        recordTipPlayed: false, // 录音提示语已播放
        testResult : ""
      },()=>{
        this.checkDeviceState();
      });
    }
  }

  /**
   * 一键检测中的自检过程
   */
  autoCheck = async ()=>{

    {
      const { instructions : {checkEarAndMicphoneStatus} } = this.props;
      const { recorder , player } = await checkEarAndMicphoneStatus();
      if( !recorder || !player ){
        this.sendFailCommand();
        return;
      }
    }

    // 1、 设备提示音
    await new Promise(resolve=>{
      this.palyStep1(()=>{
        resolve();
      });
    });

    // 2、播放原音
    await delay(1000);
    {
      const { instructions : {checkEarAndMicphoneStatus} } = this.props;
      const { recorder , player } = await checkEarAndMicphoneStatus();
      if( !recorder || !player ){
        this.sendFailCommand();
        return;
      }
    }
    await new Promise(resolve=>{
      this.playOriginSound(()=>{
        resolve();
      });
    });

    // 3、开始录音,默认等待9秒后关闭录音
    await delay(1000);
    {
      const { instructions : {checkEarAndMicphoneStatus} } = this.props;
      const { recorder , player } = await checkEarAndMicphoneStatus();
      if( !recorder || !player ){
        this.sendFailCommand();
        return;
      }
    }
    this.startRecord();

    // 4、听回放
    // await delay(2000);
    // this.soundPlayback();
  }




  // 检测耳机麦克风音量
  // 参考设计文档10.2.2的优化设计，选择后，不进行重新检测环节
  checkEarAndMicphoneVolume = () => {
    const { instructions } = this.props;
    const { getEarphoneVolume, getMicphoneVolume } = instructions;
    // 耳机音量
    const earVolume = getEarphoneVolume();
    if (earVolume <= standardEarphoneValue) {
      showEarphoneVolumeModal({
        dataSource: {
          type: 'earphone',
          volume: earVolume,
          instructions
        },
        callback: () => {
          const micVolume = getMicphoneVolume();
          if (micVolume <= standardMicphoneValue) {
            showEarphoneVolumeModal({
              dataSource: {
                type: 'micphone',
                volume: micVolume,
                instructions
              },
              callback: () => {
                this.palyStep1();
              }
            })
          } else {
            this.palyStep1();
          }
        }
      })
    } else {
      // 耳机正常  麦克风检测
      const micVolume = getMicphoneVolume();
      if (micVolume <= standardMicphoneValue) {
        showEarphoneVolumeModal({
          dataSource: {
            type: 'micphone',
            volume: micVolume,
            instructions
          },
          callback: () => {
            this.palyStep1();
          }
        })
      } else {
        this.palyStep1();
      }
    }
  }

  // 耳机麦克风检测成功后发送指令 播放Step1“正确佩戴耳机”语音
  palyStep1 = ( callback ) => {
    playResource({
      type: "TYPE_D1",
      success: () => {
        this.setState({
          step1Played: true
        });
        if( callback && typeof(callback) === "function" ){
          callback();
        }
      }
    })
  }

  // 设备检测
  checkDeviceState = async () => {
    const { instructions } = this.props;
    const { checkEarAndMicphoneStatus,sendMS,deviceManager } = instructions;
    // 默认取消静音
    deviceManager.mute = false;
    this.rightBottom.endRecord();
    // 状态初始化
    await this.setState({
      processNode: 'free', // free,listenOrigin,recording,recordEnd,playBacksound,playBacksoundEnd
      step1Played: false, // 第一部播放完成
      hasSoundOrigin: false, // 已播放原音
      recordTipPlayed: false, // 录音提示语已播放
      testResult : ""
    });
    const res = await checkEarAndMicphoneStatus();
    if (res.recorder && res.player) {
      // 发布消息给教师机修改状态
      sendMS("student:status", {
        ipAddr: localStorage.getItem('studentIpAddress'),
        monitorStatus : "MS_3",
      });

      // 判断是否需要进入一键检测状态
      if( TASKID === "autoCheck" ){
        this.autoCheck();
      }else{
        // 2.耳机、麦克风音量正常检测
        this.checkEarAndMicphoneVolume();
      }
    } else {
      // 检测失败
      this.sendFailCommand();
      showDeviceStatusModal({
        dataSource: {
          instructions,
          recorder     : res.recorder,
          player       : res.player
        },
        callback: () => {
          this.checkDeviceState();
        }
      })
    }
  }

  // 子组件
  onRef = (ref) => {
    this.rightBottom = ref;
  }

  // 播放原音
  playOriginSound = ( callback ) => {
    this.setState({
      processNode: 'listenOrigin'
    })
    this.playShellResource( callback );
  }

  // 播放框架内的原音资源
  playShellResource = ( callback ) => {
    playResource({
      type: "TYPE_D5",
      success: () => {
        this.handleOriginSoundPlayEnd();
        if( callback && typeof(callback) === "function" ){
          callback();
        }
      }
    })
  }

  // 重新播放
  againPlayOriginSound = () => {
    this.setState({
      hasSoundOrigin: false,
      processNode: 'listenOrigin'
    })
    this.playShellResource();
  }

  // 开始录音
  startRecord = () => {
    this.setState({
      processNode: 'recording'
    });
  }

  // 手动结束录音
  endRecord = () => {
    this.rightBottom.endRecord();
  }

  // 录音正常结束回调
  handleRecordAutoEnd = async ( testResult ) => {

    this.setState({
      processNode: 'recordEnd',
      testResult
    });

    // 判断是否 一键检测
    if( TASKID === "autoCheck" ){
      await delay(2000);
      const { instructions : {checkEarAndMicphoneStatus} } = this.props;
      const { recorder , player } = await checkEarAndMicphoneStatus();
      if( !recorder || !player ){
        this.sendFailCommand();
        return;
      }
      this.soundPlayback();
    }
  }

  // 听回放
  soundPlayback = () => {
    this.rightBottom.playRecordSound();
    this.setState({
      processNode: 'playBacksound'
    })
  }

  // 原音播放结束回调
  handleOriginSoundPlayEnd = () => {
    this.setState({
      processNode: 'free',
      hasSoundOrigin: true
    });
  }

  // 回放录音播放结束
  handlePlayRecordSoundEnd = async () => {
    this.setState({
      processNode: 'playBacksoundEnd'
    });

    // 判断是否 一键检测
    if( TASKID === "autoCheck" ){
      await delay(1000);
      const { instructions : {checkEarAndMicphoneStatus} } = this.props;
      const { recorder , player } = await checkEarAndMicphoneStatus();
      if( !recorder || !player ){
        this.sendFailCommand();
        return;
      }
      if( this.volumeMeter.some(item=>item.volume>0) ){
        // 如果音量大于0 则清晰
        this.soundClear();
      }
    }

  }

  // 清晰
  soundClear = () => {
    const { callback } = this.props;
    // 录音检测成功
    this.sendSuccessCommand();
    // 设置为设备检测成功，进入等待考试状态
    callback("MS_4");
  }

  // 不清晰
  soundUnClear = () => {
    // const { callback } = this.props;
    // 检测不成功
    // this.sendFailCommand();
    // 初始化状态
    this.setState({
      processNode: 'free',
      step1Played: false,
      hasSoundOrigin: false,
      recordTipPlayed: false,
      testResult : ""
    }, () => {
      this.checkEarAndMicphoneVolume();
    });
    // callback("MS_5");
  }

  // 设备检测成功指令
  sendSuccessCommand = () => {
    const { instructions,instructions : {sendM,storeData} } = this.props;
    const { getEarphoneVolume, getMicphoneVolume } = instructions;
    const currentClientIP = localStorage.getItem('studentIpAddress');
    const data = {
      result        : 1,
      ipAddr        : currentClientIP,
      playVolume   : getEarphoneVolume(),    // 耳机音量
      recordVolume : getMicphoneVolume(),    // mic音量
      checkResult  : this.testResult.result, // 检测结果
      recordMax    : this.volumeMeter.sort((a,b)=>a.volume>b.volume)[0].volume, // 录音音量峰值
      recordAvg    : this.volumeMeter.reduce((acc,val)=>acc+val.volume,0)/this.volumeMeter.length, // 录音音量平均值
    }
    // 放音检测成功
    sendM('check:waveout', data);
    // 录音检测成功
    sendM('check:wavein', data);
    //当放录音检测成功，发送check:waveout/check:wavein指令后，调用Shell
    storeData({binessStatus:"MS_4"})
  }

  // 设备检测失败指令
  sendFailCommand = () => {
    const { callback,instructions : {sendM,storeData} } = this.props;
    const currentClientIP = localStorage.getItem('studentIpAddress');
    const data = {
      result: 2,
      ipAddr: currentClientIP
    }
    // 放音检测成功
    sendM('check:waveout', data);
    // 录音检测成功
    sendM('check:wavein', data);

    // 当放录音检测成功，发送check:waveout/check:wavein指令后，调用Shell
    storeData({binessStatus:"MS_4"})

    callback("MS_5");
  }

  // 录音id
  handleRecordId = (tokenIds) => {
    const { onCallbackRecordId } = this.props;
    onCallbackRecordId(tokenIds);
  }

  // 录音提示语播放完成回调
  handleRecordTipPlayed = () => {
    this.setState({
      recordTipPlayed: true
    })
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


  /**
   * @description: 获取录音音量峰值，平均值
   * @param {type}
   * @return:
   */
  onVolumeMeter = ( data )=>{
    if( data === "new" ){
      this.volumeMeter = [];
    }else{
      this.volumeMeter.push(data);
    }
  }

  /**
   * @description: 听取ontest回调的结果
   * @param {type}
   * @return:
   */
  onTest = (data)=>{
    // 获取onTest回调的结果
    this.testResult = data;
  }


  render() {
    const { processNode, hasSoundOrigin, recordTipPlayed, step1Played } = this.state;
    const { instructions } = this.props;
    return (
      <div className={styles.preExamCheck}>
        <div className={styles.stepBox}>
          <div className={styles.title}>Step1： {formatMessage({id:"app.message.pictips",defaultMessage:"请按图示指示正确佩戴耳机"})}</div>
          <div className="clearfix">
            <div className={styles.pic1}>
              <img width="275" height="160" src={exampPic1} alt="" />
              <div className={styles.info}>{formatMessage({id:"app.message.examtip_a",defaultMessage:"麦克风上的绿色荧光朝外，麦克风略低于嘴巴，且离嘴巴有两个手指的距离"})}</div>
            </div>
            <div className={styles.pic2}>
              <img width="420" height="160" src={exampPic2} alt="" />
              <div className={styles.infoBox}>
                <div className={styles.p1}>{formatMessage({id:"app.message.examtip_b",defaultMessage:"录音过程中用手碰麦克风"})}</div>
                <div className={styles.p2}>{formatMessage({id:"app.message.examtip_c",defaultMessage:"麦克风离嘴太远"})}</div>
                <div className={styles.p3}>{formatMessage({id:"app.message.examtip_d",defaultMessage:"麦克风离嘴太近"})}</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.stepBox}>
          <div className={styles.title}>Step2： {formatMessage({id:"app.message.examtip_e",defaultMessage:"放音录音设备测试"})}</div>
          <div className={styles.example}>
            {/* 录音结果展示 */}
            { this.getRecordTestResult() }
            {/* 提示信息 */}
            <div className={styles.tip} style={{display:((processNode==='free'&&!hasSoundOrigin)||processNode==='listenOrigin')?'block':'none'}}>
              <i className="iconfont icon-tip" style={{fontSize:'14px',marginRight:'8px'}} />{formatMessage({id:"app.message.click",defaultMessage:"点击"})}<span style={{color:'#03C46B',padding:'0px 3px'}}>{formatMessage({id:"app.message.playsound",defaultMessage:"播放原音"})}</span>{formatMessage({id:"app.message.examtip_f",defaultMessage:"按钮，试听下面的句子。"})}
            </div>
            <div className={styles.tip} style={{display:(hasSoundOrigin&&processNode!=='recording'&&processNode!=='recordEnd'&&processNode!=='playBacksound'&&processNode!=='playBacksoundEnd')?'block':'none'}}>
              <i className="iconfont icon-tip" style={{fontSize:'14px',marginRight:'8px'}} />{formatMessage({id:"app.message.click",defaultMessage:"点击"})}<span style={{color:'#FF9900',padding:'0px 3px'}}>{formatMessage({id:"app.button.startrecord",defaultMessage:"开始录音"})}</span>{formatMessage({id:"app.message.examtip_g",defaultMessage:"按钮，朗读下面的句子，或点击"})}<span style={{color:'#03C46B',padding:'0px 3px'}}>{formatMessage({id:"app.button.replaysound",defaultMessage:"重新播放"})}</span>{formatMessage({id:"app.message.examtip_h",defaultMessage:"按钮，重新试听。"})}
            </div>
            <div className={styles.tip} style={{display:processNode==='recording'?'block':'none'}}>
              <i className="iconfont icon-tip" style={{fontSize:'14px',marginRight:'8px'}} />{formatMessage({id:"app.message.readclick",defaultMessage:"朗读完成后点击"})}<span style={{color:'#FF6E4A',padding:'0px 3px'}}>{formatMessage({id:"app.button.stoprecord",defaultMessage:"结束录音"})}</span>{formatMessage({id:"app.button.button",defaultMessage:"按钮"})}。
            </div>
            <div className={styles.tip} style={{display:(processNode==='recordEnd'||processNode==='playBacksound')?'block':'none'}}>
              <i className="iconfont icon-tip" style={{fontSize:'14px',marginRight:'8px'}} />{formatMessage({id:"app.message.click",defaultMessage:"点击"})}<span style={{color:'#03C46B',padding:'0px 3px'}}>{formatMessage({id:"app.button.listensound",defaultMessage:"听回放"})}</span>{formatMessage({id:"app.message.examtip_i",defaultMessage:"按钮，系统将播放您的录音。"})}
            </div>
            <div className={styles.tip} style={{display:processNode==='playBacksoundEnd'?'block':'none'}}>
              <i className="iconfont icon-tip" style={{fontSize:'14px',marginRight:'8px'}} />{formatMessage({id:"app.message.examtip_j",defaultMessage:"您听到的回放是否清晰？"})}
            </div>
            <div className={styles.content}>A good book is a good friend！</div>
          </div>
        </div>

        {/* 播放原音 */}
        <div className={styles.btnBox} style={{display:(processNode==="free"&&!hasSoundOrigin&&step1Played)?'block':'none'}}>
          <IconButton
            text={formatMessage({id:"app.message.playsound",defaultMessage:"播放原音"})}
            iconName="icon-v-play"
            type="button"
            className={styles.soundBtn}
            onClick={this.playOriginSound}
          />
        </div>

        {/* 开始录音、播放原音 */}
        <div className={styles.btnBox1} style={{display:(processNode==="free"&&hasSoundOrigin)?'flex':'none'}}>
          <IconButton
            text={formatMessage({id:"app.button.startrecord",defaultMessage:"开始录音"})}
            iconName="icon-microphone"
            type="button"
            className={styles.redcordBtn}
            onClick={this.startRecord}
          />
          <IconButton
            text={formatMessage({id:"app.button.replaysound",defaultMessage:"重新播放"})}
            iconName="icon-v-play"
            type="button"
            className={styles.soundBtn1}
            onClick={this.againPlayOriginSound}
          />
        </div>
        {/* 结束录音 */}
        <div className={styles.btnBox} style={{display:(processNode==="recording"&&recordTipPlayed)?'block':'none'}}>
          <IconButton
            text={formatMessage({id:"app.button.stoprecord",defaultMessage:"结束录音"})}
            iconName="icon-v-stop"
            type="button"
            className={styles.endRecordBtn}
            onClick={this.endRecord}
          />
        </div>
        {/* 听回放 */}
        <div className={styles.btnBox} style={{display:processNode==="recordEnd"?'block':'none'}}>
          <IconButton
            text={formatMessage({id:"app.button.listensound",defaultMessage:"听回放"})}
            iconName="icon-v-play"
            type="button"
            className={styles.soundBtn}
            onClick={this.soundPlayback}
          />
        </div>
        {/* 听回放完成 */}
        <div className={styles.btnBox1} style={{display:processNode==="playBacksoundEnd"?'flex':'none'}}>
          <IconButton
            text={formatMessage({id:"app.text.clear",defaultMessage:"清晰"})}
            iconName=""
            type="button"
            className={styles.clearBtn}
            onClick={this.soundClear}
          />
          <IconButton
            text={formatMessage({id:"app.text.noclear",defaultMessage:"不清晰"})}
            iconName=""
            type="button"
            className={styles.unClearBtn}
            onClick={this.soundUnClear}
          />
        </div>
        <RightBottom
          processNode={processNode}
          onRef={this.onRef}
          recordType="test"
          instructions={instructions}
          onPlayRecordSoundEnd={this.handlePlayRecordSoundEnd}
          onRecordAutoEnd={this.handleRecordAutoEnd}
          onCallbackRecordId={(tokenIds)=>this.handleRecordId(tokenIds)}
          onRecordTipPlayed={this.handleRecordTipPlayed}
          onVolumeMeter={this.onVolumeMeter}
          onTest={this.onTest}
        />
      </div>
    )
  }
}
