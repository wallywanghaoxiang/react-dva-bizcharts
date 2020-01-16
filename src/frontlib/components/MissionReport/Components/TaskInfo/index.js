import React, { useMemo } from 'react';
import { Divider, Button } from 'antd';
import classnames from 'classnames';
import { formatMessage, defineMessages } from 'umi/locale';
import constant from '../../constant';
import styles from './index.less';

const messages = defineMessages({
  fullMarkLabel: { id: 'app.examination.report.taskinfo.fullMarkLabel', defaultMessage: '总分' },
  score: { id: 'app.examination.report.taskinfo.score', defaultMessage: '分' },
  personNum: { id: 'app.examination.report.taskinfo.personNum', defaultMessage: '人' },
  btnReturn: { id: 'app.button.examination.report.taskinfo.return', defaultMessage: '返回' },
  manualCorrectionBtnText: {
    id: 'app.examination.report.taskinfo.manualCorrectionBtnText',
    defaultMessage: '人工纠偏',
  },
  publishGradeBtnText: {
    id: 'app.examination.report.taskinfo.publishGradeBtnText',
    defaultMessage: '发布成绩',
  },
  myScore: { id: 'app.examination.report.taskinfo.myScore', defaultMessage: '我的得分' },
  classCount: { id: 'app.examination.report.taskinfo.classCount', defaultMessage: '班级数量' },
  groupCount: { id: 'app.text.examination.report.taskinfo.groupCount', defaultMessage: '分组数量' },
  paperCount: { id: 'app.examination.report.taskinfo.paperCount', defaultMessage: '试卷数量' },
  examStudentNum: {
    id: 'app.examination.report.taskinfo.examStudentNum',
    defaultMessage: '实考/应考',
  },
  exerStudentNum: {
    id: 'app.text.examination.report.taskinfo.exerStudentNum',
    defaultMessage: '实练/应练',
  },
  reportDate: { id: 'app.examination.report.taskinfo.reportDate', defaultMessage: '日期' },
});

// 格式化unix时间戳
const formatUnixTime = str => {
  if (str) {
    const now = new Date(Number(str));
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    const d = now.getDate();
    return `${y}-${m < 10 ? `0${m}` : m}-${d < 10 ? `0${d}` : d}`;
  }
  return '';
};

const { CLASS_TYPES } = constant;

/**
 * 考后报告-任务信息
 * @author tina.zhang
 * @date   2019-05-06
 * @param  {boolean} isTeacher
 * @param  {boolean} isExerciseReport - 是否练习报告
 * @param  {object} taskOverview - 任务信息总览
 * @param  {object} taskStatus - 任务状态
 * @param  {string} paperId - 试卷ID
 * @param  {function} publishGrade - 发布成绩
 * @param {string} type - 当前平台(exam考中、line:线上)
 */
function TaskInfo(props) {
  const {
    type,
    isTeacher,
    isExerciseReport,
    taskOverview,
    taskStatus,
    paperId,
    studentReportOverview,
    showMyScore,
    publishGrade,
    classId,
    taskId,
  } = props;

  let fullMark = 0;
  if (!isTeacher) {
    fullMark = taskOverview.paperList.find(v => v.paperId === paperId).mark;
  }

  // 人工纠偏
  const handleManualCorrection = () => {
    window.location.href = `/artificial/correct/${paperId}/${taskId}/${classId}`;
  };

  // 发布成绩
  const handlePublishGrade = () => {
    if (publishGrade && typeof publishGrade === 'function') {
      publishGrade();
    }
  };

  // 返回教师报告成绩单页面
  const handleReturn = () => {
    history.back(-1);
  };

  // 我的得分
  const myScore = useMemo(() => {
    if (showMyScore && studentReportOverview && studentReportOverview.paperList) {
      const paperInfo = studentReportOverview.paperList.find(v => v.paperId === paperId);
      if (paperInfo) {
        return paperInfo.score || 0;
      }
      return studentReportOverview.score || 0;
    }
    return 0;
  }, [paperId, showMyScore]);

  const scoreText = formatMessage(messages.score);

  // 隐藏root，添加打印 dom
  const printElement = printDom => {
    const root = document.getElementById('root');
    root.style.display = 'none';
    let printContainer = document.getElementById('printContainer');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'printContainer';
      printContainer.style.width = '210mm';
      printContainer.appendChild(printDom);
      document.body.appendChild(printContainer);
    } else {
      printContainer.appendChild(printDom);
    }
    setTimeout(() => {
      window.print();
      // window.location.reload();
      // printContainer.innerHTML = '';
      // root.style.display = 'block';
    }, 1000);
  };
  // 替换 body
  const replaceBody = printDom => {
    // 备份原来的页面
    const old = window.document.body.innerHTML;
    window.document.body.innerHTML = '';
    // 将你要打印的内容附加到这
    window.document.body.appendChild(printDom);
    // 调用print()函数时，会跳出打印预览的界面，以下的代码被阻塞，关闭预览界面后继续执行
    window.print();
    // 重新加载旧页面
    window.document.body.innerHTML = old;
    // TODO  不重新加载页面，事件不能正常响应
    // window.location.reload()
  };

  const handlePrint = () => {
    const report = document.getElementById('divReportOverview');
    printElement(report);
    // replaceBody(report);
  };

  return (
    <div className={styles.taskInfo}>
      <div className={styles.title}>
        <span className={styles.taskName}>{taskOverview.taskName}</span>
        {!isTeacher && (
          <span className={styles.taskFullMark}>
            {formatMessage(messages.fullMarkLabel)}： {fullMark}
            {scoreText}
          </span>
        )}
        {isTeacher && type === 'exam' && (
          <Button className={styles.btn} shape="round" onClick={handleReturn}>
            {formatMessage(messages.btnReturn)}
          </Button>
        )}
        {showMyScore && (
          <div className={styles.myscore}>
            {formatMessage(messages.myScore)}
            <span>{myScore}</span>
            {scoreText}
          </div>
        )}
        {isTeacher &&
          taskStatus &&
          taskStatus.status === 'TS_4' &&
          taskStatus.linkStatus === 'ES_17' && (
            <>
              {taskStatus.rectifyType === 'CURRENT_TEACHER' && (
                <Button className={styles.btn} shape="round" onClick={handleManualCorrection}>
                  {formatMessage(messages.manualCorrectionBtnText)}
                </Button>
              )}
              <Button
                className={classnames(styles.btn, styles.btnOrange)}
                shape="round"
                onClick={handlePublishGrade}
              >
                {formatMessage(messages.publishGradeBtnText)}
              </Button>
            </>
          )}
        {/* update 隐藏打印功能 */}
        {/* <Button className={styles.btn} shape="round" onClick={handlePrint}>打印</Button> */}
      </div>

      {isTeacher === true ? (
        <div className={styles.content}>
          <span>
            {formatMessage(
              taskOverview.classType !== CLASS_TYPES.learningGroup
                ? messages.classCount
                : messages.groupCount
            )}
            ：{taskOverview.classList.length}
          </span>{' '}
          <Divider type="vertical" />
          <span>
            {formatMessage(messages.paperCount)}：{taskOverview.paperList.length}
          </span>{' '}
          <Divider type="vertical" />
          <span>
            {isExerciseReport
              ? formatMessage(messages.exerStudentNum)
              : formatMessage(messages.examStudentNum)}
            ：{`${taskOverview.examNum}/${taskOverview.studentNum}`}
            {formatMessage(messages.personNum)}
          </span>
          <Divider type="vertical" />
          <span>
            {formatMessage(messages.reportDate)}： {formatUnixTime(taskOverview.examTime)}
          </span>
        </div>
      ) : (
        <div className={styles.content}>
          <span>
            {formatMessage(messages.reportDate)}： {formatUnixTime(taskOverview.examTime)}
          </span>
        </div>
      )}
      <Divider type="horizontal" />
    </div>
  );
}

export default TaskInfo;
