import fetch from 'dva/fetch';
import { notification } from 'antd';
import hash from 'hash.js';
import { formatMessage } from 'umi/locale';
import { isAntdPro } from './utils';

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

// 忽略请求异常白名单
const whiteUrlList = [
  '/api/notification/message/unread-count/', // 站内信未读消息
];

// 忽略异常自定义错误消息
const whiteErrorMessage = { name: '请求异常，且当前请求存在于忽略处理白名单' };
/**
 * 忽略请求异常
 */
const isIgnoreException = url => {
  return whiteUrlList.some(item => url.includes(item));
  // if (whiteUrlList.some(item => url.includes(item))) {
  //   throw new Error("站内信未读消息请求失败")
  // }
};

// 提示信息( 后台返回 400 500 的时候显示 )
// 网络连接断开的报错，默认在1000ms 内只能出现一次
let showMessage = false;
const notificationFn = () => {
  if (!showMessage) {
    notification.warning({
      message: '系统开小差了，请稍后再试！',
    });
    showMessage = true;
    setTimeout(() => {
      showMessage = false;
    }, 1000);
  }
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [option] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, option) {
  // 发送任何请求前，先比较下，角色是否正确，不正确就跳转到正确的页面
  const identityCode = localStorage.getItem('identityCode');
  const accessToken = localStorage.getItem('access_token');
  const { pathname } = window.location;
  if (identityCode && accessToken) {
    if (identityCode === 'ID_TEACHER' && studentRule.some(item => pathname.indexOf(item) === 0)) {
      window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
      window.location.href = '/user/togglerole';
      throw new Error('用户权限不正确！');
    }
    if (identityCode === 'ID_STUDENT' && teacherRule.some(item => pathname.indexOf(item) === 0)) {
      window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
      window.location.href = '/user/togglerole';
      throw new Error('用户权限不正确！');
    }
  }

  const options = {
    expirys: isAntdPro(),
    ...option,
  };
  /**
   * Produce fingerprints based on url and parameters
   * Maybe url has the same parameters
   */
  const fingerprint = url + (options.body ? JSON.stringify(options.body) : '');
  const hashcode = hash
    .sha256()
    .update(fingerprint)
    .digest('hex');

  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  let taken = localStorage.getItem('access_token');

  if (
    window.location.href.indexOf('/user/resetpw') > 0 ||
    window.location.href.indexOf('/user/register') > 0
  ) {
    taken = null;
  }
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE'
  ) {
    if (!(newOptions.body && newOptions.body.formdata)) {
      // 非fromData提交

      if (taken && taken !== 'undefined') {
        newOptions.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `bearer ${taken}`,
          ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
      } else {
        newOptions.headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
          ...newOptions.headers,
        };
        newOptions.body = JSON.stringify(newOptions.body);
      }
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        Authorization: 'Basic d2ViYXBwMjphZG1pbg==',
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        ...newOptions.headers,
      };
      let ret = '';
      for (let it in newOptions.body) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(newOptions.body[it]) + '&';
      }
      newOptions.body = ret;
    }
  } else {
    if (taken && taken !== 'undefined') {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `bearer ${taken}`,
        ...newOptions.headers,
      };
    } else {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
    }
  }

  const expirys = options.expirys && 60;
  // options.expirys !== false, return the cache,
  if (options.expirys !== false) {
    const cached = sessionStorage.getItem(hashcode);
    const whenCached = sessionStorage.getItem(`${hashcode}:timestamp`);
    if (cached !== null && whenCached !== null) {
      const age = (Date.now() - whenCached) / 1000;
      if (age < expirys) {
        const response = new Response(new Blob([cached]));
        return response.json();
      }
      sessionStorage.removeItem(hashcode);
      sessionStorage.removeItem(`${hashcode}:timestamp`);
    }
  }
  // 记录超时时间
  const requestTimeOut = new Promise(resolve => {
    // 设置五秒超时时间
    setTimeout(() => {
      resolve('timeout');
    }, 50000);
  });

  // 获取请求数据
  const requestApi = fetch(url, newOptions);

  return Promise.race([requestTimeOut, requestApi])
    .then(response => {
      if (response === 'timeout') {
        // 跳转到跟目录中
        window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
        // window.location.href = '/exception/500';
        notificationFn();
        return Promise.resolve();
      }

      if (newOptions.method === 'DELETE' || response.status === 204) {
        return response.text();
      }
      if (response.status <= 504 && response.status >= 500) {
        if (isIgnoreException(url)) {
          return Promise.reject(whiteErrorMessage);
        }

        window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
        // window.location.href = '/exception/500';
        notificationFn();
        return Promise.resolve();
      }
      if (response.status >= 404 && response.status < 422) {
        if (isIgnoreException(url)) {
          return Promise.reject(whiteErrorMessage);
        }

        window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
        // window.location.href = '/exception/404';
        notificationFn();
        return Promise.resolve();
      }
      return response.json();
    })
    .then(item => {
      const tokens = localStorage.getItem('access_token');
      const urlContains =
        window.location.href.indexOf('/user/register') > 0 ||
        window.location.href.indexOf('/user/login') > 0 ||
        window.location.href.indexOf('/user/resetpw') > 0;
      if (item && item.responseCode === undefined && tokens === null && !urlContains) {
        window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
        window.location.href = '/user/login';
        localStorage.clear();
        return '';
      }
      if (
        (item && item.responseCode === '402') ||
        (item && item.error === 'invalid_token') ||
        (item && item.error === 'unauthorized')
      ) {
        window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
        window.location.href = '/user/login?token=noToken';
        localStorage.clear();
        return '';
      }
      if (item && item.responseCode === '403') {
        window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
        window.location.href = `/user/login?token=${item.error_description}`;
        localStorage.clear();
        return '';
      }
      const x = typeof item === 'string' ? JSON.parse(item) : item;
      if (!(x && x.responseCode)) {
        return x;
      }
      const { responseCode, ...params } = x;
      const { data } = params;

      if (responseCode !== '200') {
        /*
         * 处理后端返回带有INTERNAL *
         * */
        let newData = '';
        const dataStr = String(data);
        if (dataStr.indexOf('INTERNAL') !== -1) {
          const splitData = dataStr.split(':');
          newData = splitData[1];
        } else {
          newData = data;
        }
        // 去除空格
        const code = String(newData).replace(/^\s*|\s*$/g, '');
        params.data = formatMessage({ id: code });
        // if(responseCode==='460'||responseCode==='400') {
        //   message.warning(params.data)
        // }
      }
      return Promise.resolve({
        responseCode,
        ...params,
      });
    })
    .catch(e => {
      const status = e.name;
      // environment should not be used
      if (status === 403) {
        if (isIgnoreException(url)) {
          return Promise.reject(whiteErrorMessage);
        }

        window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
        // window.location.href = '/exception/403';
        notificationFn();
        return;
      }
      if (status <= 504 && status >= 500) {
        if (isIgnoreException(url)) {
          return Promise.reject(whiteErrorMessage);
        }
        window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
        // window.location.href = '/exception/500';
        notificationFn();
        return;
      }
      if (status >= 404 && status < 422) {
        if (isIgnoreException(url)) {
          return Promise.reject(whiteErrorMessage);
        }

        window.canChangeUrl = true; // 提示程序中，可以切换页面（通常用于beforeunload操作）
        // window.location.href = '/exception/404';
        notificationFn();
      }
      throw e;
    });
}
