/* eslint-disable react/jsx-indent */
import React from 'react';
import { Button, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import { formatDateTime } from '@/utils/utils';
import styles from './index.less';

/**
 * 任务信息
 * @author tina.zhang
 * @date   2019-8-20 08:51:15
 * @param {object} taskInfo  任务信息
 * @param {number} studentNum 考生总数
 * @param {function} onFinishUnstartBatches 结束未开始场次按钮回调
 */
function TaskInfo(props) {
  const { taskInfo, studentNum, onFinishUnstartBatches } = props;
  const { name, gradeValue, ueTypeValue, examBeginTime, examEndTime, statusValue } = taskInfo;

  const examTime = `${formatDateTime(Number(examBeginTime))} ${formatMessage({
    id: 'app.text.uexam.exam.to',
    defaultMessage: '至',
  })} ${formatDateTime(Number(examEndTime))}`;

  return (
    <div className={styles.taskInfo}>
      <div className={styles.infoContainer}>
        <div className={styles.left}>
          <span className={styles.taskName}>{name}</span>
          <span className={styles.otherInfo}>{ueTypeValue}</span>
          <span className={styles.otherInfo}>{statusValue}</span>
          <div className={styles.footerInfo}>
            <span>
              {formatMessage({
                id: 'app.text.uexam.examination.marking.taskitem.grade',
                defaultMessage: '年级',
              })}
              ：<span className={styles.info}>{gradeValue}</span>
            </span>
            <Divider type="vertical" />
            <span>
              {formatMessage({
                id: 'app.text.uexam.tasklist.item.stusum',
                defaultMessage: '考生总数',
              })}
              ：<span className={styles.info}>{studentNum || 0}</span>
            </span>
            <Divider type="vertical" />
            <span>
              {formatMessage({
                id: 'app.text.uexam.examination.inspect.registration.taskinfo.examtime',
                defaultMessage: '考试时间：',
              })}
              <span className={styles.info}>{examTime}</span>
            </span>
          </div>
        </div>
        {onFinishUnstartBatches && (
          <div className={styles.right}>
            <Button
              type="danger"
              className={styles.dangerBtn}
              shape="round"
              onClick={onFinishUnstartBatches}
            >
              {formatMessage({
                id: 'app.button.uexam.information.taskinfo.finishbatches',
                defaultMessage: '结束未开始场次',
              })}
            </Button>
          </div>
        )}
      </div>
      <Divider type="horizontal" />
    </div>
  );
}

export default TaskInfo;
