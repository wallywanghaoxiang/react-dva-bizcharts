import React, { useMemo } from 'react'
import { Icon, Divider } from 'antd';
import styles from './index.less'

/**
 * 课后训练任务 - 检查详情 - 基本信息
 * @param {object} inspectInfo - 检查信息
 */
function InspectionHeader(props) {

  const { inspectInfo } = props;

  const handleReturn = () => {
    window.history.back(-1);
  }

  // 任务倒计时
  const timeDown = useMemo(() => {
    // const now = new Date();
    const exerciseEndTime = new Date(Number(inspectInfo.exerciseEndTime));
    // const days = (exerciseEndTime - now) / (1000 * 60 * 60 * 24);

    // // TODO fk owen & victor
    // if (days < 0) {
    //   // TODO
    // } else if (Math.floor(days) > 1) {
    //   return ` ${days} 天`;
    // } else if (Math.floor(days) === 1) {
    //   return `最后 1 天`;
    // }
    // const hours = (exerciseEndTime - now) / (1000 * 60 * 60);
    // const mins = (exerciseEndTime - now) / (1000 * 60 * 60);

    // const y = exerciseEndTime.getFullYear();
    const m = exerciseEndTime.getMonth() + 1;
    const d = exerciseEndTime.getDate();
    const h = exerciseEndTime.getHours();
    const min = exerciseEndTime.getMinutes();
    // return `${(m < 10 ? `0${m}` : m)}-${(d < 10 ? `0${d}` : d)}`;
    return `${m}月${d}日 ${h < 10 ? `0${h}` : h}:${min < 10 ? `0${min}` : min}`;

  }, [inspectInfo.exerciseEndTime])

  return (
    <div className={styles.inspectionHeader}>
      <div className={styles.info}>
        <span className={styles.return} onClick={handleReturn}>
          <Icon type="left" />返回
        </span>
        <span className={styles.taskName}>{inspectInfo.name}</span>
      </div>
      <Divider type="horizontal" />
      <div className={styles.progress}>
        完成进度：<span className={styles.studentNum}>{inspectInfo.examNum}</span>/{inspectInfo.studentNum}
        <Divider type="vertical" />
        截止时间：<span className={styles.timedown}>{timeDown}</span>
      </div>
    </div>
  )
}

export default InspectionHeader
