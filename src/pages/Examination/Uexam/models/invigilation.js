import { getOtherTeacherList } from '@/services/api';
import {
  getCampusPlaceInfos,
  getExamDateList,
  getRoomBatchStatis,
  submitInvigilations,
  cancelInvigilations,
  submitMasters,
  getCampusInvigilations,
  finishCampusInvigilation,
} from '@/services/invigilation';

// const delay = (ms) => new Promise((resolve) => {
//   setTimeout(resolve, ms);
// });

/**
 * 监考安排 model
 * @author tina.zhang
 * @date   2019-8-13 09:01:20
 */
export default {
  namespace: 'invigilation',
  state: {
    placeInfos: null, // 考点、考场等信息
    examDateList: null, // 考点日期列表
    roomBatchStatis: null, // 考场批次统计
    teacherListInfo: null, // 教师列表
    invigilationList: null, // 校区监考安排详情
  },
  effects: {
    // UEXAM-704：查看校区-考点考场批次
    *getCampusPlaceInfos({ payload }, { call, put }) {
      const resp = yield call(getCampusPlaceInfos, payload);
      yield put({
        type: 'savePlaceInfos',
        payload: resp.data,
      });
      return resp;
    },
    // UEXAM-704-1：查看日期考点是否安排教师
    *getExamDateList({ payload }, { call, put }) {
      const resp = yield call(getExamDateList, payload);
      yield put({
        type: 'saveExamDateList',
        payload: resp.data,
      });
      return resp;
    },
    // UEXAM-705：根据考点时间查询考场场次统计
    *getRoomBatchStatis({ payload }, { call, put }) {
      const resp = yield call(getRoomBatchStatis, payload);
      yield put({
        type: 'saveRoomBatchStatis',
        payload: resp.data,
      });
      return resp;
    },
    // CAMPUS-204 输入教师姓名分页搜索
    *getTeacherList({ payload }, { call, put }) {
      const resp = yield call(getOtherTeacherList, payload);
      yield put({
        type: 'saveTeacherList',
        payload: resp.data,
      });
      return resp;
    },
    // UEXAM-304：安排学校监考老师
    *submitInvigilations({ payload }, { call }) {
      const resp = yield call(submitInvigilations, payload);
      return resp;
    },
    // UEXAM-305：取消监考老师-批量
    *cancelInvigilations({ payload }, { call }) {
      const resp = yield call(cancelInvigilations, payload);
      return resp;
    },
    // UEXAM-306：设置主监考老师
    *submitMasters({ payload }, { call }) {
      const resp = yield call(submitMasters, payload);
      return resp;
    },
    // UEXAM-301：查看某学校考场监考情况
    *getCampusInvigilations({ payload }, { call, put }) {
      const resp = yield call(getCampusInvigilations, payload);
      yield put({
        type: 'saveInvigilationList',
        payload: resp.data,
      });
      return resp;
    },
    // 同上
    *getLastCampusInvigilations({ payload }, { call }) {
      const resp = yield call(getCampusInvigilations, payload);
      return resp;
    },
    // UEXAM-303：完成监考编排
    *finishCampusInvigilation({ payload }, { call }) {
      const resp = yield call(finishCampusInvigilation, payload);
      return resp;
    },
  },
  reducers: {
    clearCache() {
      return {
        placeInfos: null, // 考点、考场等信息
        examDateList: null, // 考点日期列表
        roomBatchStatis: null, // 考场批次统计
        teacherListInfo: null, // 教师列表
        invigilationList: null, // 校区监考安排详情
      };
    },
    savePlaceInfos(state, { payload }) {
      return {
        ...state,
        placeInfos: payload,
      };
    },
    saveExamDateList(state, { payload }) {
      return {
        ...state,
        examDateList: payload,
      };
    },
    saveRoomBatchStatis(state, { payload }) {
      return {
        ...state,
        roomBatchStatis: payload,
      };
    },
    saveTeacherList(state, { payload }) {
      return {
        ...state,
        teacherListInfo: payload,
      };
    },
    saveInvigilationList(state, { payload }) {
      return {
        ...state,
        invigilationList: payload,
      };
    },
  },
  subscriptions: {},
};
