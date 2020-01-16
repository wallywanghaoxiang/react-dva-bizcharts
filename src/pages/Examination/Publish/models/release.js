/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-lonely-if */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import {
  getCustomPaperById,
  getCustomPaperByConditions,
  queryPaperDetails,
  getAllGrade,
  fetchPaperShowData,
  queryPaperResource,
  queryPaper,
  queryClassDetail,
  queryYears,
  queryDifficult,
  queryGrade,
  queryPaperTemplates,
  publishTask,
} from '@/services/api';
import { MatchUnitType } from '@/frontlib/utils/utils';

/**
 * @Author    tina
 * 发布页面的数据处理
 * @DateTime  2018-09-21
 */
export default {
  namespace: 'release',

  state: {
    grade: [],
    years: {},
    difficulty: [],
    distribution: [], // 分卷方式
    strategy: [], // 考试策略
    rectify: [], // 人工纠偏
    distributeType: 'DT_1',
    examType: 'ET_1',
    rectifyType: 'NOTHING',
    selectedTeacher: {}, // 代课教师
    currentPaperDetail: {},
    paperSelected: [],
    typeList: {},
    paperList: [],
    myPaperList: [], // 我的组卷
    classList: [],
    myClassList: [],
    JointyClassList: [],
    responseCode: '200',
    responseMsg: '',
    taskType: '', // 第一步保存所选的类型
    checkStudentList: [],
    joinStudentList: [],
    showData: {},
    choosedNum: 0,
    mystudentListNum: 0,
    selectedClass: [],
    templates: [],
    publishSaveData: {},
    classType: 'NATURAL_CLASS',
    gradeIndex: '',
    gradeValue: formatMessage({
      id: 'app.examination.inspect.screen.unlimited',
      defaultMessage: '不限',
    }),
    exerciseBeginType: 'EBT_1', // TT_5模式下：
    exerciseEndType: 'EET_1', // TT_5模式下：
    exerciseType: 'EXAM_MODEL', // TT_5模式下： 练习模式
    publishDate: '', // 练习开始时间
    endDate: '', // 练习结束时间
    isEdit: false,
    tabkey: '1', // 当前试卷类型
  },

  effects: {
    //   *saveStudentList({ payload }, { call, put }) {//保存我的班级,分层班,行政班里选择的学生列表
    //     yield put({
    //         type: 'changeStudentList',
    //         checkStudentList: payload.StudentList
    //     });
    //   },
    //   *saveJoinStudentList({ payload }, { call, put }) {//保存联考班级相关学生列表
    //     yield put({
    //         type: 'changeJoinStudentList',
    //         joinStudentList: payload.joinStudentLists
    //     });
    //   },
    *saveTaskType({ payload }, { put }) {
      // 保存选择的发布类型
      yield put({
        type: 'changeTaskType',
        taskType: payload.taskType,
      });
    },

    *fetchSaveTask({ payload }, { call }) {
      // 第三步确认发布任务
      const response = yield call(publishTask, payload);

      return response;
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
        tabkey: '1',
      });
    },
    *fetchClass({ payload }, { call, put }) {
      // 查询班级列表
      const response = yield call(queryClassDetail, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveClass',
        payload: response && response.data,
      });
    },
    *fetchAffterClass({ payload }, { call, put }) {
      // 课后训练查询班级列表
      const response = yield call(queryClassDetail, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveAffterClass',
        payload: response && response.data,
      });
    },
    *fetchGrade({ payload }, { call, put, select }) {
      const { campusList = [] } = yield select(state => state.login);
      let item = {};
      let gradeLists = [];
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
        if (!item.isAdmin) {
          yield put({
            type: 'saveGrade',
            payload: [],
          });
        } else {
          // 查询班级列表
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
        response.data.paperType = 'STANDARD_PAPER';
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

    *savePublishTaskData({ payload }, { put }) {
      // 保存发布数据
      yield put({
        type: 'savePublishData',
        payload,
      });
    },

    *saveSelectedClass({ payload }, { put }) {
      // 保存班级
      yield put({
        type: 'saveClassData',
        payload,
      });
    },

    *saveClassInfo({ payload }, { put }) {
      // 保存发布数据
      yield put({
        type: 'saveClassInfoData',
        payload,
      });
    },
    *editTaskName({ payload }, { put }) {
      // 保存任务名称
      yield put({
        type: 'saveTaskName',
        payload,
      });
    },
    *clearFilterPrams({ payload }, { put }) {
      yield put({
        type: 'saveFilterPrams',
        payload,
      });
    },
    *fetchMyPaper({ payload }, { call, put }) {
      const params = {
        ...payload,
      };

      const response = yield call(getCustomPaperByConditions, params);
      const { responseCode } = response;
      if (responseCode !== '200') {
        return;
      }
      yield put({
        type: 'saveMyPaper',
        payload: response && response.data,
        tabkey: '2',
      });
    },
    *fetchCustomPaperDetail({ payload }, { call, put }) {
      // 点击查询自由组卷详情
      const response = yield call(getCustomPaperById, payload);
      let idList = '';
      if (response && response.data) {
        // response.data.id = payload.id;
        response.data.paperType = 'CUSTOM_PAPER';
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
  },

  reducers: {
    initData(state) {
      return {
        ...state,
        currentPaperDetail: '',
      };
    },
    changeJoinStudentList(state, action) {
      return {
        ...state,
        joinStudentList: action.joinStudentList,
      };
    },
    changeStudentList(state, action) {
      return {
        ...state,
        checkStudentList: action.checkStudentList,
      };
    },
    changeTaskType(state, action) {
      return {
        ...state,
        taskType: action.taskType,
        checkStudentList: [],
        joinStudentList: [],
        paperList: [],
      };
    },
    saveTaskData(state, action) {
      return {
        ...state,
        responseCode: action.payload,
      };
    },
    // 课后训练获取班级列表
    saveAffterClass(state, action) {
      return {
        ...state,
        classList: action.payload,
      };
    },
    saveClass(state, action) {
      return {
        ...state,
        classList: action.payload,
        distributeType: 'DT_1',
        examType: 'ET_1',
        rectifyType: 'NOTHING',
        selectedTeacher: {}, // 代课教师
        currentPaperDetail: '',
        typeList: {},
        paperList: [],
        choosedNum: 0,
        mystudentListNum: 0,
        selectedClass: [],
        templates: [],
        publishSaveData: {},
        classType: 'NATURAL_CLASS',
        distribution: [], // 分卷方式
        strategy: [], // 考试策略
        rectify: [], // 人工纠偏
      };
    },

    initPaperData(state) {
      return {
        ...state,
        paperSelected: [],
      };
    },
    saveClassInfoData(state, action) {
      const gradeList = action.payload.grade;
      let number = 0;
      let mystudentListNum = 0;
      const myteacherId = localStorage.getItem('teacherId');
      for (const i in gradeList.classList) {
        if (gradeList.classList[i].isChoosed && gradeList.classList[i].choosedNum) {
          number += gradeList.classList[i].choosedNum;
          if (gradeList.classList[i].teacherId === myteacherId) {
            mystudentListNum += gradeList.classList[i].choosedNum;
          }
        }

        if (gradeList.classList[i].learningGroupList) {
          for (const n in gradeList.classList[i].learningGroupList) {
            if (gradeList.classList[i].learningGroupList[n].isChoosed) {
              number += gradeList.classList[i].learningGroupList[n].choosedNum;
              if (gradeList.classList[i].learningGroupList[n].teacherId === myteacherId) {
                mystudentListNum += gradeList.classList[i].learningGroupList[n].choosedNum;
              }
            }
          }
        }
      }
      return {
        ...state,
        classList: action.payload,
        choosedNum: number,
        mystudentListNum,
      };
    },

    saveMyClass(state, action) {
      return {
        ...state,
        myClassList: action.payload,
      };
    },
    saveJointClass(state, action) {
      return {
        ...state,
        JointyClassList: action.payload,
      };
    },
    savePaper(state, action) {
      return {
        ...state,
        paperList: action.payload,
      };
    },

    savePaperSelected(state, action) {
      return {
        ...state,
        paperSelected: action.payload,
      };
    },
    saveMyPaper(state, action) {
      return {
        ...state,
        myPaperList: action.payload,
      };
    },
    savetabKey(state, action) {
      return {
        ...state,
        tabkey: action.payload.key,
      };
    },
    savePaperDetail(state, action) {
      return {
        ...state,
        currentPaperDetail: action.paperData,
        showData: action.showData,
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
    saveType(state, action) {
      return {
        ...state,
        typeList: action.payload,
      };
    },
    saveDistribution(state, action) {
      return {
        ...state,
        distribution: action.payload,
      };
    },
    saveStrategy(state, action) {
      return {
        ...state,
        strategy: action.payload,
      };
    },
    saveRectify(state, action) {
      return {
        ...state,
        rectify: action.payload,
      };
    },

    saveExamSetting(state, action) {
      return {
        ...state,
        distributeType: action.distributeType,
        examType: action.examType,
        rectifyType: action.rectifyType,
      };
    },

    saveTeacherInfo(state, action) {
      return {
        ...state,
        selectedTeacher: { ...action.payload, campusId: localStorage.getItem('campusId') },
      };
    },
    saveClassData(state, action) {
      return {
        ...state,
        selectedClass: action.payload.selectedClass,
        gradeIndex: action.payload.gradeIndex,
        gradeValue: action.payload.gradeValue,
      };
    },
    initexercise(state, action) {
      return {
        ...state,
        exerciseBeginType: action.payload.exerciseBeginType, // TT_5模式下：
        exerciseEndType: action.payload.exerciseEndType, // TT_5模式下：
        exerciseType: action.payload.exerciseType, // TT_5模式下： 练习模式
        publishDate: action.payload.publishDate, // 练习开始时间
        endDate: action.payload.endDate, // 练习结束时间
      };
    },
    saveTemplates(state, action) {
      return {
        ...state,
        templates: action.payload,
      };
    },
    saveClassType(state, action) {
      return {
        ...state,
        classType: action.payload,
      };
    },

    // 课后练习-发布时间类型
    savePublishTimeType(state, action) {
      return {
        ...state,
        exerciseBeginType: action.payload,
      };
    },

    // 课后练习-发布时间
    savePublishDateStr(state, action) {
      return {
        ...state,
        publishDate: action.payload,
      };
    },

    // 课后练习-截止时间类型
    saveEndTimeType(state, action) {
      return {
        ...state,
        exerciseEndType: action.payload,
      };
    },

    // 课后练习-截止时间
    saveEndDateStr(state, action) {
      return {
        ...state,
        endDate: action.payload,
      };
    },

    // 课后练习-模式设置
    saveExerciseType(state, action) {
      return {
        ...state,
        exerciseType: action.payload,
      };
    },

    // 课后练习-保存任务名称
    saveChooseNum(state, action) {
      return {
        ...state,
        choosedNum: action.payload,
      };
    },

    // 课后练习-保存任务名称
    saveTaskName(state, action) {
      const saveData = state.publishSaveData;
      saveData.name = action.payload.name;
      return {
        ...state,
        publishSaveData: saveData,
        isEdit: true,
      };
    },

    savePublishData(state, action) {
      console.log('---------action:', action);
      const paperList = [];
      for (const i in state.paperSelected) {
        paperList.push({
          paperId: state.paperSelected[i].id,
          name: state.paperSelected[i].name,
          gradeValue: state.paperSelected[i].gradeValue,
          paperTime: state.paperSelected[i].paperTime,
          fullMark: state.paperSelected[i].fullMark,
          paperName: state.paperSelected[i].paperName,
          templateName: state.paperSelected[i].templateName,
          paperScopeValue: state.paperSelected[i].paperScopeValue,
          unitId: state.paperSelected[i].unitId,
          scopeName: MatchUnitType(state.paperSelected[i]),
          paperType: state.paperSelected[i].paperType,
        });
      }

      let str = '';
      if (state.selectedClass.length > 0) {
        if (state.selectedClass.length === 1) {
          str = state.selectedClass[0].className || state.selectedClass[0].name;
        } else {
          if (state.selectedClass[0].classType === 'LEARNING_GROUP') {
            str = `${state.selectedClass[0].name}等${state.selectedClass.length}个组`;
          } else {
            str = `${state.selectedClass[0].className}等${state.selectedClass.length}个班`;
          }
        }
      }

      switch (state.taskType) {
        case 'TT_1':
          str += '模考';
          break;
        case 'TT_2':
          str += '训练';
          break;
        case 'TT_3':
          str += '联考';
          break;
        case 'TT_5':
          str += '课后训练';
          break;
        default:
          break;
      }
      const myDate = new Date();

      str =
        str +
        myDate.getFullYear() +
        `0${myDate.getMonth() + 1}`.slice(-2) +
        `0${myDate.getDate()}`.slice(-2) +
        `0${myDate.getHours()}`.slice(-2) +
        `0${myDate.getMinutes()}`.slice(-2);

      // const fina = action.payload&&action.payload.finallyData;
      const saveData = {
        // name:fina ? state.publishSaveData.name : str,
        name: state.isEdit ? state.publishSaveData.name : str,
        campusId: localStorage.getItem('campusId'),
        type: state.taskType,
        classType: state.classType,
        status: state.status,
        classList: state.selectedClass,
        paperList,
      };

      let teacherArr = [
        {
          teacherId: localStorage.getItem('teacherId'),
          campusId: localStorage.getItem('campusId'),
          teacherName: localStorage.getItem('userName'),
          type: 'MASTER',
        },
      ];
      let suTeacherId = '';
      if (state.selectedTeacher.campusId) {
        suTeacherId = state.selectedTeacher.teacherId;
        teacherArr.push({ ...state.selectedTeacher, type: 'SUB' });
      }

      if (state.taskType === 'TT_3') {
        const newArr = [];
        for (const i in state.selectedClass) {
          newArr.push({
            teacherId: state.selectedClass[i].teacherId,
            campusId: state.selectedClass[i].campusId,
            teacherName: state.selectedClass[i].teacherName,
            type: 'TEACHER',
          });
        }

        const result = newArr.reduce((init, current) => {
          const maxCode = current.teacherId;
          const index = `${maxCode}`;
          if (init.length === 0 || !init[index]) {
            init[index] = current;
          }
          return init;
        }, []);

        const teacherArr2 = [];
        for (const i in result) {
          teacherArr2.push(result[i]);
        }

        teacherArr = teacherArr.concat(teacherArr2);
        console.log(teacherArr);
      }

      saveData.teacher = teacherArr;

      if (state.taskType !== 'TT_2' || state.taskType !== 'TT_5') {
        saveData.distributeType = state.distributeType;
        saveData.examType = state.examType;
        saveData.rectifyType = state.rectifyType;
      }

      if (state.taskType === 'TT_5') {
        // 课后练习

        // 1.发布时间
        if (state.exerciseBeginType === 'custom') {
          // 自选模式
          const date = state.publishDate.replace(/-/g, '/');
          const timestamp = new Date(date).getTime();
          saveData.exerciseBeginTime = timestamp;
        } else {
          saveData.exerciseBeginTime = state.exerciseBeginType;
        }

        // 2.截止时间
        if (state.exerciseEndType === 'custom') {
          // 自选模式
          const date1 = state.endDate.replace(/-/g, '/');
          const timestamp1 = new Date(date1).getTime();
          saveData.exerciseEndTime = timestamp1;
        } else {
          saveData.exerciseEndTime = state.exerciseEndType;
        }

        // 3.模式设置
        saveData.exerciseType = state.exerciseType;

        saveData.distributeType = '';
        saveData.examType = '';
        saveData.rectifyType = '';
      }

      return {
        ...state,
        publishSaveData: saveData,
      };
    },

    clearAffterExeciseData(state, action) {
      return {
        ...state,
        paperSelected: [],
        selectedClass: [],
        choosedNum: 0,
        exerciseBeginType: 'EBT_1', // TT_5模式下：
        exerciseEndType: 'EET_1', // TT_5模式下：
        exerciseType: 'EXAM_MODEL', // TT_5模式下： 练习模式
        publishDate: '', // 练习开始时间
        endDate: '', // 练习结束时间
        isEdit: false,
      };
    },

    saveFilterPrams(state) {
      return {
        ...state,
        gradeIndex: '', // 年级
        gradeValue: '不限',
      };
    },

    saveSelectPaper(state) {
      return {
        ...state,
        paperSelected: [],
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname.indexOf('/examination/publish/affterclasstrain') === -1) {
          // dispatch({
          //   type: 'saveSelectPaper',
          //   payload: {}
          // });
        }
      });
    },
  },
};
