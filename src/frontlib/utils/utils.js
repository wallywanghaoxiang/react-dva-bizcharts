/* eslint-disable no-bitwise */
/* eslint-disable no-unused-expressions */
/* eslint-disable prefer-const */
/* eslint-disable no-empty */
/* eslint-disable array-callback-return */
/* eslint-disable camelcase */
/* eslint-disable no-lonely-if */
/* eslint-disable no-useless-concat */
/* eslint-disable no-shadow */
/* eslint-disable no-nested-ternary */
/* eslint-disable radix */
/* eslint-disable no-plusplus */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
/* eslint-disable no-param-reassign */
/* eslint-disable no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable default-case */
/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
/* eslint-disable no-lone-blocks */
/* eslint-disable eqeqeq */
/* eslint-disable prefer-destructuring */
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import { curry } from '../../../node_modules/lodash-decorators';

// 题型默认宽度，高度
const PICTUREWIDTH = 440;
const VEDIOWIDTH = 440;
const CHOICEPICTUREWIDTH = 130;
const CHOICEPICTUREHEIGHT = 90;
const QUESTIONPATTERN_VERSION = 1000100; // 基础元数据版本
const PAPERTEMPLATE_VERSION = 1000201; // 试卷结构数据版本
const QUESTION_VERSION = 1000201; // 题目版本
const PAPER_VERSION = 1000201; // 试卷版本
const ANSWESHEET_VERSION = 1000300; // 答题答卷版本
const QUESTION_SHOW_RICHTEXT = 'N'; // 富文本前端配置项

export {
  QUESTION_SHOW_RICHTEXT,
  PICTUREWIDTH,
  VEDIOWIDTH,
  CHOICEPICTUREWIDTH,
  CHOICEPICTUREHEIGHT,
  QUESTIONPATTERN_VERSION,
  PAPERTEMPLATE_VERSION,
  QUESTION_VERSION,
  PAPER_VERSION,
  ANSWESHEET_VERSION,
};

const { vb } = window;

/**
 * @Author    tina.zhang
 * @DateTime  2018-10-23
 * @copyright 评分规则
 * @param     {[type]}    staticIndex 题序
 * @param     {[type]}    data        题目数据
 * @param     {[type]}    answerData  用户答题数据
 * @param     {[type]}    points      每小题分数
 *
 * @param     {[type]}    type        特殊处理，只有在题目详情页使用，为了绕过原数据不能修改两次的神秘特性
 * @return    {[type]}                答题数据
 */
export function scoringMachine(
  masterData,
  data,
  points,
  questionData,
  preStaticIndex = undefined,
  type = undefined,
  subIndex = undefined
) {
  // console.log("================copy===================");
  // console.log("masterData",masterData);
  // console.log("data",data);
  // console.log(points);
  // console.log(questionData);
  // console.log("subIndex",subIndex)
  let staticIndex = masterData.staticIndex;
  const newData = JSON.parse(JSON.stringify(masterData));
  if (preStaticIndex != undefined) {
    // 动态跳转语音评分处理
    staticIndex = preStaticIndex;
    newData.staticIndex = preStaticIndex;
    console.log('staticIndex', preStaticIndex);
  }
  let markRatios = 1;
  let sequenceNumber = []; // 小题序号
  if (subIndex == undefined) {
    // 非线上平台报告页部分
    markRatios =
      masterData.mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].markRatio;
    sequenceNumber =
      masterData.mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].subs;
  }

  const patternType = questionData && questionData.data && questionData.data.patternType;

  const questionAnswers = {
    answers: {
      dataVersion: ANSWESHEET_VERSION,
      id: questionData && questionData.id,
      questionCode: questionData && questionData.code,
      questionPatternType: questionData && questionData.data && questionData.data.patternType,
      questionPatternId: questionData && questionData.questionPatternId,
      mainOrderIndex: staticIndex.mainIndex - 1,
      rawOrderIndex: staticIndex.questionIndex,
      subjectiveAndObjective:
        questionData && questionData.data && questionData.data.subjectiveAndObjective,
      markRatio: markRatios,
      precision: 0.5 / Number(markRatios),
      answer: {
        mainQuestionAnswer: {}, // 主题干答案，针对普通题型
        subQuestionAnswers: [],
        groups: [
          // 子题型实例
          { answer: {} },
          { answer: {} },
        ],
      },
    },
  };
  let questionIndex = '';
  let subItemIndex = '';
  let answerType = '';
  let ItemData = '';
  let res = '';

  switch (patternType) {
    case 'NORMAL':
      answerType = data.mainQuestion.answerType; // CHOICE,GAP_FILLING,CLOSED_ORAL,OPEN_ORAL,HALF_OPEN_ORAL
      ItemData = data.mainQuestion;

      res = compareAnswer(sequenceNumber, points, answerType, ItemData, data, patternType);

      if (answerType == 'CLOSED_ORAL') {
        questionAnswers.answers.answer.mainQuestionAnswer = res.obj;
        data.receivePoints = res.score;
        data.totalPoints = points;
        data.mainQuestion.receivePoints = res.score;
        data.mainQuestion.totalPoints = points;
      } else if (answerType == 'OPEN_ORAL') {
        questionAnswers.answers.answer.mainQuestionAnswer = res.obj;
        data.receivePoints = res.score;
        data.totalPoints = points;
        data.mainQuestion.receivePoints = res.score;
        data.mainQuestion.totalPoints = points;
      } else if (answerType == 'HALF_OPEN_ORAL') {
        questionAnswers.answers.answer.mainQuestionAnswer = res.obj;
        data.receivePoints = res.score;
        data.totalPoints = points;
        data.mainQuestion.receivePoints = res.score;
        data.mainQuestion.totalPoints = points;
      } else {
        questionAnswers.answers.answer.mainQuestionAnswer = res.obj;
        questionAnswers.rightArr = res.rightArr;
        questionAnswers.rightNumber = res.rightNumber;
        questionAnswers.receivePoints = res.rightNumber * points;
        data.receivePoints = res.rightNumber * points;
        data.totalPoints = points;
      }
      if (type) {
        return data;
      }
      return questionAnswers;

    case 'TWO_LEVEL':
      questionIndex = staticIndex.questionIndex;
      answerType = data.mainQuestion.answerType;
      ItemData = data.subQuestion;

      if (ItemData.length == 0) {
        return;
      }
      if (subIndex != undefined) {
        subItemIndex = subIndex;
      } else {
        subItemIndex = returnSubIndex(newData);
      }
      res = compareAnswer(
        sequenceNumber,
        points,
        answerType,
        ItemData,
        data,
        patternType,
        subItemIndex
      );

      if (answerType == 'CLOSED_ORAL') {
        questionAnswers.answers.answer.subQuestionAnswers = res.obj;
        data.receivePoints = res.score;
        data.totalPoints = points * ItemData.length;
        data.subQuestion[subItemIndex].receivePoints =
          (ItemData[subItemIndex].answerValue &&
            ItemData[subItemIndex].answerValue.result &&
            ItemData[subItemIndex].answerValue.result.overall) ||
          0;
        data.subQuestion[subItemIndex].totalPoints = points;
      } else if (answerType == 'OPEN_ORAL') {
        questionAnswers.answers.answer.subQuestionAnswers = res.obj;
        data.receivePoints = res.score;
        data.totalPoints = points * ItemData.length;
        data.subQuestion[subItemIndex].receivePoints =
          (ItemData[subItemIndex].answerValue &&
            ItemData[subItemIndex].answerValue.result &&
            ItemData[subItemIndex].answerValue.result.overall) ||
          0;
        data.subQuestion[subItemIndex].totalPoints = points;
      } else if (answerType == 'HALF_OPEN_ORAL') {
        questionAnswers.answers.answer.subQuestionAnswers = res.obj;
        data.receivePoints = res.score;
        data.totalPoints = points * ItemData.length;

        data.subQuestion[subItemIndex].receivePoints =
          (ItemData[subItemIndex].answerValue &&
            ItemData[subItemIndex].answerValue.result &&
            ItemData[subItemIndex].answerValue.result.overall) ||
          0;
        data.subQuestion[subItemIndex].totalPoints = points;
      } else {
        questionAnswers.answers.answer.subQuestionAnswers = res.obj;
        questionAnswers.rightArr = res.rightArr;
        questionAnswers.rightNumber = res.rightNumber;
        questionAnswers.receivePoints = res.rightNumber * points;
        data.receivePoints = res.rightNumber * points;
        data.totalPoints = points * ItemData.length;
        if (data.subQuestion[subItemIndex]) {
          if (res.rightArr[subItemIndex]) {
            data.subQuestion[subItemIndex].receivePoints = points;
          } else {
            data.subQuestion[subItemIndex].receivePoints = 0;
          }

          data.subQuestion[subItemIndex].totalPoints = points;
        }
      }

      if (type) {
        return data;
      }
      return questionAnswers;

    case 'COMPLEX':
      questionIndex = staticIndex.questionIndex;
      const complexType = data.patternType;
      questionAnswers.answers.answer.groups[questionIndex] = { answer: {} };
      questionAnswers.answers.answer.groups[questionIndex].id =
        (questionData && questionData.data.groups && questionData.data.groups[questionIndex].id) ||
        '';
      questionAnswers.answers.answer.groups[questionIndex].subjectiveAndObjective =
        (questionData &&
          questionData.data.groups &&
          questionData.data.groups[questionIndex].data.subjectiveAndObjective) ||
        '';
      questionAnswers.answers.answer.groups[questionIndex].markRatio = markRatios || '1';
      questionAnswers.answers.answer.groups[questionIndex].precision = 0.5 / Number(markRatios);
      questionAnswers.answers.answer.groups[questionIndex].questionPatternType = complexType;
      if (complexType == 'NORMAL') {
        answerType = data.mainQuestion.answerType; // CHOICE,GAP_FILLING,CLOSED_ORAL,OPEN_ORAL,HALF_OPEN_ORAL
        ItemData = data.mainQuestion;
        res = compareAnswer(sequenceNumber, points, answerType, ItemData, data, complexType);
        if (answerType == 'CLOSED_ORAL') {
          questionAnswers.answers.answer.groups[questionIndex].answer.mainQuestionAnswer = res.obj;

          data.receivePoints = res.score;
          data.totalPoints = points;
          data.mainQuestion.receivePoints = res.score;
          data.mainQuestion.totalPoints = points;
        } else if (answerType == 'OPEN_ORAL') {
          questionAnswers.answers.answer.groups[questionIndex].answer.mainQuestionAnswer = res.obj;
          data.receivePoints = res.score;
          data.totalPoints = points;
          data.mainQuestion.receivePoints = res.score;
          data.mainQuestion.totalPoints = points;
        } else if (answerType == 'HALF_OPEN_ORAL') {
          questionAnswers.answers.answer.groups[questionIndex].answer.mainQuestionAnswer = res.obj;
          data.receivePoints = res.score;
          data.totalPoints = points;
          data.mainQuestion.receivePoints = res.score;
          data.mainQuestion.totalPoints = points;
        } else {
          questionAnswers.answers.answer.groups[questionIndex].answer.mainQuestionAnswer = res.obj;
          questionAnswers.rightArr = res.rightArr;
          questionAnswers.rightNumber = res.rightNumber;
          questionAnswers.receivePoints = res.rightNumber * points;
          data.receivePoints = res.rightNumber * points;
          data.totalPoints = points;
        }
        if (type) {
          return data;
        }
        return questionAnswers;
      }
      if (complexType == 'TWO_LEVEL') {
        questionIndex = staticIndex.questionIndex;
        answerType = data.subQuestion[0].answerType;
        ItemData = data.subQuestion;
        if (subIndex != undefined) {
          subItemIndex = subIndex;
        } else {
          subItemIndex = returnSubIndex(newData);
        }

        res = compareAnswer(
          sequenceNumber,
          points,
          answerType,
          ItemData,
          data,
          complexType,
          subItemIndex
        );
        questionAnswers.answers.answer.groups[questionIndex] = {
          id: questionData.data.groups[questionIndex].id,
          subjectiveAndObjective:
            questionData.data.groups[questionIndex].data.subjectiveAndObjective,
          markRatio: markRatios || '1',
          questionPatternType: complexType,
          precision: 0.5 / Number(markRatios),
          answer: {},
        };
        if (answerType == 'CLOSED_ORAL') {
          questionAnswers.answers.answer.groups[questionIndex].answer.subQuestionAnswers = res.obj;

          data.receivePoints = res.score;
          data.totalPoints = points * ItemData.length;
          data.subQuestion[subItemIndex].receivePoints =
            (ItemData[subItemIndex].answerValue &&
              ItemData[subItemIndex].answerValue.result &&
              ItemData[subItemIndex].answerValue.result.overall) ||
            0;
          data.subQuestion[subItemIndex].totalPoints = points;
        } else if (answerType == 'OPEN_ORAL') {
          questionAnswers.answers.answer.groups[questionIndex].answer.subQuestionAnswers = res.obj;
          data.receivePoints = res.score;
          data.totalPoints = points * ItemData.length;
          data.subQuestion[subItemIndex].receivePoints =
            (ItemData[subItemIndex].answerValue &&
              ItemData[subItemIndex].answerValue.result &&
              ItemData[subItemIndex].answerValue.result.overall) ||
            0;
          data.subQuestion[subItemIndex].totalPoints = points;
        } else if (answerType == 'HALF_OPEN_ORAL') {
          questionAnswers.answers.answer.groups[questionIndex].answer.subQuestionAnswers = res.obj;
          data.receivePoints = res.score;
          data.totalPoints = points * ItemData.length;

          data.subQuestion[subItemIndex].receivePoints =
            (ItemData[subItemIndex].answerValue &&
              ItemData[subItemIndex].answerValue.result &&
              ItemData[subItemIndex].answerValue.result.overall) ||
            0;
          data.subQuestion[subItemIndex].totalPoints = points;
        } else {
          questionAnswers.answers.answer.groups[questionIndex].answer.subQuestionAnswers = res.obj;
          questionAnswers.rightArr = res.rightArr;
          questionAnswers.rightNumber = res.rightNumber;
          questionAnswers.receivePoints = res.rightNumber * points;
          data.receivePoints = res.rightNumber * points;
          data.totalPoints = points * ItemData.length;
        }
        if (type) {
          return data;
        }
        return questionAnswers;
      }
  }
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-11-02
 * @copyright 返回小题序号
 * @return    {[type]}    [description]
 */
export function returnSubIndex(masterData, questionIndex = undefined, index = undefined) {
  const staticIndex = masterData.staticIndex;

  const mainData = masterData.mains;
  let subs = mainData[staticIndex.mainIndex].questions[staticIndex.questionIndex].subs;
  if (questionIndex != undefined) {
    subs = mainData[staticIndex.mainIndex].questions[questionIndex].subs;
    return subs[index];
  }
  for (const i in subs) {
    if (Number(subs[i]) == Number(staticIndex.subIndex)) {
      return i;
    }
  }
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-11-02
 * @copyright 返回二层小题序号
 * @return    {[type]}    [description]
 */
export function returnSubs(masterData) {
  const staticIndex = masterData.staticIndex;
  const mainData = masterData.mains;
  const subs = mainData[staticIndex.mainIndex].questions[staticIndex.questionIndex].subs;
  return subs;
}
/**
 * @Author    tina.zhang
 * @DateTime  2018-10-23
 * @copyright 答案对比
 * @param     {[type]}    answerType 答题类型
 * @param     {[type]}    ItemData   题目答案
 * @param     {[type]}    answerData 用户答案
 * @return    {[type]}               [description]
 */
function compareAnswer(
  sequenceNumber,
  points,
  answerType,
  data,
  questionData,
  type,
  subItemIndex = 0
) {
  // CHOICE,GAP_FILLING,CLOSED_ORAL,OPEN_ORAL,HALF_OPEN_ORAL
  // console.log(subItemIndex);
  let userOptions = [];

  let rightArr = [false];
  let rightNumber = 0;

  const userAnswers = [];
  let questionAnswer = {};
  let totalScore = 0;
  const optKeys = ['A', 'B', 'C', 'D'];

  switch (answerType) {
    // 选择
    case 'CHOICE':
      userOptions = data;
      questionAnswer = [];
      if (type != 'TWO_LEVEL') {
        const ItemData = userOptions.choiceQuestionAnswerInfo.options;
        questionAnswer = {};
        questionAnswer.answerType = answerType;
        questionAnswer.answerOptionId = userOptions.answerId;
        questionAnswer.mark = points;
        questionAnswer.answerOptionOrder = userOptions.choiceQuestionAnswerInfo.order;
        questionAnswer.manualScore = '';
        userOptions.isRight = false;
        userOptions.receivePoints = 0;
        rightArr = false;
        for (const j in ItemData) {
          if (ItemData[j].id === userOptions.answerId) {
            questionAnswer.answerOptionIndex = optKeys[j];
            if (ItemData[j].isAnswer == 'Y') {
              userOptions.isRight = true;
              userOptions.receivePoints = points; // 选择题得分
              rightArr = true;
              rightNumber += 1;
            }
          }
        }
        questionAnswer.sequenceNumber = sequenceNumber[0];
        questionAnswer.score = rightNumber * points;
      } else {
        questionAnswer = [];
        for (const i in userOptions) {
          const ItemData = userOptions[i].choiceQuestionAnswerInfo.options;
          questionAnswer[i] = {};
          questionAnswer[i].sequenceNumber = sequenceNumber[i];
          questionAnswer[i].answerType = answerType;
          questionAnswer[i].answerOptionId = userOptions[i].answerId;
          questionAnswer[i].mark = points;
          questionAnswer[i].answerOptionOrder = userOptions[i].choiceQuestionAnswerInfo.order;
          questionAnswer[i].manualScore = '';
          questionAnswer[i].id = userOptions[i].id || '';
          userOptions[i].isRight = false;
          userOptions[i].receivePoints = 0;
          rightArr[i] = false;
          questionAnswer[i].score = 0;
          for (const j in ItemData) {
            if (ItemData[j].id == userOptions[i].answerId) {
              questionAnswer[i].answerOptionIndex = optKeys[j];
              if (ItemData[j].isAnswer === 'Y') {
                userOptions[i].isRight = true;
                userOptions[i].receivePoints = points; // 选择题得分
                rightArr[i] = true;
                questionAnswer[i].score = 1 * points;
                rightNumber += 1;
              }
            }
          }
        }
      }
      return {
        rightArr,
        obj: questionAnswer,
        rightNumber,
      };
    // 填空
    case 'GAP_FILLING':
      const typeLowerCase = false;
      questionAnswer = [];

      if (type == 'NORMAL') {
        questionAnswer = {};
        questionAnswer.sequenceNumber = sequenceNumber[0];
        questionAnswer.answerType = answerType;
        questionAnswer.answerText = data.answerValue;
        questionAnswer.mark = points;
        questionAnswer.score = 0;
        questionAnswer.manualScore = '';
        for (const a in data.gapFillingQuestionAnswerInfo.answers) {
          if (
            fillingClear(data.gapFillingQuestionAnswerInfo.answers[a].text, typeLowerCase) ==
            fillingClear(data.answerValue, typeLowerCase)
          ) {
            rightArr = true;
            data.isRight = true;
            data.receivePoints = points;
            questionAnswer.score = points;
            rightNumber += 1;
            break;
          } else {
            rightArr = false;
            data.isRight = false;
            data.receivePoints = 0;
          }
        }
      } else {
        for (const m in data) {
          questionAnswer[m] = {};
          questionAnswer[m].sequenceNumber = sequenceNumber[m];
          questionAnswer[m].answerType = answerType;
          questionAnswer[m].answerText = data[m].answerValue;
          questionAnswer[m].mark = points;
          questionAnswer[m].score = 0;
          questionAnswer[m].manualScore = '';
          questionAnswer[m].id = data[m].id;
          for (const a in data[m].gapFillingQuestionAnswerInfo.answers) {
            if (
              fillingClear(data[m].gapFillingQuestionAnswerInfo.answers[a].text, typeLowerCase) ==
              fillingClear(data[m].answerValue, typeLowerCase)
            ) {
              rightArr[m] = true;
              data[m].isRight = true;
              data[m].receivePoints = points;
              questionAnswer[m].score = points;
              rightNumber += 1;
              break;
            } else {
              rightArr[m] = false;
              data[m].isRight = false;
              data[m].receivePoints = 0;
            }
          }
        }
      }

      return {
        rightArr,
        obj: questionAnswer,
        rightNumber,
      };

    // 口语封闭
    case 'CLOSED_ORAL':
      if (type != 'TWO_LEVEL') {
        questionAnswer.answerType = answerType;
        questionAnswer.sequenceNumber = sequenceNumber[0];
        questionAnswer.evaluationEngine = data.evaluationEngineInfo;
        questionAnswer.mark = points;
        questionAnswer.score =
          data.answerValue && data.answerValue.result && data.answerValue.result.overall;
        questionAnswer.manualScore = '';
        questionAnswer.engineResult = data.answerValue;
        questionAnswer.engineRequest = data.answerValue;
        questionAnswer.markInfo = '';
        questionAnswer.answerAudioId = data.answerValue && data.answerValue.tokenId;

        return {
          score:
            (data &&
              data.answerValue &&
              data.answerValue.result &&
              data.answerValue.result.overall) ||
            0,
          obj: questionAnswer,
        };
      }
      questionAnswer = [];

      for (const k in data) {
        questionAnswer[k] = {};
        questionAnswer[k].answerType = answerType;
        questionAnswer[k].sequenceNumber = sequenceNumber[k];
        questionAnswer[k].answerAudioId = data[k].answerValue && data[k].answerValue.tokenId;
        questionAnswer[k].evaluationEngine = data[k].evaluationEngineInfo;
        questionAnswer[k].engineRequest = data[k].answerValue;
        questionAnswer[k].engineResult = data[k].answerValue;
        questionAnswer[k].mark = points;
        questionAnswer[k].score =
          data[k].answerValue && data[k].answerValue.result && data[k].answerValue.result.overall;
        questionAnswer[k].manualScore = '';
        questionAnswer[k].id = data[k].id;
        if (
          data[k].answerValue &&
          data[k].answerValue.result &&
          data[k].answerValue.result.overall
        ) {
          totalScore += Number(
            data[k].answerValue && data[k].answerValue.result && data[k].answerValue.result.overall
          );
        }
      }

      return {
        score: totalScore,
        obj: questionAnswer,
      };

    // 口语开放
    case 'OPEN_ORAL':
      if (type != 'TWO_LEVEL') {
        questionAnswer.answerType = answerType;
        questionAnswer.sequenceNumber = sequenceNumber[0];
        questionAnswer.answerAudioId = data.answerValue && data.answerValue.tokenId;
        questionAnswer.evaluationEngine = data.evaluationEngineInfo;
        questionAnswer.mark = points;
        questionAnswer.score =
          data.answerValue && data.answerValue.result && data.answerValue.result.overall;
        questionAnswer.manualScore = '';
        questionAnswer.engineResult = data.answerValue;
        questionAnswer.engineRequest = data.answerValue;
        return {
          score:
            (data &&
              data.answerValue &&
              data.answerValue.result &&
              data.answerValue.result.overall) ||
            0,
          obj: questionAnswer,
        };
      }
      questionAnswer = [];
      for (const l in data) {
        questionAnswer[l] = {};
        questionAnswer[l].answerType = answerType;
        questionAnswer[l].sequenceNumber = sequenceNumber[l];
        questionAnswer[l].answerAudioId = data[l].answerValue && data[l].answerValue.tokenId;
        questionAnswer[l].evaluationEngine = data[l].evaluationEngineInfo;
        questionAnswer[l].engineRequest = data[l].answerValue;
        questionAnswer[l].engineResult = data[l].answerValue;
        questionAnswer[l].mark = points;
        questionAnswer[l].score =
          data[l].answerValue && data[l].answerValue.result && data[l].answerValue.result.overall;
        questionAnswer[l].manualScore = '';
        questionAnswer[l].id = data[l].id;
        if (
          data[l].answerValue &&
          data[l].answerValue.result &&
          data[l].answerValue.result.overall
        ) {
          totalScore += Number(
            data[l].answerValue && data[l].answerValue.result && data[l].answerValue.result.overall
          );
        }
      }
      return {
        score: totalScore,
        obj: questionAnswer,
      };

    // 口语半开放
    case 'HALF_OPEN_ORAL':
      if (type != 'TWO_LEVEL') {
        questionAnswer.answerType = answerType;
        questionAnswer.sequenceNumber = sequenceNumber[0];
        questionAnswer.answerAudioId = data.answerValue && data.answerValue.tokenId;
        questionAnswer.evaluationEngine = data.evaluationEngineInfo;
        questionAnswer.mark = points;
        questionAnswer.score =
          data.answerValue && data.answerValue.result && data.answerValue.result.overall;
        questionAnswer.manualScore = '';
        questionAnswer.engineResult = data.answerValue;
        questionAnswer.engineRequest = data.answerValue;
        return {
          score:
            (data &&
              data.answerValue &&
              data.answerValue.result &&
              data.answerValue.result.overall) ||
            0,
          obj: questionAnswer,
        };
      }
      questionAnswer = [];
      for (const j in data) {
        questionAnswer[j] = {};
        questionAnswer[j].answerType = answerType;
        questionAnswer[j].sequenceNumber = sequenceNumber[j];
        questionAnswer[j].answerAudioId = data[j].answerValue && data[j].answerValue.tokenId;
        questionAnswer[j].evaluationEngine = data[j].evaluationEngineInfo;
        questionAnswer[j].engineRequest = data[j].answerValue;
        questionAnswer[j].engineResult = data[j].answerValue;
        questionAnswer[j].mark = points;
        questionAnswer[j].score =
          data[j].answerValue && data[j].answerValue.result && data[j].answerValue.result.overall;
        questionAnswer[j].manualScore = '';
        questionAnswer[j].id = data[j].id;
        if (
          data[j].answerValue &&
          data[j].answerValue.result &&
          data[j].answerValue.result.overall
        ) {
          totalScore += Number(
            data[j].answerValue && data[j].answerValue.result && data[j].answerValue.result.overall
          );
        }
      }
      return {
        score: totalScore,
        obj: questionAnswer,
      };
  }
}

/**
 * 有限分支评分
 * @Author   tina.zhang
 * @DateTime 2019-01-21T10:30:23+0800
 * @param    {[type]}                 answersData [description]
 * @return   {[type]}                             [description]
 */
export function sentRecScore(
  res,
  referenceMachineEvaluation,
  hintReferenceMachineEvaluation,
  errorReferenceMachineEvaluation
) {
  let overall = 0;
  if ((res.result && Number(res.result.conf)) > 70) {
    let referenceMachineFlag = false;
    let hintreferenceMachineFlag = false;
    let errorreferenceMachineFlag = false;
    referenceMachineFlag = referenceMachineEvaluation.some(e => {
      return e.trim().toLocaleLowerCase() == res.result.rec.trim().toLocaleLowerCase();
    });
    hintreferenceMachineFlag = hintReferenceMachineEvaluation.some(e => {
      return e.trim().toLocaleLowerCase() == res.result.rec.trim().toLocaleLowerCase();
    });
    errorreferenceMachineFlag = errorReferenceMachineEvaluation.some(e => {
      return e.trim().toLocaleLowerCase() == res.result.rec.trim().toLocaleLowerCase();
    });
    if (referenceMachineFlag) {
      overall = 100;
    } else if (hintreferenceMachineFlag) {
      overall = 50;
    } else {
      overall = 0;
    }
  }

  return overall;
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-10-23
 * @copyright 计算小题分数
 * @param     {[type]}    staticIndex 题序
 * @param     {[type]}    paperData   [description]
 * @return    {[type]}                分数
 */
export function calculatScore(staticIndex, paperData) {
  // console.log(paperData)
  // console.log(staticIndex)

  const paperInstance = paperData.paperInstance;
  const ItemData = paperInstance[staticIndex.mainIndex - 1];
  const patternType = ItemData.pattern.questionPatternType;
  switch (patternType) {
    case 'NORMAL':
      if (
        ItemData.pattern.subQuestionPatterns &&
        ItemData.pattern.subQuestionPatterns[staticIndex.questionIndex] &&
        ItemData.pattern.subQuestionPatterns[staticIndex.questionIndex].questionMark &&
        ItemData.pattern.subQuestionPatterns[staticIndex.questionIndex].questionMark != 0
      ) {
        return ItemData.pattern.subQuestionPatterns[staticIndex.questionIndex].questionMark;
      }
      return ItemData.pattern.mainPatterns.questionMark;

    case 'TWO_LEVEL':
      if (ItemData.pattern.subQuestionPatterns[staticIndex.questionIndex].subQuestionMark != 0) {
        return ItemData.pattern.subQuestionPatterns[staticIndex.questionIndex].subQuestionMark;
      }
      return ItemData.pattern.mainPatterns.subQuestionMark;

    case 'COMPLEX':
      const groupsItem = ItemData.pattern.groups[staticIndex.questionIndex].pattern;
      if (groupsItem.questionPatternType == 'NORMAL') {
        return groupsItem.mainPatterns.questionMark;
      }
      if (groupsItem.questionPatternType == 'TWO_LEVEL') {
        return groupsItem.mainPatterns.subQuestionMark;
      }
  }
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-10-23
 * @copyright 计算答卷总分
 * @param     {[type]}    staticIndex 题序
 * @param     {[type]}    paperData   [description]
 * @return    {[type]}                分数
 */
export function calculatTotalScore(answersData) {
  let total = 0;

  for (const i in answersData) {
    if (answersData[i]) {
      for (const j in answersData[i].answers) {
        const patternType = answersData[i].answers[j].questionPatternType;

        switch (patternType) {
          case 'NORMAL':
            if (answersData[i].answers[j].answer.mainQuestionAnswer.score) {
              total += Number(answersData[i].answers[j].answer.mainQuestionAnswer.score);
            }
            break;
          case 'TWO_LEVEL':
            for (const m in answersData[i].answers[j].answer.subQuestionAnswers) {
              if (
                answersData[i].answers[j].answer.subQuestionAnswers[m] &&
                answersData[i].answers[j].answer.subQuestionAnswers[m].score
              ) {
                total += Number(answersData[i].answers[j].answer.subQuestionAnswers[m].score);
              }
            }
            break;
          case 'COMPLEX':
            const groupsData = answersData[i].answers[0].answer.groups;
            for (const n in groupsData) {
              if (groupsData[n].answer) {
                if (groupsData[n].questionPatternType == 'NORMAL') {
                  if (groupsData[n].answer.mainQuestionAnswer.score) {
                    total += Number(groupsData[n].answer.mainQuestionAnswer.score);
                  }
                } else {
                  for (const m in groupsData[n].answer.subQuestionAnswers) {
                    if (groupsData[n].answer.subQuestionAnswers[m].score) {
                      total += Number(groupsData[n].answer.subQuestionAnswers[m].score);
                    }
                  }
                }
              }
            }
            break;
        }
      }
    }
  }

  return total;
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-10-23
 * @copyright 生成音频List
 * @param     {[type]}    staticIndex 题序
 * @param     {[type]}    paperData   [description]
 * @return    {[type]}                分数
 */
export function GenerateAudioList(answersData) {
  const audioList = [];

  for (const i in answersData) {
    if (answersData[i]) {
      for (const j in answersData[i].answers) {
        const patternType = answersData[i].answers[j].questionPatternType;

        switch (patternType) {
          case 'NORMAL':
            if (answersData[i].answers[j].answer.mainQuestionAnswer) {
              if (
                answersData[i].answers[j].answer.mainQuestionAnswer.answerType != 'CHOICE' &&
                answersData[i].answers[j].answer.mainQuestionAnswer.answerType != 'GAP_FILLING'
              ) {
                if (answersData[i].answers[j].answer.mainQuestionAnswer.answerAudioId) {
                  audioList.push(answersData[i].answers[j].answer.mainQuestionAnswer.answerAudioId);
                }
              }
            }
            break;
          case 'TWO_LEVEL':
            for (const m in answersData[i].answers[j].answer.subQuestionAnswers) {
              if (answersData[i].answers[j].answer.subQuestionAnswers[m]) {
                if (
                  answersData[i].answers[j].answer.subQuestionAnswers[m].answerType != 'CHOICE' &&
                  answersData[i].answers[j].answer.subQuestionAnswers[m].answerType != 'GAP_FILLING'
                ) {
                  if (answersData[i].answers[j].answer.subQuestionAnswers[m].answerAudioId) {
                    audioList.push(
                      answersData[i].answers[j].answer.subQuestionAnswers[m].answerAudioId
                    );
                  }
                }
              }
            }
            break;
          case 'COMPLEX':
            const groupsData = answersData[i].answers[0].answer.groups;
            for (const n in groupsData) {
              if (groupsData[n].answer) {
                if (groupsData[n].questionPatternType == 'NORMAL') {
                  if (groupsData[n].answer.mainQuestionAnswer) {
                    if (
                      groupsData[n].answer.mainQuestionAnswer.answerType != 'CHOICE' &&
                      groupsData[n].answer.mainQuestionAnswer.answerType != 'GAP_FILLING'
                    ) {
                      if (groupsData[n].answer.mainQuestionAnswer.answerAudioId) {
                        audioList.push(groupsData[n].answer.mainQuestionAnswer.answerAudioId);
                      }
                    }
                  }
                } else {
                  for (const m in groupsData[n].answer.subQuestionAnswers) {
                    if (groupsData[n].answer.subQuestionAnswers[m]) {
                      if (
                        groupsData[n].answer.subQuestionAnswers[m].answerType != 'CHOICE' &&
                        groupsData[n].answer.subQuestionAnswers[m].answerType != 'GAP_FILLING'
                      ) {
                        if (groupsData[n].answer.subQuestionAnswers[m].answerAudioId) {
                          audioList.push(groupsData[n].answer.subQuestionAnswers[m].answerAudioId);
                        }
                      }
                    }
                  }
                }
              }
            }
            break;
        }
      }
    }
  }

  return audioList;
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-10-26
 * @copyright 数字转化为对应的字母
 * @param     {[type]}    num [description]
 * @return    {[type]}        [description]
 */
export function fromCharCode(num) {
  const alphabet = String.fromCharCode(64 + parseInt(num));
  return alphabet;
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-10-26
 * @copyright 阿拉伯数字转化为中文数字
 * @param     {[type]}    num [description]
 * @return    {[type]}        [description]
 */
export function toChinesNum(num) {
  const changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; // changeNum[0] = "零"
  const unit = ['', '十', '百', '千', '万'];
  num = parseInt(num);
  const getWan = temp => {
    const strArr = temp
      .toString()
      .split('')
      .reverse();
    let newNum = '';
    for (let i = 0; i < strArr.length; i++) {
      newNum =
        (i == 0 && strArr[i] == 0
          ? ''
          : i > 0 && strArr[i] == 0 && strArr[i - 1] == 0
          ? ''
          : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i])) + newNum;
    }
    return newNum;
  };
  const overWan = Math.floor(num / 10000);
  let noWan = num % 10000;
  if (noWan.toString().length < 4) noWan = `0${noWan}`;
  return overWan ? `${getWan(overWan)}万${getWan(noWan)}` : getWan(num);
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-10-26
 * @copyright 判空处理
 * @param     {[type]}    str [description]
 * @return    {[type]}        [description]
 */
export function IsEmpty(str) {
  if (str == '' || str == null || typeof str == 'undefined') {
    return true;
  }
  return false;
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-10-26
 * @copyright 不能含有汉字！
 * @param     {[type]}    str [description]
 * @return    {[type]}        [description]
 */
export function funcChina(str) {
  if (/.*[\u4e00-\u9fa5]+.*$/.test(str)) {
    // alert("不能含有汉字！");
    return false;
  }
  return true;
}
// 阿拉伯数字转中文
export function SectionToChinese(section) {
  const chnNumChar = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  const chnUnitChar = ['', '十', '百', '千'];
  let strIns = '';
  let chnStr = '';
  let unitPos = 0;
  let zero = true;
  while (section > 0) {
    const v = section % 10;
    if (v === 0) {
      if (!zero) {
        zero = true;
        chnStr = chnNumChar[v] + chnStr;
      }
    } else {
      zero = false;
      strIns = chnNumChar[v];
      strIns += chnUnitChar[unitPos];
      chnStr = strIns + chnStr;
    }
    unitPos++;
    section = Math.floor(section / 10);
  }
  return chnStr;
}
/**
 * 播放提示音频
 * @author tina.zhang
 * @DateTime 2018-12-13T15:31:40+0800
 * @param    {[type]}                 options.Type    [description]
 * @param    {[type]}                 options.success [description]
 * @param    {[type]}                 options.error   [description]
 * @return   {[type]}                                 [description]
 */
export function playResource({ type, success = undefined, error = undefined }) {
  // console.log("播放", type);
  const vb = window.vb;

  vb.getPlayerManager().onStop(function(data) {
    // console.log(data)
    if (success) {
      success(data);
    }
  });

  vb.getPlayerManager().onError(function(res) {
    console.error(res);
    if (error) {
      error(res);
    }
  });

  vb.getPlayerManager().play({
    resourceType: type,
  });
}

export function stopplay({ success = undefined }) {
  const vb = window.vb;
  vb.getPlayerManager().stop();
  vb.getPlayerManager().onStop(function(data) {
    // console.log(data)
    if (success) {
      success(data);
    }
  });
}

/**
 *  题目标题后文本自动生成
 *
 * @author tina.zhang
 * @date 2019-01-08
 * @export
 * @param {*} data          题型数据
 * @param {*} isComplex     是否是复合题型
 * @returns
 */
export function autoCreatePatternInfoText(data, isComplex) {
  switch (data.pattern.questionPatternType) {
    case 'NORMAL': {
      const questionCount = data.pattern.mainPatterns.questionCount
        ? data.pattern.mainPatterns.questionCount
        : 0;
      const questionMark = data.pattern.mainPatterns.questionMark
        ? data.pattern.mainPatterns.questionMark
        : 0;
      const fullMark = data.pattern.mainPatterns.fullMark ? data.pattern.mainPatterns.fullMark : 0;
      const subQuestionPatterns = data.pattern.subQuestionPatterns
        ? data.pattern.subQuestionPatterns
        : [];

      let subQuestionMarkIsEqul = true;
      if (subQuestionPatterns.length > 0) {
        // 小题单独配置
        const firstSub = subQuestionPatterns[0];
        if (firstSub.questionMark && Number(firstSub.questionMark) !== 0) {
          // 小题分数单独配置
          const arr = subQuestionPatterns.map(it => it.questionMark);
          subQuestionMarkIsEqul = Math.max.apply(null, arr) === Math.min.apply(null, arr);
        }
      }

      let txt = '';
      if (isComplex) {
        txt = `${'(' + '本节'}${String(fullMark)}分` + `)`;
      } else if (Number(questionCount) > 1) {
        // 多个小题时
        if (Number(questionMark) > 0) {
          // 小题分数统一配置
          txt =
            `${'(' + '共'}${String(questionCount)}小题` +
            `；` +
            `每小题${String(questionMark)}分` +
            `，` +
            `共${String(fullMark)}分` +
            `)`;
        } else if (subQuestionMarkIsEqul) {
          // 小题分数单独配置 小题分数相等
          const subQuestionMark = subQuestionPatterns[0].questionMark;
          txt =
            `${'(' + '共'}${String(questionCount)}小题` +
            `；` +
            `每小题${String(subQuestionMark)}分` +
            `，` +
            `共${String(fullMark)}分` +
            `)`;
        } else {
          txt =
            `${'(' + '共'}${String(questionCount)}小题` + `；` + `共${String(fullMark)}分` + `)`;
        }
      } else {
        // 只有1题时
        txt = `${'(' + '共'}${String(fullMark)}分` + `)`;
      }
      return txt;
    }
    case 'TWO_LEVEL': {
      /** =========小题总数==========* */
      // 1.小题数是统配还是单独配置 目前判断依据是mainPatterns.subQuestionCount是否等于0

      let totalSubQuestionCount = 0;

      // debugger;

      const subQuestionPatterns1 = data.pattern.subQuestionPatterns;

      if (
        data.pattern.mainPatterns.subQuestionCount &&
        data.pattern.mainPatterns.subQuestionCount > 0
      ) {
        // 统一配置
        totalSubQuestionCount = data.pattern.mainPatterns.subQuestionCount
          ? data.pattern.mainPatterns.subQuestionCount
          : 0;
        totalSubQuestionCount *= Number(data.pattern.mainPatterns.questionCount);
      } else if (subQuestionPatterns1.length > 0) {
        totalSubQuestionCount = subQuestionPatterns1.reduce((total, item) => {
          return total + (item.subQuestionCount ? Number(item.subQuestionCount) : 0);
        }, 0);
      }

      /** =========每小题分数========* */
      let subQuestionMark = 0;
      let subQuestionMarkIsEqul1 = true;
      if (
        data.pattern.mainPatterns.subQuestionMark &&
        data.pattern.mainPatterns.subQuestionMark !== 0
      ) {
        // 小题分数统配
        subQuestionMark = Number(data.pattern.mainPatterns.subQuestionMark);
      } else {
        // 小题分数单独配置
        if (subQuestionPatterns1.length > 0) {
          // 小题单独配置
          const firstSub1 = subQuestionPatterns1[0];
          if (firstSub1.subQuestionMark && Number(firstSub1.subQuestionMark) !== 0) {
            // 小题分数单独配置
            const arr = subQuestionPatterns1.map(it => it.subQuestionMark);
            subQuestionMarkIsEqul1 = Math.max.apply(null, arr) === Math.min.apply(null, arr);
          }
        }
      }
      /** =========总分========* */
      const fullMark = data.pattern.mainPatterns.fullMark;

      let txt = '';
      if (isComplex) {
        txt =
          `${'(' + '共'}${String(totalSubQuestionCount)}小题` +
          `；` +
          `每小题${String(subQuestionMark)}分` +
          `，` +
          `共${String(fullMark)}分` +
          `)`;
      } else if (subQuestionMark == 0) {
        // 小题分值单独配置
        if (subQuestionMarkIsEqul1) {
          // 小题分数单独配置 小题分数相等
          const subMark = subQuestionPatterns1[0].subQuestionMark;
          txt =
            `${'(' + '共'}${String(totalSubQuestionCount)}小题` +
            `；` +
            `每小题${String(subMark)}分` +
            `，` +
            `共${String(fullMark)}分` +
            `)`;
        } else {
          txt =
            `${'(' + '共'}${String(totalSubQuestionCount)}小题` +
            `；` +
            `共${String(fullMark)}分` +
            `)`;
        }
      } else {
        txt =
          `${'(' + '共'}${String(totalSubQuestionCount)}小题` +
          `；` +
          `每小题${String(subQuestionMark)}分` +
          `，` +
          `共${String(fullMark)}分` +
          `)`;
      }

      return txt;
    }
    case 'COMPLEX': {
      // 共多少节 group
      const group_num = data.pattern.groups.length;
      // 每节分数是否相等
      let group_mark_equal = true;
      let first_group_mark = 0;
      data.pattern.groups.map((item, idx) => {
        if (idx == 0) {
          first_group_mark = item.pattern.mainPatterns.fullMark;
        } else {
          const fullMark = item.pattern.mainPatterns.fullMark;
          if (Number(first_group_mark) !== Number(fullMark)) {
            group_mark_equal = false;
          }
        }
      });

      // 总分
      const fullMark = data.pattern.mainPatterns.fullMark;
      let txt = '';
      if (group_mark_equal) {
        // 复合题型下各节分值一致的情况
        txt =
          `${'(' + '共'}${String(group_num)}节` +
          `；` +
          `每节${String(first_group_mark)}分` +
          `，` +
          `共${String(fullMark)}分` +
          `)`;
      } else {
        txt = `${'(' + '共'}${String(group_num)}节` + `；` + `共${String(fullMark)}分` + `)`;
      }
      return txt;
    }
    default:
      break;
  }
}

/**
 * 匹配字典
 * @Author   tina.zhang
 * @DateTime 2019-01-09T13:20:54+0800
 * @param    {[type]}                 data [description]
 * @param    {[type]}                 type [description]
 */
export function MatchDictionary(data, type) {
  for (const i in data) {
    if (data[i].code == type) {
      return data[i].value;
    }
  }

  return null;
}

/**
 * 匹配字段
 * @Author   tina.zhang
 * @DateTime 2019-01-09T13:20:54+0800
 * @param    {[type]}                 data [description]
 * @param    {[type]}                 type [description]
 */
export function MatchTpye(data, type) {
  for (const i in data) {
    if (data[i].name == type) {
      return data[i].audioType;
    }
  }
  return null;
}

/**
 * 筛选提示语逻辑
 * @Author   tina.zhang
 * @DateTime 2019-01-18T14:32:01+0800
 * @param    {[type]}                 hintData [description]
 * @param    {[type]}                 type     [description]
 */
export function filterPrompt(hintData, type, subIndex = 0) {
  let returnData = null;
  if (type == 'Y') {
    // 合并答题
    returnData = hintData.mainHints;
  } else if (hintData.subHints) {
    const newArr = JSON.parse(JSON.stringify(hintData.mainHints)) || [];
    for (const i in newArr) {
      for (const j in hintData.subHints[subIndex]) {
        if (newArr[i].name == hintData.subHints[subIndex][j].name) {
          newArr[i] = hintData.subHints[subIndex][j];
        }
      }
    }

    if (newArr.length === 0) {
      returnData = hintData.subHints[subIndex];
    } else {
      returnData = newArr;
    }
  } else {
    returnData = hintData.mainHints;
  }

  const filterData = [];
  for (const m in returnData) {
    if (returnData[m].audio == '' && returnData[m].text == '') {
    } else {
      filterData.push(returnData[m]);
    }
  }
  console.log('filterData', filterData);
  return filterData;
}

export function showLoading({ img, func, text = '正在努力评分，请稍等...', callback }) {
  const element = document.getElementById('c-loading-trade');
  if (element == null) {
    const html = `<div id="c-loading-trade" >
              <div style="background: #000;position: fixed;width: 100%;height: 100%;top: 0;left: 0;z-index: 1001;transition: opacity .3s;opacity: 0.05;"></div>
              <div  style="position: fixed;right: 40%;bottom: 40%;z-index:999999;padding: 40px 80px;background-color: white;">
                    <div style="text-align: center;">
                      <img src = ${img} style="vertical-align: middle;"/>
                    </div>
                    <div style="text-align: center;">
                      <font style="vertical-align: middle;color:#333;font-size:16px;">${text}</font>
                    </div>

                    <div id="c-loading-change" style="margin-top: 20px;width: 160px;height: 32px;border-radius: 16px;display: flex;align-items: center;justify-content: center;border: 1px solid #999;cursor: pointer;">
                      放弃评分，直接切题
                    </div>
              </div>
          </div>`;
    const div = document.createElement('div');
    div.innerHTML = html;
    document.getElementById('root').appendChild(div);
    callback('');
  }
}

export function hideLoading() {
  const elements = document.getElementById('c-loading-trade');
  if (elements) elements.parentNode.removeChild(elements);
}

export function showWaiting({ img, func, text = '正在努力评分，请稍等...', callback }) {
  const element = document.getElementById('c-loading-trade');
  if (element == null) {
    const html = `<div id="c-loading-trade" >
              <div style="background: #000;position: fixed;width: 100%;height: 100%;top: 0;left: 0;z-index: 1001;transition: opacity .3s;opacity: 0.05;"></div>
              <div  style="position: fixed;right: 40%;bottom: 40%;z-index:999999;padding: 40px 80px;background-color: white;">
                    <div style="text-align: center;">
                      <img src = ${img} style="vertical-align: middle;"/>
                    </div>
                    <div style="text-align: center;">
                      <font style="vertical-align: middle;color:#333;font-size:16px;">${text}</font>
                    </div>
              </div>
          </div>`;
    const div = document.createElement('div');
    div.innerHTML = html;
    document.getElementById('root').appendChild(div);
    if (callback) {
      callback('');
    }
  }
}

function compare(property) {
  return function(a, b) {
    const value1 = Number(a[property]);
    const value2 = Number(b[property]);
    return value1 - value2;
  };
}

/**
 * 评分引擎转换备注
 */
// console.log(arr.sort(compare('startIndex')))
export function convertNote(referenceText, arr) {
  arr = arr.sort(compare('startIndex'));

  const newArr = [];
  let differenceNumber = 0;
  const referenceArr = referenceText.split('');
  for (const i in arr) {
    for (let m = Number(arr[i].startIndex); m <= Number(arr[i].endIndex); m++) {
      if (m == arr[i].startIndex) {
        referenceArr[m] = arr[i].markedWord;
        if (i == 0) {
          arr[i].convertStartIndex = Number(arr[i].startIndex);
          arr[i].convertEndIndex = Number(arr[i].startIndex) + arr[i].markedWord.length - 1;
          differenceNumber =
            differenceNumber +
            (Number(arr[i].convertEndIndex) - Number(arr[i].convertStartIndex)) -
            (Number(arr[i].endIndex) - Number(arr[i].startIndex));
        } else {
          arr[i].convertStartIndex = Number(arr[i].startIndex) + differenceNumber;
          arr[i].convertEndIndex =
            Number(arr[i].startIndex) + differenceNumber + arr[i].markedWord.length - 1;
          differenceNumber =
            differenceNumber +
            (Number(arr[i].convertEndIndex) - Number(arr[i].convertStartIndex)) -
            (Number(arr[i].endIndex) - Number(arr[i].startIndex));
        }
      } else {
        referenceArr[m] = '';
      }
    }
  }
  console.log(arr);
  console.log(referenceArr);
  console.log(referenceArr.join(''));
  return referenceArr.join('');
  // unConvertNote(referenceArr.join(""), arr)
}

export function unConvertNote(referenceTextMark, result) {
  const newArr = [];
  let score = 0;
  referenceTextMark = referenceTextMark.sort(compare('convertStartIndex'));
  for (const j in referenceTextMark) {
    for (const i in result.words) {
      if (result.words[i].beginindex == referenceTextMark[j].convertStartIndex) {
        for (let m = i; m < result.words.length; m++) {
          score += result.words[m].score;
          if (referenceTextMark[j].convertEndIndex == result.words[m].endindex) {
            result.words.splice(i, m - i + 1, {
              beginindex: Number(referenceTextMark[j].startIndex),
              endindex: Number(referenceTextMark[j].endIndex),
              start: 0,
              text: referenceTextMark[j].word,
              end: 0,
              score: Math.ceil(score / (m - i)),
            });
          }
        }
      }
    }
  }

  return result;
}

// 填空题处理
// 1.将前后空格去掉
// 2.将单词间空格变成一个
// type: true:将单词全部变成小写，false:单词大小写保持原样
export function fillingClear(text, type) {
  let data;
  if (text == undefined) {
    return text;
  }
  data = text
    .replace(/^\s+/g, '')
    .replace(/\s+$/g, '')
    .replace(/\s+/g, ' ');
  if (type) {
    return data.tolocaleLowerCase();
  }
  return data;
}

// 封闭引擎需要处理换行和段前空格
export function noSpace(reftext) {
  return reftext
    .replace(/^\s+/g, '')
    .replace(/\n/g, ' ')
    .replace(/\s+$/g, '');
}

// 获取题目倍率
export function getRatio(paperData, masterData) {
  // 大题号
  const mainIndex = masterData.staticIndex.mainIndex;
  // 小题号
  const questionIndex = masterData.staticIndex.questionIndex;
  // 子题号
  const subIndex = masterData.staticIndex.subIndex ? returnSubIndex(masterData) : null;
  // 大题目题目类型
  const questionType = masterData.mains[mainIndex].type;
  // 评分倍率
  let times = 1;
  const pattern = paperData.paperInstance[mainIndex - 1].pattern;
  switch (questionType) {
    case 'NORMAL':
      {
        if (pattern.mainPatterns.markRatio) {
          times = Number(pattern.mainPatterns.markRatio);
        }
      }
      break;
    case 'TWO_LEVEL':
      {
        // 优先取子题目的单独配置
        const subQuestionPattern =
          paperData.paperInstance[mainIndex - 1].pattern.subQuestionPatterns[subIndex];

        if (subQuestionPattern == undefined) {
          if (paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.markRatio) {
            times = Number(paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.markRatio);
          }
        } else if (
          subQuestionPattern.answerTime == 0 ||
          subQuestionPattern.answerTime == undefined
        ) {
          // 统一配
          if (paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.markRatio) {
            times = Number(paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.markRatio);
          }
        } else if (pattern.mainPatterns.markRatio) {
          times = Number(pattern.mainPatterns.markRatio);
        }
      }
      break;
    case 'COMPLEX':
      {
        // 优先取子题目的单独配置
        const mainPatterns =
          paperData.paperInstance[mainIndex - 1].pattern.groups[questionIndex].pattern.mainPatterns;

        if (mainPatterns.answerTime == 0) {
          const main_mainPatterns = paperData.paperInstance[mainIndex - 1].pattern.mainPatterns;
          if (main_mainPatterns.markRatio) {
            times = Number(main_mainPatterns.markRatio);
          }
        } else if (mainPatterns.markRatio) {
          times = Number(mainPatterns.markRatio);
        }
      }
      break;
    default:
      break;
  }
  return times;
}

/**
 *  评分Request
 * @param paperData(int)   试卷数据
 * @param masterData(Bool) 题号数据
 */
export function getRequest_obj(
  paperData,
  masterData,
  subfocusIndex = undefined,
  pluginAnswerType = undefined,
  ratio = undefined
) {
  // 大题号
  const { mainIndex } = masterData.staticIndex;
  // 小题号
  const { questionIndex } = masterData.staticIndex;
  // 子题号
  let subIndex = 0;
  // 评分倍率
  let times = 1;
  // 题号id
  let questionId = '';

  if (pluginAnswerType) {
    subIndex = subfocusIndex;
    times = ratio;
  } else if (masterData.sig) {
    // 单题试做
    subIndex = masterData.staticIndex.subIndex;
  } else {
    subIndex =
      typeof masterData.staticIndex.subIndex != 'undefined' ? returnSubIndex(masterData) : null;
  }
  // 大题目题目类型
  let questionType = masterData.mains[mainIndex].type;
  // 录入的题目信息
  let question = {};
  // 内核类型
  let coreType;
  // 总分评分分制
  let rank;

  if (pluginAnswerType) {
    const ItemData = paperData.paperInstance[mainIndex - 1];
    rank = ItemData.pattern.mainPatterns.fullMark; // 插件分数获取
  } else if (questionType == 'single_COMPLEX' || questionType == 'single') {
    rank = 5; // 单题试做默认5分
  } else {
    rank = calculatScore(masterData.staticIndex, paperData);
  }

  // 识别文本
  const refText_arr = [];
  // 识别文本中间过程
  const refText_temp = [];
  // 关键字
  let keywords = [];
  /*
   *  录音时长
   * */
  let duration = 0;

  let HALF_OPEN_ORAL_errorReferenceMachineEvaluation = [];

  let HALF_OPEN_ORAL_hintReferenceMachineEvaluation = [];

  let HALF_OPEN_ORAL_referenceMachineEvaluation = [];

  let pattern = {};
  if (paperData.paperInstance) {
    pattern = paperData.paperInstance[mainIndex - 1].pattern;
  }

  switch (questionType) {
    case 'NORMAL':
      {
        question = paperData.paperInstance[mainIndex - 1].questions[questionIndex].data;
        questionId = paperData.paperInstance[mainIndex - 1].questions[questionIndex].id;
        if (
          pattern.subQuestionPatterns &&
          pattern.subQuestionPatterns[questionIndex] &&
          pattern.subQuestionPatterns[questionIndex].answerTime &&
          pattern.subQuestionPatterns[questionIndex].answerTime != 0
        ) {
          duration = pattern.subQuestionPatterns[questionIndex].answerTime;
        } else {
          duration = pattern.mainPatterns.answerTime;
        }

        if (ratio == undefined) {
          if (pattern.mainPatterns.markRatio) {
            times = Number(pattern.mainPatterns.markRatio);
          }
        }
      }
      break;
    case 'TWO_LEVEL':
      {
        // 优先取子题目的单独配置
        const subQuestionPattern =
          paperData.paperInstance[mainIndex - 1].pattern.subQuestionPatterns[subIndex];

        question = paperData.paperInstance[mainIndex - 1].questions[questionIndex].data;
        if (subQuestionPattern == undefined) {
          duration = paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.answerTime;
          if (paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.markRatio) {
            times = Number(paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.markRatio);
          }
        } else if (
          subQuestionPattern.answerTime == 0 ||
          subQuestionPattern.answerTime == undefined
        ) {
          // 统一配
          duration = paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.answerTime;
          if (paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.markRatio) {
            times = Number(paperData.paperInstance[mainIndex - 1].pattern.mainPatterns.markRatio);
          }
        } else {
          duration = subQuestionPattern.answerTime;
          if (pattern.mainPatterns.markRatio) {
            times = Number(pattern.mainPatterns.markRatio);
          }
        }
      }
      break;
    case 'COMPLEX':
      {
        // 优先取子题目的单独配置
        const mainPatterns =
          paperData.paperInstance[mainIndex - 1].pattern.groups[questionIndex].pattern.mainPatterns;

        question =
          paperData.paperInstance[mainIndex - 1].questions[0].data.groups[questionIndex].data;

        questionType =
          paperData.paperInstance[mainIndex - 1].questions[0].data.groups[questionIndex].data
            .patternType;
        if (questionType === 'NORMAL') {
          questionId =
            paperData.paperInstance[mainIndex - 1].questions[0].data.groups[questionIndex].id;
        }

        if (mainPatterns.answerTime == 0) {
          const main_mainPatterns = paperData.paperInstance[mainIndex - 1].pattern.mainPatterns;
          duration = main_mainPatterns.answerTime;
          if (main_mainPatterns.markRatio) {
            times = Number(main_mainPatterns.markRatio);
          }
        } else {
          duration = mainPatterns.answerTime;
          if (mainPatterns.markRatio) {
            times = Number(mainPatterns.markRatio);
          }
        }
      }
      break;
    // 兼容单题试做内容
    case 'single_COMPLEX':
      {
        question = paperData.groups[questionIndex].data;
        questionType = paperData.groups[questionIndex].data.patternType;
      }
      break;
    case 'single':
      {
        question = paperData;
        questionType = paperData.patternType;
      }
      break;
    default:
      break;
  }

  let answerType = '';

  if (pluginAnswerType) {
    answerType = pluginAnswerType;
    if (question.subQuestion) {
      questionType = 'TWO_LEVEL';
    }
  } else {
    answerType = question.mainQuestion.answerType;
  }

  if (questionType == 'TWO_LEVEL') {
    questionId = question.subQuestion[subIndex].id;
    // 兼容evaluationEngineInfo异常的旧数据
    if (
      question.subQuestion[subIndex].evaluationEngineInfo == null ||
      question.subQuestion[subIndex].evaluationEngineInfo.evaluationEngine == null
    ) {
      message.warn('evaluationEngineInfo内容为旧版本，请更新版本');
      switch (question.mainQuestion.answerType) {
        case 'OPEN_ORAL':
          {
            coreType = 'eval.para.en';
          }
          break;
        case 'HALF_OPEN_ORAL':
          {
            coreType = 'eval.semi.en';
          }
          break;
        default:
          break;
      }
    } else {
      coreType = question.subQuestion[subIndex].evaluationEngineInfo.evaluationEngine;
    }
    switch (answerType) {
      case 'CLOSED_ORAL':
        {
          let CLOSED_ORAL_referenceText =
            question.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceText;
          if (
            question.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceTextMark &&
            question.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceTextMark.length > 0
          ) {
            CLOSED_ORAL_referenceText = convertNote(
              question.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceText,
              question.subQuestion[subIndex].closeOralQuestionAnswerInfo.referenceTextMark
            );

            // this.closeOralQuestionAnswerInfo = question.subQuestion[subIndex].closeOralQuestionAnswerInfo;
          }
          refText_arr.push({ text: CLOSED_ORAL_referenceText });
        }
        break;
      case 'OPEN_ORAL':
        {
          const OPEN_ORAL_referenceMachineEvaluation =
            question.subQuestion[subIndex].openOralQuestionAnswerInfo.referenceMachineEvaluation;
          if (question.subQuestion[subIndex].openOralQuestionAnswerInfo.keywords) {
            keywords = question.subQuestion[subIndex].openOralQuestionAnswerInfo.keywords;
          }
          if (coreType == 'en.scne.exam' || coreType == 'eval.open.en') {
            for (const a in question.subQuestion) {
              const Item =
                question.subQuestion[a].openOralQuestionAnswerInfo.referenceMachineEvaluation;
              for (const b in Item) {
                if (Number(a) == Number(subIndex)) {
                  refText_temp.push({
                    text: Item[b],
                  });
                }
              }
            }
          } else {
            for (const i in OPEN_ORAL_referenceMachineEvaluation) {
              refText_temp.push({ text: OPEN_ORAL_referenceMachineEvaluation[i] });
            }
          }
        }
        break;
      case 'HALF_OPEN_ORAL':
        {
          HALF_OPEN_ORAL_referenceMachineEvaluation =
            question.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo
              .referenceMachineEvaluation;

          HALF_OPEN_ORAL_errorReferenceMachineEvaluation =
            question.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo
              .errorReferenceMachineEvaluation || [];
          HALF_OPEN_ORAL_hintReferenceMachineEvaluation =
            question.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo
              .hintReferenceMachineEvaluation || [];

          if (question.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords) {
            keywords = question.subQuestion[subIndex].halfOpenOralQuestionAnswerInfo.keywords;
          }
          if (coreType == 'en.scne.exam' || coreType == 'eval.semi.en') {
            for (const i in question.subQuestion) {
              const Item =
                question.subQuestion[i].halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation;
              for (const j in Item) {
                if (Number(i) == Number(subIndex)) {
                  refText_temp.push({
                    text: Item[j],
                  });
                }
              }
            }
          } else {
            for (const i in HALF_OPEN_ORAL_referenceMachineEvaluation) {
              refText_temp.push({
                text: HALF_OPEN_ORAL_referenceMachineEvaluation[i],
                type: 0,
              });
            }
            if (coreType == 'en.sent.rec' || coreType == 'eval.choc.en') {
              for (const i in HALF_OPEN_ORAL_errorReferenceMachineEvaluation) {
                refText_temp.push({
                  text: HALF_OPEN_ORAL_errorReferenceMachineEvaluation[i],
                  type: 2,
                });
              }
              for (const i in HALF_OPEN_ORAL_hintReferenceMachineEvaluation) {
                refText_temp.push({
                  text: HALF_OPEN_ORAL_hintReferenceMachineEvaluation[i],
                  type: 1,
                });
              }
            }
          }
        }
        break;
      default:
        break;
    }
  } else {
    // 兼容evaluationEngineInfo异常的旧数据
    if (
      question.mainQuestion.evaluationEngineInfo == null ||
      question.mainQuestion.evaluationEngineInfo.evaluationEngine == null
    ) {
      message.warn('evaluationEngineInfo内容为旧版本，请更新版本');
      switch (question.mainQuestion.answerType) {
        case 'OPEN_ORAL':
          {
            coreType = 'eval.open.en';
          }
          break;
        case 'HALF_OPEN_ORAL':
          {
            coreType = 'eval.semi.en';
          }
          break;
        default:
          break;
      }
    } else {
      coreType = question.mainQuestion.evaluationEngineInfo.evaluationEngine;
    }
    switch (answerType) {
      case 'CLOSED_ORAL':
        {
          let CLOSED_ORAL_referenceText =
            question.mainQuestion.closeOralQuestionAnswerInfo.referenceText;

          if (
            question.mainQuestion.closeOralQuestionAnswerInfo.referenceTextMark &&
            question.mainQuestion.closeOralQuestionAnswerInfo.referenceTextMark.length > 0
          ) {
            CLOSED_ORAL_referenceText = convertNote(
              question.mainQuestion.closeOralQuestionAnswerInfo.referenceText,
              question.mainQuestion.closeOralQuestionAnswerInfo.referenceTextMark
            );

            // this.closeOralQuestionAnswerInfo = question.mainQuestion.closeOralQuestionAnswerInfo;
          }

          console.log(question.mainQuestion.closeOralQuestionAnswerInfo);
          refText_arr.push({ text: noSpace(CLOSED_ORAL_referenceText) });
        }
        break;
      case 'OPEN_ORAL':
        {
          const OPEN_ORAL_referenceMachineEvaluation =
            question.mainQuestion.openOralQuestionAnswerInfo.referenceMachineEvaluation;
          if (question.mainQuestion.openOralQuestionAnswerInfo.keywords) {
            keywords = question.mainQuestion.openOralQuestionAnswerInfo.keywords;
          }
          if (coreType == 'en.scne.exam' || coreType == 'eval.open.en') {
            for (const i in OPEN_ORAL_referenceMachineEvaluation) {
              refText_temp.push({
                text: OPEN_ORAL_referenceMachineEvaluation[i],
              });
            }
          } else {
            for (const i in OPEN_ORAL_referenceMachineEvaluation) {
              refText_temp.push({ text: OPEN_ORAL_referenceMachineEvaluation[i] });
            }
          }
        }
        break;
      case 'HALF_OPEN_ORAL':
        {
          HALF_OPEN_ORAL_referenceMachineEvaluation =
            question.mainQuestion.halfOpenOralQuestionAnswerInfo.referenceMachineEvaluation;

          HALF_OPEN_ORAL_errorReferenceMachineEvaluation =
            question.mainQuestion.halfOpenOralQuestionAnswerInfo.errorReferenceMachineEvaluation ||
            [];
          HALF_OPEN_ORAL_hintReferenceMachineEvaluation =
            question.mainQuestion.halfOpenOralQuestionAnswerInfo.hintReferenceMachineEvaluation ||
            [];

          if (question.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords) {
            keywords = question.mainQuestion.halfOpenOralQuestionAnswerInfo.keywords;
          }
          if (coreType == 'en.scne.exam' || coreType == 'eval.semi.en') {
            for (const i in HALF_OPEN_ORAL_referenceMachineEvaluation) {
              refText_temp.push({
                text: HALF_OPEN_ORAL_referenceMachineEvaluation[i],
              });
            }
          } else {
            for (const i in HALF_OPEN_ORAL_referenceMachineEvaluation) {
              refText_temp.push({ text: HALF_OPEN_ORAL_referenceMachineEvaluation[i], type: 0 });
            }

            if (coreType == 'en.sent.rec' || coreType == 'eval.choc.en') {
              for (const i in HALF_OPEN_ORAL_errorReferenceMachineEvaluation) {
                refText_temp.push({
                  text: HALF_OPEN_ORAL_errorReferenceMachineEvaluation[i],
                  type: 2,
                });
              }
              for (const i in HALF_OPEN_ORAL_hintReferenceMachineEvaluation) {
                refText_temp.push({
                  text: HALF_OPEN_ORAL_hintReferenceMachineEvaluation[i],
                  type: 1,
                });
              }
            }
          }
        }
        break;
      default:
        break;
    }
  }
  console.log(refText_temp);

  // 中文答案过滤
  if (refText_temp.length > 0) {
    refText_temp.map(item => {
      console.log(funcChina(item.text));
      if (funcChina(item.text)) {
        refText_arr.push(item);
      }
    });
  }

  const request_obj = {};

  // 兼容旧的内核参数
  const allCoreType = {
    'en.word.score': 'eval.word.en', // 单词评测
    'en.sent.score': 'eval.sent.en', // 句子评测
    'en.sent.rec': 'eval.choc.en', // 有限分支识别
    'en.pred.exam': 'eval.para.en', // 封闭题型 段落朗读
    'en.scne.exam': 'eval.semi.en', // 半开放题型
    'en.prtl.exam': 'eval.open.en', // 开放题型
  };
  allCoreType[coreType] ? message.warn(`${coreType}为旧版本内核，请更新版本`) : null;
  request_obj.rank = rank;
  request_obj.kernelType = allCoreType[coreType] ? allCoreType[coreType] : coreType;
  request_obj.attachAudio = true;
  request_obj.precision = 0.5 / times; // 精度为0.5除以倍率
  request_obj.reference = {
    answers: refText_arr,
    questionId,
  };

  if (
    coreType == 'en.prtl.exam' ||
    coreType == 'eval.open.en' ||
    coreType == 'en.sent.rec' ||
    coreType == 'eval.choc.en'
  ) {
    // 开放题型和有限分支必须要关键词
    if (keywords.length == 0) {
      keywords = [
        {
          weight: 0,
          text: 'text',
          exclude: false,
        },
      ];
    }
    request_obj.keywords = keywords;
  }

  return {
    request_obj,
    duration,
  };
}

// /**
//  * 格式化时间
//  * @Author   tina.zhang
//  * @DateTime 2019-02-26T09:40:08+0800
//  * @param    {[type]}                 value [description]
//  * @return   {[type]}                       [description]
//  */
export function formatSeconds(value) {
  let theTime = parseInt(value);
  let theTime1 = 0;
  let theTime2 = 0;
  if (theTime > 60) {
    theTime1 = parseInt(theTime / 60);
    theTime = parseInt(theTime % 60);
    if (theTime1 > 60) {
      theTime2 = parseInt(theTime1 / 60);
      theTime1 = parseInt(theTime1 % 60);
    }
  }
  let result;
  if (parseInt(theTime) > 9) {
    result = `${parseInt(theTime)}`;
  } else {
    result = `0${parseInt(theTime)}`;
  }
  if (theTime1 > 0) {
    if (parseInt(theTime1) > 9) {
      result = `${parseInt(theTime1)}:${result}`;
    } else {
      result = `0${parseInt(theTime1)}:${result}`;
    }
  } else {
    result = `00:${result}`;
  }
  if (theTime2 > 0) {
    result = `${parseInt(theTime2)}:${result}`;
  }
  return result;
}

/**
 * 练习当前试卷完成情况统计
 * @Author   tina.zhang
 * @DateTime 2019-02-26T09:54:54+0800
 * @param    {[type]}                 newData [description]
 * @return   {[type]}                         [description]
 */
export function completionStatistics(newData, type) {
  if (newData == undefined || newData.mains == undefined) {
    return;
  }
  const mains = newData.mains;
  const mainIndex = newData.staticIndex.mainIndex;
  const completionArr = [];
  for (const i in mains) {
    if (i != 0) {
      const questions = mains[i].questions;
      let completionStatus = '';

      if (Number(mains[i].index) == Number(mainIndex) && type === '') {
        // 正在做的题目
        completionStatus = 'S';
      } else {
        completionStatus = 'F';
        let finished = false;
        let noFinished = false;
        for (const m in questions) {
          if (questions[m].answerStatus == 'N') {
            completionStatus = 'N';
            noFinished = true;
          }
          if (questions[m].answerStatus == 'Y') {
            finished = true;
          }
        }

        if (noFinished && finished) {
          completionStatus = 'P'; // 做了一半
        }
      }

      completionArr.push(completionStatus);
    }
  }

  return completionArr;
}

/**
 * 试卷结构类型
 * @Author   tina.zhang
 * @DateTime 2019-02-26T09:54:54+0800
 * @param    {[type]}                 newData [description]
 * @return   {[type]}                         [description]
 */
export function completionInstanceList(paperData) {
  const completionArr = [];

  const paperInstance = paperData.paperInstance;
  for (const i in paperInstance) {
    completionArr.push(paperInstance[i].type);
  }
  return completionArr;
}

/**
 * @author tina.zhang
 * @DateTime 2018-12-03T16:28:15+0800
 * @param    生成答案json
 * @return   {[type]}
 */
export function assemblyResultData(paperData) {
  let studentInfo = localStorage.getItem('studentInfo') || {};
  try {
    studentInfo = JSON.parse(studentInfo);
  } catch (e) {
    console.warn(e);
  }

  const answerInfo = getAnswerInfo(paperData);
  const totalScore = calculatTotalScore(answerInfo) || 0;

  const answersData = {
    id: paperData.id,
    dataVersion: ANSWESHEET_VERSION,
    studentId: studentInfo.stuid || '',
    studentName: studentInfo.name || '',
    studentNumber: studentInfo.number || '',
    classId: '', // 快照
    className: '',
    taskId: studentInfo.taskId || '',
    taskName: '',
    taskPaperId: '',
    startTime: '',
    deliverTime: '',
    fullMark: '',
    totalScore,
    duration: '',
    answerInfo,
  };
  return answersData;
}

/**
 * 锁键盘
 * @Author   tina.zhang
 * @DateTime 2019-02-11T11:11:10+0800
 * @param    {[type]}                 paperData [description]
 * @param    {[type]}                 newData   [description]
 * @return   {Boolean}                          [description]
 */
export function isKeyLocked(paperData, newData, script = undefined) {
  if (process.env.NODE_ENV === 'development' && window.ExampaperStatus == 'EXAM') {
    vb.isKeyLocked = 'off';
    return;
  }

  if (window.ExampaperStatus == 'EXAM') {
    if (newData.staticIndex.mainIndex > 0) {
      if (
        paperData.paperInstance[newData.staticIndex.mainIndex - 1].pattern &&
        paperData.paperInstance[newData.staticIndex.mainIndex - 1].pattern.questionPatternType ==
          'COMPLEX'
      ) {
        if (
          paperData.paperInstance[newData.staticIndex.mainIndex - 1].questions[0].data.groups[
            newData.staticIndex.questionIndex
          ].data.mainQuestion.answerType == 'GAP_FILLING'
        ) {
          // if(script == undefined){
          //   vb.isKeyLocked = 'special';
          // }else if(script && script.stepPhase && script.stepPhase.indexOf("ANSWER_PHASE")>-1){
          //   console.log('special');
          //   vb.isKeyLocked = 'special';
          // }else{
          //   vb.isKeyLocked = 'all';
          // }
          vb.isKeyLocked = 'special';
        } else {
          vb.isKeyLocked = 'all';
        }
      } else if (
        paperData.paperInstance[newData.staticIndex.mainIndex - 1] &&
        paperData.paperInstance[newData.staticIndex.mainIndex - 1].questions &&
        paperData.paperInstance[newData.staticIndex.mainIndex - 1].questions[0].data.mainQuestion
          .answerType == 'GAP_FILLING'
      ) {
        // if(script == undefined){
        //   vb.isKeyLocked = 'special';
        // }else if(script && script.stepPhase &&  script.stepPhase.indexOf("ANSWER_PHASE")>-1){
        //   console.log('special');
        //   vb.isKeyLocked = 'special';
        // }else{
        //   vb.isKeyLocked = 'all';
        // }
        vb.isKeyLocked = 'special';
      } else {
        vb.isKeyLocked = 'all';
      }
    }
  }
}

/**
 * 判断环节是否使用插件
 * @Author   tina.zhang
 * @DateTime 2019-02-11T11:11:10+0800
 * @param    {[type]}                 paperData [description]
 * @param    {[type]}                 newData   [description]
 * @return   {Boolean}                          [description]
 */
export function isUsePlugin(data, type) {
  let isUse = false;
  isUse = data.some(e => {
    return e.indexOf(type) > -1;
  });

  return isUse;
}
/**
 *报告页段落朗读和句子评测评语生成
 *
 * @author tina.zhang
 * @date 2019-03-26
 * @export
 */
export function speechReport(resultJson) {
  const coreType = resultJson.request.kernelType;
  let str = '';
  // 总体评价
  const overallInfo = [
    formatMessage({ id: 'app.text.ndztbxydcqryo', defaultMessage: '你的整体表现有点差强人意哦！' }),
    formatMessage({ id: 'app.text.ndztbxydcqryo', defaultMessage: '你的整体表现有点差强人意哦！' }),
    formatMessage({ id: 'app.text.ndbxyb', defaultMessage: '请继续努力！' }),
    formatMessage({ id: 'app.text.ndztbxlh', defaultMessage: '你的整体表现良好！' }),
    formatMessage({ id: 'app.text.ndztbxhb', defaultMessage: '你的整体表现很棒！' }),
    formatMessage({ id: 'app.text.ndztbxtcsl', defaultMessage: '你的整体表现太出色啦！' }),
  ];
  // 发音评价
  const pronunciationInfo = [
    formatMessage({ id: 'app.text.fyddlx', defaultMessage: '发音有很多不准确，再多多练习' }),
    formatMessage({ id: 'app.text.fyddlx', defaultMessage: '发音有很多不准确，再多多练习' }),
    formatMessage({ id: 'app.text.fyjxnl', defaultMessage: '发音不够准确，需要继续努力' }),
    formatMessage({ id: 'app.text.fyjqts', defaultMessage: '发音基本准确，可以再加强提升' }),
    formatMessage({ id: 'app.text.fyqxzq', defaultMessage: '发音清晰准确' }),
  ];
  const pronunciationScore = resultJson.result.pronunciation.score;
  // 完整度评价
  const integrityInfo = [
    formatMessage({ id: 'app.text.zdldy', defaultMessage: '只读了个别句子或某些单词或短语' }),
    formatMessage({ id: 'app.text.zdldy', defaultMessage: '只读了个别句子或某些单词或短语' }),
    formatMessage({ id: 'app.text.jdshnr', defaultMessage: '仅读了少数内容' }),
    formatMessage({ id: 'app.text.dclhdnr', defaultMessage: '读出了多数内容' }),
    formatMessage({ id: 'app.text.wzddclqbnr', defaultMessage: '完整地读出了全部内容' }),
  ];
  const integrityScore = resultJson.result.integrity.score;
  // 流利度评价
  const fluencyInfo = [
    formatMessage({ id: 'app.text.ldbll', defaultMessage: '朗读不流利' }),
    formatMessage({ id: 'app.text.ldbll', defaultMessage: '朗读不流利' }),
    formatMessage({ id: 'app.text.ldbgll', defaultMessage: '朗读不够流利' }),
    formatMessage({ id: 'app.text.ldjblc', defaultMessage: '朗读基本顺畅' }),
    formatMessage({ id: 'app.text.ldllsc', defaultMessage: '朗读流利顺畅' }),
  ];
  const fluencyScore = resultJson.result.fluency.score;
  // 句子特殊评价
  // 重读
  const stressInfo = [
    formatMessage({ id: 'app.text.myzd', defaultMessage: '没有重读' }),
    formatMessage({ id: 'app.text.myzd', defaultMessage: '没有重读' }),
    formatMessage({ id: 'app.text.sbfzdzq', defaultMessage: '少部分重读准确' }),
    formatMessage({ id: 'app.text.bfzdzq', defaultMessage: '部分重读准确' }),
    formatMessage({ id: 'app.text.zqzd', defaultMessage: '准确重读' }),
  ];
  // 意群
  const senseInfo = [
    formatMessage({ id: 'app.text.yfwf', defaultMessage: '语法结构掌握不准确，无法理解句义' }),
    formatMessage({ id: 'app.text.yfwf', defaultMessage: '语法结构掌握不准确，无法理解句义' }),
    formatMessage({ id: 'app.text.yfjzg', defaultMessage: '语法结构掌握欠佳，基本没有节奏感' }),
    formatMessage({ id: 'app.text.yfhdjzg', defaultMessage: '语法结构掌握良好，有一定的节奏感' }),
    formatMessage({ id: 'app.text.yfjgjzg', defaultMessage: '语法结构掌握得很棒，有很好的节奏感' }),
  ];
  // 声调
  const toneInfo = [
    formatMessage({ id: 'app.text.sjdyybhl', defaultMessage: '升降调运用不合理' }),
    formatMessage({ id: 'app.text.sjdyybhl', defaultMessage: '升降调运用不合理' }),
    formatMessage({ id: 'app.text.sjdbuf', defaultMessage: '升降调运用部分准确' }),
    formatMessage({ id: 'app.text.sjdyyhl', defaultMessage: '升降调运用合理' }),
    formatMessage({ id: 'app.text.sjdyyqd', defaultMessage: '升降调运用恰当' }),
  ];
  // 语速
  const speechInfo = [
    formatMessage({ id: 'app.text.yshm', defaultMessage: '语速缓慢' }),
    formatMessage({ id: 'app.text.ysjm', defaultMessage: '语速较慢' }),
    formatMessage({ id: 'app.text.yssz', defaultMessage: '语速适中' }),
    formatMessage({ id: 'app.text.ysjk', defaultMessage: '语速较快' }),
  ];

  let index = 0;
  const overRate = (100 * resultJson.result.overall) / resultJson.result.rank;
  if (overRate >= 95 && overRate <= 100) {
    index = 5;
  } else if (overRate >= 85 && overRate < 95) {
    index = 4;
  } else if (overRate >= 70 && overRate < 85) {
    index = 3;
  } else if (overRate >= 55 && overRate < 70) {
    index = 2;
  } else if (overRate < 55) {
    index = 1;
  }

  str = overallInfo[index];
  // 句子评价
  if (coreType == 'eval.sent.en') {
    const stressScore = resultJson.result.rhythm.stress;
    const senseScore = resultJson.result.rhythm.sense;
    const toneScore = resultJson.result.rhythm.tone;
    const speedScore = Number(resultJson.result.fluency.speed);
    let speed = 0;
    if (speedScore > 180) {
      speed = 3;
    } else if (speedScore > 141) {
      speed = 2;
    } else if (speedScore > 101) {
      speed = 2;
    } else if (speedScore > 81) {
      speed = 1;
    } else if (speedScore > 0) {
      speed = 0;
    }

    str = `${str + pronunciationInfo[pronunciationScore]}，`;
    if ((pronunciationScore >= 3) & (fluencyScore < 3)) {
      str = `${str +
        formatMessage({ id: 'app.text.but', defaultMessage: '但' }) +
        fluencyInfo[fluencyScore]}，`;
    } else if ((pronunciationScore >= 3) & (fluencyScore >= 3)) {
      str = `${str + fluencyInfo[fluencyScore]}，`;
    } else if ((pronunciationScore < 3) & (fluencyScore >= 3)) {
      str = `${str +
        formatMessage({ id: 'app.text.but', defaultMessage: '但' }) +
        fluencyInfo[fluencyScore]}，`;
    } else if ((pronunciationScore < 3) & (fluencyScore < 3)) {
      str = `${str + fluencyInfo[fluencyScore]}，`;
    }

    str = `${str + speechInfo[speed]}；`;

    str = `${str +
      formatMessage({ id: 'app.text.ni', defaultMessage: '你' }) +
      integrityInfo[integrityScore]}，`;

    str = `${str +
      formatMessage({ id: 'app.text.qz', defaultMessage: '其中' }) +
      stressInfo[stressScore]}，`;

    str = `${str +
      formatMessage({ id: 'app.text.zt', defaultMessage: '整体' }) +
      senseInfo[senseScore]}，`;
    if ((senseScore >= 3) & (toneScore < 3)) {
      str = `${str +
        formatMessage({ id: 'app.text.but', defaultMessage: '但' }) +
        toneInfo[toneScore]}。`;
    } else if ((senseScore >= 3) & (toneScore >= 3)) {
      str = `${str + toneInfo[toneScore]}。`;
    } else if ((senseScore < 3) & (toneScore >= 3)) {
      str = `${str +
        formatMessage({ id: 'app.text.but', defaultMessage: '但' }) +
        toneInfo[toneScore]}。`;
    } else if ((senseScore < 3) & (toneScore < 3)) {
      str = `${str + toneInfo[toneScore]}。`;
    }
  } else if (coreType == 'eval.para.en') {
    // 段落评价
    str = `${str + pronunciationInfo[pronunciationScore]}，`;
    if (pronunciationScore >= 3 && fluencyScore < 3) {
      str = `${str +
        formatMessage({ id: 'app.text.but', defaultMessage: '但' }) +
        fluencyInfo[fluencyScore]}，`;
      if (integrityScore < 3) {
        str = `${str +
          formatMessage({ id: 'app.text.ye', defaultMessage: '也' }) +
          integrityInfo[integrityScore]}。`;
      } else {
        str = `${str +
          formatMessage({ id: 'app.text.buguo', defaultMessage: '不过' }) +
          integrityInfo[integrityScore]}。`;
      }
    } else if (pronunciationScore >= 3 && fluencyScore >= 3) {
      str = `${str + fluencyInfo[fluencyScore]}，`;
      if (integrityScore < 3) {
        str = `${str +
          formatMessage({ id: 'app.text.but', defaultMessage: '但' }) +
          integrityInfo[integrityScore]}。`;
      } else {
        str = `${str +
          formatMessage({ id: 'app.text.ye', defaultMessage: '也' }) +
          integrityInfo[integrityScore]}。`;
      }
    } else if (pronunciationScore < 3 && fluencyScore >= 3) {
      str = `${str +
        formatMessage({ id: 'app.text.but', defaultMessage: '但' }) +
        fluencyInfo[fluencyScore]}，`;
      if (integrityScore < 3) {
        str = `${str +
          formatMessage({ id: 'app.text.buguo', defaultMessage: '不过' }) +
          integrityInfo[integrityScore]}。`;
      } else {
        str = `${str + integrityInfo[integrityScore]}。`;
      }
    } else if (pronunciationScore < 3 && fluencyScore <= 3) {
      str = `${str + fluencyInfo[fluencyScore]}，`;
      if (integrityScore < 3) {
        str = `${str +
          formatMessage({ id: 'app.text.ye', defaultMessage: '也' }) +
          integrityInfo[integrityScore]}。`;
      } else {
        str = `${str +
          formatMessage({ id: 'app.text.but', defaultMessage: '但' }) +
          integrityInfo[integrityScore]}。`;
      }
    }
  }
  return str;
}

/**
 *是否启动切换题目考试环节
 *
 * @author tina.zhang
 * @date 2019-03-28
 * @export
 * @returns
 */
export function isOpenSwitchTopic(type) {
  let isOpen = true;
  if (type === 'EXAM') {
    if (vb && vb.runtimeMode != 'development') {
      isOpen = false;
    }
  }
  return isOpen;
}

/**
 * 截取前n个字符，并再最后增加...
 * 如果字符少于n个就原样返回
 * n默认是10个
 * @author tina.zhang
 * @date 2019-03-11
 * @export
 * @returns
 */
export function lessWords(sent, n = 10) {
  let a = sent;
  if (sent) {
    a = sent.length > n ? `${sent.slice(0, n)}...` : sent;
  }
  return a;
}

/**
 * 匹配单元类型...
 * @author tina.zhang
 * @date 2019-03-11
 * @export
 * @returns
 */
export function MatchUnitType(data) {
  if (data.scopeName) {
    return data.scopeName;
  }

  if (data.gradeValue) {
    switch (data.unitId) {
      case 'MID_TERM':
        return `${data.gradeValue}期中`;
      case 'MID_TERM_FIRST':
        return `${data.gradeValue}期中`;
      case 'MID_TERM_SECOND':
        return `${data.gradeValue}期中`;
      case 'END_TERM':
        return `${data.gradeValue}期末`;
      case 'END_TERM_FIRST':
        return `${data.gradeValue}期末`;
      case 'END_TERM_SECOND':
        return `${data.gradeValue}期末`;
      case '':
        return data.gradeValue;
      default:
        return `${data.gradeValue}单元`;
    }
  } else {
    return data.paperScopeValue;
  }
}

/**
 * 题序打乱返回数组...
 * @author tina.zhang
 * @date 2019-03-11
 * @export
 * @returns
 */
export function getRandamQueue(n) {
  const arrRaw = Array.from({ length: n }, (v, k) => k);
  const arrDest = new Array(n);
  for (let i = 0; i < n; i++) {
    const index = Math.floor(Math.random() * (n - i));
    arrDest[i] = arrRaw[index];
    arrRaw.splice(index, 1);
  }
  return arrDest;
}

/**
 * 题序打乱...
 * @author tina.zhang
 * @date 2019-03-11
 * @export
 * @returns
 */
export function sequenceDisrupted(paperData, studentAnswer = false) {
  let order = [];
  let newPaperInstance = [];
  for (const i in paperData.paperInstance) {
    newPaperInstance = [];
    let sequenceNumbers = [];
    let isSequenceDisrupted = false; // 二层题型题序是否打乱
    if (
      paperData.paperInstance[i].pattern &&
      paperData.paperInstance[i].pattern.questionPatternType === 'TWO_LEVEL'
    ) {
      if (paperData.paperInstance[i].pattern.sequenceNumber) {
        sequenceNumbers = paperData.paperInstance[i].pattern.sequenceNumber;
        for (const k in sequenceNumbers) {
          if (sequenceNumbers[0].length != sequenceNumbers[k].length) {
            console.log('不打乱');
            isSequenceDisrupted = true;
            break;
          }
        }
      }
    }
    if (paperData.paperInstance[i].questions) {
      if (paperData.paperInstance[i].pattern.indexRandom !== 'N') {
        if (paperData.paperInstance[i].questions.length > 1 && !isSequenceDisrupted) {
          if (studentAnswer) {
            if (paperData.paperInstance[i].pattern.questionPatternType === 'TWO_LEVEL') {
              order = getStudentQueue(
                studentAnswer,
                paperData.paperInstance[i].questions[0].data.subQuestion[0].id,
                paperData.paperInstance[i].questions.length,
                true
              );
            } else {
              order = getStudentQueue(
                studentAnswer,
                paperData.paperInstance[i].questions[0].id,
                paperData.paperInstance[i].questions.length,
                true
              );
            }
          } else {
            order = getRandamQueue(paperData.paperInstance[i].questions.length);
          }
          for (const j in order) {
            newPaperInstance.push(paperData.paperInstance[i].questions[order[j]]);
          }
          paperData.paperInstance[i].order = order;
          paperData.paperInstance[i].questions = newPaperInstance;
        }
      }
    }
  }

  return paperData;
}

/**
 * 20.1.2.3.	选项打乱...
 * @author tina.zhang
 * @date 2019-03-11
 * @export
 * @returns
 * studentAnswer 线上学生报告中，学生数据
 */
export function OptionDisturb(paperData, studentAnswer = false) {
  for (const i in paperData.paperInstance) {
    if (paperData.paperInstance[i].questions) {
      for (const j in paperData.paperInstance[i].questions) {
        if (paperData.paperInstance[i].questions[j]) {
          if (paperData.paperInstance[i].questions[j].data) {
            if (
              paperData.paperInstance[i].questions[j].data.patternType === 'NORMAL' &&
              paperData.paperInstance[i].questions[j].data.mainQuestion.answerType === 'CHOICE'
            ) {
              if (paperData.paperInstance[i].pattern.optionRandom !== 'N') {
                let order = [];
                const newOptions = [];
                if (studentAnswer) {
                  order = getStudentQueue(
                    studentAnswer,
                    paperData.paperInstance[i].questions[j].id,
                    paperData.paperInstance[i].questions[j].data.mainQuestion
                      .choiceQuestionAnswerInfo.options.length
                  );
                } else {
                  order = getRandamQueue(
                    paperData.paperInstance[i].questions[j].data.mainQuestion
                      .choiceQuestionAnswerInfo.options.length
                  );
                }
                for (const n in order) {
                  paperData.paperInstance[i].questions[
                    j
                  ].data.mainQuestion.choiceQuestionAnswerInfo.order = order;
                  newOptions.push(
                    paperData.paperInstance[i].questions[j].data.mainQuestion
                      .choiceQuestionAnswerInfo.options[order[n]]
                  );
                }
                paperData.paperInstance[i].questions[
                  j
                ].data.mainQuestion.choiceQuestionAnswerInfo.options = newOptions;
              }
            } else if (
              paperData.paperInstance[i].questions[j].data.patternType === 'TWO_LEVEL' &&
              paperData.paperInstance[i].questions[j].data.mainQuestion.answerType === 'CHOICE'
            ) {
              if (paperData.paperInstance[i].pattern.optionRandom !== 'N') {
                let order = [];
                for (const m in paperData.paperInstance[i].questions[j].data.subQuestion) {
                  const newOptions = [];
                  if (studentAnswer) {
                    order = getStudentQueue(
                      studentAnswer,
                      paperData.paperInstance[i].questions[j].data.subQuestion[m].id,
                      paperData.paperInstance[i].questions[j].data.subQuestion[m]
                        .choiceQuestionAnswerInfo.options.length
                    );
                  } else {
                    order = getRandamQueue(
                      paperData.paperInstance[i].questions[j].data.subQuestion[m]
                        .choiceQuestionAnswerInfo.options.length
                    );
                  }
                  for (const n in order) {
                    paperData.paperInstance[i].questions[j].data.subQuestion[
                      m
                    ].choiceQuestionAnswerInfo.order = order;
                    newOptions.push(
                      paperData.paperInstance[i].questions[j].data.subQuestion[m]
                        .choiceQuestionAnswerInfo.options[order[n]]
                    );
                  }
                  paperData.paperInstance[i].questions[j].data.subQuestion[
                    m
                  ].choiceQuestionAnswerInfo.options = newOptions;
                }
              }
            } else {
              const groups = paperData.paperInstance[i].questions[j].data.groups;
              const groupsPattern = paperData.paperInstance[i].pattern.groups;
              for (const n in groups) {
                if (
                  groups[n].data.patternType === 'NORMAL' &&
                  groups[n].data.mainQuestion.answerType === 'CHOICE'
                ) {
                  if (groupsPattern[n].pattern.optionRandom !== 'N') {
                    let order = [];
                    const newOptions = [];
                    if (studentAnswer) {
                      order = getStudentQueue(
                        studentAnswer,
                        groups[n].id,
                        groups[n].data.mainQuestion.choiceQuestionAnswerInfo.options.length
                      );
                    } else {
                      order = getRandamQueue(
                        groups[n].data.mainQuestion.choiceQuestionAnswerInfo.options.length
                      );
                    }
                    for (const m in order) {
                      groups[n].data.mainQuestion.choiceQuestionAnswerInfo.order = order;
                      newOptions.push(
                        groups[n].data.mainQuestion.choiceQuestionAnswerInfo.options[order[m]]
                      );
                    }
                    groups[n].data.mainQuestion.choiceQuestionAnswerInfo.options = newOptions;
                  }
                } else if (
                  groups[n].data.patternType === 'TWO_LEVEL' &&
                  groups[n].data.mainQuestion.answerType === 'CHOICE'
                ) {
                  if (groupsPattern[n].pattern.optionRandom !== 'N') {
                    let order = [];
                    for (const m in groups[n].data.subQuestion) {
                      const newOptions = [];
                      if (studentAnswer) {
                        order = getStudentQueue(
                          studentAnswer,
                          groups[n].data.subQuestion[m].id,
                          groups[n].data.subQuestion[m].choiceQuestionAnswerInfo.options.length
                        );
                      } else {
                        order = getRandamQueue(
                          groups[n].data.subQuestion[m].choiceQuestionAnswerInfo.options.length
                        );
                      }
                      for (const l in order) {
                        groups[n].data.subQuestion[m].choiceQuestionAnswerInfo.order = order;
                        newOptions.push(
                          groups[n].data.subQuestion[m].choiceQuestionAnswerInfo.options[order[l]]
                        );
                      }
                      groups[n].data.subQuestion[m].choiceQuestionAnswerInfo.options = newOptions;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return paperData;
}

/**
 * @author tina.zhang
 * @date 2019-06-04
 * @export 获取打乱顺序
 * @returns
 */
export function getStudentQueue(studentAnswer, qid, length, type = false) {
  let order = [];
  const data = studentAnswer.find(function(item) {
    return item.subquestionNo === qid;
  });

  if (type) {
    // 题序打乱
    if (data.order) {
      order = data.order.split(',');
    } else {
      order = Array.from({ length }, (v, k) => k); // 生成长度为length的顺序数组
    }
  } else {
    // 选项打乱
    if (data.answerOptionOrder) {
      order = data.answerOptionOrder.split(',');
    } else {
      order = Array.from({ length }, (v, k) => k); // 生成长度为length的顺序数组
    }
  }
  return order;
}

/**
 * @Author    tina.zhang
 * @DateTime  2018-10-23
 * @copyright 练习计算已做得分点
 * @return    {[type]}                已做题数
 */
export function GenerateAnsweredNum(answersData) {
  let answeredNum = 0;

  for (const i in answersData) {
    if (answersData[i]) {
      for (const j in answersData[i].answers) {
        const patternType = answersData[i].answers[j].questionPatternType;

        switch (patternType) {
          case 'NORMAL':
            if (answersData[i].answers[j].answer.mainQuestionAnswer) {
              if (
                answersData[i].answers[j].answer.mainQuestionAnswer.answerType != 'CHOICE' &&
                answersData[i].answers[j].answer.mainQuestionAnswer.answerType != 'GAP_FILLING'
              ) {
                if (answersData[i].answers[j].answer.mainQuestionAnswer.answerAudioId) {
                  answeredNum += 1;
                }
              } else if (
                answersData[i].answers[j].answer.mainQuestionAnswer.answerType == 'CHOICE'
              ) {
                if (answersData[i].answers[j].answer.mainQuestionAnswer.answerOptionId) {
                  answeredNum += 1;
                }
              } else if (
                answersData[i].answers[j].answer.mainQuestionAnswer.answerType == 'GAP_FILLING'
              ) {
                if (answersData[i].answers[j].answer.mainQuestionAnswer.answerText) {
                  answeredNum += 1;
                }
              }
            }
            break;
          case 'TWO_LEVEL':
            for (const m in answersData[i].answers[j].answer.subQuestionAnswers) {
              if (answersData[i].answers[j].answer.subQuestionAnswers[m]) {
                if (
                  answersData[i].answers[j].answer.subQuestionAnswers[m].answerType != 'CHOICE' &&
                  answersData[i].answers[j].answer.subQuestionAnswers[m].answerType != 'GAP_FILLING'
                ) {
                  if (answersData[i].answers[j].answer.subQuestionAnswers[m].answerAudioId) {
                    answeredNum += 1;
                  }
                } else if (
                  answersData[i].answers[j].answer.subQuestionAnswers[m].answerType == 'CHOICE'
                ) {
                  if (answersData[i].answers[j].answer.subQuestionAnswers[m].answerOptionId) {
                    answeredNum += 1;
                  }
                } else if (
                  answersData[i].answers[j].answer.subQuestionAnswers[m].answerType == 'GAP_FILLING'
                ) {
                  if (answersData[i].answers[j].answer.subQuestionAnswers[m].answerText) {
                    answeredNum += 1;
                  }
                }
              }
            }
            break;
          case 'COMPLEX':
            const groupsData = answersData[i].answers[0].answer.groups;
            for (const n in groupsData) {
              if (groupsData[n].answer) {
                if (groupsData[n].questionPatternType == 'NORMAL') {
                  if (groupsData[n].answer.mainQuestionAnswer) {
                    if (
                      groupsData[n].answer.mainQuestionAnswer.answerType != 'CHOICE' &&
                      groupsData[n].answer.mainQuestionAnswer.answerType != 'GAP_FILLING'
                    ) {
                      if (groupsData[n].answer.mainQuestionAnswer.answerAudioId) {
                        answeredNum += 1;
                      }
                    } else if (groupsData[n].answer.mainQuestionAnswer.answerType == 'CHOICE') {
                      if (groupsData[n].answer.mainQuestionAnswer.answerType.answerOptionId) {
                        answeredNum += 1;
                      }
                    } else if (
                      groupsData[n].answer.mainQuestionAnswer.answerType == 'GAP_FILLING'
                    ) {
                      if (groupsData[n].answer.mainQuestionAnswer.answerText) {
                        answeredNum += 1;
                      }
                    }
                  }
                } else {
                  for (const m in groupsData[n].answer.subQuestionAnswers) {
                    if (groupsData[n].answer.subQuestionAnswers[m]) {
                      if (
                        groupsData[n].answer.subQuestionAnswers[m].answerType != 'CHOICE' &&
                        groupsData[n].answer.subQuestionAnswers[m].answerType != 'GAP_FILLING'
                      ) {
                        if (groupsData[n].answer.subQuestionAnswers[m].answerAudioId) {
                          answeredNum += 1;
                        }
                      } else if (
                        groupsData[n].answer.subQuestionAnswers[m].answerType == 'CHOICE'
                      ) {
                        if (groupsData[n].answer.subQuestionAnswers[m].answerType.answerOptionId) {
                          answeredNum += 1;
                        }
                      } else if (
                        groupsData[n].answer.subQuestionAnswers[m].answerType == 'GAP_FILLING'
                      ) {
                        if (groupsData[n].answer.subQuestionAnswers[m].answerText) {
                          answeredNum += 1;
                        }
                      }
                    }
                  }
                }
              }
            }
            break;
        }
      }
    }
  }

  return answeredNum;
}

/**
 * @author tina.zhang
 * @date 2019-06-13
 * @export 数字过滤，如果小数超过3位，按3位四舍五入处理
 * @returns
 */
export function DoWithNum(data) {
  return Number(Number(data).toFixed(3));
}

/**
 * @author tina.zhang
 * @date 2019-07-23
 * @export 百分制转换成四分制
 * @returns
 */
export function GetLevel(overRate) {
  let index = 0;
  if (overRate > 85 && overRate <= 100) {
    index = 4;
  } else if (overRate > 70 && overRate <= 85) {
    index = 3;
  } else if (overRate > 55 && overRate <= 70) {
    index = 2;
  } else if (overRate <= 55) {
    index = 1;
  }
  return index;
}

/**
 * @author tina.zhang
 * @date 2019-07-23
 * @export 控制分数在1-4之间
 * @returns
 */
export function IfLevel(score) {
  if (score < 1) {
    return 1;
  }
  if (score > 4) {
    return 4;
  }
  return score;
}

/**
 * @author tina.zhang
 * @date 2019-06-13
 * @export 是否有回溯题目
 * @returns
 */
export function isRecall(masterData, script) {
  let flag = true;
  for (const i in masterData.mains) {
    if (
      (masterData.mains[i].subjectiveAndObjective === 'OBJECTIVE' ||
        masterData.mains[i].type === 'COMPLEX') &&
      Number(script.recallIndex) >= Number(i)
    ) {
      flag = false;
    }
  }
  return flag;
}

/**
 * @author tina.zhang
 * @date 2019-06-13
 * @export 删除答案json 多余null
 * @returns
 */
export function deleteAnswer(answersData, paperData) {
  const answerInfo = answersData.answerInfo;
  const paperInstance = paperData.paperInstance;
  const spliceIndex = [];
  for (const i in paperInstance) {
    if (paperInstance[i].type !== 'PATTERN') {
      spliceIndex.push(i);
    }
  }
  const newAnswerInfo = [];
  for (const j in answerInfo) {
    let flag = true;
    for (const k in spliceIndex) {
      if (answerInfo[j] == null && j == spliceIndex[k]) {
        flag = false;
      }
    }
    if (flag) {
      newAnswerInfo.push(answerInfo[j]);
    }
  }
  answersData.answerInfo = newAnswerInfo;
  return answersData;
}

export const getAnswerInfo = paperData => {
  const answerInfo = [];

  paperData.paperInstance.forEach((item, key) => {
    if (item.type === 'PATTERN') {
      const { pattern, questions } = item;
      const {
        mainPatterns: { markRatio, precision },
        sequenceNumber,
      } = pattern;

      const answers = questions.map(question => {
        if (!question) return;
        // 判断是否有值，判断中题是否答题过了
        if (!question) {
          return;
        }
        const { data } = question;
        // 是否有分值
        const answer = handleDataByPatternType(data.patternType, question, pattern);
        if (answer) {
          return {
            dataVersion: ANSWESHEET_VERSION,
            questionCode: '',
            id: question.id,
            questionPatternType: data.patternType,
            questionPatternId: question.questionPatternId,
            mainOrderIndex: question.mainOrderIndex,
            rawOrderIndex: question.rawOrderIndex,
            markRatio,
            precision: precision || 0.5 / Number(markRatio),
            subjectiveAndObjective: data.subjectiveAndObjective,
            answer,
          };
        }
      });

      answers.forEach((item, key) => {
        if (!item) {
          delete answers[key];
        }
      });

      if (answers) {
        answerInfo[key] = { answers };
      }
    }
  });
  console.log('==========answerInfo================', answerInfo);
  return answerInfo;
};

// 根据不同的题型进行不同的逻辑处理
function handleDataByPatternType(patternType, question, pattern) {
  // 普通题型
  if (patternType === 'NORMAL') {
    const {
      data: { mainQuestion },
    } = question;
    const { sequenceNumber } = pattern;
    const { receivePoints, totalPoints, answerType } = mainQuestion;
    const params = getAnswersByAnswerType(mainQuestion);
    if (!params) return;
    return {
      mainQuestionAnswer: {
        id: question.id,
        answerType,
        manualScore: '',
        mark: totalPoints,
        markInfo: '',
        score: receivePoints,
        sequenceNumber:
          sequenceNumber[question.mainOrderIndex] &&
          sequenceNumber[question.mainOrderIndex][question.rawOrderIndex],
        ...params,
      },
    };
  }

  // 二层题型
  if (patternType === 'TWO_LEVEL') {
    const {
      data: { subQuestion },
    } = question;
    const { sequenceNumber } = pattern;
    // 生成sub
    const subQuestionAnswers = subQuestion.map((sub, index) => {
      const { receivePoints, totalPoints, answerType } = sub;
      const params = getAnswersByAnswerType(sub);
      if (!params) return;
      return {
        id: sub.id,
        answerType,
        manualScore: '',
        mark: totalPoints,
        markInfo: '',
        score: receivePoints,
        sequenceNumber: sequenceNumber[question.rawOrderIndex][index],
        ...params,
      };
    });
    // 删除空对象
    subQuestionAnswers.forEach((item, key) => {
      if (!item) {
        delete subQuestionAnswers[key];
      }
    });
    if (!subQuestionAnswers.some(item => !!item)) return;
    return {
      subQuestionAnswers,
    };
  }

  // 复杂题型
  if (patternType === 'COMPLEX') {
    const {
      data: { subjectiveAndObjective, groups },
    } = question;
    const groupsList = groups.map((sub, index) => {
      if (sub.data && 'receivePoints' in sub.data) {
        const patternObj = pattern.groups[index].pattern;
        const { data } = sub || {};
        sub.mainOrderIndex = 0;
        sub.rawOrderIndex = 0;
        return {
          id: sub.id,
          questionPatternType: data.patternType,
          markRatio: patternObj.mainPatterns.markRatio,
          precision:
            patternObj.mainPatterns.precision || 0.5 / Number(patternObj.mainPatterns.precision),
          subjectiveAndObjective: data.subjectiveAndObjective,
          answer: handleDataByPatternType(data.patternType, sub, patternObj),
        };
      }
    });
    groupsList.forEach((item, key) => {
      if (!item) {
        delete groupsList[key];
      }
    });
    if (!groupsList.some(item => !!item)) return;
    return { groups: groupsList };
  }
}

// 根据题目类型生成对应的答案
function getAnswersByAnswerType(obj) {
  const { answerType } = obj;
  if (!('receivePoints' in obj)) {
    return;
  }

  // 选择题
  if (answerType === 'CHOICE') {
    const {
      answerId,
      choiceQuestionAnswerInfo: { options = [], order },
    } = obj;
    const optKeys = ['A', 'B', 'C', 'D'];
    if (!answerId) return;
    const index = options.findIndex(item => item.id === answerId);
    return {
      answerOptionId: answerId,
      answerOptionIndex: optKeys[index || 0],
      answerOptionOrder: order,
    };
  }

  // 填空题
  if (answerType === 'GAP_FILLING') {
    const { answerValue } = obj;
    return {
      answerText: answerValue,
    };
  }

  // 口语题
  if (['CLOSED_ORAL', 'OPEN_ORAL', 'HALF_OPEN_ORAL'].includes(answerType)) {
    const { answerValue, evaluationEngineInfo } = obj;
    if (!evaluationEngineInfo) return;
    return {
      answerAudioId: answerValue.tokenId,
      engineRequest: answerValue,
      engineResult: answerValue,
      evaluationEngine: evaluationEngineInfo,
    };
  }
}

/**
 * @author tina.zhang
 * @date 2019-10-18
 * @export 检测字符串包含英文字符
 * @returns
 */
export function checkTempStr(string) {
  const p = /[a-z]/i;
  const b = p.test(string);
  return b;
}

/**
 * @author tina.zhang
 * @date 2019-12-25
 * @export 根据questionId匹配题目的主控数据staticIndex
 * @returns
 */
export function matchingQuestionId(questionId, paperData) {
  const paperInstance = paperData.paperInstance;
  let staticIndex = null;
  paperInstance.forEach((item, index) => {
    if (item && item.questions && item.type === 'PATTERN') {
      const questionType = item.pattern.questionPatternType;
      if (questionType === 'NORMAL') {
        // 普通题型
        item.questions.forEach((m, i) => {
          if (m && m.id == questionId) {
            // 未制题不匹配
            staticIndex = {
              mainIndex: Number(index) + 1,
              questionIndex: i,
            };
          }
        });
      } else if (questionType === 'TWO_LEVEL') {
        // 二层题型
        item.questions.forEach((m, i) => {
          if (m && m.data && m.data.subQuestion) {
            // 未制题不匹配
            m.data.subQuestion.forEach((k, j) => {
              if (k.id == questionId) {
                staticIndex = {
                  mainIndex: Number(index) + 1,
                  questionIndex: i,
                  subIndex: item.pattern.sequenceNumber && item.pattern.sequenceNumber[i][j],
                };
              }
            });
          }
        });
      } else if (questionType === 'COMPLEX') {
        // 复合题型
        if (item.questions && item.questions[0] && item.questions[0].data) {
          // 未制题不匹配
          const groups = item.questions[0].data.groups;
          const groupspattern = item.pattern.groups;
          groups.forEach((m, i) => {
            if (m && m.data.patternType === 'NORMAL') {
              if (m.id == questionId) {
                staticIndex = {
                  mainIndex: Number(index) + 1,
                  questionIndex: i,
                  subIndex:
                    groupspattern[i].pattern.sequenceNumber &&
                    groupspattern[i].pattern.sequenceNumber[0][0],
                };
              }
            } else if (m.data.patternType === 'TWO_LEVEL') {
              m.data.subQuestion.forEach((k, j) => {
                if (k.id == questionId) {
                  staticIndex = {
                    mainIndex: Number(index) + 1,
                    questionIndex: i,
                    subIndex:
                      groupspattern[i].pattern.sequenceNumber &&
                      groupspattern[i].pattern.sequenceNumber[0][j],
                  };
                }
              });
            }
          });
        }
      }
    }
  });

  console.log('matchingQuestionId', staticIndex);
  return staticIndex;
}

/**
 * 判断当前是否在录音中
 */
export function isNowRecording(tips = true) {
  const vb = window.vb;
  if (window.ExampaperStatus !== 'EXAM') {
    // 非考中 vb6270 切题的时候，判断是否在录音中，如果在录音中，提示当前用户正在录音中
    try {
      if (vb && vb.getRecorderManager() && vb.getRecorderManager().recording) {
        if (tips) {
          message.warn(
            formatMessage({
              id: 'app.text.isTheRecordingPleaseStopTheRecording',
              defaultMessage: '正在录音中，请先停止录音',
            })
          );
        }
        return true;
      }
    } catch (e) {
      return false;
    }
  } else {
    try {
      // 考中 vb6270 切题的时候，判断是否在录音中，如果在录音中，提示当前用户正在录音中
      const recordManager = vb.getRecorderManager();
      if (recordManager && vb.deviceState && vb.deviceState.value === 'recording') {
        if (tips) {
          message.warn(
            formatMessage({
              id: 'app.text.isTheRecordingPleaseStopTheRecording',
              defaultMessage: '正在录音中，请先停止录音',
            })
          );
        }
        return true;
      }
    } catch (e) {
      return false;
    }
  }
  return false;
}
