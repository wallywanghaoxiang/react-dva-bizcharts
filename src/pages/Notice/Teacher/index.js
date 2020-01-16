import React, { PureComponent } from 'react';
import { message } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import emitter from '@/utils/ev';
import { formatMessage, defineMessages } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Pagination from '@/components/Pagination/index';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import NoticeTab from '../Components/NoticeTab';
import NoticeList from '../Components/NoticeList';
import constant from '../constant';
import styles from './index.less';

const messages = defineMessages({
  notice: { id: 'app.menu.notice', defaultMessage: '我的消息' },
  noticeInfo: { id: 'app.menu.notice.info', defaultMessage: '详情' },
  noticeLoadingTip: { id: 'app.notice.loading.tip', defaultMessage: '消息加载中，请稍等...' }
});

// const keys
const { NOTICE_TAB_KEYS } = constant;

/**
 * 站内信-教师端入口
 * @author tina.zhang
 * @date   2019-07-08
 */
@connect(({ notice, login }) => ({
  activeTabKey: notice.activeTabKey,
  noticePagination: notice.noticePagination,
  noticeList: notice.noticeList,
  campusList: login.campusList
}))
class Teacher extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      pageLoading: true,
      isShowNoticeInfo: false
    }
  }

  componentDidMount() {
    const { activeTabKey, noticePagination } = this.props;
    this.loadNoticeList(noticePagination.pageIndex, activeTabKey);
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({ type: 'report/clearCache' });
  }

  // 加载消息列表
  loadNoticeList = (pageIndex, activeTabKey) => {
    const { dispatch } = this.props;
    let readStatus = null;
    let isRecommended = null;
    if (activeTabKey === NOTICE_TAB_KEYS.Recommend) {
      isRecommended = 'Y';
    } else if (activeTabKey === NOTICE_TAB_KEYS.UnRead) {
      readStatus = 'N';
    }
    dispatch({
      type: 'notice/getNoticeList',
      payload: {
        accountId: localStorage.uid,
        readStatus,
        isRecommended,
        pageIndex
      }
    }).then(res => {
      this.setState({
        pageLoading: false
      })
    });
  }

  // 切换选项卡
  handleTabChange = (key) => {
    const { dispatch } = this.props
    dispatch({
      type: 'notice/setActiveTabKey',
      payload: {
        activeTabKey: key
      }
    });
    this.setState({
      pageLoading: true
    }, () => {
      this.loadNoticeList(1, key);
    })
  }

  // 分页
  handlePageChange = (pageIndex) => {
    const { activeTabKey } = this.props;
    this.loadNoticeList(pageIndex, activeTabKey);
  }

  // 本页全部已读
  handleReadAllClick = () => {
    const { dispatch, noticeList, activeTabKey, noticePagination } = this.props;
    if (noticeList && noticeList.length > 1) {
      const idList = noticeList.map(v => v.id);
      const hidden = message.loading('执行中...', 0);
      dispatch({
        type: 'notice/updateNoticeState',
        payload: {
          messageSendIds: idList,
          readStatus: 'Y',
          recommendStatus: 'Y'
        }
      }).then(res => {
        hidden();
        if (res.responseCode !== '200') {
          //   this.loadNoticeList(noticePagination.pageIndex, activeTabKey);
          // } else {
          message.error(`操作失败,${res.data}`);
        }
      });
    }
  }

  // 显示或未显示 消息详情弹窗
  onNoticeInfoShow = (noticeId, updateStateCallback) => {
    const { dispatch } = this.props
    let isShow = false;
    if (noticeId && noticeId.length > 0) {
      isShow = true;
      dispatch({
        type: 'notice/updateNoticeState',
        payload: {
          messageSendIds: [noticeId],
          readStatus: 'Y',
          recommendStatus: 'Y'
        }
      }).then(res => {
        if (res.responseCode !== '200') {
          message.error(res.data);
        }
        if (updateStateCallback && typeof (updateStateCallback) === 'function') {
          updateStateCallback();
        }
      })
    }
    this.setState({
      isShowNoticeInfo: isShow
    });
  }

  // 切换校区
  handleSwitchCampus = (notice, switchCampusCallback) => {
    const { dispatch, campusList } = this.props
    const campusInfo = campusList.find(v => v.tenantId === notice.tenantId);
    dispatch({
      type: 'login/switchCurrentCampus',
      payload: { value: campusInfo.teacherId, campusId: campusInfo.campusId },
      callback: () => {
        // 获取未发布任务数量
        if (campusInfo.teacherId) {
          dispatch({
            type: 'menu/unPublicResultNum',
            payload: { teacherId: campusInfo.teacherId },
          });
        }
        localStorage.setItem('campusId', campusInfo.campusId);
        localStorage.setItem('campusName', campusInfo.campusName);
        localStorage.setItem('teacherId', campusInfo.teacherId);
        localStorage.setItem('userName', campusInfo.name);
        localStorage.setItem('tenantId', campusInfo.tenantId);
        localStorage.setItem('isAdmin', campusInfo.isAdmin);
        localStorage.setItem('isSubjectAdmin', campusInfo.isSubjectAdmin);
        emitter.emit('switchCampusByNotice');
        switchCampusCallback();
      }
    });
  }

  render() {
    const { noticeList, noticePagination, campusList, activeTabKey } = this.props
    const { pageLoading, isShowNoticeInfo } = this.state;

    const { total, pages, pageIndex, pageSize } = noticePagination;

    return (
      <div id="divNotice" className={styles.notice}>
        <h1 className={styles.menuName}>
          {!isShowNoticeInfo && formatMessage(messages.notice)}
          {isShowNoticeInfo &&
            <>
              <Link to="/notice/list">
                <span>{formatMessage(messages.notice)}
                  <i>/</i>
                </span>
              </Link>
              {formatMessage(messages.noticeInfo)}
            </>
          }
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          <NoticeTab defaultActiveTabKey={activeTabKey} onChange={(key) => this.handleTabChange(key)} readAllClick={this.handleReadAllClick} />
          <div className={styles.noticeContent}>
            {pageLoading && <NoData noneIcon={noneicon} tip={formatMessage(messages.noticeLoadingTip)} onLoad={pageLoading} />}

            {!pageLoading && noticeList &&
              <>
                <NoticeList
                  dataSource={noticeList}
                  campusList={campusList}
                  onNoticeInfoShow={this.onNoticeInfoShow}
                  switchCampus={this.handleSwitchCampus}
                />
                {pages > 1 &&
                  <div className={styles.pagination}>
                    <Pagination
                      current={pageIndex}
                      pageSize={pageSize}
                      total={total}
                      onChange={this.handlePageChange}
                    />
                  </div>
                }
              </>
            }
          </div>
        </PageHeaderWrapper>
      </div>
    )
  }
}

export default Teacher;
