// https://umijs.org/config/
import os from 'os';
import pageRoutes from './router.config';
import webpackPlugin from './plugin.config';
import defaultSettings from '../src/defaultSettings';
import getConfig from './env/envConfig';
import slash from 'slash2';

const { pwa, primaryColor } = defaultSettings;
const envConfig = getConfig();

const plugins = [
  [
    'umi-plugin-react',
    {
      antd: true,
      dva: {
        hmr: true,
      },
      locale: {
        enable: true, // default false
        default: 'zh-CN', // default zh-CN
        baseNavigator: true, // default true, when it is true, will use `navigator.language` overwrite default
      },
      // dynamicImport: {
      //   loadingComponent: './components/PageLoading/index',
      //   webpackChunkName: true,
      //   level: 3,
      // },
      pwa: false,
      ...(!process.env.TEST && os.platform() === 'darwin'
        ? {
            dll: {
              include: ['dva', 'dva/router', 'dva/saga', 'dva/fetch'],
              exclude: ['@babel/runtime'],
            },
            hardSource: false,
          }
        : {}),
      // 如果是生产环境，在 head头里面 引入public中的locales.js 文件
      ...(process.env.NODE_ENV !== 'development'
        ? {
            headScripts: [{ src: `/locales.js?${envConfig.commit_id}` }],
          }
        : {}),
    },
  ],
];

// 针对 preview.pro.ant.design 的 GA 统计代码
// 业务上不需要这个
if (process.env.APP_TYPE === 'site') {
  plugins.push([
    'umi-plugin-ga',
    {
      code: 'UA-72788897-6',
    },
  ]);
}

export default {
  // add for transfer to umi
  plugins,
  hash: true,
  define: {
    APP_TYPE: process.env.APP_TYPE || '',
    APP_ENV: process.env.APP_ENV || '',
    ENV_CONFIG: envConfig,
  },
  treeShaking: true,
  targets: {
    ie: 10,
    firefox: 25,
    chrome: 30,
  },
  // 路由配置
  routes: pageRoutes,
  // Theme for antd
  // https://ant.design/docs/react/customize-theme-cn
  theme: {
    'primary-color': primaryColor,
  },
  externals: {
    // ReferenceError: DataSet is not defined
    // 方式1：npm install @antv/data-set --save 并注释下方代码
    // 方式二：document.ejs引入dataset文件（<script src="https://gw.alipayobjects.com/os/antv/pkg/_antv.data-set-0.10.2/dist/data-set.min.js"></script>）
    // '@antv/data-set': 'DataSet'
  },
  /*
   * 配置服务器端
   * @author tina
   */
  proxy: {
    '/api': {
      target: envConfig.proxy,
      changeOrigin: true,
      secure: false,
    },
    '/downloadI10n': {
      target: envConfig.downloadLocalesApi,
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/downloadI10n': '' },
    },
  },

  // log日志
  uglifyJSOptions(opts) {
    if (process.env.NODE_ENV !== 'development') {
      opts.uglifyOptions.compress.pure_funcs = ['console.log'];
    }
    return opts;
  },

  extraBabelPlugins:
    process.env.BABEL_CACHE === 'none'
      ? [
          [
            'react-intl',
            {
              messagesDir: './i18n-messages',
              moduleSourceName: 'umi/locale',
            },
          ],
        ]
      : null,
  ignoreMomentLocale: true,
  lessLoaderOptions: {
    javascriptEnabled: true,
  },
  disableRedirectHoist: true,
  cssLoaderOptions: {
    modules: true,
    getLocalIdent: (context, localIdentName, localName) => {
      if (
        context.resourcePath.includes('node_modules') ||
        context.resourcePath.includes('ant.design.pro.less') ||
        context.resourcePath.includes('global.less')
      ) {
        return localName;
      }
      const match = context.resourcePath.match(/src(.*)/);
      if (match && match[1]) {
        const antdProPath = match[1].replace('.less', '');
        const arr = slash(antdProPath)
          .split('/')
          .map(a => a.replace(/([A-Z])/g, '-$1'))
          .map(a => a.toLowerCase());
        return `antd-pro${arr.join('-')}-${localName}`.replace(/--/g, '-');
      }
      return localName;
    },
  },
  manifest: {
    basePath: '/',
  },

  chainWebpack: webpackPlugin,
};
