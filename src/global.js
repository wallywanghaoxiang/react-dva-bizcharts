import React from 'react';
import { notification, Button, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { setTheme } from "bizcharts";
import checkBrowser from "@/utils/checkBrowser";
import { BizChartColors } from '@/utils/color';
import defaultSettings from './defaultSettings';

// bizcharts 全局颜色配置
setTheme({
  colors: BizChartColors,
  colors_16: BizChartColors,
  colors_24: BizChartColors,
  colors_pie: BizChartColors,
  colors_pie_16: BizChartColors,
});

const { pwa } = defaultSettings;
// if pwa is true
if (pwa) {
  // Notify user if offline now
  window.addEventListener('sw.offline', () => {
    message.warning(formatMessage({ id: 'app.pwa.offline' }));
  });

  // Pop up a prompt on the page asking the user if they want to use the latest version
  window.addEventListener('sw.updated', e => {
    const reloadSW = async () => {
      // Check if there is sw whose state is waiting in ServiceWorkerRegistration
      // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration
      const worker = e.detail && e.detail.waiting;
      if (!worker) {
        return Promise.resolve();
      }
      // Send skip-waiting event to waiting SW with MessageChannel
      await new Promise((resolve, reject) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = event => {
          if (event.data.error) {
            reject(event.data.error);
          } else {
            resolve(event.data);
          }
        };
        worker.postMessage({ type: 'skip-waiting' }, [channel.port2]);
      });
      // Refresh current page to use the updated HTML and other assets after SW has skiped waiting
      window.location.reload(true);
      return true;
    };
    const key = `open${Date.now()}`;
    const btn = (
      <Button
        type="primary"
        onClick={() => {
          notification.close(key);
          reloadSW();
        }}
      >
        {formatMessage({ id: 'app.pwa.serviceworker.updated.ok' })}
      </Button>
    );
    notification.open({
      message: formatMessage({ id: 'app.pwa.serviceworker.updated' }),
      description: formatMessage({ id: 'app.pwa.serviceworker.updated.hint' }),
      btn,
      key,
      onClose: async () => { },
    });
  });
}

// 如果不满足浏览器条件，则阻塞整个umijs的运行
const {browser,version} = checkBrowser();
if( !browser ||
  !["IE","chrome","firefox" ].includes(browser) ||
    (browser === "IE" && version < 10) ||
      (browser === "chrome" && version < 30) ||
        (browser === "firefox" && version < 30)
){
  throw String("浏览器版本过低，影响系统使用！");
}
