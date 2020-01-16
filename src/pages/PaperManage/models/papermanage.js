import {fetchPaperPackageList,addPaperPackageInfo,CountPaperPackageList,PaperPackageDetailList,PaperPackageGrade,ChangeStatusPaper } from '@/services/api';
import { message} from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';

const messages = defineMessages({
  schoolpaperaddFailure:{id:'app.menu.papermanage.schoolpaperaddFailure',defaultMessage:'添加失败'},
  paperManageaddSucess:{id:'app.menu.papermanage.paperManageaddSucess',defaultMessage:'添加成功'},
  examinationpaperschangeFailure:{id:'app.menu.papermanage.examinationpaperschangeFailure',defaultMessage:'切换失败'},
  examinationpaperschangeSuccess:{id:'app.menu.papermanage.examinationpaperschangeSuccess',defaultMessage:'切换成功'},
 
 
})
export default {
    namespace: 'papermanage',
    state: {
        paperInfoList:{records:[]}, // 试卷包列表
        countPaperPackages:{}, // 统计信息
        paperInfoDetail:{}, // 试卷详情列表
        gradeList:[],    //  年级列表
        curentPaperPackage:'', // 当前试卷包信息
        filterWord:'' // 试卷包名称搜索
    },
  
    effects: {
      // 查询试卷包列表
      *fetchPaperPackage({ payload,callback }, { call, put }) {
        const { responseCode, data } = yield call(fetchPaperPackageList, payload);
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'savePaperList',
          payload: data,
        });
        if (callback) callback(data);
      }, 
      // 添加试卷包
      *addPaperPackage({ payload,callback }, { call }) {
        const { responseCode, data } = yield call(addPaperPackageInfo, payload);
        if (responseCode !== '200' || data == null) {
           message.error(data||formatMessage(messages.schoolpaperaddFailure))
          return;
        }        
        message.success(formatMessage(messages.paperManageaddSucess))
        if (callback) callback(responseCode);
    
      },  
      // 获取试卷包统计信息
      *CountPaperPackage({ payload,callback }, { call, put }) {
        const { responseCode, data } = yield call(CountPaperPackageList, payload);
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'saveCountPaper',
          payload: data,
        });
        if (callback) callback(data);
      },
      // 获取试卷包详情列表
      *PaperPackageDetail({ payload,callback }, { call, put }) {
        const { responseCode, data } = yield call(PaperPackageDetailList, payload);
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'savePaperPackageDetailList',
          payload: data,
        });
        if (callback) callback(data);
      },
      // 查询试卷包包含的年级
      *PaperPackageGradeList({ payload,callback }, { call, put }) {
        const { responseCode, data } = yield call(PaperPackageGrade, payload);
        if (responseCode !== '200' || data == null) return;
        const grade =data.filter(item=>item&&item.grade!=='')
        grade.unshift({
          "grade": "",
          "gradeValue": "全部"
        })
        yield put({
          type: 'savePaperPackageGrade',
          payload: grade,
        });
        if (callback) callback(grade);
      },
      // 切换试卷保密开放
      *PaperChangeStatus({ payload }, { call }) {
        const { responseCode, data } = yield call(ChangeStatusPaper, payload);
        if (responseCode !== '200' || data == null) {
          message.error(data||formatMessage(messages.examinationpaperschangeFailure))
          return;
        }
        message.success(formatMessage(messages.examinationpaperschangeSuccess))
      
      },
      // 保存当前试卷包信息
      *saveCurrent({ payload}, {put }) {
        yield put({
          type: 'savePaperCurrent',
          payload
        });
      },
      
    
    },
  
    reducers: {
      savePaperCurrent(state, action) {
        return {
          ...state,
           ...action.payload,
        };
      },
      savePaperPackageGrade(state, action) {
        return {
          ...state,
          gradeList: action.payload,
        };
      },
      savePaperList(state, action) {    
        return {
          ...state,
          paperInfoList:action.payload ,
        };
      },
      saveCountPaper(state, action) {
        return {
          ...state,
          countPaperPackages: action.payload,
        };
      },
      savePaperPackageDetailList(state, action) {
        return {
          ...state,
          paperInfoDetail: action.payload,
        };
      },
    },
    subscriptions: {
      setup({dispatch,history}) {
        history.listen(location=>{
          if(location.pathname.indexOf('papermanage/schoolpaper')!==0) {
            dispatch({
              type:'savePaperCurrent',
              payload:{
                curentPaperPackage:'', // 当前试卷包信息   
                filterWord:''            
              }
            })
          }
        })
      }
    }
  };