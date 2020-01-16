/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { connect } from 'dva';
import XLSX from 'xlsx';
import { withRouter } from 'react-router-dom';
import { formatMessage, defineMessages } from 'umi/locale';
import Pagination from '@/components/Pagination/index';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import ReportPanel from '../../../Components/ReportPanel';
import TranscriptList from './TranscriptList';
import SuggestList from './SuggestList';
import constant from '../../../constant';
import styles from './index.less';

const messages = defineMessages({
  suggestPanelTitle: {
    id: 'app.examination.report.transcript.suggestpaneltitle',
    defaultMessage: '建议关注',
  },
  transcriptLoadingTip: {
    id: 'app.examination.report.transcript.loadingTip',
    defaultMessage: '成绩单加载中，请稍等...',
  },
});

// const keys
const { TASK_TYPE, EXERCISE_TYPE, FULL_PAPER_ID } = constant;

/**
 * 教师报告-成绩单
 * @author tina.zhang
 * @date   2019-05-08
 * @param {object} paperId - 试卷ID
 * @param {object} classIdList - 班级ID
 */
function Transcript(props) {
  const {
    type,
    taskOverview,
    transcript,
    suggestResult,
    dispatch,
    paperId,
    classIdList,
    pageLoading,
    tableLoading,
    taskStatus,
  } = props;

  const [state, setState] = useState({
    pageOrSortChanged: false,
    pageIndex: 1,
    pageSize: 10,
    sort: null,
    asc: null,
  });

  // 加载成绩单列表、建议关注列表
  useEffect(() => {
    setState({
      ...state,
      pageIndex: 1,
      pageOrSortChanged: false,
    });
    dispatch({
      type: 'report/getTranscript',
      payload: {
        campusId: localStorage.campusId,
        taskId: taskOverview.taskId,
        paperId,
        classIdList,
        pageIndex: 1,
        pageSize: state.pageSize,
        sort: state.sort,
        asc: state.sort,
      },
    });
  }, [paperId, classIdList, taskStatus]);

  // 监听分页、排序，刷新Table
  useEffect(() => {
    if (!state.pageOrSortChanged) {
      // 首次加载，无需请求数据
      return;
    }
    dispatch({
      type: 'report/refreshTranscriptTable',
      payload: {
        campusId: localStorage.campusId,
        taskId: taskOverview.taskId,
        paperId,
        classIdList,
        pageIndex: state.pageIndex,
        pageSize: state.pageSize,
        sort: state.sort,
        asc: state.asc,
      },
    });
  }, [state.pageIndex, state.sort, state.asc]);

  // 分页事件
  const stateRef = useRef();
  stateRef.current = state;
  const onPageChange = useCallback(e => {
    setState({
      ...stateRef.current,
      pageOrSortChanged: true,
      pageIndex: e,
    });
  }, []);

  // 排序事件
  const onSortChange = useCallback((sort, asc) => {
    setState({
      ...stateRef.current,
      pageIndex: 1,
      pageOrSortChanged: true,
      sort,
      asc,
    });
  });

  // 建议关注是否有数据

  // TODO 课后训练  练习模式判断
  const isExerciseReport =
    taskOverview.type === TASK_TYPE.TEST ||
    (taskOverview.type === TASK_TYPE.TRAINING && taskOverview.exerciseType === EXERCISE_TYPE.EXER);

  const hasSuggestData = useMemo(() => {
    // 练习报告同样不显示
    if (isExerciseReport) {
      return false;
    }
    if (suggestResult && suggestResult.length > 0) {
      return suggestResult.some(
        v => v.attention.rankDownList.length > 0 || v.attention.rankUpList.length > 0
      );
    }
    return false;
  }, [suggestResult]);

  // 成绩单列表主观题得分列、客观题得分列是否显示处理 (当试卷下拉框为不限时，取第一份试卷的配置)
  const objectiveAndSubjective = useMemo(() => {
    let paperLists = {};

    taskOverview.paperList.forEach(e => {
      if (e.examNum > 0) {
        paperLists = e;
      }
    });

    let { objectiveNum, subjectiveNum } = paperLists;

    if (paperId !== FULL_PAPER_ID) {
      const paperInfo = taskOverview.paperList.find(v => v.paperId === paperId);
      ({ objectiveNum, subjectiveNum } = paperInfo);
    }
    return {
      showObjectiveColumn: objectiveNum !== 0,
      showSubjectiveColumn: subjectiveNum !== 0,
    };
  }, [paperId]);

  // 导出Excel
  const handleExportClick = () => {
    dispatch({
      type: 'report/exportTranscript',
      payload: {
        campusId: localStorage.campusId,
        taskId: taskOverview.taskId,
        paperId,
        classIdList,
        pageIndex: 1,
        pageSize: 1000000000,
        sort: state.sort,
        asc: state.asc,
      },
    }).then(exportTranscript => {
      console.log('transcript', exportTranscript);
      let exportTranscriptRecords = null;
      if (!exportTranscript || !exportTranscript.records || exportTranscript.records.length === 0) {
        exportTranscriptRecords = [];
      } else {
        exportTranscriptRecords = exportTranscript.records;
      }
      let questionLists = []; // 试卷题目
      if (isExerciseReport) {
        // 练习成绩单
        console.log('练习成绩单', paperId);
        if (taskOverview.paperList) {
          questionLists = taskOverview.paperList.filter(m => m.paperId === paperId)[0].questionList;
        }
      } else {
        // 考试成绩单
        console.log('考试成绩单', paperId);

        if (taskOverview.paperList && paperId && paperId !== 'FULL') {
          questionLists = taskOverview.paperList.filter(m => m.paperId === paperId)[0].questionList;
        } else if (taskOverview.paperList && taskOverview.paperList[0].questionList) {
          taskOverview.paperList.forEach(e => {
            if (e.examNum > 0) {
              questionLists = e.questionList;
            }
          });
        }
      }

      // 数据表格
      const table = [];
      const params = {
        A: '',
        B: formatMessage({
          id: 'app.title.uexam.examination.inspect.registration.result.className',
          defaultMessage: '班级',
        }),
        C: formatMessage({
          id: 'app.title.uexam.examination.inspect.registration.table.examNo',
          defaultMessage: '考号',
        }),
        D: formatMessage({ id: 'app.text.xm', defaultMessage: '姓名' }),
        E: formatMessage({ id: 'app.text.score', defaultMessage: '得分' }),
      };
      questionLists.forEach((questionItem, index) => {
        params[`F${index}`] = questionItem.questionName;
      });
      params.LAST = formatMessage({
        id: 'app.examination.publish.paper',
        defaultMessage: '试卷',
      });
      table.push(params);

      exportTranscriptRecords.forEach((item, index) => {
        let obj = {};
        obj = {
          A: Number(index) + 1,
          B: item.className,
          C: item.examNo,
          D: item.studentName,
          E: item.score,
        };
        const questionScoreLists = item.questionScoreList;
        if (questionScoreLists) {
          questionLists.forEach((questionItem, itemindex) => {
            obj[`F${itemindex}`] = questionScoreLists.filter(
              m => m.questionNo === questionItem.questionNo
            )[0].score;
          });
        }

        obj.LAST = item.paperName;
        table.push(obj);
      });

      // const wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' }; // 定义导出的格式类型
      const wopts = { bookType: 'biff2', bookSST: false, type: 'binary' }; // 定义导出的格式类型
      // const wb = {
      //   SheetNames: [`${taskOverview.taskName}_成绩单`],
      //   Sheets: {},
      //   Props: {},
      // };
      const header = [];
      const cols = [];
      for (const k in table[0]) {
        header.push(k);
        if (k === 'B') {
          cols.push({ width: 20 });
        } else if (k === 'LAST') {
          cols.push({ width: 35 });
        } else if (k.includes('F')) {
          cols.push({ width: 25 });
        } else {
          cols.push({ width: 10 });
        }
      }
      const wb = XLSX.utils.book_new();

      const ws = XLSX.utils.json_to_sheet(table, {
        header,
        skipHeader: true,
      }); //  { header: ["考号", "考生姓名", "班级", "考点", "考场", "批次", "监考老师", "考试日期"], skipHeader: true }
      // this.saveAsExcel(new Blob([this.s2ab(XLSX.write(wb, wopts))], { type: "application/octet-stream" }), `考务明细.${(wopts.bookType === "biff2" ? "xls" : wopts.bookType)}`);

      ws['!cols'] = cols;

      XLSX.utils.book_append_sheet(wb, ws, `${taskOverview.taskName}_成绩单`);

      XLSX.writeFile(
        wb,
        `${taskOverview.taskName}_成绩单.${wopts.bookType === 'biff2' ? 'xlsx' : wopts.bookType}`
      );
    });
  };

  return (
    <div className={styles.reportTranscript}>
      {pageLoading && (
        <NoData
          noneIcon={noneicon}
          tip={formatMessage(messages.transcriptLoadingTip)}
          onLoad={pageLoading}
        />
      )}
      {!pageLoading && transcript && (
        <ReportPanel padding="0" bgColor="#fff" style={{ borderRadius: '0px' }}>
          {type === 'line' && (
            <div className={styles.export}>
              <div className={styles.btnExport} onClick={handleExportClick}>
                <i className="iconfont icon-excel" />
                {formatMessage({ id: 'app.text.export', defaultMessage: '导出' })}
              </div>
            </div>
          )}
          {transcript.records && transcript.records.length > 0 && (
            <>
              <TranscriptList
                type={type}
                taskId={taskOverview.taskId}
                taskType={taskOverview.type}
                isExerciseReport={isExerciseReport}
                dataSource={transcript.records}
                classType={taskOverview.classType}
                classCount={taskOverview.classList.length}
                paperId={paperId}
                loading={tableLoading} // {state.tableLoading}
                onSortChange={onSortChange}
                {...objectiveAndSubjective}
              />
              <div className={styles.pagination}>
                <Pagination
                  current={state.pageIndex}
                  pageSize={state.pageSize}
                  total={transcript.total}
                  onChange={onPageChange}
                />
              </div>
            </>
          )}
        </ReportPanel>
      )}
      {!pageLoading && hasSuggestData && (
        <div className={styles.suggestResult}>
          <ReportPanel title={formatMessage(messages.suggestPanelTitle)} padding="0" bgColor="#fff">
            {suggestResult.map(item => (
              <SuggestList
                key={item.classId}
                dataSource={item}
                classCount={taskOverview.classList.length}
              />
            ))}
          </ReportPanel>
        </div>
      )}
    </div>
  );
}

// export default Transcript;
export default connect(({ report, loading }) => ({
  // 任务信息
  taskOverview: report.taskOverview,
  // 成绩单数据
  transcript: report.transcript,
  // 成绩单数据
  suggestResult: report.suggestResult,
  // 页面加载状态
  pageLoading: loading.effects['report/getTranscript'],
  // table加载状态
  tableLoading: loading.effects['report/refreshTranscriptTable'],
  // 发布成绩任务状态
  taskStatus: report.taskStatus,
}))(withRouter(Transcript));
