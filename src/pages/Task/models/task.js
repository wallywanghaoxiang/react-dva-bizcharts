/**
 * 进行相关的操作
 */
import {
  tsmkTaskDetail,         // 查询任务详情 tsmk-701
  getStudentAnswerDetail, // 获取学生的答题情况 tsmk-803
  getTsmkPaperSapshot,        // 获取试卷内容 paperData
  fetchPaperShowData,     // 获取试卷结构 paperShow
  saveQuestionAnswer,     // 保存单题的答案
  saveAnsweringNo,        // 保存答题的进度
  submitAnswer,           // 考试结束上传答案
} from '@/services/api';

// 默认state
const defaultState = {
  // 学生信息
  "studentId"           : "",             // 学生id
  "studentName"         : "",             // 学生名称
  "studentClassCode"    : "",             // 学号

  // 任务的基础信息
  "taskId"               : "",             // 选中的任务Id
  "name"                 : "",             // 任务名称
  "isMakeUp"             : false,          // 是否是补考
  "type"                 : "",             // 任务类型TASK_TYPE

  "paperList"            : [               // 任务中的试卷列表
    // {
    // ===任务详细中试卷数据===
    // fullMark: 0
    // grade: "001"
    // gradeValue: "一年级"
    // isExamination: null
    // name: "sp15标准广州b卷"
    // paperId: "47551401852666992"
    // paperTemplateId: "47467243042242617"
    // paperTime: 0
    // scopeName: "一年级期中"
    // templateName: "sp15广州卷"
    // ===学生详情中补充数据===
    // paperFullMark : 总分
    // paperFullTime
    // exerciseType  练习模式 （EXAM_MODE : 考试模式 ， EXER_MODEL： 练习模式 ）
    // snapshotId
    // paperMd5
    // examTime
    // examStatus  考试完成状态 （ES_4考试成功，ES_3考试失败）
    // answers : [],
    // answeringNo : "" 答题的进度，顺便带上时间
    // }
  ],

  // 逻辑处理状态
  "currentPaperId"       : "",             // 当前进行中的试卷id
  "storageKey"           : "",             // localstoage 设置该任务的key值  `currentTaskIngTime_${taskId}`
};



export default {
  namespace: 'task',

  state: JSON.parse(JSON.stringify(defaultState)),

  effects: {

    // 考试数据初始化
    *initTask({payload},{put,select}){
      const taskId = payload;

      yield put.resolve({
        type : "login/queryStudentInfoList",
        payload : {
          accountId : localStorage.getItem("uid")
        }
      });

      // 第一步：生成 storagename,主要用于同一个任务，同时只能在一个窗口打开考试
      // 获取学生基本信息
      const { studentInfoList=[] } = yield select(state=>state.login);
      const campusId = localStorage.getItem('campusId');
      const { studentId, name:studentName, studentClassCode } = studentInfoList.find(item=>item.campusId===campusId) || {};

      yield put({
        type : "updateState",
        payload : {
          taskId,
          storageKey : `currentTaskIngTime_${taskId}`,
          studentId,
          studentName,
          studentClassCode
        }
      });

      // 第二步：获取任务信息
      yield put.resolve({
        type : "getTaskDetail",
        payload : taskId
      });

      // 第三步：获取学生的答题信息
      const { type, paperList } = yield select(state=>state.task);

      // 如果是课后训练
      if( type === "TT_5" ){
        // 答题情况默认取试卷中第一套
        const { paperId } = paperList[0] || {};
        if( !paperId ){
          throw String("Could not find this paper");
        }
        // 保存当前正在处理的试卷
        yield put({
          type : "updateState",
          payload : {
            currentPaperId : paperId
          }
        });

        yield put.resolve({
          type : "getStudentAnswerDetail",
          payload : {
            taskId,
            paperId,
            studentId
          }
        });
      }
    },

    // 获取任务信息
    *getTaskDetail({payload},{call,put}){
      const { data } = yield call(tsmkTaskDetail,{taskId:payload});
      const { taskId, name, type, paperList=[], isMakeUp=false } = data;
      yield put({
        type : "updateState",
        payload : {
          taskId,
          name,
          type,
          paperList,
          isMakeUp
        }
      });
    },

    // 获取学生的答题情况
    *getStudentAnswerDetail(_,{select,call,put}){
      const { taskId, currentPaperId : paperId, studentId } = yield select(state=>state.task);

      const { data } = yield call(getStudentAnswerDetail,{taskId, paperId, studentId});
      const { paperFullMark, paperFullTime, exerciseType, snapshotId, paperMd5, examTime, examStatus, answers=[], answeringNo } = data;
      let result={};
      try{
        result = JSON.parse(decodeURIComponent(answeringNo))
      }catch(err){
        console.log(err);
      }

      // 更新试卷的信息
      yield put({
        type : "updatePaperListState",
        payload : {
          paperId,
          paperFullMark,
          paperFullTime,
          exerciseType,
          snapshotId,
          paperMd5,
          examTime,
          examStatus,
          answers,
          answeringNo : result
        }
      });
    },


    // 下载试卷
    *downloadPaper(_,{select,call,put}){
      const { currentPaperId, paperList=[] } = yield select(state=>state.task);
      const { paperId, snapshotId, answers=[], answeringNo={} } = paperList.find(item=>item.paperId===currentPaperId);

      // 通过 快照id 获取 快照的试卷数据
      const { responseCode, data : paperData } = yield call(getTsmkPaperSapshot, {
        snapshotId
      });
      if( responseCode !== "200" || !paperData || !paperData.paperInstance ){
        throw new Error(paperData);
      }

      const idList = [];
      paperData.paperInstance.forEach(item=>{
        if( item.pattern && item.pattern.questionPatternId ){
          idList.push( item.pattern.questionPatternId );
        }
      });

      // 获取结果数据
      const { responseCode:code, data : showData={} } = yield call(fetchPaperShowData,{idList:idList.join(",")});
      if( code !== "200" ){
        throw new Error(showData);
      }

      yield put({
        type : "updatePaperListState",
        payload : {
          paperId,
          paperData,
          showData
        }
      })

      return {
        paperId,
        paperData,
        snapshotId,
        showData,
        answers,
        answeringNo
      };
    },


    // 切题时候的保存
    *saveAnsweringNo({payload={}},{put,call,select}){
      const { currentPaperId, paperList=[], taskId, studentId } = yield select(state=>state.task);
      const {  paperId } = paperList.find(item=>item.paperId===currentPaperId);

      // 保存当前做的题目进度
      yield call(saveAnsweringNo,{
        taskId,
        studentId,
        answeringNo : encodeURIComponent(JSON.stringify(payload))
      });

      yield put({
        type : "updatePaperListState",
        payload : {
          paperId,
          answeringNo : payload
        }
      });

    },


    // 保存答题过程中的值
    *saveQuestionAnswer({payload},{put,call,select}){
      const { answerData=[] ,answersData=[] } = payload || {}
      const { currentPaperId, paperList=[], taskId, studentId } = yield select(state=>state.task);
      const { snapshotId, paperId } = paperList.find(item=>item.paperId===currentPaperId);

      if( answerData.length > 0 ){
        const params = {
          taskId,
          snapshotId,
          studentId,
          answers : answerData
        }

        // 保存单题结果到缓存中
        yield call(saveQuestionAnswer,params);

        // 将答案写入到 当前的缓存中
        yield put({
          type : "updatePaperListState",
          payload : {
            paperId,
            answers : answersData
          }
        });

      }
    },

    // 上传试卷
    *uploadPaper({payload},{put,call,select}){
      const { taskId, studentId, isMakeUp, currentPaperId:paperId } = yield select(state=>state.task);
      const { answersData, snapshotId } = payload;

      // 获取详细数据
      yield put({
        type : "updatePaperListState",
        payload : {
          paperId,
          answersData
        }
      });

      // 添加taskId 和 学生id
      yield call(submitAnswer, {
        ...answersData,
        snapshotId,
        taskId,
        studentId,
        isMakeUp : isMakeUp?1:0
      });
    }

  },

  reducers: {

    // 数据初始化
    resetState(){
      return JSON.parse(JSON.stringify(defaultState));
    },

    // 更新基础数据
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload
      };
    },

    // 更新试卷列表信息
    updatePaperListState(state,{payload}){
      return {
        ...state,
        paperList : state.paperList.map(item=>item.paperId===payload.paperId?{...item,...payload}:{...item})
      }
    }
  }
};
