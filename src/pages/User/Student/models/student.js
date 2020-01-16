import { 
    getStudentReportList1,
    getHomeList
 } from '@/services/api';
 import { message } from 'antd';


export default {
  namespace: 'student',
  state: {

      // 首页
      list:[],
      // 学情中心
      taskData:{
          total: 0,            // 任务总条数
          records:[],          // 任务列表数据
          // 列表请求参数
          type: '',            // 任务类型： 不限、本班考试、多班联考、课堂练习
          status: 'ALL',   // 默认       // 任务状态：  不限、待完成、已完成
          time: 0,            // 时间： 本学期、本月、本周
          pageIndex : 1,       // 当前页
          pageSize  : 10,      // 每页条数
      },
  },

  effects: {
    
    *taskList({ payload }, { call, put,select }) {
      const studentId = localStorage.getItem('studentId');
      const campusId = localStorage.getItem('campusId');
      if (!campusId) {
        return;
      }
      // const studentId = '47571418547749045';
      // const campusId = '9';
      const {type,status,time,pageIndex,pageSize} = yield select(state => state.student.taskData);
      const params = {
        type,
        status,
        time,
        studentId,
        campusId,
        pageIndex,
        pageSize,
         ...payload
      };

      const changeParams = {...payload};
      yield put({
        type: 'saveTaskData',
        payload: changeParams,
      });

     
      let requestParams = null;
      requestParams = {...params};

     const response = yield call(getStudentReportList1, requestParams);
      const { responseCode,data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      yield put({
        type: 'saveTaskData',
        payload: {
          pageIndex : data.current,
          records   : data.records,
          total     : data.total,
          pageSize  : data.size
        },
      });
    },

    *homeList({payload},{call,put}) {
      const response = yield call(getHomeList, payload);
      const { responseCode,data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      yield put({
        type: 'saveHomeList',
        payload: data,
      });
    }
  },

  reducers: {
    saveTaskData: (state, { payload }) => ({
        ...state,
        taskData: {
          ...state.taskData,
          ...payload
        }
    }),
    saveHomeList: (state, { payload }) => ({
      ...state,
      list: payload
  }),
    
  },
  subscriptions: {
    setup({ dispatch,history }) {
      return history.listen(({ pathname }) => {
        if (pathname.indexOf("/student/learncenter") === -1) {
          dispatch({
            type    : 'saveTaskData',
            payload : {
              type: '',            // 任务类型： 不限、本班考试、多班联考、课堂练习
              status: 'ALL',          // 任务状态： 不限、待完成、已完成
              time: 0,            // 时间： 本学期、本月、本周
              pageIndex : 1,       // 当前页
              pageSize  : 10,      // 每页条数
              records:[],
            }
          });
        }
      });
    },
  },
};
