import React from 'react'
import { Chart, Geom, Axis, Tooltip, Legend, Guide } from "bizcharts";
import DataSet from "@antv/data-set";
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const messages = defineMessages({
  scoreRate: { id: 'app.examination.report.paperstatistics.scoreRate', defaultMessage: '得分率' },
});

/**
 * 考后报告 试卷得分率柱状图
 * @author tina.zhang
 * @date   2019-05-13
 * @param {array} graphData - 图表数据源
 * @param {array} fields - 数据列
 * @param {string} paperName - 试卷名称
 */
function PaperChartBar(props) {

  const axisLine = {
    lineWidth: 1,
    stroke: '#333333',
  }
  const label = {
    formatter(text, item, index) {
      return `${text.slice(text.indexOf('_') + 1)}`;
    }
  }
  const tickLine = {
    lineWidth: 1,
    stroke: '#333333',
    length: 5,
  }

  const scale = {
    value: {
      ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    }
  };

  const { fields, graphData, paperName } = props;

  // DataSet
  const getDataSet = () => {
    const ds = new DataSet();
    const dv = ds.createView().source(graphData);
    dv.transform({
      type: "fold",
      fields, // 展开字段集
      key: "item",  // key字段
      value: "value" // value字段
    });
    return dv;
  }

  // 动态计算图表宽度
  const flowChart = document.getElementById('report_flowchart');
  const innerWidth = document.getElementById('divReportOverview').clientWidth - 48 - (!flowChart ? 0 : 152);
  let chartStyle = {};
  const needWidth = (graphData.length * (15 + 50)) + 60;
  if (needWidth > innerWidth) {
    chartStyle = {
      width: needWidth,
      margin: '0px auto'
    };
  }

  return (
    <div className={styles.paperChartBar} style={{ width: `${innerWidth - 24}px` }}>
      <Chart height={300} data={getDataSet()} padding={[20, 20, 70, 40]} scale={scale} forceFit style={chartStyle}>
        <Legend marker="square" />
        <Axis name="questionName" line={axisLine} label={label} />
        <Axis
          name="value"
          line={axisLine}
          tickLine={tickLine}
          label={{
            formatter: val => `${val}%`
          }}
        />
        <Tooltip />
        <Geom
          type="interval"
          position="questionName*value"
          size={15}
          color={["item", (item) => {
            if (item === formatMessage(messages.scoreRate)) {
              return '#FF9900';
            }
            return '';
          }]}
          tooltip={['questionName*item*value', (questionName, item, value) => {
            const qesName = `${questionName.slice(questionName.indexOf('_') + 1)}`;
            return {
              title: qesName,
              name: item,
              value: `${value}%`
            }
          }]}
        />
        <Guide>
          <div className={styles.leftTopInfo}>
            {paperName}
          </div>
        </Guide>
      </Chart>
    </div>
  )
}

export default PaperChartBar
