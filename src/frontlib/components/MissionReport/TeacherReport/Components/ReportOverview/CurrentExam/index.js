import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Table, Icon } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import Pagination from '@/components/Pagination/index';
import ReportPanel from '../../../../Components/ReportPanel';
import constant from '../../../../constant'
import styles from './index.less';
import compare from '@/utils/compare';

const messages = defineMessages({
  panelTitle: { id: 'app.examination.report.currentexam.paneltitle', defaultMessage: '本次考试' },
  exerPanelTitle: { id: 'app.title.examination.report.currentexam.exerPanelTitle', defaultMessage: '本次练习' },
  avgScore: { id: 'app.examination.report.currentexam.table.avgScore', defaultMessage: '平均分' },
  maxScore: { id: 'app.examination.report.currentexam.table.maxScore', defaultMessage: '最高分' },
  markRate: { id: 'app.examination.report.currentexam.table.markRate', defaultMessage: '满分率' },
  excellenRate: { id: 'app.examination.report.currentexam.table.excellenRate', defaultMessage: '优秀率' },
  passRate: { id: 'app.examination.report.currentexam.table.passRate', defaultMessage: '及格率' },
  lowRate: { id: 'app.examination.report.currentexam.table.lowRate', defaultMessage: '低分率' },
  rateUnit: { id: 'app.examination.report.currentexam.table.rateUnit', defaultMessage: '人' },
  className: { id: 'app.examination.report.currentexam.table.className', defaultMessage: '班级' },
  extendedBtnText: { id: 'app.examination.report.currentexam.extended', defaultMessage: '展开' },
  unExtendedBtnText: { id: 'app.examination.report.currentexam.unExtended', defaultMessage: '收起' },
});

// const keys
const { FULL_CLALSS_ID } = constant;

/**
 * 教师报告-本次考试
 * @author tina.zhang
 * @date   2019-05-07
 * @param {boolean} isExerciseReport - 是否练习报告
 * @param {number} classCount - 班级数量
 * @param {array[]} dataSource - REPORT-102 -> data.classStatis
 */
function CurrentExam(props) {

  const { isExerciseReport, dataSource, classCount } = props;

  // #region 默认隐藏
  const hiddenStyle = {
    height: '130px',
    overflow: 'hidden'
  }
  const showStyle = {
    height: 'auto',
    overflow: 'auto'
  }
  // #endregion

  // #region 初始化数据源
  const formatDataSource = useMemo(() => {
    let recordIndex = 0;
    const res = dataSource.map((item) => {
      if (item.classId !== FULL_CLALSS_ID) {
        recordIndex += 1;
      }
      if (!item.examNum || item.examNum === 0) {
        return {
          ...item,
          markRate: 0,
          excellenRate: 0,
          passRate: 0,
          lowRate: 0,
          recordIndex
        };
      }
      const markRate = parseFloat((item.markNum / item.examNum * 1000 / 10).toFixed(1));
      const excellenRate = parseFloat((item.excellentNum / item.examNum * 1000 / 10).toFixed(1));
      const passRate = parseFloat((item.passNum / item.examNum * 1000 / 10).toFixed(1));
      const lowRate = parseFloat((item.lowNum / item.examNum * 1000 / 10).toFixed(1));
      return {
        ...item,
        markRate,
        excellenRate,
        passRate,
        lowRate,
        recordIndex
      };
    }, [dataSource]);
    // 多班表头数据 classId=='FULL'  单班 默认数据
    const headerData = classCount > 1
      ? res.find(v => v.classId === FULL_CLALSS_ID)
      : res[0];
    return {
      formatData: res,
      headerData
    };
  }, [dataSource]);
  // #endregion

  const { formatData, headerData } = formatDataSource;

  // #region  获取表格列
  const getColumns = useMemo(() => {
    const rateUnit = formatMessage(messages.rateUnit);
    const sorter = classCount > 1;
    const colWidth = `${classCount > 1 ? 100 / 8 : 100 / 7}100%`;
    const cols = [];
    // 班级数量超过1，显示序号列
    if (classCount > 1) {
      // cols.push({
      //   title: <div><div className={styles.headerTitle}>&nbsp;</div></div>,
      //   width: colWidth,
      //   key: 'index',
      //   render: (text, record, index) => `${index + 1}`,
      // });
      cols.push({
        title: <div><div className={styles.headerTitle}>&nbsp;</div></div>,
        width: colWidth,
        dataIndex: 'recordIndex',
        key: 'recordIndex',
        // render: (text, record, index) => `${index + 1}`,
      });
    }
    const otherCols = [{
      title: <div>{formatMessage(messages.avgScore)}<div className={styles.headerTitle}>{headerData.avgScore}</div></div>,
      width: colWidth,
      dataIndex: 'avgScore',
      key: 'avgScore',
      sorter
    }, {
      title: <div>{formatMessage(messages.maxScore)}<div className={styles.headerTitle}>{headerData.maxScore}</div></div>,
      width: colWidth,
      dataIndex: 'maxScore',
      key: 'maxScore',
      sorter
    }, {
      title: <div>{formatMessage(messages.markRate)}<div className={styles.headerTitle}>{headerData.markRate}%<span className={styles.headerTitleOther}>/{headerData.markNum}{rateUnit}</span></div></div>,
      width: colWidth,
      dataIndex: 'markRate',
      key: 'markRate',
      sorter,
      render: (markRate, item) => {
        return (
          <span>
            {markRate}%<span className={styles.headerTitleOther}>/{item.markNum}{rateUnit}</span>
          </span>
        )
      }
    }, {
      title: <div>{formatMessage(messages.excellenRate)}<div className={styles.headerTitle}>{headerData.excellenRate}%<span className={styles.headerTitleOther}>/{headerData.excellentNum}{rateUnit}</span></div></div>,
      width: colWidth,
      dataIndex: 'excellenRate',
      key: 'excellenRate',
      sorter,
      render: (excellenRate, item) => {
        return (
          <span>
            {excellenRate}%<span className={styles.headerTitleOther}>/{item.excellentNum}{rateUnit}</span>
          </span>
        )
      }
    }, {
      title: <div>{formatMessage(messages.passRate)}<div className={styles.headerTitle}>{headerData.passRate}%<span className={styles.headerTitleOther}>/{headerData.passNum}{rateUnit}</span></div></div>,
      width: colWidth,
      dataIndex: 'passRate',
      key: 'passRate',
      sorter,
      render: (passRate, item) => {
        return (
          <span>
            {passRate}%<span className={styles.headerTitleOther}>/{item.passNum}{rateUnit}</span>
          </span>
        )
      }
    }, {
      title: <div>{formatMessage(messages.lowRate)}<div className={styles.headerTitle}>{headerData.lowRate}%<span className={styles.headerTitleOther}>/{headerData.lowNum}{rateUnit}</span></div></div>,
      width: colWidth,
      dataIndex: 'lowRate',
      key: 'lowRate',
      sorter,
      render: (lowRate, item) => {
        return (
          <span>
            {lowRate}%<span className={styles.headerTitleOther}>/{item.lowNum}{rateUnit}</span>
          </span>
        )
      }
    }];
    // 班级数量超过1，显示班级列
    if (classCount > 1) {
      otherCols.push({
        title: <div>{formatMessage(messages.className)}<div className={styles.headerTitle}>{headerData.className}</div></div>,
        width: colWidth,
        dataIndex: 'className',
        key: 'className'
      });
    }
    return cols.concat(otherCols);
  }, [dataSource]);
  // #endregion


  // 存储默认数据源
  const defaultTableSource = formatData.filter(v => v.classId !== FULL_CLALSS_ID);

  const [state, setState] = useState({
    initDataSource: defaultTableSource,// 默认数据源
    tableSource: defaultTableSource.slice(0, 10),  // 用于显示数据源
    sorter: null,
    pagination: { // 分页
      pageIndex: 1,
      pageSize: 10
    },
    extended: {
      isExtended: false,
      extendStyle: hiddenStyle,
      btnText: formatMessage(messages.extendedBtnText),
      iconRotate: 90
    }
  });
  const stateRef = useRef();
  stateRef.current = state;

  // #region 事件处理
  // 展开&收起
  const handleExtended = useCallback(() => {
    const isExtended = !stateRef.current.extended.isExtended;
    let nextExtended;
    if (isExtended) {
      nextExtended = {
        isExtended,
        extendStyle: showStyle,
        btnText: formatMessage(messages.unExtendedBtnText),
        iconRotate: -90
      };
    } else {
      nextExtended = {
        isExtended,
        extendStyle: hiddenStyle,
        btnText: formatMessage(messages.extendedBtnText),
        iconRotate: 90
      };
    }

    setState({
      ...stateRef.current,
      extended: {
        ...nextExtended
      }
    });
  }, []);

  // 表头排序
  const handleTableChangeSorter = useCallback((pagination, filters, sorter) => {
    let afterSort = [];
    if (sorter.order) {
      afterSort = state.initDataSource.sort(compare(sorter.columnKey, sorter.order));
    } else {
      afterSort = state.initDataSource;
    }
    setState({
      ...stateRef.current,
      tableSource: afterSort.slice(0, 10),
      sorter,
      pagination: {
        pageIndex: 1,
        pageSize: 10
      },
    });
  }, []);

  // 分页
  const onPageChange = useCallback((e) => {
    let afterSort = [];
    if (stateRef.current.sorter) {
      afterSort = stateRef.current.initDataSource.sort(compare(stateRef.current.sorter.columnKey, stateRef.current.sorter.order));
    } else {
      afterSort = stateRef.current.initDataSource;
    }
    const startIndex = (e - 1) * stateRef.current.pagination.pageSize;
    setState({
      ...stateRef.current,
      tableSource: afterSort.slice(startIndex, startIndex + stateRef.current.pagination.pageSize),
      pagination: {
        pageIndex: e,
        pageSize: 10
      },
    });
  }, []);
  // #endregion

  return (
    <div className={styles.currentExam}>
      <div className={styles.examGrid} style={state.extended.extendStyle}>
        <ReportPanel innerTitle={isExerciseReport ? formatMessage(messages.exerPanelTitle) : formatMessage(messages.panelTitle)}>
          {state.tableSource &&
            <Table
              rowKey="classId"
              className={styles.examTable}
              pagination={state.tableSource.length > 10}
              columns={getColumns}
              dataSource={state.tableSource}
              onChange={handleTableChangeSorter}
            />
          }
          {state.initDataSource && state.initDataSource.length > 10 &&
            <div className={styles.pagination}>
              <Pagination
                current={state.pagination.pageIndex}
                pageSize={state.pagination.pageSize}
                total={state.initDataSource.length}
                onChange={onPageChange}
              />
            </div>
          }
        </ReportPanel>
      </div>
      {classCount > 1 &&
        <div className={styles.examExtend}>
          <div className={styles.extendBtnBox} onClick={handleExtended}>
            {/* rotate={extended.iconRotate}  ant 3.11版本不支持 rotate *****  style={iconStyle}  */}
            <Icon type="double-right" rotate={state.extended.iconRotate} />&nbsp;{state.extended.btnText}
          </div>
        </div>
      }
    </div>
  )
}

export default CurrentExam;
