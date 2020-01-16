import React, { PureComponent } from 'react';
import styles from './index.less';
import { fetchPaperFileUrl } from '@/services/api';

/*
    获取图片组件

 */

export default class StemImage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      audioUrl: '',
      isPlay: false,
    };
  }

  componentDidMount() {
    const { id, url } = this.props;
    let self = this;
    if (url == undefined) {
      if (window.ExampaperStatus == 'EXAM') {
        let paperMd5 = localStorage.getItem('paperMd5');
        let report_paperMd5 = localStorage.getItem('report_paperMd5');
        if (report_paperMd5) {
          paperMd5 = report_paperMd5;
        }

        self.setState({
          audioUrl: window.paperUrl + '/' + paperMd5 + '/' + id,
          // audioUrl: imgUrl,
        });
      } else {
        if (id) {
          if (window.ExampaperStatus === 'PREVIEW') {
            // console.log("apiUrl",self.props.apiUrl)
            // let apiUrl = self.props.apiUrl;
            // let url =  e.data.path;
            // let urlArr = url.split("/");
            // urlArr[2] = apiUrl.default["PROXY-resource"];
            // urlArr.splice(0,2);
            // console.log("url",urlArr.join("/"))
            if (id) {
              const imgUrl =
                `/proxyapi/proxy/file/assets?id=` +
                id +
                `&key=${localStorage.getItem('access_token')}`;
              self.setState({
                audioUrl: imgUrl,
              });
            }
          } else {
            fetchPaperFileUrl({
              fileId: id,
            }).then(e => {
              self.setState({
                audioUrl: e.data.path,
              });
            });
          }
        }
      }
    }
  }

  render() {
    const { isPlay, audioUrl } = this.state;

    const { type, className, style, id, customStyle } = this.props;

    return (
      <div className={styles.flex} style={customStyle}>
        <div>
          {id && (
            <img style={style} src={audioUrl} className={styles.stemImage + ' ' + className} />
          )}
        </div>
      </div>
    );
  }
}
