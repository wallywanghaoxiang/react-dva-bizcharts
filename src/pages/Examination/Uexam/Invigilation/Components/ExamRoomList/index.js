/* eslint-disable react/no-array-index-key */
import React from 'react';
import classnams from 'classnames';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';


/**
 * 考场列表
 * @author tina.zhang
 * @date   2019-8-13 18:12:56
 * @param {Array} examRoomList - 考场列表
 * @param {Array} activeRoomId - 考场列表
 * @param {function} onRoomChanged - 考场切换回调
 */
function ExamRoomList(props) {

  const { examRoomList, activeRoomId, onRoomChanged } = props;

  // 考场点击事件
  const handleRoomClick = (roomId) => {
    if (roomId !== activeRoomId && onRoomChanged && typeof (onRoomChanged) === 'function') {
      onRoomChanged(roomId);
    }
  }

  return (
    <div className={styles.examRoomList}>
      {examRoomList.map((v) => {
        return (
          <div key={v.examRoomId} className={classnams(styles.examRoomListItem, v.examRoomId === activeRoomId ? styles.active : null)} onClick={() => handleRoomClick(v.examRoomId)}>
            <div title={v.examRoomName}>{stringFormat(v.examRoomName, 7)}</div>
            <div className={styles.rightInfo}>
              <span>{v.batchFinishNum}/{v.batchNum}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default ExamRoomList
