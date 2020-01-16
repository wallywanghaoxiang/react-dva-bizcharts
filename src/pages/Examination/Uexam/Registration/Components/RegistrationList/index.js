/* eslint-disable prefer-destructuring */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import NoData from '@/components/NoData/index';
import ClassList from './ClassList';
import StudentList from './StudentList';
import NoImport from '../NoImport';
import styles from './index.less';

/**
 * 报名名单列表
 * @author tina.zhang
 * @date 2019-8-29 16:19:14
 * @param {string} taskId - 任务ID
 * @param {function} onDeleteStudent - 删除学生
 * @param {boolean} refreshResult - 刷新校区
 */
function RegistrationList(props) {
  const {
    taskId,
    onDeleteStudent,
    refreshResult,
    dispatch,
    infoLoading,
    resultLoading,
    registrationInfo,
    registrationResult,
  } = props;

  const currentCampuId = localStorage.campusId;

  // 默认分页数据
  const defaultPagination = useMemo(() => {
    return {
      pageSize: 15,
      current: 1,
    };
  }, []);

  const [state, setState] = useState({
    currentCampus: null, // 当前校区
    activeClassId: null, // 当前选中的班级
    pagination: {
      ...defaultPagination,
    },
  });
  const stateRef = useRef();
  stateRef.current = state;

  // 更新 model 层 activeClassId 供父组件使用
  useEffect(() => {
    const { activeClassId } = state;
    dispatch({
      type: 'registration/updateActiveIds',
      payload: { activeClassId },
    });
  }, [state.activeClassId]);

  // 加载校区、班级以及统计信息
  useEffect(() => {
    dispatch({
      type: 'registration/getRegistrationInfo',
      payload: {
        taskId,
        campusId: currentCampuId,
      },
    }).then(res => {
      const { data } = res;
      if (data && data.length > 0) {
        const { activeClassId } = state;
        let classId = activeClassId;
        const campusInfo = data.find(v => v.campusId === currentCampuId);
        if (campusInfo.classList) {
          if (!activeClassId || !campusInfo.classList.some(v => v.classId === activeClassId)) {
            classId = campusInfo.classList[0].classId;
          }
        }
        setState({
          currentCampus: campusInfo,
          activeClassId: classId,
          pagination: {
            ...defaultPagination,
          },
        });
      } else {
        setState({
          currentCampus: null,
          activeClassId: null,
          pagination: {
            ...defaultPagination,
          },
        });
      }
    });
  }, [refreshResult]);

  // 加载学生数据源
  useEffect(() => {
    if (!registrationInfo) {
      return;
    }
    setState({
      ...stateRef.current,
      pagination: {
        ...defaultPagination,
      },
    });
    dispatch({
      type: 'registration/getRegistrationResult',
      payload: {
        taskId,
        campusId: currentCampuId,
      },
    });
  }, [registrationInfo]);

  // 班级切换事件
  const handleClassSelect = useCallback(classId => {
    setState({
      ...stateRef.current,
      activeClassId: classId,
      pagination: {
        ...defaultPagination,
      },
    });
  }, []);

  // 删除学生事件
  const handleDeleteStudent = useCallback(studentId => {
    if (onDeleteStudent && typeof onDeleteStudent === 'function') {
      onDeleteStudent(studentId);
    }
  }, []);

  // 分页事件
  const handlePageChanged = useCallback(pageIndex => {
    setState({
      ...stateRef.current,
      pagination: {
        ...stateRef.current.pagination,
        current: pageIndex,
      },
    });
  }, []);

  // 学生列表数据源
  const studentListSource = useMemo(() => {
    if (!registrationResult) {
      return null;
    }
    const { pagination } = stateRef.current;
    const source = registrationResult.filter(v => v.classId === state.activeClassId);

    const take = (pagination.current - 1) * pagination.pageSize;
    const res = source.slice(take, take + pagination.pageSize);
    return {
      dataSource: res,
      total: source.length,
    };
  }, [state, registrationResult]); // state.pagination,

  // 当前校区是否已导入学生
  const hasImportOfCurrentCampus = useMemo(() => {
    if (state.currentCampus) {
      return state.currentCampus.studentNum || 0;
    }
    return 0;
  }, [state.currentCampus]);

  return (
    <div className={styles.registrationList}>
      {infoLoading && !registrationInfo && (
        <NoData
          tip={formatMessage({
            id: 'app.message.registration.taskinfo.loading.tip',
            defaultMessage: '信息加载中，请稍等...',
          })}
          onLoad
        />
      )}
      {registrationInfo && registrationInfo.length > 0 && (
        <>
          {hasImportOfCurrentCampus > 0 ? (
            <>
              <div className={styles.classes}>
                <ClassList
                  classList={state.currentCampus.classList}
                  activeClassId={state.activeClassId}
                  onClassSelect={handleClassSelect}
                />
              </div>
              <div className={styles.students}>
                {studentListSource && studentListSource.total > 0 ? (
                  <StudentList
                    studentList={studentListSource.dataSource}
                    onDeleteStudent={handleDeleteStudent}
                    onPageChanged={handlePageChanged}
                    pagination={{
                      ...state.pagination,
                      total: studentListSource.total,
                    }}
                  />
                ) : (
                  <NoImport />
                )}
              </div>
            </>
          ) : (
            <div className={styles.students}>
              <NoImport />
            </div>
          )}
        </>
      )}

      {!infoLoading && !resultLoading && (!registrationInfo || registrationInfo.length === 0) && (
        <div className={styles.students}>
          <NoImport showBorder />
        </div>
      )}
      {/* {!infoLoading && !resultLoading && (!registrationInfo || registrationInfo.length === 0) && <NoImport />} */}
    </div>
  );
}
export default connect(({ registration, loading }) => ({
  registrationInfo: registration.registrationInfo, // 报名结果信息
  registrationResult: registration.registrationResult, // 报名结果学生列表
  infoLoading: loading.effects['registration/getRegistrationInfo'],
  resultLoading: loading.effects['registration/getRegistrationResult'],
}))(RegistrationList);
