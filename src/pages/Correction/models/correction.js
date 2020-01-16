import {fetchPaperShowData, getPaperSapshot, getTeacherSubquestion,getStudentAnswerReport,geCorrectStudents,getDictionaries,rectifyUpdate,rectifyDeletes,rectifyDefault } from '@/services/api';

export default {
    namespace: 'correction',
    state: {
        classList:[],
        studentType:[],
        showData: {}, // 试题渲染数据
        paperData: {}, // 试卷快照数据
        teacherPaperInfo: {},// 教师详情页试卷结构
        subQuestions:[],
        filterClassData:[],
        checkedID:'',
        taskId:'',
        initType:'',
        checkClassId:''
    },
  
    effects: {
      // 查询考试的班级列表
      *fetchClassList({ payload,callback }, { call, put }) {
        const { responseCode, data } = yield call(geCorrectStudents, payload);
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'savePaperCurrent',
          payload: {
            classList:data,
            filterClassData:data,
            taskId:payload.taskId,
            initType:payload.type
          },
        });
        if (callback) callback(data);
      }, 

      // 保存当前学生的subQuestions
      *saveSubQuestions({ payload }, { put }) {        
        yield put({
          type: 'savePaperCurrent',
          payload: {
            subQuestions:payload.subQuestions,
            checkedID:payload.checkedID,
            checkClassId:payload.checkClassId
          },
        });
        
      }, 

      // 筛选班级列表里的学生列表
      
      *filterClassList({ payload,callback }, {put,select }) {
        const { classList } = yield select(state=>state.correction);
        const filterClass=classList.map((vo)=>{
            const student = vo.studentList.filter(item=>item.studentClassNo.indexOf(payload.keywords) > -1||item.studentName.indexOf(payload.keywords) > -1)
            console.log(student)
            return {
              ...vo,
              studentList:student
            }
        })
        yield put({
          type: 'savePaperCurrent',
          payload: {
            filterClassData:filterClass
          },
        });
        if (callback) callback(filterClass);
      },

      // 查询考试的班级列表
      *fetchType({ payload,callback }, { call, put }) {
        const { responseCode, data } = yield call(getDictionaries, payload);
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'savePaperCurrent',
          payload: {
            studentType:data
          },
        });
        if (callback) callback(data);
      }, 

      // 加载试卷快照

      *getPaperSapshot({ payload, callback }, { call, put }) {
        const response = yield call(getPaperSapshot, payload);
        const { responseCode, data } = response
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'savePaperData',
          payload: response,
        });
        if (callback) {
            callback(data);
        }        
      },

      // 获取试卷详情
      *getTeacherPaperInfo({ payload, callback }, { call, put }) {
        const response = yield call(getTeacherSubquestion, payload)
        const { responseCode, data } = response
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'savePaperCurrent',
          payload: {teacherPaperInfo:response.data},
        });
        if (callback) {
            callback(data);
        }
      },
  
      // 加载试卷结构
      *fetchPaperShowData({ payload,callback }, { call, put }) {
        const response = yield call(fetchPaperShowData, payload);
        const { responseCode, data } = response
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'savePaperCurrent',
          payload: {showData:response.data},
        });
        if (callback) {
            callback(data);
        }
      },
      
      *getStudentAnswerReport({ payload,callback }, { call, put }) {
        const response = yield call(getStudentAnswerReport, payload);
        const { responseCode, data } = response
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'saveStudentAnswer',
          payload: data
        })
        if (callback) {
            callback(data);
        }
      },

      *rectifyUpdates({ payload,callback }, { call,put,select }) {
        const response = yield call(rectifyUpdate, payload); 
        if(response.responseCode==='200') {         
          const { classList} = yield select(state=>state.correction);
          const newSubQuestions=payload.subQuestions.map((vo)=>{
              if(vo.id===payload.id) {
                return {
                  ...vo,
                  manualDetail:payload.manualDetail,
                  manualScore:payload.manualScore
                }
              }
              return vo
              
          }) 
         const {data:{manualNum,manualQuesNum,manualScore}} = response;
         console.log(manualNum,manualQuesNum,manualScore)
          const newClassList=classList.map((vo)=>{
            if(vo.classId===payload.checkClassId) {
              const newStudent = vo.studentList.map((item)=>{
                if(item.studentId===payload.checkedID) {
                  return {
                    ...item,
                    manualScore,
                    subquestionList:newSubQuestions
                    
                  }
                }
                return item
              })
              return {
                ...vo,
                studentList:newStudent,
                manualNum,
                manualQuesNum
              }
            }
           return vo
            
        })
        console.log(newClassList)
        const { subQuestions} = yield select(state=>state.correction);
        const currentSubQuestions=subQuestions.map((vo)=>{
            if(vo.id===payload.id) {
              return {
                ...vo,
                manualDetail:payload.manualDetail,
                manualScore:payload.manualScore
              }
            }
            return vo
            
        }) 
        yield put({
          type: 'savePaperCurrent',
          payload: {
            subQuestions:currentSubQuestions,
            classList:newClassList,
            filterClassData:newClassList
          },
        });
          // yield put({
          //   type: "correction/fetchClassList",
          //   payload: {
          //     type:initType,
          //     taskId
          //   }
          // }); 
        }  
       
        if (callback) {         
            callback(response);
        }
      },

      *rectifyDelete({ payload,callback }, { call }) {
        const response = yield call(rectifyDeletes, payload);       
        if (callback) {
            callback(response);
        }
      },

      *rectifyDefaults({ payload,callback }, { call }) {
        const response = yield call(rectifyDefault, payload);       
        if (callback) {
            callback(response);
        }
      }
      
      
    },
  
    reducers: {
      savePaperCurrent(state, action) {
        return {
          ...state,
           ...action.payload,
        };
      },
      savePaperData(state, action) {
        return {
          ...state,
          showData: {},// 每次请求新的试卷快照后，先清空showData数据
          paperData: action.payload.data
        };
      },
    }
  };