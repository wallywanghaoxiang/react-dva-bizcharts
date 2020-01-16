import {
  getInpectTaskList,
  deleteTask,
  editTaskName,
  getExamStudents,
  tsmkTaskDetail,
  tsmkInspection,
  getTsmkPaperSapshot,
  fetchPaperShowData,
  tsmkExamReport
} from '@/services/api';
import { message } from 'antd';


export default {
  namespace: 'inspect',
  state: {
    taskData: {
      total: 0,            // 任务总条数
      records: [],          // 任务列表数据
      // 列表请求参数
      type: '',            // 任务类型： 不限、本班考试、多班联考、课堂练习
      status: '',          // 任务状态： 不限、未开始、进行中、评分中、已评分、已发布
      time: 0,            // 时间： 本学期、本月、本周
      classType: '',         // 班级类型：不限、行政班、教学班、学习小组
      filterWord: '',      // 搜索条件
      pageIndex: 1,       // 当前页
      pageSize: 5,      // 每页条数
    },
    examStudents: [], // 考试学生名单

    inspectInfo: null,   // 课后训练任务-检查详情
    paperData: null,     // 试卷快照
    paperShowData: null, // 试卷结构
    examReport: null,     // 学生整卷试做报告
  },

  effects: {
    *taskList({ payload }, { call, put, select }) {
      const teacherId = localStorage.getItem('teacherId');
      const campusId = localStorage.getItem('campusId');
      const { type, status, time, classType, filterWord, pageIndex, pageSize } = yield select(state => state.inspect.taskData);
      const params = {
        type,
        status,
        time,
        teacherId,
        campusId,
        classType,
        filterWord,
        pageIndex,
        pageSize,
        ...payload
      };

      const changeParams = { ...payload };
      yield put({
        type: 'saveTaskData',
        payload: changeParams,
      });

      const response = yield call(getInpectTaskList, params);
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
          pageSize: data.size
        },
      });
    },
    *taskDetail({ payload, callback }, { call }) {
      const response = yield call(tsmkTaskDetail, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      if (callback) {
        callback(response);
      }
    },
    *editTaskName({ payload, callback }, { call }) {
      const response = yield call(editTaskName, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      if (callback) {
        callback();
      }
    },
    *deleteTask({ payload, callback }, { call }) {
      const response = yield call(deleteTask, payload);
      // const resJson = JSON.parse(response);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      if (callback) {
        callback();
      }
    },
    *examStudents({ payload, callback }, { call, put }) {
      const response = yield call(getExamStudents, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      yield put({
        type: 'saveExamStudents',
        payload: data,
      });
      if (callback) {
        callback(data);
      }
    },
    // 课后训练 - 检查
    *tsmkInspection({ payload }, { call, put }) {
      const resp = yield call(tsmkInspection, payload);
      yield put({
        type: 'saveInspection',
        payload: resp.data
      })
      return resp;
    },
    // 试卷快照 tsmk report-013
    *getPaperData({ payload }, { call, put }) {
      const resp = yield call(getTsmkPaperSapshot, payload);
      yield put({
        type: 'savePaperData',
        payload: resp.data
      });
      return resp;
    },
    // 试卷结构 content 010 任务报告
    *fetchPaperShowData({ payload }, { call, put }) {
      const resp = yield call(fetchPaperShowData, payload);
      yield put({
        type: 'savePaperShowData',
        payload: resp.data
      });
      return resp;
    },
    // 试做报告
    *tsmkExamReport({ payload }, { call, put }) {
      const resp = yield call(tsmkExamReport, payload);
      yield put({
        type: 'saveExamReport',
        payload: resp.data
      });
      return resp;
    }
  },

  reducers: {
    saveTaskData: (state, { payload }) => ({
      ...state,
      taskData: {
        ...state.taskData,
        ...payload
      }
    }),

    saveExamStudents: (state, { payload }) => ({
      ...state,
      examStudents: payload
    }),
    saveInspection(state, action) {
      return {
        ...state,
        inspectInfo: action.payload
      }
    },
    savePaperData(state, action) {
      return {
        ...state,
        paperData: action.payload
      }
    },
    savePaperShowData(state, action) {
      return {
        ...state,
        paperShowData: action.payload,
      };
    },
    saveExamReport(state, action) {
      return {
        ...state,
        examReport: action.payload
      }
    },
    // 组件销毁清空学生答题详情
    clearExamReport(state, action) {
      return {
        ...state,
        examReport: null
      }
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname.indexOf("/examination/inspect") === -1) {
          dispatch({
            type: 'saveTaskData',
            payload: {
              type: '',            // 任务类型： 不限、本班考试、多班联考、课堂练习
              status: '',          // 任务状态： 不限、未开始、进行中、评分中、已评分、已发布
              time: 0,            // 时间： 本学期、本月、本周
              classType: '',         // 班级类型：不限、行政班、教学班、学习小组
              filterWord: '',      // 搜索条件
              pageIndex: 1,       // 当前页
              pageSize: 5,      // 每页条数
            }
          });
        }
      });
    },
  },
};
