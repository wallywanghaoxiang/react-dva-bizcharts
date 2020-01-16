import React, { PureComponent } from 'react';
import styles from './index.less';
import IconButton from '@/frontlib/components/IconButton';
import { fetchPaperFileUrl, fetchAudioFileUrl } from '@/services/api';
import AudioTextModal from './AudioTextModal/api';
import MediaTool from '@/frontlib/components/MediaTool';
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
 */
export default class AutoPlay extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: '',
      isPlay: false,
      isLoad: true,
    };
  }

  componentDidMount() {
    const { id, url } = this.props;
    if (url == undefined && id) {
      let self = this;
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
    } else {
      this.setState({ isLoad: false });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { focus, focusId, id } = nextProps;
    const { isPlay } = this.state;
    // let audioData = this.audioValue;
    // 同一个页面控制只播放一个音频
    if (id != undefined) {
      if (focus) {
        if (focusId != id && focusId != '') {
          // audioData.pause();
          this.setState({ isPlay: false });
        }
      } else {
        // audioData.pause();
        this.setState({ isPlay: false });
      }
    }
  }

  start() {
    const { isPlay } = this.state;
    const { id, callback, isPaperConfig } = this.props;
    //let audioData = this.audioValue;
    var vb = window.vb;

    if (this.props.token_id) {
      var PlayerMananger = vb.getPlayerManager();
      if (isPlay) {
        PlayerMananger.stop(); // Play the sound now
      } else {
        PlayerMananger.play({ tokenId: this.props.token_id });
        // if (process.env.ENV_CONFIG && process.env.ENV_CONFIG.projectName === 'Exam') {
        //   // 考中
        //   let audioStreaming =
        //     `/proxyapi/proxy/file/audio/assets?id=` +
        //     this.props.token_id +
        //     `&key=${localStorage.getItem('access_token')}`;
        //   this.myAudio.src = audioStreaming;
        //   this.myAudio.type = 'audio/mpeg';
        //   this.myAudio.play();

        //   //PlayerMananger.play({ audioStreaming: audioStreaming});//播放音频流
        // } else {
        //   fetchAudioFileUrl({
        //     //线上平台，下载音频文件
        //     tokenId: this.props.token_id,
        //   }).then(e => {
        //     if (e.data) {
        //       this.myAudio.src = e.data.path;
        //       this.myAudio.type = 'audio/mp3';
        //       this.myAudio.play();
        //       // PlayerMananger.play({ audioUrl: e.data.path });
        //     }
        //   });
        // }
      }

      vb.getPlayerManager().onPlay(function() {
        console.log('V_onPlay:  ');
      });

      vb.getPlayerManager().onError(function(data) {
        console.log('V_onError:  ' + data);
      });
    } else {
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

  render() {
    const { isPlay, audioUrl } = this.state;

    const { type, className, text, style, id, token_id, isPaperConfig } = this.props;

    if (this.state.isLoad) {
      return null;
    } else {
      if (text == undefined && id == undefined && token_id == undefined) {
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
                  ? styles.addquestion_btn_open + ' myAudio ' + className
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
              {isPlay && <MediaTool audioSrc={this.props.url || audioUrl} />}
              <div className={styles.addquestion_line} />
              <IconButton
                iconName="icon-text"
                className={styles.myIcon}
                onClick={() => {
                  AudioTextModal({
                    dataSource: text,
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
                  ? styles.addquestion_audio_open + ' myAudio ' + className
                  : styles.addquestion_audio + ' myAudio ' + className
              }
              style={style}
            >
              <IconButton
                iconName={isPlay ? 'icon-close' : 'icon-wave'}
                className={isPlay ? styles.plays : styles.myIcon}
                onClick={this.start.bind(this)}
              />
              {isPlay && <MediaTool audioSrc={this.props.url || audioUrl} />}
            </div>
          );
        }
      }
    }
  }
}
