/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-27
 * Time: PM 14:29
 * Explain: 班级管理路由入口
 *
 * */
import React, { Component } from 'react';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, defineMessages } from 'umi/locale';
import Clzss from './pages/ClassManage';
import styles from './index.less';

const messages = defineMessages({
  classmanage: { id: 'app.menu.classallocation.classmanage', defaultMessage: '班级' },
});

class ClassManage extends Component {
  state = {};

  render() {
    return (
      <div className={styles.classAllocation}>
        <h1 className={styles.menuName}>{formatMessage(messages.classmanage)}</h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <Clzss />
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default ClassManage;
