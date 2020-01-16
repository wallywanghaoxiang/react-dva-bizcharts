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

  render() {
    const { isPlay, audioUrl } = this.state

    const { type, className, style, customStyle } = this.props

    return (
      <div className={styles.flex} style={customStyle}>
        <div>
          <img style={style} src={audioUrl} className={`${styles.stemImage} ${className}`} alt="" />
        </div>
      </div>
    )
  }
}
