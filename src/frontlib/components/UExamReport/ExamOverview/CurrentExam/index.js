import React, { useCallback, useMemo } from 'react';
import { Table } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../Components/ReportPanel';
import constant from '../../constant';
import styles from './index.less';

// const keys
const { SYS_TYPE, FULL_CLASS_ID } = constant;

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
  areaRank: { id: "app.title.uexam.report.transcriptstatis.areaRank", defaultMessage: "区排名" },
});

/**
 * 教师报告-本次考试
 * @author tina.zhang
 * @date   2019-05-07
 * @param {array}  dataSource - REPORT-102 -> data.classStatis
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 */
function CurrentExam(props) {

  const { type, dataSource } = props;

  // UEXAM 报告仅表头显示本次考试数据，CAMPUS/CLASS 不显示表头本次考试数据，但显示具体列表
  const showAll = type !== SYS_TYPE.UEXAM;

  // #region 格式化数据源
  const formatDataSource = useMemo(() => {
    // taskInfo.displayUExamInfo ==='N'：本次任务设置为不显示本次考试统计数据
    let afterSort;
    const fullData = dataSource.filter(v => v.id === 'FULL');
    if (fullData && fullData.length > 0) {
      afterSort = fullData.concat(dataSource.filter(v => v.id !== 'FULL'));
    } else {
      afterSort = dataSource;
    }
    const res = afterSort.map((item) => {
      if (!item.examNum || item.examNum === 0) {
        return {
          ...item,
          markRate: 0,
          excellenRate: 0,
          passRate: 0,
          lowRate: 0
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
        lowRate
      };
    }, [dataSource]);
    // UEXAM 报告表头显示本次考试数据
    const headerData = !showAll ? res.find(v => v.id === FULL_CLASS_ID) : null;
    return {
      formatData: res,
      headerData
    };
  }, [dataSource]);
  // #endregion

  const { formatData, headerData } = formatDataSource;

  // 表头数据
  const rateUnit = formatMessage(messages.rateUnit);
  const getHeaderData = useCallback((dataIndex, numColumn) => {
    if (!showAll) {
      if (numColumn) {
        return (
          <div className={styles.headerTitle}>
            {headerData[dataIndex]}%
            <span className={styles.headerTitleOther}>/{headerData[numColumn]}{rateUnit}</span>
          </div>
        )
      }
      return (
        <div className={styles.headerTitle}>{headerData[dataIndex]}</div>
      )
    }
    return null;
  }, [formatDataSource]);

  // columns
  const getColumns = useMemo(() => {
    const colWidth = `${100 / 7}100%`;
    const cols = [];
    const otherCols = [{
      title: <div>{formatMessage(messages.avgScore)}{getHeaderData('avgScore')}</div>,
      width: colWidth,
      dataIndex: 'avgScore',
      key: 'avgScore',
    }, {
      title: <div>{formatMessage(messages.maxScore)}{getHeaderData('maxScore')}</div>,
      width: colWidth,
      dataIndex: 'maxScore',
      key: 'maxScore',
    }, {
      title: <div>{formatMessage(messages.markRate)}{getHeaderData('markRate', 'markNum')}</div>,
      width: colWidth,
      dataIndex: 'markRate',
      key: 'markRate',
      render: (markRate, item) => {
        return (
          <span>
            {markRate}%<span className={styles.headerTitleOther}>/{item.markNum}{rateUnit}</span>
          </span>
        )
      }
    }, {
      title: <div>{formatMessage(messages.excellenRate)}{getHeaderData('excellenRate', 'excellentNum')}</div>,
      width: colWidth,
      dataIndex: 'excellenRate',
      key: 'excellenRate',
      render: (excellenRate, item) => {
        return (
          <span>
            {excellenRate}%<span className={styles.headerTitleOther}>/{item.excellentNum}{rateUnit}</span>
          </span>
        )
      }
    }, {
      title: <div>{formatMessage(messages.passRate)}{getHeaderData('passRate', 'passNum')}</div>,
      width: colWidth,
      dataIndex: 'passRate',
      key: 'passRate',
      render: (passRate, item) => {
        return (
          <span>
            {passRate}%<span className={styles.headerTitleOther}>/{item.passNum}{rateUnit}</span>
          </span>
        )
      }
    }, {
      title: <div>{formatMessage(messages.lowRate)}{getHeaderData('lowRate', 'lowNum')}</div>,
      width: colWidth,
      dataIndex: 'lowRate',
      key: 'lowRate',
      render: (lowRate, item) => {
        return (
          <span>
            {lowRate}%<span className={styles.headerTitleOther}>/{item.lowNum}{rateUnit}</span>
          </span>
        )
      }
    }];
    if (showAll) {
      otherCols.push({
        title: '',
        width: colWidth,
        dataIndex: 'name',
        key: 'name',
        render: (name) => {
          return (
            <span>
              <span className={styles.headerTitleOther}>{name}</span>
            </span>
          )
        }
      })
    }
    return cols.concat(otherCols);
  }, [dataSource]);

  // panel 高度
  const examGridStyle = useMemo(() => {
    if (showAll) {
      return null;
    }
    return {
      height: '112px',
      overflow: 'hidden'
    }
  }, []);

  // // 区排名（学科管理员可见，即：type=campus时，显示）
  // const getRank = useMemo(() => {
  //   if (type === SYS_TYPE.CAMPUS && dataSource) {
  //     const campusStatis = dataSource.filter(v => v.id !== FULL_CLASS_ID);
  //     if (campusStatis && campusStatis[0]) {
  //       return campusStatis[0].rank || 0;
  //     }
  //     return 0;
  //   }
  //   return 0;
  // }, [dataSource]);

  return (
    <div className={styles.currentExam}>
      {/* 隐藏去排名 update 2019-10-11 16:29:40 */}
      {/* {type === SYS_TYPE.CAMPUS &&
        <div className={styles.rank}>
          {formatMessage(messages.areaRank)}：
          <span className={styles.rankNum}>
            {getRank}
          </span>
        </div>
      } */}
      <div className={styles.examGrid} style={examGridStyle}>
        <ReportPanel innerTitle={formatMessage(messages.panelTitle)}>
          {formatData &&
            <Table
              rowKey={(record) => `${record.id}${record.name}`}
              className={styles.examTable}
              pagination={formatData.length > 10}
              columns={getColumns}
              dataSource={formatData}
            />
          }
        </ReportPanel>
      </div>
    </div>
  )
}

export default CurrentExam;
