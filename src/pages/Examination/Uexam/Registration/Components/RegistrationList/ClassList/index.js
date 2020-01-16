import React, { useCallback } from 'react';
import classnames from 'classnames';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';

/**
 * 班级列表
 * @author tina.zhang
 * @date 2019-7-29 17:33:06
 * @param {Array} classList - 班级列表
 * @param {string} activeClassId - 选中班级ID
 * @param {function} onClassSelect - 班级选中事件
 */
function ClassList(props) {

  const { classList, activeClassId, onClassSelect } = props;

  // 班级列表项点击事件
  const handleClassClick = useCallback((clazz) => {
    if (onClassSelect && typeof (onClassSelect) === 'function') {
      onClassSelect(clazz.classId);
    }
  }, []);

  // 渲染班级列表项
  const renderClassItem = useCallback((clazz) => {
    const isActive = clazz.classId === activeClassId;
    return (
      <div
        key={clazz.classId}
        className={classnames(styles.classlistItem, isActive ? styles.active : null)}
        onClick={() => handleClassClick(clazz)}
        title={clazz.className}
      >
        <div className={styles.classname} title={clazz.className}>{stringFormat(clazz.className, 12)}</div>
        <div className={styles.studentnum}>{clazz.studentNum}</div>
      </div>
    )
  }, [activeClassId]);

  return (
    <div className={styles.classList}>
      {classList && classList.map(v => renderClassItem(v))}
    </div>
  )
}

export default ClassList;
