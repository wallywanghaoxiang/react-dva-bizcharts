import React, { useMemo } from 'react';
import { Table } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import constant from '../../../../constant';
import styles from './index.less';

const messages = defineMessages({
  panelTitle: {
    id: 'app.examination.report.scoredistribution.panelTitle',
    defaultMessage: '分数构成',
  },
  avgScore: {
    id: 'app.examination.report.rankingdistribution.chartbarcontrast.avgScore',
    defaultMessage: '均分',
  },
  takeRate: {
    id: 'app.examination.report.rankingdistribution.scoredistributiongrid.takeRate',
    defaultMessage: '占',
  },
  score: {
    id: 'app.examination.report.rankingdistribution.scoredistributiongrid.score',
    defaultMessage: '分',
  },
  className: {
    id: 'app.examination.report.rankingdistribution.scoredistributiongrid.table.className',
    defaultMessage: '班级',
  },
});

// const keys
const { FULL_CLALSS_ID } = constant;

/**
 * 教师报告-分数构成多班列表
 * @author tina.zhang
 * @date   2019-05-13
 * @param {array} dataSource - REPORT-102 -> data.questionList
 */
function ScoreDistributionGrid(props) {
  const { dataSource } = props;
  // #region formatdataSource
  const formatDataSource = useMemo(() => {
    // table columns
    let columns = [];
    // 列头题目数据构建
    const headerData = [];
    // 列表数据源
    const tableDataSource = dataSource.map(item => {
      const dataItem = {
        classId: item.classId,
        className: item.className,
        avgScore: parseFloat(item.avgScore),
        mark: item.mark, // 试卷满分
        num: item.num, // 考试人数
      };
      item.statis.forEach(qt => {
        dataItem[qt.questionNo] = parseFloat(qt.avgScore);
        const fullMark = parseFloat(item.mark) || 0;
        if (headerData.findIndex(v => v.questionNo === qt.questionNo) < 0) {
          const title = (
            <div className={styles.title}>
              {qt.questionName}
              <div>
                （{qt.mark}
                {formatMessage(messages.score)}，{formatMessage(messages.takeRate)}
                {fullMark === 0 ? 0 : parseFloat((((qt.mark / item.mark) * 1000) / 10).toFixed(1))}
                %）
              </div>
            </div>
          );
          headerData.push({
            questionNo: qt.questionNo,
            title,
          });
        }
      });

      columns = [
        {
          title: <div className="title">{formatMessage(messages.className)}</div>,
          dataIndex: 'className',
          key: 'className',
          align: 'center',
        },
        {
          title: <div className="title">{formatMessage(messages.avgScore)}</div>,
          dataIndex: 'avgScore',
          key: 'avgScore',
          align: 'center',
          render: (avgScore, record) => {
            return record.num > 0 ? avgScore : <>–</>;
          },
        },
      ];
      headerData.forEach(hd => {
        columns.push({
          title: hd.title,
          dataIndex: hd.questionNo,
          key: hd.questionNo,
          align: 'center',
          render: (questionNo, record) => {
            return record.num > 0 ? questionNo : <>–</>;
          },
        });
      });

      return dataItem;
    });
    // 均分排序 本次考试置顶
    tableDataSource.sort((a, b) => b.avgScore - a.avgScore);
    const tds = tableDataSource
      .filter(v => v.classId === FULL_CLALSS_ID)
      .concat(tableDataSource.filter(v => v.classId !== FULL_CLALSS_ID));
    return {
      headerData,
      columns,
      tableDataSource: tds,
    };
  }, [dataSource]);
  // #endregion

  const { columns, tableDataSource } = formatDataSource;

  return (
    <Table
      rowKey="classId"
      className={styles.sdTable}
      bordered
      pagination={false}
      columns={columns}
      dataSource={tableDataSource}
    />
  );
}

export default ScoreDistributionGrid;
