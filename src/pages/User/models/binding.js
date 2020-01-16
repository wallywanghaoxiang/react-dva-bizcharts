import { userJoinCampus,getUserDetail } from '@/services/api';
import { setNewAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import { routerRedux } from 'dva/router';
import { getPageQuery } from '@/utils/utils';

export default {
    namespace: 'binding',
    state: {
      status: null,
    },
  
    effects: {
      *fetch({ payload }, { call, put }) {
        const response = yield call(userJoinCampus, payload);

        if (response.responseCode == '200') {

          // 获取老师、学生信息
        const userDetailResponse = yield call(getUserDetail);


        if (userDetailResponse.responseCode == "200") {

              //用户信息已拿到，路由到对应的页面(目前只有老师角色)
            
              //存储用户角色id
              const teacherId = userDetailResponse.data.id;
              localStorage.setItem('teacherId',teacherId);

              const campusId = userDetailResponse.data.campusId;
              localStorage.setItem('campusId',campusId);

              yield put({
                type: 'changeAuthorStatus',
                payload: {
                  currentAuthority:'admin',
                },
              });

              reloadAuthorized();
              const urlParams = new URL(window.location.href);
              const params = getPageQuery();
              let { redirect } = params;
              if (redirect) {
                const redirectUrlParams = new URL(redirect);
                if (redirectUrlParams.origin === urlParams.origin) {
                  redirect = redirect.substr(urlParams.origin.length);
                  if (redirect.startsWith('/#')) {
                    redirect = redirect.substr(2);
                  }
                } else {
                  window.location.href = redirect;
                  return;
                }
              }
              yield put(routerRedux.replace(redirect || '/'));
                


            }else if(userDetailResponse.responseCode == "462"){
              //拿不到用户信息 需要用户确认绑定

            }
          
          
        }
      },  
    },
  
    reducers: {
      changeAuthorStatus(state, { payload }) {
        setNewAuthority(payload.currentAuthority);
        return {
          ...state,
          status: payload
        };
      },
    },
  };

  