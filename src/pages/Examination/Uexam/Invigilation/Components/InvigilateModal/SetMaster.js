import React, { useCallback } from 'react';
import { Radio } from 'antd';
import classnames from 'classnames';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';

/**
 * 安排监考-设置主监考教师
 * @author tina.zhang
 * @date   2019-8-15 15:04:05
 * @param {Array} selectedTeachers - 已选教师列表
 * @param {Array} onItemClick - 选中事件回调
 */
function SetMaster(props) {

  const { selectedTeachers, onItemClick } = props;

  const handleTeacherItemClick = useCallback((teacherId) => {
    if (onItemClick && typeof (onItemClick) === 'function') {
      onItemClick(teacherId);
    }
  }, []);

  return (
    <div className={styles.setMaster}>
      {selectedTeachers.map((v) => {

        const isMaster = v.type === 'MASTER';

        return (
          <div key={`${v.teacherId}`} className={classnames(styles.teacherListItem, isMaster ? styles.selected : null)} onClick={() => handleTeacherItemClick(v.teacherId)}>
            <div className={styles.chk}>
              <Radio checked={isMaster} />
            </div>
            <div className={styles.info}>
              <div>{stringFormat(v.teacherName, 4)}</div>
              <div className={styles.tel}>{v.mobile}</div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default SetMaster
