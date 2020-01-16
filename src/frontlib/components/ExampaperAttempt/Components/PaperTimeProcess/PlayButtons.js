import React, { PureComponent } from 'react';
import styles from './index.less';
import emitter from '@/utils/ev';
import IconTips from '@/frontlib/components/IconTips';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
import {
  isNowRecording
} from '@/frontlib/utils/utils';
const messages = defineMessages({
  Play: {id:'app.play',defaultMessage:'播放'},
  Pause: {id:'app.pause',defaultMessage:'暂停'},
});
/*
    暂停快进组件
  * @Author    tina.zhang
  * @DateTime  2018-10-17
  * @param     {[type]}    time          倒计时时长
 */

export default class PlayButtons extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      end_time: props.time,

      isPlay: true,

      onEval: true,

      isVideo:false
    };
  }

  componentDidMount() {
    const { script } = this.props;
    if(script&&script.stepPhase == 'VIDEO_PHASE'){
      this.setState({isVideo:true});
      setTimeout(()=>{
        this.setState({isVideo:false});
      },1000)
    }
  }

  change() {
    let self = this;
    
    this.setState({
        isPlay: !this.state.isPlay,
      },
      e => {
        const { script } = self.props;
        if(script&&script.stepPhase == 'VIDEO_PHASE'){
          emitter.emit('startVideo', {id:script.resourceUrl,isPlay:self.state.isPlay});
        }
        self.props.index.changePlay(self.state.isPlay);
      }
    );
  }

  changeVideo(type){
    const { script, callback } = this.props;
    const { onEval } = this.state;
    var vb = window.vb;
    var recordManager = vb.getRecorderManager();

    let self = this;
    if(script && script.stepPhase === 'VIDEO_PHASE'){//视频切换
      emitter.emit('startVideo', {
        id:script.resourceUrl,
        isPlay:self.state.isPlay,
        reLoad:true
      });

        if(window.ExampaperStatus === 'EXAM'){
          if( vb.deviceState.value === "recording" ){
            recordManager.stop();
          }
        }else{
          recordManager.stop();
        }
        if(callback){
          callback(type)
        }else{
          self.props.index.props.self.props.index.stopRecorded(type, onEval);
        }
     
    }else{
      if(window.ExampaperStatus === 'EXAM'){
        if( vb.deviceState.value === "recording" ){
          recordManager.stop();
        }
      }else{
        recordManager.stop();
      }
      if(callback){
        callback(type)
      }else{
        this.props.index.props.self.props.index.stopRecorded(type, onEval);
      }

    }
  }

  stop() {
    let self = this;
    this.setState({
        isPlay: false,
      },
      e => {
        self.props.index.changePlay(false);
      }
    );
  }

  componentWillReceiveProps(nextProps) {
    const { script } = nextProps;

    if (script) {
      if (nextProps.automatiEnd == (script.stepLabel + '').split('|')[0] || nextProps.automatiEnd == (script.stepLabel + '').split('|')[2]) {
        this.setState({ onEval: true });
      } else {
        this.setState({ onEval: false });
      }

      if (nextProps.onEval) {
        this.setState({ onEval: true });
      }
    }
  }


  render() {
    const { end_time, isPlay, onEval,isVideo } = this.state;
    const { isRecord, callback,script } = this.props;
    return (
      <div className={styles.flex}>
        <div
          className={styles.left_bottom_border}
          onClick={e => {

            if(isNowRecording()) return;
            if(isVideo){
              return
            }
            // var vb = window.vb;
            // var recordManager = vb.getRecorderManager();
            emitter.emit('changePlay', true);
            this.changeVideo("up");
            
            // if(window.ExampaperStatus === 'EXAM'){
            //   if( vb.deviceState.value === "recording" ){
            //     recordManager.stop();
            //   }
            // }else{
            //   recordManager.stop();
            // }
            // if(callback){
            //   callback("up")
            // }else{
            //   this.props.index.props.self.props.index.stopRecorded('up', onEval);
            // }

          }}
        >
          <IconTips text={formatMessage({id:"app.text.prestep",defaultMessage:"上一步"})} iconName="icon-v-step-up" />
        </div>
        <div className={styles.left_bottom_border_x} onClick={this.change.bind(this)}>
          {isPlay ? (
            isRecord ? (
              <IconTips text={formatMessage({id:"app.text.stoprecord",defaultMessage:"终止录音"})} iconName="icon-v-stop" />
            ) : (
              <IconTips text={formatMessage(messages.Pause)} iconName="icon-v-pause" />
            )
          ) : isRecord ? (
            <IconTips text={formatMessage({id:"app.text.nextquestion",defaultMessage:"下一题"})} iconName="icon-v-play" />
          ) : (
            <IconTips text={formatMessage(messages.Play)} iconName="icon-v-play" />
          )}
        </div>
        <div
          className={styles.left_bottom_border}
          onClick={e => {
            if(isNowRecording()) return;
            if(isVideo){
              return
            }
            // var vb = window.vb;
            // var recordManager = vb.getRecorderManager();
            emitter.emit('changePlay', true);
            this.changeVideo("down");

            // if(window.ExampaperStatus === 'EXAM'){
            //   if( vb.deviceState.value === "recording" ){
            //     recordManager.stop();
            //   }
            // }else{
            //   recordManager.stop();
            // }
            // if(callback){
            //   callback("down")
            // }else{
            //   this.props.index.props.self.props.index.stopRecorded('down', onEval);
            // }
          }}
        >
          <IconTips text={formatMessage({id:"app.text.nextstep",defaultMessage:"下一步"})} iconName="icon-v-step-down" />
        </div>
      </div>
    );
  }
}
