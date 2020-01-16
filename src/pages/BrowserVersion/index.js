
import React, { PureComponent } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import BrowserBotton from './BrowserBotton';
import styles from './index.less';
import browserVersionPic from '@/assets/browser/browser_version_pic.png';
import browserVersionIe from '@/assets/browser/browser_version_ie.png';
import browserVersionChrome from '@/assets/browser/browser_version_chrome.png';
import browserVersionFirfox from '@/assets/browser/browser_version_firfox.png';


const messages = defineMessages({
  chrome: { id: 'app.browser.chrome', defaultMessage: '谷歌 浏览器' },
  update: { id: 'app.update.your.browser', defaultMessage: '为了更好的学习体验，请更新您的浏览器！' },
  Recommended: { id: 'app.Recommended.browsers', defaultMessage: '推荐浏览器' },
})

class Browser extends PureComponent {


  render() {
    const browserArr = [{
      icon: browserVersionIe,
      name: "Internet Explorer",
      version: "10+",
      url: "https://www.microsoft.com/en-us/download/internet-explorer.aspx"
    }, {
      icon: browserVersionChrome,
      name: formatMessage(messages.chrome),
      version: "30+",
      url: "https://www.google.cn/chrome/"
    }, {
      icon: browserVersionFirfox,
      name: "Firefox",
      version: "30+",
      url: "http://www.firefox.com.cn/"
    }];

    return (
      <div className={styles.browserContainer}>
        <img src={browserVersionPic} className={styles.img} alt="" />
        <div className={styles.bigText}>
          {formatMessage(messages.update)}
        </div>

        <div className={styles.littleText}>
          {formatMessage(messages.Recommended)}
        </div>
        <div className={styles.bottomContainer}>
          <BrowserBotton item={browserArr[0]} />
          <BrowserBotton item={browserArr[1]} />
          <BrowserBotton item={browserArr[2]} />
        </div>
      </div>
    )
  }
}

export default Browser
