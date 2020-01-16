import React from 'react';
import { formatMessage } from 'umi/locale';
import noIcon from '@/assets/examination/none_serach_pic.png';

/**
 * 暂无搜索结果学生列表
 * @author tina.zhang
 * @date 2019-8-2 11:32:12
 * @param {boolean} showBorder - 是否显示边框
 */
function NoSearchResult(props) {
  const { showBorder } = props;
  const styles = {
    border: showBorder ? '1px solid #E5E5E5' : 'none',
    minHeight: '67vh',
    height: '100%',
    background: '#ffffff',
    textAlign: 'center',
    img: {
      margin: '0 auto',
      marginTop: '150px',
    },
    p: {
      margin: '0',
      padding: '0',
      color: '#888',
      fontSize: '14px',
    }
  }

  return (
    <div style={styles}>
      <img style={styles.img} src={noIcon} alt="" />
      <p style={styles.p}>
        {formatMessage({ id: "app.text.uexam.examination.inspect.registration.import.noneSearch", defaultMessage: "暂无搜索结果" })}
      </p>
    </div>
  )
}

export default NoSearchResult
