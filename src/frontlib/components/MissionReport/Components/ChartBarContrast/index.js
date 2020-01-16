import React, { useMemo } from 'react'
import { Chart, Geom, Axis, Tooltip, Guide, Legend } from "bizcharts";
import { formatMessage, defineMessages } from 'umi/locale';
import DataSet from "@antv/data-set";
import styles from './index.less';

const messages = defineMessages({
  avgScore: { id: 'app.examination.report.rankingdistribution.chartbarcontrast.avgScore', defaultMessage: '均分' },
  sumAvgScore: { id: 'app.examination.report.rankingdistribution.chartbarcontrast.sumAvgScore', defaultMessage: '总均分' },
  score: { id: 'app.examination.report.rankingdistribution.chartbarcontrast.score', defaultMessage: '分' },
});

/**
 * 考后报告 构成占比图
 * @author tina.zhang
 * @date   2019-05-13
 * @param {array} graphData - 图表数据源
 * @param {string} contrastName - contrast 显示名   showLegend barCount={dataSource} size="large"
 * @param {boolean} showLegend - 是否显示图例
 * @param {number} barCount - 柱子数量（数据条数）
 * @param {string} size - 图表尺寸(large、small)
 * @param {number} fullMark - 卷面分（用于教师报告分数构成左上角显示）
 */
function ChartBarContrast(props) {

  // #region const
  const axisLine = {
    lineWidth: 1,
    stroke: '#333333',
  }
  const tickLine = {
    lineWidth: 1,
    stroke: '#333333',
    length: 5,
  }
  const scales = {
    percent: {
      min: 0,
      formatter(val) {
        return `${(val * 1000 / 10).toFixed(2)}%`;
      }
    }
  };
  const axisLabel = {
    formatter(text) {
      const txt = text.indexOf('_') > -1 ? text.substring(text.indexOf('_') + 1) : text;
      if (txt.length >= 9) {
        return `${txt.slice(0, 8)}...`;
      }
      return txt;
    }
  }
  // #endregion

  const { graphData, contrastName, showLegend, barCount, size, fullMark } = props;

  const getDataSet = () => {
    const ds = new DataSet();
    const dv = ds
      .createView()
      .source(graphData)
      .transform({
        type: "percent",
        field: "value",
        dimension: "item",
        groupBy: ["key"],
        as: "percent"
      })
    // .transform({
    //  type:'reverse'
    // });
    return dv;
  }
  // 动态计算图表宽度
  const containerWidth = document.getElementById('divReportOverview').clientWidth - 48;
  let geomSize = 40;
  let chartStyle = {};
  let innerWidth = 0;
  if (size === 'small') {
    geomSize = 20;
    innerWidth = (containerWidth - 20) / 2;
  } else {
    innerWidth = containerWidth;
  }

  const needWidth = (barCount * (40 + 60)) + 60;

  if (needWidth > innerWidth) {
    chartStyle = {
      width: needWidth,
      margin: '0px auto'
    };
  }

  // 左上角总均分信息
  const leftTopInfo = useMemo(() => {
    if (fullMark && !Number.isNaN(fullMark)) {
      const avg = graphData.filter(v => v.item === formatMessage(messages.avgScore)).reduce((sum, b) => (sum * 1000 + b.value * 1000) / 1000, 0);
      return (
        <div className={styles.leftTopInfo}>{formatMessage(messages.sumAvgScore)}：<span className={styles.content}><span className={styles.avgScore}>{avg}</span>&nbsp;/{fullMark}</span></div>
      )
    }
    return (
      <></>
    );
  }, [fullMark]);

  return (
    <div className={styles.chartBarContrast}>
      <Chart height={300} data={getDataSet()} padding={[20, 50, showLegend === true ? 70 : 50, 40]} scale={scales} forceFit style={chartStyle}>
        {showLegend && <Legend
          clickable={false}
          itemFormatter={(val) => {
            if (val === 'contrast') {
              return contrastName;
            }
            return val;
          }}
        />}
        <Axis name="key" line={axisLine} label={axisLabel} />
        <Axis name="value" line={axisLine} tickLine={tickLine} />
        <Tooltip
          shared={false}
          containerTpl='<div class="g2-tooltip"><ul class="g2-tooltip-list"></ul></div>'
          itemTpl='<li data-index={index}>{name}：{value}</li>'
        />
        <Geom
          type="intervalStack"
          position="key*value"
          size={geomSize}
          color={["item", (item) => {
            if (item === 'contrast') {
              return '#E5E5E5'
            }
            return '#03C46B';
          }]}
          tooltip={['key*value', (key) => {
            const items = graphData.filter(v => v.key === key);
            const x = items.find(v => v.item !== 'contrast').value;
            const y = items.find(v => v.item === 'contrast').value;
            const value = `${x}/${x + y}${formatMessage(messages.score)}`;
            return {
              name: key.indexOf('_') > -1 ? key.substring(key.indexOf('_') + 1) : key,
              value
            }
          }]}
        />
        <Guide>
          {leftTopInfo}
        </Guide>
      </Chart>
    </div>
  )
}

export default ChartBarContrast
