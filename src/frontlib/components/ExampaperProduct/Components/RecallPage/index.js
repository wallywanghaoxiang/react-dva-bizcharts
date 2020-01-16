import React, { PureComponent } from 'react';
import styles from './index.less';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';


/**
 * 回溯页面
 */

export default class RecallPage extends PureComponent {
  constructor(props) {
    super(props);

  }



  render() {

    return (
      <div className={styles.addquestion_card + ' ' + styles.addquestion_focus}>

          <div className={styles.addquestion_center}>
            <div className={styles.img }>
              <i className={'iconfont icon-back'} />
            </div>
            <div className={styles.addquestion_head}>{formatMessage({id:"app.text.recallinfo",defaultMessage:"这里开始校对，考生可以修改选择题答案"})}</div>
          </div>
        </div>
    );
  }
}
