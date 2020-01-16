
import React, { PureComponent } from 'react';
import { Divider } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import cs from "classnames";
import styles from './index.less';

const messages = defineMessages({
  download: { id: 'app.browser.download', defaultMessage: '去下载' },
});

class BrowserBotton extends PureComponent {

  render() {
    const { item } = this.props;
    return (
      <div className={styles.bottom}>
        <img src={item.icon} className={styles.img} alt="" />
        <div className={styles.item}>
          <div className={styles.left}>
            {item.name}
          </div>
          <Divider type="vertical" className={styles.vertical} />
          <div className={styles.right}>
            {item.version}
          </div>
        </div>
        <div
          className={styles.downloadBtn}
          onClick={() => {
            window.open(item.url);
          }}
        >
          {formatMessage(messages.download)}
          <i className={cs('iconfont','icon-next')} />
        </div>
      </div>
    )
  }
}

export default BrowserBotton
