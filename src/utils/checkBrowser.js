/*
 * @Description: 获取浏览器配置的相关方法
 * @Version: v0.1
 * @export: []
 * @export.default: checkBrowser
 */
/* eslint-disable no-cond-assign */


/**
 * @name: checkBrowser
 * @description: 获取当期浏览器相关信息
 * @param null
 * @return: {Object} {
 *  browser  : chrome|ie|firefox
 *  version : 浏览器版本
 * }
 */

const checkBrowser = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  let s;

  // 判断是否是 小于ie11 的 ie浏览器
  if( s = userAgent.match(/msie ([\d.]+)/) ){
    return {
      browser: 'IE',
      version: parseInt(s[1].split('.')[0],10),
      userAgent
    }
  }

  // 判断是否是 大于等于ie11 的ie浏览器
  if( s = userAgent.match(/trident.*rv:([\d.]+)/) ){
    return {
      browser: 'IE',
      version: parseInt(s[1].split('.')[0],10),
      userAgent
    }
  }

  // 判断是否是firefox浏览器
  if( s = userAgent.match(/firefox\/([\d.]+)/) ){
    return {
      browser: 'firefox',
      version: parseInt(s[1].split('.')[0],10),
      userAgent
    }
  }

  // 判断是否是chrome浏览器
  if( s = userAgent.match(/chrome\/([\d.]+)/) ){
    return {
      browser: 'chrome',
      version: parseInt(s[1].split('.')[0],10),
      userAgent
    }
  }

  // 判断是否是opera浏览器
  if( s = userAgent.match(/opera.([\d.]+)/) ){
    return {
      browser: 'opera',
      version: parseInt(s[1].split('.')[0],10),
      userAgent
    }
  }

  // 判断是否是safar浏览器
  if( s = userAgent.match(/version\/([\d.]+).*safari/) ){
    return {
      browser: 'safari',
      version: parseInt(s[1].split('.')[0],10),
      userAgent
    }
  }

  return {
    browser: "",
    version: 0,
    userAgent
  }
}


export default checkBrowser;
