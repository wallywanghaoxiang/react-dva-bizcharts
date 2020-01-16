import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import NoData from '@/components/NoData/index';
// import { InputFilter, SelectorFilter } from '../../../Components/TableFilter';
import styles from './index.less';

/**
 * 考务明细（学生列表）
 * @author tina.zhang
 * @date   2019-8-20 11:26:22
 * @param {string} taskId - 任务ID
 */
function StudentList(props) {
  const { dispatch, classList, taskId, studentList, loading } = props;

  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 15,
  });

  // 非学科管理员需先加载任课班级
  useEffect(() => {
    const redirectParamsString = localStorage.getItem('redirect_to_exam_params');
    if (!redirectParamsString) {
      return;
    }
    const redirectParams = JSON.parse(redirectParamsString);
    if (redirectParams.isSubjectAdmin) {
      return;
    }
    if (classList && classList.naturalClassList && classList.naturalClassList.length > 0) {
      return;
    }
    dispatch({
      type: 'clzss/fetchClassList',
      payload: {
        campusId: localStorage.campusId,
        teacherId: localStorage.teacherId,
      },
    });
  }, []);

  useEffect(() => {
    const params = {
      taskId,
      campusId: localStorage.campusId,
      ...pagination,
    };
    const redirectParamsString = localStorage.getItem('redirect_to_exam_params');
    if (!redirectParamsString) {
      return;
    }
    const redirectParams = JSON.parse(redirectParamsString);
    if (!redirectParams.isSubjectAdmin) {
      if (!classList || !classList.naturalClassList || classList.naturalClassList.length === 0) {
        return;
      }
      const classIdList = classList.naturalClassList.map(v => v.naturalClassId);
      params.classIds = classIdList.join(',');
    }

    dispatch({
      type: 'uexam/getStudentList',
      payload: params,
    });
  }, [classList, pagination]);

  // // 自定义表头筛选组件
  // const handleColumnSearch = useCallback((dataIndex, selectedKeys) => {
  //   // TODO
  // }, []);

  // const handleColumnReset = useCallback((dataIndex) => {
  //   // TODO
  // }, []);

  const getColumns = useMemo(() => {
    // const examPlaceNames = [{ text: '考点1', value: '1' }, { text: '考点2', value: '2' }, { text: '考点3', value: '3' }, { text: '考点4', value: '4' }];
    // const examRoomNames = [{ text: '考场1', value: '1' }, { text: '考场2', value: '2' }, { text: '考场3', value: '3' }, { text: '考场4', value: '4' }];
    // const examBatchNames = [{ text: '批次1', value: '1' }, { text: '批次2', value: '2' }, { text: '批次3', value: '3' }, { text: '批次4', value: '4' }];
    // const examBatchTimes = [{ text: '9月13日 8:00-9:00', value: '1' }, { text: '9月13日 9:00-10:00', value: '2' }, { text: '9月13日 10:00-11:00', value: '3' }, { text: '9月13日 13:00-14:00', value: '4' }];
    const columns = [
      {
        title: formatMessage({
          id: 'app.title.uexam.examination.inspect.registration.table.examNo',
          defaultMessage: '考号',
        }),
        dataIndex: 'examNo',
        key: 'examNo',
        width: '17%',
        // ...InputFilter('examNo', handleColumnSearch, handleColumnReset)
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.studentName',
          defaultMessage: '考生姓名',
        }),
        dataIndex: 'studentName',
        key: 'studentName',
        width: '9%',
        render: studentName => {
          return <span title={studentName}>{studentName}</span>;
        },
        // ...InputFilter('studentName', handleColumnSearch, handleColumnReset)
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.examination.inspect.registration.result.className',
          defaultMessage: '班级',
        }),
        dataIndex: 'className',
        key: 'className',
        width: '9%',
        // ...InputFilter('className', handleColumnSearch, handleColumnReset)
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.examPlaceName',
          defaultMessage: '考点',
        }),
        dataIndex: 'examPlaceName',
        key: 'examPlaceName',
        width: '16%',
        // ...SelectorFilter(examPlaceNames, 'examPlaceName', handleColumnSearch, handleColumnReset)
      },
      {
        title: formatMessage({ id: 'app.title.uexam.exam.batch', defaultMessage: '批次' }),
        dataIndex: 'examBatchName',
        key: 'examBatchName',
        width: '6%',
        // ...SelectorFilter(examBatchNames, 'examBatchName', handleColumnSearch, handleColumnReset)
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.examRoomName',
          defaultMessage: '考场',
        }),
        dataIndex: 'examRoomName',
        key: 'examRoomName',
        width: '6%',
        // ...SelectorFilter(examRoomNames, 'examRoomName', handleColumnSearch, handleColumnReset)
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.invigilate.teacher',
          defaultMessage: '监考老师',
        }),
        dataIndex: 'teacherName',
        key: 'teacherName',
        width: '23%',
        // ...InputFilter('teacherName', handleColumnSearch, handleColumnReset)
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.examDate2',
          defaultMessage: '考试日期',
        }),
        dataIndex: 'dateFormat',
        key: 'dateFormat',
        width: '14%',
        // ...SelectorFilter(examBatchTimes, 'dateFormat', handleColumnSearch, handleColumnReset)
      },
    ];
    return columns;
  }, []);

  // 分页事件
  const handleTableChanged = useCallback((page, filters, sorter) => {
    setPagination({
      ...pagination,
      pageIndex: page.current,
    });
  }, []);

  return (
    <div className={styles.studentTableList}>
      {loading && !studentList && (
        <NoData
          tip={formatMessage({
            id: 'app.message.registration.taskinfo.loading.tip',
            defaultMessage: '信息加载中，请稍等...',
          })}
          onLoad
        />
      )}
      {studentList && studentList.records && (
        <Table
          className={styles.searchTable}
          rowKey="studentId"
          columns={getColumns}
          dataSource={studentList.records}
          loading={loading}
          pagination={{
            hideOnSinglePage: true,
            pageSize: pagination.pageSize,
            total: studentList.total,
          }}
          onChange={handleTableChanged}
        />
      )}
    </div>
  );
}

export default connect(({ clzss, uexam, loading }) => ({
  classList: clzss.classList,
  studentList: uexam.studentList,
  loading: loading.effects['uexam/getStudentList'],
}))(StudentList);
