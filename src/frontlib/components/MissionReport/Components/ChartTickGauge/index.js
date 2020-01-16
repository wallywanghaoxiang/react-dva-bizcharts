import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Chart, Axis, Coord, Geom, Guide, View } from 'bizcharts';
import { formatMessage, defineMessages } from 'umi/locale';
import classnames from 'classnames';
import styles from './index.less';

const { Text } = Guide;

const messages = defineMessages({
  myScoreText: { id: 'app.examination.report.charttickgauge.myScoreText', defaultMessage: '我的得分' },
  currentExerciseAvgScore: { id: 'app.examination.report.charttickgauge.currentExerciseAvgScore', defaultMessage: '本次练习平均分' },
  currentExamAvgScore: { id: 'app.examination.report.charttickgauge.currentExamAvgScore', defaultMessage: '本次考试平均分' },
  currentExerciseMaxScore: { id: 'app.examination.report.charttickgauge.currentExerciseMaxScore', defaultMessage: '本次练习最高分' },
  currentExamMaxScore: { id: 'app.examination.report.charttickgauge.currentExamMaxScore', defaultMessage: '本次考试最高分' },
  classAvgText: { id: 'app.examination.report.charttickgauge.classAvgText', defaultMessage: '本班平均分' },
  classMaxText: { id: 'app.examination.report.charttickgauge.classMaxText', defaultMessage: '本班最高分' },
});

const MY_SCORE_COLOR = '#03C46B';
const TASK_AVG_COLOR = '#FF6E4A';
const TASK_MAX_COLOR = '#228EFF';
const CLASS_AVG_COLOR = '#FFB400';
const CLASS_MAX_COLOR = '#7D5CD5';
const DEFAULT_TICKS = 51;
const LEGEND_KEYS = {
  MY: 'my',
  TASKAVG: 'taskAvg',
  TASKMAX: 'taskMax',
  CLASSAVG: 'classAvg',
  CLASSMAX: 'classMax',
}
/**
 * 考后报告 - 仪表盘
 * @author tina.zhang
 * @date   2019-05-15
 * @param {object} graphData - 数据源({fullMark,myScore,taskAvgScore,taskMaxScore,classAvgScore,classMaxScore})
 * @param {number} classCount - 班级数量
 * @summary 调整表现方式：通过点击图例进行表盘的切换我的得分/本班最高分/本班平均分/本次最高分/本次平均分。点击方式与整个报告端一致。本次需切换时表盘有动态变化
 */
function ChartTickGauge(props) {

  // #region 获取仪表刻度
  const getTickSettings = (fullMark) => {
    const interval = fullMark > 50 ? 11 : 6;
    return {
      type: {
        tickCount: 4,
        // tickInterval:interval,
        // min: 0,
        // max: fullMark,
        // nice: true,
      }
    }
  }
  const cols = {
    type: {
      range: [0, 1],
    },
    value: {
      sync: true,
    },
  };
  // #endregion

  const { graphData, classCount, isExerciseReport } = props;
  const niceFullMark = Math.ceil(graphData.fullMark / 5) * 5;

  const myScoreText = formatMessage(messages.myScoreText);
  const taskAvgText = isExerciseReport ? formatMessage(messages.currentExerciseAvgScore) : formatMessage(messages.currentExamAvgScore);
  const taskMaxText = isExerciseReport ? formatMessage(messages.currentExerciseMaxScore) : formatMessage(messages.currentExamMaxScore);
  const classAvgText = formatMessage(messages.classAvgText);
  const classMaxText = formatMessage(messages.classMaxText);

  // 当前活动的图例项
  const [activeLegendKey, setActiveLegendKey] = useState(LEGEND_KEYS.MY);

  // 初始化数据源
  const initChartData = useMemo(() => {

    // 得分占比换算为刻度占比
    const score = parseInt((graphData[`${activeLegendKey}Score`] / niceFullMark) * DEFAULT_TICKS);

    const fullData = [];
    const blockData = [];
    const showData = [];
    [...Array(DEFAULT_TICKS)].forEach((v, i) => {
      blockData.push({ type: `${i}`, value: 15 });
      fullData.push({ type: `${i}`, value: 10 });
      if (i === 0 && score === 0) {
        showData.push({ type: `${i}`, value: 15 });
      } if (i + 1 < score) {
        showData.push({ type: `${i}`, value: 10 });
      } else if (i + 1 === score) {
        showData.push({ type: `${i}`, value: 15 });
      } else {
        showData.push({ type: `${i}`, value: 0 });
      }
    });
    let showText;
    let showColor;
    switch (activeLegendKey) {
      case 'my':
        showText = myScoreText;
        showColor = MY_SCORE_COLOR;
        break;
      case 'taskAvg':
        showText = taskAvgText;
        showColor = TASK_AVG_COLOR;
        break;
      case 'taskMax':
        showText = taskMaxText;
        showColor = TASK_MAX_COLOR;
        break;
      case 'classAvg':
        showText = classAvgText;
        showColor = CLASS_AVG_COLOR;
        break;
      case 'classMax':
        showText = classMaxText;
        showColor = CLASS_MAX_COLOR;
        break;
      default:
        showText = '';
        showColor = MY_SCORE_COLOR;
        break;
    }
    return {
      fullData,
      blockData,
      showData,
      showScore: graphData[`${activeLegendKey}Score`],
      showText,
      showColor
    }
  }, [activeLegendKey]);

  const { fullData, blockData, showData, showScore, showText, showColor } = initChartData;

  // 渲染得分图形数据源
  const [showDataState, setShowDataState] = useState(() => {
    return showData.map(v => ({
      ...v,
      value: 0
    }));
  });

  // 切换图例项时，更新数据源，setInterval实现动画效果
  useEffect(() => {
    const newData = showDataState;
    let index = 0;
    const interval = setInterval(() => {
      if (index === showData.length || showData[index].value === 15) {
        window.clearInterval(interval);
      }
      newData[index].value = showData[index].value;
      setShowDataState([...newData]);
      index += 1;
    }, 50);
    return () => {
      window.clearInterval(interval);
    }
  }, [showData]);

  // 图例项点击事件
  const activeKeyRef = useRef();
  activeKeyRef.current = activeLegendKey;
  const handleLegengdClick = useCallback((key) => {
    if (activeKeyRef.current === key) {
      return;
    }
    setShowDataState(() => {
      return showData.map(v => ({
        ...v,
        value: 0
      }));
    });
    setActiveLegendKey(key);
  }, []);

  return (
    <div className={styles.chartTickGauge}>
      {fullData && fullData.length > 0 &&
        <div className={styles.chartContaniner}>
          <Chart
            height={160}
            width={300}
            data={[{ t: '1' }]}
            scale={cols}
            padding={[10, 0, 5, 0]}
            forceFit
          >
            <View data={fullData}>
              <Coord type="polar" startAngle={-8 / 8 * Math.PI} endAngle={0 / 8 * Math.PI} radius={1} innerRadius={0.8} />
              <Geom type="interval" position="type*value" color="#E5E5E5" size={4} />
            </View>
            <View data={fullData} scale={getTickSettings(niceFullMark)}>
              <Coord type="polar" startAngle={-8 / 8 * Math.PI} endAngle={0 / 8 * Math.PI} radius={0.8} innerRadius={0.95} />
              <Geom type="interval" position="type*value" color="#E5E5E5" size={4} />
              <Axis
                name="type"
                grid={null}
                line={null}
                tickLine={null}
                label={{
                  offset: -8,
                  textStyle: {
                    fontSize: 13,
                    fill: '#CBCBCB',
                    textAlign: 'center',
                  },
                  formatter: (val) => {
                    // TODO 刻度总量(DEFAULT_TICKS)、显示刻度数量(tickCount)不同，需要针对性的修改
                    // 刻度值->满分分数转换
                    // const calVal = parseFloat(val / DEFAULT_TICKS * niceFullMark);
                    let markRate = 0;
                    const tickRate = parseFloat(val) / (DEFAULT_TICKS - 1);
                    if (tickRate >= 0.4 && tickRate <= 0.6) {
                      markRate = 0.5;
                    } else if (tickRate >= 0.9 && tickRate <= 1.1) {
                      markRate = 1;
                    } else {
                      return 0;
                    }
                    return niceFullMark * markRate;
                  },
                }}
              />
              <Axis name="value" visible={false} />
            </View>
            <View data={blockData}>
              <Coord type="polar" startAngle={-8 / 8 * Math.PI} endAngle={0 / 8 * Math.PI} radius={1} innerRadius={0.8} />
              <Geom type="interval" position="type*value" color="transparent" size={4} />
            </View>
            {showDataState &&
              <View data={showDataState}>
                <Coord type="polar" startAngle={-8 / 8 * Math.PI} endAngle={0 / 8 * Math.PI} radius={1} innerRadius={0.8} />
                <Geom
                  type="interval"
                  position="type*value"
                  color={showColor}
                  opacity={1}
                  size={4}
                />
                <Guide>
                  <Text
                    position={['50%', '75%']}
                    content={`${showScore}`}
                    style={{
                      fill: showColor,
                      fontSize: 48,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      textBaseline: 'middle',
                    }}
                  />
                  <Text
                    position={['50%', '95%']}
                    content={showText}
                    style={{
                      fill: '#888888',
                      fontSize: 14,
                      textAlign: 'center',
                      textBaseline: 'middle',
                    }}
                  />
                </Guide>
              </View>
            }
          </Chart>
        </div>
      }
      {fullData && fullData.length > 0 &&
        <div className={styles.legend}>
          <ul className={styles.legendList}>
            <li className={classnames(styles.legendListItem, activeLegendKey === LEGEND_KEYS.MY ? styles.active : null)} onClick={() => handleLegengdClick(LEGEND_KEYS.MY)}>
              <i className={styles.legendMarker} style={{ background: MY_SCORE_COLOR }} />
              <span className={styles.legendText}>{myScoreText}</span>
            </li>
            {classCount > 1 &&
              <li className={classnames(styles.legendListItem, activeLegendKey === LEGEND_KEYS.TASKAVG ? styles.active : null)} onClick={() => handleLegengdClick(LEGEND_KEYS.TASKAVG)}>
                <i className={styles.legendMarker} style={{ background: TASK_AVG_COLOR }} />
                <span className={styles.legendText}>{taskAvgText}</span>
              </li>
            }
            {classCount > 1 &&
              <li className={classnames(styles.legendListItem, activeLegendKey === LEGEND_KEYS.TASKMAX ? styles.active : null)} onClick={() => handleLegengdClick(LEGEND_KEYS.TASKMAX)}>
                <i className={styles.legendMarker} style={{ background: TASK_MAX_COLOR }} />
                <span className={styles.legendText}>{taskMaxText}</span>
              </li>
            }
            <li className={classnames(styles.legendListItem, activeLegendKey === LEGEND_KEYS.CLASSAVG ? styles.active : null)} onClick={() => handleLegengdClick(LEGEND_KEYS.CLASSAVG)}>
              <i className={styles.legendMarker} style={{ background: CLASS_AVG_COLOR }} />
              <span className={styles.legendText}>{classAvgText}</span>
            </li>
            <li className={classnames(styles.legendListItem, activeLegendKey === LEGEND_KEYS.CLASSMAX ? styles.active : null)} onClick={() => handleLegengdClick(LEGEND_KEYS.CLASSMAX)}>
              <i className={styles.legendMarker} style={{ background: CLASS_MAX_COLOR }} />
              <span className={styles.legendText}>{classMaxText}</span>
            </li>
          </ul>
        </div>
      }
    </div>
  )
}

export default ChartTickGauge
