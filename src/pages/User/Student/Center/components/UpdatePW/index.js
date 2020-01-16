import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Button, Modal } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import PwdInput from '@/components/aidoin/PwdInput';
import styles from './index.less';

const messages = defineMessages({
  currentPWInputPlaceholder: {
    id: 'app.student.current.pw.input.placeholder',
    defaultMessage: '请输入当前密码',
  },
  pwInputPlaceholder: {
    id: 'app.account.pw.input.placeholder',
    defaultMessage: '请输入6-20位密码，区分大小写',
  },
  pwInputPlaceholder2: {
    id: 'app.student.update.pw.confirm.input.placeholder',
    defaultMessage: '确认新密码',
  },
  currentPWTip: { id: 'app.user.login.password.current.tip', defaultMessage: '请输入当前密码！' },
  passwordTip: { id: 'app.user.login.password.tip', defaultMessage: '请输入密码！' },
  passwordTip1: { id: 'app.user.login.password.tip1', defaultMessage: '密码为6位以上非中文字符！' },
  confirmPWTip: {
    id: 'app.user.register.confirm.password.tip',
    defaultMessage: '请输入确认密码！',
  },
  passwordNoEquel: {
    id: 'app.user.register.confirm.no.equel.tip',
    defaultMessage: '两次密码输入不一致！',
  },
  submitBtnTit: { id: 'app.student.update.pw.btn.title', defaultMessage: '提交修改' },
  updatePWSuccessTip1: {
    id: 'app.update.pw.success.tip1',
    defaultMessage: '密码修改成功，请重新登录！',
  },
  updatePWSuccessTip2: { id: 'app.update.pw.success.tip2', defaultMessage: '正在跳转到登录页…' },
});

@Form.create()
@connect(() => ({}))
class UpdatePW extends Component {
  state = {
    currentPWVisibile: false,
    pwVisibile: false,
    confirmPWVisibile: false,
    errorInfo: '',
    visible: false,
  };

  componentWillMount() {}

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields((err, values) => {
      console.log(err);
      console.log(values);
      if (err) {
        const currentPWErrorJson = err.currentPW;
        const passwordErrorJson = err.password;
        const confirmPwdErrorJson = err.confirmPwd;
        if (currentPWErrorJson) {
          const { errors } = currentPWErrorJson;
          const mgs = errors[0].message;
          this.setState({
            errorInfo: mgs,
          });
          return;
        }
        if (passwordErrorJson) {
          const { errors } = passwordErrorJson;
          const mgs = errors[0].message;
          this.setState({
            errorInfo: mgs,
          });
          return;
        }
        if (confirmPwdErrorJson) {
          const { errors } = confirmPwdErrorJson;
          const mgs = errors[0].message;
          this.setState({
            errorInfo: mgs,
          });
          return;
        }
      }

      if (!err) {
        const { currentPW, password, confirmPwd } = values;
        if (password !== confirmPwd) {
          const mgs = formatMessage(messages.passwordNoEquel);
          this.setState({ errorInfo: mgs });
          return;
        }
        this.setState({ errorInfo: '' });

        // 验证通过提交数据
        const uid = localStorage.getItem('uid');
        dispatch({
          type: 'login/editTeacherPassword',
          payload: {
            accountId: uid,
            confirmPwd,
            originalPassword: currentPW,
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

  // 密码验证数位
  pwValidate = (rules, value, callback) => {
    const valueLength = String(value).length;
    if (valueLength >= 0 && valueLength > 5) {
      callback();
    } else {
      const mgs = formatMessage(messages.passwordTip1);
      callback(mgs);
    }
  };

  render() {
    const { form } = this.props;
    const { pwVisibile, confirmPWVisibile, currentPWVisibile, errorInfo, visible } = this.state;
    const { getFieldDecorator } = form;
    return (
      <div className={styles.updatePWBox}>
        <Form onSubmit={this.handleSubmit} className="updatePWForm" autoComplete="off">
          <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="password-item">
            {getFieldDecorator('currentPW', {
              // 老密码不验证
              // rules: [
              //   {
              //     required: true,
              //     message: formatMessage(messages.currentPWTip),
              //   },
              //   {
              //     pattern: /[^\u4e00-\u9fa5]+/,
              //     message: formatMessage(messages.passwordTip1),
              //   },
              //   {
              //     validator: this.pwValidate
              //   },
              // ],
            })(
              <PwdInput
                type={currentPWVisibile ? 'text' : 'password'}
                maxLength={20}
                placeholder={formatMessage(messages.currentPWInputPlaceholder)}
              />
            )}
            <div
              className="visibile"
              onClick={() => {
                this.setState({ currentPWVisibile: !currentPWVisibile });
              }}
            >
              <i className={currentPWVisibile ? 'iconfont icon-eye' : 'iconfont icon-hide'} />
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
                  pattern: /[^\u4e00-\u9fa5]+/,
                  message: formatMessage(messages.passwordTip1),
                },
                {
                  validator: this.pwValidate,
                },
              ],
            })(
              <PwdInput
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
                  message: formatMessage(messages.confirmPWTip),
                },
                {
                  pattern: /[^\u4e00-\u9fa5]+/,
                  message: formatMessage(messages.passwordTip1),
                },
                {
                  validator: this.pwValidate,
                },
              ],
            })(
              <PwdInput
                type={confirmPWVisibile ? 'text' : 'password'}
                maxLength={20}
                placeholder={formatMessage(messages.pwInputPlaceholder2)}
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
          <Form.Item style={{ height: '40px', lineHeight: '40px' }}>
            {errorInfo && <div className="errorInfo">{errorInfo}</div>}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="register-btn">
              {formatMessage(messages.submitBtnTit)}
            </Button>
          </Form.Item>
        </Form>
        <Modal
          wrapClassName={styles.updatePWModal}
          title=""
          visible={visible}
          destroyOnClose
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

export default UpdatePW;
