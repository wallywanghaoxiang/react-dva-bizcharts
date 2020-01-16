import React, { Component } from 'react';
import { Layout, Menu, Popover, Divider, Modal } from 'antd';
import { ContainerQuery } from 'react-container-query';
import DocumentTitle from 'react-document-title';
import Redirect from 'umi/redirect';
import classNames from 'classnames';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import router from 'umi/router';
import Context from './MenuContext';
import logo from '@/assets/logo_icon.png';
import schoolGirl from '@/assets/student/female.png';
import schoolBoy from '@/assets/student/male.png';
import smallLogo from '@/assets/student/user_id_icon.png';
import getPageTitle from '@/utils/getPageTitle';
import IconButton from '@/frontlib/components/IconButton';

import styles from './StudentLayout.less';

const messages = defineMessages({
  home: { id: 'app.student.main.home', defaultMessage: '主页' },
  learnCenter: { id: 'app.student.learning.center', defaultMessage: '学情中心' },
  switchBtnTit: { id: 'app.student.basic.layout.switch.btn.title', defaultMessage: '切换' },
  userCenter: { id: 'app.student.basic.layout.user.center.title', defaultMessage: '个人中心' },
  logoOut: { id: 'app.student.basic.layout.logoout.btn.title', defaultMessage: '退出' },
  switchSchoolBtnTit: {
    id: 'app.student.basic.layout.switch.school.btn.title',
    defaultMessage: '切换学校',
  },
  confirmBtnTit: { id: 'app.student.basic.layout.confirm.btn.title', defaultMessage: '确定切换' },
});

const { Header, Content } = Layout;
const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
    maxWidth: 1599,
  },
  'screen-xxl': {
    minWidth: 1600,
  },
};

@connect(({ login, file }) => {
  const { studentInfoList } = login;
  const { userImgPath } = file;
  return {
    studentInfoList,
    userImgPath,
  };
})
class StudentLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedKeys: [''],
      visible: false,
      currentCampusId: localStorage.getItem('campusId'),
      campusName: localStorage.getItem('campusName'),
      currentStudentId: localStorage.getItem('studentId'),
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const accountId = localStorage.getItem('uid');
    if (accountId) {
      this.getAvatar(accountId);
    }

    const {
      location: { pathname },
    } = this.props;
    if (pathname === '/student/learncenter') {
      this.setState({
        selectedKeys: ['2'],
      });
    } else if (pathname === '/student/home') {
      this.setState({
        selectedKeys: ['1'],
      });
    } else {
      this.setState({
        selectedKeys: [''],
      });
    }
    // 获取学校权限
    dispatch({
      type: 'permission/initPremission',
      payload: {
        campusId: localStorage.getItem('campusId'),
      },
    });

    // 获取学生绑定信息
    this.queryBoundStudentInfo();
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: { pathname },
    } = nextProps;
    const { location: propsLocation } = this.props;
    const { pathname: propsPathName } = propsLocation;
    if (pathname !== propsPathName) {
      if (pathname === '/student/learncenter') {
        this.setState({
          selectedKeys: ['2'],
        });
      } else if (pathname === '/student/home') {
        this.setState({
          selectedKeys: ['1'],
        });
      } else {
        this.setState({
          selectedKeys: [''],
        });
      }
    }
  }

  // 获取头像
  getAvatar = id => {
    const { dispatch } = this.props;
    const params = {
      fileId: id,
    };
    dispatch({
      type: 'file/avatar',
      payload: params,
    });
  };

  getContext() {
    const { location, breadcrumbNameMap } = this.props;
    return {
      location,
      breadcrumbNameMap,
    };
  }

  queryBoundStudentInfo = () => {
    const { dispatch } = this.props;
    const params = {
      accountId: localStorage.getItem('uid'),
    };
    dispatch({
      type: 'login/queryStudentInfoList',
      payload: params,
    });
  };

  handleClick = e => {
    if (Number(e.key) === 1) {
      router.push('/student/home');
    } else {
      router.push('/student/learncenter');
    }
    this.setState({
      selectedKeys: [e.key],
    });
  };

  // 个人中心
  handleCenter = () => {
    router.push('/student/center');
  };

  // 退出
  handleLogoOut = () => {
    localStorage.clear();
    router.push('/user/login');
  };

  // 切换校区
  clickSwitchCampus = () => {
    this.setState({
      visible: true,
    });
  };

  // 切换校区OK按钮
  handleOk = () => {
    const { currentCampusId, campusName, currentStudentId } = this.state;
    const { dispatch } = this.props;

    const params = {
      studentId: currentStudentId,
    };
    dispatch({
      type: 'login/studentSwitchCampus',
      payload: params,
      callback: () => {
        localStorage.setItem('campusId', currentCampusId);
        localStorage.setItem('campusName', campusName);
        localStorage.setItem('studentId', currentStudentId);
        this.setState({
          visible: false,
        });
        window.location.href = '/student/home';
        // router.push('/student/home');
      },
    });
  };

  // 切换校区cancel按钮
  handleCancel = () => {
    this.setState({
      visible: false,
      currentCampusId: localStorage.getItem('campusId'),
      campusName: localStorage.getItem('campusName'),
      currentStudentId: localStorage.getItem('studentId'),
    });
  };

  // 选择校区
  selectedCampus = item => {
    const { campusId, campusName, studentId } = item;
    this.setState({
      currentCampusId: campusId,
      campusName,
      currentStudentId: studentId,
    });
  };

  render() {
    const {
      children,
      location: { pathname },
      breadcrumbNameMap,
      studentInfoList,
      userImgPath,
    } = this.props;

    // 处理学生未绑定
    const localName = localStorage.getItem('name');
    const localGender = localStorage.getItem('gender');

    if (localName && localGender && localName !== 'null' && localGender !== 'null') {
      console.log('name gender is all');
    } else {
      // 姓名和性别没绑定重定向到绑定页面
      return <Redirect to="/user/perfect" />;
    }

    const { selectedKeys, visible, currentCampusId } = this.state;

    const vbNumber = localStorage.getItem('vbNumber');
    const userName = localStorage.getItem('name');
    const gender = localStorage.getItem('gender');
    const defaultAvatar = gender === 'MALE' ? schoolBoy : schoolGirl;

    const campusName = localStorage.getItem('campusName');
    let name = '';
    if (campusName && campusName.length > 13) {
      name = `${campusName.substring(0, 13)}...`;
    } else {
      name = campusName;
    }
    const popContent = (
      <div className={styles.popContent}>
        {/* 账号信息 */}
        <div className={styles.userInfo}>
          <div className={styles.name}>{userName}</div>
          <div className={styles.VBNumber}>
            <img src={smallLogo} alt="smallLogo" />
            <Divider type="vertical" />
            <span>{vbNumber}</span>
          </div>
        </div>
        {/* 校区 */}
        {studentInfoList.length > 0 && (
          <div className={classNames(styles.item, styles.campus)}>
            <div
              className={styles.campusName}
              title={campusName && campusName.length > 13 ? campusName : ''}
            >
              {name}
            </div>
            {studentInfoList.length > 1 && (
              <div>
                <IconButton
                  iconName="icon-exchange"
                  text={formatMessage(messages.switchBtnTit)}
                  onClick={this.clickSwitchCampus}
                />
              </div>
            )}
          </div>
        )}

        {/* 个人中心 */}
        <div className={classNames(styles.item, styles.userCenter)} onClick={this.handleCenter}>
          <i className="iconfont icon-user" />
          <span style={{ paddingLeft: '5px' }}>{formatMessage(messages.userCenter)}</span>
        </div>
        {/* 退出 */}
        <div className={classNames(styles.item, styles.logoOut)} onClick={this.handleLogoOut}>
          <i className="iconfont icon-logout" />
          <span style={{ paddingLeft: '5px' }}>{formatMessage(messages.logoOut)}</span>
        </div>
      </div>
    );

    const layout = (
      <Layout className={styles.studentLayout}>
        <Header className={styles.studentHeader}>
          <div className={styles.logo}>
            <img src={logo} alt="logo" />
          </div>
          <Menu
            mode="horizontal"
            selectedKeys={pathname === '/student/center' ? [''] : selectedKeys}
            style={{ lineHeight: '60px', marginLeft: '-72px' }}
            onClick={this.handleClick}
          >
            <Menu.Item key="1">{formatMessage(messages.home)}</Menu.Item>
            {studentInfoList.length > 0 && (
              <Menu.Item key="2">{formatMessage(messages.learnCenter)}</Menu.Item>
            )}
          </Menu>
          <Popover
            // trigger="click"
            content={popContent}
            title={null}
            overlayClassName={styles.stuPop}
            placement="bottom"
            overlayStyle={{ paddingTop: '2px' }}
          >
            <div className={styles.HeaderIcon}>
              <img src={userImgPath || defaultAvatar} alt="gender" />
            </div>
          </Popover>
        </Header>
        <Content>{children}</Content>
      </Layout>
    );

    return (
      <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap || '')}>
        <ContainerQuery query={query}>
          {params => (
            <Context.Provider value={this.getContext()}>
              <div className={classNames(params)}>{layout}</div>
              <Modal
                wrapClassName={styles.switchCampusModal}
                title={formatMessage(messages.switchSchoolBtnTit)}
                closable={false}
                centered
                maskClosable={false}
                visible={visible}
                okText={formatMessage(messages.confirmBtnTit)}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                width={400}
              >
                <div className={styles.campusList}>
                  {studentInfoList.map(tag => {
                    const isSelect = tag.campusId === currentCampusId;
                    return (
                      <div
                        key={tag.campusId}
                        className={classNames(styles.campusItem, isSelect ? styles.selected : '')}
                        onClick={() => this.selectedCampus(tag)}
                      >
                        <div className={styles.modalCampusName}>{tag.campusName}</div>
                        {isSelect && (
                          <div className={styles.selectedIcon}>
                            <i className="iconfont icon-right" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Modal>
            </Context.Provider>
          )}
        </ContainerQuery>
      </DocumentTitle>
    );
  }
}

export default StudentLayout;
