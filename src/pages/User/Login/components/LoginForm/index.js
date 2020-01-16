import React, { Component } from 'react';
import { Link } from 'dva/router';
import { Input, Form, Button } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import PwdInput from '@/components/aidoin/PwdInput';
import styles from './index.less';

const messages = defineMessages({
  teacherBtnTit: { id: 'app.teacher.login.btn.title', defaultMessage: '教师登录' },
  studentBtnTit: { id: 'app.student.login.btn.title', defaultMessage: '学生登录' },
  forgetPW: { id: 'app.user.forget.pw.title', defaultMessage: '忘记密码？' },
  noAccountTit: { id: 'app.no.account', defaultMessage: '还没有账号？' },
  registerNowTit: { id: 'app.register.account.now', defaultMessage: '立即注册' },
  accountInputPlaceholder: {
    id: 'app.user.login.account.input.placeholder',
    defaultMessage: '手机号/高耘号',
  },
  passwordInputPlaceholder: { id: 'app.user.login.pw.input.placeholder', defaultMessage: '密码' },
  accountPwTip: { id: 'app.user.login.account.pw.tip', defaultMessage: '请输入账号和密码！' },
  accountTip: { id: 'app.user.login.account.tip', defaultMessage: '请输入登录账号！' },
  accountTip1: { id: 'app.user.login.account.tip1', defaultMessage: '请输入正确的登录账号！' },
  passwordTip: { id: 'app.user.login.password.tip', defaultMessage: '请输入密码！' },
  passwordTip1: { id: 'app.user.login.password.tip1', defaultMessage: '密码为6位以上非中文字符！' },
  loginBtnTit: { id: 'app.login.btn.title', defaultMessage: '登 录' },
});

class LoginForm extends Component {
  static defaultProps = {
    onClearServiceErr: () => {},
    onHandleSubmit: () => {},
  };

  constructor(props) {
    super(props);
    this.state = {
      errorInfo: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.serviceErr) {
      this.setState({
        errorInfo: nextProps.serviceErr,
      });
    }
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, onClearServiceErr, onHandleSubmit } = this.props;
    form.validateFields((err, values) => {
      if (err) {
        onClearServiceErr();
        const { username, password } = values;
        const { username: usernameErrorJson, password: pwErrorJson } = err;

        if (username === undefined && password === undefined) {
          const mgs = formatMessage(messages.accountPwTip);
          this.setState({
            errorInfo: mgs,
          });
          return;
        }

        if (username === undefined) {
          const mgs = formatMessage(messages.accountTip);
          this.setState({
            errorInfo: mgs,
          });
          return;
        }
        // 有值 校验是否符合规则
        if (usernameErrorJson === undefined) {
          // 数据正常
        } else {
          const { errors } = usernameErrorJson;
          const mgs = errors[0].message;
          this.setState({
            errorInfo: mgs,
          });
          return;
        }

        if (password === undefined) {
          const mgs = formatMessage(messages.passwordTip);
          this.setState({
            errorInfo: mgs,
          });
          return;
        }
        // eslint-disable-next-line no-empty
        if (pwErrorJson === undefined) {
        } else {
          const { errors } = pwErrorJson;
          const mgs = errors[0].message;
          this.setState({
            errorInfo: mgs,
          });
          return;
        }
      }

      if (!err) {
        this.setState({ errorInfo: '' });
        onHandleSubmit(values);
      }
    });
  };

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
    const { identityType, style, loading, form } = this.props;
    const { getFieldDecorator } = form;
    const { errorInfo } = this.state;
    const phoneSuffix = (
      <i className="iconfont icon-user" style={{ color: '#888', fontSize: '16px' }} />
    );
    const pwSuffix = (
      <i className="iconfont icon-lock" style={{ color: '#888', fontSize: '16px' }} />
    );
    const type = identityType === 'teacher' ? 'teacher' : 'student';
    return (
      <div className={styles['login-form']} style={style}>
        <div className="form-box">
          <Form onSubmit={this.handleSubmit} className="form" autoComplete="off">
            <Form.Item style={{ borderBottom: '1px solid #ccc' }}>
              {getFieldDecorator('username', {
                rules: [
                  {
                    required: true,
                    message: formatMessage(messages.accountTip),
                  },
                  // {
                  //   pattern: /^[0-9]*$/,
                  //   message: formatMessage(messages.accountTip1),
                  // },
                ],
              })(
                <Input
                  placeholder={formatMessage(messages.accountInputPlaceholder)}
                  prefix={phoneSuffix}
                  maxLength={11}
                  autoComplete="off"
                  ref={node => {
                    this.userNameInput = node;
                  }}
                />
              )}
            </Form.Item>
            <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="password-input">
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
                  // **  TODO 注释代码防止原来的账号不能登录 **/
                  // {
                  //     validator: this.pwValidate
                  // },
                ],
              })(
                <PwdInput
                  prefix={pwSuffix}
                  maxLength={20}
                  placeholder={formatMessage(messages.passwordInputPlaceholder)}
                />
              )}
              <div className="forgetPW">
                <Link to={`/user/resetpw/${type}`}>{formatMessage(messages.forgetPW)}</Link>
              </div>
            </Form.Item>
            <Form.Item>{errorInfo && <div className="errorInfo">{errorInfo}</div>}</Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className={
                  identityType === 'teacher' ? 'teacher-login-button' : 'student-login-button'
                }
              >
                {formatMessage(messages.loginBtnTit)}
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create()(LoginForm);
