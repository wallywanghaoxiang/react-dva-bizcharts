import React, { useMemo } from 'react';
// import { formatMessage } from 'umi/locale';
// import NoData from '@/components/NoData';
import styles from './index.less';

/**
 * 门贴
 * @author tina.zhang
 * @date   2019-9-6 11:11:05
 * @param {string} taskName - 任务名称
 * @param {string} roomId - 考场ID
 * @param {string} examRoomList - 考场信息
 */
function DoorTags(props) {
  const { taskName, roomId, examRoomList } = props;

  // 列表数据源
  const dataSource = useMemo(() => {
    if (!roomId) {
      return examRoomList;
    }
    return examRoomList.filter(v => v.id === roomId);
  }, [roomId, examRoomList]);

  return (
    <div id="doorTags" className={styles.examRoomLists}>
      {dataSource && dataSource.length > 0 && (
        <>
          {dataSource.map(v => {
            return (
              <div className={styles.tagItemBox}>
                <div className={styles.tagItem}>
                  <div className={styles.name}>{taskName}</div>
                  <div className={styles.title}>{v.name}</div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default DoorTags;
