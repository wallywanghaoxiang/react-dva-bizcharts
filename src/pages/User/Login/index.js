import React, { Component } from 'react';
import { connect } from 'dva';
import { message, Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import './index.less';
import LoginTip from './components/LoginTip/index';
import LoginForm from './components/LoginForm/index';

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      identityType: '', // 身份
      showState: 'state0', // state0(初始状态),state1(教师hover),state2(学生hover),state3(教师全屏),state4(学生全屏),
      serviceErr: '', // 服务端返回错误信息
    };
  }

  componentWillMount() {
    const url = window.location.search;
    const identityCode = localStorage.getItem('identityCode');
    const accessToken = localStorage.getItem('access_token');
    if (identityCode === 'ID_TEACHER' && accessToken !== '') {
      router.push('/home');
    }
    if (identityCode === 'ID_STUDENT' && accessToken !== '') {
      router.push('/student/home');
    }
    if (url.trim()) {
      const params = url.split('=');
      if (params.length > 0) {
        if (params && params[1] === 'noToken') {
          message.warning(
            formatMessage({
              id: 'app.text.login.outline',
              defaultMessage: '由于您长时间未操作，系统对您账号进行了安全防护，请重新登录！',
            })
          );
        } else {
          Modal.warning({
            content: formatMessage({
              id: 'app.text.login.reLogin',
              defaultMessage:
                '您的账号在其他设备登录，请检查是否为本人登录。若不是本人操作，请尽快修改账号密码！',
            }),
          });
        }

        router.push('/user/login');
      }
    }
  }

  handleSubmit = values => {
    const { identityType } = this.state;
    const { dispatch } = this.props;
    const { username, password } = values;
    if (!username || !password) {
      this.setState({
        serviceErr: '',
      });
      return;
    }

    /* 根据账号位数判断是否是账号登录还是高耘号登录 */
    const type = username.length === 11 ? 'ROLE_ACCT' : 'VB_NO';

    const newValues = values;
    if (type === 'ROLE_ACCT') {
      // 账号登录
      newValues.mobile = newValues.username;
      delete newValues.username;
    }

    //   if (identityType === 'student') {
    //     message.warning('学生登录暂没开放！');
    //     return;
    //   }
    const identityCode = identityType === 'teacher' ? 'ID_TEACHER' : 'ID_STUDENT';
    dispatch({
      type: 'login/login',
      payload: {
        ...values,
        formdata: 'true',
        authenticationType: type, // 高耘账号：VB_NO、手机号：ROLE_ACCT
        identityCode, // 身份： 老师：ID_TEACHER 学生：ID_STUDENT
        client: 'pc',
      },
      callback: res => {
        if (res && res.responseCode !== '200') {
          const mgs = res.data;
          // message.warning(mgs);
          this.setState({
            serviceErr: mgs,
          });
        }
      },
    });
  };

  render() {
    const { submitting } = this.props;
    const { identityType, showState, serviceErr } = this.state;

    let bannerStyle = {};
    let teacherStyle = {};
    let studentStyle = {};
    switch (showState) {
      case 'state0':
        bannerStyle = { left: '-100vw' };
        teacherStyle = { right: '-50vw' };
        studentStyle = { left: '-50vw' };
        break;
      case 'state1':
        bannerStyle = { left: '-95vw' }; // 教师hover
        teacherStyle = { right: '-45vw' };
        studentStyle = { left: '-55vw' };
        break;
      case 'state2':
        bannerStyle = { left: '-105vw' }; // 学生hover
        teacherStyle = { right: '-55vw' };
        studentStyle = { left: '-45vw' };
        break;
      case 'state3':
        bannerStyle = { left: '-25vw', transform: 'none' }; //  教师全屏
        teacherStyle = { right: '25vw', transform: 'none' };
        studentStyle = { left: '-125vw', transform: 'none' };
        break;
      case 'state4':
        bannerStyle = { left: '-175vw', transform: 'none' }; // 学生全屏
        teacherStyle = { right: '-125vw', transform: 'none' };
        studentStyle = { left: '25vw', transform: 'none' };
        break;
      default:
        break;
    }

    return (
      <div className="user-login" style={{ height: '100vh' }}>
        <div className="login-container">
          <div className="banner" style={bannerStyle}>
            {/* 老师登录 */}
            <div
              className="show left"
              onMouseEnter={() => {
                if (identityType === '') {
                  this.setState({
                    showState: 'state1',
                  });
                }
              }}
              onMouseLeave={() => {
                if (identityType === '') {
                  this.setState({
                    showState: 'state0',
                  });
                }
              }}
            >
              <div
                className="mask"
                style={{ display: showState === 'state2' ? 'block' : 'none' }}
              />

              <div className="login teacher" style={teacherStyle}>
                <LoginTip
                  style={{ left: '16%' }}
                  identityType="teacher"
                  clickLogin={() => {
                    this.setState({
                      identityType: 'teacher',
                      showState: 'state3',
                    });
                  }}
                  clickBack={() => {
                    this.setState({
                      identityType: '',
                      showState: 'state0',
                    });
                  }}
                />
                {showState === 'state3' && (
                  <LoginForm
                    serviceErr={serviceErr}
                    loading={submitting}
                    key="teacher"
                    identityType="teacher"
                    style={{ right: '20%' }}
                    onHandleSubmit={this.handleSubmit}
                    onClearServiceErr={() => {
                      this.setState({
                        serviceErr: '',
                      });
                    }}
                  />
                )}
              </div>
            </div>
            {/* 学生登录 */}
            <div
              className="show right"
              onMouseEnter={() => {
                if (identityType === '') {
                  this.setState({
                    showState: 'state2',
                  });
                }
              }}
              onMouseLeave={() => {
                if (identityType === '') {
                  this.setState({
                    showState: 'state0',
                  });
                }
              }}
            >
              <div
                className="mask"
                style={{ display: showState === 'state1' ? 'block' : 'none' }}
              />
              <div className="login student" style={studentStyle}>
                <LoginTip
                  style={{ right: '16%' }}
                  identityType="student"
                  clickLogin={() => {
                    this.setState({
                      identityType: 'student',
                      showState: 'state4',
                    });
                  }}
                  clickBack={() => {
                    this.setState({
                      identityType: '',
                      showState: 'state0',
                    });
                  }}
                />
                {showState === 'state4' && (
                  <LoginForm
                    serviceErr={serviceErr}
                    loading={submitting}
                    key="student"
                    identityType="student"
                    style={{ left: '20%' }}
                    onHandleSubmit={this.handleSubmit}
                    onClearServiceErr={() => {
                      this.setState({
                        serviceErr: '',
                      });
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default LoginComponent;
