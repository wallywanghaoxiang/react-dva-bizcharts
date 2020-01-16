import React from 'react';
import { Row, Col } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../../../Components/ReportPanel/index';
import ChartTickGauge from '../../../../Components/ChartTickGauge';
import RankingInfo from './RankingInfo';
import constant from '../../../../constant';

const messages = defineMessages({
  currentClass: { id: 'app.examination.report.st.dashboard.currentClass', defaultMessage: '本班' },
  currentExercise: { id: 'app.examination.report.st.dashboard.currentExercise', defaultMessage: '本次练习' },
  currentExam: { id: 'app.examination.report.st.dashboard.currentExam', defaultMessage: '本次考试' }
});

// const keys
const { STUDENT_RANKING_TYPE } = constant;

/**
 * 学生报告-仪表看板
 * @param {boolean} isExerciseReport - 是否练习报告
 * @param {number} classCount - 班级数量
 * @param {number} score - 得分
 * @param {object} task - 本次任务统计
 * @param {object} clazz - 本次任务班级统计
 * @param {number} taskRank - 本次考试排名 (超越：1-(排名-1)/总人数)
 * @param {number} classRank - 本班排名 (超越：1-(排名-1)/总人数)
 * @param {boolean} rankStatus - 是否显示排名信息 (N不显示，其他值显示)
 */
function Dashboard(props) {

  const { isExerciseReport, classCount, score, task, clazz, taskRank, classRank, rankStatus } = props;

  // 仪表盘数据源
  const gaugeDataSource = {
    fullMark: parseFloat(task.mark),
    myScore: parseFloat(score),
    taskAvgScore: parseFloat(task.avgScore),
    taskMaxScore: parseFloat(task.maxScore),
    classAvgScore: parseFloat(clazz.avgScore),
    classMaxScore: parseFloat(clazz.maxScore),
  }

  // 本班排名信息宽度设置
  let offset = 6;
  if (classCount > 1) {
    offset = null;
  }

  // 排名类型：pass:超越、ranking:名次
  let taskRankOrRate = taskRank;
  let classRankOrRate = classRank;
  let taskRankType = STUDENT_RANKING_TYPE.ranking;
  let classRankType = STUDENT_RANKING_TYPE.ranking;
  if (score === 0) {
    taskRankOrRate = 0;
    classRankOrRate = 0;
  }
  else {
    if (taskRank > 3) {
      // 是否倒数三名
      const taskRankDiff = taskRank - task.maxRank;
      if (taskRankDiff <= 0 && taskRankDiff >= -2) {
        taskRankOrRate = taskRankDiff - 1;
      } else {
        taskRankType = STUDENT_RANKING_TYPE.pass;
        // 计算超越百分比
        taskRankOrRate = parseFloat((((task.examNum - taskRank) / task.examNum) * 1000 / 10).toFixed(1));
      }
    }
    if (classRank > 3) {
      // 是否倒数三名
      const classRankDiff = classRank - task.maxClassRank;
      if (classRankDiff <= 0 && classRankDiff >= -2) {
        classRankOrRate = classRankDiff - 1;
      } else {
        classRankType = STUDENT_RANKING_TYPE.pass;
        // 计算超越百分比
        classRankOrRate = parseFloat((((clazz.examNum - classRank) / clazz.examNum) * 1000 / 10).toFixed(1));
      }
    }
  }

  return (
    <ReportPanel padding="0" bgColor="#fff" style={{ overflow: 'hidden' }}>
      <ChartTickGauge isExerciseReport={isExerciseReport} classCount={classCount} graphData={gaugeDataSource} />
      {rankStatus !== 'N' && !isExerciseReport &&
        <Row gutter={20}>
          {classCount > 1 &&
            <Col span={12}>
              <RankingInfo key="rankingInfo_task" leftText={formatMessage(messages.currentExam)} rank={taskRankOrRate} rankType={taskRankType} />
            </Col>
          }
          <Col span={12} offset={offset}>
            <RankingInfo key="rankingInfo_class" leftText={formatMessage(messages.currentClass)} rank={classRankOrRate} rankType={classRankType} />
          </Col>
        </Row>
      }
    </ReportPanel>
  )
}

export default Dashboard
