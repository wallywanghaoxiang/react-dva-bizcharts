/**
 *
 * User: Sam.wang
 * Email sam.wang@fclassroom.com
 * Date: 19-04-02
 * Time: AM 10:38
 * Explain: 教学班空数据的情况下
 *
 * */
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import studentHead from '@/assets/class/student_head.png';
import router from 'umi/router';
import styles from './index.less';

// 国际化适配方式
const messages = defineMessages({
  teachingNoData: { id: 'app.menu.classallocation.adminNoData', defaultMessage: '您的班级还没有学生哦，快快调入学生吧！' },

});


class TeachingNoData extends Component {
  state = {};

  // 空数据情况下，点击跳转班务管理页面
  gotoClasswork = () => {
    const {id} = this.props;
    router.push({
      pathname: `/classallocation/classmanage/classwork/${id}`,
    });
  };

  // jsx语法视图渲染
  render() {
    return (
      <div className={styles.teachingNoData}>
        <img className={styles.classImg} src={studentHead} alt='' />
        <div>
          {formatMessage(messages.teachingNoData)}
        </div>
        <div className={styles.manager}>
          <div className={styles.position}>
            <div onClick={() => this.gotoClasswork()}>
              <i className="iconfont icon-config" />
              <span>{formatMessage({id:"app.menu.classallocation.classwork",defaultMessage:"班务管理"})}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TeachingNoData;
