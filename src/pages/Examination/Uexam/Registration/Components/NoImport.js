import React from 'react';
import { formatMessage } from 'umi/locale';
import noIcon from '@/assets/examination/none_student_pic.png';

/**
 * 暂未导入学生
 * @author tina.zhang
 * @date 2019-8-2 20:18:29
 * @param {boolean} showBorder - 是否显示边框
 */
function NoImport(props) {
  const { showBorder } = props;

  const styles = {
    border: showBorder ? '1px solid #E5E5E5' : 'none',
    minHeight: '66vh',
    width: '100%',
    height: '100%',
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
    <div style={styles}>
      <img style={styles.img} src={noIcon} alt="" />
      <p style={styles.p}>
        {formatMessage({ id: "app.text.uexam.examination.inspect.registration.import.noneImport", defaultMessage: "暂未导入学生" })}
      </p>
    </div>
  )
}

export default NoImport
