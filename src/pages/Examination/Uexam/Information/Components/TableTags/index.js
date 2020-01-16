import React, { useMemo } from 'react';
import { formatMessage } from 'umi/locale';
// import NoData from '@/components/NoData';
import styles from './index.less';

/**
 * 桌贴
 * @author tina.zhang
 * @date   2019-9-6 11:11:05
 * @param {string} roomId - 考场ID
 * @param {string} examRoomList - 考场信息
 */
function TableTags(props) {
  const { roomId, examRoomList } = props;

  // 列表数据源
  const dataSource = useMemo(() => {
    if (!roomId) {
      return examRoomList;
    }
    return examRoomList.filter(v => v.id === roomId);
  }, [roomId, examRoomList]);

  return (
    <div id="tableTags" className={styles.examRoomLists}>
      {/* {loading && !admissionTickets && <NoData tip={formatMessage({ id: "app.message.registration.taskinfo.loading.tip", defaultMessage: "信息加载中，请稍等..." })} onLoad />} */}
      {dataSource && dataSource.length > 0 && (
        <>
          {dataSource.map(v => {
            const coms = [];
            coms.push(
              <div key={v.id} className={styles.roomStatisInfo}>
                {v.name} |{' '}
                {formatMessage(
                  { id: 'app.text.uexam.examination.info.sticknum', defaultMessage: '共{num}份' },
                  { num: v.studentMachineNum }
                )}
              </div>
            );
            [...Array(v.studentMachineNum || 0)].forEach((s, idx) => {
              const index = idx + 1;
              coms.push(
                <div className={styles.tagItemBox}>
                  <div className={styles.tagItem}>
                    <div className={styles.name}>
                      {formatMessage({
                        id: 'app.text.uexam.examination.info.tabletag.sitno',
                        defaultMessage: '座位号',
                      })}
                    </div>
                    <div className={styles.title}>{index}</div>
                  </div>
                </div>
              );
            });
            return coms;
          })}
        </>
      )}
    </div>
  );
}

export default TableTags;
