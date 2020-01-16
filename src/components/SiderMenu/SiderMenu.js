import React, { PureComponent, Suspense } from 'react';
import { Layout } from 'antd';
import { formatMessage } from 'umi/locale';
import classNames from 'classnames';
import Link from 'umi/link';
import styles from './index.less';
import PageLoading from '../PageLoading';
import { getDefaultCollapsedSubMenus } from './SiderMenuUtils';
import userlogo from '@/assets/avarta_default_female_teacher.png';
import smallLogo from '@/assets/logo_icon@2x.png';

const BaseMenu = React.lazy(() => import('./BaseMenu'));
const { Sider } = Layout;

let firstMount = true;

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      openKeys: getDefaultCollapsedSubMenus(props),
    };
  }

  componentDidMount() {
    firstMount = false;
  }

  static getDerivedStateFromProps(props, state) {
    const { pathname, flatMenuKeysLen } = state;
    if (props.location.pathname !== pathname || props.flatMenuKeys.length !== flatMenuKeysLen) {
      return {
        pathname: props.location.pathname,
        flatMenuKeysLen: props.flatMenuKeys.length,
        openKeys: getDefaultCollapsedSubMenus(props),
      };
    }
    return null;
  }

  isMainMenu = key => {
    const { menuData } = this.props;
    return menuData.some(item => {
      if (key) {
        return item.key === key || item.path === key;
      }
      return false;
    });
  };

  handleOpenChange = openKeys => {
    const moreThanOne = openKeys.filter(openKey => this.isMainMenu(openKey)).length > 1;
    this.setState({
      openKeys: moreThanOne ? [openKeys.pop()] : [...openKeys],
    });
  };

  render() {
    const { logo, collapsed, onCollapse, fixSiderbar, theme, isMobile, imageUrl } = this.props;
    const { openKeys } = this.state;
    const defaultProps = collapsed ? {} : { openKeys };

    const siderClassName = classNames(styles.sider, {
      [styles.fixSiderBar]: fixSiderbar,
      [styles.light]: theme === 'light',
    });

    // 校区jsx
    // let jsx_campus = [];
    // if (campusList&&campusList.length>0) {
    //   jsx_campus = campusList.map(item => {
    //     return <Option value={item.id} key={item.id}>{item.name}</Option>
    //   })
    // }
    const userName = localStorage.getItem('userName');
    const campusId = localStorage.getItem('campusId');
    const nickName = localStorage.getItem('nickName');
    const isAdmin = localStorage.getItem('isAdmin');
    const isSubjectAdmin = localStorage.getItem('isSubjectAdmin');
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        breakpoint="lg"
        onCollapse={collapse => {
          if (firstMount || !isMobile) {
            onCollapse(collapse);
          }
        }}
        width={200}
        theme={theme}
        className={siderClassName}
      >
        <div className={styles.logo} id="logo">
          <Link to="/">
            <img src={!collapsed ? logo : smallLogo} alt="logo" />
          </Link>
        </div>
        <div className="userInfo">
          {imageUrl ? <img src={imageUrl} alt="logo" /> : <img src={userlogo} alt="logo" />}
          <div className="detail">
            {/* <b className="userName">{currentUser.name}</b> */}
            {/* <Tooltip title={campusId?userName:nickName||''}>{campusId?userName:nickName||''}</Tooltip> */}
            <span>{campusId ? userName : nickName || ''}</span>
            <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#888' }}>
              {isAdmin === 'true' &&
                formatMessage({
                  id: 'app.placeholde.schoolAdministrators',
                  defaultMessage: '校管理员',
                })}
              {isAdmin === 'false' &&
                isSubjectAdmin === 'true' &&
                formatMessage({ id: 'app.subject.manager.title', defaultMessage: '学科管理员' })}
              {isAdmin === 'false' &&
                isSubjectAdmin === 'false' &&
                formatMessage({ id: 'app.menu.teachermanage', defaultMessage: '教师' })}
            </span>

            {/* <img className={styles["role-img"]} src={role} alt='' /> */}

            {/* <Select defaultValue={defaultCampus} onChange={this.handleCampusChange} style={{ width: 120 }}>
              {jsx_campus}
            </Select> */}
          </div>
        </div>
        <div className="linestyle" />
        <Suspense fallback={<PageLoading />}>
          <BaseMenu
            {...this.props}
            mode="inline"
            handleOpenChange={this.handleOpenChange}
            onOpenChange={this.handleOpenChange}
            style={{ padding: '0 10px', width: '100%' }}
            {...defaultProps}
          />
        </Suspense>
      </Sider>
    );
  }
}
