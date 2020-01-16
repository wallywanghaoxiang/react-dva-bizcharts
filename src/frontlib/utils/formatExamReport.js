/* eslint-disable no-param-reassign */
import { calculatScore, scoringMachine, fromCharCode, IsEmpty, toChinesNum, autoCreatePatternInfoText, CHOICEPICTUREWIDTH, CHOICEPICTUREHEIGHT } from '@/frontlib/utils/utils';

// 拼接实际数据
function getAnswer(question, id, answerInfos) {
  // 选择题换算成Id
  const num = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, H: 7, I: 8, J: 9, K: 10, }
  const { answerType } = question;
  const answer = answerInfos.find(v => v.subquestionNo === id);
  if (answer) {
    if (answerType === "CHOICE") {
      if (answer.studentAnswers !== "server.wzd" && answer.studentAnswers !== null) {
        question.answerId = question.choiceQuestionAnswerInfo.options[num[answer.studentAnswers]].id;
      }
    } else if (answerType === "GAP_FILLING") {
      question.answerValue = answer.studentAnswers === "server.wzd" ? "未作答" : answer.studentAnswers;
    } else {
      question.answerValue = answer.engineResult;
    }
    return true;
  }
  return false;
}

// 获取试卷结构中题目原数据
function getQuestionIndexData(type, qes, qesIdx) {
  const questionIndexData = qes.data;
  switch (type) {
    case 'NORMAL':  // 普通题型展示
      return questionIndexData;
    case 'TWO_LEVEL': // 二层题型展示
      return questionIndexData;
    case 'COMPLEX': // 复合题型展示
      {
        const groupsItem = qes.data.groups[qesIdx].data;
        return groupsItem;
      }
    default:
      // eslint-disable-next-line no-throw-literal
      throw `questionPatternType ${type} is not support!`
  }
}

// 填充答案信息
function fillAnswers(type, question, questionIndex, mainIndex, paperData, answerInfos) {
  const masterData = {
    staticIndex: {
      mainIndex: Number(mainIndex) + 1,
      questionIndex,
    }
  }
  const score = calculatScore(masterData.staticIndex, paperData);

  // 将学生答案拼接到试卷里-筛选小题id
  const subIndex = [];
  const questionIndexData = getQuestionIndexData(type, question, questionIndex);
  let { patternType } = questionIndexData;
  let data = question;
  if (type === "COMPLEX") {
    patternType = question.data.groups[questionIndex].data.patternType;
    data = question.data.groups[questionIndex];
  }
  if (patternType === "TWO_LEVEL") {
    questionIndexData.subQuestion.map((subQes, index) => {
      if (getAnswer(subQes, subQes.id, answerInfos)) {
        subIndex.push(index);
      }
    })
  } else if (patternType === "NORMAL") {
    if (getAnswer(questionIndexData.mainQuestion, data.id, answerInfos)) {
      subIndex.push(0);
    }
  }

  if (subIndex.length > 0) {
    // this.numberSub = subIndex.length;
    subIndex.map((item) => {
      const res = scoringMachine(masterData, questionIndexData, score, question, undefined, undefined, item);
    })
  }
}

/**
 * 格式化整卷试做报告
 * 将答题详情装入试卷快照，用于渲染 《整卷试做报告》
 * TODO 暂时用于 课后训练->检查->查阅
 * @param {object} paperData - 试卷快照
 * @param {object} answerInfos - 答题详情
 */
export default (paperData, answerInfos) => {
  paperData.paperInstance.forEach((ins, insIdx) => {
    if (!ins.type || (ins.type && ins.type === 'PATTERN')) {
      const type = ins.pattern.questionPatternType;
      if (type !== 'COMPLEX') {
        ins.questions.forEach((qes, qesIdx) => {
          if (qes) {
            fillAnswers(type, qes, qesIdx, insIdx, paperData, answerInfos);
          }
        });
      } else {
        ins.pattern.groups.forEach((grp, grpIdx) => {
          const insQuestion = ins.questions[0];
          if (insQuestion) {
            fillAnswers(type, insQuestion, grpIdx, insIdx, paperData, answerInfos);
          }
        });
      }
    }
  });
}
