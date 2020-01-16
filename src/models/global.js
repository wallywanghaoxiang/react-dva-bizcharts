import router from "umi/router";
import { queryNotices } from '@/services/api';
import checkBrowser from "@/utils/checkBrowser";

export default {
  namespace: 'global',

  state: {
    collapsed: false,
    notices: [],
    browserInfo : {        // 页面信息
      browser : "",        // 当期的浏览器
      version : 0,        // 浏览器版本
      userAgent : "",      // 浏览器的具体信息
    }
  },

  effects: {
    *fetchNotices(_, { call, put, select }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      const unreadCount = yield select(
        state => state.global.notices.filter(item => !item.read).length
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: data.length,
          unreadCount,
        },
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      const unreadCount = yield select(
        state => state.global.notices.filter(item => !item.read).length
      );
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: count,
          unreadCount,
        },
      });
    },
    *changeNoticeReadState({ payload }, { put, select }) {
      const notices = yield select(state =>
        state.global.notices.map(item => {
          const notice = { ...item };
          if (notice.id === payload) {
            notice.read = true;
          }
          return notice;
        })
      );
      yield put({
        type: 'saveNotices',
        payload: notices,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: {
          totalCount: notices.length,
          unreadCount: notices.filter(item => !item.read).length,
        },
      });
    },
  },

  reducers: {
    updateState(state,{payload}){
      return {
        ...state,
        ...payload
      }
    },
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
    getCommitID(){
      window.COMMIT_ID = ENV_CONFIG.commit_id;
    },
    bindGppStore(){
      // 开发环境下存在，为了方便系统调试
      if( process.env.NODE_ENV === "development" ){
        const {_store:store} = window.g_app;
        window.Dispatch = store.dispatch;
        window.GetState = ()=>store.getState();
      }
    },
    checkBrower({dispatch}){
      // 对当期的浏览器进行检测，并保存相关信息
      const browserInfo = checkBrowser();
      dispatch({
        type : "updateState",
        payload : { browserInfo }
      });

      // 匹配浏览器，如果浏览器不满足需求，则直接跳转到浏览器建议页面( 由于没有babel低版本浏览器，所有用其它方式实现此方法 )
      // const { browser, version } = browserInfo
      // if( !browser ||
      //       !["IE","chrome","firefox" ].includes(browser) ||
      //         (browser === "IE" && version < 10) ||
      //           (browser === "chrome" && version < 30) ||
      //             (browser === "firefox" && version < 30)
      // ){
      //   router.push({pathname: `/browser/browserVersion`});
      // }
    },
    filterEntryPage(){
      // 过滤一下，第一次进入的页面
      const list = [
        'browser/TrainBrowserVersion'   // 课后训练版本不支持的提示页
      ];
      if( list.some(item=>window.location.href.includes(item)) ){
        router.replace("/");
      }
    }
  },
};
