/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-03-28
 * Time: PM 13:02
 * Explain: 行政班,教学班没有数据情况
 *
 * */
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import noClass from '@/assets/class/not_data_class.png';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  adminNoData: { id: 'app.menu.classallocation.adminNoData', defaultMessage: '校管理员暂未添加您的行政班级' },
  teachNoData: { id: 'app.menu.classallocation.teachNoData', defaultMessage: '校管理员暂未添加您的教学班级' },

});

class NoData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showDate: props.curTab,
    };
  }

  // jsx语法视图渲染
  render() {
    const { showDate } = this.state;
    return (
      <div className={styles.noData}>
        <img className={styles.classImg} src={noClass} alt='' />
        <div hidden={showDate !== 'teachlist'}>
          {formatMessage(messages.teachNoData)}
        </div>
        <div hidden={showDate !== 'adminlist'}>
          {formatMessage(messages.adminNoData)}
        </div>
      </div>
    );
  }
}

export default NoData;
