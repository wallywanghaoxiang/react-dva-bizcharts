import React, { PureComponent } from 'react';
import styles from './index.less';
import { fetchPaperFileUrl } from '@/services/api';
import emitter from '@/utils/ev';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';

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
        });
      } else {
        fetchPaperFileUrl({
          fileId: id,
        }).then(e => {
          self.setState({
            audioUrl: e.data.path,
          },
            e => {
              this.videoValue.addEventListener('canplay', function() {
                if (self.videoValue) {
                  self.videoValue.oncontextmenu = function(){//取消右键事件
                      return false;
                  };
                }
              })
            });
        });
      }
    }

    // 绑定试卷的开始暂停的监听事件
    emitter.addListener("startVideo", (tag) => {
        console.log("播放视频");
        window.video = document.getElementById(tag.id);
        if(tag.reLoad){
          if(video && id == tag.id){
            video.currentTime = 0;
            video.pause(0); //播放控制
          }
        }else if(tag.isPlay ==undefined){
          if(video && id == tag.id){
            video.play(); //播放控制
          }
        }else{
          if(video && id == tag.id){
            if(tag.isPlay){
              video.play(0); //播放控制
            }else{
              // video.currentTime = 0;
              video.pause(0); //播放控制
            }
           
          }
        }
        
        
    });


    // 绑定试卷的开始暂停的监听事件
    emitter.addListener("stopVideo", (tag) => {
      // console.log("停止播放视频");
      if(video){
        video.pause(0); //播放控制
      }
       
    });
    
  }



  render() {

    const { isPlay, audioUrl } = this.state
    const { type, className, style, customStyle,id } = this.props

    return <div className={styles.flex} style={customStyle}>
              {audioUrl && <div><video src={audioUrl} ref={(video) => { this.videoValue = video; }} style={style} id={id}>{formatMessage({id:"app.text.videotip",defaultMessage:"您的浏览器不支持播放该视频！"})}</video></div>}
            </div>

  }
}
