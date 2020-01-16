import React from 'react';
import { formatMessage } from 'umi/locale';
import noIcon from '@/assets/none_group_pic.png';

/**
 * 暂无监考安排信息
 * @author tina.zhang
 * @date 2019-8-9 17:41:06
 */
function NoImport() {
  const styles = {
    // width: '100%',
    // height: '100%',
    background: '#ffffff',
    textAlign: 'center',
    img: {
      margin: '0 auto',
      marginTop: '160px',
    },
    p: {
      margin: '0',
      padding: '0',
      color: '#888',
      fontSize: '14px',
    }
  }

  return (
    <div className="noImport" style={styles}>
      <img style={styles.img} src={noIcon} alt="" />
      <p style={styles.p}>
        {formatMessage({id:"app.text.uexam.examination.invigilation.nonedata",defaultMessage:"暂无监考安排信息"})}
      </p>
    </div>
  )
}

export default NoImport
