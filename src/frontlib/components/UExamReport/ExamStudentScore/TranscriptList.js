/* eslint-disable no-unused-vars */
/* eslint-disable prefer-spread */
/* eslint-disable radix */
/* eslint-disable no-script-url */
import React, { useState, useCallback, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { Icon, Table } from 'antd';
// eslint-disable-next-line no-unused-vars
import { Chart, Geom, Axis, Tooltip } from 'bizcharts';
import { formatMessage, defineMessages } from 'umi/locale';
import constant from '@/frontlib/components/MissionReport/constant';
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
 * @param {string} type - 统考（EXAM），线上平台（CAMPUS、CLASS）
 */
function TranscriptList(props) {
  // eslint-disable-next-line no-unused-vars
  const {
    dataSource,
    classType,
    classCount,
    taskId,
    taskType,
    isExerciseReport,
    paperId,
    loading,
    onSortChange,
    subjectiveNum,
    objectiveNum,
    type,
    current,
  } = props;

  // console.log('type', type);

  // 为解决鼠标快速经过排名趋势列时，crosshairs 不消失问题，更新 state 重新渲染table
  // eslint-disable-next-line no-unused-vars
  const [tndencyLine, setTendencyLine] = useState();
  const [show, changeShow] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [stuInfo, setStuInfo] = useState({});

  // 答题时长转换
  // eslint-disable-next-line no-unused-vars
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
    // eslint-disable-next-line no-unused-vars
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
        width: 140,
        dataIndex: 'examNo',
        key: 'examNo',
        ...props.getColumnSearchProps('examNo'),
        align: 'left',
      });
    }

    columns.push({
      title: (
        <span>
          {formatMessage({
            id: 'app.title.uexam.frontlib.uexamreport.examstudentscore.transcriptlist.theExaminee',
            defaultMessage: '考生',
          })}
        </span>
      ),
      width: 70,
      dataIndex: 'studentName',
      key: 'studentName',
      align: 'left',
      ...props.getColumnSearchProps('studentName'),
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
                title={studentName}
              >
                {studentName}
              </div>
            ) : (
              <div className={styles.studentName} title={studentName}>
                {studentName}
              </div>
            )}
          </>
        );
      },
    });

    if (type === 'EXAM') {
      columns.push({
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.frontlib.uexamreport.examstudentscore.transcriptlist.theSchool',
              defaultMessage: '学校',
            })}
          </span>
        ),
        dataIndex: 'campusName',
        key: 'campusName',
        align: 'left',
        width: 120,
        ...props.getColumnSearchProps('campusName'),
        render: campusName => {
          return (
            <div className={styles.campusName} title={campusName}>
              {campusName}
            </div>
          );
        },
      });
    }

    columns.push({
      title: (
        <span>
          {classType === CLASS_TYPES.learningGroup
            ? formatMessage(messages.learningGroupOfclassName)
            : formatMessage(messages.className)}
        </span>
      ),
      width: 90,
      dataIndex: 'className',
      key: 'className',
      align: 'left',
    });

    // 多班显示班级列
    // if (classCount > 1) {
    //   columns.push({
    //     title: <span>{classType === CLASS_TYPES.learningGroup ? formatMessage(messages.learningGroupOfclassName) : formatMessage(messages.className)}</span>,
    //     dataIndex: 'className',
    //     key: 'className',
    //     align: 'left',
    //     sorter: true,
    //     sortDirections: ['descend', 'ascend']
    //   });
    // }
    columns.push(
      ...[
        {
          title: <span>{formatMessage(messages.paperName)}</span>,
          width: 210,
          dataIndex: 'paperName',
          key: 'paperName',
          align: 'left',
        },
        {
          title: <span>{formatMessage(messages.score)}</span>,
          width: 50,
          dataIndex: 'score',
          key: 'score',
          align: 'left',
          sorter: true,
          sortDirections: ['descend', 'ascend'],
          render: (score, item) => {
            if (
              item.examStatus === 'ES_0' ||
              item.examStatus == null ||
              (item.examStatus === 'ES_3' && item.cmonitoringDesc !== 'ES_2')
            ) {
              return (
                <>
                  <span>--</span>
                </>
              );
            }
            return (
              <>
                <span>{Number(score)}</span>
              </>
            );
          },
        },
      ]
    );
    // 主观题得分
    if (subjectiveNum) {
      columns.push({
        title: (
          <span>
            {formatMessage({
              id:
                'app.title.campus.frontlib.uexamreport.examstudentscore.transcriptlist.theSubjectiveTopic',
              defaultMessage: '主观题',
            })}
          </span>
        ),
        width: 70,
        dataIndex: 'subjectScore',
        key: 'subjectScore',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (subjectScore, item) => {
          if (
            item.examStatus === 'ES_0' ||
            item.examStatus == null ||
            (item.examStatus === 'ES_3' && item.cmonitoringDesc !== 'ES_2')
          ) {
            return (
              <>
                <span>--</span>
              </>
            );
          }
          return (
            <>
              <span>{Number(subjectScore)}</span>
            </>
          );
        },
      });
    }
    // 客观题得分
    if (objectiveNum) {
      columns.push({
        title: (
          <span>
            {formatMessage({
              id:
                'app.title.campus.frontlib.uexamreport.examstudentscore.transcriptlist.objectiveTopic',
              defaultMessage: '客观题',
            })}
          </span>
        ),
        width: 70,
        dataIndex: 'objectScore',
        key: 'objectScore',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (objectScore, item) => {
          if (
            item.examStatus === 'ES_0' ||
            item.examStatus == null ||
            (item.examStatus === 'ES_3' && item.cmonitoringDesc !== 'ES_2')
          ) {
            return (
              <>
                <span>--</span>
              </>
            );
          }
          return (
            <>
              <span>{Number(objectScore)}</span>
            </>
          );
        },
      });
    }
    // 练习报告不显示排名
    // if (!isExerciseReport) {
    //   columns.push({
    //     title: <span>{classType === CLASS_TYPES.learningGroup ? formatMessage(messages.learningGroupOfClassRank) : formatMessage(messages.classRank)}</span>,
    //     dataIndex: paperId === FULL_PAPER_ID ? 'classRank' : 'paperClassRank',
    //     key: paperId === FULL_PAPER_ID ? 'classRank' : 'paperClassRank',
    //     align: 'left',
    //     sorter: true,
    //     sortDirections: ['descend', 'ascend'],
    //     render: (classRankNum, item) => {
    //       const curRankNum = parseInt(classRankNum);
    //       const lastRankNum = parseInt(item.lastClassRank);
    //       return (
    //         <>
    //           <span style={{ float: 'left', width: '0px' }}>
    //             {classRankNum}
    //           </span>
    //           {(!lastRankNum || curRankNum === lastRankNum || lastRankNum === -1) ? <span style={{ display: 'inline-block', width: '14px' }} />
    //             : <Icon type={curRankNum < lastRankNum ? "arrow-up" : "arrow-down"} style={{ marginLeft: 'calc(50% - 6.5px)' }} />
    //           }
    //         </>
    //       )
    //     }
    //   });
    // }
    // 多班增加本次排名列(练习报告不显示排名)
    if (type === 'CAMPUS' || type === 'CLASS') {
      columns.push({
        title: (
          <span>
            {formatMessage({
              id:
                'app.title.campus.frontlib.uexamreport.examstudentscore.transcriptlist.theSchoolRankings',
              defaultMessage: '校内排名',
            })}
          </span>
        ),
        width: 80,
        dataIndex: 'gradeRank',
        key: 'gradeRank',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (gradeRank, item) => {
          if (
            item.examStatus === 'ES_0' ||
            item.examStatus == null ||
            (item.examStatus === 'ES_3' && item.cmonitoringDesc !== 'ES_2') ||
            `${item.comments}`.includes('作弊')
          ) {
            return (
              <>
                <span>--</span>
              </>
            );
          }
          // update 2019-9-30 15:07:36
          //! update 2019-10-11 16:43:55
          // if (paperId !== "FULL" && paperId !== "") {
          //   return (
          //     <>
          //       <span>{item.paperGradeRank}</span>
          //     </>
          //   )
          // }
          return (
            <>
              <span>{gradeRank}</span>
            </>
          );
        },
      });
    }
    // if (!isExerciseReport && classCount > 1) {
    // update 2019-11-7 16:16:52   VB-8805
    if (type === 'EXAM') {
      columns.push({
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.frontlib.uexamreport.examstudentscore.transcriptlist.areaRanked',
              defaultMessage: '区排名',
            })}
          </span>
        ),
        width: 70,
        dataIndex: 'rank',
        key: 'rank',
        align: 'left',
        sorter: true,
        sortDirections: ['descend', 'ascend'],
        render: (rank, item) => {
          if (
            item.examStatus === 'ES_0' ||
            item.examStatus == null ||
            (item.examStatus === 'ES_3' && item.cmonitoringDesc !== 'ES_2') ||
            `${item.comments}`.includes('作弊')
          ) {
            return (
              <>
                <span>--</span>
              </>
            );
          }
          return (
            <>
              <span>{rank}</span>
            </>
          );
        },
      });
    }

    // }
    // 练习报告增加答题时长
    // if (isExerciseReport) {
    //   columns.push({
    //     title: <span>{formatMessage(messages.duration)}</span>,

    //     dataIndex: 'duration',
    //     key: 'duration',
    //     align: 'left',
    //     sorter: true,
    //     sortDirections: ['descend', 'ascend'],
    //     render: (duration) => (
    //       <span>{formatDuration(duration)}</span>
    //     )
    //   });
    // }

    columns.push({
      title: (
        <span>
          {formatMessage({
            id: 'app.title.uexam.frontlib.uexamreport.examstudentscore.transcriptlist.note',
            defaultMessage: '备注',
          })}
        </span>
      ),
      width: 120,
      dataIndex: 'comments',
      key: 'comments',
      align: 'left',
    });
    return columns;
  }, [dataSource, classCount, show]);

  // #endregion

  // #region 事件处理
  const handleTableChangeSorter = useCallback((pagination, filters, sorter) => {
    // eslint-disable-next-line no-console
    console.log(pagination, filters, sorter);
    onSortChange(pagination, filters, sorter);
    // if (onSortChange && typeof (onSortChange) === 'function') {
    //   let sortKey = '';
    //   let order = '';
    //   if (Object.keys(sorter).length > 0) {
    //     sortKey = sorter.columnKey;
    //     order = sorter.order === 'ascend';
    //   }
    //   onSortChange(sortKey, order);
    // }
  }, []);

  // #endregion

  return (
    <div className={styles.transcript}>
      <Table
        rowKey="studentId"
        className={styles.transcriptTable}
        // bordered
        loading={loading}
        // eslint-disable-next-line react/destructuring-assignment
        pagination={{ hideOnSinglePage: true, pageSize: 10, total: props.total, current }}
        columns={getColumns}
        dataSource={dataSource}
        onChange={handleTableChangeSorter}
      />
    </div>
  );
}

export default TranscriptList;
