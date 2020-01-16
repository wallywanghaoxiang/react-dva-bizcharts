import React, { useCallback } from 'react';
import { Row, Col, Tooltip } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const messages = defineMessages({
  mine: { id: 'app.examination.report.chartradar.mine', defaultMessage: '我的' },
  currentClass: { id: 'app.examination.report.chartradar.currentClass', defaultMessage: '本班' },
  currentExercise: { id: 'app.examination.report.abilityanalyze.currentExercise', defaultMessage: '本次练习' },
  currentExam: { id: 'app.examination.report.abilityanalyze.currentExam', defaultMessage: '本次考试' }
});

const ABILITY_TASK_COLOR = '#FF9900';
const ABILITY_MY_COLOR = '#03C46B';
const ABILITY_CLASS_COLOR = '#228EFF';

/**
 * 学生报告-能力分析时间轴
 * @author tina.zhang
 * @date   2019-05-16
 * @param {array} fields - 数据列
 * @param {array} graphData - 数据源
 * @param {number} classCount - 班级数量
 */
function AbilityBar(props) {

  const { graphData, classCount } = props;

  const mine = formatMessage(messages.mine);
  const currentClass = formatMessage(messages.currentClass);
  const currentExam = formatMessage(messages.currentExam);

  const barRender = useCallback((item, index) => {
    const myScore = item[mine] || 0;
    const classScore = item[currentClass] || 0;
    const taskScore = item[currentExam] || 0;
    const myStyle = {
      background: ABILITY_MY_COLOR,
      width: `${myScore * 1000 / 10}%`,
    }
    const classStyle = {
      borderLeft: `12px solid ${ABILITY_CLASS_COLOR}`,
      left: `calc(${classScore * 1000 / 10}% - 6px)`,
    }
    const fullStyle = {
      borderLeft: `12px solid ${ABILITY_TASK_COLOR}`,
      left: `calc(${taskScore * 1000 / 10}% - 6px)`,
    }
    const colStyle = {
      padding: '0px'
    }
    return (
      <Row key={`${item.abilityCode}_${index}`} gutter={20} className={styles.abilityChartBarItem}>
        <Col span={6} style={colStyle}>
          <div className={styles.title}>
            {item.abilityName}
          </div>
        </Col>
        <Col span={14} style={colStyle}>
          <div className={styles.background}>
            <span className={styles.startscore}>0</span>
            <span className={styles.endscore}>1</span>
            {/* <Tooltip placement="rightTop" title={myScore}> */}
            <div className={styles.taskbar} style={myStyle} />
            {/* </Tooltip> */}
            <Tooltip placement="rightTop" title={`${classScore}`}>
              <div className={styles.otherBar} style={classStyle} />
            </Tooltip>
            {classCount.length > 1 &&
              <Tooltip placement="rightTop" title={`${taskScore}`}>
                <div className={styles.otherBar} style={fullStyle} />
              </Tooltip>
            }
          </div>
        </Col>
      </Row>
    )
  }, [graphData]);

  return (
    <div className={styles.abilityChartBar}>
      <div className={styles.abilityChartBarBox}>
        {graphData.map((item, index) => {
          return barRender(item, index);
        })}
        <div className={styles.legend}>
          <ul className={styles.legendList}>
            <li className={styles.legendListItem}>
              <i className={styles.legendMarker} style={{ background: ABILITY_MY_COLOR }} />
              <span className={styles.legendText}>{mine}</span>
            </li>
            {classCount.length > 1 &&
              <li className={styles.legendListItem}>
                <i className={styles.legendMarker} style={{ background: ABILITY_TASK_COLOR }} />
                <span className={styles.legendText}>{currentExam}</span>
              </li>
            }
            <li className={styles.legendListItem}>
              <i className={styles.legendMarker} style={{ background: ABILITY_CLASS_COLOR }} />
              <span className={styles.legendText}>{currentClass}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AbilityBar
