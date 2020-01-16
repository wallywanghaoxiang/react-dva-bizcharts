import { message } from 'antd';
import {
  getExamNum,
  getUexamTaskInfo,
  publishResult,
  updateReportDisplayUExamInfo,
  getTaskInfo,
  getExamOverview,
  getClassScoreStatis,
  getExamAnalysis,
  fetchPaperShowData,
  getPaperSapshot,
  getTeacherSubquestion,
  getExamDetail,
  getStudentList,
  getExamStudentScore,
  updateUexamTask,
} from '@/services/uexamReport';

/**
 * 统考报告 model
 */
export default {
  namespace: 'uexamReport',
  state: {
    taskInfo: null, // 任务总览信息
    examStudentNum: null, // 学生答卷人数
    uexamTaskInfo: null, // 任务信息（为了获取当前任务的状态）
    examOverview: null, // 考试情况总览
    classScoreStatis: null, // 班级报告成绩分布
    examAnalysis: null, // 学情分析(能力分析、试卷区分度难度得分率)
    examDeatil: [], // 考务明细
    studentList: [], // 统考报告-缺考补考作弊等名单
    studentScore: [], // 学生成绩单数据
    showData: {}, // 试题渲染数据
    paperData: {}, // 试卷快照数据
    teacherPaperInfo: {}, // 教师详情页试卷结构

    examDeatilTotal: 0, // 考务明细总条数
    studentScoreTotal: 0, // 学生成绩单总条数
    studentListTotal: 0, // 缺考补考作弊等名单总条数
  },
  effects: {
    // 学生答卷人数
    *getExamNum({ payload }, { call, put }) {
      const res = yield call(getExamNum, payload);
      yield put({
        type: 'saveExamStudentNum',
        payload: res.data,
      });
      return res;
    },
    // UEXAM-015：单次任务详情 统考系统中获取任务状态
    *getUexamTaskInfo({ payload, callback }, { call, put }) {
      const resp = yield call(getUexamTaskInfo, payload);
      yield put({
        type: 'saveUexamTaskInfo',
        payload: resp.data,
      });
      if (callback) {
        callback(resp);
      }
      return resp;
    },

    // 公布成绩
    *publish({ payload, callback }, { call }) {
      const resp = yield call(publishResult, payload);
      const { responseCode, data } = resp;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      if (callback) {
        callback();
      }
    },

    // 设置本次统考数据是否可见
    *updateReportDisplayUExamInfo({ payload }, { call }) {
      const resp = yield call(updateReportDisplayUExamInfo, payload);
      return resp;
    },

    //* REPORT-201：统考报告-考务情况总览
    *getTaskInfo({ payload }, { call, put }) {
      const resp = yield call(getTaskInfo, payload);
      yield put({
        type: 'saveTaskInfo',
        payload: resp.data,
      });
      return resp;
    },

    //* REPORT-202：统考报告-考务明细
    *getExamDetailInfo({ payload }, { call, put }) {
      const resp = yield call(getExamDetail, payload);
      yield put({
        type: 'saveExamDetail',
        payload: resp.data && resp.data.records,
        examDeatilTotal: resp.data && resp.data.total,
      });
      return resp;
    },

    //* REPORT-203：统考报告-缺考补考作弊等名单-分页
    *getTypeStudentList({ payload }, { call, put }) {
      const resp = yield call(getStudentList, payload);
      yield put({
        type: 'saveStudentList',
        payload: resp.data && resp.data.records,
        studentListTotal: resp.data && resp.data.total,
      });
      return resp;
    },

    //* 7.6.6	REPORT-206：统考报告-学生成绩单—分页
    *getStudentScore({ payload }, { call, put }) {
      const resp = yield call(getExamStudentScore, payload);
      yield put({
        type: 'saveStudentScore',
        payload: resp.data && resp.data.records,
        studentScoreTotal: resp.data && resp.data.total,
      });
      return resp;
    },

    //* REPORT-204：统考报告-考试情况总览
    *getExamOverview({ payload }, { call, put }) {
      const resp = yield call(getExamOverview, payload);
      yield put({
        type: 'saveExamOverview',
        payload: resp.data,
      });
      return resp;
    },

    //* REPORT-204-1：统考报告-考试情况总览-班级得分分布
    *getClassScoreStatis({ payload }, { call, put }) {
      const resp = yield call(getClassScoreStatis, payload);
      // const pdata = payload.classId === '52011868197224597'
      //   ? JSON.parse('{"data":{"totalScore":[{"level":"[0.000,3.000)","num":"0","rate":"0.0"},{"level":"[3.000,6.000)","num":"0","rate":"0.0"},{"level":"[6.000,9.000)","num":"0","rate":"0.0"},{"level":"[9.000,12.000)","num":"0","rate":"0.0"},{"level":"[12.000,15.000)","num":"1","rate":"20.0"},{"level":"[15.000,18.000)","num":"1","rate":"20.0"},{"level":"[18.000,21.000)","num":"0","rate":"0.0"},{"level":"[21.000,24.000)","num":"1","rate":"20.0"},{"level":"[24.000,27.000)","num":"0","rate":"0.0"},{"level":"[27.000,30.000)","num":"0","rate":"0.0"},{"level":"[30.000,30.000]","num":"2","rate":"40.0"}],"questionScore":[{"questionId":"1","questionName":"一、 听对话回答问题","totalScore":[{"level":"[0.000,1.000)","num":"0","rate":"0.0"},{"level":"[1.000,2.000)","num":"0","rate":"0.0"},{"level":"[2.000,3.000)","num":"0","rate":"0.0"},{"level":"[3.000,4.000)","num":"0","rate":"0.0"},{"level":"[4.000,5.000)","num":"1","rate":"20.0"},{"level":"[5.000,6.000)","num":"1","rate":"20.0"},{"level":"[6.000,7.000)","num":"0","rate":"0.0"},{"level":"[7.000,8.000)","num":"2","rate":"40.0"},{"level":"[8.000,9.000)","num":"0","rate":"0.0"},{"level":"[9.000,10.000)","num":"1","rate":"20.0"},{"level":"[10.000,10.000]","num":"0","rate":"0.0"}]},{"questionId":"2","questionName":"二、听对话和短文答题",  "totalScore":[{"level":"[0.000,1.000)","num":"0","rate":"0.0"},{"level":"[1.000,2.000)","num":"0","rate":"0.0"},{"level":"[2.000,3.000)","num":"0","rate":"0.0"},{"level":"[3.000,4.000)","num":"2","rate":"40.0"},{"level":"[4.000,5.000)","num":"0","rate":"0.0"},{"level":"[5.000,6.000)","num":"0","rate":"0.0"},{"level":"[6.000,7.000)","num":"1","rate":"20.0"},{"level":"[7.000,8.000)","num":"1","rate":"20.0"},{"level":"[8.000,9.000)","num":"1","rate":"20.0"},{"level":"[9.000,10.000)","num":"0","rate":"0.0"},{"level":"[10.000,10.000]","num":"0","rate":"0.0"}]},{"questionId":"3","questionName":"三、朗读短文",  "totalScore":[{"level":"[3.000, 3.000]","num":"0","rate":"0.0"},{"level":"[2.500, 2.500]","num":"3","rate":"60.0"},{"level":"[2.000, 2.000]","num":"1","rate":"20.0"},{"level":"[1.500, 1.500]","num":"0","rate":"0.0"},{"level":"[1.000, 1.000]","num":"0","rate":"0.0"},{"level":"[0.500, 0.500]","num":"0","rate":"0.0"},{"level":"[0, 0]","num":"1","rate":"20.0"}]},{"questionId":"4","questionName":"四、 情景问答","totalScore":[{"level":"[2.000, 2.000]","num":"3","rate":"60.0"},{"level":"[1.500, 1.500]","num":"0","rate":"0.0"},{"level":"[1.000, 1.000]","num":"2","rate":"40.0"},{"level":"[0.500, 0.500]","num":"0","rate":"0.0"},{"level":"[0, 0]","num":"0","rate":"0.0"}]},{"questionId":"5","questionName":"五、话题简述","totalScore":[{"level":"[5.000, 5.000]","num":"0","rate":"0.0"},{"level":"[4.500, 4.500]","num":"0","rate":"0.0"},{"level":"[4.000, 4.000]","num":"0","rate":"0.0"},{"level":"[3.500, 3.500]","num":"0","rate":"0.0"},{"level":"[3.000, 3.000]","num":"0","rate":"0.0"},{"level":"[2.500, 2.500]","num":"2","rate":"40.0"},{"level":"[2.000, 2.000]","num":"0","rate":"0.0"},{"level":"[1.500, 1.500]","num":"0","rate":"0.0"},{"level":"[1.000, 1.000]","num":"1","rate":"0.0"},{"level":"[0.500, 0.500]","num":"3","rate":"60.0"},{"level":"[0, 0]","num":"0","rate":"0.0"}]}]},"responseCode":"200"}').data
      //   : resp.data;
      yield put({
        type: 'saveClassScoreStatis',
        payload: resp.data,
      });
      return resp;
    },

    //* REPORT-205：统考报告-学情分析
    *getExamAnalysis({ payload }, { call, put }) {
      const resp = yield call(getExamAnalysis, payload);
      yield put({
        type: 'saveExamAnalysis',
        payload: resp.data,
      });
      return resp;
    },

    // 获取showData
    *fetchPaperShowData({ payload }, { call, put }) {
      const response = yield call(fetchPaperShowData, payload);
      yield put({
        type: 'saveShowData',
        payload: response,
      });
    },
    // 获取试卷快照
    *getPaperSapshot({ payload, callback }, { call, put }) {
      const response = yield call(getPaperSapshot, payload);
      yield put({
        type: 'savePaperData',
        payload: response,
      });
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    // 获取报告信息
    *getTeacherPaperInfo({ payload }, { call, put }) {
      const response = yield call(getTeacherSubquestion, payload);
      yield put({
        type: 'saveTeacherPaperInfo',
        payload: response,
      });
    },

    // 获取报告信息
    *updateTaskInfo({ payload, callback }, { call }) {
      const response = yield call(updateUexamTask, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      if (callback) {
        callback();
      }
    },
  },
  reducers: {
    saveExamStudentNum(state, { payload }) {
      return {
        ...state,
        examStudentNum: payload,
      };
    },
    saveTaskInfo(state, { payload }) {
      return {
        ...state,
        taskInfo: payload,
      };
    },
    saveUexamTaskInfo(state, { payload }) {
      return {
        ...state,
        uexamTaskInfo: payload,
      };
    },
    saveExamOverview(state, { payload }) {
      return {
        ...state,
        examOverview: payload,
      };
    },
    saveClassScoreStatis(state, { payload }) {
      return {
        ...state,
        classScoreStatis: payload,
      };
    },
    clearReport(state) {
      return {
        ...state,
        taskInfo: null, // 任务总览信息
        examStudentNum: null, // 学生答卷人数
        uexamTaskInfo: null, // 任务信息（为了获取当前任务的状态）
        examOverview: null, // 考试情况总览
        classScoreStatis: null, // 班级报告成绩分布
        examAnalysis: null, // 学情分析(能力分析、试卷区分度难度得分率)
        examDeatil: [], // 考务明细
        studentList: [], // 统考报告-缺考补考作弊等名单
        studentScore: [], // 学生成绩单数据
        showData: {}, // 试题渲染数据
        paperData: {}, // 试卷快照数据
        teacherPaperInfo: {}, // 教师详情页试卷结构

        examDeatilTotal: 0, // 考务明细总条数
        studentScoreTotal: 0, // 学生成绩单总条数
        studentListTotal: 0, // 缺考补考作弊等名单总条数
      };
    },
    saveExamAnalysis(state, { payload }) {
      return {
        ...state,
        examAnalysis: payload,
      };
    },
    saveShowData(state, action) {
      return {
        ...state,
        showData: action.payload.data,
      };
    },
    savePaperData(state, action) {
      return {
        ...state,
        showData: {}, // 每次请求新的试卷快照后，先清空showData数据
        paperData: action.payload.data,
      };
    },
    saveTeacherPaperInfo(state, action) {
      return {
        ...state,
        teacherPaperInfo: action.payload.data,
      };
    },
    saveExamDetail(state, { payload, examDeatilTotal }) {
      return {
        ...state,
        examDeatil: payload,
        examDeatilTotal,
      };
    },
    saveStudentList(state, { payload, studentListTotal }) {
      return {
        ...state,
        studentList: payload,
        studentListTotal,
      };
    },
    saveStudentScore(state, { payload, studentScoreTotal }) {
      return {
        ...state,
        studentScore: payload,
        studentScoreTotal,
      };
    },
  },
};
