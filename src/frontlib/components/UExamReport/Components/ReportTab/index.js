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
const { SYS_TYPE, UEXAM_REPORT_TAB } = constant;

/**
 * 考后报告 切换tab
 * @author tina.zhang
 * @date   2019-08-21
 * @param {string} activeKey - 当前key
 * @param {function} onChange - tab切换事件
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 */
function ReportTab(props) {

  const tabTexts = useMemo(() => {
    return [
      formatMessage({ id: "app.text.uexam.report.tab.kwOverview", defaultMessage: "考务情况总览" }),
      formatMessage({ id: "app.text.uexam.report.tab.examOverview", defaultMessage: "考试情况总览" }),
      formatMessage({ id: "app.text.uexam.report.tab.examStatis", defaultMessage: "考情分析" }),
      formatMessage({ id: "app.text.uexam.report.tab.stuTranscript", defaultMessage: "学生成绩单" }),
      formatMessage({ id: "app.text.uexam.report.tab.answerDetail", defaultMessage: "答题详情" })
    ];
  }, []);

  const { type, onChange, activeKey } = props;

  const [activeTabKey, setActiveTabKey] = useState(activeKey);

  // Tab 切换
  const handleLink = (key) => {
    setActiveTabKey(key);
    if (onChange && typeof (onChange) === 'function') {
      onChange(key);
    }
  }

  return (
    <div className={styles.reportTabs}>
      {
        Object.keys(UEXAM_REPORT_TAB).map((v, idx) => {
          if (type === SYS_TYPE.CLASS && idx === 0) {
            return null;
          }
          return (
            <span
              key={UEXAM_REPORT_TAB[v]}
              className={classnames(styles.tabItem, activeTabKey === UEXAM_REPORT_TAB[v] ? styles.active : '')}
              onClick={() => { handleLink(UEXAM_REPORT_TAB[v]); }}
            >
              {tabTexts[idx]}
            </span>
          )
        })
      }
    </div>
  )
}

export default ReportTab;
