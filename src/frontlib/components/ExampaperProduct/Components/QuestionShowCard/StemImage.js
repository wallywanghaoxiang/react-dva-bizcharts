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
    if (url == undefined) {
      let self = this;
      if (window.ExampaperStatus == 'EXAM') {
        let paperMd5 = localStorage.getItem('paperMd5');
        self.setState({
          audioUrl: window.paperUrl + '/' + paperMd5 + '/' + id,
          // audioUrl: "/paperapi/" + paperMd5 + "/" + id,
        });
      } else {
        fetchPaperFileUrl({
          fileId: id,
        }).then(e => {
          // console.log(e.data.path)
          self.setState({
            audioUrl: e.data.path,
          });
        });
      }
    }
  }

  render() {
    const { isPlay, audioUrl } = this.state;

    const { type, className, style, customStyle } = this.props;

    return (
      <div className={styles.flex} style={customStyle}>
        <div>
          <img style={style} src={audioUrl} className={styles.stemImage + ' ' + className} />
        </div>
      </div>
    );
  }
}
