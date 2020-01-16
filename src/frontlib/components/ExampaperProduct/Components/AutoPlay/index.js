import React, { PureComponent } from 'react';
import styles from './index.less';
import IconButton from '@/frontlib/components/IconButton';
import { fetchPaperFileUrl, fetchAudioFileUrl } from '@/services/api';
import AudioTextModal from './AudioTextModal/api';
import MediaTool from '@/frontlib/components/MediaTool';
import VB from '@/frontlib/utils/jssdk/src/VB';
import emitter from '@/utils/ev';
import {
  isNowRecording
} from '@/frontlib/utils/utils';
/*
    播放组件

/*
  播放组件
  * @Author    tina.zhang
  * @DateTime  2018-10-17
  * @param     {[type]}    id            音频id
  * @param     {[type]}    url           音频路径
  * @param     {[type]}    focusId       当前播放音频Id
  * @param     {[type]}    focus         音频焦点
  * @param     {[type]}    token_id      我的录音id
  * @param     {[type]}    callback      回调函数
  * 
  * @param     {[type]}    evaluations   教师互评处理
  * hiddenRecordAnswer=="online" 用于报告页的录音回放，如果是线上平台采用下载文件的方式，如果是考中采用音频流的方式
 */
export default class AutoPlay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: '',
      audioUrl2: '',
      isPlay: false,
      isLoad: true,
    };
  }

  componentDidMount() {
    const { id, url, id2 } = this.props;
    this.myAudio = document.createElement('audio'); //非缓存播放录音
    this.myAudio.addEventListener('ended', () => {
      this.setState({ isPlay: false });
    });
    if (window.ExampaperStatus == 'EXAM') {
      let paperMd5 = localStorage.getItem('paperMd5');
      let report_paperMd5 = localStorage.getItem('report_paperMd5');
      if (report_paperMd5) {
        paperMd5 = report_paperMd5;
      }
      if (url == undefined && id) {
        let self = this;
        if (id2 != undefined && id2 != null && id2 != '') {
          self.setState({
            audioUrl: window.paperUrl + '/' + paperMd5 + '/' + id,
            audioUrl2: window.paperUrl + '/' + paperMd5 + '/' + id2,
            isLoad: false,
          });
        } else {
          self.setState({
            audioUrl: window.paperUrl + '/' + paperMd5 + '/' + id,
            isLoad: false,
          });
        }
      } else {
        this.setState({ isLoad: false });
      }
    } else {
      if (url == undefined && id) {
        let self = this;

        if (id2 != undefined && id2 != null && id2 != '') {
          fetchPaperFileUrl({
            fileId: id,
          }).then(e1 => {
            fetchPaperFileUrl({
              fileId: id2,
            }).then(e2 => {
              if (e1.data && e2.data) {
                self.setState({
                  audioUrl: e1.data.path,
                  audioUrl2: e2.data.path,
                  isLoad: false,
                });
              }
            });
          });
        } else if (window.ExampaperStatus === 'PREVIEW') {
          const audioUrl1 =
            `/proxyapi/proxy/file/assets?id=` + id + `&key=${localStorage.getItem('access_token')}`;
          let audioUrl2;
          if (id2 != undefined && id2 != null && id2 != '') {
            audioUrl2 =
              `/proxyapi/proxy/file/assets?id=` +
              id2 +
              `&key=${localStorage.getItem('access_token')}`;
            self.setState({
              audioUrl: audioUrl1,
              audioUrl2: audioUrl2,
              isLoad: false,
            });
          } else {
            self.setState({
              audioUrl: audioUrl1,
              isLoad: false,
            });
          }
        } else {
          fetchPaperFileUrl({
            fileId: id,
          }).then(e => {
            if (e.data) {
              self.setState({
                audioUrl: e.data.path,
                isLoad: false,
              });
            }
          });
        }
      } else {
        this.setState({ isLoad: false });
      }
    }
    let audioData = this.audioValue;
    emitter.addListener('startProductVideo', e => {
      if (audioData) {
        audioData.pause();
      }
      this.setState({ isPlay: false });
      if (this.myAudio) {
        this.myAudio.pause();
      }
    });

    /**解决多个音频播放问题 */
    emitter.addListener('stopMyAudioSound', e => {
      if (e.token_id != this.props.id) {
        if (this.audioValue) {
          this.audioValue.pause();
        }
        this.setState({ isPlay: false });
      }
      if (e.token_id != this.props.token_id) {
        if (this.myAudio) {
          this.myAudio.pause();
        }
        this.setState({ isPlay: false });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const { focus, focusId, id, token_id, isPaperConfig } = nextProps;
    const { isPlay } = this.state;
    let audioData = this.audioValue;
    if (isPaperConfig) {
      //试卷结构
      if (focusId != id && focusId != '') {
        if (audioData) {
          audioData.pause();
        }
        if (this.myAudio) {
          this.myAudio.pause();
        }
        this.setState({ isPlay: false });
      }
    } else {
      //同一个页面控制只播放一个音频
      // if (id != undefined) {
      //   if (focus) {
      //     if (focusId != id && focusId != "") {
      //       if (this.myAudio) {
      //         this.myAudio.pause();
      //       }
      //       this.setState({ isPlay: false })
      //     }
      //   } else {
      //     // this.myAudio.pause();
      //     if (this.myAudio) {
      //       this.myAudio.pause();
      //     }
      //     this.setState({ isPlay: false })
      //   }
      // }
      // if (token_id != undefined) {
      //   if (focusId != token_id) {
      //     // vb.getPlayerManager().stop();
      //     if (this.myAudio) {
      //       this.myAudio.pause();
      //     }
      //     this.setState({ isPlay: false })
      //   }
      // }
    }
  }

  componentWillUnmount() {
    if (this.audioValue) {
      this.audioValue.pause();
    }
    if (this.myAudio) {
      this.myAudio.pause();
    }

    if (this.props.token_id) {
      if (window.vb) {
        var vb = window.vb;
      } else {
        var vb = new VB();
      }
      var PlayerMananger = vb.getPlayerManager();
      PlayerMananger.stop(); // Play the sound now
    }
  }

  start() {
    
    const { isPlay } = this.state;
    const { id, callback, isPaperConfig, isQuestionCard,isOneQuestionCard } = this.props;
    if(isOneQuestionCard){
      if(isNowRecording()) return;
    }else if(isNowRecording(false)) return;
    

    //let audioData = this.audioValue;
    let self = this;

    if (isQuestionCard || isOneQuestionCard) {
      emitter.emit('stopPromptSound');
      emitter.removeAllListeners('startRecord');
      emitter.addListener('startRecord', x => {
        if (x === true) {
          return;
        }
        if (!isPlay) {
          self.start();
        }
      });

      emitter.addListener('startRecord2', x => {
        self.setState({ isPlay: false });
      });
    }

    if (this.props.token_id) {
      if (window.vb) {
        var vb = window.vb;
      } else {
        window.vb = new VB();
        var vb = window.vb;
      }

      vb.getPlayerManager().stop();

      var PlayerMananger = vb.getPlayerManager();

      vb.getPlayerManager().onPlay(function() {
        console.log(self.props);
        window.focusId = self.props.focusId;
        console.log('V_onPlay:  ');
      });

      vb.getPlayerManager().onError(function(data) {
        console.log('V_onError:  ' + data);
      });

      vb.getPlayerManager().onStop(function(data) {
        console.log('V_onStop:  ' + data);
        console.log(self.props, window.focusId);
        self.setState({ isPlay: false });
      });

      if (isPlay) {
        PlayerMananger.stop(); // Play the sound now
        this.myAudio.pause();
      } else {
        emitter.emit('stopMyAudioSound', { token_id: this.props.token_id });
        if (
          this.props.hiddenRecordAnswer !== 'online' &&
          ((process.env.ENV_CONFIG && process.env.ENV_CONFIG.projectName === 'Exam') ||
            (vb && vb.recorderAudioList && vb.recorderAudioList[this.props.token_id]))
        ) {
          PlayerMananger.play({ tokenId: this.props.token_id });
        } else {
          // 报告页
          if (process.env.ENV_CONFIG && process.env.ENV_CONFIG.projectName === 'Exam') {
            // 考中
            let audioStreaming =
              `/proxyapi/proxy/file/audio/assets?id=` +
              this.props.token_id +
              `&key=${localStorage.getItem('access_token')}`;
            this.myAudio.src = audioStreaming;
            this.myAudio.type = 'audio/mpeg';
            this.myAudio.play();

            // PlayerMananger.play({ audioStreaming: audioStreaming});//播放音频流
          } else {
            fetchAudioFileUrl({
              //线上平台，下载音频文件
              tokenId: this.props.token_id,
            }).then(e => {
              if (e.data) {
                this.myAudio.src = e.data.path;
                this.myAudio.type = 'audio/mp3';
                this.myAudio.play();
                // PlayerMananger.play({ audioUrl: e.data.path });
              }
            });
          }
        }
        if (callback) {
          callback(this.props.token_id);
        }
      }
    } else if (this.props.id) {
      emitter.emit('stopMyAudioSound', { token_id: this.props.id });

      // 试卷结构音频播放
      if (isPaperConfig) {
        const audioData = this.audioValue;
        if (isPlay) {
          audioData.pause(); // Play the sound now
        } else {
          audioData.play(0); // Play the sound now
        }
      } else if (isPlay) {
        this.setState({ isPlay: false });
      }
      if (callback) {
        callback(id);
      }
    } else {
      //试卷结构音频播放
      if (isPaperConfig) {
        let audioData = this.audioValue;
        if (isPlay) {
          audioData.pause(); // Play the sound now
        } else {
          audioData.play(0); // Play the sound now
        }
      }

      if (callback) {
        callback(id);
      }
    }

    this.setState({ isPlay: !isPlay });
  }

  componentDidUpdate() {
    let that = this;
    if (this.audioValue) {
      this.audioValue.addEventListener('ended', function() {
        //console.log('=======播放結束');
        that.setState({ isPlay: false });
      });
    }
  }
  render() {
    const { isPlay, audioUrl, audioUrl2 } = this.state;

    // console.log(audioUrl,audioUrl2,this.props.url)

    const { type, className, text, style, id, token_id, isPaperConfig, evaluations,isOneQuestionCard } = this.props;

    if (this.state.isLoad) {
      return null;
    } else {
      if (text == undefined && (id == undefined || id == '') && token_id == undefined) {
        //空占位图标
        return (
          <div
            className={styles.addquestion_audio_disabled + ' myAudio ' + className}
            style={style}
          >
            <i className={'iconfont icon-wave'} />
          </div>
        );
      } else {
        if (isPaperConfig) {
          //试卷结构的播放图标

          return (
            <i className="right-icon2" style={isPlay ? { background: '#FF9900' } : {}}>
              <div className={styles.addquestion_audio + ' myAudio ' + className} style={style}>
                <audio
                  className="audioHide"
                  ref={audio => {
                    this.audioValue = audio;
                  }}
                  src={this.props.url || audioUrl}
                  preload="metadata"
                  controls
                />
                <IconButton
                  iconName="icon-wave"
                  className={isPlay ? styles.play : styles.myIcon}
                  onClick={this.start.bind(this)}
                />
              </div>
            </i>
          );
        } else if (text) {
          //带音频原文
          return (
            <div
              className={
                isPlay
                  ? (audioUrl2 != '' ? styles.addquestion_btn_open2 : styles.addquestion_btn_open) +
                    ' myAudio ' +
                    className
                  : styles.addquestion_btn + ' myAudio ' + className
              }
              style={style}
            >
              {/* <audio 
                        className="audioHide" 
                        ref={(audio) => { this.audioValue = audio; }} 
                        src={this.props.url || audioUrl}
                        preload="metadata" controls 
                    /> */}
              <IconButton
                iconName={isPlay ? 'icon-close' : 'icon-wave'}
                className={isPlay ? styles.plays : styles.myIcon}
                onClick={this.start.bind(this)}
              />
              {isPlay && <MediaTool audioSrc={this.props.url || audioUrl} audioSrc2={audioUrl2} />}
              <div className={styles.addquestion_line} />
              <IconButton
                iconName="icon-text"
                className={styles.myIcon}
                onClick={() => {
                  if(isOneQuestionCard){
                    if(isNowRecording()) return;
                  }
                  if(isNowRecording(false)) return;
                  
                  AudioTextModal({
                    dataSource: text,
                    evaluations,
                    callback: (paperHeadName, navTime, state) => {},
                  });
                }}
              />
            </div>
          );
        } else if (this.props.token_id) {
          //我的录音
          return (
            <div className={styles.addquestion_audio + ' myAudio ' + className} style={style}>
              <IconButton
                iconName="icon-wave"
                className={isPlay ? styles.play : styles.myIcon}
                onClick={this.start.bind(this)}
              />
            </div>
          );
        } else {
          //不带音频原文
          return (
            <div
              className={
                isPlay
                  ? (audioUrl2 != ''
                      ? styles.addquestion_audio_open2
                      : styles.addquestion_audio_open) +
                    ' myAudio ' +
                    className
                  : styles.addquestion_audio + ' myAudio ' + className
              }
              style={style}
            >
              <IconButton
                iconName={isPlay ? 'icon-close' : 'icon-wave'}
                className={isPlay ? styles.plays : styles.myIcon}
                onClick={this.start.bind(this)}
              />
              {isPlay && <MediaTool audioSrc={this.props.url || audioUrl} audioSrc2={audioUrl2} />}
            </div>
          );
        }
      }
    }
  }
}
