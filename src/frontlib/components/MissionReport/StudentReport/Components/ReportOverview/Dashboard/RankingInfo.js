import React from 'react'
import { formatMessage, defineMessages, FormattedMessage } from 'umi/locale';
import constant from '../../../../constant';
import styles from './index.less';

const messages = defineMessages({
  noscore: { id: 'app.examination.report.st.rankinginfo.noscore', defaultMessage: '没有得分' },
  afterThirdRank: { id: 'app.examination.report.st.rankinginfo.afterThirdRank', defaultMessage: '要更加努力哦' },
  top1: { id: 'app.examination.report.st.rankinginfo.top1', defaultMessage: '恭喜！荣登榜首' },
  top23Start: { id: 'app.examination.report.st.rankinginfo.top23Start', defaultMessage: '成功晋级' },
  top23End: { id: 'app.examination.report.st.rankinginfo.top23End', defaultMessage: 'TOP{rank}' },
  passStart: { id: 'app.examination.report.st.rankinginfo.passStart', defaultMessage: '超越了' },
  passEnd: { id: 'app.examination.report.st.rankinginfo.passEnd', defaultMessage: '的同学' },
});

// const keys
const { STUDENT_RANKING_TYPE } = constant;

/**
 * 学生报告-排名信息
 * @author tina.zhang
 * @date   2019-05-16
 * @param {number} leftText - 左侧文本（本次考试、本班）
 * @param {number} rank - 排名[0:没有得分 -1~-3:倒数三名 其他数值为名次或超越百分比]
 * @param {number} rankType - 排名方式（ranking：排名、pass：超越）
 */
function RankingInfo(props) {

  const { leftText, rank, rankType } = props;

  // 排名文案/外观
  // const renderRanking = useMemo(() => () => {
  const COLOR_GREEN = '#03C46B';
  const COLOR_YELLOW = '#FFB400';
  const COLOR_GRAY = '#E5E5E5';
  const COLOR_RED = '#FF6E4A';

  let textJSX;
  let iconJSX;
  let fillLineStyle = { width: '0%' };
  let iconStyle = {
    left: '50%',
    border: '2px solid rgba(205,246,227,1)',
    background: 'linear-gradient(142deg, rgba(10, 218, 158, 1) 0%, rgba(3, 196, 107, 1) 100%)'
  };
  // 没有得分
  if (rank === 0) {
    textJSX = <span>{formatMessage(messages.noscore)}</span>
    iconJSX = <i className="iconfont icon-cry" />
    fillLineStyle = {
      width: '0%',
      background: COLOR_GRAY
    };
    iconStyle = {
      left: `calc(0% - 0px)`,
      border: '2px solid rgba(245,245,245,1)',
      background: 'linear-gradient(142deg,rgba(225,225,225,1) 0%,rgba(204,204,204,1) 100%)'
    }
  }
  // 倒数三名
  else if (rank < 0 && rank >= -3 && rankType === STUDENT_RANKING_TYPE.ranking) {
    textJSX = <span>{formatMessage(messages.afterThirdRank)}</span>
    iconJSX = <i className="iconfont icon-however" />
    fillLineStyle = {
      width: `${-rank}%`,
      background: COLOR_RED
    };
    iconStyle = {
      left: `calc(${-rank}% - ${-rank / 100 * 11}px)`,
      border: '2px solid rgba(245,245,245,1)',
      background: 'linear-gradient(319deg,rgba(255,110,74,1) 0%,rgba(250,130,100,1) 100%)'
    }
  }
  // 第一名
  else if (rank === 1 && rankType === STUDENT_RANKING_TYPE.ranking) {
    textJSX = <span style={{ color: COLOR_YELLOW }}>{formatMessage(messages.top1)}</span>
    iconJSX = <i className="iconfont icon-king" />
    fillLineStyle = {
      width: '100%',
      background: COLOR_YELLOW
    }
    iconStyle = {
      left: `calc(100% - 11px)`,
      border: '2px solid rgba(254,237,197,1)',
      background: 'linear-gradient(142deg,rgba(254, 237, 197, 1) 0%,rgba(255, 180, 0, 1) 100%)'
    }
  }
  // 第二、三名
  else if (rank <= 3 && rankType === STUDENT_RANKING_TYPE.ranking) {
    textJSX = (
      <span>
        {formatMessage(messages.top23Start)}&nbsp;
        <span style={{ color: COLOR_GREEN }}>
          <FormattedMessage values={{ rank }} {...messages.top23End} />
        </span>
      </span>
    )
    iconJSX = <i className="iconfont icon-rocket" />
    fillLineStyle = {
      width: `${rank === 2 ? '95' : '90'}%`,
      background: COLOR_GREEN
    }
    iconStyle = {
      left: `calc(${rank === 2 ? '95' : '90'}% - ${rank === 2 ? 0.95 * 11 : 0.9 * 11}px)`,
      border: '2px solid rgba(205,246,227,1)',
      background: 'linear-gradient(142deg,rgba(10,218,158,1) 0%,rgba(3,196,107,1) 100%)'
    }
  }
  // 其他名次
  else {
    textJSX = (
      <span>
        {formatMessage(messages.passStart)}&nbsp;
        <span style={{ color: COLOR_GREEN }}>
          {rank}%
        </span>
        &nbsp;{formatMessage(messages.passEnd)}
      </span>
    );
    iconJSX = <i className="iconfont icon-rocket" />
    fillLineStyle = {
      width: `${rank}%`,
      background: COLOR_GREEN
    }
    iconStyle = {
      left: `calc(${rank}% - ${rank / 100 * 11}px)`,
      border: '2px solid rgba(205,246,227,1)',
      background: 'linear-gradient(142deg,rgba(10,218,158,1) 0%,rgba(3,196,107,1) 100%)'
    }
  }
  // }, [rank]);

  // background:linear-gradient(142deg,rgba(225,225,225,1) 0%,rgba(204,204,204,1) 100%);
  // border:2px solid rgba(245,245,245,1);

  return (
    <div className={styles.rankingInfo}>
      <div className={styles.rankingInfoBox}>
        <div className={styles.rankingInfoItem}>
          <div className={styles.left}>
            <div className={styles.text}>
              {leftText}
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.text}>
              {textJSX}
            </div>
            <div className={styles.timeline}>
              <div className={styles.fillline} style={fillLineStyle} />
              <div className={styles.icon} style={iconStyle}>
                {iconJSX}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RankingInfo
