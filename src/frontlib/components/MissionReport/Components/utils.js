import moment from 'moment';
import React from 'react';
import nzh from 'nzh/cn';
import { parse, stringify } from 'qs';
import { func } from 'prop-types';
import emitter from '@/utils/ev';

let scrollEnableFunction = true;// 运行滚动条触发回调函数,解决同一行锚点选择问题

// 锚点功能,点击导航栏后，滚轮自动滑倒对应的题目
export function scrollTo(linkId, examReprotr) {
  const dom = document.getElementById(linkId);
  const examReprot=examReprotr;
  scrollEnableFunction = false;
  if (dom) {
    if (examReprot) {// 考中互动讲评节点
      examReprot.scrollTop = examReprot.scrollTop + dom.getBoundingClientRect().top - 150;
    }
    else if (document.getElementById('popWindow')) {
      document.getElementById('popWindow').parentNode.scrollTop = document.getElementById('popWindow').parentNode.scrollTop + dom.getBoundingClientRect().top - 150;
    } else if (window.IsExamClient === 'Exam') {
      document.getElementById('divReportOverview').parentNode.parentNode.scrollTop = document.getElementById('divReportOverview').parentNode.parentNode.scrollTop + dom.getBoundingClientRect().top - 150;
    } else if (typeof (window.scrollY) === "undefined") {// 兼容IE
      window.scrollTo(0, Number(window.pageYOffset) + Number(dom.getBoundingClientRect().top) - 150);
    } else {
      window.scrollTo(0, Number(window.scrollY) + Number(dom.getBoundingClientRect().top) - 150);
    }
  }
}

// 传入每道小题的ID获取每道小题的得分率
function getSubRate(qid, rateList) {
  let rate = 2;
  if (rateList !== "empty") {// 考中互动讲评报告页，空试卷
    const data = rateList.find((item) => {
      return item.subquestionNo === qid;
    })
    if (data) {
      if (Object.prototype.hasOwnProperty.call(data, "scoreRate")) {
        rate = data.scoreRate;// 教师报告
      } else {
        rate = (data.score / data.fullScore).toFixed(2);// 学生答案报告
      }
    }
  }
  // console.log('rate',rate)
  return rate;
}

// 获取试卷每题的锚点Id，获取对应的dom节点
export function getLinkList(masterData, dom) {
  const list = [];
  let element;
  Object.keys(masterData.mains).forEach(index1 => {
    if (masterData.mains[index1].type !== "SPLITTER") {
      Object.keys(masterData.mains[index1].questions).forEach(index2 => {
        Object.keys(masterData.mains[index1].questions[index2].subs).forEach(index3 => {
          list.push(`${String(index1)}-${String(index2)}-${Number(masterData.mains[index1].questions[index2].subs[index3])}-${masterData.mains[index1].questions[index2].type}`);
        })
      })
    }
  })
  // console.log("getLinkList",list)
  element = window;
  if (document.getElementById('popWindow')) {
    element = document.getElementById('popWindow').parentNode // 学生端弹框
  } else if (window.IsExamClient === 'Exam') {
    element = document.getElementById('divReportOverview').parentNode.parentNode // 考中平台教师端报告页
  }
  if (dom) {// 考中互动讲评
    element = dom;
  }
  element.onscroll = () => {
    //   console.log(element.scrollTop)
    if (list.length > 0 && scrollEnableFunction) {
      Object.keys(list).forEach(index => {
        if (document.getElementById(list[index])) {
          const long = document.getElementById(list[index]).getBoundingClientRect().top;
          if (long < 300 && long > 20 && long !== 100) {
            // console.log(item,long);
            emitter.emit('teacherScroll', list[index]);
          }
        }
      })
    } else {
      scrollEnableFunction = true;
    }
  }
  return list;
}

/**
 * 用于渲染报告答案详情页，左侧导航栏数据
 * @param {*} data 
 */
export function assemblyData(data, rateList, showData) {
  const master = {
    staticIndex: {
      mainIndex: 0, // 大题序号，注意0为开卷介绍，从1开始是标准题型，初始0
      questionIndex: 0, // 题目序号，复合题型为子题型序号，初始0
      // "subIndex":0    //小题序号（二层才有，含复合下的二层），初始0
    },
    mains: [],
  };
  const { paperInstance } = data;
  const questions = new Array(paperInstance.length);

  for (let i in paperInstance) {
    let m = Number(i);
    if (paperInstance[i].type == null || paperInstance[i].type == 'PATTERN') {
      let pattern = paperInstance[i].pattern;
      questions[m] = {};
      questions[m].index = m;
      questions[m].type = pattern.questionPatternType;
      if (pattern.mainPatterns.questionPatternInstanceSequence) {
        questions[m].newLabel =
          pattern.mainPatterns.questionPatternInstanceSequence +
          pattern.mainPatterns.questionPatternInstanceName;
      }
      questions[m].label =
        pattern.mainPatterns.questionPatternInstanceName || pattern.questionPatternName;
      questions[m].multipleQuestionPerPage = 'N';
      if (pattern.questionPatternType == 'COMPLEX') {
        //复合题型拼装数据
        let patternGroups = pattern.groups;
        questions[m].questions = new Array(Number(patternGroups.length));
        for (let j = 0; j < Number(patternGroups.length); j++) {
          //复合题型下面的题型是种类数
          questions[m].questions[j] = {};

          if (
            showData &&
            showData[pattern.questionPatternId] &&
            showData[pattern.questionPatternId].structure.groups[j].structure.flowInfo
          ) {
            //允许合并答题
            //   questions[m].questions[j].allowMultiAnswerMode = this.props.showData[
            //     pattern.questionPatternId
            //   ].structure.groups[j].structure.flowInfo.allowMultiAnswerMode;
            // } else {
            questions[m].questions[j].allowMultiAnswerMode = 'N';
          }

          if (patternGroups[j].pattern.hints) {
            questions[m].questions[j].hints = patternGroups[j].pattern.hints[0];
          }

          questions[m].questions[j].type = patternGroups[j].pattern.questionPatternType;
          questions[m].questions[j].index = Number(j);

          questions[m].questions[j].status = 0;
          questions[m].questions[j].answerStatus = 'N';

          questions[m].questions[j].pageSplit = 'N';

          //获取小题id
          questions[m].questions[j].qid = [];
          questions[m].questions[j].rate = [];
          if (patternGroups[j].pattern.questionPatternType == 'TWO_LEVEL') {
            data.paperInstance[m].questions[0].data.groups[j].data.subQuestion.map(item => {
              questions[m].questions[j].rate.push(getSubRate(item.id, rateList))
              questions[m].questions[j].qid.push(item.id);
            })
          } else {
            questions[m].questions[j].qid.push(data.paperInstance[m].questions[0].data.groups[j].id);
            questions[m].questions[j].rate.push(getSubRate(data.paperInstance[m].questions[0].data.groups[j].id, rateList))
          }

          questions[m].questions[j].subs = [];

          let patternComplex = patternGroups[j].pattern;
          if (patternComplex.sequenceNumber) {
            questions[m].questions[j].subs = patternComplex.sequenceNumber[0];
          } else {
            for (let l = 0; l < Number(patternComplex.mainPatterns.questionCount); l++) {
              //每道题型的大题个数
              if (patternComplex.questionPatternType == 'NORMAL') {
                questions[m].multipleQuestionPerPage = 'Y';
                if (j != 0) {
                  //获取上个题型最大题号
                  let maxLength = questions[m].questions[Number(j) - 1].subs.length;
                  let beforeNum = Number(
                    questions[m].questions[Number(j) - 1].subs[maxLength - 1]
                  );

                  questions[m].questions[j].subs.push(beforeNum + (Number(l) + 1));
                } else {
                  questions[m].questions[j].subs = [Number(l) + 1];
                }
              } else if (patternComplex.questionPatternType == 'TWO_LEVEL') {


                let subQuestionCount = patternComplex.mainPatterns.subQuestionCount; //二层题型小题个数

                for (let k = 0; k < Number(subQuestionCount); k++) {
                  if (j != 0) {
                    let maxLength = questions[m].questions[Number(j) - 1].subs.length;
                    let beforeNum = Number(
                      questions[m].questions[Number(j) - 1].subs[maxLength - 1]
                    );
                    questions[m].questions[j].subs.push(beforeNum + (Number(k) + 1));
                  } else {
                    questions[m].questions[j].subs.push(Number(k) + 1);
                  }
                }
              }
            }
          }
        }
      } else {
        //普通，二层题型拼装数据
        questions[m].questions = new Array(Number(pattern.mainPatterns.questionCount));

        for (let j = 0; j < Number(pattern.mainPatterns.questionCount); j++) {
          questions[m].questions[j] = {};
          questions[m].questions[j].type = pattern.questionPatternType;
          questions[m].questions[j].index = Number(j);

          if (pattern.hints) {
            questions[m].questions[j].hints = pattern.hints[j];
          }
          if (showData && showData[pattern.questionPatternId]) {
            //允许合并答题
            //   questions[m].questions[j].allowMultiAnswerMode = this.props.showData[
            //     pattern.questionPatternId
            //   ].structure.flowInfo.allowMultiAnswerMode;
            // } else {
            questions[m].questions[j].allowMultiAnswerMode = 'N';//不允许合并答题
          }
          questions[m].questions[j].qid = [];
          questions[m].questions[j].rate = [];
          if (pattern.questionPatternType == 'NORMAL') {
            questions[m].questions[j].rate.push(getSubRate(data.paperInstance[m].questions[j].id, rateList))
            questions[m].questions[j].qid = data.paperInstance[m].questions[j].id
            //普题型分页
            if (pattern.pageSplit) {
              for (let pageIndex in pattern.pageSplit) {
                if (pattern.pageSplit[pageIndex] == j) {
                  questions[m].questions[j].pageSplit = 'Y';
                  break;
                } else {
                  questions[m].questions[j].pageSplit = 'N';
                }
              }
            } else {
              questions[m].questions[j].pageSplit = 'N';
            }
          } else {
            questions[m].questions[j].pageSplit = 'N';
            data.paperInstance[m].questions[j].data.subQuestion.map((item) => {
              questions[m].questions[j].qid.push(item.id)
              questions[m].questions[j].rate.push(getSubRate(item.id, rateList))
            })
          }
          questions[m].questions[j].answerStatus = 'N';
          questions[m].questions[j].status = 0;

          if (pattern.sequenceNumber) {
            questions[m].questions[j].subs = pattern.sequenceNumber[j];
          } else {
            if (pattern.questionPatternType == 'NORMAL') {
              questions[m].multipleQuestionPerPage = 'Y';
              questions[m].questions[j].subs = [Number(j) + 1 + ''];
            } else if (pattern.questionPatternType == 'TWO_LEVEL') {
              let subQuestionCount = pattern.subQuestionPatterns[j].subQuestionCount;
              if (subQuestionCount == 0) {
                subQuestionCount = pattern.mainPatterns.subQuestionCount;
              }
              questions[m].questions[j].subs = [];

              for (let k = 0; k < Number(subQuestionCount); k++) {
                if (j != 0) {
                  let maxLength = questions[m].questions[Number(j) - 1].subs.length;
                  let beforeNum = Number(
                    questions[m].questions[Number(j) - 1].subs[maxLength - 1]
                  );
                  questions[m].questions[j].subs.push(beforeNum + (Number(k) + 1) + '');
                } else {
                  questions[m].questions[j].subs.push(Number(k) + 1 + '');
                }
              }
            }
          }
        }
      }
    } else if (paperInstance[i].type == 'SPLITTER') {
      //分隔页
      let splitter = paperInstance[i].splitter;
      questions[m] = {};
      questions[m].index = m;
      questions[m].type = paperInstance[i].type;
      questions[m].label = splitter.content;
      questions[m].multipleQuestionPerPage = 'N';
      questions[m].questions = [];
      questions[m].questions[0] = {};
      questions[m].questions[0].index = 0;
      questions[m].questions[0].type = paperInstance[i].type;
      questions[m].questions[0].status = 0;
      questions[m].questions[0].pageSplit = 'N';
      questions[m].questions[0].answerStatus = 'N';
    } else if (paperInstance[i].type == 'RECALL') {
      //回溯
      let recall = paperInstance[i].recall;
      questions[m] = {};
      questions[m].index = m;
      questions[m].type = paperInstance[i].type;
      questions[m].label = 'recall';
      questions[m].questions = [];
    }
  }
  master.mains = questions;
  console.log("masterData", master)
  return master;
}

