import React, { useEffect, useCallback, useMemo } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import { message } from 'antd';
import formatExamReport from '@/frontlib/utils/formatExamReport';
import ExamReport from '@/frontlib/components/ExampaperReport/index';
import { showTime } from '@/utils/timeHandle';

/**
 * 课后训练任务 - 检查详情 - 整卷试做报告
 * @param {string} taskId - 任务ID
 * @param {string} paperId - 试卷ID
 * @param {string} snapshotId - 试卷快照ID
 * @param {string} studentId - 学生ID
 * @param {string} studentName - 学生姓名
 * @param {string} className - 班级名称
 * @param {function} onClose - 关闭报告回调事件
 */
function InspectionReport(props) {

  const { taskId, paperId, snapshotId, studentId, studentName, className, onClose, dispatch, inspectInfo, paperData, paperShowData, examReport } = props;

  // 加载学生答卷详情
  const loadStudentExamReport = useCallback(() => {
    dispatch({
      type: 'inspect/tsmkExamReport',
      payload: {
        taskId,
        paperId,
        studentId
      }
    })
  }, []);

  // 加载试卷结构
  const loadShowData = useCallback((_paperData) => {
    const idArray = [];
    _paperData.paperInstance.forEach(ins => {
      if (!ins.type || (ins.type && ins.type === 'PATTERN')) {
        idArray.push(ins.pattern.questionPatternId);
      }
    });
    if (paperShowData && Object.keys(paperShowData).every(v => idArray.indexOf(v) > -1)) {
      loadStudentExamReport();
    } else {
      dispatch({
        type: 'inspect/fetchPaperShowData',
        payload: { idList: idArray.join(',') }
      }).then(resp => {
        const { responseCode, data } = resp;
        if (responseCode !== '200') {
          message.error(data);
          return;
        }
        loadStudentExamReport();
      });
    }
  }, []);

  // 加载试卷快照
  useEffect(() => {
    message.loading('报告加载中，请稍后...');
    if (inspectInfo && inspectInfo.taskId === taskId && paperData && paperData.paperId === paperId) {
      loadShowData(paperData);
    } else {
      dispatch({
        type: 'inspect/getPaperData',
        payload: {
          snapshotId
        }
      }).then(resp => {
        const { responseCode, data } = resp;
        if (responseCode !== '200') {
          message.error(`试卷快照加载失败：${data}`);
          return;
        }
        loadShowData(data);
      });
    }

    // 组件销毁清空学生答题详情
    return () => {
      dispatch({ type: 'inspect/clearExamReport' });
    }
  }, []);



  // 监听学生试做报告，重组报告数据源
  const reportDataSource = useMemo(() => {
    if (!examReport || !paperData || !paperShowData) {
      return null;
    }
    // TODO 重组报告数据源...
    formatExamReport(paperData, examReport.subquestionList);
    message.destroy();
    const durationString = showTime(examReport.duration || 0,"ms");
    return {
      paperData,
      showData: paperShowData,
      allTime: durationString
    };
  }, [examReport]);

  // 关闭报告弹窗回调
  const handleReportClose = useCallback(() => {
    if (onClose && typeof (onClose) === 'function') {
      onClose();
    }
  }, [])

  return (
    <>
      {/* 教师端title：采用姓名|班级  学生端title:练习报告 */}
      {reportDataSource && <ExamReport modalTitle={(studentName && className) ? `${studentName}︱${className}` : '练习报告'} dataSource={reportDataSource} isFinish callback={() => { }} onClose={handleReportClose} />}
    </>
  )
}

export default connect(({ inspect, loading }) => ({
  // 检查详情
  inspectInfo: inspect.inspectInfo,
  // 试卷快照
  paperData: inspect.paperData,
  // 试卷结构
  paperShowData: inspect.paperShowData,
  // 学生试做报告
  examReport: inspect.examReport,
  // 页面加载状态
  // pageLoading: loading.effects['inspect/xxxx']
}))(withRouter(InspectionReport));
