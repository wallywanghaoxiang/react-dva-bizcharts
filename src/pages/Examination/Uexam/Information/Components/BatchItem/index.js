import React, { Component } from 'react';
import BatchCell from '../BatchCell/index';
import styles from './index.less';


class BatchItem extends Component {
  state = {
  }

  componentDidMount() {
  }

  render() {
    
    const { data } = this.props;
    return (
      <div className={styles.batchItemContainer}>
        {/* 场次名字 */}
        <div className={styles.batchTitle}>
          {data.examBatchName}
          <span style={{paddingLeft:'5px'}}>({data.examBatchTime})</span>
        </div>
        <div className={styles.roomList}>
          {
            data.roomList.map((item,idx) => {
                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <BatchCell key={`batchCell${idx}`} data={item} />
                )
            })
          }
        </div>
        
      </div>
    );
  }
}
export default BatchItem;

