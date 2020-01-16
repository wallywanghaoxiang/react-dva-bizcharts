import React from 'react';
// import { FormattedMessage } from 'umi/locale';
// import answerPic from '@/frontlib/assets/answers/answer_pic.png';
import answerPopPic from '@/frontlib/assets/answers/answer_pic_pop_icon.png';
import styles from './index.less';

/**
 * 答题解析未授权蒙层
 */
const HideAnalysisModal = () => {

  // 升级提示
  const UpgradeText = () => {
    return (
      // <FormattedMessage />
      <>升级专业版可查看全部
        <span style={{ color: '#03C46B' }}>
          答案解析
        </span>
        及
        <span style={{ color: '#03C46B' }}>
          点拨
        </span>
      </>
    )
  }

  return (
    <div className={styles.hideanalysismodal}>
      <div className={styles.pro}>
        <img src={answerPopPic} alt="升级" />
        <div className={styles.poptext}><UpgradeText /></div>
      </div>
    </div>
  )
}

export default HideAnalysisModal;
