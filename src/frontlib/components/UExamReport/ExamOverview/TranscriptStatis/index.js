import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Table } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../Components/ReportPanel';
import constant from '../../constant';
import compare from '@/utils/compare';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';

const { SYS_TYPE } = constant;

const messages = defineMessages({
  schoolTitle: { id: "app.title.uexam.report.transcriptstatis.panel.title.school", defaultMessage: "各校成绩单" },
  anyClassTitle: { id: "app.title.uexam.report.transcriptstatis.panel.title.anyclass", defaultMessage: "各班成绩单" },
  classTitle: { id: "app.title.uexam.report.transcriptstatis.panel.title.class", defaultMessage: "班级成绩单" },
  schoolNo: { id: "app.title.uexam.report.transcriptstatis.schoolno", defaultMessage: "学校号" },
  schoolName: { id: "app.title.uexam.report.transcriptstatis.schoolname", defaultMessage: "学校" },
  currentRank: { id: "app.examination.report.transcript.table.rank", defaultMessage: "本次排名" },
  schoolRank: { id: "app.title.uexam.report.transcriptstatis.schoolRank", defaultMessage: "校内排名" },
  areaRank: { id: "app.title.uexam.report.transcriptstatis.areaRank", defaultMessage: "区排名" },
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
});

/**
 * 总览各校成绩单/各班成绩单
 * @author tina.zhang
 * @date   2019-8-22 09:54:57
 * @param {array}    dataSource - 数据源
 * @param {string}   type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 */
function TranscriptStatis(props) {

  const { type, dataSource } = props;
  const [initDataSource, setInitDataSource] = useState(null);
  const [tableSource, setTableSource] = useState(null)

  // #region 格式化数据源
  useEffect(() => {
    const res = dataSource.map((item) => {
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
    });
    setInitDataSource(res);
    setTableSource(res);
  }, [dataSource]);
  // #endregion

  // get columns
  const getColumns = useMemo(() => {

    // // 非区级报告时，显示为班级统计数据
    // const showClass = type !== SYS_TYPE.UEXAM;

    // const classNames = [{ text: '1班', value: '1' }, { text: '2班', value: '2' }, { text: '3班', value: '3' }, { text: '4班', value: '4' }];
    const columns = [];
    if (type !== SYS_TYPE.UEXAM) {
      columns.push({
        title: formatMessage(messages.className),
        dataIndex: 'className',
        key: 'className',
        width: '18%',
        // ...SelectorFilter(classNames,'className', handleColumnSearch, handleColumnReset)
        render: (text) => {
          // return <span title={text}>{stringFormat(text, 5)}</span>;
          return <span title={text}>{text}</span>;
        }
      })
    } else {
      columns.push(...[{
        title: formatMessage(messages.schoolNo),
        dataIndex: 'campusNumer',
        key: 'campusNumer',
        width: '8%',
        // ...InputFilter('campusNumer', handleColumnSearch, handleColumnReset)
      }, {
        title: formatMessage(messages.schoolName),
        dataIndex: 'campusName',
        key: 'campusName',
        width: '18%',
        // ...InputFilter('campusName', handleColumnSearch, handleColumnReset)
        render: (text) => {
          // return <span title={text}>{stringFormat(text, 5)}</span>;
          return <span title={text}>{text}</span>;
        }
      },]);
    }

    columns.push(...[{
      title: formatMessage(messages.avgScore),
      dataIndex: 'avgScore',
      key: 'avgScore',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      width: '11%',
      //! examNum=0时，表示未参加考试，VB-7932
      render: (avgScore, item) => {
        if ((item.examNum || 0) > 0) {
          return avgScore;
        }
        return <>--</>;
      }
    }, {
      title: formatMessage(messages.maxScore),
      dataIndex: 'maxScore',
      key: 'maxScore',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      width: '11%',
      render: (maxScore, item) => {
        if ((item.examNum || 0) > 0) {
          return maxScore;
        }
        return <>--</>;
      }
    }, {
      title: formatMessage(messages.markRate),
      dataIndex: 'markRate',
      key: 'markRate',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      width: '11%',
      render: (markRate, item) => {
        if ((item.examNum || 0) > 0) {
          return <span>{markRate}%</span>;
        }
        return <>--</>;
      }
    }, {
      title: formatMessage(messages.excellenRate),
      dataIndex: 'excellenRate',
      key: 'excellenRate',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      width: '11%',
      render: (excellenRate, item) => {
        if ((item.examNum || 0) > 0) {
          return <span>{excellenRate}%</span>;
        }
        return <>--</>;
      }
    }, {
      title: formatMessage(messages.passRate),
      dataIndex: 'passRate',
      key: 'passRate',
      sorter: true,
      sortDirections: ['descend', 'ascend'],
      width: '11%',
      render: (passRate, item) => {
        if ((item.examNum || 0) > 0) {
          return <span>{passRate}%</span>;
        }
        return <>--</>;
      }
    }, {
      title: formatMessage(messages.lowRate),
      dataIndex: 'lowRate',
      key: 'lowRate',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      width: '11%',
      render: (lowRate, item) => {
        if ((item.examNum || 0) > 0) {
          return <span>{lowRate}%</span>;
        }
        return <>--</>;
      }
    }]);

    if (type !== SYS_TYPE.UEXAM) {
      columns.push(...[{
        title: formatMessage(messages.schoolRank),
        dataIndex: 'classRank',
        key: 'classRank',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        width: '8%',
        render: (classRank, item) => {
          if ((item.examNum || 0) > 0) {
            return classRank;
          }
          return <>--</>;
        }
      },
        // update 2019-11-7 16:16:52   VB-8805
        // {
        //   title: formatMessage(messages.areaRank),
        //   dataIndex: 'rank',
        //   key: 'rank',
        //   sorter: true,
        //   sortDirections: ['descend', 'ascend'],
        //   width: '8%',
        //   render: (rank, item) => {
        //     if ((item.examNum || 0) > 0) {
        //       return rank;
        //     }
        //     return <>--</>;
        //   }
        // }
      ])
    } else {
      columns.push({
        title: formatMessage(messages.currentRank),
        dataIndex: 'rank',
        key: 'rank',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        width: '8%',
        render: (rank, item) => {
          if ((item.examNum || 0) > 0) {
            return rank;
          }
          return <>--</>;
        }
      });
    }

    return columns;
  }, []);

  // 排序事件
  const handleTableChange = useCallback((pagination, filters, sorter) => {
    const { columnKey, order } = sorter;
    if (!columnKey || !order) {
      setTableSource([...initDataSource]);
    } else {
      const noExamNum = initDataSource.filter(v => (v.examNum || 0) === 0);
      const existsExamNum = initDataSource.filter(v => (v.examNum || 0) > 0);
      const afteSort = [...existsExamNum].sort(compare(columnKey, order));
      setTableSource(afteSort.concat([...noExamNum]));
    }
  }, [initDataSource])

  // 标题
  const panelTitle = useMemo(() => {
    let title = '';
    switch (type) {
      case SYS_TYPE.CAMPUS:
        title = formatMessage(messages.anyClassTitle);
        break;
      case SYS_TYPE.CLASS:
        title = formatMessage(messages.classTitle);
        break;
      default:
        title = formatMessage(messages.schoolTitle);
        break;
    }
    return title;
  }, [type]);

  return (
    <div className={styles.transcriptStatis}>
      <ReportPanel title={panelTitle} bgColor="#FFFFFF" padding="0" style={{ borderRadius: '0' }}>
        {tableSource &&
          <Table
            rowKey={(record, index) => `${index}`}
            className={styles.transcriptTable}
            pagination={{ hideOnSinglePage: true, pageSize: 10, total: tableSource.length }}
            columns={getColumns}
            dataSource={tableSource}
            onChange={handleTableChange}
          />
        }
      </ReportPanel>
    </div>
  )
}

export default TranscriptStatis
