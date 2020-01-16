import React, { PureComponent } from 'react';
import styles from './index.less';
import emitter from '@/utils/ev';
import IconTips from '@/frontlib/components/IconTips';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
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
    };
  }

  componentDidMount() {}

  change() {
    let self = this;
    this.setState({
        isPlay: !this.state.isPlay,
      },
      e => {
        self.props.index.changePlay(self.state.isPlay);
      }
    );
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
    const { end_time, isPlay, onEval } = this.state;
    const { isRecord, callback } = this.props;
    return (
      <div className={styles.flex}>
        <div
          className={styles.left_bottom_border}
          onClick={e => {
            var vb = window.vb;
            var recordManager = vb.getRecorderManager();
            emitter.emit('changePlay', true);
            if(window.ExampaperStatus === 'EXAM'){
              if( vb.deviceState.value === "recording" ){
                recordManager.stop();
              }
            }else{
              recordManager.stop();
            }
            if(callback){
              callback("up")
            }else{
              this.props.index.props.self.props.index.stopRecorded('up', onEval);
            }

          }}
        >
          <IconTips text="上一步" iconName="icon-v-step-up" />
        </div>
        <div className={styles.left_bottom_border_x} onClick={this.change.bind(this)}>
          {isPlay ? (
            isRecord ? (
              <IconTips text="终止录音" iconName="icon-v-stop" />
            ) : (
              <IconTips text={formatMessage(messages.Pause)} iconName="icon-v-pause" />
            )
          ) : isRecord ? (
            <IconTips text="下一题" iconName="icon-v-play" />
          ) : (
            <IconTips text={formatMessage(messages.Play)} iconName="icon-v-play" />
          )}
        </div>
        <div
          className={styles.left_bottom_border}
          onClick={e => {
            var vb = window.vb;
            var recordManager = vb.getRecorderManager();
            emitter.emit('changePlay', true);
            if(window.ExampaperStatus === 'EXAM'){
              if( vb.deviceState.value === "recording" ){
                recordManager.stop();
              }
            }else{
              recordManager.stop();
            }
            if(callback){
              callback("down")
            }else{
              this.props.index.props.self.props.index.stopRecorded('down', onEval);
            }
          }}
        >
          <IconTips text="下一步" iconName="icon-v-step-down" />
        </div>
      </div>
    );
  }
}
