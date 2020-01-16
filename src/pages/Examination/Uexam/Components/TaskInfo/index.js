/* eslint-disable react/jsx-indent */
import React, { useMemo } from 'react';
import { Divider } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { formatDateTime } from '@/utils/utils';
import styles from './index.less';

/**
 * 任务信息
 * @author tina.zhang
 * @date   2019-8-9 14:27:32
 * @param {object} taskInfo  任务信息
 * @param {Boolean} showCountDown  是否显示倒计时
 */
function TaskInfo(props) {
  const { taskInfo, showCountDown } = props;
  const { name, gradeValue, ueTypeValue, examBeginTime, examEndTime, enrollEndTime, arrangeEndTime, invigilateEndTime, status } = taskInfo;

  const examTime = `${formatDateTime(Number(examBeginTime))} ${formatMessage({ id: "app.text.uexam.exam.to", defaultMessage: "至" })} ${formatDateTime(Number(examEndTime))}`;

  // 是否需要倒计时,天数
  const getDays = useMemo(() => {
    if ((status !== 'TS_3' && status !== 'TS_2' && status !== 'TS_1') || !showCountDown) {
      return null;
    }
    let endTime = 0;
    switch (status) {
      case 'TS_1':
        endTime = enrollEndTime;
        break;
      case 'TS_2':
        endTime = arrangeEndTime;
        break;
      case 'TS_3':
        endTime = invigilateEndTime;
        break;

      default:
        break;
    }
    // 计算剩余天数
    const nowUnix = (new Date()).getTime();
    const diff = endTime - nowUnix; // 毫秒
    if (diff < 0) {
      return null;
    }
    const days = Math.ceil(diff / (3600 * 1000) / 24);
    return days;
  }, []);

  return (
    <div className={styles.taskInfo}>
      <span className={styles.taskName}>{name}</span>
      <span className={styles.otherInfo}>{gradeValue}</span>
      <span className={styles.otherInfo}>{ueTypeValue}</span>
      <span className={styles.otherInfo}>
        {formatMessage({ id: "app.text.uexam.examination.inspect.registration.taskinfo.examtime", defaultMessage: "考试时间：" })}
        {examTime}
      </span>
      {getDays && status === 'TS_1' &&
        <span className={styles.countdown}>
          {getDays === 1 ?
            <FormattedMessage
              id="app.text.uexam.examination.inspect.registration.taskinfo.lastday"
              defaultMessage="今日截止报名"
            />
            :
            <FormattedMessage
              id="app.text.uexam.examination.inspect.registration.taskinfo.countdown"
              defaultMessage="报名剩余时间：{countdown}"
              values={{
                countdown:
                  <span className={styles.days}>
                    {formatMessage({ id: "app.text.uexam.examination.inspect.registration.taskinfo.days", defaultMessage: "{days}天" }, { "days": getDays })}
                  </span>,
              }}
            />
          }

        </span>
      }
      {getDays && status === 'TS_2' &&
        <span className={styles.countdown}>
          {getDays === 1 ?
            <FormattedMessage
              id="app.text.uexam.examination.arrange.taskinfo.lastday"
              defaultMessage="今日截止编排"
            />
            :
            <FormattedMessage
              id="app.text.uexam.examination.arrange.taskinfo.countdown"
              defaultMessage="编排剩余时间：{countdown}"
              values={{
                countdown:
                  // eslint-disable-next-line react/jsx-indent
                  <span className={styles.days}>
                    {formatMessage({ id: "app.text.uexam.examination.inspect.registration.taskinfo.days", defaultMessage: "{days}天" }, { "days": getDays })}
                  </span>,
              }}
            />
          }
        </span>
      }
      {getDays && status === 'TS_3' &&
        <span className={styles.countdown}>
          {getDays === 1 ?
            <FormattedMessage
              id="app.text.uexam.examination.invigilation.taskinfo.lastday"
              defaultMessage="今日截止安排"
            />
            :
            <FormattedMessage
              id="app.text.uexam.examination.invigilation.taskinfo.countdown"
              defaultMessage="安排剩余时间：{countdown}"
              values={{
                countdown:
                  // eslint-disable-next-line react/jsx-indent
                  <span className={styles.days}>
                    {formatMessage({ id: "app.text.uexam.examination.inspect.registration.taskinfo.days", defaultMessage: "{days}天" }, { "days": getDays })}
                  </span>,
              }}
            />
          }
        </span>
      }
      <Divider type="horizontal" />
    </div>
  )
}

export default TaskInfo;
