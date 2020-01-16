import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import NoData from '@/components/NoData/index';
import ReportFilter from '../Components/ReportFilter';
import AbilityAnalysis from './AbilityAnalysis';
import PaperStatistics from './PaperStatistics';
import constant from '../constant';
import styles from './index.less';

const { SYS_TYPE, FULL_CAMPUS_ID, FULL_PAPER_ID } = constant;

const messages = defineMessages({
  fullPaperSelector: { id: 'app.report.constant.fullpaperselector', defaultMessage: '不限' },
});

/**
 * 考情分析
 * @author tina.zhang
 * @date   2019-8-26 10:49:06
 * @param {string} taskId - 任务ID
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 */
function ExamAnalysis(props) {
  const { type, dispatch, taskId, taskInfo, examAnalysis, loading } = props;

  const fullPaperName = formatMessage(messages.fullPaperSelector);

  const fullClassValues = 'ALL';

  const [state, setState] = useState({
    paperId: FULL_PAPER_ID,
    classIds: fullClassValues,
    paperName: fullPaperName,
  });

  useEffect(() => {
    const params = {
      taskId,
      campusId: localStorage.identityCode === 'UE_ADMIN' ? FULL_CAMPUS_ID : localStorage.campusId,
      paperId: state.paperId,
    };
    // CLASS report，传递 localStorage.redirect_to_report_params.classIds 参数
    if (type === SYS_TYPE.CLASS) {
      const reportParams = localStorage.getItem('redirect_to_report_params');
      const { classIds: theClassIds } = JSON.parse(reportParams);
      const classIds = state.classIds === fullClassValues ? theClassIds : state.classIds;
      params.classIds = classIds.join(',');
    }
    dispatch({
      type: 'uexamReport/getExamAnalysis',
      payload: params,
    });
  }, [state]);

  // 试卷切换事件回调
  const handlePaperChanged = useCallback(
    paperId => {
      let paperName;
      if (paperId === FULL_PAPER_ID) {
        paperName = fullPaperName;
      } else {
        const { paperName: pName } = taskInfo.paperList.find(v => v.paperId === paperId);
        paperName = pName;
      }
      setState({
        ...state,
        classIds: fullClassValues,
        paperId,
        paperName,
      });
    },
    [state, taskInfo]
  );

  // 班级切换事件回调
  const handleClassChanged = useCallback(
    values => {
      let classIds = fullClassValues;
      if (values && values.length > 0) {
        classIds = values;
      }
      setState({
        ...state,
        classIds,
      });
    },
    [state]
  );

  // 筛选数据源，当班级为 “全部时” 仅显示 【本次考试】 【本校】
  const filterDataSource = useMemo(() => {
    if (!examAnalysis || !examAnalysis.abilityStatis) {
      return null;
    }
    let dataSource = examAnalysis.abilityStatis;
    if (type === SYS_TYPE.CLASS) {
      // const { classIds: theClassIds } = JSON.parse(localStorage.getItem('redirect_to_report_params'));
      if (state.classIds === fullClassValues) {
        dataSource = examAnalysis.abilityStatis.filter(
          a => a.type === SYS_TYPE.UEXAM || a.type === SYS_TYPE.CAMPUS || a.type === SYS_TYPE.CLASS
        );
      }
    }
    return dataSource;
  }, [examAnalysis]);

  return (
    <div className={styles.examAnalysis}>
      {loading && !examAnalysis && (
        <NoData
          tip={formatMessage({
            id: 'app.text.common.loadingtip',
            defaultMessage: '加载中，请稍后...',
          })}
          onLoad
        />
      )}
      {taskInfo && examAnalysis && (
        <>
          <ReportFilter
            type={type}
            showFullPaperOption
            paperList={taskInfo.paperList}
            // classList={type === SYS_TYPE.CLASS ? taskInfo.classList : null}
            examNum={taskInfo.successNum}
            onPaperChanged={handlePaperChanged}
            // onClassChanged={handleClassChanged}
          />
          <AbilityAnalysis
            type={type}
            dataSource={filterDataSource}
            classList={type === SYS_TYPE.CLASS ? taskInfo.classList : null}
            selectedClassIds={state.classIds === fullClassValues ? [] : state.classIds}
            onClassChanged={handleClassChanged}
          />
          {state.paperId !== FULL_PAPER_ID && examAnalysis.subquestionList && (
            <PaperStatistics
              dataSource={examAnalysis.subquestionList}
              paperName={state.paperName}
            />
          )}
        </>
      )}
    </div>
  );
}

export default connect(({ uexamReport, loading }) => ({
  taskInfo: uexamReport.taskInfo, // 任务总览
  examAnalysis: uexamReport.examAnalysis, // 学情分析(能力分析、试卷区分度难度得分率)
  loading: loading.effects['uexamReport/getExamAnalysis'],
}))(ExamAnalysis);
