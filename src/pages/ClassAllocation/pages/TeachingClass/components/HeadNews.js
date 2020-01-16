/**
 *
 * User: tina.zhang
 * Explain: 教学班信息剩余时间提示
 *
 * */
import React, { Component } from 'react';
import { Tooltip } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

class HeadNews extends Component {
  state = {};

  render() {
    const { lastDays } = this.props;
    // 教学班列表信息
    const ShowMessage = () => (
      <div className={styles.message}>
        <div style={{ fontSize: 13 }}>{formatMessage({id:"app.text.classManage.during.period ",defaultMessage:"学生异动期内，您可以添加、删除"})}</div>
        <div style={{ fontSize: 13 }}>{formatMessage({id:"app.text.classManage.students.processed",defaultMessage:"或导入学生，还可以对学生进行调班处理"})}</div>
      </div>
    );

    return (
      <div className={styles.headNews} hidden={lastDays===0 || lastDays===null}>
        {lastDays > 0 ? (
          <div className={styles.position}>
            {formatMessage({id:"app.text.classManage.student.movement.period",defaultMessage:"学生异动期已开启，距离结束还剩"})}
            {lastDays == 1 ? <span>{formatMessage({id:"app.campus.manage.class.config.last.day",defaultMessage:"最后一天"})}</span>:  <span>{lastDays}{formatMessage({id:"app.campus.manage.class.config.day",defaultMessage:"天"})}</span>}
            <Tooltip placement="top" title={<ShowMessage />}>
              <i className="iconfont icon-help" />
            </Tooltip>
          </div>
        ) : null}
      </div>
    );
  }
}

export default HeadNews;
