import React, { PureComponent } from 'react';
import styles from './index.less';
import back_end from '@/frontlib/assets/back_end.png';
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';


/**
 * 回溯页面
 */

export default class RecallPage extends PureComponent {
  constructor(props) {
    super(props);

  }



  render() {
    const {script} = this.props;
    return (
      <div className={styles.addquestion_card + ' ' + styles.addquestion_focus}>

          <div className={styles.addquestion_center}>
            <div className={styles.img }>
                { script.start ? <i className={'iconfont icon-back'} /> : <img src={back_end}/> }
            </div>
            
            <div className={styles.addquestion_head}>{script.content || ""}</div>
          </div>
        </div>
    );
  }
}
