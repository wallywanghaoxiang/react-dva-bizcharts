import React, { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import NoData from '@/components/NoData/index';
import ReportFilter from '../Components/ReportFilter';
import CurrentExam from './CurrentExam';
import TranscriptStatis from './TranscriptStatis';
import GradeDistribution from './GradeDistribution';
import ScoreDistribution from './ScoreDistribution';
import constant from '../constant';
import styles from './index.less';

const { SYS_TYPE, FULL_CAMPUS_ID, FULL_PAPER_ID, FULL_CLASS_ID } = constant;

/**
 * 考试情况总览
 * @author tina.zhang
 * @date   2019-8-21 16:53:04
 * @param {string} taskId - 任务ID
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 */
function ExamOverview(props) {

  const { type, taskId, taskInfo, examOverview, classScoreStatis, loading, dispatch } = props;

  const [state, setState] = useState({
    paperId: FULL_PAPER_ID,
    classIds: FULL_CLASS_ID
  })

  useEffect(() => {

    const params = {
      taskId,
      campusId: localStorage.identityCode === 'UE_ADMIN' ? FULL_CAMPUS_ID : localStorage.campusId,
      paperId: state.paperId,
    }

    //  班级ID集合 （CLASS report 必填）
    if (type === SYS_TYPE.CLASS) {
      const { classIds: theClassIds } = JSON.parse(localStorage.getItem('redirect_to_report_params'));
      if (!theClassIds || theClassIds.length === 0) {
        message.error('参数异常 [redirect_to_report_params]');
        return;
      }
      params.classIds = theClassIds.join(',');
    }

    dispatch({
      type: 'uexamReport/getExamOverview',
      payload: params
    });

  }, [state]);

  // TODO 成绩分布当前选中班级Id
  const [activeClassId, setGradeClassId] = useState(() => {
    if (type === SYS_TYPE.CLASS) {
      const { classList } = taskInfo;
      return classList[0].classId;
    }
    return null;
  })

  useEffect(() => {
    // TODO 班级报告，需请求单独接口获取
    if (type === SYS_TYPE.CLASS && activeClassId) {
      dispatch({
        type: 'uexamReport/getClassScoreStatis',
        payload: {
          taskId,
          campusId: localStorage.identityCode === 'UE_ADMIN' ? FULL_CAMPUS_ID : localStorage.campusId,
          paperId: state.paperId,
          classId: activeClassId
        }
      });
    }
  }, [activeClassId, state.paperId])

  // 试卷切换事件回调
  const handlePaperChanged = useCallback((paperId) => {
    setState({
      ...state,
      paperId
    })
  }, [state]);

  // 班级切换事件回调
  const handleClassChanged = useCallback((classIds) => {
    setState({
      ...state,
      classIds
    })
  }, [state]);

  // !成绩分布->班级切换事件回调
  const handleGradeDistributionClassChanged = useCallback((classId) => {
    setGradeClassId(classId)
  }, []);

  return (
    <div className={styles.examOverview}>
      <ReportFilter
        type={type}
        showFullPaperOption
        paperList={taskInfo.paperList}
        // classList={type === SYS_TYPE.CLASS ? taskInfo.classList : null}
        examNum={taskInfo.successNum}
        onPaperChanged={handlePaperChanged}
        onClassChanged={handleClassChanged}
      />
      {loading && <NoData tip={formatMessage({ id: "app.text.common.loadingtip", defaultMessage: "加载中，请稍后..." })} onLoad />}
      {!loading && examOverview &&
        <>
          {examOverview.examStatis && <CurrentExam dataSource={examOverview.examStatis} type={type} />}
          {examOverview.classStatis && <TranscriptStatis dataSource={examOverview.classStatis} type={type} />}
          {type !== SYS_TYPE.CLASS && examOverview.scoreStatis && examOverview.scoreStatis.totalScore &&
            <GradeDistribution scoreStatis={examOverview.scoreStatis} type={type} />
          }
          {type === SYS_TYPE.CLASS && classScoreStatis && classScoreStatis.totalScore &&
            <GradeDistribution scoreStatis={classScoreStatis} activeClassId={activeClassId} classList={taskInfo.classList} onClassChanged={handleGradeDistributionClassChanged} type={type} />
          }
          {examOverview.examQuestionList && examOverview.examQuestionList.length > 0 && examOverview.questionList && examOverview.questionList.length > 0 &&
            <ScoreDistribution examQuestionList={examOverview.examQuestionList} questionList={examOverview.questionList} type={type} />
          }
        </>
      }
    </div>
  )
}

export default connect(({ uexamReport, loading }) => ({
  taskInfo: uexamReport.taskInfo,         // 任务总览
  examOverview: uexamReport.examOverview, // 考试情况总览
  classScoreStatis: uexamReport.classScoreStatis, // 班级报告成绩分布
  loading: loading.effects['uexamReport/getExamOverview'],
}))(ExamOverview)
