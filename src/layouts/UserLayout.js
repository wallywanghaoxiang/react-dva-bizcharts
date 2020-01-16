import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import DocumentTitle from 'react-document-title';
import GlobalFooter from '@/components/GlobalFooter';
import styles from './UserLayout.less';
import getPageTitle from '@/utils/getPageTitle';

const copyright = <Fragment />;

class UserLayout extends Component {
  componentDidMount() {

  }

  render() {
    const {
      children,
      location: { pathname },
      breadcrumbNameMap,
    } = this.props;
    const isRegister = children.props.location.pathname.indexOf('register') !== -1;
    const isResetPW = children.props.location.pathname.indexOf('resetpw') !== -1;
    const isStuPerfect = children.props.location.pathname.indexOf('perfect') !== -1;
    const isToggleRole = children.props.location.pathname.indexOf('togglerole') !== -1;
    return (
      <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>
        <div className={styles.container}>
          {/* <div className={styles.lang}>
            <SelectLang />
          </div> */}
          <div className={styles.content}>
            {/* <div className={styles.top}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={logo} />
                </Link>
              </div>
            </div> */}
            {children}
          </div>
          {(isResetPW || isRegister || isStuPerfect || isToggleRole) ? null:<GlobalFooter links={null} copyright={copyright} isRegister={isRegister} />}

        </div>
      </DocumentTitle>
    );
  }
}

export default connect(({ menu: menuModel }) => ({
  menuData: menuModel.menuData,
  breadcrumbNameMap: menuModel.breadcrumbNameMap,
}))(UserLayout);
