
import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import cs from 'classnames';
import styles from './index.less';


class BatchCell extends Component {
  state = {
  }

  componentDidMount() {
  }

  render() {
    const { data } = this.props;
    // 状态样式
    let statusStyle = styles.notStart;
    if (data.status === 'TS_0' || data.status === 'TS_1') {
      // 未开始
      statusStyle = styles.notStart;
    }
    if (data.status === 'TS_2') {
      // 进行中
      statusStyle = styles.inProgress;
    }
    if (data.status === 'TS_3' || data.status === 'TS_4' || data.status === 'TS_5') {
      // 已完成
      statusStyle = styles.finish;
    }

    return (
      <div className={styles.batchCellContainer}>
        <div className={styles.examPlace}>{data.examPlaceName}/{data.examRoomName}</div>
        <div className={styles.teacher}>
          <span className={styles.title}>{formatMessage({id:"app.title.uexam.arrange",defaultMessage:"监考"})}：</span>
          {data.teacherNames}
        </div>
        <div className={cs(styles.status,statusStyle)}>{data.statusValue}</div>
      </div>
    );
  }
}
export default BatchCell;

