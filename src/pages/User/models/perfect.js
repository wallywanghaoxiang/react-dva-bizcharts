/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-18
 * Time: PM 13:29
 * Explain: 完善个人资料
 *
 * */
import {
  editTeacherBasic,
  verifyStudentInfo,
  queryAllBoundStudentInfo,
} from '@/services/api';
import { message } from 'antd';

export default {
  namespace: 'perfect',
  state: {
    queryAllBoundStudent: [],
  },

  effects: {
    // 【AUTH-009】 更新个人信息 - 除了密码
    * editTeacherInfo({ payload, callback }, { call }) {
      const { responseCode, data } = yield call(editTeacherBasic, payload);
      if (responseCode !== '200' || data == null) return;
      if (callback) callback(responseCode);
    },
    // 【CAMPUS-108】 验证学生绑定信息
    * verifyStudentInfo({ payload, callback }, { call }) {
      const res = yield call(verifyStudentInfo, payload);
      if (callback) callback(res);
    },
    // 【CAMPUS-109】 查询所有已经绑定的学生信息
    * queryAllBoundStudentInfo({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(queryAllBoundStudentInfo, payload);
      if (responseCode !== '200' || data == null) {
        message.warning(data);
        return;
      };
      yield put({
        type: 'saveData',
        payload: {
          queryAllBoundStudent: data,
        },
      });
      if (callback) callback(data);
    },
  },

  reducers: {
    saveData(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
