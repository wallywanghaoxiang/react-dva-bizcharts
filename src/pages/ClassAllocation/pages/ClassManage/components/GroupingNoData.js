/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-02
 * Time: AM 13:21
 * Explain: 我的分组空数据的情况下
 *
 * */
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import studentHead from '@/assets/class/student_head.png';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  groupingNoData: { id: 'app.menu.classallocation.groupingNoData', defaultMessage: '未查询到相关学生' },

});

class GroupingNoData extends Component {
  state = {};

  // jsx语法视图渲染
  render() {
    return (
      <div className={styles.groupingNoData}>
        <img className={styles.classImg} src={studentHead} alt='' />
        <div>
          {formatMessage(messages.groupingNoData)}
        </div>
      </div>
    );
  }
}

export default GroupingNoData;
