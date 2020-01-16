/* eslint-disable no-bitwise */
/* eslint-disable jsx-a11y/media-has-caption */
import React, { PureComponent } from 'react';
import styles from './index.less';
import { fetchPaperFileUrl } from '@/services/api';
import vFacePic from "./assets/v_face_pic.png";

// 生成UUid;
function guid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,  (c)=>{
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
  });
}

/*
 * 获取图片组件
 */
export default class StemVideo extends PureComponent {

  // 生成uuid，唯一码，标识视频编号
  randomId = guid();

  state={
    audioUrl : "", // 视频的地址
  }

  componentDidMount() {
    const { id, url } = this.props;
    if( !url ){
      if(window.ExampaperStatus === 'EXAM') {
        const paperMd5 = localStorage.getItem('paperMd5');
        this.setState({
          audioUrl: `${window.paperUrl}/${paperMd5}/${id}`,
        },()=>{
          this.onload();
        });
      }else if(window.ExampaperStatus==="PREVIEW"){
        const accessToken = localStorage.getItem('access_token');
        this.setState({
          audioUrl: `/proxyapi/proxy/file/assets?id=${id}&key=${accessToken}`,
        },()=>{
          this.onload();
        });
      }else{
        fetchPaperFileUrl({
          fileId: id,
        }).then(e => {
          this.setState({
            audioUrl: e.data.path,
          },()=>{
          this.onload();
          });
        })
      }
    }
  }

  componentWillReceiveProps(nextProps){
    if(this.videoValue){
      if(nextProps.focusId !== this.randomId){
        this.videoValue.pause()
      }
    }
  }


  onload=()=>{
    const {callback} = this.props;
    if (this.videoValue) {

      this.videoValue.oncontextmenu = () =>false;

      this.videoValue.addEventListener('play', () => {
        callback( this.randomId );
      });

      this.videoValue.addEventListener('ended', () => {
      });
    }
  }

  render() {
    const { audioUrl } = this.state
    const { style, customStyle } = this.props

    return (
      <div className={styles.flex} style={customStyle}>
        {
          <div>
            <video
              ref={video=>{this.videoValue=video}}
              src={audioUrl}
              poster={vFacePic}
              preload="none"
              controls="controls"
              controlsList="nofullscreen nodownload noremoteplayback"
              width="400"
              style={style}
            >
              您的浏览器不支持播放该视频！
            </video>
          </div>
        }
      </div>
    );
  }
}
