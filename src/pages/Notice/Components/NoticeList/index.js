import React, { useState, useCallback, useMemo } from 'react'
import { Badge, Tag, Button, Modal } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import { timestampToTime } from '@/utils/utils';
import NoData from '@/components/NoData/index';
import noneicon from '@/assets/notice/none_notice.png';
import NoticeInfo from '../../NoticeInfo';
import styles from './index.less';

const messages = defineMessages({
  detailBtnText: { id: 'app.notice.list.item.detail', defaultMessage: '查看' },
  noDataText: { id: 'app.notice.list.nodata', defaultMessage: '暂无消息' },
  recommendedFlagText: { id: 'app.notice.list.item.recommended.text', defaultMessage: '重要消息' },
  changeCampusConfirmMsgStart: { id: 'app.notice.list.item.changecampus.confirm.start', defaultMessage: '将为您切换到' },
  changeCampusConfirmMsgEnd: { id: 'app.notice.list.item.changecampus.confirm.end', defaultMessage: '是否切换' },
  changeCampusOkBtn: { id: 'app.notice.list.item.changecampus.okbtn', defaultMessage: '切换' },
  changeCampusCancelBtn: { id: 'app.notice.list.item.changeCampus.cancelbtn', defaultMessage: '取消' },
})

/**
 * 教师报告-成绩单
 * @author tina.zhang
 * @date   2019-07-08
 * @param {object} dataSource - 数据源
 * @param {number} campusList - 当前用户所属校区
 * @param {function} onNoticeInfoShow - 显示消息详情回调
 * @param {function} switchCampus - 切换校区
 */
function TranscriptList(props) {

  const { dataSource, campusList, onNoticeInfoShow, switchCampus } = props;

  const [currentNotice, setCurrentNotice] = useState(null);

  // #region 判断是否需显示校区列
  // from VB-6370
  // 1.只要本页消息中满足一下条件之一，就展示校区列（通过tenantId判断）:
  //   a)本页消息中，存在两个不同校区的消息   b)本页消息中，存在非当前校区的消息
  // 2.某条消息，如果tenantId不属于当前老师所在的所有学校（就是和学校切换那个下拉框里面的数据比较一下），则该消息不显示【查看】按钮
  const showCampusColumn = useMemo(() => {
    let show = false;
    const dataTenantIdList = dataSource.map(v => v.tenantId);
    const set = new Set(dataTenantIdList);
    if (set.size > 1 || dataTenantIdList.some(v => v !== localStorage.tenantId)) {
      show = true;
    }
    return show;
  }, [dataSource, campusList])

  // #endregion

  // #region 事件处理
  const execShowNotice = useCallback((notice) => {
    if (notice.dealUri && notice.dealUri.length > 0) {
      if (onNoticeInfoShow && typeof (onNoticeInfoShow) === 'function') {
        onNoticeInfoShow(notice.id, () => {
          window.location.href = notice.dealUri;
        });
      }
    } else {
      setCurrentNotice(notice.id);
      if (onNoticeInfoShow && typeof (onNoticeInfoShow) === 'function') {
        onNoticeInfoShow(notice.id);
      }
    }
  }, [])

  const handleShowDetailClick = useCallback((item) => {
    // 非当前校区，先切换，完成后打开
    if (localStorage.tenantId !== item.tenantId) {
      Modal.confirm({
        content: <span>{formatMessage(messages.changeCampusConfirmMsgStart)} <span className={styles.modalTenantName}>{item.tenantName}</span> ，{formatMessage(messages.changeCampusConfirmMsgEnd)}?</span>,
        okText: formatMessage(messages.changeCampusOkBtn),
        cancelText: formatMessage(messages.changeCampusCancelBtn),
        okButtonProps: {
          style: {
            color: '#FFFFFF',
            backgroundColor: '#03C46B',
            boxShadow: '0px 2px 5px 0px #03C46B'
          }
        },
        onOk() {
          if (switchCampus && typeof (switchCampus) === 'function') {
            switchCampus(item, () => {
              execShowNotice(item);
            });
          }
        },
        onCancel() {

        },
      })
    } else {
      execShowNotice(item);
    }
  }, []);

  // 弹层关闭回调
  const onDrawerClose = () => {
    setCurrentNotice(null);
    if (onNoticeInfoShow && typeof (onNoticeInfoShow) === 'function') {
      onNoticeInfoShow();
    }
  }

  // #endregion

  // #region render item
  const unReadFont = {
    fontWeight: 'bold',
    color: '#333333'
  }
  const widthSetting = useMemo(() => {
    if (showCampusColumn) {
      return {
        left: {
          width: '55%'
        },
        right: {
          width: '45%'
        },
        rightCols: {
          width: `${100 / 3}%`
        }
      }
    }
    return {
      left: {
        width: '70%'
      },
      right: {
        width: '30%'
      },
      rightCols: {
        width: `50%`
      }
    }
  }, [showCampusColumn]);

  const renderNoticeItem = (item) => {
    const showDetialBtn = campusList.some(v => v.tenantId === item.tenantId);
    return (
      <div key={item.id} className={styles.noticeListItem}>
        <div className={styles.leftCols} style={widthSetting.left}>
          {item.readStatus === 'N' &&
            <div>
              <Badge status="error" />
            </div>
          }
          {item.isRecommended === 'Y' && <Tag color="#FFB400">{formatMessage(messages.recommendedFlagText)}</Tag>}
          <span style={item.readStatus === 'N' ? unReadFont : null}>{item.title}</span>
        </div>
        <div style={widthSetting.right}>
          {showCampusColumn && <div style={widthSetting.rightCols}>{item.tenantName}</div>}
          <div style={widthSetting.rightCols}>{timestampToTime(item.sendTime)}</div>
          <div style={widthSetting.rightCols}>
            {showDetialBtn &&
              <Button type="link" onClick={() => { handleShowDetailClick(item) }}>
                {formatMessage(messages.detailBtnText)}
              </Button>
            }
          </div>
        </div>
      </div>
    )
  }
  // #endregion

  return (
    <div className={styles.noticeList}>
      {(dataSource && dataSource.length > 0)
        ? dataSource.map(v => renderNoticeItem(v))
        : <NoData noneIcon={noneicon} tip={formatMessage(messages.noDataText)} onLoad={false} />}
      {currentNotice && <NoticeInfo noticeId={currentNotice} onDrawerClose={onDrawerClose} />}
    </div>
  )
}

export default TranscriptList
