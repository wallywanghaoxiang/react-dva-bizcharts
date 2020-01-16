import React, { Component } from 'react';
import ProductTitle from './productTitle';
import styles from './productCenter2.less';

/**
 * 全场景介绍 第2屏
 * @param {boolean} enter - 进入页面
 */
class ProductCenter2 extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { enter } = this.props;
    return (
      <div id={enter ? styles.enterName : ''} className={styles.productCenter2Container}>
        <ProductTitle enter={enter} title="全场景覆盖" subTitle="满足多种训练需求" />
        <div className={styles.card1}>
          <div className={styles.textbox}>
            <div className={styles.textcontent} />
          </div>
          <div className={styles.imgbox}>
            <div className={styles.white}>
              <div className={styles.proimg} />
            </div>
          </div>
        </div>
        <div className={styles.card2}>
          <div className={styles.imgbox}>
            <div className={styles.white}>
              <div className={styles.proimg} />
            </div>
          </div>
          <div className={styles.textbox}>
            <div className={styles.textcontent2} />
          </div>
        </div>
      </div>
    );
  }
}

export default ProductCenter2;
