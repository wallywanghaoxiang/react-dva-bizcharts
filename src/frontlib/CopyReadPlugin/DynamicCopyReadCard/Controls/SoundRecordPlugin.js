import React, { PureComponent } from 'react';
import styles from './index.less';
import start from '@/frontlib/assets/start_record_btn.png';
import stop from '@/frontlib/assets/stop_record_btn.png';
import disable from '@/frontlib/assets/start_record_btn_disable.png';
import record from '@/frontlib/assets/record.gif';
import saverecord from '@/frontlib/assets/saverecord.gif';
import { message } from 'antd';
import { calculatScore, funcChina, sentRecScore, getRequest_obj,getRatio, unConvertNote } from '@/frontlib/utils/utils';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import emitter from '@/utils/ev';
import RealVolumeIcon from '@/frontlib/components/RealVolumeIcon/index';
import ProgressBar from '@/frontlib/components/ExampaperAttempt/Components/PaperTimeProcess/ProgressBar';

const messages = defineMessages({
  AudioRecording: { id: 'app.audio.recording', defaultMessage: '录音中' },
});
/**
 * 录音组件
 */
var ctx,
  can,
  index = 0,
  flag = true,
  wid = 300,
  hei = 64,
  x = 0,
  y = hei / 2,
  timestamp_arr = [],
  averageValue = 0,
  timer,
  globalTimer,
  renderCount = -1,
  cycle = 4,
  firstGetVolumn = true;
export default class SoundRecordPlugin extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isRecord: 0,
      time_second: 0,
      tokenId: '',
      isChange: false, //是否需要评分
      staticIndex: undefined,
      volumeData: null,
      ratio:1,
      request_obj:{},
      totalTime:0
    };
  }

  componentDidMount() {
    const { paperData, masterData, mainIndex ,isPlugin,subIndex} = this.props;
    let ratio = 1;
    if(isPlugin){
      ratio = Number(paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.markRatio)
    }else{
      ratio = getRatio(paperData, masterData);
    }
    this.state.ratio = 1;
    let result=getRequest_obj(paperData,masterData,subIndex,"CLOSED_ORAL",ratio);
    this.state.request_obj = result;
    console.log(result)
  }

  componentWillReceiveProps(nextProps) {
    const { paperData, masterData, mainIndex ,isPlugin,subIndex} = nextProps;
    let result=getRequest_obj(paperData,masterData,subIndex,"CLOSED_ORAL",this.state.ratio);
    this.state.request_obj = result;
  }

  //停止录音
  endRecord(type = undefined) {
    var vb = window.vb;
    var recordManager = vb.getRecorderManager();
    if(window.ExampaperStatus == "EXAM"){
      if (recordManager && vb.deviceState &&vb.deviceState.value === "recording" ) {
        try {
          recordManager.stop();
        } catch (e) {}
      }
    }else{
      if (recordManager ) {
        try {
          recordManager.stop();
        } catch (e) {}
      }
    }
    

    if (type == undefined) {
      this.setState({ isRecord: 2 });
    }

  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-02
   * @copyright 返回小题序号
   * @return    {[type]}    [description]
   */
  returnSubIndex(masterData) {
    let staticIndex = masterData.staticIndex;

    let mainData = masterData.mains;

    let subs = mainData[staticIndex.mainIndex].questions[staticIndex.questionIndex].subs;

    for (let i in subs) {
      if (Number(subs[i]) == Number(staticIndex.subIndex)) {
        return i;
      }
    }
  }

  //开始录音
  startRecord() {
    if(window.ExampaperStatus === "EXAM"){
        x = 0;//录音x轴清零
        let end = setInterval(function() {}, 100);
        let start = (end - 100) > 0 ? end - 100 : 0;
        for (let i = start; i <= end; i++) {
          if (Number(i) != Number(window.interval)) {
            clearInterval(i);
          }
        }
    }
    emitter.emit("startRecord", true);
    const { paperData, masterData } = this.props;
    let result= this.state.request_obj;
    let duration= result.duration
    this.setState({
      isRecord: 1,
      time_second: duration,
      totalTime:duration
    });

    let count = Number(duration);
    timer = setInterval(() => {
      count -= 1;
      this.setState({ time_second: count }, () => {
        if (count == 0 || count < 0) {
          clearInterval(timer);
        }
      });
    }, 1000);
    

    var vb = window.vb;
    //console.log(vb.getRecorderManager());

    var recordManager = vb.getRecorderManager();

    //录音启动前的回调
    recordManager.onStart(() => {
      console.log('vb-start--测试');
    });
    //录音结束后的回调 返回音频的ID，用于回放录音使用
    recordManager.onStop(tokenId => {
      console.log('vb-onStop-----测试');
      this.state.tokenId = tokenId;
      let end = setInterval(function() {}, 100);
      let start = (end - 100) > 0 ? end - 100 : 0;
      for (let i = start; i <= end; i++) {
        if (Number(i) != Number(window.interval)) {
          clearInterval(i);
        }
      }
      this.setState({ isRecord: 2 });
    });
    //录音实时音量回调
    recordManager.onVolumeMeter(data => {
      this.setState({
        volumeData:data
      })

    });

    //录音完成后，评分结果回调
    recordManager.onEval(result => {
      const { paperData, masterData } = this.props;
      let times=this.state.ratio;
      //console.log('----录音完成后-----');
      console.log(result);
      console.log('vb-onEval-----录音完成后');
      this.setState({ isRecord: 0 });
      let res = JSON.parse(result);
      res.result.overall = Math.round(res.result.overall / times);
      this.props.callback(res);
    });

    //录音错误回调
    recordManager.onError(error => {
      console.log(error);
      console.log('vb-onError-----测试');
      this.setState({ isRecord: 0 });
      if (typeof(error) == "string") {
        try{
          error = JSON.parse(error);
        }catch(e){
          console.error(e)
        }
      }
      if ((error.error).indexOf('AudioDeviceNotStart') > -1 && window.ExampaperStatus == 'EXAM') {
        return;
      }
      if (error.errId == 10010) {
        message.warning('评分服务异常，请稍后再试。');
      } else if (error.errId == 10011) {
        message.warning('设备没有插麦克风，或者没有允许浏览器使用麦克风。');
      } else {
        message.warning('评分服务异常，请稍后再试。');
      }
    });


    recordManager.start({
      duration: duration,
      hint: false,
      nsx: false,
      request: result.request_obj,
    });
  }


  componentWillUnmount() {
    console.log('录音组件删除！');
    this.endRecord('change');
    timestamp_arr = [];
    this.state.time_second = 0;
  }

  render() {
    const { isRecord,totalTime,volumeData } = this.state;

    const { paperData, masterData } = this.props;
    if (isRecord == -1) {
      return null;
    } else {
      return (
        <div  className={"SoundRecordPlugin"}>
          {/* 开始录音 */}
          <div className="right-bottom" style={{ display: isRecord == 0 ? '' : 'none' }}>
            <div>{/* <img src={start}/>*/}</div>
            <div className={'icon-btn audioStyle'}>
              <img src={start} onClick={this.startRecord.bind(this)} />
            </div>
          </div>
          {/* 录音中 */}
          <div className="right-bottom" style={{ display: isRecord == 1 ? '' : 'none' }}>
            <div className={styles.flex}>
              {/* <img src={record} /> */}
              <RealVolumeIcon data={volumeData} />
              <span className={styles.text}>{formatMessage(messages.AudioRecording)}</span>
              {/* <canvas id="canvas" ref="canvas" width={wid} height={hei} className={styles.canvas} />
              <div className={styles.bgline} /> */}
              <ProgressBar time={totalTime} isPlay={true} />
              <span className={styles.text}>倒计时</span>
              <span className={styles.redtext}>{this.state.time_second}</span>
              <span className={styles.text}>秒</span>
            </div>
            <div className={'icon-btn audioStyle'}>
              <img src={stop} onClick={this.endRecord.bind(this)} />
            </div>
          </div>

          {/* 评分中 */}

          <div className="right-bottom" style={{ display: isRecord == 2 ? '' : 'none' }}>
            <div className={styles.flex}>
              <img src={saverecord} />
              <span className={styles.text}>评分中，请稍候...</span>
            </div>
            <div className={'icon-btn audioStyle'}>
              <img src={disable} />
            </div>
          </div>
        </div>
      );
    }
  }
}
