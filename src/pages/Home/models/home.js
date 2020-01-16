import { getStatistics, getInpectTaskList, getQuitStudent,getTeacherInfoList,handleQuitApply,getTeacherClassSwap,getCampusConfigInfo,getSummary } from '@/services/api';
import { message } from 'antd';

export default {
  namespace: 'home',

  state: {
    statistics: {
      naturalClassNum: 0,
      studentNum: 0,
      teacherNum: 0,
      teachingClassNum: 0
    }, // 统计数据
    learnSituationList: [], // 学情分析数据
    quitStudentList: [], // 退学学生列表
    teacherInfoList:[], // 教师信息列表
    teacherClassSwapInfo:null, // 老师班级异动情况
    campusInfo:null, // 校区信息
  },

  effects: {
    *statistics({ payload }, { call, put }) {
      const response = yield call(getStatistics, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      yield put({
        type: 'saveStatistics',
        payload: data,
      });
    },
    *learnSituation({ payload }, { call, put }) {
      const response = yield call(getInpectTaskList, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
      }
      yield put({
        type: 'saveLearnSituList',
        payload: data,
      });
    },
    *quitStudent({ payload,callback }, { call, put }) {
      const response = yield call(getQuitStudent, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
      }
      yield put({
        type: 'saveStudentList',
        payload: data,
      });
      if (callback) {
        callback(data);
      }
    },    
    *teacherInfo({ payload }, { call, put }) {
      const response = yield call(getTeacherInfoList, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
      }
      yield put({
        type: 'saveTeacherInfoList',
        payload: data,
      });
    },
    *quitApply({ payload,callback }, { call }) {
      const response = yield call(handleQuitApply, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
      }
      if (callback) {
        callback();
      }
    },

    *teacherClassSwap({ payload }, { call,put }) {
      const response = yield call(getTeacherClassSwap, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
      }
      yield put({
        type: 'saveTeacherClassSwap',
        payload: data,
      });
    },

    *campusInfo({ payload,callback }, { call,put }) {
      const response = yield call(getCampusConfigInfo, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
      }
      yield put({
        type: 'saveCampusInfo',
        payload: data,
      });
      if (callback) {
        callback(data);
      }
    },
    *getSummaryData({ payload,callback }, { call }) {
      const response = yield call(getSummary, payload);
      const { responseCode} = response;      
      if (responseCode) {
        callback(responseCode);
      }
    },

  },

  reducers: {
    saveStatistics(state, { payload }) {
      if (payload) {
        return {
          ...state,
          statistics: payload,
        };
      }
      return {
        ...state
      }
    },
    saveLearnSituList(state, { payload }) {
      return {
        ...state,
        learnSituationList: payload.records,
      };
    },
    saveStudentList(state, { payload }) {
      return {
        ...state,
        quitStudentList: payload,
      };
    },
    saveTeacherInfoList(state, { payload }) {
      return {
        ...state,
        teacherInfoList: payload,
      };
    },
    saveTeacherClassSwap(state, { payload }) {
      return {
        ...state,
        teacherClassSwapInfo: payload,
      };
    },
    saveCampusInfo(state, { payload }) {
      return {
        ...state,
        campusInfo: payload,
      };
    },
  },
};
