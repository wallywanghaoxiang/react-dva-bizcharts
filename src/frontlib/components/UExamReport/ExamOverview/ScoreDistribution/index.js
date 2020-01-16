import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import classnames from 'classnames';
import ReportPanel from '../../Components/ReportPanel';
import constant from '../../constant';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';

const { SYS_TYPE } = constant;

const messages = defineMessages({
  panelTitle: { id: 'app.examination.report.scoredistribution.panelTitle', defaultMessage: '分数构成' },
  avgScore: { id: 'app.examination.report.rankingdistribution.chartbarcontrast.avgScore', defaultMessage: '均分' },
  takeRate: { id: 'app.examination.report.rankingdistribution.scoredistributiongrid.takeRate', defaultMessage: '占' },
  score: { id: 'app.examination.report.rankingdistribution.scoredistributiongrid.score', defaultMessage: '分' },
  className: { id: 'app.examination.report.rankingdistribution.scoredistributiongrid.table.className', defaultMessage: '班级' },
  schoolName: { id: "app.title.uexam.report.transcriptstatis.schoolname", defaultMessage: "学校" },
});

/**
 * 分数构成
 * @author tina.zhang
 * @date   2019-8-23 09:20:53
 * @param  {Array} examQuestionList - 本次考试+本校数据  data.examQuestionList
 * @param  {Array} questionList - 其他校区、班级统计数据  data.questionList
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 */
function ScoreDistribution(props) {

  const { type, examQuestionList, questionList } = props;

  // 区级报告显示为校统计数据，其他显示班级统计
  const showClass = type !== SYS_TYPE.UEXAM;

  // formatDataSource
  const formatDataSource = useMemo(() => {

    // 列头题目数据构建
    const headerData = [];

    // 列表数据源
    const examTableDataSource = examQuestionList.map(item => {
      const dataItem = {
        classId: item.id,
        className: item.name,
        campusId: item.id,
        campusName: item.name,
        avgScore: parseFloat(item.avgScore) || 0,
        mark: item.mark || 0,// 试卷满分
        //! examNum=0时，表示未参加考试，VB-7932
        //! 不存在未参加考试的学校或者班级 from @Owen
        examNum: item.examNum
      }

      item.statis.forEach(qt => {
        // 题目统计，行转列
        dataItem[qt.questionNo] = parseFloat(qt.avgScore) || 0;
        // 表头数据计算
        if (headerData.findIndex(v => v.questionNo === qt.questionNo) < 0) {
          const fullMark = parseFloat(item.mark) || 0;
          const title = (
            <div className={styles.title}>
              {qt.questionName}
              <div>
                （{qt.mark}{formatMessage(messages.score)}，{formatMessage(messages.takeRate)}{fullMark === 0 ? 0 : parseFloat(((qt.mark / item.mark) * 1000 / 10).toFixed(1))}%）
              </div>
            </div>
          );
          headerData.push({
            questionNo: qt.questionNo,
            title
          });
        }
      });
      return dataItem;
    });

    // 列表数据源
    const tableDataSource = questionList.map(item => {
      const dataItem = {
        classId: item.classId,
        className: item.className,
        campusId: item.campuId,
        campusName: item.campusName,
        avgScore: parseFloat(item.avgScore) || 0,
        mark: item.mark || 0,// 试卷满分
        //! examNum=0时，表示未参加考试，VB-7932
        examNum: item.examNum
      }

      item.statis.forEach(qt => {
        // 题目统计，行转列
        dataItem[qt.questionNo] = parseFloat(qt.avgScore) || 0;
      });
      return dataItem;
    });

    // // 均分排序 本次考试置顶
    // tableDataSource.sort((a, b) => b.avgScore - a.avgScore);
    // const tds = tableDataSource.filter(v => v.classId === FULL_CLASS_ID).concat(tableDataSource.filter(v => v.classId !== FULL_CLASS_ID))
    return {
      headerData,
      examTableDataSource,
      tableDataSource,
    };
  }, [examQuestionList, questionList]);

  const { headerData, examTableDataSource, tableDataSource } = formatDataSource;

  // 表头宽度、table 滚动条大小
  // container width
  const [containerWidth, setContainerWidth] = useState(() => {
    // 宽度计算
    const hasScroll = false;// document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
    const flowChart = document.getElementById('report_flowchart');
    const cWidth = document.getElementById('divReportOverview').clientWidth - 50 - (!flowChart ? 0 : 152) - (hasScroll ? 20 : 0);
    return cWidth;
  });
  const handleWindowResize = useCallback((e) => {
    // 宽度计算
    const hasScroll = false;// document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
    const flowChart = document.getElementById('report_flowchart');
    const cWidth = document.getElementById('divReportOverview').clientWidth - 50 - (!flowChart ? 0 : 152) - (hasScroll ? 20 : 0);
    setContainerWidth(cWidth);
  }, []);
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  const getWidth = useMemo(() => {
    let columnWidth = 'auto';
    const scroll = { x: false };
    // 宽度计算
    // const flowChart = document.getElementById('report_flowchart');
    // const containerWidth = document.getElementById('divReportOverview').clientWidth - 50 - (!flowChart ? 0 : 152);
    if (headerData.length > 6) {
      const maxWidth1 = containerWidth - 250 + headerData.length + 2;
      columnWidth = Math.ceil(maxWidth1 / 6);
      scroll.x = (headerData.length * columnWidth) + 250;
    } else {
      const maxWidth2 = containerWidth - 250 + headerData.length + 2;
      columnWidth = Math.ceil((maxWidth2 / headerData.length));
    }
    return {
      columnWidth,
      scroll,
      containerWidth
    }
  }, [containerWidth, headerData])

  const getColumns = useMemo(() => {

    // table columns
    const columns = [];

    if (!showClass) {
      columns.push({
        title: <div className="title">{formatMessage(messages.schoolName)}</div>,
        dataIndex: 'campusName',
        key: 'campusName',
        width: 190,
        fixed: 'left',
        render: (text) => {
          return <span title={text}>{stringFormat(text, 12)}</span>;
        }
      })
    } else {
      columns.push({
        title: <div className="title">{formatMessage(messages.className)}</div>,
        dataIndex: 'className',
        key: 'className',
        width: 190,
        fixed: 'left',
        render: (text) => {
          return <span title={text}>{stringFormat(text, 12)}</span>;
        }
      })
    }

    columns.push({
      title: <div className="title">{formatMessage(messages.avgScore)}</div>,
      dataIndex: 'avgScore',
      key: 'avgScore',
      align: 'center',
      width: 60,
      fixed: 'left',
      render: (avgScore, item) => {
        if ((item.examNum || 0) > 0) {
          return avgScore;
        }
        return <>-</>;
      }
    });

    headerData.forEach(hd => {
      columns.push({
        title: hd.title,
        dataIndex: hd.questionNo,
        key: hd.questionNo,
        align: 'center',
        width: getWidth.columnWidth,
        render: (text, item) => {
          if ((item.examNum || 0) > 0) {
            return text;
          }
          return <>--</>;
        }
      });
    });

    return columns;
  }, [containerWidth, headerData])

  // table 滚动条联动
  const handleScroll = (e) => {
    const { scrollLeft } = e.target;
    const table1 = document.getElementById("sdTable");
    const antBody = table1.getElementsByClassName('ant-table-body')[0];
    antBody.scrollLeft = scrollLeft;
  }

  useEffect(() => {
    const table2 = document.getElementById("sdTable2");
    const antBody = table2.getElementsByClassName('ant-table-body')[0];
    antBody.addEventListener("scroll", handleScroll);
    return () => {
      antBody.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.scoreDistribution} style={{ width: getWidth.containerWidth }}>
      <ReportPanel title={formatMessage(messages.panelTitle)} bgColor="#FFFFFF" padding="0" style={{ borderRadius: 0 }}>
        <Table
          id="sdTable"
          rowKey={(record, index) => `${index}_${record.campusId}_${record.classId}`}
          className={classnames(styles.sdTable, styles.sdTable1)}
          bordered
          pagination={false}
          columns={getColumns}
          dataSource={examTableDataSource}
          scroll={getWidth.scroll}
        />

        <Table
          id="sdTable2"
          showHeader={false}
          rowKey={(record, index) => `${index}_${record.campusId}_${record.classId}`}
          className={classnames(styles.sdTable, styles.sdTable2)}
          bordered
          pagination={{ hideOnSinglePage: true, pageSize: 10, total: tableDataSource.length }}
          columns={getColumns}
          dataSource={tableDataSource}
          scroll={getWidth.scroll}
        />
      </ReportPanel>
    </div>
  )
}

export default ScoreDistribution
