import {
  getPremissionVersion,
  // getPremissionList,
  getStandardList,
} from '@/services/user';
/**
 * 版本权限相关列表
 */
const defaultPermissionList = {
  V_SINGLE_CLASS_EXAM: false, // 本班考试
  V_CLASSROOM_EXERCISES: false, // 课堂练习
  V_MULTI_CLASS_EXAM: false, // 多班联考
  V_CLASS_AFTER_TRAINING: false, // 课后训练
  V_SPECIAL_TRAINING: false, // 专项训练
  V_SCHOOL_EXAM: false, // 校级统考
  V_UNITED_EXAM: true, // 区级统考
  V_CLASSROOM_REVIEW: false, // 课堂讲评
  V_FREEDOM_TRAINING: false, // 自主训练
  V_ANSWER_DETAIL: false, // 答题详情
  V_CUSTOM_PAPER: false, // 自由组卷
  V_ANSWER_ANALYSIS: true, // 答案解析
  V_ADD_PACKAGE: false, // 试卷包
};

/**
 * 补全返回的权限列表
 * 由于后端值返回，开启的权限，而不显示全部权限，
 * 故补全权限
 * @param {Array} list
 */
const completePremiss = list => {
  const dataCode = list.map(item => item.code);
  return Object.keys(defaultPermissionList).reduce(
    (curr, item) => ({
      ...curr,
      [item]: dataCode.includes(item),
    }),
    {}
  );
};

export default {
  namespace: 'permission',

  state: {
    ...defaultPermissionList,
    standardList: {}, // 标准版权限列表
    professionalList: {}, // 专业版的权限列表
  },

  effects: {
    /**
     * 初始化权限功能
     * @param {*} param0
     * @param {*} param1
     */
    *initPremission({ payload }, { all, call, put }) {
      try {
        const { campusId } = payload;
        const applicationId = 'a746d06de98b4124a2f274e878c0678c';
        const [version, list] = yield all([
          call(getPremissionVersion, { campusId }),
          call(getStandardList, { applicationId }),
        ]);
        if (version.responseCode !== '200' || list.responseCode !== '200') return;

        const { tenantAuthorizeMode, subAuthType } = version.data;
        // tenantAuthorizeMode = 'RETAIL';
        // subAuthType = 'STANDARD';
        // 标准版的权限列表
        const { resourceList: standard = [] } =
          list.data.find(item => item.authTypeName === 'RETAIL-STANDARD') || {};

        // 专业版的权限列表
        const { resourceList: professional = [] } =
          list.data.find(item => item.authTypeName === 'RETAIL-PROFESSIONAL') || {};

        // 当前用户的权限列表
        const currType =
          tenantAuthorizeMode === 'RETAIL'
            ? `${tenantAuthorizeMode}-${subAuthType}`
            : tenantAuthorizeMode;
        const { resourceList: currentList = [] } =
          list.data.find(item => item.authTypeName === currType) || {};

        yield put({
          type: 'updateState',
          payload: {
            ...completePremiss(currentList),
            standardList: completePremiss(standard),
            professionalList: completePremiss(professional),
          },
        });

        // 各个权限列表不全
      } catch (e) {
        // TODO
      }
    },

    /**
     * [API]AUTH-418：获取校区授权版本
     * [API]PROXY-121：获取校区授权版本
     */
    // *getPremissionVersion({ payload }, { call, put }) {
    //   const { data } = yield call(getPremissionVersion, payload);
    //   yield put({
    //     type: 'updateState',
    //     payload: data,
    //   });
    // },

    /**
     * 请求权限的版本 标准版 | 专业版
     * [API]AUTH-400：获取校区的版本功能清单
     * @param {*} param1
     */
    // *getPremissionList({ payload }, { put, call }) {
    //   try {
    //     const { data } = yield call(getPremissionList, payload);
    //     const dataCode = data.map(item => item.code);
    //     const listObj = Object.keys(defaultPermissionList).reduce(
    //       (curr, item) => ({
    //         ...curr,
    //         [item]: dataCode.includes(item),
    //       }),
    //       {}
    //     );
    //     yield put({
    //       type: 'updateState',
    //       payload: listObj,
    //     });
    //   } catch (e) {
    //     // TODO
    //   }
    // },

    /**
     * 获取 后台 设置的标准版的 权限列表
     * @param {*} _
     * @param {*} param1
     */
    // *getStandardList(_, { call }) {
    //   try {
    //     const { data } = yield call(getStandardList, {
    //       applicationId: 'a746d06de98b4124a2f274e878c0678c',
    //     });
    //     console.log(data);
    //   } catch (e) {
    //     // TODO
    //   }
    // },
  },

  reducers: {
    // 更新 modal state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
