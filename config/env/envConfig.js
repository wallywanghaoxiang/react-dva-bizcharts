const { argv } = require('yargs');

const localesDataIds = [
  '5dbbf2df279509006c4524fe', // 后台返回的字典库
  '5dbbf517279509006c452fb1', // 线上字典库
  '5dbbf3e2279509006c452a5e', // 公共组件字典库
];

// 默认配置项
const localServerConfig = {
  https: false, // 是否开启https服务
  port: 8000, // 默认开启端口
  privatePath: '/node_modules/', // 私有包的位置
  downloadLocalesApi: `https://front-basic-dev.aidoin.com/api/i10n/down?vids=${localesDataIds.join(
    ','
  )}`, // 下载字典库的网址
};

// 开发环境
const devConfig = {
  proxy: 'https://campusweb-dev.aidoin.com',
};

// 测试环境
const sitConfig = {
  // sit - proxy
  proxy: 'https://campusweb-sit.aidoin.com',
};

// 生产环境
const proConfig = {
  proxy: 'https://campusweb-uat.gaocloud.com',
};

module.exports = () => {
  // 获取当期的环境
  let currentEnv = {};
  const type = typeof argv.env === 'object' ? argv.env.pop() : argv.env;
  if (!type || type === 'dev') {
    currentEnv = { ...devConfig };
  } else if (type === 'sit') {
    currentEnv = { ...sitConfig };
  } else if (type === 'pro') {
    currentEnv = { ...proConfig };
  }
  return {
    projectName: 'campusWeb',
    ...localServerConfig,
    ...currentEnv,
    ...argv,
    env: type,
  };
};
