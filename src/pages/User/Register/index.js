import React, { Component } from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import { Input, Form, Button, message } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import router from 'umi/router';
import Dimensions from 'react-dimensions';
import PwdInput from '@/components/aidoin/PwdInput';
import teacherBG from '@/assets/login/reg_page_teacher_bg.png';
import studentBG from '@/assets/login/reg_page_sutent_bg.png';
import logo from '@/assets/logo.png';
import { isAvailableIphone, TransformSafeSymbolPhone, phoneReg } from '@/utils/utils';
import styles from './index.less';

const messages = defineMessages({
  register: { id: 'app.user.register.title', defaultMessage: '注册' },
  teacherAcc: { id: 'app.user.register.teacher.account', defaultMessage: '教师账号' },
  studentAcc: { id: 'app.user.register.student.account', defaultMessage: '学生账号' },
  login: { id: 'app.user.login.title', defaultMessage: '登录' },
  tip1: { id: 'app.register.success.tip1', defaultMessage: '您的账户：' },
  tip2: { id: 'app.register.success.tip2', defaultMessage: '注册成功' },
  nowLogin: { id: 'app.user.now.login.title', defaultMessage: '去登录' },
  teacherTip: { id: 'app.user.role.teacher.tip', defaultMessage: '我是老师' },
  studentTip: { id: 'app.user.role.student.tip', defaultMessage: '我是学生' },
  phoneInputPlaceholder: {
    id: 'app.account.phone.input.placeholder',
    defaultMessage: '请输入11位手机号',
  },
  messageInputPlaceholder: {
    id: 'app.account.message.input.placeholder',
    defaultMessage: '请输入验证码',
  },
  pwInputPlaceholder: {
    id: 'app.account.pw.input.placeholder',
    defaultMessage: '请输入6-20位密码，区分大小写',
  },
  pwInputPlaceholder2: {
    id: 'app.account.pw.confirm.input.placeholder',
    defaultMessage: '确认密码',
  },
  registerTip: { id: 'app.register.tip.now', defaultMessage: '已有账号，立即' },
  phoneInputTip: { id: 'app.account.phone.input.tip', defaultMessage: '请输入手机号！' },
  phoneInputTip1: { id: 'app.user.login.account.tip1', defaultMessage: '手机号输入格式不正确！' },
  validateCodeTip: { id: 'app.user.register.validate.code.tip', defaultMessage: '请输入验证码！' },
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
  phoneAndValidateCodeTip: {
    id: 'app.user.register.phone.code.tip',
    defaultMessage: '请输入手机号与验证码！',
  },
  codeBtnTit: { id: 'app.user.register.get.code.btn.title', defaultMessage: '获取验证码' },
});

@connect(({ register, loading }) => ({
  register,
  registLoading: loading.effects['register/submit'],
}))
@Form.create()
class RegisterComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      identityType: '', // 身份
      validateCodeId: '', // 短信验证码发送成功后返回的ID
      pwVisibile: false, // 密码是否可见
      confirmPWVisibile: false,
      count: 0,
      errorInfo: '',
      regitserSuccess: false,
      successMobile: '', // 注册成功的手机号
    };
  }

  componentWillMount() {
    const identityCode = localStorage.getItem('identityCode');
    const accessToken = localStorage.getItem('access_token');
    if (identityCode === 'ID_TEACHER' && accessToken !== '') {
      router.push('/home');
    }
    if (identityCode === 'ID_STUDENT' && accessToken !== '') {
      router.push('/student/home');
    }
  }

  componentDidMount() {
    const { location } = this.props;
    if (location.pathname.indexOf('teacher') > -1) {
      this.setState({ identityType: 'teacher' });
    } else {
      this.setState({ identityType: 'student' });
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      // console.log(err);
      // console.log(values);
      if (err) {
        const mobileErrorJson = err.mobile;
        const validateCodeErrorCode = err.validateCode;
        const passwordErrorJson = err.password;
        const confirmPwdErrorJson = err.confirmPwd;
        const { mobile, validateCode } = values;

        if (!mobile && !validateCode) {
          const mgs = formatMessage(messages.phoneAndValidateCodeTip);
          this.setState({ errorInfo: mgs });
          return;
        }
        if (mobileErrorJson) {
          const { errors } = mobileErrorJson;
          const mgs = errors[0].message;
          this.setState({
            errorInfo: mgs,
          });
          return;
        }
        if (validateCodeErrorCode) {
          const { errors } = validateCodeErrorCode;
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
        const { password, confirmPwd } = values;
        if (password !== confirmPwd) {
          const mgs = formatMessage(messages.passwordNoEquel);
          this.setState({ errorInfo: mgs });
          return;
        }
        this.setState({ errorInfo: '' });
        const { dispatch } = this.props;
        const { identityType, validateCodeId } = this.state;
        const identityCode = identityType === 'teacher' ? 'ID_TEACHER' : 'ID_STUDENT';
        const vbNoType = identityType === 'teacher' ? 2 : 1;
        dispatch({
          type: 'register/submit',
          payload: {
            ...values,
            identityCode, // 注册身份 老师：ID_TEACHER 学生：ID_STUDENT
            vbNoType, // 1：学生位；2：老师位；0：内部员工
            validateCodeId,
          },
          callback: res => {
            if (res) {
              if (res.responseCode === '200') {
                this.setState({
                  regitserSuccess: true,
                  successMobile: TransformSafeSymbolPhone(this.phoneInput.props.value),
                });
              } else {
                const mgs = res.data;
                this.setState({ errorInfo: mgs });
              }
            }
          },
        });
      }
    });
  };

  // 获取验证码
  getvalidateCode = () => {
    if (!this.phoneInput.props.value) {
      const mgs = formatMessage(messages.phoneInputTip);
      this.setState({ errorInfo: mgs });
    } else {
      const { value } = this.phoneInput.props;
      if (isAvailableIphone(value)) {
        this.setState({ errorInfo: '' });
        this.sendValidateCodeRequest();
      } else {
        const mgs = formatMessage(messages.phoneInputTip1);
        this.setState({ errorInfo: mgs });
      }
    }
  };

  // 获取验证码请求
  sendValidateCodeRequest = () => {
    const { dispatch } = this.props;
    const params = {
      telephone: String(this.phoneInput.props.value),
    };
    dispatch({
      type: 'register/validateCode',
      payload: params,
      callback: res => {
        if (res.responseCode === '200') {
          const validateCodeId = res.data;
          this.setState({ validateCodeId });
        } else {
          const mgs = res.data;
          message.warning(mgs);
        }
      },
    });

    let count = 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
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
    const { form, containerWidth, containerHeight, registLoading } = this.props;
    const { getFieldDecorator } = form;
    const {
      identityType,
      pwVisibile,
      confirmPWVisibile,
      count,
      errorInfo,
      regitserSuccess,
      successMobile,
    } = this.state;
    const phoneSuffix = (
      <i className="iconfont icon-mobile" style={{ color: '#888', fontSize: '16px' }} />
    );
    const pwSuffix = (
      <i className="iconfont icon-lock" style={{ color: '#888', fontSize: '16px' }} />
    );
    const messageSuffix = (
      <i className="iconfont icon-message" style={{ color: '#888', fontSize: '16px' }} />
    );
    const boxHeight = 510;
    const mt = (containerHeight - boxHeight) / 2;
    let smallScreen;
    let bgImgeStyle;
    if (containerWidth < 1024) {
      smallScreen = true;
      bgImgeStyle =
        identityType === 'teacher'
          ? {
              backgroundImage: `url(${teacherBG}),linear-gradient(317deg,rgba(18,189,154,1) 0%,rgba(27,205,91,1) 100%)`,
              backgroundPosition: '50% center',
            }
          : {
              backgroundImage: `url(${studentBG}),linear-gradient(318deg,rgba(250,201,97,1) 0%,rgba(255,157,75,1) 100%)`,
              backgroundPosition: '50% center',
            };
    } else {
      smallScreen = false;
      bgImgeStyle =
        identityType === 'teacher'
          ? {
              backgroundImage: `url(${teacherBG}),linear-gradient(317deg,rgba(18,189,154,1) 0%,rgba(27,205,91,1) 100%)`,
              backgroundPosition: `6% center`,
            }
          : {
              backgroundImage: `url(${studentBG}),linear-gradient(318deg,rgba(250,201,97,1) 0%,rgba(255,157,75,1) 100%)`,
              backgroundPosition: `6% center`,
            };
    }
    const style = smallScreen
      ? {
          position: 'fixed',
          left: '50%',
          top: '50%',
          marginLeft: '-205px',
          marginTop: '-255px',
          boxShadow: '0px 2px 20px 0px rgba(0,0,0,0.1)',
        }
      : { margin: '0 auto', marginTop: `${mt}px`, boxShadow: 'none' };
    const registerBtnStyle =
      identityType === 'teacher'
        ? { background: '#03c46b', boxShadow: '0px 2px 5px 0px rgba(3,196,107,0.5)' }
        : { background: '#FFB400', boxShadow: '0px 2px 5px 0px rgba(255,180,0,0.5)' };
    return (
      <div className={styles['user-register']} style={bgImgeStyle}>
        {/* logo */}
        <div className="logoBox">
          <img src={logo} alt="logo" />
        </div>
        <div className="right" style={{ width: smallScreen ? '0px' : '50%' }}>
          <div className="registerContainer" style={style}>
            {/* 标题 */}
            {!regitserSuccess && (
              <div className="registerTit">
                <span className="tit">{formatMessage(messages.register)}</span>
                <span style={{ padding: '0 6px', fontSize: '18px' }}>/</span>
                <span className="subTit">
                  {identityType === 'teacher'
                    ? formatMessage(messages.teacherAcc)
                    : formatMessage(messages.studentAcc)}
                </span>
              </div>
            )}

            {/* 注册成功 */}
            {regitserSuccess && (
              <div className="register-success">
                <div className="success-icon">
                  <i className="iconfont icon-right success" />
                </div>
                <div className="account">
                  {identityType === 'teacher'
                    ? formatMessage(messages.teacherAcc)
                    : formatMessage(messages.studentAcc)}
                  {formatMessage(messages.tip2)}
                </div>
                <p className="tip">
                  {formatMessage(messages.tip1)}
                  <span>{successMobile}</span>
                </p>
                <Button
                  type="primary"
                  className="now-login-btn"
                  onClick={() => {
                    const { dispatch } = this.props;
                    dispatch(routerRedux.push('/user/login'));
                  }}
                >
                  {formatMessage(messages.nowLogin)}
                </Button>
              </div>
            )}

            {!regitserSuccess && (
              <div className="register-container">
                <div className="register-form">
                  <Form className="form" autoComplete="off" disableautocomplete>
                    <Form.Item style={{ borderBottom: '1px solid #ccc' }}>
                      {getFieldDecorator('mobile', {
                        rules: [
                          {
                            required: true,
                            message: formatMessage(messages.phoneInputTip),
                          },
                          {
                            pattern: phoneReg,
                            message: formatMessage(messages.phoneInputTip1),
                          },
                        ],
                      })(
                        <Input
                          placeholder={formatMessage(messages.phoneInputPlaceholder)}
                          prefix={phoneSuffix}
                          maxLength={11}
                          autoComplete="off"
                          disableautocomplete
                          ref={node => {
                            this.phoneInput = node;
                          }}
                        />
                      )}
                    </Form.Item>
                    <Form.Item style={{ borderBottom: '1px solid #ccc' }} className="message-item">
                      {getFieldDecorator('validateCode', {
                        rules: [
                          { required: true, message: formatMessage(messages.validateCodeTip) },
                        ],
                      })(
                        <Input
                          prefix={messageSuffix}
                          autoComplete="off"
                          disableautocomplete
                          placeholder={formatMessage(messages.messageInputPlaceholder)}
                          maxLength={6}
                        />
                      )}
                      <button
                        className="message-btn"
                        disabled={count}
                        onClick={this.getvalidateCode}
                        type="button"
                      >
                        {count ? `${count} s` : formatMessage(messages.codeBtnTit)}
                      </button>
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
                          prefix={pwSuffix}
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
                        <i
                          className={confirmPWVisibile ? 'iconfont icon-eye' : 'iconfont icon-hide'}
                        />
                      </div>
                    </Form.Item>
                    <Form.Item>
                      {errorInfo && <div className="registerErrorInfo">{errorInfo}</div>}
                    </Form.Item>
                    <Form.Item>
                      <Button
                        onClick={this.handleSubmit}
                        type="primary"
                        loading={registLoading}
                        htmlType="submit"
                        className="register-btn"
                        style={registerBtnStyle}
                      >
                        {formatMessage(messages.register)}
                      </Button>
                      <p className="tip">
                        {formatMessage(messages.registerTip)}
                        <Link
                          to="/user/login"
                          style={{ color: identityType === 'teacher' ? '#03C46B' : '#FFB400' }}
                        >
                          {formatMessage(messages.login)}
                        </Link>
                      </p>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Dimensions({
  getHeight: () => {
    // element
    return window.innerHeight;
  },
  getWidth: () => {
    // element
    return window.innerWidth;
  },
})(RegisterComponent);
