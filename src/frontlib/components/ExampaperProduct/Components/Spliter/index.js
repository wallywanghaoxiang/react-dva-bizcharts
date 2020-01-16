import React, { PureComponent } from 'react';
import styles from './index.less';
import AutoPlay from '../AutoPlay';


/**
 * 分隔页
 */

export default class Spliter extends PureComponent {
  constructor(props) {
    super(props);

  }



  render() {
    const { paperData, masterData, ExampaperStatus } = this.props;
    let staticIndex = masterData.staticIndex;
    let paperInstance = paperData.paperInstance;
    return (
      <div className={styles.addquestion_card + ' ' + styles.addquestion_focus}>
          <div className={styles.addquestion_center}>
            <div className={styles.addquestion_head}>{paperInstance[staticIndex.mainIndex - 1].splitter.content}</div>
            <div className={styles.addquestion_myicon}>
              {(ExampaperStatus=="exam"||paperInstance[staticIndex.mainIndex - 1].splitter.audio == ""||paperInstance[staticIndex.mainIndex - 1].splitter.audio == null) ?"": <AutoPlay id={paperInstance[staticIndex.mainIndex - 1].splitter.audio} />}
            </div>
          </div>
        </div>
    );
  }
}
