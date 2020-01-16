import React, { useState } from 'react';
import { Button } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import classnames from 'classnames';
import constant from '../../constant';
import styles from './index.less';

const messages = defineMessages({
  noticeFilterAll: { id: 'app.notice.list.filter.all', defaultMessage: '全部' },
  noticeFilterUnread: { id: 'app.notice.list.filter.unread', defaultMessage: '未读' },
  noticeFilterRecommend: { id: 'app.notice.list.filter.recommend', defaultMessage: '重要消息' },
  noticeReadAllText: { id: 'app.notice.list.filter.readAll', defaultMessage: '本页全部已读' },
})

// const keys
const { NOTICE_TAB_KEYS } = constant;

/**
 * 站内信 切换tab
 * @author tina.zhang
 * @date   2019-07-08
 * @param {string} defaultActiveTabKey - 默认选中tab
 * @param {function} onChange - tab切换事件
 * @param {function} readAllClick - 全部已读点击事件
 */
function NoticeTab(props) {

  const { onChange, defaultActiveTabKey, readAllClick } = props;

  const [activeTabKey, setActiveTabKey] = useState(defaultActiveTabKey || NOTICE_TAB_KEYS.ALL);

  // Tab 切换
  const handleLink = (key) => {
    setActiveTabKey(key);
    if (onChange && typeof (onChange) === 'function') {
      onChange(key);
    }
  }

  // 本页全部已读
  const handleReadAllClick = () => {
    if (readAllClick && typeof (readAllClick) === 'function') {
      readAllClick();
    }
  }

  return (
    <div className={styles.reportTabs}>
      <span
        key={NOTICE_TAB_KEYS.ALL}
        className={classnames(styles.tabItem, activeTabKey === NOTICE_TAB_KEYS.ALL ? styles.active : '')}
        onClick={() => { handleLink(NOTICE_TAB_KEYS.ALL); }}
      >
        {formatMessage(messages.noticeFilterAll)}
      </span>
      <span
        key={NOTICE_TAB_KEYS.UnRead}
        className={classnames(styles.tabItem, activeTabKey === NOTICE_TAB_KEYS.UnRead ? styles.active : '')}
        onClick={() => handleLink(NOTICE_TAB_KEYS.UnRead)}
      >
        {formatMessage(messages.noticeFilterUnread)}
      </span>
      <span
        key={NOTICE_TAB_KEYS.Recommend}
        className={classnames(styles.tabItem, activeTabKey === NOTICE_TAB_KEYS.Recommend ? styles.active : '')}
        onClick={() => handleLink(NOTICE_TAB_KEYS.Recommend)}
      >
        {formatMessage(messages.noticeFilterRecommend)}
      </span>
      <div className={styles.rightBtns}>
        <Button className={styles.readAll} onClick={() => handleReadAllClick()}>{formatMessage(messages.noticeReadAllText)}</Button>
      </div>
    </div>
  )
}

export default NoticeTab;
