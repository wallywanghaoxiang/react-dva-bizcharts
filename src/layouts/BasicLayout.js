import React, { Suspense } from 'react';
import { Layout } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { ContainerQuery } from 'react-container-query';
// eslint-disable-next-line no-unused-vars
import { routerRedux } from 'dva/router';
import router from 'umi/router';
import classNames from 'classnames';
import Media from 'react-media';
import logo from '@/assets/logo_inside@2x.png';
import Header from './Header';
import Context from './MenuContext';
import PageLoading from '@/components/PageLoading';
import { getUserAvatar } from '@/services/api';
import SiderMenu from '@/components/SiderMenu';
import getPageTitle from '@/utils/getPageTitle';
import styles from './BasicLayout.less';

// lazy load SettingDrawer
const SettingDrawer = React.lazy(() => import('@/components/SettingDrawer'));

const { Content } = Layout;

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

class BasicLayout extends React.Component {
  state = {
    imageUrl: '',
  };

  componentWillMount() {
    const {
      dispatch,
      route: { routes, authority },
    } = this.props;
    dispatch({
      type: 'menu/getMenuData',
      payload: { routes, authority },
    });
    dispatch({
      type: 'permission/initPremission',
      payload: {
        campusId: localStorage.getItem('campusId'),
      },
    });
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const that = this;
    const teacherId = localStorage.getItem('teacherId');
    const url = window.location.href;
    if (
      url.indexOf('/home') > -1 ||
      url.indexOf('/papermanage') > -1 ||
      url.indexOf('/examination') > -1 ||
      url.indexOf('/campusmanage') > -1 ||
      url.indexOf('/classallocation') > -1 ||
      url.indexOf('/exception') > -1 ||
      url.indexOf('/account') > -1 ||
      url.indexOf('/notice') > -1
    ) {
      dispatch({
        type: 'setting/getSetting',
      });
      if (teacherId) {
        dispatch({
          type: 'menu/unPublicResultNum',
          payload: { teacherId },
        });
      }
      if (localStorage.getItem('uid')) {
        getUserAvatar({
          fileId: localStorage.getItem('uid'),
        }).then(e => {
          if (e && e.responseCode === '200') {
            that.setState({
              imageUrl: e.data.path,
            });
            localStorage.setItem('imageUrl', e.data.path);
          }
        });
      }

      this.getCampusList();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { avatarUrl, campusID } = nextProps;
    const { props } = this;
    const {
      dispatch,
      route: { routes, authority },
    } = this.props;
    const that = this;
    if (campusID !== props.campusID) {
      dispatch({
        type: 'menu/getMenuData',
        payload: { routes, authority },
      });
    }
    if (avatarUrl !== props.avatarUrl) {
      const url = window.location.href;
      if (
        url.indexOf('/home') > -1 ||
        url.indexOf('/papermanage') > -1 ||
        url.indexOf('/examination') > -1 ||
        url.indexOf('/campusmanage') > -1 ||
        url.indexOf('/classallocation') > -1 ||
        url.indexOf('/exception') > -1 ||
        url.indexOf('/account') > -1 ||
        url.indexOf('/notice') > -1
      ) {
        that.setState({
          imageUrl: avatarUrl,
        });
        localStorage.setItem('imageUrl', avatarUrl);
      }
    }
  }

  // 获取校区列表
  getCampusList() {
    const { dispatch } = this.props;
    const accountId = localStorage.getItem('uid');
    const param = { accountId };
    dispatch({
      type: 'login/queryCampusList',
      payload: param,
      callback: data => {
        if (data.length === 0) {
          router.push('/home');
        }
      },
    });
  }

  getContext() {
    const { location, breadcrumbNameMap } = this.props;
    return {
      location,
      breadcrumbNameMap,
    };
  }

  // 校区切换
  handleCampusChange = (value, campusId, name, tenantId, isAdmin, isSubjectAdmin) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'login/switchCurrentCampus',
      payload: { value, campusId },
      callback: () => {
        // 获取未发布任务数量
        if (value) {
          dispatch({
            type: 'menu/unPublicResultNum',
            payload: { teacherId: value },
          });
        }
        localStorage.setItem('campusId', campusId);
        localStorage.setItem('teacherId', value);
        localStorage.setItem('userName', name);
        localStorage.setItem('tenantId', tenantId);
        localStorage.setItem('isAdmin', isAdmin);
        localStorage.setItem('isSubjectAdmin', isSubjectAdmin);
        // dispatch(routerRedux.push('/home'));
        window.location.href = '/home';
      },
    });
  };

  getLayoutStyle = () => {
    const { fixSiderbar, isMobile, collapsed, layout } = this.props;
    if (fixSiderbar && layout !== 'topmenu' && !isMobile) {
      return {
        paddingLeft: collapsed ? '80px' : '200px',
      };
    }
    return null;
  };

  handleMenuCollapse = collapsed => {
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  renderSettingDrawer = () => {
    // Do not render SettingDrawer in production
    // unless it is deployed in preview.pro.ant.design as demo
    if (process.env.NODE_ENV === 'production' && APP_TYPE !== 'site') {
      return null;
    }
    return <SettingDrawer />;
  };

  render() {
    const {
      navTheme,
      layout: PropsLayout,
      children,
      location: { pathname },
      isMobile,
      menuData,
      breadcrumbNameMap,
      fixedHeader,
      campusList,
      loading,
      unPublicNum,
    } = this.props;
    // console.log(loading,menuData)
    const { imageUrl } = this.state;
    const isTop = PropsLayout === 'topmenu';
    const contentStyle = !fixedHeader ? { paddingTop: 0 } : {};
    if (pathname.includes('/publish/selectpaper')) {
      contentStyle.backgroundColor = '#EEF2F6';
    }
    const layout = (
      <Layout>
        {isTop && !isMobile && loading === true ? null : (
          <SiderMenu
            logo={logo}
            theme={navTheme}
            onCollapse={this.handleMenuCollapse}
            menuData={menuData}
            isMobile={isMobile}
            campusList={campusList}
            imageUrl={imageUrl}
            unPublicNum={unPublicNum}
            {...this.props}
          />
        )}
        <Layout
          style={{
            ...this.getLayoutStyle(),
            minHeight: '100vh',
            width: 'calc(100% - 200px)',
          }}
        >
          <Header
            menuData={menuData}
            handleMenuCollapse={this.handleMenuCollapse}
            onChangeCampus={(value, campusId, userName, tenantId, isAdmin, isSubjectAdmin) =>
              this.handleCampusChange(value, campusId, userName, tenantId, isAdmin, isSubjectAdmin)
            }
            logo={logo}
            isMobile={isMobile}
            {...this.props}
          />
          {menuData.length > 0 && (
            <Content className={styles.content} style={contentStyle}>
              {children}
            </Content>
          )}
        </Layout>
      </Layout>
    );
    return (
      <React.Fragment>
        <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>
          <ContainerQuery query={query}>
            {params => (
              <Context.Provider value={this.getContext()}>
                <div className={classNames(params)}>{layout}</div>
              </Context.Provider>
            )}
          </ContainerQuery>
        </DocumentTitle>
        <Suspense fallback={<PageLoading />}>{this.renderSettingDrawer()}</Suspense>
      </React.Fragment>
    );
  }
}

export default connect(({ global, setting, menu: menuModel, login, loading, permission }) => ({
  loading: loading.effects['menu/getMenuData'],
  campusID: login.campusID,
  avatarUrl: login.avatarUrl,
  campusList: login.campusList,
  collapsed: global.collapsed,
  layout: setting.layout,
  menuData: menuModel.menuData,
  breadcrumbNameMap: menuModel.breadcrumbNameMap,
  unPublicNum: menuModel.unPublicNum,
  permission,
  ...setting,
}))(props => (
  <Media query="(max-width: 599px)">
    {isMobile => <BasicLayout {...props} isMobile={isMobile} />}
  </Media>
));
