import React, { useCallback } from 'react';
import { Tooltip } from 'antd';
import classnames from 'classnames';
import Pagination from '@/components/Pagination';
import NoSearchResult from '../../NoSearchResult';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';

/**
 * 学生列表（导入学生弹窗）
 * @author tina.zhang
 * @date 2019-8-1 14:07:44
 * @param {Array} studentList - 校区列表
 * @param {object} pagination - 分页
 * @param {function} onPageChanged - 分页事件
 * @param {function} onStudentClick - 单个学生点击(新增/删除)
 */
function StudentInfoList(props) {

  const { studentList, pagination, onPageChanged, onStudentClick } = props;

  // 学生列表项点击事件
  const handleStudentClick = useCallback((student, isAdd) => {
    if (student.isExist === 'Y') {
      return;
    }
    if (typeof (onStudentClick) === 'function') {
      onStudentClick(student, isAdd);
    }
  }, []);

  // 渲染学生列表项
  const renderStudentItem = useCallback((student) => {
    let classes = styles.studentInfoListItem;
    let transientClass = styles.transient;
    if (student.isExist === 'Y') { // 已导入
      classes = classnames(styles.studentInfoListItem, styles.existed);
    } else if (student.selected) {// 已选
      classes = classnames(styles.studentInfoListItem, styles.selected);
      transientClass = classnames(styles.transient, styles.transientSelected);
    }

    return (
      <div key={student.studentId} className={classes} onClick={() => handleStudentClick(student, !student.selected)}>
        {student.studentName.length > 4 ?
          <Tooltip title={student.studentName}>
            {stringFormat(student.studentName, 4, '..')}
          </Tooltip>
          : <>{student.studentName}</>
        }
        {student.isTransient === 'Y' &&
          <span className={transientClass}>借</span>
        }
      </div>
    )
  }, []);

  return (
    <div className={styles.studentInfoList}>
      {studentList && studentList.length > 0 ?
        <>
          <div className={styles.studentInfoListBox}>
            {studentList.map(v => renderStudentItem(v))}
          </div>
          <div className={styles.pagination}>
            <Pagination
              {...pagination}
              // current={state.pagination.current}
              // pageSize={state.pagination.pageSize}
              // total={studentList.length}
              onChange={onPageChanged}
            />
          </div>
        </>
        : <NoSearchResult />
      }

    </div>
  )
}

export default StudentInfoList
