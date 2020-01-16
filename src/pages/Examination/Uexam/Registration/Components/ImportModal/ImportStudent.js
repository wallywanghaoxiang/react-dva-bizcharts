import React, { useState, useEffect, useCallback, useRef } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import NoData from '@/components/NoData/index';
import StudentInfoFilter from './StudentInfoFilter';
import StudentInfoList from './StudentInfoList';
import styles from './index.less';

/**
 * 导入学生
 * @author tina.zhang
 * @date   2019-8-1 08:41:01
 * @param {string} taskId - 任务ID
 */
function ImportStudent(props) {
  const {
    taskId,
    dispatch,
    campusInfoLoading,
    campusInfo,
    studentInfoList,
    selectedStudentList,
  } = props;

  const defaultPagination = {
    pageSize: 35,
    current: 1,
    total: 1,
  };

  const [state, setState] = useState({
    hasTransient: false,
    activeClassId: 'all',
    searchText: null,
    pagination: {
      ...defaultPagination,
    },
  });

  // 学生列表数据源
  const [dataSource, setDataSource] = useState(null);

  // ref state
  const stateRef = useRef();
  stateRef.current = state;

  // 加载校区列表含统计信息
  useEffect(() => {
    dispatch({
      type: 'registration/getCampusInfoList',
      payload: { taskId, campusId: localStorage.campusId },
    }).then(res => {
      const { data } = res;
      if (data && data.length > 0) {
        setState({
          ...stateRef.current,
          activeClassId: 'all',
        });
      }
    });
  }, []);

  // 根据校区ID加载学生列表
  useEffect(() => {
    dispatch({
      type: 'registration/getStudentInfoList',
      payload: {
        taskId,
        campusId: localStorage.campusId,
      },
    });
  }, []);

  // 学生列表数据源
  useEffect(() => {
    if (!studentInfoList) {
      return;
    }
    const { pagination } = state;
    const source = studentInfoList.filter(
      v =>
        (state.activeClassId === 'all' || v.classId === state.activeClassId) &&
        (state.searchText == null || v.studentName.indexOf(state.searchText) !== -1)
    );

    const hasTransient = source.some(v => v.isTransient === 'Y');

    const take = (pagination.current - 1) * pagination.pageSize;
    const afterPage = source.slice(take, take + pagination.pageSize);
    const addSelectedProp = afterPage.map(v => ({
      ...v,
      selected: selectedStudentList.some(s => s.studentId === v.studentId),
    }));
    setDataSource(addSelectedProp);
    setState({
      ...state,
      hasTransient,
      pagination: {
        ...pagination,
        total: source.length,
      },
    });
  }, [
    studentInfoList,
    state.activeClassId,
    state.searchText,
    state.pagination.current,
    selectedStudentList,
  ]);

  // 班级切换事件
  const handleClassSelect = useCallback(classId => {
    if (classId === stateRef.current.activeClassId) {
      return;
    }
    setState({
      ...stateRef.current,
      activeClassId: classId,
      searchText: null,
      pagination: {
        ...defaultPagination,
      },
    });
  }, []);

  // 搜索
  const handleSearch = useCallback(value => {
    if (value === null && stateRef.current.searchText === null) {
      return;
    }
    setState({
      ...stateRef.current,
      searchText: value,
      pagination: {
        ...defaultPagination,
      },
    });
  }, []);

  // 取消搜索
  const handleCancelSearch = useCallback(() => {
    setState({
      ...stateRef.current,
      searchText: '',
      pagination: {
        ...defaultPagination,
      },
    });
  }, []);

  // 更新 model 层已选学生列表
  const updateSelectedStudents = useCallback((students, type) => {
    const { activeClassId, searchText } = stateRef.current;
    dispatch({
      type: 'registration/updateSelectedStudents',
      payload: {
        students,
        type,
        activeClassId,
        searchText,
      },
    });
  }, []);

  // 添加或删除单个学生
  const handleStudentClick = useCallback((student, isAdd) => {
    updateSelectedStudents([{ ...student, taskId, isExist: 'Y' }], isAdd ? 'add' : 'remove');
  }, []);

  // ref props
  const propsRef = useRef();
  propsRef.current = studentInfoList;

  // 全选
  const handleSelectAll = useCallback(() => {
    const { activeClassId, searchText } = stateRef.current;
    const source = propsRef.current.filter(
      v =>
        (activeClassId === 'all' || v.classId === activeClassId) &&
        (searchText == null || v.studentName.indexOf(searchText) !== -1) &&
        v.isExist !== 'Y'
    );
    const fillTaskId = source.map(s => ({
      ...s,
      taskId,
      isExist: 'Y',
    }));
    updateSelectedStudents(fillTaskId, 'add');
  }, []);

  // 取消全选
  const handleClearAll = useCallback(() => {
    updateSelectedStudents([], 'clear');
  }, []);

  // 取消选择借读生
  const handleClearTransient = useCallback(() => {
    updateSelectedStudents([], 'removeTransients');
  }, []);

  // 分页
  const handlePageChanged = useCallback(pageIndex => {
    setState({
      ...stateRef.current,
      pagination: {
        ...stateRef.current.pagination,
        current: pageIndex,
      },
    });
  }, []);

  return (
    <div className={styles.importStudents}>
      {campusInfoLoading && (
        <NoData
          tip={formatMessage({
            id: 'app.message.registration.taskinfo.loading.tip',
            defaultMessage: '信息加载中，请稍等...',
          })}
          onLoad
        />
      )}
      {!campusInfoLoading && campusInfo && (
        <div className={styles.students}>
          <StudentInfoFilter
            classList={campusInfo.classList}
            activeClassId={state.activeClassId}
            onSearch={handleSearch}
            onCancelSearch={handleCancelSearch}
            onClassSelect={handleClassSelect}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
            onClearTransient={state.hasTransient ? handleClearTransient : null}
          />
          {dataSource && (
            <StudentInfoList
              studentList={dataSource}
              pagination={state.pagination}
              onPageChanged={handlePageChanged}
              onStudentClick={handleStudentClick}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default connect(({ registration, loading }) => ({
  campusInfo: registration.campusInfo, // 校区含统计信息
  campusInfoLoading: loading.effects['registration/getCampusInfoList'],
  studentInfoList: registration.studentInfoList, // 导入学生弹窗，学生名单
  studentInfoLoading: loading.effects['registration/getStudentInfoList'],

  selectedStudentList: registration.selectedStudentList, // 已选中学生名单
}))(withRouter(ImportStudent));
