import { routerRedux } from 'dva/router';
import router from 'umi/router';
import { message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import {
  fakeAccountLogin,
  isRegister,
  getUserDetail,
  queryCampusList,
  changeTeacherMobile,
  switchCampus,
  editTeacherBasic,
  editTeacherBasicPwd,
  queryMobileTeacherIdentity,
  editTeacherInfo,
  getAccountId,
  getValidateCode,
  getEditMobile,
  checkSN,
  resetPWInfo,
  queryAllBoundStudentInfo,
  studentSwitchCampus,
  resendInvitate,
} from '@/services/api';
import { reloadAuthorized } from '@/utils/Authorized';
import { setNewAuthority, setAuthority } from '@/utils/authority';

const messagesInfo = defineMessages({
  changeSchool: { id: 'app.teacher.account.changeSchool', defaultMessage: '切换校区成功!' },
  editInfo: { id: 'app.teacher.account.editInfo', defaultMessage: '编辑成功!' },
  saveInfo: { id: 'app.teacher.account.saveInfo', defaultMessage: '保存成功!' },
});

export default {
  namespace: 'login',

  state: {
    status: undefined,
    campusList: [], // 校区列表
    campusID: '', // 当前校区ID
    identityList: [], // 当前角色列表
    avatar: '', // 当前用户头像
    avatarUrl: '', // 当前用户头像URL
    studentInfoList: [], // 学生绑定信息
    identityCode: '', // 用户的角色 ID_TEACHER ID_STUDENT
    userId: '',
  },

  effects: {
    *login({ payload, callback }, { call, put }) {
      localStorage.clear();
      // 1. 用户认证
      const response = yield call(fakeAccountLogin, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
      if (response && response.auth) {
        const accessToken = response.auth.access_token;
        const username = response.principal.identity.name || 'admin';
        const userId = response.auth.userInfo.id;
        const status = response.responseCode;
        const { mobile } = response.auth.userInfo;
        localStorage.setItem('nickName', response.auth.userInfo.nickName || '');
        localStorage.setItem('vbNumber', response.auth.userInfo.vbNumber);
        localStorage.setItem('identityCode', payload.identityCode);
        localStorage.setItem('avatar', userId);
        yield put({
          type: 'saveAvater',
          payload: userId,
        });
        yield put({
          type: 'changeLoginStatus',
          payload: {
            access_token: accessToken,
            currentAuthority: username,
            userId,
            status,
            mobile,
            identityCode: payload.identityCode,
          },
        });

        const { identityCode } = payload;
        if (identityCode === 'ID_STUDENT') {
          /* ======学生登录======= */
          const { name, gender } = response.auth.userInfo;
          localStorage.setItem('name', name);
          localStorage.setItem('gender', gender);
          // 2.获取学生信息
          const stuParams = {
            accountId: userId,
          };
          const studentInfoRes = yield call(queryAllBoundStudentInfo, stuParams);
          if (studentInfoRes.responseCode === '200') {
            yield put({
              type: 'saveStudentInfoList',
              payload: studentInfoRes.data,
            });
            const { data } = studentInfoRes;
            if (data.length > 0) {
              const { campusId, studentId, campusName } = data[0];
              localStorage.setItem('campusId', campusId);
              localStorage.setItem('studentId', studentId);
              localStorage.setItem('campusName', campusName);
            }
          }
          if (!name || !gender) {
            router.push({
              pathname: '/user/perfect',
              state: {
                userInfo: response.auth.userInfo,
              },
            });
          } else if (studentInfoRes && studentInfoRes.data.length > 0) {
            router.push({ pathname: '/student/home' });
          } else {
            router.push({ pathname: '/student/center' });
          }
        } else {
          /* ======老师登录======= */
          // 获取学校列表
          const param = { accountId: userId };
          const campusListResponse = yield call(queryCampusList, param);
          if (campusListResponse.responseCode === '200') {
            yield put({
              type: 'saveCampusList',
              payload: campusListResponse.data,
            });

            // 用户信息已拿到，路由到对应的页面(目前只有老师角色)
            const { data } = campusListResponse;
            if (data.length > 0) {
              // 保存当前校区对应的用户头像ID
              const { teacherId } = data[0];
              localStorage.setItem('teacherId', teacherId);
              const userName = data[0].name;
              localStorage.setItem('userName', userName || '');
              const { campusId } = data[0];
              localStorage.setItem('campusId', campusId);
              const { campusName } = data[0];
              localStorage.setItem('campusName', campusName || '');
              const { tenantId } = data[0];
              localStorage.setItem('tenantId', tenantId);
              const { isAdmin } = data[0];
              localStorage.setItem('isAdmin', isAdmin);
              const { isSubjectAdmin } = data[0];
              localStorage.setItem('isSubjectAdmin', isSubjectAdmin);
            }

            yield put({
              type: 'changeAuthorStatus',
              payload: {
                currentAuthority: 'admin',
              },
            });

            reloadAuthorized();
            window.location.href = '/home';
            // yield put(
            //   routerRedux.push({
            //     pathname: '/home',
            //   }),
            // );
          }
        }
      } else if (response.status === 500) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            errInfo: '非常抱歉，服务器淘气了！',
            errCode: '401',
          },
        });
        localStorage.clear();
      } else {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            errInfo: response.data,
            errCode: response.responseCode,
          },
        });
        localStorage.clear();
      }
    },
    *logout(_, { put }) {
      // const response = yield call(userLogout, payload);
      // const { responseCode } = response;
      // if (responseCode !== '200') return;
      // localStorage.removeItem('access_token');
      // localStorage.removeItem('uid');
      // localStorage.removeItem('mobile');
      // localStorage.removeItem('vbNumber');
      // localStorage.removeItem('teacherId');
      // localStorage.removeItem('userName');
      // localStorage.removeItem('campusId');
      // localStorage.removeItem('campusName');
      // localStorage.removeItem('nickName');
      // localStorage.removeItem('antd-pro-authority');
      // localStorage.removeItem('vb-pro-authority');

      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
          currentAuthority: 'guest',
          userId: '',
          access_token: '',
        },
      });
      reloadAuthorized();
      localStorage.clear();
      yield put(
        routerRedux.push({
          pathname: '/user/login',
        })
      );
    },

    // 查询校区列表
    *queryCampusList({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(queryCampusList, payload);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveCampusList',
        payload: data,
      });
      callback(data);
    },

    // 保存当前头像URL
    *saveAvatarUrl({ payload }, { put }) {
      yield put({
        type: 'saveUserAvatarUrl',
        payload: payload.url,
      });
    },

    // 切换当前校区
    *switchCurrentCampus({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(switchCampus, payload.value);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveCampusID',
        payload: payload.campusId,
      });
      message.warning(formatMessage(messagesInfo.changeSchool));
      callback(responseCode);
    },

    // 获取当前校区所在的老师信息
    *getUserDetail({ payload, callback }, { call }) {
      const { responseCode, data } = yield call(getUserDetail, payload);
      if (responseCode !== '200' || data == null) return;
      if (responseCode === '200') {
        // 存储用户角色id
        const teacherId = data.id;
        localStorage.setItem('teacherId', teacherId);
        const userName = data.name;
        localStorage.setItem('userName', userName);
        callback();
      }
    },

    *resendInvitation({ payload, callback }, { call }) {
      const response = yield call(resendInvitate, payload);
      const { responseCode, data } = response;
      if (responseCode && responseCode === '460') {
        const mgs = formatMessage({ id: data, defaultMessage: '已重新向教师发出校区邀请！' });
        message.warning(mgs);
        return;
      }
      callback(response);
    },

    // 修改老师信息
    *editTeacherInfo({ payload, callback }, { call }) {
      const { responseCode, data } = yield call(editTeacherBasic, payload);
      if (responseCode !== '200' || data == null) {
        message.warning(data);
        return;
      }

      message.success(formatMessage(messagesInfo.editInfo));
      callback(responseCode);
    },
    // 修改老师信息

    *editTeacherInfoHeaderMobile({ payload, callback }, { call, put }) {
      const uid = localStorage.getItem('uid');
      const response = yield call(editTeacherInfo, { ...payload, accountId: uid });
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveAvater',
        payload: payload.avatar,
      });
      callback(response);
    },

    // 修改手机号

    *changeMobile({ payload, callback }, { call }) {
      const response = yield call(changeTeacherMobile, payload);
      callback(response);
    },

    // 修改老师密码
    *editTeacherPassword({ payload, callback }, { call }) {
      const response = yield call(editTeacherBasicPwd, payload);
      if (response) {
        callback(response);
      }
      // if (responseCode !== '200' || data == null) {
      //   callback(data)
      //   return;
      // }
      // message.success(formatMessage(messagesInfo.saveInfo));
      // localStorage.clear();
      // window.location.href='/user/login'
    },

    // 检查手机注册了几个身份
    *queryMobileTeacher({ payload, callback }, { call, put }) {
      const response = yield call(queryMobileTeacherIdentity, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200' || data == null) {
        message.warning(data);
        return;
      }
      yield put({
        type: 'saveIndentity',
        payload: data,
      });
      callback(response);
    },

    // 获取验证码
    *validateCode({ payload, callback }, { call }) {
      const response = yield call(getValidateCode, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },

    *EditMobile({ payload, callback }, { call }) {
      const response = yield call(getEditMobile, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *delIndentity({ payload }, { put }) {
      yield put({
        type: 'saveIndentity',
        payload,
      });
    },
    *checkSNcode({ payload, callback }, { call }) {
      const response = yield call(checkSN, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    *getTeacherIdInfo({ payload, callback }, { call }) {
      const response = yield call(getAccountId, payload);
      if (response) {
        if (callback) {
          callback(response);
        }
      }
    },
    // 重置密码信息
    *resetPWInfo({ payload, callback }, { call }) {
      const response = yield call(resetPWInfo, payload);
      const { responseCode, data } = response;
      if (responseCode !== '200') {
        message.warning(data);
        return;
      }
      if (callback) {
        callback(response);
      }
    },

    // 查询学生绑定信息
    *queryStudentInfoList({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(queryAllBoundStudentInfo, payload);
      if (responseCode !== '200' || data == null) return;
      yield put({
        type: 'saveStudentInfoList',
        payload: data,
      });
      if (typeof callback === 'function') {
        callback(data);
      }
    },

    *editStudentInfo({ payload, callback }, { call, put }) {
      const { responseCode, data } = yield call(editTeacherBasic, payload);
      if (responseCode !== '200' || data == null) {
        message.warning(data);
        return;
      }
      yield put({
        type: 'saveAvater',
        payload: data.avatar,
      });
      if (callback) callback();
    },

    // 学生切换校区
    *studentSwitchCampus({ payload, callback }, { call }) {
      const { responseCode, data } = yield call(studentSwitchCampus, payload);
      if (responseCode !== '200' || data == null) {
        message.warning(data);
        return;
      }

      if (callback) callback();
    },

    // 判断是否注册过
    *isRegister({ payload, callback }, { call }) {
      const response = yield call(isRegister, payload);
      if (callback) {
        callback(response);
      }
    },

    *getState(_, { select }) {
      return yield select(state => state.login);
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(
        payload.currentAuthority,
        payload.access_token,
        payload.userId,
        payload.mobile || ''
      );
      return {
        ...state,
        status: payload,
      };
    },

    changeAuthorStatus(state, { payload }) {
      setNewAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload,
      };
    },
    saveCampusList(state, { payload }) {
      return {
        ...state,
        campusList: payload,
      };
    },
    saveStudentInfoList(state, { payload }) {
      return {
        ...state,
        studentInfoList: payload,
      };
    },
    saveAvater(state, { payload }) {
      return {
        ...state,
        avatar: payload,
      };
    },
    saveUserAvatarUrl(state, { payload }) {
      return {
        ...state,
        avatarUrl: payload,
      };
    },
    saveCampusID(state, { payload }) {
      return {
        ...state,
        campusID: payload,
      };
    },
    saveIndentity(state, { payload }) {
      return {
        ...state,
        identityList: payload,
      };
    },
  },

  subscriptions: {
    // 实时监听 storeage 中 的 identityCode, 如果值发生变动，且和本地不一样，则跳转到切换页面
    listenIdentityCode({ history }) {
      // 教师角色
      const teacherRule = [
        '/artificial',
        '/home',
        '/examination',
        '/campusmanage',
        '/classallocation',
        '/papermanage',
        '/notice',
        '/account',
      ];

      // 学生角色
      const studentRule = ['/student', '/task'];

      return history.listen(({ pathname }) => {
        // 判断当期页面和 老师学生的角色是否对象
        const identityCode = localStorage.getItem('identityCode');
        const accessToken = localStorage.getItem('access_token');

        // 没有角色信息，不做页面跳转现在
        if (!identityCode || !accessToken) return;

        if (
          identityCode === 'ID_TEACHER' &&
          studentRule.some(item => pathname.indexOf(item) === 0)
        ) {
          window.location.href = '/user/togglerole';
        }

        if (
          identityCode === 'ID_STUDENT' &&
          teacherRule.some(item => pathname.indexOf(item) === 0)
        ) {
          window.location.href = '/user/togglerole';
        }
      });
    },
  },
};
