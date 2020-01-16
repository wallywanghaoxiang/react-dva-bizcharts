import { getUnBindCampus} from '@/services/api';

export default {
  namespace: 'invitecampus',
  state: {
    invitecampusRes: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getUnBindCampus, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },  
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        invitecampusRes: action.payload,
      };
    },
  },
};
