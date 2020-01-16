import { 
    getTaskType,    // 任务类型
    getTaskStatus,  // 任务状态
    getTaskDate,    // 任务时间
    getClassType,   // 班级类型
    getDictionaries,
    getStuTaskStatus, // 学生端任务状态
 } from '@/services/api';

export default {
  namespace: 'dict',
  state: {
      taskType:[],
      taskStatus:[],
      taskDate:[],
      classType:[],
      stuTaskStatus:[],// 学生端任务状态
  },

  effects: {
    *taskType({ payload }, { call, put }) {
      const response = yield call(getTaskType, payload);
      const { responseCode,data } = response;
      if (responseCode !== '200') return;
      yield put({
        type: 'saveTaskType',
        payload: data,
      });
    },

    // 通用获取字典值
    *getDictionariesData({ payload }, { call, put }) {
        // payload: {type:"TASK_TYPE"}
        const response = yield call(getDictionaries, payload);
        const { responseCode,data } = response;
        if (responseCode !== '200') return;
        return data
    },
    *taskStatus({ payload }, { call, put }) {
        const response = yield call(getTaskStatus, payload);
        const { responseCode,data } = response;
        if (responseCode !== '200') return;
        yield put({
          type: 'saveTaskStatus',
          payload: data,
        });
    },
    *taskDate({ payload }, { call, put }) {
        const response = yield call(getTaskDate, payload);
        const { responseCode,data } = response;
        if (responseCode !== '200') return;
        yield put({
          type: 'saveTaskDate',
          payload: data,
        });
    },
    *classType({ payload }, { call, put }) {
        const response = yield call(getClassType, payload);
        const { responseCode,data } = response;
        if (responseCode !== '200') return;
        yield put({
          type: 'saveClassType',
          payload: data,
        });
    },

    // 学生端任务状态
    *stuTaskStatus({ payload }, { call, put }) {
        const response = yield call(getStuTaskStatus, payload);
        const { responseCode,data } = response;
        if (responseCode !== '200') return;
        yield put({
          type: 'saveStuTaskStatus',
          payload: data,
        });
    },
  },

  reducers: {
    saveTaskType(state,action) {
        return {
            ...state,
            taskType: action.payload,
        };  
    },
    saveTaskStatus(state,action) {
        return {
            ...state,
            taskStatus: action.payload,
        };  
    },
    saveTaskDate(state,action) {
        return {
            ...state,
            taskDate: action.payload,
        };  
    },
    saveClassType(state,action) {
        return {
            ...state,
            classType: action.payload,
        };  
    },
    saveStuTaskStatus(state,action) {
        return {
            ...state,
            stuTaskStatus: action.payload,
        };  
    },
  },
};
