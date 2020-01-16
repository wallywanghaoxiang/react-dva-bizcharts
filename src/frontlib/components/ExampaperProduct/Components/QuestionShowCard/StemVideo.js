import React, { PureComponent } from 'react';
import styles from './index.less';
import { fetchPaperFileUrl } from '@/services/api';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import emitter from '@/utils/ev';
import {
  isNowRecording
} from '@/frontlib/utils/utils';

/*
    获取图片组件

 */


export default class StemVideo extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: '',
      isPlay: false
    }
  }

  componentDidMount() {
    const { id, url } = this.props;
    let self = this;
    if (url == undefined) {
      
      if (window.ExampaperStatus == 'EXAM') {
        let paperMd5 = localStorage.getItem('paperMd5');
        self.setState({
          audioUrl: window.paperUrl + '/' + paperMd5 + '/' + id,
          // audioUrl: "/paperapi/" + paperMd5 + "/" + id,
        },()=>{
          this.videoValue.addEventListener('canplay', function() {
            if (self.videoValue) {
              (self.videoValue).addEventListener('play', function() {
                if(isNowRecording()) {self.videoValue.pause();return};
                console.log('视频播放'+id);
                emitter.emit('startProductVideo',{ id : id});
              }, false)
            }
          })
        });
      } else {
        fetchPaperFileUrl({
          fileId: id,
        }).then(e => {
          // console.log(e.data.path)
          self.setState({
            audioUrl: e.data.path,
          },
            e => {
              this.videoValue.addEventListener('canplay', function() {
                if (self.videoValue) {
                  (self.videoValue).addEventListener('play', function() {
                    if(isNowRecording()) {self.videoValue.pause();return};
                    console.log('视频播放'+id);
                    emitter.emit('startProductVideo',{ id : id});
                  }, false)
                  self.videoValue.oncontextmenu = function(){//取消右键事件
                      return false;
                  };
                }
              })
            });
        });
      }
    }


    emitter.addListener('stopPromptSound', x => { 
      if (self.videoValue) {
        self.videoValue.pause();
      }
    });

    emitter.addListener('startRecord', x => { 
      // if(x === true){
        if (self.videoValue) {
          self.videoValue.pause();
        }
      // }
    });
    
  }


  // componentDidMount() {
  //   const { id, url } = this.props;
  //   let self = this;
  //   if (url == undefined) {
  //     if (window.ExampaperStatus == 'EXAM') {
  //       let paperMd5 = localStorage.getItem('paperMd5');
  //       self.setState({
  //         audioUrl: window.paperUrl + '/' + paperMd5 + '/' + id,
  //         // audioUrl: "/paperapi/" + paperMd5 + "/" + id,
  //       });
  //     } else {
  //       fetchPaperFileUrl({
  //         fileId: id,
  //       }).then(e => {
  //         // console.log(e.data.path)
  //         self.setState({
  //           audioUrl: e.data.path,
  //         },
  //           e => {
  //             this.videoValue.addEventListener('canplay', function() {
  //               if (self.videoValue) {
  //                 (self.videoValue).addEventListener('play', function() {
  //                   console.log('视频播放'+id);
  //                   emitter.emit('startReportVideo',{ id : id});
  //                 }, false)
  //               }
  //               console.log('视频加载完毕');
  //             })
  //           });
  //       });
  //     }
  //   }

  //   emitter.addListener("startReportVideo", (e) => {
  //     if(e.id !== id){
  //       self.videoValue.pause(0)
  //     }
  //   });

  // }




  render() {

    const { isPlay, audioUrl } = this.state

    const { type, className, style, customStyle } = this.props
    return <div className={styles.flex} style={customStyle}>
              {audioUrl && <div><video src={audioUrl} ref={(video) => { this.videoValue = video; }} controls="controls" controlslist="nodownload" style={style}>{formatMessage({id:"app.text.videotip",defaultMessage:"您的浏览器不支持播放该视频！"})}</video></div>}
            </div>

  }
}
