/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-28
 * Time: PM 13:29
 * Explain: 接口调用、与资源渲染
 *
 * */
import {
  fetchClassList,
  fetchNaturalClass,
  naturalStudent,
  fetchMyGroups,
  updateClassAlias,
  updateStudents,
  updateClassCode,
  addClassTeachers,
  delClassTeachers,
  addClassStudents,
  addClassMoveStudents,
  updateStudentsMark,
  updateStudentsQuit,
  delClassStudent,
  postDuplicateStudents,
  updateStudentsUnmark,
  getTeachingStudents,
  updateTeachingAlias,
  addTeachingStudent,
  updateTeachingStudentCode,
  updateTeachingStudentsCode,
  delTeachingStudentsCode,
  getAllGrade,
  getTeacherList,
  classSwap,
  getDictionaries,
  getOtherTeacherList
} from '@/services/api';
import { message } from 'antd';

export default {
  namespace: 'clzss',
  state: {
    classList: {},
    naturalClass: {}, // 行政班信息以及学生列表
    naturalClassStudents: [],// 调入查询的行政班学生列表
    filterNaturalStudent: [], // 搜索框搜索行政班学生列表
    filterNaturalClass: [], // 行政班数据源
    filterMyGroup: [], // 分组搜索过滤
    initialMyGroup: [], // 分组搜索过滤初始数据
    fetchRule: {},
    classAlias: {},
    teachingStudents: [], // 当前教学班的学生列表
    teachingID: '',// 当前教学班的ID
    swapGradeStatus: '',// 当前异动状态
    teachName: '', // 当前教学班的名称
    teachLastDays: '', // 当前教学班是否在异动期
    currentTeachInfo: {}, // 当前教学班信息
    currentNaturalTeach: {}, // 当前行政班信息
    gradeClassList: [],// 该校区的年级和班级
    checkList: [], // 保存被选择的学生列表转入学生
    teacherLists: [],
    filterTeachStudent: [], // 教学班搜索框搜索过滤
    quitReasons:[], // 退学原因
  },

  effects: {
    // 获取校区的年级和班级
    * allGrade({ payload, callback }, { call, put }) {
      const response = yield call(getAllGrade, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') return;
      if (callback) {
        callback(response);
      }
      yield put({
        type: 'saveData',
        payload: { gradeClassList: data },
      });
    },
    // 【CAMPUS-301】 查询我的班级返回我的班级
    * fetchClassList({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(fetchClassList, payload);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveData',
        payload: {
          classList: data,
        },
      });
      if (callback) callback(data);
    },
    // 【CAMPUS-302】根据行政班ID,查询行政班信息
    * fetchNaturalClass({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(fetchNaturalClass, payload);
      if (responseCode !== '200' || data == null) return;
      const { studentList, teacherList, lastDays } = data;
      yield put({
        type: 'saveData',
        payload: {
          naturalClass: data,
          adminStudents: studentList,
          adminTeacherList: teacherList,
          filterNaturalClass: studentList,
          adminLastDays: lastDays,
        },
      });
      if (callback) callback(data);
    },
    // CAMPUS-212: 查看班级异动
    * classSwap({ payload, callback }, { call, put }) {
      const response = yield call(classSwap, payload);
      const { responseCode, data } = response;
      const { swapDays, swapGradeStatus } = data;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      if (callback&&data!==null) {
        callback(response);
      }
      yield put({
        type: 'saveData',
        payload: {
          swapDays,
          swapGradeStatus
        },
      });
    },
    // 【CAMPUS-302-1】根据行政班ID,查询教学班信息
    * naturalStudents({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(naturalStudent, payload);
      if (responseCode !== '200' || data == null) return;
      const { studentList } = data;
      yield put({
        type: 'saveData',
        payload: {
          naturalClassStudents: studentList,
          filterNaturalStudent: studentList,
        },
      });
      if (callback) callback(data);
    },
    // 保存当前行政班信息
    * saveCurrentNaturalTeach({ payload }, { put }) {
      yield put({
        type: 'saveData',
        payload: {
          currentNaturalTeach: payload.item,
        },
      });
    },
    // 【CAMPUS-302-1】根据行政班ID,查询行政班信息
    * fetchNaturalStudents({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(fetchNaturalClass, payload);
      if (responseCode !== '200' || data == null) return;
      const { studentList } = data;
      yield put({
        type: 'saveData',
        payload: {
          naturalClassStudents: studentList,
          filterNaturalStudent: studentList,
        },
      });
      if (callback) callback(data);
    },
    // 【CAMPUS-303】查看我的分组
    * fetchMyGroups({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(fetchMyGroups, payload);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveData',
        payload: {
          myGroups: data,
          filterMyGroup: data,
          initialMyGroup: data,
        },
      });
      if (callback) callback(data);
    },
    // 【CAMPUS-304】修改行政班信息-别名
    * updateClassAlias({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(updateClassAlias, payload);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveData',
        payload: {
          classAlias: data,
        },
      });
      if (callback) callback(data);
    },
    // 【CAMPUS-305】批量修改学生信息
    * updateStudents({ payload, callback }, { call, put }) {
      const response = yield call(updateStudents, payload);
      const { responseCode, data } = response
      if(responseCode==='200') {
        yield put({
          type: 'saveData',
          payload: {
            updateStudents: data,
          },
        });
      }
      if (callback) callback(response);
    },
    // 【CAMPUS-306】批量更新学生学号-行政班
    * updateClassCode({ payload, callback }, { call }) {
      const response = yield call(updateClassCode, payload);
      if (callback) callback(response);
    },
    // 【CAMPUS-307】增加学科老师-行政班
    * addClassTeachers({ payload, callback }, { call, put }) {
      const response = yield call(addClassTeachers, payload);
      const { data } = response;
      yield put({
        type: 'saveData',
        payload: {
          addClassTeachers: data,
        },
      });
      if (callback) callback(response);
    },
    // 【CAMPUS-309】批量删除学科老师-行政班
    * delClassTeachers({ payload, callback }, { call }) {
      const response = yield call(delClassTeachers, payload);
      if (callback) callback(response);
    },
    // 【CAMPUS-310】批量增加行政班学生-添加-导入
    * addClassStudents({ payload, callback }, { call }) {
      const response = yield call(addClassStudents, payload);
      if (callback) callback(response);
    },
    // 【CAMPUS-311】批量增加行政班学生-添加-调入
    * addClassMoveStudents({ payload, callback }, { call }) {
      const response = yield call(addClassMoveStudents, payload);
      if (callback) callback(response);
    },
    // 【CAMPUS-312】批量编辑学生-标记调出
    * updateStudentsMark({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(updateStudentsMark, payload);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveData',
        payload: {
          updateStudentsMark: data,
        },
      });
      if (callback) callback(data);
    },
    // 【CAMPUS-313】 编辑学生-申请退学
    * updateStudentsQuit({ payload, callback }, { call, put }) {
      const response = yield call(updateStudentsQuit, payload);
      const { responseCode, data } = response;
      if (callback) callback(response);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveData',
        payload: {
          updateStudentsQuit: data,
        },
      });
      
    },
    // 【CAMPUS-314】 删除学生
    * delClassStudent({ payload, callback }, { call }) {
      const response = yield call(delClassStudent, payload);
      if (callback) callback(response);
    },
    // 【CAMPUS-315】检查学生是否重名，近期被删除
    * postDuplicateStudents({ payload, callback }, { call, put }) {
      const response = yield call(postDuplicateStudents, payload);
      const { responseCode, data } = response;
      if (callback) callback(response);
      if (responseCode !== '200' || data == null) {
        message.warning(data);
        return;
      }
      ;
      yield put({
        type: 'saveData',
        payload: {
          postDuplicateStudents: data,
        },
      });

    },
    // 【CAMPUS-316】 取消标记调出
    * updateStudentsUnmark({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(updateStudentsUnmark, payload);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveData',
        payload: {
          updateStudentsUnmark: data,
        },
      });
      if (callback) callback(data);
    },
    // 【CAMPUS-401】 查询我的教学班
    * getTeachingStudents({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(getTeachingStudents, payload);
      if (responseCode !== '200' || data == null) return;
      const { studentList, name, lastDays, id } = data;
      yield put({
        type: 'saveData',
        payload: {
          teachingStudents: studentList,
          teachingID: id,// 当前教学班的ID
          teachName: name, // 当前教学班的名称
          teachLastDays: lastDays, // 当前教学班是否在异动期
          filterTeachStudent: studentList,
        },
      });
      if (callback) callback(data);
    },
    // 【CAMPUS-402】 修改教学班信息-别名{
    * updateTeachingAlias({ payload, callback }, { call }) {
      const { responseCode, data } = yield call(updateTeachingAlias, payload);
      if (responseCode !== '200' || data == null) return;

      if (callback) callback(responseCode);
    },
    // 【CAMPUS-403】 批量调入行政班学生到教学班
    * addTeachingStudents({ payload, callback }, { call }) {
      const response = yield call(addTeachingStudent, payload);
      if (callback) callback(response);
    },
    // 【CAMPUS-404】 修改学生学号-教学班
    * updateTeachingStudentCode({ payload, callback }, { call }) {
      const response = yield call(updateTeachingStudentCode, payload);
      if (callback) callback(response);
    },
    // 【CAMPUS-405】 批量更新学生学号-教学班
    * updateTeachingStudentsCode({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(updateTeachingStudentsCode, payload);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveData',
        payload: {
          updateTeachingStudentsCode: data,
        },
      });
      if (callback) callback(data);
    },
    // 【CAMPUS-406】 删除学生关系-教学班
    * delTeachingStudentsCodes({ payload, callback }, { call }) {
      const response = yield call(delTeachingStudentsCode, payload);
      if (callback) callback(response);
    },
    // 保存当前教学班信息
    * saveCurrentTeach({ payload }, { put }) {
      yield put({
        type: 'saveData',
        payload: {
          currentTeachInfo: payload.item,
        },
      });
    },
    // 保存当前被转入的学生列表待确认
    * saveCheckList({ payload }, { put }) {
      yield put({
        type: 'saveData',
        payload: {
          checkList: payload.checkedList,
        },
      });
    },
    // 保存当前被搜索的学生列表
    * filterTeachStudents({ payload }, { put }) {
      yield put({
        type: 'saveData',
        payload: {
          filterTeachStudent: payload.filterTeachStudent,
          filterNaturalClass: payload.filterNaturalClass,
        },
      });
    },
    // 保存当前分组信息
    * filterMyGroups({ payload }, { put }) {
      yield put({
        type: 'saveData',
        payload: {
          filterMyGroup: payload.filterMyGroup,
        },
      });
    },
    // 保存当前被搜索的行政班学生列表
    * filterNaturalStudents({ payload }, { put }) {
      yield put({
        type: 'saveData',
        payload: {
          filterNaturalStudent: payload.filterNaturalStudent,
        },
      });
    },
    // 【CAMPUS-204】 分页获取老师信息
    * getTeacherList({ payload, callback }, { call, put }) {
      if(payload.teacherId){
        const { responseCode, data } = yield call(getOtherTeacherList, payload);
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'saveData',
          payload: {
            teacherLists: data,
          },
        });
        if (callback) callback(data);
      }else{
        const { responseCode, data } = yield call(getTeacherList, payload);
        if (responseCode !== '200' || data == null) return;
        yield put({
          type: 'saveData',
          payload: {
            teacherLists: data,
          },
        });
        if (callback) callback(data);
      }
      
    },
    // 退学原因
    *getQuitReasons({payload,callback},{call,put}) {
      const { responseCode, data } = yield call(getDictionaries, payload);
      if (responseCode !== '200' || data == null) {
        message.warning(data);
      }
      yield put({
        type: 'saveQuitReasons',
        payload: {
          quitReasons:data
        },
      });
      if (callback) callback(data);
    }
  },
  //


  reducers: {
    saveData(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    
    saveQuitReasons(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
  subscriptions: {
    /**
     * 如果跳转到班级管理页面，则清除缓存
     * @param {*} param0
     */
    setup({ dispatch, history }) {
      // 判断路由
      history.listen(location => {
        // console.log(location);
        if (
          location.pathname.indexOf('/classallocation/classmanage') === 0
        ) {
          dispatch({
            type: 'saveData',
            payload: {
              naturalClassStudents: [],// 调入查询的行政班学生列表
              filterNaturalStudent: [], // 搜索框搜索行政班学生列表
              filterNaturalClass: [], // 行政班数据源
              filterMyGroup: [], // 分组搜索过滤
              initialMyGroup: [], // 分组搜索过滤初始数据
              fetchRule: {},
              classAlias: {},
              teachingStudents: [], // 当前教学班的学生列表
              teachingID: '',// 当前教学班的ID
              teachName: '', // 当前教学班的名称
              teachLastDays: '', // 当前教学班是否在异动期
              currentTeachInfo: {}, // 当前教学班信息
              gradeClassList: [],// 该校区的年级和班级
              checkList: [], // 保存被选择的学生列表转入学生
              teacherLists: [],
              adminStudents: [],
              filterTeachStudent: [], // 教学班搜索框搜索过滤
            },
          });
        }
      });
    },
  },
};
