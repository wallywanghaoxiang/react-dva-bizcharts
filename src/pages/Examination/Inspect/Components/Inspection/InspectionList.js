import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Divider, Icon } from 'antd';
import classnames from 'classnames';
import StuReportModal from '@/frontlib/components/MissionReport/TeacherReport/Components/Transcript/StuReportModal';
import InspectionReport from './InspectionReport';
import styles from './index.less'

/**
 * 课后训练任务 - 检查详情 - 基本信息
 * @param {string} taskId - 任务ID
 * @param {object} inspectClassData - 学生列表
 */
function InspectionList(props) {

  // #region  格式化学生姓名、unix时间戳
  const formatString = (str) => {
    if (str && str.length > 4) {
      return `${str.slice(0, 4)}...`
    }
    return str;
  }

  const formatUnixTime = (str) => {
    if (str) {
      const now = new Date(Number(str));
      const m = now.getMonth() + 1;
      const d = now.getDate();
      const h = now.getHours();
      const min = now.getMinutes();
      return `${m}月${d}日 ${h < 10 ? `0${h}` : h}:${min < 10 ? `0${min}` : min}`;
    }
    return '';
  }
  // #endregion

  const { taskId, inspectClassData } = props;
  const [classId, setClassId] = useState(inspectClassData[0].classId)

  // 查阅 整卷试做report
  const [currentStudentInfo, setCurrentStudent] = useState(null);

  // 切换学生列表
  const studentList = useMemo(() => {
    const data = inspectClassData.find(v => v.classId === classId);
    return data.studentList;
  }, [classId]);

  // 班级Tab切换事件
  const classIdRef = useRef();
  classIdRef.current = classId;
  const renderTabs = useCallback((clazz) => {
    return (
      <span
        key={clazz.classId}
        className={classnames(styles.tabItem, clazz.classId === classIdRef.current ? styles.active : '')}
        onClick={() => setClassId(clazz.classId)}
      >
        {clazz.className}
      </span>
    )
  }, []);

  // #region 学生列表项事件处理 - 查阅
  // 查阅
  const handlePreviewClick = (st) => {
    const { examStatus } = st;
    if (examStatus !== 'ES_4') {
      return;
    }
    const classInfo = inspectClassData.find(v => v.classId === classId)
    setCurrentStudent({
      studentId: st.studentId,
      studentName: st.studentName,
      paperId: st.paperId,
      snapshotId: st.snapshotId,
      className: classInfo.className,
      isExerciseReport: st.isExerciseReport,
    });
  };

  // 关闭查阅Modal
  const handleClosePreview = () => {
    setCurrentStudent(null);
  }
  // #endregion

  // #region 渲染学生列表项
  const unFinishedStyle = {
    background: '#F5F5F5',
  };
  const unFininshedBtnStyle = {
    color: '#CCCCCC'
  }

  const renderStudentItem = useCallback((st) => {
    const { examStatus, isFirst, isMakeUp } = st;
    const isFinished = examStatus === 'ES_4';

    return (
      <div key={st.studentId} className={styles.studentItem} style={isFinished ? null : unFinishedStyle}>
        {isFirst && <div className={styles.fastIcon} />}
        {isMakeUp === '1' && <div className={styles.makeUpIcon} />}
        <div className={styles.header}>
          <span className={styles.classCode}>{st.studentClassCode}</span>
          <span className={styles.name} title={st.studentName}>{formatString(st.studentName)}</span>
          {isFinished && <span className={styles.scoreInfo}>{st.score || 0}<span className={styles.mark}>/{st.mark || 0}分</span></span>}
        </div>
        <Divider type="horizontal" />
        <div className={styles.footer}>
          <span className={styles.date}>{isFinished ? formatUnixTime(st.finishTime) : '未完成'}</span>
          <span className={styles.btnPreview} style={isFinished ? null : unFininshedBtnStyle} onClick={() => handlePreviewClick(st)}>
            <Icon type="eye" /> 查阅
          </span>
        </div>
      </div>
    )
  }, []);
  // #endregion

  return (
    <div className={styles.inspectionList}>
      <div className={styles.tabs}>
        {inspectClassData && inspectClassData.map(clzz => renderTabs(clzz))}
      </div>
      <div className={styles.studentList}>
        {studentList && studentList.map(st => renderStudentItem(st))}
      </div>
      {/* 整卷试做报告 */}
      {currentStudentInfo && currentStudentInfo.isExerciseReport !== false &&
        <InspectionReport taskId={taskId} {...currentStudentInfo} onClose={handleClosePreview} />
      }
      {/* 考后报告 */}
      {currentStudentInfo && currentStudentInfo.isExerciseReport === false &&
        <StuReportModal
          data={{
            taskId,
            paperId: currentStudentInfo.paperId,
            studentId: currentStudentInfo.studentId,
            name: currentStudentInfo.studentName,
            className: currentStudentInfo.className
          }}
          onCloseModal={handleClosePreview}
        />
      }
    </div>
  )
}

export default InspectionList
