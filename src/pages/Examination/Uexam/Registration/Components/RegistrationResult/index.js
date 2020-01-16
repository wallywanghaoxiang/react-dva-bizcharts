import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import Pagination from '@/components/Pagination';
import NoSearchResult from '../NoSearchResult';
// import { InputFilter, SelectorFilter } from '../../../Components/TableFilter';
import styles from './index.less';

/**
 * 报名管理
 * @author tina.zhang
 * @date   2019-8-29 17:33:57
 * @param {string} taskId 任务ID
 */
function RegistrationResult(props) {

  const { taskId, dispatch, searchLoading, searchResult } = props;

  const defaultPagination = useMemo(() => {
    return {
      pageSize: 17,
      current: 1
    };
  }, []);

  // 分页
  const [pagination, setPagination] = useState({
    ...defaultPagination
  });

  const paginationRef = useRef();
  paginationRef.current = pagination;

  // 表头筛选条件
  const [searchCondition, setSearchCondition] = useState({
    campusName: null,
    studentName: null,
    classId: null,
    examNo: null
  });
  const searchConditionRef = useRef();
  searchConditionRef.current = searchCondition;

  // // 自定义表头筛选组件
  // const handleColumnSearch = useCallback((dataIndex, selectedKeys) => {
  //   setSearchCondition({
  //     ...searchConditionRef.current,
  //     [dataIndex]: selectedKeys
  //   })
  // }, []);

  // const handleColumnReset = useCallback((dataIndex) => {
  //   setSearchCondition({
  //     ...searchConditionRef.current,
  //     [dataIndex]: null
  //   })
  // }, []);

  // 搜索报名结果，学生列表
  useEffect(() => {
    dispatch({
      type: 'registration/searchRegistrationResult',
      payload: {
        taskId,
        campusId: localStorage.campusId,
        ...searchCondition,// filterWord:
        pageSize: pagination.pageSize,
        pageIndex: pagination.current
      }
    })
    return () => {
    };
  }, [pagination.current, searchCondition]);

  // 分页
  const handlePageChanged = useCallback((pageIndex) => {
    setPagination({
      ...paginationRef.current,
      current: pageIndex
    });
  }, []);

  // const filterOptions = [{ text: '一年级(1)班', value: 'c1' }, { text: '一年级(2)班', value: 'c2' }, { text: '一年级(3)班', value: 'c3' }, { text: '一年级(4)班', value: 'c4' }]

  // Columns
  const getColumns = useMemo(() => {
    const columns = [{
      title: <span>{formatMessage({ id: "app.title.uexam.examination.inspect.registration.result.className", defaultMessage: "班级" })}</span>,
      dataIndex: 'className',
      key: 'className',
      align: 'left',
      width: '37%',
      // ...SelectorFilter(filterOptions, 'className', handleColumnSearch, handleColumnReset)
    }, {
      title: <span>{formatMessage({ id: "app.title.uexam.examination.inspect.registration.result.studentName", defaultMessage: "姓名" })}</span>,
      dataIndex: 'studentName',
      key: 'studentName',
      align: 'left',
      width: '40%',
      // ...InputFilter('studentName', handleColumnSearch, handleColumnReset)
    }, {
      title: <span>{formatMessage({ id: "app.title.uexam.examination.inspect.registration.result.examNo", defaultMessage: "考号" })}</span>,
      dataIndex: 'examNo',
      key: 'examNo',
      align: 'left',
      width: '23%',
      // ...InputFilter('examNo', handleColumnSearch, handleColumnReset)
    }];
    return columns;
  }, [])

  return (
    <div className={styles.registrationResult}>
      {searchResult && searchResult.records && searchResult.records.length > 0 ?
        <>
          <div className={styles.studentlist}>
            <Table
              rowKey="studentId"
              className={styles.searchTable}
              loading={searchLoading}
              pagination={false}
              columns={getColumns}
              dataSource={searchResult.records}
            />
          </div>
          <div className={styles.pagination}>
            <Pagination
              {...pagination}
              total={searchResult.total}
              // current={state.pagination.current}
              // pageSize={state.pagination.pageSize}
              onChange={handlePageChanged}
            />
          </div>
        </>
        : <div className={styles.studentlist} style={{ padding: '5px' }}><NoSearchResult showBorder /></div>
      }
    </div>
  )
}

export default connect(({ registration, loading }) => ({
  searchResult: registration.searchResult,
  searchLoading: loading.effects['registration/searchRegistrationResult']
}))(RegistrationResult);
