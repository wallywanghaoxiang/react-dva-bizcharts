/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import BatchItem from '../BatchItem/index';
import { formatMonthDay } from '@/utils/utils';
import styles from './index.less';


class BatchList extends Component {
  state = {
  }

  componentDidMount() {
  }

  render() {

    const { data } = this.props;

    return (
      <div className={styles.batchListContainer}>
        {
          data.map((item, index) => {
            return (
              <div key={`batchList${index}`}>
                {/* 日期 */}
                <div className={styles.examDate}>{formatMonthDay(item.examDate)}</div>
                {/* 批次item */}
                {
                  item.batchList.map((batch, i) => {
                    return (
                      <BatchItem key={`batchItem${i}`} data={batch} />
                    )
                  })
                }
              </div>
            )
          })
        }
      </div>
    );
  }
}
export default BatchList;

