import React, { useEffect, useMemo } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import CurrentExam from './CurrentExam';
import GradeDistribution from './GradeDistribution';
import QuestionDistribution from './QuestionDistribution';
import AbilityAnalysis from './AbilityAnalysis';
import RankingDistribution from './RankingDistribution';
import ScoreDistribution from './ScoreDistribution';
import PaperStatistics from './PaperStatistics';
import constant from '../../../constant';
import styles from './index.less';

const messages = defineMessages({
  reportoverviewLoadingTip: { id: 'app.examination.report.reportoverview.loadingTip', defaultMessage: '分析报告加载中，请稍等...' },

  fullPaperSelector: { id: 'app.report.constant.fullpaperselector', defaultMessage: '不限' }
});

// const keys
const { TASK_TYPE, EXERCISE_TYPE, FULL_PAPER_SELECTOR } = constant;

/**
 * 教师报告-首页
 * @author tina.zhang
 * @date 2019-05-07
 * @param {object} paperId - 试卷ID
 */
function ReportOveriew(props) {

  const { taskOverview, reportOverview, rankingList, dispatch, paperId, pageLoading } = props;
  const fullPaperSelector = formatMessage(messages.fullPaperSelector);

  useEffect(() => {
    dispatch({
      type: 'report/getReportOverview',
      payload: {
        campusId: localStorage.campusId, // TODO localStorage.campusId,
        taskId: taskOverview.taskId,
        paperId,
      }
    })
  }, [paperId]);

  // 试卷名称
  const paperName = useMemo(() => {
    const paperInfo = taskOverview.paperList.find(v => v.paperId === paperId);
    if (paperInfo) {
      return paperInfo.paperName;
    }
    return fullPaperSelector;
  }, [paperId]);

  // 是否为练习报告
  const isExerciseReport = taskOverview.type === TASK_TYPE.TEST || (taskOverview.type === TASK_TYPE.TRAINING && taskOverview.exerciseType === EXERCISE_TYPE.EXER)

  return (
    <div className={styles.reportOverview}>
      {pageLoading && <NoData noneIcon={noneicon} tip={formatMessage(messages.reportoverviewLoadingTip)} onLoad={pageLoading} />}
      {!pageLoading && reportOverview && rankingList &&
        <>
          {reportOverview.classStatis && <CurrentExam isExerciseReport={isExerciseReport} dataSource={reportOverview.classStatis} classCount={taskOverview.classList.length} />}
          {reportOverview.scoreStatis && <GradeDistribution dataSource={reportOverview.scoreStatis} classCount={taskOverview.classList.length} />}
          {reportOverview.questionStatis && reportOverview.questionStatis[0] && reportOverview.questionStatis[0].statis && <QuestionDistribution dataSource={reportOverview.questionStatis} classCount={taskOverview.classList.length} />}
          {/* reportOverview.abilityStatis && reportOverview.abilityStatis[0] && reportOverview.abilityStatis[0].statis &&  */}
          <AbilityAnalysis dataSource={reportOverview.abilityStatis} />
          {/* taskOverview.type !== TASK_TYPE.TEST */}
          {rankingList.length > 0 && !isExerciseReport && <RankingDistribution dataSource={rankingList} classCount={taskOverview.classList.length} />}
          {reportOverview.subquestionList && reportOverview.subquestionList.length > 0 && <PaperStatistics dataSource={reportOverview.subquestionList} paperName={paperName} />}
          {reportOverview.questionList && reportOverview.questionList.length > 0 && <ScoreDistribution dataSource={reportOverview.questionList} classCount={taskOverview.classList.length} />}
        </>
      }
    </div>
  )
}

export default connect(({ report, loading }) => ({
  // 任务信息
  taskOverview: report.taskOverview,
  // 情况总览
  reportOverview: report.reportOverview,
  // 排名分布
  rankingList: report.rankingList,
  // 页面加载状态
  pageLoading: loading.effects['report/getReportOverview']
}))(withRouter(ReportOveriew))

