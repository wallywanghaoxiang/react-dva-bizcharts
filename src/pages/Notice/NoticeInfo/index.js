import React, { useState, useEffect, useMemo } from 'react';
import { Drawer, Button, Divider } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import { timestampToTime } from '@/utils/utils';
import styles from './index.less';

const messages = defineMessages({
  noticeInfoTitle: { id: 'app.notice.info.title', defaultMessage: '消息详情' },
  noticeInfoBtnReturn: { id: 'app.notice.info.return', defaultMessage: '返回' },
  noticeLoadingTip: { id: 'app.notice.loading.tip', defaultMessage: '消息加载中，请稍等...' }
});

/**
 * 站内信详情
 * @author tina.zhang
 * @date   2019-07-09
 * @param {string} noticeId 消息ID
 * @param {function} onDrawerClose 关闭回调
 */
function NoticeInfo(props) {

  const { dispatch, noticeId, onDrawerClose, noticeInfo } = props;

  const [state, setState] = useState({
    visible: true,
    pageLoading: true
  });

  useEffect(() => {
    dispatch({
      type: 'notice/getNoticeInfo',
      payload: {
        messageSendId: noticeId
      }
    }).then(res => {
      setState({
        visible: true,
        pageLoading: false
      });
    });

    return () => {
      dispatch({ type: 'notice/clearInfoState' });
    };
  }, []);

  // 返回
  const handleReturn = () => {
    setState({
      ...state,
      visible: false
    });
    if (onDrawerClose && typeof (onDrawerClose) === 'function') {
      onDrawerClose();
    }
  }

  // 监听视窗大小变化、滚动条位置，更新详情弹窗位置大小
  const [winSize, setWinSize] = useState(0);
  const [winScroll, setWinScroll] = useState(0);
  const handleWindowResize = () => {
    setWinSize(window.innerWidth);
  }
  const handleWindowScroll = () => {
    setWinScroll(window.scrollY);
  }

  useEffect(() => {
    window.addEventListener('resize', handleWindowResize)
    window.addEventListener('scroll', handleWindowScroll)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
      window.removeEventListener('scroll', handleWindowScroll)
    };
  }, []);
  const defaultTop = 110;
  const drawerStyle = useMemo(() => {
    return {
      bodyStyle: {
        marginLeft: document.getElementById("divNotice").offsetLeft,
        width: document.getElementById("divNotice").offsetWidth,
        position: 'absolute',
      },
      height: document.getElementById("divNotice").offsetHeight - 45
    }
  }, [winSize, winScroll]);

  return (
    <Drawer
      placement="bottom"
      closable={false}
      destroyOnClose
      mask={false}
      visible={state.visible}
      bodyStyle={drawerStyle.bodyStyle}
      className={styles.noticeDrawer}
      height={drawerStyle.height}
      style={{ position: 'absolute', zIndex: 1, top: 0 }}
    >
      <div className={styles.noticeInfo}>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <div className={styles.noticeContent} style={{ height: `${drawerStyle.height}px` }}>

            <div className={styles.header}>
              <span>
                {formatMessage(messages.noticeInfoTitle)}
              </span>
              <div className={styles.rightBtns}>
                <Button className={styles.btnReturn} onClick={() => handleReturn()} icon="down">
                  {formatMessage(messages.noticeInfoBtnReturn)}
                </Button>
              </div>
            </div>
            <Divider type="horizontal" />
            {state.pageLoading && <NoData noneIcon={noneicon} tip={formatMessage(messages.noticeLoadingTip)} onLoad={state.pageLoading} />}
            {!state.pageLoading && noticeInfo &&
              <div className={styles.title}>
                <div>
                  <span>{noticeInfo.title}</span>
                  <div className={styles.time}>{timestampToTime(noticeInfo.sendTime)}</div>
                </div>
                <div className={styles.content}>
                  {noticeInfo.content}
                </div>
              </div>
            }
          </div>
        </PageHeaderWrapper>
      </div>
    </Drawer>
  )
}

export default connect(({ notice }) => ({
  noticeInfo: notice.noticeInfo
}))(NoticeInfo);
