
import React, { Component } from 'react';
import styles from './index.less';

/**
 *
 * @author tina.zhang
 * @date 2019-07-29
 * @class ArrowDown
 * @extends {Component}
 * @param {boolean} gapTop - 顶部是否需要空隙
 * @param {boolean} gapBottom - 底部是否需要空隙
 * @param {number} arrowHeight - 高度
 */
class ArrowDown extends Component {
  state = {
  }

  componentDidMount() {
  }

  render() {
    
    const { gapTop,gapBottom,style,arrowHeight } = this.props;
    return (
      <div className={styles.arrowDownContainer} style={{...style,paddingTop:gapTop ? '8px' : '0px',paddingBottom:gapBottom?'8px':'0px'}}>
        <div className={styles.top} style={{height:`${arrowHeight}px`}} />
        <div className={styles.bottom} />
      </div>
    );
  }
}
export default ArrowDown;

