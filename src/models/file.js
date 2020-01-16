import { fetchPaperFileUrl,getUserAvatar,getUserAccountId } from '@/services/api';

export default {
  namespace: 'file',

  state: {
    fileInfo:null,
    userImgInfo:'',
    userImgPath:'',
  },

  effects: {
    // 老方式 获取文件
    *file({ payload,callback }, { call, put }) {
      const response = yield call(fetchPaperFileUrl,payload);
      const { responseCode,data } = response;
      if (responseCode !== '200') return;
      if (callback) {
          callback(data);
      }
      yield put({
        type: 'saveFile',
        payload: data,
      });
    },

    // 新方式 用户头像 
    *avatar({ payload,callback }, { call, put }) {
      const response = yield call(getUserAvatar,payload);
      const { responseCode,data } = response;
      if (responseCode !== '200') return;
      if (callback) {
          callback(data);
      }
      yield put({
        type: 'saveUserImg',
        payload: data,
      });
    },
    // 更新用户头像地址
    *updateAvatarPath({ payload }, { put }) {
      yield put({
        type: 'saveUserImgPath',
        payload: payload.path,
      });
    },
    // 获取用户accountId 用于获取头像
    *getAccountId({ payload,callback }, { call, put }) {
      const response = yield call(getUserAccountId,payload);
      const { responseCode,data } = response;
      if (responseCode !== '200') return;
      if (callback) {
          callback(data);
      }
    }
    
  },

  reducers: {
    saveFile(state, action) {
      return {
        ...state,
        fileInfo: action.payload,
      };
    },
    saveUserImg(state, action) {
      return {
        ...state,
        userImgInfo:action.payload,
        userImgPath: action.payload.path,
      };
    },
    saveUserImgPath(state, action) {
      return {
        ...state,
        userImgPath: action.payload,
      };
    },
    
  },
};
