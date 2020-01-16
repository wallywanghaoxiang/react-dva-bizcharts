
import React, { PureComponent } from 'react';
import { Divider, Modal } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import cs from "classnames";
import styles from './index.less';
import browserVersionPic from '@/assets/browser/browser_version_pic.png';
import browser360Pic from '../assets/window_360.png';
import browserQqPic from '../assets/window_qq.png';

const messages = defineMessages({
  title: { id: 'app.message.browser.for.train.title', defaultMessage: '为了体验正式的考试环境，请使用更现代化的浏览器！' },
  tag: { id: 'app.message.browsers.for.train.tag', defaultMessage: '课后训练采用最先进的人工智能技术' },
  download: { id: 'app.browser.download', defaultMessage: '去下载' },
  howToChange: { id: 'app.message.browser.change.mode', defaultMessage: '查看如何切换为极速模式' },
  rapidMode: { id: "app.text.rapid.mode", defaultMessage: "极速模式" },
  "360Browser": { id: "app.text.360.browser", defaultMessage: "360浏览器" },
  qqBrowser: { id: "app.text.qq.browser", defaultMessage: "QQ浏览器" }
})

class Browser extends PureComponent {

  state={
    show : false
  }

  browserArr = [
    {
      title: "Chrome 47+",
      mode: "",
      url: "https://www.google.cn/chrome/"
    }, {
      title: formatMessage(messages['360Browser']),
      mode: formatMessage(messages.rapidMode),
      url: "https://browser.360.cn/ee/"
    }, {
      title: formatMessage(messages.qqBrowser),
      mode: formatMessage(messages.rapidMode),
      url: "https://browser.qq.com"
    }
  ];

  // 去下载
  download = (url) => {
    window.open(url);
  }

  // 如何切换模式
  howChangeMode=()=>{
    const {show} = this.state;
    this.setState({show:!show});
  }

  render() {
    const {show} = this.state;
    return (
      <div className={styles.browserContainer}>
        <img src={browserVersionPic} className={styles.img} alt="" />


        <div className={styles.littleText}>
          {formatMessage(messages.tag)}
        </div>

        <div className={styles.bigText}>
          {formatMessage(messages.title)}
        </div>

        <div className={styles.bottomContainer}>
          {
            this.browserArr.map(item => (
              <div className={styles.item} key={item.title}>
                <div className={styles.title}>{item.title}</div>
                <div className={styles.mode}>{item.mode}</div>
                <Divider className={styles.vertical} />
                <div className={styles.download} onClick={() => this.download(item.url)}>
                  {formatMessage(messages.download)}
                  <i className={cs('iconfont', 'icon-next')} />
                </div>
              </div>
            ))
          }
        </div>

        <div className={styles.change} onClick={this.howChangeMode}>
          {formatMessage(messages.howToChange)}
        </div>

        <Modal
          wrapClassName={styles['browser-change-mode']}
          visible={show}
          footer={null}
          onCancel={this.howChangeMode}
          centered
          width={775}
          title="如何切换极速模式"
        >
          <div className={styles.tab}>
            <div className={cs(styles.title,styles["360-browser"])}>360安全浏览器</div>
            <div className={styles.img}>
              <img src={browser360Pic} alt="" />
            </div>
          </div>

          <Divider style={{marginTop:0}} />

          <div className={styles.tab}>
            <div className={cs(styles.title,styles["qq-browser"])}>QQ浏览器</div>
            <div className={styles.img}>
              <img src={browserQqPic} alt="" />
            </div>
          </div>

        </Modal>

      </div>
    )
  }
}

export default Browser
