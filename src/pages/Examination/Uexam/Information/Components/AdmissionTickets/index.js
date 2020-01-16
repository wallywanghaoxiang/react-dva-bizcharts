import React, { useEffect } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import NoData from '@/components/NoData';
import noneIcon from '@/assets/examination/none_serach_pic.png';
import TicketItem from './TicketItem';
import styles from './index.less';

/**
 * 准考证列表
 * @author tina.zhang
 * @date   2019-8-20 14:52:15
 * @param {string} taskId - 任务ID
 * @param {string} taskName - 任务名称
 * @param {string} classId - 班级ID
 * @param {string} filterWords - 筛选关键字（姓名/考号）
 */
function AdmissionTickets(props) {
  const { taskId, taskName, classId, filterWords, dispatch, admissionTickets, loading } = props;

  useEffect(() => {
    dispatch({
      type: 'uexam/getAdmissionTickets',
      payload: {
        taskId,
        campusId: localStorage.campusId,
        classId,
        stuNameKey: filterWords,
      },
    });
  }, [classId, filterWords]);

  return (
    <div id="admissionTickets" className={styles.admissionTickets}>
      {loading && !admissionTickets && (
        <NoData
          tip={formatMessage({
            id: 'app.message.registration.taskinfo.loading.tip',
            defaultMessage: '信息加载中，请稍等...',
          })}
          onLoad
        />
      )}
      {!loading && (!admissionTickets || admissionTickets.length === 0) && (
        <NoData
          tip={formatMessage({
            id: 'app.exam.inspect.list.no.data.tip',
            defaultMessage: '暂无搜索结果',
          })}
          noneIcon={noneIcon}
        />
      )}
      {admissionTickets && admissionTickets.length > 0 && (
        <>
          {admissionTickets.map(v => {
            const coms = [];
            coms.push(
              <div key={v.classId} className={styles.classStatisInfo}>
                {v.className} |{' '}
                {formatMessage(
                  { id: 'app.text.uexam.examination.info.sticknum', defaultMessage: '共{num}份' },
                  { num: v.studentList.length }
                )}
              </div>
            );
            v.studentList.forEach(s => {
              coms.push(<TicketItem key={s.studentId} taskName={taskName} studentInfo={s} />);
            });

            return coms;
          })}
        </>
      )}
    </div>
  );
}

export default connect(({ uexam, loading }) => ({
  admissionTickets: uexam.admissionTickets,
  loading: loading.effects['uexam/getAdmissionTickets'],
}))(AdmissionTickets);
