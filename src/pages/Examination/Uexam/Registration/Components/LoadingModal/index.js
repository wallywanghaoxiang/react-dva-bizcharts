import React from 'react';
import loadingGif from '@/assets/loading.gif';
import styles from './index.less';

/**
 * 请求执行中，loading弹窗
 * @author tina.zhang
 * @date   2019-8-3 13:44:58
 * @param {string || React.ReactNode} children
 */
function LoadingModal(props) {

  const { children } = props;

  return (
    <div className={styles.loadingModal}>
      <div className={styles.loadContent}>
        <img className={styles.loading} src={loadingGif} alt="loading" />
        <div className={styles.tip}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default LoadingModal
