import React, { Component } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import classNames from 'classnames';
import { formatMessage, defineMessages } from 'umi/locale';
import BasicInfo from './components/BasicInfo/index';
import UpdatePW from './components/UpdatePW/index';
import UpdateAccount from './components/UpdateAccount/index';
import JoinClass from './components/JoinClass/index';

import styles from './index.less';

const messages = defineMessages({
  tab1: { id: 'app.student.user.center.tab1', defaultMessage: '基本信息' },
  tab2: { id: 'app.student.user.center.tab2', defaultMessage: '修改密码' },
  tab3: { id: 'app.student.user.center.tab3', defaultMessage: '账号修改' },
  tab4: { id: 'app.student.user.center.tab4', defaultMessage: '加入班级' },
});

@connect(() => ({}))
class StudentCenter extends Component {
  state = {
    selectTab: 'basic',
  };

  tabs = [
    {
      key: 'basic',
      value: formatMessage(messages.tab1),
    },
    {
      key: 'password',
      value: formatMessage(messages.tab2),
    },
    {
      key: 'account',
      value: formatMessage(messages.tab3),
    },
    {
      key: 'joinclass',
      value: formatMessage(messages.tab4),
    },
  ];

  componentWillMount() {
    // 查询已绑定的学生信息
    this.queryBoundStudentInfo();
  }

  queryBoundStudentInfo = () => {
    const { dispatch } = this.props;
    const params = {
      accountId: localStorage.getItem('uid'),
    };
    dispatch({
      type: 'login/queryStudentInfoList',
      payload: params,
      callback: data => {
        if (data.length < 1) {
          this.setState({
            selectTab: 'joinclass',
          });
        }
      },
    });
  };

  // tabChange
  tabChange = tab => {
    const selectTabKey = tab.key;
    this.setState({
      selectTab: selectTabKey,
    });
  };

  // 保存个人信息成功
  saveInfoSuccess = () => {
    const { dispatch } = this.props;
    const params = {
      accountId: localStorage.getItem('uid'),
    };
    dispatch({
      type: 'login/queryStudentInfoList',
      payload: params,
      callback: data => {
        if (data.length < 1) {
          this.setState({
            selectTab: 'joinclass',
          });
        } else {
          router.push({ pathname: '/student/home' });
        }
      },
    });
  };

  // 加入班级成功
  handleJoinSuccess = () => {
    const { dispatch } = this.props;
    const params = {
      accountId: localStorage.getItem('uid'),
    };
    dispatch({
      type: 'login/queryStudentInfoList',
      payload: params,
      callback: data => {
        if (data.length < 1) {
          this.setState({
            selectTab: 'joinclass',
          });
        } else {
          const { campusId, studentId, campusName } = data[0];
          localStorage.setItem('campusId', campusId);
          localStorage.setItem('studentId', studentId);
          localStorage.setItem('campusName', campusName);
          window.location.href = '/student/home';
          dispatch({
            type: 'permission/initPremission',
            payload: {
              campusId,
            },
          });
        }
      },
    });
  };

  render() {
    const { selectTab } = this.state;
    return (
      <div className={styles.studentCenter}>
        {/* tabs */}
        <div className={styles.tabs}>
          {this.tabs.map(tab => {
            const select = tab.key === selectTab;
            return (
              <div
                key={tab.key}
                className={classNames(styles.tabItem, select ? styles.tabItemSelect : '')}
                onClick={() => this.tabChange(tab)}
              >
                {tab.value}
              </div>
            );
          })}
        </div>
        {/* 基本信息 */}
        {selectTab === 'basic' && <BasicInfo onSaveInfoSuccess={this.saveInfoSuccess} />}

        {/* 修改密码 */}
        {selectTab === 'password' && <UpdatePW />}

        {/* 账号修改 */}
        {selectTab === 'account' && <UpdateAccount />}

        {/* 加入班级 */}
        {selectTab === 'joinclass' && <JoinClass onJoinClassSuccess={this.handleJoinSuccess} />}
      </div>
    );
  }
}

export default StudentCenter;
