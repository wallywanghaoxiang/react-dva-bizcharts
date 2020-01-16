/**
 *
 * User: tina.zhang
 * Date: 19-04-02
 * Time: AM 09:29
 * Explain: 接口调用、与资源渲染
 *
 * */
import { queryLearnGroup,querySomeLearnGroupStudent,fetchClassList,createLearnGroup,getEditLearnGroup,deleteLearnGroup,fetchMyGroups,moreGroupStudent,getCancelLearnGroup,getReLearnGroup} from '@/services/api';

export default {
  namespace: 'learn',
  state: {
    groupList: {}, // 学习小组列表
    studentList:[], // 学习小组所包含的学生列表
    naturalClassList:[], // 行政班列表
    teachingClassList:[],  // 学科列表
    currentLearnGroupID:'', // 当前学习小组ID
    naturalStudentList:[], // 当前行政班的学生列表
    naturalClassId:'', // 当前行政班ID
    name:'',   // 当前行政班名称
    subjectCode:'', // 学科ID
    classNameInfo:'', 
    currentGroupName:'', // 当前小组名称
    changeGroupData:[], // 切换分组的数据
    studentListFilter:[], // 搜索分组里的学生
    naturalStudentListFilter:[], // 搜索行政班学生列表
  },

  effects: {
    // 查询我的学习小组
    * fetchGroupList({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(queryLearnGroup, payload);
      if (responseCode !== '200') return;
      yield put({
        type: 'saveData',
        payload: {
            groupList:data||[]
        },
      });
      if (callback) callback(data);
    },
  // 查询某个小组的学生
  * fetchStudentList({ payload, callback }, { call, put }) {
    const { responseCode, data } = yield call(querySomeLearnGroupStudent, payload);
    if (responseCode !== '200' || data == null) return;
    yield put({
      type: 'saveData',
      payload: {
        studentList:data,
        studentListFilter:data
      },
    });
    if (callback) callback(data);
  },
// 查询某个小组的学生
* saveStudentList({ payload }, { put }) {
    yield put({
      type: 'saveData',
      payload: {
        studentListFilter:payload.studentList
      },
    });
  },
   // 查询我的行政班    
  * queryMyNaturalClasses({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(fetchClassList, payload);
      if (responseCode !== '200' || data == null) return;
      const {naturalClassList,teachingClassList} = data;
      yield put({
        type: 'saveData',
        payload: {
          naturalClassList,
          teachingClassList
        },
      });
      if (callback) callback(data);
    },
  // 创建学习小组    
  * createMyNaturalClasses({ payload, callback }, { call }) {
      const  response = yield call(createLearnGroup, payload);   
      if (callback) callback(response);
    },
  // 创建学习小组    
  * editMyNaturalClasses({ payload, callback }, { call }) {
      const  response = yield call(getEditLearnGroup, payload);   
      if (callback) callback(response);
    },
  // 删除学习小组    
  * delMyNaturalClasses({ payload, callback }, { call }) {
      const  response = yield call(deleteLearnGroup, payload);   
      if (callback) callback(response);
    },
 // 批量取消分组    
 * cancelGroup({ payload, callback }, { call }) {
    const  response = yield call(getCancelLearnGroup, payload);   
    if (callback) callback(response);
  },
 // 批量重新分组    
 * moreReLearnGroup({ payload, callback }, { call }) {
    const  response = yield call(getReLearnGroup, payload);   
    if (callback) callback(response);
  },
  
    
  // 保存当前学习小组ID 当前行政班ID    
* saveCurrent({ payload },  { put }) {
    yield put({
      type: 'saveData',
      payload: {
        currentLearnGroupID:payload.id,
        currentGroupName:payload.currentGroupName,
        name:payload.classNameInfo,
        naturalClassId:payload.naturalClassId
      },
    })
  },
 // 查询我的行政班学生列表  
 * fetchNaturalClassList({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(fetchMyGroups, payload);
      if (responseCode !== '200' || data == null) return;
      let studentLists =[]
      data.forEach(element => {
        if(element.learningGroupId===null) {
          studentLists=element.studentList
        }
      });
      yield put({
        type: 'saveData',
        payload: {
          naturalStudentList:studentLists,
          naturalStudentListFilter:studentLists
        },
      });
      if (callback) callback(data);
    },

  // 保存搜索到的行政班学生列表
  * saveNaturalClassList({ payload }, { put }) {
  yield put({
    type: 'saveData',
    payload: {
      naturalStudentListFilter:payload.studentList
    },
  });
},
  
  // 保存当前学习小组信息  
  * saveCurrentGroupInfo({ payload },  { put }) {
      yield put({
        type: 'saveData',
        payload: {
          changeGroupData:payload.changeGroupData
        },
      })
    },

  // 保存当前学习小组信息  
  * saveChangeGroup({ payload },  { put }) {
  yield put({
    type: 'saveData',
    payload: {
      name:payload.name,subjectCode:payload.subjectCode,classNameInfo:payload.className
    },
  })
},

 // 批量新增学生  
  * moreGroupStudentAdd({ payload, callback }, { call }) {
      const  response = yield call(moreGroupStudent, payload);   
      if (callback) callback(response);
    },
    
    

  },

  reducers: {
    saveData(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  
  },
};
