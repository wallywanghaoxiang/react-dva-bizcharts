import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { connect } from 'dva';
import { Table, Dropdown, Icon, Menu } from 'antd';
import { formatMessage } from 'umi/locale';
import Pagination from '@/components/Pagination';
import NoSearchResult from '../NoSearchResult';
import styles from './index.less';

/**
 * 报名结果，分页搜索
 * @author tina.zhang
 * @date   2019-8-3 09:13:36
 * @param {string} taskId 任务ID
 * @param {string} searchText 搜索关键字
 * @param {function} onDeleteStudent - 删除学生
 * @param {string} refreshResult - 刷新学生列表
 */
function RegistrationSearch(props) {
  const {
    dispatch,
    taskId,
    searchText,
    searchLoading,
    searchResult,
    onDeleteStudent,
    refreshResult,
  } = props;

  const defaultPagination = useMemo(() => {
    // const container = document.getElementById('registrationContent');
    // const maxHeight = container.clientHeight - 135 - 56;
    return {
      // pageSize: parseInt(maxHeight / 17),
      pageSize: 15,
      current: 1,
    };
  }, []);

  const [pagination, setPagination] = useState({
    ...defaultPagination,
  });
  const paginationRef = useRef();
  paginationRef.current = pagination;

  // 搜索报名结果，学生列表
  useEffect(() => {
    dispatch({
      type: 'registration/searchRegistrationResult',
      payload: {
        taskId,
        campusId: localStorage.campusId,
        filterWord: searchText,
        pageSize: pagination.pageSize,
        pageIndex: pagination.current,
      },
    });
  }, [searchText, refreshResult, pagination.current]);

  // 搜索内容改变时，页码重置
  useEffect(() => {
    setPagination({
      ...defaultPagination,
    });
  }, [searchText]);

  // #region  Columns
  // 删除学生
  const handleDeleteClick = useCallback(studentId => {
    if (onDeleteStudent && typeof onDeleteStudent === 'function') {
      onDeleteStudent(studentId);
    }
  }, []);
  // 操作按钮
  const dropdownMenu = useCallback(studentId => {
    return (
      <Menu key={studentId} onClick={() => handleDeleteClick(studentId)}>
        <Menu.Item key="1">
          {formatMessage({
            id: 'app.button.uexam.examination.inspect.registration.delete',
            defaultMessage: '删除',
          })}
        </Menu.Item>
      </Menu>
    );
  }, []);
  const getColumns = useMemo(() => {
    const columns = [
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.examination.inspect.registration.table.studentName',
              defaultMessage: '姓名',
            })}
          </span>
        ),
        dataIndex: 'studentName',
        key: 'studentName',
        align: 'left',
        width: '26%',
        render: studentName => {
          if (studentName.length > 5) {
            return <span title={studentName}>{studentName}</span>;
          }
          return studentName;
        },
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.examination.inspect.registration.table.className',
              defaultMessage: '班级',
            })}
          </span>
        ),
        dataIndex: 'className',
        key: 'className',
        align: 'left',
        width: '35%',
        render: className => {
          if (className.length > 15) {
            return <span title={className}>{className}</span>;
          }
          return className;
        },
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.examination.inspect.registration.table.examNo',
              defaultMessage: '考号',
            })}
          </span>
        ),
        dataIndex: 'examNo',
        key: 'examNo',
        align: 'left',
        width: '31%',
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.examination.inspect.registration.table.btns',
              defaultMessage: '操作',
            })}
          </span>
        ),
        key: 'btns',
        align: 'left',
        width: '8%',
        render: item => {
          return (
            <Dropdown
              className={styles.dropdown}
              overlay={dropdownMenu(item.studentId)}
              placement="bottomLeft"
              trigger={['click']}
            >
              <Icon type="ellipsis" />
            </Dropdown>
          );
        },
      },
    ];
    return columns;
  }, []);
  // #endregion

  // 分页
  const handlePageChanged = useCallback(pageIndex => {
    setPagination({
      ...paginationRef.current,
      current: pageIndex,
    });
  }, []);

  return (
    <div className={styles.searchResult}>
      {/* {searchLoading && <NoData noneIcon={noneicon} tip={formatMessage({ id: "app.message.registration.taskinfo.loading.tip", defaultMessage: "信息加载中，请稍等..." })} onLoad={searchLoading} />} */}
      {searchResult && searchResult.records && searchResult.records.length > 0 ? (
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
              // total={studentList.length}
              onChange={handlePageChanged}
            />
          </div>
        </>
      ) : (
        <>
          {!searchLoading && (
            <div
              className={styles.studentlist}
              style={{ padding: '5px', border: '1px solid #E5E5E5' }}
            >
              <NoSearchResult />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default connect(({ registration, loading }) => ({
  searchResult: registration.searchResult,
  searchLoading: loading.effects['registration/searchRegistrationResult'],
}))(RegistrationSearch);
