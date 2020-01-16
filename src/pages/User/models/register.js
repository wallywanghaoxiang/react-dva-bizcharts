import { fakeRegister,getValidateCode } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { message } from 'antd';

export default {
  namespace: 'register',

  state: {
    RegisterData: undefined,
  },

  effects: {
    *validateCode({ payload,callback }, { call, put }) {
      const response = yield call(getValidateCode, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *submit({ payload,callback }, { call, put }) {
      const response = yield call(fakeRegister, payload);
      yield put({
        type: 'registerHandle',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
      // if (response && response.responseCode === '200') {
      //   reloadAuthorized();
      //   yield put(
      //     routerRedux.push({
      //       pathname: '/user/login'
      //     })
      //   )
      // }
      
    },
  },

  reducers: {
    registerHandle(state, { payload }) {
      // setAuthority('user');
      return {
        ...state,
        RegisterData: payload,
      };
    },
  },
};
