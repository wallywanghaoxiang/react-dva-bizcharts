import React from 'react';
import { Divider } from 'antd';
import styles from './index.less';

/**
 * 学生报告-能力分析
 * @author tina.zhang
 * @date   2019-05-16
 * @param {number} rate - 得分率(0-1小数)
 * @param {boolean} isCurrentTask - 是否本次考试
 * @param {string} taskName - 任务名称
 */
function TraceBar(props) {

  // #region 格式化得分率
  const formatScoreRate = (scoreRate) => {
    let left;
    let score;
    if (!scoreRate || scoreRate === 0) {
      left = 0.5;
      score = 0;
    } else if (scoreRate === 1) {
      left = 99.5;
      score = 100;
    } else {
      score = scoreRate * 1000 / 10;
      left = score;
    }
    return { left, score: parseFloat(parseFloat(score).toFixed(1)) };
  }
  // #endregion

  const { rate, taskName, isCurrentTask } = props;

  const formatRate = formatScoreRate(rate);

  const flagStyle = {
    left: `${formatRate.left}%`
  };

  let scoreStyle = {};
  if (formatRate.score > 50) {
    scoreStyle = {
      left: '-35px'
    };
  }

  let currentTaskNameStyle = {};
  if (isCurrentTask === true) {
    currentTaskNameStyle = {
      color: '#333333',
      fontWeight: 'bold'
    }
  }

  const dividerStyle = {
    height: '2px',
    background: isCurrentTask === true ? ' #03C46B' : '#CCCCCC'
  }

  return (
    <div className={styles.traceBarItem}>
      <div className={styles.taskName} style={currentTaskNameStyle}>{taskName}</div>
      <div className={styles.timeline}>
        <div className={styles.flag} style={flagStyle}>
          <div className={styles.score} style={scoreStyle}>{`${formatRate.score}%`}</div>
        </div>
        <Divider type="horizontal" style={dividerStyle} />
        <div className={styles.ticks}>
          <div className={styles.start}>0%</div>
          <div className={styles.end}>100%</div>
        </div>
      </div>
    </div>
  )
}

export default TraceBar
