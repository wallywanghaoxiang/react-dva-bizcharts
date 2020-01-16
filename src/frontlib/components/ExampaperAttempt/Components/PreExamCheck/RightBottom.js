import React, { PureComponent } from 'react';
import { message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import waiting from '@/frontlib/assets/ExampaperAttempt/waiting.gif';
import answer from '@/frontlib/assets/ExampaperAttempt/answer.gif';
import hint from '@/frontlib/assets/ExampaperAttempt/hint.gif';
import finfish from '@/frontlib/assets/ExampaperAttempt/record_finish.gif';
import CountDown from '../PaperTimeProcess/CountDown';
import RealVolumeIcon from '@/frontlib/components/RealVolumeIcon/index';
import RecordProgressBar from './RecordProgressBar';
import styles from './index.less';

const messages = defineMessages({
  AudioRecording: { id: 'app.audio.recording', defaultMessage: '录音中' },
  MakeSelection: { id: 'app.make.selection', defaultMessage: '请选择' },
});

// 默认录音总时长
const totalTime = 10;

export default class RightBottom extends PureComponent {

  state={
    endTime: totalTime, // 录音总时长
    tokenId: '',
    isSetTimeOut: false,
    tokenId_arr: [],      // 存储所有录音id
    volumeData:null,
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  componentWillReceiveProps( nextProps ) {
    const { isSetTimeOut } = this.state;
    const { processNode, onRecordTipPlayed, instructions } = this.props;
    const { playTipSoundResource } = instructions;
    if (!isSetTimeOut) {
      // 如果 录音状态由非录音状态，转换成录音状态是触发
      if ( nextProps.processNode === 'recording' && nextProps.processNode !== processNode ) {
        // 播放开始录音
        this.setState({
          endTime: totalTime
        },()=>{
          playTipSoundResource({
            type: "TYPE_D2",
            success: () => {
              this.startRecord();
              onRecordTipPlayed();
            },
          });
        });
      }
    }
  }

  componentWillUnmount() {
    // 强制结束 放音录音
    this.endRecord();
  }

  // 播放录音
  playRecordSound = () => {
    const { tokenId } = this.state;
    const { onPlayRecordSoundEnd } = this.props;
    const playerManager = window.vb.getPlayerManager();
    playerManager.play({ tokenId });
    playerManager.onStop(() => {
      onPlayRecordSoundEnd();
    });
    playerManager.onError(() => {
      onPlayRecordSoundEnd();
    })
  }

  // 倒计时
  autoTime=()=>{
    this.setState({ isSetTimeOut: true });
    let count = Number(totalTime);
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      count -= 1;
      this.setState({ endTime: count }, () => {
        if (count === 0 || count < 0) {
          clearInterval(this.timer);
        }
      });
    }, 1000);
  }

  // 开始录音
  startRecord=()=>{
    const { instructions, onCallbackRecordId, recordType = "normal"} = this.props;
    const { playTipSoundResource } = instructions;
    const { endTime } = this.state;
    const { vb } = window;
    const recordManager = vb.getRecorderManager();

    let testResult = ""; // 测试结果

    // 开始倒计时
    this.autoTime();

    // 录音启动前的回调
    recordManager.onStart(() => {
      console.log('vb-start--测试');
      // 清空当期记录的录音记录
      const { onVolumeMeter } = this.props;
      if( onVolumeMeter && typeof(onVolumeMeter) === "function" ) {
        onVolumeMeter("new");
      }
    });

    // 获取测试结果
    recordManager.onTest(data => {
      const { onTest } = this.props;
      const { result } = data || {};
      switch (result) {
        // 录音质量正常
        case 97: testResult = "Normal"; break;
        // 信噪比不正常
        case 98: testResult = "Snr"; break;
        // 声音有截幅
        case 99: testResult = "Clip"; break;
        // 音量不正常
        case 100: testResult = "Volume"; break;
        // 系统错误
        case 101: testResult = "System"; break;
        default: break;
      }
      if( onTest && typeof(onTest) === "function" ) {
        onTest(data);
      }
    });

    // 录音实时音量回调
    recordManager.onVolumeMeter(data => {
      const { onVolumeMeter } = this.props;
      this.setState({ volumeData:data })
      if( onVolumeMeter && typeof(onVolumeMeter) === "function" ) {
        onVolumeMeter(data);
      }
    });


    // 录音结束后的回调 返回音频的ID，用于回放录音使用
    recordManager.onStop(data => {

      // console.log(data);
      const { tokenId } = data;
      const { tokenId_arr : tokenIdArr } = this.state;
      tokenIdArr.push(tokenId);

      this.setState({
        tokenId,
        tokenId_arr : tokenIdArr,
        isSetTimeOut : false,
      });

      onCallbackRecordId(tokenIdArr);
      playTipSoundResource({
        type: "TYPE_D3",
        success: () => {
          const { processNode, onRecordAutoEnd } = this.props;
          if (processNode !== 'recordEnd') {
            // 正常结束
            onRecordAutoEnd(testResult);
          }
        },
        error:()=>{
          const { processNode, onRecordAutoEnd } = this.props;
          if (processNode !== 'recordEnd') {
            // 正常结束
            onRecordAutoEnd(testResult);
          }
        }
      });
      clearInterval(this.timer);
    });



    // 录音错误回调
    recordManager.onError(error => {
      console.log("========设备检测环节 录音出错========",error);

      // 状态还原
      this.setState({isSetTimeOut : false });
      const { processNode, onRecordAutoEnd } = this.props;
      if (processNode !== 'recordEnd') {
        onRecordAutoEnd("");
      }

      // if( this.timer ) clearInterval(this.timer);

      if ((error.error).indexOf('AudioDeviceNotStart') > -1 && window.ExampaperStatus === 'EXAM') {
        return;
      }

      if (window.ExampaperStatus !== 'EXAM') {
        if (error.errId === 10010) {
          message.warning('评分不成功，请稍后再试。');
        } else if (error.errId === 10011) {
          message.warning('设备没有插麦克风，或者没有允许浏览器使用麦克风。');
        } else {
          message.warning('评分不成功，请稍后再试。');
        }
      } else {
        message.warning('评分不成功，请稍后再试。');
      }
    });

    if (recordType === "test") {
      // 测试录音使用
      recordManager.test({
        duration: endTime,
        resourceType: "",
        nsx: false,
      });
    } else {
      // 正常录音使用
      recordManager.start({
        duration: endTime,
        nsx: false,
        resourceType:"off"
      });
    }
  }

  // 结束录音
  endRecord=()=>{
    const {vb} = window;
    const recordManager = vb.getRecorderManager();
    if (recordManager && vb.deviceState.value === "recording" ) {
      try {
        recordManager.stop();
      } catch (e) {
        console.log(e);
      }
    }
  }




  render() {
    const { endTime,volumeData,isSetTimeOut } = this.state;
    const { processNode } = this.props; // free,listenOrigin,recording,recordEnd,playBacksound

    // 空闲中
    if (processNode === 'free') {
      return (
        <div>
          <div className="right-bottom">
            <div className={styles.flex}>
              <img src={waiting} alt="" />
              <span className={styles.text}>空闲中</span>
            </div>
            <div />
          </div>
        </div>
      );
    }

    // 听原音
    if (processNode === 'listenOrigin') {
      return (
        <div>
          <div className="right-bottom">
            <div className={styles.flex}>
              <img src={hint} alt="" />
              <span className={styles.text}>听原音</span>
            </div>
          </div>
        </div>
      );
    }

    // 录音中
    if (processNode === 'recording') {
      return (
        <div>
          <div className="right-bottom">
            <div className={styles.flex}>
              <RealVolumeIcon data={volumeData} />
              <span className={styles.text}>录音中</span>
              <RecordProgressBar time={totalTime} isPlay={isSetTimeOut} />
              <CountDown time={endTime} />
            </div>
          </div>
        </div>
      );
    }

    // 录音结束
    if (processNode === 'recordEnd') {
      return (
        <div>
          <div className="right-bottom">
            <div className={styles.flex}>
              <img src={finfish} alt="" />
              <span className={styles.text}>录音完成</span>
            </div>
          </div>
        </div>
      );
    }

    // 回放录音
    if (processNode === 'playBacksound') {
      return (
        <div>
          <div className="right-bottom">
            <div className={styles.flex}>
              <img src={hint} alt="" />
              <span className={styles.text}>听回放</span>
            </div>
          </div>
        </div>
      );
    }

    // 回放录音结束
    if (processNode === 'playBacksoundEnd') {
      return (
        <div>
          <div className="right-bottom">
            <div className={styles.flex}>
              <img src={answer} alt="" />
              <span className={styles.text}>{formatMessage(messages.MakeSelection)}</span>
            </div>
          </div>
        </div>
      );
    }

    return null;
  }
}
