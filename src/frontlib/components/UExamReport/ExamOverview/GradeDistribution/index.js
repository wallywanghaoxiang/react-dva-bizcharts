import React, { useState, useCallback, useMemo } from 'react';
import { formatMessage } from 'umi/locale';
import ReportPanel from '../../Components/ReportPanel';
import ChartArea from '../../Components/ChartArea';
// import ChartPie from '../../Components/ChartPie';
import constant from '../../constant';
import GradeFilter from './GradeFilter';
import styles from './index.less';

const { SYS_TYPE } = constant;

const messages = {
  panelTitle: { id: "app.examination.report.gradedistribution.paneltitle", defaultMessage: "成绩分布" },
}

/**
 * 成绩分布
 * @author tina.zhang
 * @date   2019-8-22 14:38:40
 * @param  {Array} scoreStatis - 数据源  data.scoreStatis
 * @param  {Array} activeClassId - 当前选中的班级ID（任课老师报告必须）
 * @param  {Array} classList - 班级列表（任课老师报告必须）
 * @param {function} onClassChanged - 班级切换回调事件（任课老师报告必须）
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 */
function GradeDistribution(props) {

  const { type, scoreStatis, activeClassId, classList, onClassChanged } = props;

  const [activeQuestionId, setActiveQuestionId] = useState('FULL');

  // 题目列表
  const questionList = useMemo(() => {
    if (!scoreStatis || !scoreStatis.questionScore || scoreStatis.questionScore.length <= 0) {
      return null;
    }
    const questions = [{
      questionId: 'FULL',
      questionName: '总分',
      hasData: !!scoreStatis.totalScore
    }];

    scoreStatis.questionScore.forEach(q => {
      if (!questions.some(v => v.questionId === q.questionId)) {
        questions.push({
          questionId: q.questionId,
          questionName: q.questionName,
          hasData: !!q.totalScore
        });
      }
    });
    return questions;
  }, [scoreStatis]);

  // // TODO 饼图level格式化
  // const formatLevel = useCallback((level) => {
  //   const numArray = level.slice(1, level.length - 1).split(',');
  //   const num0 = parseFloat(numArray[0]);
  //   const num1 = parseFloat(numArray[1]);
  //   if (num0 === num1) {
  //     return `得分=${num0}`;
  //   }
  //   // 前后反转
  //   const startSymbol = level.charAt(0);
  //   const endSymbol = level.charAt(level.length - 1);
  //   const start = endSymbol === ']' ? '≥' : '>';
  //   const end = startSymbol === '[' ? '≥' : '>';
  //   return `${num1}${start}得分${end}${num0}`;
  // }, []);

  // 图表数据源
  const dataSource = useMemo(() => {
    if (!scoreStatis || !scoreStatis.questionScore || scoreStatis.questionScore.length <= 0) {
      return null;
    }
    let data = [];
    // // 区、校级报告数据源
    // if (type !== SYS_TYPE.CLASS) {
    if (activeQuestionId === 'FULL') {
      data = scoreStatis.totalScore;
    } else {
      data = scoreStatis.questionScore.find(v => v.questionId === activeQuestionId).totalScore;
    }
    if (data && data.length > 0) {
      const res = data.map(v => ({
        ...v,
        num: parseFloat(v.num),
        rate: parseFloat(v.rate)
      }));
      return res;// .reverse();
    }
    // } else {
    //   // 任课老师班级报告数据源
    //   let pieDataSource;
    //   if (activeQuestionId === 'FULL') {
    //     pieDataSource = scoreStatis.totalScore;
    //   } else {
    //     pieDataSource = scoreStatis.questionScore.find(v => v.questionId === activeQuestionId).totalScore;
    //   }
    //   data = pieDataSource.map(item => {
    //     const level = formatLevel(item.level);
    //     return {
    //       item: level,
    //       value: parseFloat(item.num),
    //       rate: parseFloat(item.rate)
    //     }
    //   });
    // }
    return data;
  }, [scoreStatis, activeQuestionId, activeClassId]);

  // 题目切换
  const handleQuestionChanged = useCallback((value) => {
    const questionInfo = questionList.find(v => v.questionId === value);
    if (questionInfo.hasData) {
      setActiveQuestionId(value);
    }
  }, [questionList])

  // 班级切换
  const handleClassChanged = useCallback((value) => {
    if (onClassChanged && typeof (onClassChanged) === 'function') {
      onClassChanged(value);
    }
  }, [onClassChanged])

  return (
    <div className={styles.gradeDistribution}>
      {dataSource && dataSource.length > 0 &&
        <ReportPanel title={formatMessage(messages.panelTitle)} padding="0" style={{ overflow: 'hidden' }}>
          <div className={styles.gradeFilter}>
            <GradeFilter
              classList={type === SYS_TYPE.CLASS ? classList : null}
              onClassChanged={handleClassChanged}
              activeClassId={activeClassId}
              questionList={questionList}
              onQuestionChanged={handleQuestionChanged}
              activeQuestionId={activeQuestionId}
            />
          </div>
          <ChartArea dataSource={dataSource} />
          {/* <ChartArea dataSource={dataSource} activeQuestionId={activeQuestionId} questionList={questionList} onQuestionChanged={handleQuestionChanged} /> */}
          {/* {type !== SYS_TYPE.CLASS
            && <ChartArea dataSource={dataSource} activeQuestionId={activeQuestionId} questionList={questionList} onQuestionChanged={handleQuestionChanged} />
          } */}
          {/* {type === SYS_TYPE.CLASS &&
            <ChartPie
              graphData={dataSource}
              classList={classList}
              activeClassId={activeClassId}
              onClassChanged={handleClassChanged}
              questionList={questionList}
              activeQuestionId={activeQuestionId}
              onQuestionChanged={handleQuestionChanged}
            />
          } */}
        </ReportPanel>
      }
    </div>
  )
}

export default GradeDistribution
