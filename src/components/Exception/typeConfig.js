import proxyErro from '@/assets/proxy_erro_page_pic.png'

const config = {
  403: {
    img: proxyErro,
    title: '403',
    desc: '抱歉，你无权访问该页面',
  },
  404: {
    img: proxyErro,
    title: '404',
    desc: '抱歉，你访问的页面不存在',
  },
  500: {
    img: proxyErro,
    title: '500',
    desc: '抱歉，服务器出错了',
  },
};

export default config;
