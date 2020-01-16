import React from 'react';
import { formatMessage } from 'umi/locale';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';

/**
 * 准考证
 * @author tina.zhang
 * @date   2019-8-20 16:45:50
 * @param {string} taskName - 任务名称
 * @param {object} studentInfo - 准考证信息
 */
function TicketItem(props) {

  const { taskName, studentInfo } = props;

  return (
    <div className={styles.ticketItemBox}>

      <div className={styles.ticketItem}>
        <div className={styles.taskName}>
          {taskName}
        </div>
        <div className={styles.title}>
          {formatMessage({ id: "app.title.uexam.examination.info.tab.tickets", defaultMessage: "准考证" })}
        </div>
        <div className={styles.infoRow}>
          <div className={styles.info}>
            <span className={styles.label}>{formatMessage({ id: "app.text.uexam.examination.info.ticket.examNo", defaultMessage: "考        号" })}</span>：
            <span className={styles.text}>{studentInfo.examNo}</span>
          </div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.info}>
            <span className={styles.label}>{formatMessage({ id: "app.text.uexam.examination.info.ticket.stuname", defaultMessage: "姓        名" })}</span>：
            <span className={styles.text} title={studentInfo.studentName}>
              {stringFormat(studentInfo.studentName, 4)}
            </span>
          </div>
          <div className={styles.info}>
            <span className={styles.label}>{formatMessage({ id: "app.text.uexam.examination.info.ticket.class", defaultMessage: "班        级" })}</span>：
            <span className={styles.text}>{studentInfo.className}</span>
          </div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.info}>
            <span className={styles.label}>{formatMessage({ id: "app.text.uexam.examination.info.ticket.place", defaultMessage: "考        点" })}</span>：
            <span className={styles.text}>{studentInfo.examPlaceName}</span>
          </div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.info}>
            <span className={styles.label}>{formatMessage({ id: "app.text.uexam.examination.info.ticket.room", defaultMessage: "考        场" })}</span>：
            <span className={styles.text}>{studentInfo.examRoomName}</span>
          </div>
          <div className={styles.info}>
            <span className={styles.label}>{formatMessage({ id: "app.text.uexam.examination.info.ticket.batch", defaultMessage: "批        次" })}</span>：
            <span className={styles.text}>{studentInfo.examBatchName}</span>
          </div>
        </div>
        <div className={styles.infoRow}>
          <div className={styles.info}>
            <span className={styles.label}>{formatMessage({ id: "app.text.uexam.examination.info.ticket.time", defaultMessage: "考试时间" })}</span>：
            <span className={styles.text}>{studentInfo.examDateTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TicketItem
