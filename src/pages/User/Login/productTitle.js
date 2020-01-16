import React, { PureComponent } from 'react';
import { Divider } from 'antd';
import styles from './productTitle.less';

/**
 * 产品介绍 title
 * @param {boolean} enter - 是否进入页面
 * @param {string} title - 主标题
 * @param {string} subTitle - 副标题
 */
class ProductTitle extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { enter, title, subTitle } = this.props;
    return (
      <div
        id={enter ? styles.enterName : ''}
        className={styles.productTitleContainer}
        style={{ marginBottom: window.screen.height <= 768 ? '2vh' : '50px' }}
      >
        <div className={styles.content}>
          <span className={styles.title}>{title}</span>
          <Divider type="vertical" />
          <span className={styles.subTitle}>{subTitle}</span>
        </div>
      </div>
    );
  }
}

export default ProductTitle;
