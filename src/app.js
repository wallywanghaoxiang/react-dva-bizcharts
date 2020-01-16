import fetch from 'dva/fetch';
import frontlibModels from '@/frontlib/models';
import router from 'umi/router';

export const dva = {
  config: {
    onError(err) {
      console.log(err);
      // throw new Error(err);
      // err.preventDefault();
    },
  },
};

let authRoutes = {};

function ergodicRoutes(routes, authKey, authority) {
  routes.forEach(element => {
    if (element.path === authKey) {
      if (!element.authority) element.authority = []; // eslint-disable-line
      Object.assign(element.authority, authority || []);
    } else if (element.routes) {
      ergodicRoutes(element.routes, authKey, authority);
    }
    return element;
  });
}

export function patchRoutes(routes) {
  Object.keys(authRoutes).map(authKey =>
    ergodicRoutes(routes, authKey, authRoutes[authKey].authority)
  );
  window.g_routes = routes;
}

export async function render(oldRender) {
  // 注册公共组件内 Models
  if (frontlibModels && frontlibModels.length > 0) {
    frontlibModels.forEach(m => {
      window.g_app.model(m);
    });
  }

  // 去获取 中文字体库
  if (process.env.NODE_ENV === 'development') {
    window.g_locales = {};
    try {
      console.log('翻译库加载成功！');
      const data = await fetch('/downloadI10n', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json; charset=utf-8',
        },
        mode: 'cors',
      }).then(response => response.json());
      window.g_locales = data || {};
    } catch (err) {
      console.log('翻译库加载失败！', err);
    }
    oldRender();
  } else {
    if (!window.g_locales) {
      window.g_locales = {};
    }
    oldRender();
  }
}
