import {
  batchImportTeachers,
  editTeacher,
  fetchTeacherList,
  deleteTeacher,
  changeStatus,
  checkMobileExist,
} from '@/services/api';

export default {
  namespace: 'teachermanage',
  state: {
    batchimportstudentsRes: [],
    teacherInfoList: [],
    filterTeacherInfoList:[],
  },

  effects: {
    *checkMobile({ payload, callback }, { call }) {
      const response = yield call(checkMobileExist, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *importTeacher({ payload, callback }, { call }) {
      const response = yield call(batchImportTeachers, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *fetchTeacherList({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(fetchTeacherList, payload);
      if (responseCode !== '200' || data == null) return;
      if(payload.filterWord==='') {
        yield put({
          type: 'saveTeacherList',
          payload: data,
        });
      } else {
        yield put({
          type: 'saveFilterTeacherList',
          payload: data,
        });
      }
     
      if (callback) callback(data);
    },
    *edit({ payload, callback }, { call }) {
      const response = yield call(editTeacher, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *delete({ payload, callback }, { call }) {
      const response = yield call(deleteTeacher, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *changeStatus({ payload, callback }, { call }) {
      const response = yield call(changeStatus, payload);
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
    saveFilterTeacherList(state, action) {
      return {
        ...state,
        filterTeacherInfoList:action.payload

      };
    },
    saveTeacherList(state, action) {
      return {
        ...state,
        teacherInfoList: action.payload,
        filterTeacherInfoList:action.payload

      };
    },
  },
};
