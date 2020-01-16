import { getNoticeList, getNoticeUnreadInfo, getNoticeInfo, updateNoticeState, deleteNoticeByIds, deleteNoticeByAccountId } from '@/services/api';
import constant from '../constant';

const { NOTICE_TAB_KEYS } = constant;

export default {
  namespace: 'notice',
  state: {
    activeTabKey: NOTICE_TAB_KEYS.ALL, // 当前活动的tab
    noticePagination: {
      total: 0,                        // 任务总条数
      pages: 0,                        // 总页数
      pageIndex: 1,                    // 当前页
      pageSize: 10,                    // 每页条数
    },
    unreadNoticeInfo: null,            // 未读信息
    noticeList: null,                  // 消息列表
    noticeInfo: null,                  // 消息详情
  },
  effects: {
    // NOTICE-103：查询站内信未读数量
    *getNoticeList({ payload }, { call, put, select }) {
      // const { pageIndex, pageSize } = yield select(state => state.notice.noticePagination);
      const resp = yield call(getNoticeList, {
        ...payload,
        // pageIndex: payload.pageIndex || pageIndex,
        pageSize: 10
      });

      yield put({
        type: 'saveNoticeList',
        payload: resp.data
      });

      return resp;
    },
    // NOTICE-103：查询站内信未读数量
    *getNoticeUnreadInfo({ payload }, { call, put }) {
      const resp = yield call(getNoticeUnreadInfo, payload);
      yield put({
        type: 'saveUnreadNoticeInfo',
        payload: resp.data
      });
      return resp;
    },
    // NOTICE-104：获取站内信详情
    *getNoticeInfo({ payload }, { call, put }) {
      const resp = yield call(getNoticeInfo, payload);
      yield put({
        type: 'saveNoticeInfo',
        payload: resp.data
      });
      return resp;
    },
    // NOTICE-105：消息收件箱状态更新
    *updateNoticeState({ payload }, { call, put }) {
      const resp = yield call(updateNoticeState, payload);
      if (resp.responseCode === '200') {
        yield put({
          type: 'saveUpdateNoticeState',
          payload,
        });
        yield put({
          type: 'getNoticeUnreadInfo',
          payload: { accountId: localStorage.uid }
        });
      }
      return resp;
    },
    // NOTICE-106：消息收件箱删除
    *deleteNoticeByIds({ payload }, { call }) {
      const resp = yield call(deleteNoticeByIds, payload);
      return resp;
    },
    // NOTICE-107：消息收件箱清空
    *deleteNoticeByAccountId({ payload }, { call }) {
      const resp = yield call(deleteNoticeByAccountId, payload);
      return resp;
    }
  },
  reducers: {
    clearState: () => {
      return {
        activeTabKey: NOTICE_TAB_KEYS.ALL, // 当前活动的tab
        noticePagination: {
          total: 0,                        // 任务总条数
          pages: 0,                        // 总页数
          pageIndex: 1,                    // 当前页
          pageSize: 10,                    // 每页条数
        },
        // unreadNoticeInfo: null,         // 未读信息
        noticeList: null,                  // 消息列表
        noticeInfo: null,                  // 消息详情
      }
    },
    clearInfoState: (state) => {
      return {
        ...state,
        noticeInfo: null,                  // 消息详情
      }
    },
    setActiveTabKey: (state, { payload }) => {
      return {
        ...state,
        activeTabKey: payload.activeTabKey
      }
    },
    saveNoticeList: (state, { payload }) => {
      const { total, pages, current, records } = payload;
      return {
        ...state,
        noticePagination: {
          ...state.noticePagination,
          pageIndex: parseInt(current),
          total,
          pages
        },
        noticeList: records
      }
    },
    saveUnreadNoticeInfo: (state, { payload }) => ({
      ...state,
      unreadNoticeInfo: payload
    }),
    saveNoticeInfo: (state, { payload }) => ({
      ...state,
      noticeInfo: payload
    }),
    saveUpdateNoticeState: (state, { payload }) => {
      const { messageSendIds, readStatus, recommendStatus } = payload;
      const { noticeList } = state;
      noticeList.forEach(n => {
        if (messageSendIds.indexOf(n.id) >= 0) {
          n.readStatus = readStatus;
          n.recommendStatus = recommendStatus;
        }
      });
      return {
        ...state,
        noticeList: [...state.noticeList]
      }
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname.indexOf("/notice/list") === -1) {
          dispatch({ type: 'clearState', });
        }

        // 查询站内信未读数量
        if (localStorage.access_token && localStorage.access_token !== 'undefined' && pathname.indexOf('/exception/500') === -1) {
          dispatch({
            type: 'getNoticeUnreadInfo',
            payload: {
              accountId: localStorage.uid
            }
          })
        }
      });
    },
  }
}
