import React, { Component } from 'react';
import cs from 'classnames';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import { formatDateTime } from '@/utils/utils';

const messages = defineMessages({
    launchTeacher:{id:'app.teacher.home.launch.teacher.title',defaultMessage:'发起教师'},
    date:{id:'app.teacher.home.date.title',defaultMessage:'日期'},
    reason:{id:'app.teacher.home.reason.title',defaultMessage:'原因'},
    agree:{id:'app.teacher.home.agree.btn.title',defaultMessage:'同意'},
    reject:{id:'app.teacher.home.reject.btn.title',defaultMessage:'驳回'},
  })
class DropoutItem extends Component {
    state = {
      };

      componentWillMount() {
    }

    // 同意
    clickAgree = () => {
      const { onAgree } = this.props;
      onAgree();
    }

    // 驳回
    clickReject = () => {
      const { onReject } = this.props;
      onReject();
    }


    render() {
       const { item } = this.props;
        return (
          <div className={styles.dropoutItem}>
            <div className={styles.left}>
              <div className={styles.top}>
                <span className={styles.name}>{item.studentName}</span>
                <span className={styles.divider}>/</span>
                <span className={styles.classN}>{item.className}</span>
              </div>
              <div className={styles.bottom}>
                <div className={styles.cont}>
                  <span>{formatMessage(messages.launchTeacher)}：</span>
                  <span>{item.teacherName}</span>
                </div>
                <div className={styles.cont}>
                  <span>{formatMessage(messages.date)}：</span>
                  <span>{formatDateTime(item.quitTime)}</span>
                </div>
                <div className={cs(styles.cont,styles.reason)}>
                  <div>{formatMessage(messages.reason)}：</div>
                  <div className={styles.reasonTxt} title={item.quitCommentValue}>{item.quitCommentValue}</div>
                </div>
              </div>
            </div>
            <div className={styles.right}>
              <div className={cs(styles.btn,styles.agree)} onClick={this.clickAgree}>{formatMessage(messages.agree)}</div>
              <div className={cs(styles.btn,styles.reject)} onClick={this.clickReject}>{formatMessage(messages.reject)}</div>
            </div>
          </div>
    )
    }
}

export default DropoutItem