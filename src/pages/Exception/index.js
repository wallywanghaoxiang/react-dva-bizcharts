/*
 * @Author: tina.zhang
 * @Date: 2019-01-03 11:32:23
 * @LastEditors: tina.zhang
 * @LastEditTime: 2019-05-08 17:22:50
 * @Description:
 * vb.getConfigurationManager().get()
 * angent 发生错误112，或为null的时候显示
 */
import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import { Card, Button } from 'antd';
import bg from './proxy_erro_page_pic.png';
import styles from './index.less';

const { Meta } = Card;

class AgentError extends PureComponent {
  defaultObj = {
    title: formatMessage({ id: 'app.title.what.happen', defaultMessage: '请配置发榜' }),
    msg: '',
    buttonText: formatMessage({ id: 'app.button.back.to.home', defaultMessage: '返回首页' }),
    buttonClick: () => {
      this.refresh();
    },
  };

  // 常用错误的相关参数
  handleObj = {
    // code 为 500 服务器异常相关
    500: {
      msg: formatMessage({
        id: 'app.message.lose.connect.and.check.it',
        defaultMessage: '连接服务器失败，请检查您的网络连接！',
      }),
    },
    400: {
      msg: formatMessage({ id: 'app.message.system.type.error', defaultMessage: '系统类型错误！' }),
    },
    403: {
      msg: formatMessage({
        id: 'app.message.server.refuse.request',
        defaultMessage: '服务器拒绝请求!',
      }),
    },
    404: {
      msg: formatMessage({
        id: 'app.message.server.not.find.request',
        defaultMessage: '服务器找不到对应的请求',
      }),
    },
  };

  componentDidMount() {
    // 默认去修改路由到根目录，防止页面刷新，还是留着此页面
    window.history.replaceState('', '', '/');
  }

  // 返回首页
  refresh = async () => {
    router.replace('/');
  };

  render() {
    const { match } = this.props;
    const { type } = match.params;

    const obj = {
      ...this.defaultObj,
      ...(this.handleObj[type] || {}),
    };

    return (
      <div className={styles.content}>
        <Card className={styles.card}>
          <Meta
            avatar={<img src={bg} alt="" style={{ width: 350, height: 240 }} />}
            description={
              <div className={styles.info}>
                <div className={styles.title}>{obj.title}</div>
                <div className={styles.msg}>{obj.msg}</div>
                {obj.buttonClick && typeof obj.buttonClick === 'function' ? (
                  <Button className={styles.button} onClick={obj.buttonClick}>
                    {obj.buttonText}
                  </Button>
                ) : null}
              </div>
            }
          />
        </Card>
      </div>
    );
  }
}

export default AgentError;
