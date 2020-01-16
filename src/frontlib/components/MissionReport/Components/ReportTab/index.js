import React, { useState, useMemo } from 'react';
import classnames from 'classnames';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import constant from '../../constant';

const messages = defineMessages({
  exerciseReportOverview: { id: 'app.examination.report.reporttab.exerciseReportOverview', defaultMessage: '练习情况总览' },
  examReportOverview: { id: 'app.examination.report.reporttab.examReportOverview', defaultMessage: '考试情况总览' },
  transcript: { id: 'app.examination.report.reporttab.transcript', defaultMessage: '成绩单' },
  paperreport: { id: 'app.examination.report.reporttab.paperreport', defaultMessage: '答题详情' },
});

// const keys
const { REPORT_TAB_KEY } = constant;

/**
 * 考后报告 切换tab
 * @author tina.zhang
 * @date   2019-05-06
 * @param {boolean} isTeacher - 是否教师报告
 * @param {boolean} isExerciseReport - 是否练习报告
 * @param {function} onChange - tab切换事件
 */
function ReportTab(props) {

  const { isTeacher, isExerciseReport, onChange } = props;

  const [activeTabKey, setActiveTabKey] = useState(REPORT_TAB_KEY.report);

  // Tab 切换
  const handleLink = (key) => {
    setActiveTabKey(key);
    if (onChange && typeof (onChange) === 'function') {
      onChange(key);
    }
  }

  const overviewTabText = useMemo(() => {
    if (isTeacher) {
      return isExerciseReport === true ? formatMessage(messages.exerciseReportOverview) : formatMessage(messages.examReportOverview);
    }
    return isExerciseReport === true
      ? formatMessage({ id: "app.text.examination.report.reporttab.st.exerciseReportOverview", defaultMessage: "练习情况统计" })
      : formatMessage({ id: "app.text.examination.report.reporttab.st.examReportOverview", defaultMessage: "考试情况统计" });
  }, [isTeacher, isExerciseReport]);

  return (
    <div className={styles.reportTabs}>
      <span
        key={REPORT_TAB_KEY.report}
        className={classnames(styles.tabItem, activeTabKey === REPORT_TAB_KEY.report ? styles.active : '')}
        onClick={() => { handleLink(REPORT_TAB_KEY.report); }}
      >
        {overviewTabText}
      </span>
      {isTeacher &&
        <span
          key={REPORT_TAB_KEY.transcript}
          className={classnames(styles.tabItem, activeTabKey === REPORT_TAB_KEY.transcript ? styles.active : '')}
          onClick={() => { handleLink(REPORT_TAB_KEY.transcript); }}
        >
          {formatMessage(messages.transcript)}
        </span>
      }
      <span
        key={REPORT_TAB_KEY.paperreport}
        className={classnames(styles.tabItem, activeTabKey === REPORT_TAB_KEY.paperreport ? styles.active : '')}
        onClick={() => handleLink(REPORT_TAB_KEY.paperreport)}
      >
        {formatMessage(messages.paperreport)}
      </span>
    </div>
  )
}

export default ReportTab;
