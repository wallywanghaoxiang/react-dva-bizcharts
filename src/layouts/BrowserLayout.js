import React, { PureComponent } from 'react';
import { Layout } from 'antd';
import styles from './BrowserLayout.less';
import logoIcon from '@/assets/logo_icon.png';

const { Content } = Layout;

class BrowserLayout extends PureComponent {

  render() {
    const { children } = this.props;
    return (
      <div className={styles.browser}>
        <img src={logoIcon} className={styles.img} alt="" />
        <Content>
          {children}
        </Content>
      </div>
    );
  }
}

export default BrowserLayout;
