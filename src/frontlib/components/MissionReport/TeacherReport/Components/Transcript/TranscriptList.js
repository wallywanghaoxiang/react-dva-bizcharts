/* eslint-disable prefer-spread */
/* eslint-disable radix */
/* eslint-disable no-script-url */
import React, { useState, useCallback, useMemo } from 'react';
import { Icon, Table } from 'antd';
import { Chart, Geom, Axis, Tooltip } from 'bizcharts';
import { formatMessage, defineMessages } from 'umi/locale';
import StuReportModal from './StuReportModal';
import constant from '../../../constant';
import styles from './index.less';
import { countDown } from '@/utils/timeHandle';

const messages = defineMessages({
  examNo: { id: 'app.examination.report.transcript.table.examNo', defaultMessage: '考号' },
  examNo2: { id: 'app.title.examination.report.transcript.table.examNo2', defaultMessage: '学号' },
  studentName: {
    id: 'app.examination.report.transcript.table.studentName',
    defaultMessage: '姓名',
  },
  learningGroupOfclassName: {
    id: 'app.examination.report.transcript.table.learningGroupOfclassName',
    defaultMessage: '学习小组',
  },
  className: { id: 'app.examination.report.transcript.table.className', defaultMessage: '班级' },
  paperName: { id: 'app.examination.report.transcript.table.paperName', defaultMessage: '试卷' },
  score: { id: 'app.examination.report.transcript.table.score', defaultMessage: '得分' },
  subjectScore: {
    id: 'app.examination.report.transcript.table.subjectScore',
    defaultMessage: '主观题得分',
  },
  objectScore: {
    id: 'app.examination.report.transcript.table.objectScore',
    defaultMessage: '客观题得分',
  },
  classRank: {
    id: 'app.examination.report.transcript.table.classRank',
    defaultMessage: '本班排名',
  },
  learningGroupOfClassRank: {
    id: 'app.examination.report.transcript.table.learningGroupOfClassRank',
    defaultMessage: '本组排名',
  },
  rank: { id: 'app.examination.report.transcript.table.rank', defaultMessage: '本次排名' },
  recentRank: {
    id: 'app.examination.report.transcript.table.recentRank',
    defaultMessage: '近期排名趋势',
  },
  duration: { id: 'app.examination.report.transcript.table.duration', defaultMessage: '答题时长' },
  transcriptLoadingTip: {
    id: 'app.examination.report.transcript.loadingTip',
    defaultMessage: '成绩单加载中，请稍等...',
  },
});

// const keys
const { TASK_TYPE, FULL_PAPER_ID, CLASS_TYPES } = constant;

/**
 * 教师报告-成绩单
 * @author tina.zhang
 * @date   2019-05-08
 * @param {object} dataSource - 数据源
 * @param {string} classType - 班级类型（班级、学习小组LEARNING_GROUP）
 * @param {number} classCount - 班级数量
 * @param {string} taskId - taskId
 * @param {boolean} taskType - 任务类型
 * @param {boolean} isExerciseReport - 是否练习报告
 * @param {string} paperId - 试卷ID
 * @param {boolean} loading - 加载状态
 * @param {function} onSortChange - 排序事件
 * @param {boolean} showSubjectiveColumn - 是否显示主观题得分列
 * @param {boolean} showObjectiveColumn - 是否显示客观题得分列
 */
function TranscriptList(props) {
  const {
    type,
    dataSource,
    classType,
    classCount,
    taskId,
    taskType,
    isExerciseReport,
    paperId,
    loading,
    onSortChange,
    showSubjectiveColumn,
    showObjectiveColumn,
  } = props;

  // 为解决鼠标快速经过排名趋势列时，crosshairs 不消失问题，更新 state 重新渲染table
  const [tndencyLine, setTendencyLine] = useState();
  const [show, changeShow] = useState(false);
  const [stuInfo, setStuInfo] = useState({});

  // #region 排名趋势 && 时长转换
  const renderTendencyLine = useCallback((item, maxRankTendencyLenth) => {
    const { recentRank } = item;
    // // y轴逆序 最大值取决于班级人数
    // const stuNum = parseInt(item.stuNum) || 0;
    const graphData = recentRank.map((rank, index) => ({
      name: index,
      value: -parseInt(rank.rate || 0),
    }));
    const chartWidth = (recentRank.length / (maxRankTendencyLenth || 200)) * 200;
    // // TODO 排名超过班级人数时，y轴取最大排名否则取班级人数
    // const maxRank = -Math.min.apply(Math, graphData.map(v => v.value));
    const cols = {
      value: {
        min: -100,
        max: -1,
      },
    };
    return graphData && graphData.length > 1 ? (
      <Chart
        key={item.studentId}
        height={40}
        width={chartWidth}
        data={graphData}
        style={{ float: 'right' }}
        padding={[5, 5]}
        scale={cols}
        onPlotEnter={ev => {
          setTendencyLine(item.studentId);
        }}
      >
        <Axis name="name" visible={false} />
        <Axis name="value" visible={false} />
        <Tooltip
          crosshairs={{
            type: 'y',
            style: {
              stroke: '#03C46B',
              lineWidth: 1,
            },
          }}
        />
        <Geom type="line" position="name*value" size={2} color="#03C46B" active={false} />
      </Chart>
    ) : (
      <span style={{ padding: '10px' }}>-</span>
    );
  }, []);

  // 答题时长转换
  const formatDuration = useCallback(duration => {
    let time = duration;
    if (!time || Number.isNaN(Number(time))) {
      time = 0;
    }
    const seconds = Math.round(Number(time) / 1000); // 单位调整为毫秒
    return countDown(seconds);
  }, []);
  // #endregion

  // #region getColumns
  const getColumns = useMemo(() => {
    // TODO VB-6230 【线上平台】【教师报告】成绩单里的近期排名趋势需预留7个点
    const maxRankTendencyLenth = 7; // Math.max.apply(Math, dataSource.map(v => v.recentRank ? v.recentRank.length : 0));
    const columns = [];
    if (taskType === TASK_TYPE.TRAINING) {
      columns.push({
        title: <span>{formatMessage(messages.examNo2)}</span>,
        dataIndex: 'studentClassNo',
        key: 'studentClassNo',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      });
    } else {
      columns.push({
        title: <span>{formatMessage(messages.examNo)}</span>,
        dataIndex: 'examNo',
        key: 'examNo',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      });
    }

    columns.push({
      title: <span>{formatMessage(messages.studentName)}</span>,
      dataIndex: 'studentName',
      key: 'studentName',
      align: 'left',
      render: (studentName, item) => {
        return (
          <>
            {item.examStatus === 'ES_4' || item.examStatus === 'ES_3' ? (
              <div
                className={styles.studentName}
                onClick={() => {
                  changeShow(true);
                  setStuInfo(item);
                }}
              >
                {studentName}
              </div>
            ) : (
              <span>{studentName}</span>
            )}
          </>
        );
      },
    });

    // 多班显示班级列
    if (classCount > 1) {
      columns.push({
        title: (
          <span>
            {classType === CLASS_TYPES.learningGroup
              ? formatMessage(messages.learningGroupOfclassName)
              : formatMessage(messages.className)}
          </span>
        ),
        dataIndex: 'className',
        key: 'className',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      });
    }
    columns.push(
      ...[
        {
          title: <span>{formatMessage(messages.paperName)}</span>,
          dataIndex: 'paperName',
          key: 'paperName',
          align: 'left',
        },
        {
          title: <span>{formatMessage(messages.score)}</span>,
          dataIndex: 'score',
          key: 'score',
          align: 'left',
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
      ]
    );
    // 主观题得分
    if (showSubjectiveColumn) {
      columns.push({
        title: <span>{formatMessage(messages.subjectScore)}</span>,
        dataIndex: 'subjectScore',
        key: 'subjectScore',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      });
    }
    // 客观题得分
    if (showObjectiveColumn) {
      columns.push({
        title: <span>{formatMessage(messages.objectScore)}</span>,
        dataIndex: 'objectScore',
        key: 'objectScore',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      });
    }
    // 练习报告不显示排名
    if (!isExerciseReport) {
      columns.push({
        title: (
          <span>
            {classType === CLASS_TYPES.learningGroup
              ? formatMessage(messages.learningGroupOfClassRank)
              : formatMessage(messages.classRank)}
          </span>
        ),
        dataIndex: paperId === FULL_PAPER_ID ? 'classRank' : 'paperClassRank',
        key: paperId === FULL_PAPER_ID ? 'classRank' : 'paperClassRank',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (classRankNum, item) => {
          const curRankNum = parseInt(classRankNum);
          const lastRankNum = parseInt(item.lastClassRank);
          return (
            <>
              <span style={{ float: 'left', width: '0px' }}>{classRankNum}</span>
              {!lastRankNum || curRankNum === lastRankNum || lastRankNum === -1 ? (
                <span style={{ display: 'inline-block', width: '14px' }} />
              ) : (
                <Icon
                  type={curRankNum < lastRankNum ? 'arrow-up' : 'arrow-down'}
                  style={{ marginLeft: 'calc(50% - 6.5px)' }}
                />
              )}
            </>
          );
        },
      });
    }
    // 多班增加本次排名列(练习报告不显示排名)
    if (!isExerciseReport && classCount > 1) {
      columns.push({
        title: <span>{formatMessage(messages.rank)}</span>,
        dataIndex: paperId === FULL_PAPER_ID ? 'rank' : 'paperRank',
        key: paperId === FULL_PAPER_ID ? 'rank' : 'paperRank',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      });
    }
    // // 练习报告不显示排名趋势
    // if (!isExerciseReport) {
    //   columns.push({
    //     title: <span style={{ padding: '10px' }}>{formatMessage(messages.recentRank)}</span>,
    //     className: styles.chartCell,
    //     dataIndex: 'recentRank',
    //     key: 'recentRank',
    //     align: 'left',
    //     width: '200px',
    //     render: (recentRank, item) => (
    //       <div className={styles.tendencyLine}>
    //         {/* {rankTendency && <TendencyLine tendencyData={rankTendency} maxRankTendencyLenth={maxRankTendencyLenth} />} */}
    //         {recentRank
    //           ? renderTendencyLine(item, maxRankTendencyLenth)
    //           : <span style={{ padding: '10px' }}>-</span>
    //         }
    //       </div>
    //     )
    //   });
    // }
    // 练习报告增加答题时长
    if (isExerciseReport) {
      columns.push({
        title: <span>{formatMessage(messages.duration)}</span>,
        dataIndex: 'duration',
        key: 'duration',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: duration => <span>{formatDuration(duration)}</span>,
      });
    }
    return columns;
  }, [dataSource, classCount, show]);

  // #endregion

  // #region 事件处理
  const handleTableChangeSorter = useCallback((pagination, filters, sorter) => {
    if (onSortChange && typeof onSortChange === 'function') {
      let sortKey = '';
      let order = '';
      if (Object.keys(sorter).length > 0) {
        sortKey = sorter.columnKey;
        order = sorter.order === 'ascend';
      }
      onSortChange(sortKey, order);
    }
  }, []);

  // #endregion

  return (
    <>
      {dataSource.length > 0 && (
        <Table
          rowKey="studentId"
          className={styles.transcriptTable}
          bordered
          loading={loading}
          pagination={false}
          columns={getColumns}
          dataSource={dataSource}
          onChange={handleTableChangeSorter}
        />
      )}
      {show && (
        <StuReportModal
          type={type}
          data={{
            taskId,
            paperId: stuInfo.paperId,
            studentId: stuInfo.studentId,
            name: stuInfo.studentName,
            className: stuInfo.className,
          }}
          onCloseModal={() => {
            changeShow(false);
          }}
        />
      )}
    </>
  );
}

export default TranscriptList;
