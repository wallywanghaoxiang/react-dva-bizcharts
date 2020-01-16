/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-28
 * Time: PM 13:24
 * Explain: 班务管理没有数据情况
 *
 * */
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import studentHead from '@/assets/class/student_head.png';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  workNoData: { id: 'app.menu.classallocation.teachNoData', defaultMessage: '未搜索到相关学生！' },

});

class WorkNoData extends Component {
  state = {};

  // jsx语法视图渲染
  render() {
    return (
      <div className={styles.noData} style={{ 'margin-top': '180px' }}>
        <img className={styles.classImg} src={studentHead} alt='' />
        <div>
          {formatMessage(messages.workNoData)}
        </div>
      </div>
    );
  }
}

export default WorkNoData;
