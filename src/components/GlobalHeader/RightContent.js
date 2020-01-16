import React, { PureComponent } from 'react';
import { Spin, Tag, Icon, Tooltip, Badge } from 'antd';
import moment from 'moment';
import { routerRedux } from 'dva/router';
import groupBy from 'lodash/groupBy';
import { formatMessage, defineMessages } from 'umi/locale';
// import SelectLang from '../SelectLang';
import styles from './index.less';

const messages = defineMessages({
  noticeBellTip: { id: 'app.notice.bell.tip', defaultMessage: '我的消息' },
});

export default class GlobalHeaderRight extends PureComponent {
  getNoticeData() {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime).fromNow();
      }
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  }

  getUnreadData = noticeData => {
    const unreadMsg = {};
    Object.entries(noticeData).forEach(([key, value]) => {
      if (!unreadMsg[key]) {
        unreadMsg[key] = 0;
      }
      if (Array.isArray(value)) {
        unreadMsg[key] = value.filter(item => !item.read).length;
      }
    });
    return unreadMsg;
  };

  changeReadState = clickedItem => {
    const { id } = clickedItem;
    const { dispatch } = this.props;
    dispatch({
      type: 'global/changeNoticeReadState',
      payload: id,
    });
  };

  // 站内信 add by leo 2019-7-9 07:47:38
  gotoNotice = () => {
    const { dispatch } = this.props;
    dispatch(routerRedux.push('/notice/list'))
  }

  // 渲染未读消息提醒
  renderNoticeBell = () => {
    const { unreadNoticeInfo } = this.props;
    let unreadNum = 0;
    let recommendUnreadNum = 0;
    let offsetX = -25;
    if (unreadNoticeInfo) {
      const { unreadCount, recommendUnreadCount } = unreadNoticeInfo;
      unreadNum = parseInt(unreadCount) || 0;
      recommendUnreadNum = parseInt(recommendUnreadCount) || 0;
      if (unreadNum > 99) {
        offsetX = -18;
      } else if (unreadNum > 10) {
        offsetX = -22;
      }
    }

    return (

      <Badge count={unreadNum} offset={[offsetX, 0]}>
        <Tooltip title={formatMessage(messages.noticeBellTip)} placement="bottom">
          <span className={styles.action} onClick={() => { this.gotoNotice() }}>
            <Icon className={recommendUnreadNum > 0 ? styles.noticeBell : null} type="bell" />
          </span>
        </Tooltip>
      </Badge>

    )
  }

  render() {
    const { theme, dispatch } = this.props;
    const accountId = localStorage.getItem('uid');
    let className = styles.right;
    if (theme === 'dark') {
      className = `${styles.right}  ${styles.dark}`;
    }

    function logoutUser() {
      dispatch({
        type: 'login/logout',
      });
    }

    function UserCenter() {
      dispatch(routerRedux.push('/account/center'))
    }

    return (
      <div className={className}>
        {this.renderNoticeBell()}
        {accountId ? (
          <Tooltip title="用户中心" placement="bottom">
            <span className={styles.action} onClick={UserCenter}>
              <Icon type="user" />
            </span>
          </Tooltip>
        ) :
          (
            <Spin size="small" style={{ marginLeft: 8, marginRight: 8 }} />
          )}

        <Tooltip title="退出登录" placement="bottom">
          <span className={styles.action} onClick={logoutUser}>
            <i className="iconfont icon-logout" />
          </span>
        </Tooltip>
        {/* <SelectLang className={styles.action} /> */}
      </div>
    );
  }
}
