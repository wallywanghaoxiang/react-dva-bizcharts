import {
  getRegistrationCount,
  getRegistrationInfo,
  getRegistrationResult,
  searchRegistrationResult,
  removeStudent,
  getCampusInfoList,
  getStudentInfoList,
  submitStudentList,
  clearStudentList,
  generateExamNo,
  finishRegistration
} from '@/services/registration';

// const delay = (ms) => new Promise((resolve) => {
//   setTimeout(resolve, ms);
// });

/**
 * 报名 model
 * @author tina.zhang
 * @date   2019-7-26 10:30:17
 */
export default {
  namespace: 'registration',
  state: {
    registrationCount: null,  // 报名数量统计
    registrationInfo: null,   // 报名结果信息
    registrationResult: null, // 报名结果学生列表
    searchResult: null,       // 报名搜索结果
    campusInfo: null,         // 导入学生弹窗，校区统计信息
    studentInfoList: null,    // 导入学生弹窗，学生名单

    activeClassId: null,      // 当前活动的班级ID
    selectedStudentList: [],  // 已选中学生名单
  },

  effects: {
    // UEXAM-014：报名统计-详情
    *getRegistrationCount({ payload }, { call, put }) {
      const resp = yield call(getRegistrationCount, payload);
      yield put({
        type: 'saveRegistrationCount',
        payload: resp.data
      })
      return resp;
    },
    // UEXAM-004：报名结果-按学校分组
    *getRegistrationInfo({ payload }, { call, put }) {
      const resp = yield call(getRegistrationInfo, payload);
      yield put({
        type: 'saveRegistrationInfo',
        payload: resp.data
      })
      return resp;
    },
    // UEXAM-005：按学校查询报名结果
    *getRegistrationResult({ payload }, { call, put }) {
      const resp = yield call(getRegistrationResult, payload);
      yield put({
        type: 'saveRegistrationResult',
        payload: resp.data
      })
      return resp;
    },
    // UEXAM-007：【结果】报名结果-按学生分组—分页搜索
    *searchRegistrationResult({ payload }, { call, put }) {
      const resp = yield call(searchRegistrationResult, payload);
      yield put({
        type: "saveSearchResult",
        payload: resp.data
      });
      return resp;
    },
    // UEXAM-013：删除学生
    *removeStudent({ payload }, { call }) {
      const resp = yield call(removeStudent, payload);
      return resp;
    },
    // UEXAM-008：导入名单-校区名单-跨服务
    *getCampusInfoList({ payload }, { call, put }) {
      const resp = yield call(getCampusInfoList, payload);
      if (resp.responseCode === '200' && resp.data && resp.data.length > 0) {
        const curCampus = resp.data.find(v => v.campusId === localStorage.campusId);
        if (curCampus) {
          yield put({
            type: 'saveCampusInfoList',
            payload: curCampus
          })
        }
      }
      return resp;
    },
     // 同上，用于完成报名时获取最新报名统计信息
    *getLastCampusInfoList({ payload }, { call }) {
      const resp = yield call(getCampusInfoList, payload);
      return resp;
    },
    // UEXAM-009：导入名单-学生名单-跨服务
    *getStudentInfoList({ payload }, { call, put }) {
      const resp = yield call(getStudentInfoList, payload);
      yield put({
        type: 'saveStudentInfoList',
        payload: resp.data
      })
      return resp;
    },
    // UEXAM-010：导入名单
    *submitStudentList({ payload }, { call }) {
      const resp = yield call(submitStudentList, payload);
      return resp;
    },
    // UEXAM-011：清空名单
    *clearStudentList({ payload }, { call }) {
      const resp = yield call(clearStudentList, payload);
      return resp;
    },
    // UEXAM-012：一键生成考号
    *generateExamNo({ payload }, { call }) {
      const resp = yield call(generateExamNo, payload);
      return resp;
    },
    // UEXAM-006：完成报名
    *finishRegistration({ payload }, { call }) {
      const resp = yield call(finishRegistration, payload);
      return resp;
    }
  },

  reducers: {
    clearCache(state, { payload }) {
      return {
        registrationCount: null,  // 报名数量统计
        registrationInfo: null,   // 报名结果信息
        registrationResult: null, // 报名结果学生列表
        searchResult: null,       // 报名搜索结果
        campusInfo: null,         // 导入学生弹窗，校区列表含统计信息
        studentInfoList: null,    // 导入学生弹窗，学生名单

        activeCampusId: null,     // 当前活动的校区ID
        activeClassId: null,      // 当前活动的班级ID
        selectedStudentList: [],  // 已选中学生名单
      }
    },
    saveRegistrationCount(state, { payload }) {
      return {
        ...state,
        registrationCount: payload
      };
    },
    saveRegistrationInfo(state, { payload }) {
      return {
        ...state,
        registrationInfo: payload
      };
    },
    saveRegistrationResult(state, { payload }) {
      return {
        ...state,
        registrationResult: payload
      };
    },
    saveSearchResult(state, { payload }) {
      return {
        ...state,
        searchResult: payload
      }
    },
    saveCampusInfoList(state, { payload }) {
      return {
        ...state,
        campusInfo: payload
      };
    },
    saveStudentInfoList(state, { payload }) {
      return {
        ...state,
        studentInfoList: payload
      };
    },
    /**
     * 更新当前活动的班级ID
     * @param {string} activeClassId - 校区ID
     */
    updateActiveIds(state, { payload }) {
      const { activeClassId } = payload;
      return {
        ...state,
        activeClassId
      }
    },
    /**
     * 更新已选学生名单
     * @param {Array} students  - 待操作学生列表
     * @param {string} type  - 操作类型（add:新增、remove:删除）
     */
    updateSelectedStudents(state, { payload }) {
      const { students, type, activeClassId } = payload;
      const { selectedStudentList } = state;
      let newList = [];
      if (type === 'add') {
        // 去重
        const removeRepeat = students.filter(v => !selectedStudentList.some(s => s.studentId === v.studentId));
        newList = selectedStudentList.concat(removeRepeat);
      } else if (type === 'remove') {
        newList = selectedStudentList.filter(v => students.some(s => s.studentId !== v.studentId));
      } else if (type === 'removeTransients') {
        selectedStudentList.forEach(s => {
          if (activeClassId === 'all' && s.isTransient === 'N') {
            newList.push(s);
          } else if (activeClassId !== 'all' && (s.classId !== activeClassId || s.isTransient === 'N')) {
            newList.push(s);
          }
        });
      } else if (type === 'clear') {
        selectedStudentList.forEach(s => {
          if (activeClassId !== 'all' && s.classId !== activeClassId) {
            newList.push(s);
          }
        });
      }
      return {
        ...state,
        selectedStudentList: newList
      }
    }
  },

  subscriptions: {

  }
}
