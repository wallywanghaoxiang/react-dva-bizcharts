import React, { useMemo } from 'react';
import { Table } from 'antd';
import { formatMessage } from 'umi/locale';
import NoImport from '../NoImport';
// import { InputFilter, SelectorFilter } from '../../../Components/TableFilter';
import styles from './index.less';

/**
 * 监考安排详情table
 * @author tina.zhang
 * @date   2019-8-16 13:59:30
 * @param {Array} dataSource - 数据源
 * @param {number} pageSize - 每页条数，默认 10
 */
function InvigilationTable(props) {
  const { dataSource, pageSize } = props;

  // // 自定义表头筛选组件
  // const handleColumnSearch = useCallback((dataIndex, selectedKeys) => {
  //   // TODO
  // }, []);

  // const handleColumnReset = useCallback((dataIndex) => {
  //   // TODO
  // }, []);

  // get columns
  const getColumns = useMemo(() => {
    // const examPlaceNames = [{ text: '考点1', value: '1' }, { text: '考点2', value: '2' }, { text: '考点3', value: '3' }, { text: '考点4', value: '4' }];
    // const examRoomNames = [{ text: '考场1', value: '1' }, { text: '考场2', value: '2' }, { text: '考场3', value: '3' }, { text: '考场4', value: '4' }];
    // const examBatchNames = [{ text: '批次1', value: '1' }, { text: '批次2', value: '2' }, { text: '批次3', value: '3' }, { text: '批次4', value: '4' }];
    // const examBatchTimes = [{ text: '9月13日 8:00-9:00', value: '1' }, { text: '9月13日 9:00-10:00', value: '2' }, { text: '9月13日 10:00-11:00', value: '3' }, { text: '9月13日 13:00-14:00', value: '4' }];
    const columns = [
      {
        title: formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.examPlaceName',
          defaultMessage: '考点',
        }),
        dataIndex: 'examPlaceName',
        key: 'examPlaceName',
        width: '25%',
        // ...SelectorFilter(examPlaceNames, 'examPlaceName', handleColumnSearch, handleColumnReset)
        render: examPlaceName => {
          return <span title={examPlaceName}>{examPlaceName}</span>;
        },
      },
      {
        title: formatMessage({ id: 'app.title.uexam.exam.batch', defaultMessage: '批次' }),
        dataIndex: 'examBatchName',
        key: 'examBatchName',
        width: '10%',
        // ...SelectorFilter(examBatchNames, 'examBatchName', handleColumnSearch, handleColumnReset)
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.examRoomName',
          defaultMessage: '考场',
        }),
        dataIndex: 'examRoomName',
        key: 'examRoomName',
        width: '17%',
        // ...SelectorFilter(examRoomNames, 'examRoomName', handleColumnSearch, handleColumnReset)
        render: (examRoomName, item) => {
          const stuTag = item.hasStu ? (
            <span className={styles.hasStu}>
              {formatMessage({
                id: 'app.text.uexam.examination.invigilation.batchlist.hasstu',
                defaultMessage: '有考生',
              })}
            </span>
          ) : (
            <span className={styles.noneStu}>
              {formatMessage({
                id: 'app.text.uexam.examination.invigilation.batchlist.nonestu',
                defaultMessage: '无考生',
              })}
            </span>
          );
          return (
            <>
              {examRoomName}
              {stuTag}
            </>
          );
        },
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.invigilate.teacher',
          defaultMessage: '监考老师',
        }),
        dataIndex: 'teacherName',
        key: 'teacherName',
        width: '28%',
        // ...InputFilter('teacherName', handleColumnSearch, handleColumnReset)
        render: teacherName => {
          return <span title={teacherName}>{teacherName}</span>;
        },
      },
      {
        title: formatMessage({
          id: 'app.title.uexam.examination.invigilation.result.examDate',
          defaultMessage: '监考日期',
        }),
        dataIndex: 'examBatchTime',
        key: 'examBatchTime',
        width: '20%',
        // ...SelectorFilter(examBatchTimes, 'examBatchTime', handleColumnSearch, handleColumnReset)
        render: examBatchTime => {
          return <span title={examBatchTime}>{examBatchTime}</span>;
        },
      },
    ];
    return columns;
  }, [dataSource]);

  return (
    <div className={styles.invigilationTable}>
      <Table
        rowKey="subTaskId"
        className={styles.searchTable}
        pagination={{ hideOnSinglePage: true, pageSize: pageSize || 10 }}
        columns={getColumns}
        dataSource={dataSource}
      />
      {(!dataSource || dataSource.length === 0) && <NoImport />}
    </div>
  );
}

export default InvigilationTable;
