import moment from 'moment';
import React from 'react';
import nzh from 'nzh/cn';
import { parse, stringify } from 'qs';

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - day * oneDay;

    return [moment(beginTime), moment(beginTime + (7 * oneDay - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [
      moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`),
      moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000),
    ];
  }

  const year = now.getFullYear();
  return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

export function digitUppercase(n) {
  return nzh.toMoney(n);
}

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  }
  if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    // 是否包含
    const isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData) {
  let routes = Object.keys(routerData).filter(
    routePath => routePath.indexOf(path) === 0 && routePath !== path
  );
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

export function getQueryPath(path = '', query = {}) {
  const search = stringify(query);
  if (search.length) {
    return `${path}?${search}`;
  }
  return path;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+(?::\d+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/;

export function isUrl(path) {
  return reg.test(path);
}

export function formatWan(val) {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';

  let result = val;
  if (val > 10000) {
    result = Math.floor(val / 10000);
    result = (
      <span>
        {result}
        <span
          style={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            marginLeft: 2,
          }}
        >
          万
        </span>
      </span>
    );
  }
  return result;
}

// 给官方演示站点用，用于关闭真实开发环境不需要使用的特性
export function isAntdPro() {
  return window.location.hostname === 'preview.pro.ant.design';
}

export const importCDN = (url, name) =>
  new Promise(resolve => {
    const dom = document.createElement('script');
    dom.src = url;
    dom.type = 'text/javascript';
    dom.onload = () => {
      resolve(window[name]);
    };
    document.head.appendChild(dom);
  });

/**
 * 去除空格
 *
 * @author tina.zhang
 * @date 2019-01-09
 * @export
 * @param {*} str
 * @param {*} is_global
 * @returns
 */
export function Trim(str, is_global) {
  var result;

  result = str.replace(/(^\s+)|(\s+$)/g, '');

  if (is_global.toLowerCase() == 'g') {
    result = result.replace(/\s/g, '');
  }

  return result;
}

/**
 * 手机号验证
 * * @author tina.zhang
 * @date 2019-01-09
 * @export
 * @param {*} str
 * @param {*} is_global
 * @returns
 */

export const phoneReg = /^(1|9)(2|3|4|5|6|7|8|9)\d{9}$/;

export function isAvailableIphone(phone) {
  const newPhone = Trim(phone, 'g');
  const myreg = phoneReg;
  if (!myreg.test(newPhone)) {
    return false;
  }
  return true;
}

/**
 * 时间戳转时间格式 年-月-日
 */
export function formatDateTime(time) {
  const date = new Date(time);
  const y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? '0' + m : m;
  var d = date.getDate();
  d = d < 10 ? '0' + d : d;
  return y + '-' + m + '-' + d;
}

/**
 * 时间戳转时间格式 年月日时分
 */

export function timestampToTime(timestamp) {
  const date = new Date(parseInt(timestamp));
  const Y = date.getFullYear() + '-';
  var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
  var D = change(date.getDate()) + ' ';
  var h = change(date.getHours()) + ':';
  var m = change(date.getMinutes());
  return Y + M + D + h + m;
}

function change(t) {
  if (t < 10) {
    return `0${t}`;
  } else {
    return t;
  }
}

// 根据时间判断星期几
// timedat参数格式：   getWeek（new Date("2017-10-27" )）
export function getWeek(date) {
  const timedat = new Date(date);
  let week = '';

  if (timedat.getDay() === 0) week = '星期日';

  if (timedat.getDay() === 1) week = '星期一';

  if (timedat.getDay() === 2) week = '星期二';

  if (timedat.getDay() === 3) week = '星期三';

  if (timedat.getDay() === 4) week = '星期四';

  if (timedat.getDay() === 5) week = '星期五';

  if (timedat.getDay() === 6) week = '星期六';

  return week;
}

export function isToday(str) {
  if (new Date(str).toDateString() === new Date().toDateString()) {
    // 今天
    return true;
  } else {
    // 之前
    return false;
  }
}

/**
 * 时间戳转时间格式 月日时分 6月14日 10:12
 */

export function timestampToDateMD(timestamp) {
  const date = new Date(parseInt(timestamp));
  // const Y = date.getFullYear() + '-';
  var M = date.getMonth() + 1 + '月';
  var D = date.getDate() + '日' + ' ';
  var h = change(date.getHours()) + ':';
  var m = change(date.getMinutes());
  return M + D + h + m;
}

/*
 * 手机号验证
 * * @author tina.zhang
 * @date 2019-04-24
 * @export
 * @returns
 */
export function isNumber(val) {
  const regPos = /^\d+(\.\d+)?$/; // 非负浮点数
  const regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/; // 负浮点数
  if (regPos.test(val) || regNeg.test(val)) {
    return true;
  } else {
    return false;
  }
}

// 用于生成uuid
function S4() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
/**
 * 设置uuid
 *
 * @author tina.zhang
 * @date 2018-12-20
 * @export
 * @param
 */
export function getUUID() {
  return S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4();
}

// 手机号中间四位变成*号
export function TransformSafeSymbolPhone(phoneNum) {
  var str = JSON.stringify(phoneNum);
  var str2 = str.substr(0, 4) + '****' + str.substr(8);
  return JSON.parse(str2);
}

// /**
//  * 秒转时分秒
//  *
//  * @author tina.zhang
//  * @date 2019-05-16
//  * @export
//  * @param {*} value
//  * @returns
//  */
// export function formatSeconds(value) {
//   let secondTime = parseInt(value);// 秒
//   let minuteTime = 0;// 分
//   let hourTime = 0;// 小时
//   if(secondTime > 60 || secondTime === 60) {// 如果秒数大于60，将秒数转换成整数
//       // 获取分钟，除以60取整数，得到整数分钟
//       minuteTime = parseInt(secondTime / 60);
//       // 获取秒数，秒数取佘，得到整数秒数
//       secondTime = parseInt(secondTime % 60);
//       // 如果分钟大于60，将分钟转换成小时
//       if(minuteTime > 60) {
//           // 获取小时，获取分钟除以60，得到整数小时
//           hourTime = parseInt(minuteTime / 60);
//           // 获取小时后取佘的分，获取分钟除以60取佘的分
//           minuteTime = parseInt(minuteTime % 60);
//       }
//   }
//   let result = "" + secondTime>0 ? (parseInt(secondTime) + "秒") : "";

//   if(minuteTime > 0) {
//       result = "" + parseInt(minuteTime) + "分钟" + result;
//   }
//   if(hourTime > 0) {
//       result = "" + parseInt(hourTime) + "小时" + result;
//   }
//   return result;
// }

// 延时
export function delay(time = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

/**
 * 格式化字符串
 * 用于文本长度限制，替换指定字符
 * @param {string} str - 原字符串
 * @param {number} length - 限制长度
 * @param {string} replaceStr - 替换字符串，默认'...'
 */
export function stringFormat(str, length, replaceStr = '...') {
  if (str && str.length > length) {
    return `${str.slice(0, length)}${replaceStr}`;
  }
  return str;
}

/**
 * 格式化日期 MM-dd 转换为 MM月dd日
 * @param {string} str - 日期格式  MM-dd
 */
export function formatMonthDay(str) {
  if (str.indexOf('-') >= 0) {
    const arr = str.split('-');
    return `${arr[0].replace(/\b(0+)/gi, '')}月${arr[1].replace(/\b(0+)/gi, '')}日`;
  }
  return str;
}
