import React, { Component } from 'react';
import './index.less';
import { fetchPaperFileUrl } from '@/services/api';
import emitter from '@/utils/ev';

/**
 *  提示语展示组件
 *
 * @author tina.zhang
 * @date 2019-01-27
 * @class PromptSound
 * @extends {Component}
 * @params : hint       :  提示语数据 （object）
 *           idx        :  当前响应的index
 *           callback   :
 */
class PromptSound extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isPlay: false,
      audioUrl: '',
      isLoad: true
    }
  }

  componentDidMount() {
    this.getResource(this.props);
    const self = this;
    emitter.removeAllListeners("stopPromptSound");
    emitter.addListener('stopPromptSound', x => { 
        let audioData = self.audioValue;
        if(audioData && self.state.isPlay){
          audioData.pause(); // Play the sound now
        }
    });
  }

  componentWillReceiveProps(nextProps) {
    this.getResource(nextProps);
    const idx = nextProps.idx;
    let audioData = this.audioValue;
    //console.log(idx,this.props.hint.audio);
    if (idx && idx !== this.props.hint.audio) {
      //console.log('=======停止播放=======')
      audioData.pause();
      this.setState({
        isPlay: false
      })
    }
  }

  //获取资源
  getResource(props) {

    const { hint } = props;
    let self = this;
    if (window.ExampaperStatus === 'EXAM') {
      let paperMd5 = localStorage.getItem('paperMd5');
      if (hint.audio) {
        self.setState({
          audioUrl: window.paperUrl + '/' + paperMd5 + '/' + hint.audio,
          isLoad: false,
        });
      } else {
        this.setState({ isLoad: false, audioUrl: '' })
      }
    } else {
      if (hint.audio) {
        fetchPaperFileUrl({
          fileId: hint.audio
        }).then((e) => {
          if (e.data) {
            self.setState({
              audioUrl: e.data.path,
              isLoad: false
            })
          }
        })
      } else {
        this.setState({ isLoad: false, audioUrl: '' })
      }
    }

  }
  playSound(e) {
    emitter.emit("startRecord");
    e.stopPropagation();
    this.props.callback(this.props.hint.audio);
    const { isPlay } = this.state;
    let audioData = this.audioValue;
    if (isPlay) {
      audioData.pause(); // Play the sound now
    } else {
      audioData.play(0); // Play the sound now
    }

    this.setState({
      isPlay: !isPlay
    })

  }

  /**
   * 文本处理
   *
   * @author tina.zhang
   * @date 2019-01-15
   * @param {*} type
   * @returns
   * @memberof PromptSound
   */
  switchName(type) {
    switch (type) {
      case 'stemListening':
        return '听题前提示';
      case 'readTime':
        return '读题前提示';
      case 'prepareTime':
        return '准备前提示';
      case 'answerTime':
        return '答题前提示';
      case 'subQuestionStemListening':
        return '小题听题前提示';
      case 'subQuestionReadTime':
        return '小题读题前提示';
      case 'subQuestionPrepareTime':
        return '小题准备前提示';
      default:
        return '小题准备前提示';
        break;
    }
  }
  render() {
    const { audioUrl } = this.state;
    const { hint } = this.props;

    // console.log('======PromptSound=====', hint);
    if (this.state.isLoad) {
      return null;
    } else {
      return (
        <div className="frontlib_promptSound">
                <audio 
                    className="audioHide" 
                    ref={(audio) => { this.audioValue = audio; }} 
                    src={audioUrl}
                    preload="metadata" controls 
                />
                <div className="tit">{this.switchName(hint.name)}</div>
                <span className="txt">{hint.text}</span>
                {audioUrl&&audioUrl!==''?<span className="play"><i className="iconfont icon-wave" onClick={this.playSound.bind(this)}></i></span>:null}
            </div>
      );
    }

  }
}

export default PromptSound;
