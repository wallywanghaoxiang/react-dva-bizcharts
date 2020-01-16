import React, { Component } from 'react';
import './index.less';
import teacherLoginTitle from '@/assets/login/login_title_teacher.png';
import studentLoginTitle from '@/assets/login/login_title_student.png';
import IconButton from '@/components/IconButton/index';
import Link from 'umi/link';

import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';

const messages = defineMessages({
  teacherBtnTit: { id: 'app.teacher.login.btn.title', defaultMessage: '教师登录' },
  studentBtnTit: { id: 'app.student.login.btn.title', defaultMessage: '学生登录' },
  noAccountTit: { id: 'app.has.no.account', defaultMessage: '还没有账号？' },
  registerNowTit: { id: 'app.no.account', defaultMessage: '立即注册' },
});

/**
 * input: identityType : 身份类型：老师(teacher)和学生（student）
 *
 * @author tina.zhang
 * @date 2019-03-05
 * @class LoginTip
 * @extends {Component}
 */
class LoginTip extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logining: false,
    };
  }

  handleLogin = () => {
    const { clickLogin } = this.props;
    clickLogin();
    this.setState({
      logining: true,
    });
  };

  handleBack = () => {
    const { clickBack } = this.props;
    clickBack();
    this.setState({
      logining: false,
    });
  };

  render() {
    const { identityType, style } = this.props;
    const { logining } = this.state;
    return (
      <div className="login-tip" style={style}>
        <div className="identity">
          <img src={identityType === 'teacher' ? teacherLoginTitle : studentLoginTitle} alt="" />
        </div>
        {logining && identityType === 'teacher' && (
          <IconButton
            text={formatMessage({
              id: 'app.examination.inspect.task.detail.back.btn.title',
              defaultMessage: '返回',
            })}
            iconName="iconfont icon-previous"
            onClick={this.handleBack}
          />
        )}
        {logining && identityType === 'student' && (
          <div className="icon-btn" onClick={this.handleBack}>
            <span className="icontext" style={{ paddingLeft: '5px', paddingRight: '5px' }}>
              {formatMessage({
                id: 'app.examination.inspect.task.detail.back.btn.title',
                defaultMessage: '返回',
              })}
            </span>
            <i className="iconfont icon-next" />
          </div>
        )}
        {!logining && (
          <div className="login-btn" onClick={this.handleLogin}>
            {identityType === 'teacher'
              ? formatMessage(messages.teacherBtnTit)
              : formatMessage(messages.studentBtnTit)}
          </div>
        )}
        <p className="tip">
          <span>{formatMessage(messages.noAccountTit)}</span>
          <span className="register">
            <Link to={`/user/register/${identityType}`}>
              {formatMessage(messages.registerNowTit)}
            </Link>
          </span>
        </p>
      </div>
    );
  }
}

export default LoginTip;
