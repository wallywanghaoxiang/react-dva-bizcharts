import memoizeOne from 'memoize-one';
import isEqual from 'lodash/isEqual';
import { message } from 'antd';
import { formatMessage } from 'umi/locale';
import Authorized from '@/utils/Authorized';
import { menu } from '../defaultSettings';
import { getMyMenus, getUnPublicTask } from '@/services/api';

const { check } = Authorized;

// Conversion router to menu.
function formatter(data, parentAuthority, parentName) {
  return data
    .map(item => {
      if (!item.name || !item.path) {
        return null;
      }

      let locale = 'menu';
      if (parentName) {
        locale = `${parentName}.${item.name}`;
      } else {
        locale = `menu.${item.name}`;
      }
      // if enableMenuLocale use item.name,
      // close menu international
      const name = menu.disableLocal
        ? item.name
        : formatMessage({ id: locale, defaultMessage: item.name });
      const result = {
        ...item,
        name,
        locale,
        authority: item.authority || parentAuthority,
      };
      if (item.routes) {
        const children = formatter(item.routes, item.authority, locale);
        // Reduce memory usage
        result.children = children;
      }
      delete result.routes;
      return result;
    })
    .filter(item => item);
}

const memoizeOneFormatter = memoizeOne(formatter, isEqual);

/**
 * get SubMenu or Item
 */
const getSubMenu = item => {
  // doc: add hideChildrenInMenu
  if (item.children && !item.hideChildrenInMenu && item.children.some(child => child.name)) {
    return {
      ...item,
      children: filterMenuData(item.children), // eslint-disable-line
    };
  }
  return item;
};

/**
 * filter menuData
 */
const filterMenuData = menuData => {
  if (!menuData) {
    return [];
  }
  return menuData
    .filter(item => item.name && !item.hideInMenu)
    .map(item => check(item.authority, getSubMenu(item)))
    .filter(item => item);
};
/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 */
const getBreadcrumbNameMap = menuData => {
  const routerMap = {};

  const flattenMenuData = data => {
    data.forEach(menuItem => {
      if (menuItem.children) {
        flattenMenuData(menuItem.children);
      }
      // Reduce memory usage
      routerMap[menuItem.path] = menuItem;
    });
  };
  flattenMenuData(menuData);
  return routerMap;
};

const memoizeOneGetBreadcrumbNameMap = memoizeOne(getBreadcrumbNameMap, isEqual);

export default {
  namespace: 'menu',

  state: {
    menuData: [],
    routerData: [],
    breadcrumbNameMap: {},
    unPublicNum: 0, // 机评完成仍未发布成绩的任务数量
  },

  effects: {
    *getMenuData({ payload }, { call, put }) {
      const { responseCode, data } = yield call(getMyMenus, payload);
      if (responseCode !== '200' || data == null) return;
      const { routes, authority } = payload;
      const originalMenuData = memoizeOneFormatter(routes, authority);
      originalMenuData.forEach((menuInfo, index) => {
        originalMenuData[index].authority = '';
        if (menuInfo.children) {
          menuInfo.children.forEach((child, index2) => {
            originalMenuData[index].children[index2].authority = '';
          });
        }
      });
      const menuData = filterMenuData(originalMenuData);

      if (data) {
        const allMenu = [
          { HOMEPAGE: 'menu.home' },
          { EXAM_MANAGE: 'menu.examination' },
          { EXAM_PULISH: 'menu.examination.release' },
          { EXAM_CHECK_MANAGE: 'menu.examination.inspect' },
          { PAPER_MANAGE: 'menu.papermanage' },
          { CAMPUS_PAPER_MANAGE: 'menu.papermanage.schoolpaper' },
          { PERSONAL_PAPER_MANAGE: 'menu.papermanage.mypaper' },
          { CAMPUS_MANAGE: 'menu.campusmanage' },
          { CAMPUS_BASIC_MANAGE: 'menu.campusmanage.basicset' },
          { TEACHING_CLASS_MANAGE: 'menu.campusmanage.teachingClass' },
          { TEACHER_MANAGE: 'menu.campusmanage.teacherMange' },
          { SUBJECT_ADMIN_MANAGE: 'menu.campusmanage.subjectManage' },
          { NATURAL_CLASS_MANAGE: 'menu.campusmanage.classset' },
          { COMPUTER_ROOM_MANAGE: 'menu.campusmanage.mediceset' },
          { TEACHER_MANAGE: 'menu.teachermanage' },
          { CLASS_BASIC_MANAGE: 'menu.classallocation' },
          { CLASS_MANAGE: 'menu.classallocation.classmanage' },
          { LEARNING_GROUP_MANAGE: 'menu.classallocation.learninggroup' },
          { EXAM_UNIFIED_MANAGE: 'menu.examination.uexam' }
        ];
        data.forEach(item => {
          allMenu.forEach(vo => {
            if (vo[item.code]) {
              menuData.forEach((menuInfo, index) => {
                if (menuInfo.locale === vo[item.code]) {
                  menuData[index].authority = 'admin';
                }
                if (menuInfo.children) {
                  menuInfo.children.forEach((child, index2) => {
                    if (child.locale === vo[item.code]) {
                      menuData[index].children[index2].authority = 'admin';
                    }
                  });
                }
              });
            }
          });
        });
      }
      // console.log(menuData)
      const breadcrumbNameMap = memoizeOneGetBreadcrumbNameMap(originalMenuData);
      yield put({
        type: 'save',
        payload: { menuData, breadcrumbNameMap, routerData: routes },
      });
    },
    *unPublicResultNum({ payload }, { call, put }) {
      const { responseCode, data } = yield call(getUnPublicTask, payload);
      if (responseCode !== '200') {
        message.warning(data);
        return;
      };
      yield put({
        type: 'saveNumber',
        payload: data,
      });
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    saveNumber(state, action) {
      return {
        ...state,
        unPublicNum: action.payload
      };
    },
  },
};
