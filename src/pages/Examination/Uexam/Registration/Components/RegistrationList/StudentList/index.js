import React, { useCallback } from 'react';
import { Dropdown, Menu, Icon } from 'antd';
import { formatMessage } from 'umi/locale';
import Pagination from '@/components/Pagination';
import styles from './index.less';

/**
 * 学生列表
 * @author tina.zhang
 * @date 2019-8-29 16:28:44
 * @param {Array} studentList - 学生列表
 * @param {function} onDeleteStudent - 删除学生
 * @param {function} pagination - 分页属性
 * @param {function} onPageChanged - 分页事件
 */
function StudentList(props) {

  const { studentList, onDeleteStudent, pagination, onPageChanged } = props;

  // 删除学生
  const handleDeleteClick = useCallback((studentId) => {
    if (onDeleteStudent && typeof (onDeleteStudent) === 'function') {
      onDeleteStudent(studentId);
    }
  }, [])

  // 渲染学生列表项
  const dropdownMenu = useCallback((student) => {
    return (
      <Menu key={student.studentId} onClick={() => handleDeleteClick(student.studentId)}>
        <Menu.Item key="1">
          {formatMessage({ id: "app.button.uexam.examination.inspect.registration.delete", defaultMessage: "删除" })}
        </Menu.Item>
      </Menu>
    )
  }, []);

  const renderStudentItem = useCallback((student) => {
    return (
      <div key={student.studentId} className={styles.studentlistItem}>
        <div>{student.studentName}</div>
        <div className={styles.examno}>
          <span>
            {formatMessage({ id: "app.text.uexam.examination.inspect.registration.examnum", defaultMessage: "考号：{examNo}" }, { "examNo": student.examNo })}
          </span>
          <Dropdown className={styles.dropdown} overlay={dropdownMenu(student)} placement="bottomLeft" trigger={['click']}>
            <Icon type="ellipsis" />
          </Dropdown>
        </div>
      </div>
    )
  }, []);

  return (
    <div className={styles.studentListBox}>
      {studentList && studentList.length > 0 &&
        <>
          <div className={styles.studentList}>
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
      }
    </div>
  )
}

export default StudentList
