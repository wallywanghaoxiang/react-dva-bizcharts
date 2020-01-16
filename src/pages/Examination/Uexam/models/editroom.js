import {
  getDictionaries,  
  getTaskDetail,
} from '@/services/api';
import {
  getBatchRoom,
  getBatchByPlace,
  examArrangeOnce,
  examArrangeHand,
  getBatchExamDate,
  getExamStrategy,
  getAllStrategy,
  addStrategy,
  updateStrategy,
  bindStrategy,
  getExamStatistics,
  getExamCampus,
  getStudentList,
  getSearchStudentList,
  examArrangeCompleted,
  examArrangeDeleted,
  examArrangeRedo,
} from '@/services/editroom';


/**
 * 报名 model
 * @author tina.zhang.xu
 * @date   2019-8-7 10:30:17
 */
export default {
  namespace: 'editroom',
  state: {
    taskInfo: null,           // 任务信息
    strategyinfo:null,          // 任务学校策略
    strategyNum:0,            //已经分配策略数量
    noStrategyList:[],        //没有分配策略的学校名单
    allstragy:[],           //所有策略信息
    stdDict:null,             //标准场次字典，标准-备用
    examStatistics:[],        //编排结果信息
    examCampus:[],            //学校列表
    studentList:[],           //学生列表
    campusInfo:[],             //选中的学校信息，包括班级列表
    searchStudentList:[],      //搜索结果
    finishNoStrategyList:[],    //完成考编，存在学生没有考编信息的学校列表的警告
    BatchRoom:[] , // 查看校区-考点场次
    layoutStudent:[],
    BatchByPlaces:[], // 批次考场
    taskId:'', // 任务ID
    ExamDate:[],
    backStatus:false //是否要恢复要原来的状态
  },

  effects: {
      //标准场次字典
      *getStdDict({ payload }, { call, put }) {
        const response = yield call(getDictionaries, payload);
        const { responseCode,data } = response;
        if (responseCode !== '200') return;
        yield put({
          type: 'saveStdDict',
          payload: data,
        });
    },
    // UEXAM-015：单次任务详情
    *getTaskInfo({ payload }, { call, put }) {
      const resp = yield call(getTaskDetail, payload);
      yield put({
        type: 'saveTaskInfo',
        payload: resp.data
      })
      return resp;
    },
    //101 查询任务学校策略
    *getExamStrategy({ payload }, { call, put }) {
      const resp = yield call(getExamStrategy, payload);
      yield put({
        type: 'saveExamStrategy',
        payload: resp.data
      })
      return resp;
    },
    //102 查询所有策略
    *getAllStrategy({ payload }, { call, put }) {
      const resp = yield call(getAllStrategy, payload);
      yield put({
        type: 'saveAllStrategy',
        payload: resp.data
      })
      return resp;
    },
    //103 新增策略
    *addStrategy({ payload,callback }, { call }) {
    const response = yield call(addStrategy, payload);      
    if (callback)callback();
  },
 
    //104 设为默认
    *updateStrategy({ payload,callback }, { call }) {
      const response = yield call(updateStrategy, payload);
    },

    //105 绑定策略
    *bindStrategy({ payload,callback }, { call }) {
      const response = yield call(bindStrategy, payload);
      if(callback){
        callback(response)
      }
    },

  //107 查询编排结果
    *getExamStatistics({ payload }, { call, put }) {
      const resp = yield call(getExamStatistics, payload);
      yield put({
        type: 'saveExamStatistics',
        payload: resp.data
      })
      return resp;
    },

    //108 学生编排-单个学校的列表
    *getExamCampus({ payload }, { call, put }) {
      const resp = yield call(getExamCampus, payload);
      yield put({
        type: 'saveCampusInfo',
        payload: resp.data[0]
      })
      return resp;
    },

    //109 学生编排-学生列表
    *getStudentList({ payload }, { call, put }) {
      const resp = yield call(getStudentList, payload);
      yield put({
        type: 'saveStudentList',
        payload: {data:resp.data,backStatus:payload.backStatus}
      })
      return resp;
    },

    //112 取消编排
    *examArrangeDeleted({ payload,callback }, { call }) {
      const response = yield call(examArrangeDeleted, payload);
      if (callback) callback(response);
    },
    //113 搜索结果
    *getSearchStudentList({ payload }, { call, put }) {
      const resp = yield call(getSearchStudentList, payload);
      yield put({
        type: 'saveSearchStudentList',
        payload: resp.data
      })
      return resp;
    },    
    //114 完成编排
    *examArrangeCompleted({ payload,callback }, { call }) {
      const response = yield call(examArrangeCompleted, payload);
    },
    //116 重新编排
    *examArrangeRedo({ payload,callback }, { call }) {
      const response = yield call(examArrangeRedo, payload);
    },
    
    *updateCampusInfo({ payload }, { call, put }) {
      yield put({
        type: 'saveCampusInfo',
        payload: payload.data
      })
      //return resp;
    },

    *clearAll({ payload }, { call, put }) {
      yield put({
        type: 'setClearAll',
        payload: payload.data
      })
      //return resp;
    },

    // 查看校区--考点场次 
    * geBatchRooms({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(getBatchRoom, payload);
      if (responseCode !== '200') return;
      yield put({
        type: 'saveData',
        payload: {
          BatchRoom:data||[]
        },
      });
      if (callback) callback(data);
    },

    * savePlanStudent({ payload, callback }, {put }) {    
      yield put({
        type: 'saveData',
        payload: {
          layoutStudent:payload.studentId,
          taskId:payload.taskId
        },
      });
      if (callback) callback(payload.studentId);
    },

  // 查看校区--考点场次 
  * getBatchByPlaces({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(getBatchByPlace, payload);
      if (responseCode !== '200') return;
      yield put({
        type: 'saveData',
        payload: {
          BatchByPlaces:data||[]
        },
      });
      if (callback) callback(data);
    },

  * examArrangeOnces({ payload, callback }, { call }) {
    const response = yield call(examArrangeOnce, payload);   
    if (callback) callback(response);
  },
  * examArrangeHands({ payload, callback }, { call }) {
      const response = yield call(examArrangeHand, payload);   
      if (callback) callback(response);
    },  
    * getBatchExamDates({ payload, callback }, { call, put }) {
    const { responseCode, data } = yield call(getBatchExamDate, payload);
    if (responseCode !== '200') return;
    yield put({
      type: 'saveData',
      payload: {
        ExamDate:data||[]
      },
    });
    if (callback) callback(data);
  },
    
    
  },

  reducers: {
    saveStdDict(state, { payload }) {
      return {
        ...state,
        stdDict: payload
      };
    },
    saveTaskInfo(state, { payload }) {
      return {
        ...state,
        taskInfo: payload
      };
    },
    saveExamStrategy(state, { payload }) {
      let num=0;
      let lists=[]
      payload.map((Item,index)=>{
        if(Item.strategyName){
          num++;
        }else{
          lists.push({
            "name":Item.campusName
          })
        }
       })
      return {
        ...state,
        strategyinfo: payload,
        strategyNum:num,
        noStrategyList:lists,
      };
    },
    saveAllStrategy(state, { payload }) {
      return {
        ...state,
        allstragy: payload,
        backStatus:false, // 恢复默认状态
      };
    },

    saveExamStatistics(state, { payload }) {
      return {
        ...state,
        examStatistics: payload
      };
    },

    saveExamCampus(state, { payload }) {
      let lists=[]
      payload.map((Item,index)=>{
        if(Item.finishNum!==Item.studentNum){
          lists.push({
            "name":Item.campusName
          })
        }
       })
      return {
        ...state,
        examCampus: payload,
        finishNoStrategyList:lists,
      };
    },
    
    saveStudentList(state, { payload }) {
      return {
        ...state,
        studentList: payload.data,
        backStatus:payload.backStatus?true:false,
      };
    },

    saveSearchStudentList(state, { payload }) {
      return {
        ...state,
        searchStudentList: payload
      };
    },

    saveCampusInfo(state, { payload }) {
      let lists=[]
      payload.classList.map((Item,index)=>{
        if(Item.finishNum!==Item.studentNum){
          lists.push({
            "name":Item.className
          })
        }
       })
      return {
        ...state,
        campusInfo: payload,
        finishNoStrategyList:lists
      };
    },
    saveData(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    setClearAll(state, { payload }) {
      return {
        ...state,
        examCampus:[],            //学校列表
        studentList:[],           //学生列表
        campusInfo:[],             //选中的学校信息，包括班级列表
      };
    },
  },
  subscriptions: {

  }
}
