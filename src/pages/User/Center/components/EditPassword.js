// 修改密码
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import { Button, Form, Modal } from 'antd';
import PwdInput from '@/components/aidoin/PwdInput';
import styles from './index.less';

const messages = defineMessages({
  pwInputPlaceholder: {
    id: 'app.account.pw.input.placeholder',
    defaultMessage: '请输入6-20位密码，区分大小写',
  },
  nowPassword: { id: 'app.menu.account.nowPassword', defaultMessage: '请输入当前密码' },
  confirmPWTip: { id: 'app.menu.account.rePassword', defaultMessage: '确认密码' },
  editPassword: { id: 'app.menu.account.editPassword', defaultMessage: '修改密码' },
  submitText: { id: 'app.submit', defaultMessage: '完成' },
  phoneInputTip1: { id: 'app.user.login.account.tip1', defaultMessage: '手机输入格式不正确！' },
  passwordTip1: { id: 'app.user.login.password.tip1', defaultMessage: '密码为6位以上非中文字符！' },
  passwordNoEquel: {
    id: 'app.user.register.confirm.no.equel.tip',
    defaultMessage: '两次密码输入不一致！',
  },
  passwordTip: { id: 'app.user.login.password.tip', defaultMessage: '请输入新密码！' },
  passwordTipSubmit: {
    id: 'app.user.login.password.passwordTipSubmit',
    defaultMessage: '请输入确认密码！',
  },
  updatePWSuccessTip1: {
    id: 'app.update.pw.success.tip1',
    defaultMessage: '密码修改成功，请重新登录！',
  },
  updatePWSuccessTip2: { id: 'app.update.pw.success.tip2', defaultMessage: '正在跳转到登录页…' },
});

@connect(({ login }) => {
  const { campusList } = login;
  return { campusList };
})
@Form.create()
class BasicSet extends Component {
  state = {
    pwVisibile: false, // 密码是否可见
    confirmPWVisibile: false,
    nowPwVisibile: false,
    errorInfo: '',
    visible: false,
  };

  componentWillMount() {}

  handleSubmit = () => {
    const { form, dispatch } = this.props;
    // const that = this;
    form.validateFields((err, values) => {
      const { nowpassword, password, confirmPwd } = values;
      if (!nowpassword) {
        // const input = that.input1;
        // input.focus();
        this.setState({ errorInfo: err.nowpassword.errors[0].message });
      } else if (!password) {
        // const input = that.input2;
        // input.focus();
        this.setState({ errorInfo: err.password.errors[0].message });
      } else if (!confirmPwd) {
        // const input = that.input3;
        // input.focus();
        this.setState({ errorInfo: err.confirmPwd.errors[0].message });
      } else {
        if (password.length < 6 || confirmPwd.length < 6) {
          const mgs = formatMessage(messages.passwordTip1);
          this.setState({ errorInfo: mgs });
          return;
        }
        if (password !== confirmPwd) {
          const mgs = formatMessage(messages.passwordNoEquel);
          this.setState({ errorInfo: mgs });
          return;
        }

        this.setState({ errorInfo: '' });
        const uid = localStorage.getItem('uid');
        dispatch({
          type: 'login/editTeacherPassword',
          payload: {
            accountId: uid,
            confirmPwd,
            originalPassword: nowpassword,
            password,
          },
          callback: res => {
            const { data, responseCode } = res;
            if (responseCode !== '200') {
              this.setState({ errorInfo: data });
            } else {
              this.setState({
                visible: true,
              });
              localStorage.clear();
              setTimeout(() => {
                window.location.href = '/user/login';
              }, 3000);
            }
          },
        });
      }
    });
  };

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const { pwVisibile, confirmPWVisibile, errorInfo, nowPwVisibile, visible } = this.state;
    const pwSuffix = (
      <i className="iconfont icon-lock" style={{ color: '#888', fontSize: '16px' }} />
    );
    return (
      <div className={styles.basicSet}>
        <h1 className={styles.nowTitle}>{formatMessage(messages.editPassword)}</h1>
        <div className={styles.userInfo}>
          <div className={styles.userPassword}>
            <Form className="form">
              <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="password-item">
                {getFieldDecorator('nowpassword', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage(messages.nowPassword),
                    },
                    {
                      pattern: /^\\w{6,18}$/,
                      message: formatMessage(messages.passwordTip1),
                    },
                    {
                      validator: this.pwValidate,
                    },
                  ],
                })(
                  <PwdInput
                    ref={input1 => {
                      this.input1 = input1;
                    }}
                    prefix={pwSuffix}
                    type={nowPwVisibile ? 'text' : 'password'}
                    maxLength={20}
                    placeholder={formatMessage(messages.nowPassword)}
                  />
                )}
                <div
                  className="visibile"
                  onClick={() => {
                    this.setState({ nowPwVisibile: !nowPwVisibile });
                  }}
                >
                  <i className={nowPwVisibile ? 'iconfont icon-eye' : 'iconfont icon-hide'} />
                </div>
              </Form.Item>
              <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="password-item">
                {getFieldDecorator('password', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage(messages.passwordTip),
                    },
                    {
                      pattern: /^\\w{6,18}$/,
                      message: formatMessage(messages.passwordTip1),
                    },
                    {
                      validator: this.pwValidate,
                    },
                  ],
                })(
                  <PwdInput
                    ref={input2 => {
                      this.input2 = input2;
                    }}
                    prefix={pwSuffix}
                    type={pwVisibile ? 'text' : 'password'}
                    maxLength={20}
                    placeholder={formatMessage(messages.pwInputPlaceholder)}
                  />
                )}
                <div
                  className="visibile"
                  onClick={() => {
                    this.setState({ pwVisibile: !pwVisibile });
                  }}
                >
                  <i className={pwVisibile ? 'iconfont icon-eye' : 'iconfont icon-hide'} />
                </div>
              </Form.Item>
              <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="password-item">
                {getFieldDecorator('confirmPwd', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage(messages.passwordTipSubmit),
                    },
                    {
                      pattern: /^\\w{6,18}$/,
                      message: formatMessage(messages.passwordTip1),
                    },
                    {
                      validator: this.pwValidate,
                    },
                  ],
                })(
                  <PwdInput
                    ref={input3 => {
                      this.input3 = input3;
                    }}
                    prefix={pwSuffix}
                    type={confirmPWVisibile ? 'text' : 'password'}
                    maxLength={20}
                    placeholder={formatMessage(messages.confirmPWTip)}
                  />
                )}
                <div
                  className="visibile"
                  onClick={() => {
                    this.setState({ confirmPWVisibile: !confirmPWVisibile });
                  }}
                >
                  <i className={confirmPWVisibile ? 'iconfont icon-eye' : 'iconfont icon-hide'} />
                </div>
              </Form.Item>
              <Form.Item>{errorInfo && <div className="errorInfo">{errorInfo}</div>}</Form.Item>
            </Form>
          </div>
          <div>
            <Button className={styles.complete} onClick={this.handleSubmit}>
              {formatMessage(messages.submitText)}
            </Button>
          </div>
        </div>
        <Modal
          wrapClassName={styles.updatePWModal}
          title=""
          visible={visible}
          destroyOnClose
          centered
          closable={false}
          maskClosable={false}
          width={360}
          footer={null}
        >
          <div className={styles.updatePWSuccess}>
            <div className={styles.successIcon}>
              <i className="iconfont icon-right" />
            </div>
            <p className={styles.successTip1}>{formatMessage(messages.updatePWSuccessTip1)}</p>
            <p className={styles.successTip2}>{formatMessage(messages.updatePWSuccessTip2)}</p>
          </div>
        </Modal>
      </div>
    );
  }
}

export default BasicSet;
