/* eslint-disable camelcase */
/* eslint-disable consistent-return */
/* eslint-disable no-lonely-if */
/* eslint-disable no-shadow */
/* eslint-disable no-plusplus */
/* eslint-disable no-loop-func */
/* eslint-disable guard-for-in */
/* eslint-disable no-const-assign */
/* eslint-disable no-restricted-syntax */
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import {
  getCustomPaperById,
  deleteCustomPaperById,
  getCustomPaperByConditions,
  getGradesByTeacherId,
  queryPaperDetails,
  getAllGrade,
  fetchPaperShowData,
  queryPaperResource,
  queryYears,
  queryDifficult,
  queryPaperTemplates,
  getDefaultPatternDetail,
  publishPaper,
} from '@/services/api';
import {
  QUESTION_VERSION,
  ANNUAL,
  toChinesNum,
  autoCreatePatternInfoText,
} from '@/frontlib/utils/utils';

/**
 * @Author    tina.zhang
 * 自由组卷页面
 * @DateTime  2019-10-11
 */
export default {
  namespace: 'papergroup',
  state: {
    grade: [], // 年级范围
    years: {}, // 学年
    difficulty: [], // 难易度
    currentPaperDetail: {}, // 当前选择试卷的paperData
    paperSelected: [],
    typeList: {},
    paperList: [], // 选择试卷列表数据
    showData: {}, // 试卷展示数据
    defaultPatternData: {}, // 我的试题篮的题目默认配置
    paperQestion: {}, // 题目实体数据
    questionIds: [], // 题目id
    paperData: {}, // 我的试题篮生成预览试卷的paperData
    taskfilterData: [], // 适用范围
    taskData: {
      total: 0, // 任务总条数
      records: [], // 任务列表数据
      // 列表请求参数
      type: '', // 任务类型： 不限、本班考试、多班联考、课堂练习
      status: '', // 任务状态： 不限、未开始、进行中、评分中、已评分、已发布
      time: 0, // 时间： 本学期、本月、本周
      classType: '', // 班级类型：不限、行政班、教学班、学习小组
      filterWord: '', // 搜索条件
      pageIndex: 1, // 当前页
      pageSize: 10, // 每页条数
      paper_scope: '', // 出卷范围
      grade: '', // 年级
    },
    customPaperData: {}, // 自由组卷paperData
    customShowData: {}, // 自由组卷showData
    preViewShowData: {},
  },

  effects: {
    *fetchGradesByTeacherId({ payload }, { call, put }) {
      // 查询适用范围
      const response = yield call(getGradesByTeacherId, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveTaskfilterData',
        payload: response && response.data,
      });
    },

    *fetchPaper({ payload }, { call, put }) {
      // 查询试卷列表
      const params = {
        teacherId: localStorage.getItem('teacherId'),
        ...payload,
      };
      const response = yield call(queryPaperResource, params);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'savePaper',
        payload: response && response.data,
      });
    },

    *fetchGrade({ payload }, { call, put, select }) {
      const { campusList = [] } = yield select(state => state.login);
      let gradeLists = [];
      let item = {};
      campusList.forEach(element => {
        if (element.teacherId === localStorage.getItem('teacherId')) {
          item = element;
          gradeLists = element.gradeList || [];
        }
      });
      if (gradeLists.length > 0) {
        yield put({
          type: 'saveGrade',
          payload: gradeLists,
        });
      } else {
        // 查询班级列表
        if (!item.isAdmin) {
          yield put({
            type: 'saveGrade',
            payload: [],
          });
        } else {
          const response = yield call(getAllGrade, payload);
          const { responseCode, data } = response;
          if (responseCode !== '200' || data == null) return;
          yield put({
            type: 'saveGrade',
            payload: response && response.data,
          });
        }
      }
    },

    *fetchPaperSelected({ payload }, { put }) {
      // 保存所选试卷
      const response = payload.selectedPaper;
      yield put({
        type: 'savePaperSelected',
        payload: response,
      });
    },
    *fetchPaperTemplates({ payload }, { call, put }) {
      // 查询我的试卷列表
      const response = yield call(queryPaperTemplates, payload);
      yield put({
        type: 'saveTemplates',
        payload: response && response.data,
      });
    },
    *fetchPaperDetail({ payload }, { call, put }) {
      // 点击试卷查询试卷详情
      const response = yield call(queryPaperDetails, payload);
      let idList = '';
      if (response && response.data) {
        for (const i in response.data.paperInstance) {
          if (response.data.paperInstance[i].pattern) {
            idList = `${idList},${response.data.paperInstance[i].pattern.questionPatternId}`;
          }
        }
        const idLists = {
          idList: idList.slice(1, idList.length),
        };
        const response1 = yield call(fetchPaperShowData, idLists);
        yield put({
          type: 'savePaperDetail',
          paperData: response && response.data,
          showData: response1 && response1.data,
        });
      }
    },

    *fetchYears({ payload }, { call, put }) {
      // 查询年度
      const response = yield call(queryYears, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveYears',
        payload: response && response.data,
      });
    },
    *fetchDifficult({ payload }, { call, put }) {
      // 查询难度
      const response = yield call(queryDifficult, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveDifficult',
        payload: response && response.data,
      });
    },

    *clearFilterPrams({ payload }, { put }) {
      yield put({
        type: 'initData',
        payload,
      });
    },

    *addPaperQuestion({ payload }, { call, put, select }) {
      // 选择题目组卷
      const { paperQestion, questionIds, preViewShowData, defaultPatternData } = yield select(
        state => state.papergroup
      );
      const idLists = {
        idList: `${payload.questionPatternId}`,
      };
      const params = {
        mongoId: `${payload.questionPatternId}`,
      };

      // 题目渲染json调用已有API（CONTENT-010）
      const response = yield call(fetchPaperShowData, idLists);

      // 默认结构值调用新增的API（CONTENT-013）
      const response1 = yield call(getDefaultPatternDetail, params);

      if (response1.responseCode !== '200') {
        message.error(response1.data);
        return 'fail';
      }

      if (payload.data.patternType !== 'COMPLEX') {
        if (!paperQestion[payload.questionPatternId]) {
          paperQestion[payload.questionPatternId] = [];
          preViewShowData[payload.questionPatternId] = response.data[payload.questionPatternId];
          defaultPatternData[payload.questionPatternId] = response1.data;
        }
        paperQestion[payload.questionPatternId].push(payload);
        questionIds.push(payload.id);
      } else {
        if (!paperQestion[payload.id]) {
          paperQestion[payload.id] = [];
          preViewShowData[payload.questionPatternId] = response.data[payload.questionPatternId];
          defaultPatternData[payload.id] = response1.data;
        }
        paperQestion[payload.id].push(payload);
        questionIds.push(payload.id);
      }
      yield put({
        type: 'savepaperQestion',
        payload: paperQestion,
        questionIds,
        defaultPatternData,
        preViewShowData,
      });
      return 'success';
    },

    *delPaperQuestion({ payload }, { put, select }) {
      // 移除题目组卷
      const { questionIds, paperQestion } = yield select(state => state.papergroup);

      if (payload.data.patternType === 'COMPLEX') {
        const groupArr = paperQestion[payload.id];
        if (groupArr.length === 1) {
          delete paperQestion[payload.id];
        }
      } else {
        if (paperQestion[payload.questionPatternId].length === 1) {
          delete paperQestion[payload.questionPatternId];
        } else {
          paperQestion[payload.questionPatternId] = paperQestion[payload.questionPatternId].filter(
            item => item.id !== payload.id
          );
        }
      }

      const index = questionIds.indexOf(payload.id);
      if (index > -1) {
        questionIds.splice(index, 1);
      }

      yield put({
        type: 'savepaperQestion',
        payload: paperQestion,
        questionIds,
      });
    },

    *publishPaperData({ payload }, { put, call, select }) {
      const { paperData } = yield select(state => state.papergroup);
      paperData.name = payload.name;
      const params = {
        annual: ANNUAL,
        campusId: localStorage.getItem('campusId'),
        customPaper: null,
        grade: payload.grade,
        name: payload.name,
        paperScope: payload.paper_scope,
        paperSourceData: paperData,
        teacherId: localStorage.getItem('teacherId'),
      };

      const response = yield call(publishPaper, params);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
      } else {
        yield put({
          type: 'delPaperQuestions',
        });

        return 'SUCCESS';
      }
    },

    *taskList({ payload }, { call, put, select }) {
      const teacherId = localStorage.getItem('teacherId');
      const { filterWord, pageIndex, pageSize, paper_scope, grade } = yield select(
        state => state.papergroup.taskData
      );
      const params = {
        teacherId,
        pageIndex,
        pageSize,
        keyword: filterWord,
        paper_scope,
        grade,
        ...payload,
      };

      const changeParams = { ...payload };
      yield put({
        type: 'saveTaskData',
        payload: changeParams,
      });

      const response = yield call(getCustomPaperByConditions, params);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      yield put({
        type: 'saveTaskData',
        payload: {
          pageIndex: data.current,
          records: data.records,
          total: data.total,
          pageSize: data.size,
        },
      });
    },

    *delCustomPaperById({ payload }, { call }) {
      // 删除我的组卷
      const response = yield call(deleteCustomPaperById, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
      } else {
        return data;
      }
    },

    *fetchCustomPaperDetail({ payload }, { call, put }) {
      // 点击查询自由组卷详情
      const response = yield call(getCustomPaperById, payload);
      let idList = '';
      if (response && response.data) {
        for (const i in response.data.paperInstance) {
          if (response.data.paperInstance[i].pattern) {
            idList = `${idList},${response.data.paperInstance[i].pattern.questionPatternId}`;
          }
        }
        const idLists = {
          idList: idList.slice(1, idList.length),
        };
        const response1 = yield call(fetchPaperShowData, idLists);
        yield put({
          type: 'saveCustomPaperDetail',
          customPaperData: response && response.data,
          customShowData: response1 && response1.data,
        });
      }
    },
  },

  reducers: {
    initData(state) {
      const { taskData } = state;
      taskData.type = '';
      taskData.paper_scope = '';
      taskData.grade = '';
      taskData.filterWord = '';
      return {
        ...state,
        currentPaperDetail: '',
        paperList: [],
        taskData,
      };
    },

    saveTaskData: (state, { payload }) => ({
      ...state,
      taskData: {
        ...state.taskData,
        ...payload,
      },
    }),

    savePaper(state, action) {
      return {
        ...state,
        paperList: action.payload,
      };
    },

    savepaperQestion(state, action) {
      return {
        ...state,
        paperQestion: action.payload,
        questionIds: action.questionIds,
        defaultPatternData: action.defaultPatternData || state.defaultPatternData,
        preViewShowData: action.preViewShowData || state.preViewShowData,
      };
    },

    savePaperSelected(state, action) {
      return {
        ...state,
        paperSelected: action.payload,
      };
    },

    savePaperDetail(state, action) {
      return {
        ...state,
        currentPaperDetail: action.paperData,
        showData: action.showData,
      };
    },

    saveCustomPaperDetail(state, action) {
      return {
        ...state,
        customPaperData: action.customPaperData,
        customShowData: action.customShowData,
      };
    },

    saveGrade(state, action) {
      return {
        ...state,
        grade: action.payload,
      };
    },
    saveYears(state, action) {
      return {
        ...state,
        years: action.payload,
      };
    },
    saveDifficult(state, action) {
      return {
        ...state,
        difficulty: action.payload,
      };
    },

    saveTemplates(state, action) {
      return {
        ...state,
        templates: action.payload,
      };
    },

    savePaperQuestions(state, action) {
      return {
        ...state,
        paperQestion: action.payload,
      };
    },

    delPaperQuestions(state, action) {
      if (action.payload) {
        // 删除某一大题
        const { questionIds, paperQestion } = state;
        paperQestion[action.payload.questionPatternId].forEach(currentValue => {
          const index = questionIds.indexOf(currentValue.id);
          if (index > -1) {
            questionIds.splice(index, 1);
          }
        });

        delete paperQestion[action.payload.questionPatternId];
        return {
          ...state,
          paperQestion, // 题目实体数据
          questionIds, // 题目id
        };
      }
      return {
        ...state,
        paperQestion: {}, // 题目实体数据
        questionIds: [], // 题目id
      };
    },

    savePaperData(state) {
      const { paperQestion, defaultPatternData } = state;
      let { paperData } = state;

      let paperFullMark = 0;
      let paperQuestionCount = 0;
      const myDate = new Date();
      const str =
        myDate.getFullYear() +
        `0${myDate.getMonth() + 1}`.slice(-2) +
        `0${myDate.getDate()}`.slice(-2);
      paperData = {
        dataVersion: QUESTION_VERSION,
        name: str + formatMessage({ id: 'app.text.englishTestPaper', defaultMessage: '英语试卷' }),
        templateName: formatMessage({
          id: 'app.text.freedomGroupVolume',
          defaultMessage: '自由组卷',
        }),
        description: formatMessage({
          id: 'app.text.freedomGroupVolume',
          defaultMessage: '自由组卷',
        }),
        coverRate: 100,
        allowChooseQuestion: 'Y',
        difficultLevel: '',
        difficultLevelValue: '',
        fullMark: paperFullMark, // 计算
        annual: ANNUAL,
        annualValue: '',
        tags: '',
        paperScope: '', // "SCOPE_NORMAL",
        paperScopeValue: '',
        textbookId: '',
        textbookName: '',
        grade: '',
        gradeValue: '',
        volumn: '',
        volumnValue: '',
        unitId: '',
        unitName: '',
        isExamination: 'N',
        publishDate: '',
        questionCount: paperQuestionCount,
        config: {
          lockForm: 'Y',
          showOrdinal: 'Y',
          mainGuideSinglePage: 'N',
          recordHints: {
            start: 'Y',
            end: 'Y',
          },
        },
        paperHead: {
          paperHeadName: '练习卷',
          paperHeadAudio: '',
          paperHeadAudioTime: '0',
          paperHeadDelay: '5',
          paperHeadNavTime: '5',
        },
      };

      const paperInstance = [];
      let num = 0;

      for (const key in paperQestion) {
        num += 1;
        const itemObj = {
          questions: paperQestion[key],
          recall: null,
          splitter: null,
          type: 'PATTERN',
        };
        const { pattern } = defaultPatternData[key];
        if (pattern.questionPatternType === 'COMPLEX') {
          // 复合题型生成题型
          itemObj.pattern = {
            questionPatternId: pattern.questionPatternId,
            questionPatternName: pattern.questionPatternName,
            questionPatternType: pattern.questionPatternType,
            questionPatternCode: pattern.questionPatternCode,
            questionPatternDescription: pattern.questionPatternDescription,
            questionPatternInstanceName: pattern.questionPatternInstanceName,
            mainPatterns: {
              ...pattern.mainPatterns,
              questionPatternInstanceSequence: `${toChinesNum(num)}、`,
              showQuestionPatternInstanceName: 'Y',
              questionCount: 0,
              fullMark: 0,
              questionPatternInstanceName: pattern.questionPatternInstanceName,
              answerGuideAudio: pattern.answerGuideAudio,
              answerGuideAudioTime: pattern.answerGuideAudioTime,
              answerGuideDelay: pattern.answerGuideDelay,
              answerGuideText: pattern.answerGuideText,
            },
            subQuestionPatterns: [],
          };

          const { groups } = pattern;
          let complexNum = 0;
          let complexfullMark = 0;
          const groupArr = groups.map((itemTemp, index) => {
            let comfullMark = 0;
            const temp = {};
            const { pattern } = itemTemp;
            let complexNumberArr = [];
            complexNum += 1;
            if (pattern.questionPatternType === 'NORMAL') {
              complexNumberArr = [[`${complexNum}`]];
              comfullMark += Number(pattern.mainPatterns.questionMark);
            } else {
              const arr2 = [];
              const sublen = paperQestion[key][0].data.groups[index].data.subQuestion.length;
              for (let i = complexNum; i < complexNum + sublen; i++) {
                arr2.push(`${i}`);
              }
              complexNum += sublen - 1;
              complexNumberArr.push(arr2);
              comfullMark += Number(pattern.mainPatterns.subQuestionMark) * sublen;
            }
            temp.pattern = {
              questionPatternId: pattern.questionPatternId,
              questionPatternName: pattern.questionPatternName,
              questionPatternType: pattern.questionPatternType,
              questionPatternCode: pattern.questionPatternCode,
              questionPatternDescription: pattern.questionPatternDescription,
              subjectiveAndObjective: pattern.subjectiveAndObjective,
              answerType: pattern.answerType,
              indexRandom: 'Y',
              optionRandom: 'Y',
              sequenceNumber: complexNumberArr,
              mainPatterns: {
                ...pattern.mainPatterns,
                questionPatternInstanceSequence: `第${toChinesNum(index + 1)}节、`,
                showQuestionPatternInstanceName: 'Y',
                questionCount: 1,
                fullMark: comfullMark,
                subQuestionCount: complexNumberArr[0].length,
              },
              subQuestionPatterns: [],
            };
            complexfullMark += comfullMark;
            return temp;
          });
          itemObj.pattern.groups = groupArr;
          itemObj.pattern.mainPatterns.fullMark = complexfullMark;
          itemObj.pattern.mainPatterns.questionPatternInstanceHint = autoCreatePatternInfoText(
            itemObj,
            true
          );
          paperFullMark += complexfullMark;
          paperQuestionCount += 1;
        } else {
          // 普通、二层题型生成题型
          let fullMark = 0;
          let subQuestionNum = 1;

          const sequenceNumberArr = paperQestion[key].map(item => {
            const arr1 = [];
            if (item.data.patternType !== 'NORMAL') {
              let len = subQuestionNum + 1;
              if (item.data.subQuestion.length !== 0) {
                len = subQuestionNum + item.data.subQuestion.length - 1;
              }
              for (let i = subQuestionNum; i <= len; i++) {
                arr1.push(`${i}`);
              }
              subQuestionNum = len + 1;
            } else {
              arr1.push(`${subQuestionNum}`);
              subQuestionNum += 1;
            }
            return arr1;
          });

          const NumberArr = [];
          for (const key in sequenceNumberArr) {
            NumberArr.push(sequenceNumberArr[key]);
          }

          if (pattern.subQuestionPatterns) {
            for (let i = 0; i < NumberArr.length; i++) {
              if (!pattern.subQuestionPatterns[i]) {
                if (pattern.questionPatternType === 'NORMAL') {
                  pattern.subQuestionPatterns[i] = {
                    questionMark: pattern.mainPatterns.questionMark,
                  };
                  fullMark += Number(pattern.mainPatterns.questionMark);
                } else {
                  pattern.subQuestionPatterns[i] = {
                    subFullMark: Number(pattern.mainPatterns.subQuestionMark) * NumberArr.length,
                    subQuestionMark: Number(pattern.mainPatterns.subQuestionMark),
                    subQuestionCount: NumberArr.length,
                  };
                  fullMark += Number(pattern.mainPatterns.subQuestionMark) * NumberArr.length;
                }
              } else {
                if (pattern.questionPatternType === 'NORMAL') {
                  fullMark += Number(pattern.subQuestionPatterns[i].questionMark);
                } else {
                  fullMark += Number(pattern.subQuestionPatterns[i].subFullMark);
                }
              }
            }
          } else {
            if (pattern.questionPatternType === 'TWO_LEVEL') {
              pattern.subQuestionPatterns = [];
              for (let m = 0; m < NumberArr.length; m++) {
                pattern.subQuestionPatterns[m] = {
                  subFullMark: Number(pattern.mainPatterns.subQuestionMark) * NumberArr[m].length,
                  subQuestionMark: Number(pattern.mainPatterns.subQuestionMark),
                  subQuestionCount: NumberArr[m].length,
                };
                fullMark += Number(pattern.mainPatterns.subQuestionMark) * NumberArr[m].length;
              }
            } else {
              fullMark = Number(pattern.mainPatterns.questionMark) * NumberArr.length;
            }
          }

          paperFullMark += fullMark;
          paperQuestionCount += NumberArr.length;

          itemObj.pattern = {
            questionPatternId: pattern.questionPatternId,
            questionPatternName: pattern.questionPatternName,
            questionPatternType: pattern.questionPatternType,
            questionPatternCode: pattern.questionPatternCode,
            questionPatternDescription: pattern.questionPatternDescription,
            subjectiveAndObjective: pattern.subjectiveAndObjective,
            answerType: pattern.answerType,
            indexRandom: 'Y',
            optionRandom: 'Y',
            sequenceNumber: NumberArr,
            mainPatterns: {
              ...pattern.mainPatterns,
              questionPatternInstanceSequence: `${toChinesNum(num)}、`,
              showQuestionPatternInstanceName: 'Y',
              questionCount: NumberArr.length,
              fullMark,
              questionMark: pattern.subQuestionPatterns ? 0 : pattern.mainPatterns.questionMark,
              subQuestionMark: pattern.subQuestionPatterns
                ? 0
                : pattern.mainPatterns.subQuestionMark,
            },
            subQuestionPatterns: pattern.subQuestionPatterns || [],
          };
          itemObj.pattern.mainPatterns.questionPatternInstanceHint = autoCreatePatternInfoText(
            itemObj
          );
        }
        paperInstance.push(itemObj);
      }

      paperData.paperInstance = paperInstance;
      paperData.fullMark = paperFullMark;
      paperData.questionCount = paperQuestionCount;
      return {
        ...state,
        paperData,
      };
    },

    saveTaskfilterData(state, action) {
      return {
        ...state,
        taskfilterData: action.payload,
      };
    },
  },
};
