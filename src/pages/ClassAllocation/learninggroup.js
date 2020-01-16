/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-27
 * Time: PM 14:30
 * Explain: 学习小组路由入口
 *
 * */
import React, { Component } from 'react';
import cs from "classnames";
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { formatMessage, defineMessages } from 'umi/locale';
import Learning from './pages/LearningGroup';
import styles from './index.less';

const messages = defineMessages({
  learninggroup: { id: 'app.menu.classallocation.learninggroup', defaultMessage: '学习小组' },
});

class LearningGroup extends Component {
  state = {};

  render() {
    return (
      <div className={cs('classAllocation',styles.classAllocation)}>
        <h1 className={styles.menuName}>{formatMessage(messages.learninggroup)}</h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <Learning />
        </PageHeaderWrapper>
      </div>
    );
  }
}

export default LearningGroup;
