import React from 'react';
import { Badge } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

/**
 * 能力分析 右侧能力栅格
 * @author tina.zhang
 * @date   2019-05-11
 * @param {array} dataSource - 数据源
 * @param {string} color - 能力项颜色，来自左侧雷达图
 */
function RightGrid(props) {

  const { dataSource, color } = props;

  const itemStyle = {
    borderColor: color,
    // background: getRGBWithTransition(color)
  }

  return (
    <div className={styles.rightGrid}>
      {dataSource && dataSource.statis && dataSource.statis.map((item, index) => {
        return (
          // eslint-disable-next-line react/no-array-index-key
          <div key={`${item.abilityCode}_${index}`} className={styles.rightGridItem} style={itemStyle}>
            <Badge dot color={color} />
            <span className={styles.name}>{item.abilityCode}</span> {/* item.abilityName */}
            <span className={classNames(styles.score, item.abilityAvgScore === '--' ? styles.emptyline : null)}>{item.abilityAvgScore}</span>
          </div>
        )
      })}
    </div>
  )
}

export default RightGrid;
