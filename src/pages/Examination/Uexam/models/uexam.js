import {
  getTaskList,
  getTaskDetail,
  getStudentList,
  getAdmissionTickets,
  getBatchInfos,
  finishUnstartBatches,
} from '@/services/uexam';
import { getCampusPlaceInfos } from '@/services/invigilation';

const delay = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

/**
 * 统考 model
 * @author tina.zhang
 * @date   2019-8-12 10:43:27
 */
export default {
  namespace: 'uexam',
  state: {
    taskList: null, // 任务列表
    taskInfo: null, // 任务信息
    campusInfo: null, // 当前校区状态信息
    studentList: null, // 考务明细（学生列表）
    admissionTickets: null, // 准考证列表
    placeInfos: null, // 考点、考场、时间等信息
    batchInfos: null, // 批次信息
    pagination: {
      filterWord: '', // 搜索条件
      pageIndex: 1, // 当前页
      pageSize: 10, // 每页条数
      total: 0, // 数据条数
    },
  },
  effects: {
    // UEXAM-701：统考首页-任务列表—分页
    getTaskList: [
      function* _getTaskList({ payload }, { select, call, put }) {
        const pagination = yield select(state => state.uexam.pagination);
        const params = {
          ...pagination,
          ...payload,
        };
        const resp = yield call(getTaskList, params);
        // yield delay(!payload.filterWord ? 3000 : 1000)
        yield put({
          type: 'saveTaskList',
          payload: {
            ...params,
            ...resp.data,
          },
        });
        return resp;
      },
      { type: 'takeLatest' },
    ],
    // UEXAM-015：单次任务详情
    *getTaskInfo({ payload }, { call, put }) {
      const resp = yield call(getTaskDetail, payload);
      yield put({
        type: 'saveTaskInfo',
        payload: resp.data,
      });
      return resp;
    },

    //! /*  ---       考务信息         --- */

    // UEXAM-109：学生编排-学生列表-分页
    *getStudentList({ payload }, { call, put }) {
      const resp = yield call(getStudentList, payload);
      yield put({
        type: 'saveStudentList',
        payload: resp.data,
      });
      return resp;
    },
    // UEXAM-109-1：准考证信息
    *getAdmissionTickets({ payload }, { call, put }) {
      const resp = yield call(getAdmissionTickets, payload);
      yield put({
        type: 'saveAdmissionTickets',
        payload: resp.data,
      });
      return resp;
    },
    // UEXAM-704：查看校区-考点考场批次
    *getCampusPlaceInfos({ payload }, { call, put }) {
      const resp = yield call(getCampusPlaceInfos, payload);
      yield put({
        type: 'savePlaceInfos',
        payload: resp.data,
      });
      return resp;
    },
    // TSMK-903：学校场次监控
    *getBatchInfos({ payload }, { call, put }) {
      const resp = yield call(getBatchInfos, payload);
      yield put({
        type: 'saveBatchInfos',
        payload: resp.data,
      });
      return resp;
    },
    // TSMK-906：结束未开始场次
    *finishUnstartBatches({ payload }, { call }) {
      const resp = yield call(finishUnstartBatches, payload);
      return resp;
    },
  },
  reducers: {
    clearPagination(state) {
      return {
        ...state,
        pagination: {
          filterWord: '', // 搜索条件
          pageIndex: 1, // 当前页
          pageSize: 10, // 每页条数
          total: 0, // 数据条数
        },
      };
    },
    clearTaskInfo(state) {
      return {
        ...state,
        taskInfo: null, // 任务信息
        campusInfo: null, // 当前校区状态信息
      };
    },
    saveTaskList(state, { payload }) {
      const { records, current, size, total, filterWord } = payload;
      return {
        ...state,
        taskList: records,
        pagination: {
          pageIndex: current,
          pageSize: size,
          total,
          filterWord,
        },
      };
    },
    saveTaskInfo(state, { payload }) {
      const { task, taskCampusList } = payload;
      return {
        ...state,
        taskInfo: task,
        campusInfo: taskCampusList.find(v => v.campusId === localStorage.campusId),
      };
    },
    saveStudentList(state, { payload }) {
      return {
        ...state,
        studentList: payload,
      };
    },
    saveAdmissionTickets(state, { payload }) {
      return {
        ...state,
        admissionTickets: payload,
      };
    },
    savePlaceInfos(state, { payload }) {
      return {
        ...state,
        placeInfos: payload,
      };
    },
    saveBatchInfos(state, { payload }) {
      return {
        ...state,
        batchInfos: payload,
      };
    },
  },
  subscriptions: {
    setup: ({ history, dispatch }) => {
      return history.listen(({ pathname }) => {
        if (pathname.indexOf('/examination/uexam') === -1) {
          dispatch({
            type: 'clearPagination',
          });
        }
      });
    },
  },
};
