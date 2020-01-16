import {
  getCampusConfigInfo,
  updateCampusInfo,
  updateEduPhase,
  getAllCampusManager,
  addCampusManager,
  getAllSubject,
  deleteCampusManager,
  getAllGrade,
  getAllGradeByTeacher,
  getClassByGrade,
  getTeacherList,
  queryClass,
  bingClassManager,
  classSwap,
  dissolutionNaturalClass,
  startClassSwap,
  getTeacheClassList,
  bingTeachingClassManager,
  dissolutionTeachClass,
  getTeachingTeacherList,
  getSubjectTeacherList,
} from '@/services/api';

import { message } from 'antd';

export default {
  namespace: 'campusmanage',
  state: {
    campusConfigInfo: null,
    allSubject: [], // 校区学科
    gradList: [], // 年级列表
    naturalClassList: [], // 班级列表
    teachClassList: [], // 行政班列表
    classDicList: [], // 班级数据字典
    teacherList: [], // 教師列表
    total: 0, // 数据条数
    teachingTeacherList: [], // 教学班教师列表
    teachingTotal: 0,
    current: 0, // 当前页数
    classSwapInfo: null, // 编辑异动情况
    subjectTeacherList: [], // 学科管理员列表
  },

  effects: {
    *campusConfigInfo({ payload, callback }, { call, put }) {
      const response = yield call(getCampusConfigInfo, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
        yield put({
          type: 'saveCampusConfigInfo',
          payload: response,
        });
      }
    },
    *updateCampusConfigInfo({ payload, callback }, { call }) {
      const response = yield call(updateCampusInfo, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *updateClassEduPhase({ payload, callback }, { call }) {
      const response = yield call(updateEduPhase, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *campusManager({ payload, callback }, { call }) {
      const response = yield call(getAllCampusManager, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *addSubjectManager({ payload, callback }, { call }) {
      const response = yield call(addCampusManager, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *allSubject({ payload, callback }, { call, put }) {
      const response = yield call(getAllSubject, payload);
      const { responseCode, data } = response;
      if (callback) {
        callback(response);
      }
      if (responseCode !== '200') return;
      yield put({
        type: 'saveSubject',
        payload: data,
      });
    },
    *deleteSubjectManager({ payload, callback }, { call }) {
      const response = yield call(deleteCampusManager, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },

    *allGrade({ payload, callback }, { call, put }) {
      let response;
      if (payload.teacherId) {
        response = yield call(getAllGradeByTeacher, payload);
      } else {
        response = yield call(getAllGrade, payload);
      }

      const { responseCode, data } = response;
      if (responseCode !== '200') return;
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'saveGrade',
        payload: data,
      });
    },

    *naturalClass({ payload, callback }, { call, put }) {
      const response = yield call(getClassByGrade, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') return;
      if (callback) {
        callback(data);
      }
      yield put({
        type: 'saveNaturalClass',
        payload: data,
      });
    },
    // 行政班老师列表
    *teacherList({ payload, callback }, { call, put }) {
      const response = yield call(getTeacherList, payload);
      const { responseCode, data } = response;

      if (responseCode !== '200') {
        message.warning(data);
        return;
      }

      if (callback) {
        callback(response);
      }

      yield put({
        type: 'saveTeacherList',
        payload: data,
      });
    },

    // 教学班老师列表
    *teachingTeacherList({ payload, callback }, { call, put }) {
      const response = yield call(getTeachingTeacherList, payload);
      const { responseCode, data } = response;

      if (responseCode !== '200') {
        message.warning(data);
        return;
      }

      if (callback) {
        callback(response);
      }

      yield put({
        type: 'saveTeachingTeacherList',
        payload: data,
      });
    },

    // 学科管理员老师列表
    *subjectTeacherList({ payload, callback }, { call, put }) {
      const response = yield call(getSubjectTeacherList, payload);
      const { responseCode, data } = response;

      if (responseCode !== '200') {
        message.warning(data);
        return;
      }

      if (callback) {
        callback(response);
      }

      yield put({
        type: 'saveSubjectTeacherList',
        payload: data,
      });
    },

    *classDic({ payload }, { call, put }) {
      const response = yield call(queryClass, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') return;
      yield put({
        type: 'saveClassDic',
        payload: data,
      });
    },
    *bingNaturalClassManager({ payload, callback }, { call }) {
      const response = yield call(bingClassManager, payload);

      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *classSwap({ payload, callback }, { call, put }) {
      const response = yield call(classSwap, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      if (callback && data !== null) {
        callback(response);
      }
      yield put({
        type: 'saveClassSwapInfo',
        payload: data,
      });
    },
    *dissolutionNaClass({ payload, callback }, { call }) {
      const response = yield call(dissolutionNaturalClass, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *startClassSwap({ payload, callback }, { call }) {
      const response = yield call(startClassSwap, payload);
      const { responseCode } = response;
      if (responseCode !== '200') return;
      if (callback) {
        callback(response);
      }
    },
    *teacheClassList({ payload, callback }, { call, put }) {
      const response = yield call(getTeacheClassList, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      if (callback) {
        callback(data);
      }
      yield put({
        type: 'saveTeachClass',
        payload: data,
      });
    },
    *bingTeachingClassManager({ payload, callback }, { call }) {
      const response = yield call(bingTeachingClassManager, payload);
      const { responseCode } = response;
      if (responseCode !== '200') return;
      if (callback) {
        callback(response);
      }
    },
    *dissolutionTeachClass({ payload, callback }, { call }) {
      const response = yield call(dissolutionTeachClass, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
  },

  reducers: {
    save(state) {
      return {
        ...state,
      };
    },

    saveCampusConfigInfo(state, action) {
      return {
        ...state,
        campusConfigInfo: action.payload.data,
      };
    },
    saveSubject(state, action) {
      return {
        ...state,
        allSubject: action.payload,
      };
    },
    saveGrade(state, action) {
      return {
        ...state,
        gradList: action.payload,
      };
    },
    saveNaturalClass(state, action) {
      return {
        ...state,
        naturalClassList: action.payload,
      };
    },
    saveTeachClass(state, action) {
      return {
        ...state,
        teachClassList: action.payload,
      };
    },
    saveTeacherList(state, action) {
      return {
        ...state,
        teacherList: action.payload.records,
        total: action.payload.total,
      };
    },

    saveTeachingTeacherList(state, action) {
      return {
        ...state,
        teachingTeacherList: action.payload.records,
        teachingTotal: action.payload.total,
      };
    },

    saveSubjectTeacherList(state, action) {
      return {
        ...state,
        subjectTeacherList: action.payload.records,
      };
    },

    saveClassDic(state, action) {
      return {
        ...state,
        classDicList: action.payload,
      };
    },
    saveClassSwapInfo(state, action) {
      return {
        ...state,
        classSwapInfo: action.payload,
      };
    },
  },
};
