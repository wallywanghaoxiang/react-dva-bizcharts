import React, { useEffect, useCallback } from 'react';
import { Message } from 'antd';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import Dashboard from './Dashboard';
import AnswerAnalyze from './AnswerAnalyze';
import AbilityAnalyze from './AbilityAnalyze/index';
import ScoreRateTrace from './ScoreRateTrace';
import constant from '../../../constant';
import styles from './index.less';

const messages = defineMessages({
  loadingTip: { id: 'app.examination.report.reportoverview.loadingTip', defaultMessage: '学生分析报告加载中，请稍等...' },
  setScoreRateSuccess: { id: 'app.examination.report.reportoverview.setScoreRateSuccess', defaultMessage: '设置成功' }
});

// const keys
const { TASK_TYPE, EXERCISE_TYPE } = constant;

/**
 * 学生报告总览
 * @author tina.zhang
 * @date   2019-05-15
 * @param {string} paperId - 试卷ID
 * @param {string} studentId - 学生ID
 */
function ReportOverview(props) {

  const { dispatch, taskOverview, studentReportOverview, paperId, studentId, pageLoading } = props;

  useEffect(() => {
    dispatch({
      type: 'report/getStudentReportOverview',
      payload: {
        campusId: localStorage.campusId,
        taskId: taskOverview.taskId,
        paperId,
        studentId
      }
    });
  }, [paperId]);

  // 设置目标得分率
  const setScoreRate = useCallback((scoreRate, setCallback) => {
    dispatch({
      type: 'report/setStudentScoreRate',
      payload: {
        campusId: localStorage.campusId,
        studentId,
        studentName: studentReportOverview.studentName,
        scoreRate
      }
    }).then(res => {
      if (res.responseCode === '200') {
        Message.success(formatMessage(messages.setScoreRateSuccess));
        setCallback();
      } else {
        Message.error(res.data);
      }
    });
  }, [studentReportOverview]);

  // 是否为练习报告
  const isExerciseReport = taskOverview.type === TASK_TYPE.TEST || (taskOverview.type === TASK_TYPE.TRAINING && taskOverview.exerciseType === EXERCISE_TYPE.EXER)

  return (
    <div className={styles.reportStudentOverview}>
      {pageLoading && <NoData noneIcon={noneicon} tip={formatMessage(messages.loadingTip)} onLoad={pageLoading} />}
      {!pageLoading && studentReportOverview &&
        <>
          {studentReportOverview.task &&
            <Dashboard
              isExerciseReport={isExerciseReport}// {taskOverview.type === TASK_TYPE.TEST}
              classCount={taskOverview.classList.length}
              score={studentReportOverview.score}
              task={studentReportOverview.task}
              clazz={studentReportOverview.clazz}
              taskRank={studentReportOverview.rank}
              classRank={studentReportOverview.classRank}
              rankStatus={studentReportOverview.rankStatus}
            />
          }
          {studentReportOverview.question && studentReportOverview.question.length > 0 &&
            <AnswerAnalyze dataSource={studentReportOverview.question} />
          }
          {/* {studentReportOverview.ability && studentReportOverview.ability.length > 0 && studentReportOverview.ability.some(a => a.statics && a.statics.length > 0) && */}
          <AbilityAnalyze isExerciseReport={isExerciseReport} dataSource={studentReportOverview.ability} classCount={taskOverview.classList.length} />
          {/* taskOverview.type !== TASK_TYPE.TEST */}
          {!isExerciseReport && studentReportOverview.recentExam && studentReportOverview.recentExam.length > 0 &&
            <ScoreRateTrace targetRate={studentReportOverview.target} taskId={taskOverview.taskId} historyRates={studentReportOverview.recentExam} setScoreRate={setScoreRate} />
          }
        </>
      }
    </div>
  )
}

export default connect(({ report, loading }) => ({
  // 任务信息
  taskOverview: report.taskOverview,
  // 情况总览
  studentReportOverview: report.studentReportOverview,
  // 页面加载状态
  pageLoading: loading.effects['report/getStudentReportOverview']
}))(withRouter(ReportOverview))
