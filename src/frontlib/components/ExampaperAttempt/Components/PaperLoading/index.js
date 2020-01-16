import React, { PureComponent } from 'react';
import { Progress } from 'antd';
import styles from './index.less';
// import loading from '@/frontlib/assets/loading.gif';
import loading from '@/frontlib/assets/download.gif';
import ready_ok from '@/frontlib/assets/ready_ok.png';

import IconButton from '../../../IconButton';
import { formatMessage, defineMessages } from 'umi/locale';

/**
 * 下载试卷loading组件
 */

export default class PaperLoading extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const { status } = this.props;

    console.log(status);
    if (status == 'loading') {
      return (
        <div className={styles.loading}>
          <div style={{ textAlign: 'center' }}>
            <img src={loading} alt="logo" />
            <div className={styles.loadingText}>{formatMessage({id:"app.text.paperloading",defaultMessage:"正在下载试卷...请耐心等待"})}</div>
          </div>
        </div>
      );
    } else if (status == 'failed') {
      return (
        <div className={styles.loading}>
          <div style={{ textAlign: 'center' }} className="PaperLoadingFailed">
            <IconButton iconName="icon-warning warning" />
            <div className={styles.loadingbtn}>{formatMessage({id:"app.text.reloadpaper",defaultMessage:"试卷下载失败...请重试"})}</div>
            <div className={styles.loadingbtn}>
              <IconButton
                text={formatMessage({id:"app.text.reloadingpaper",defaultMessage:"重新下载"})}
                iconName=""
                type="button"
                className={styles.redcordBtn}
                onClick={() => {
                  this.props.index.reLoadPaperPackage();
                }}
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.loading}>
          <div style={{ textAlign: 'center' }}>
            <img src={ready_ok} alt="logo" />
            <div className={styles.completeText}>{formatMessage({id:"app.text.prepare",defaultMessage:"准备就绪"})}</div>
            <div className={styles.tipsText}>{formatMessage({id:"app.text.examtip",defaultMessage:"请不要再动麦克风和耳机，安静等待考试指令"})}</div>
          </div>
        </div>
      );
    }
  }
}
