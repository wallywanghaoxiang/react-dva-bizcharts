import { userVerifyPassword,isRegister } from '@/services/api';
import { message } from 'antd';

export default {
  namespace: 'findpassword',
  state: {
  
  },

  effects: {
    *fetch({ payload,callback }, { call }) {
      const response = yield call(userVerifyPassword, payload);
      const { responseCode,data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      } 
      if (callback) {
        callback();
      }

    },
    *isRegister({ payload,callback }, { call }) {
      const response = yield call(isRegister, payload);
      const { responseCode,data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      } 
      if (callback) {
        callback(data)
      }
    },
  },

  reducers: {
    
  },
};
