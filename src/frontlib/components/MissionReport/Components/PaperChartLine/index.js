import React, { useMemo } from 'react'
import { Chart, Geom, Axis, Tooltip, Legend, Guide } from "bizcharts";
// import DataSet from "@antv/data-set";
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const messages = defineMessages({
  difficulty: { id: 'app.examination.report.paperstatistics.difficulty', defaultMessage: '难度' },
  discrimination: { id: 'app.examination.report.paperstatistics.discrimination', defaultMessage: '区分度' }
});

/**
 * 考后报告 试卷难度区分度折线图
 * @author tina.zhang
 * @date   2019-05-13
 * @param {array} graphData - 图表数据源
 * @param {array} fields - 数据列
 * @param {string} paperName - 试卷名称
 */
function PaperChartLine(props) {

  const { fields, graphData, paperName } = props;

  const discriminationText = formatMessage(messages.discrimination);
  const difficultyText = formatMessage(messages.difficulty);

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
  const scale = useMemo(() => {
    const normalTicks = [0, 0.2, 0.4, 0.6, 0.8, 1];
    const minusTicks = [-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1];
    // 如果存在小于零的值，则 ticks 增加负值0~-1刻度 否则仅显示 0~1
    const hasMinus = graphData.some(v => v[discriminationText] < 0 || v[difficultyText] < 0);
    if (hasMinus) {
      return {
        [discriminationText]: {
          ticks: minusTicks
        },
        [difficultyText]: {
          ticks: minusTicks
        },
      }
    }
    return {
      [discriminationText]: {
        ticks: normalTicks
      },
      [difficultyText]: {
        ticks: normalTicks
      },
    };
  }, [graphData]);

  // DataSet
  // const getDataSet = () => {
  //   const ds = new DataSet();
  //   const dv = ds.createView().source(graphData);
  //   dv.transform({
  //     type: "fold",
  //     fields, // 展开字段集
  //     key: "item",  // key字段
  //     value: "value" // value字段
  //   });
  //   return dv;
  // }

  // 动态计算图表宽度
  const innerWidth = document.getElementById('divReportOverview').clientWidth - 48;
  let chartStyle = {};
  const needWidth = (graphData.length * (50)) + 60;
  if (needWidth > innerWidth) {
    chartStyle = {
      width: needWidth,
      margin: '0px auto'
    };
  }

  return (
    <div className={styles.paperChartLine}>
      <Chart height={300} data={graphData} padding={[20, 50, 70, 40]} scale={scale} forceFit style={chartStyle}>
        <Legend marker="square" />
        <Axis name="questionName" line={axisLine} label={label} />
        <Axis name={discriminationText} line={axisLine} tickLine={tickLine} />
        <Axis name={difficultyText} line={axisLine} tickLine={tickLine} visible={false} />
        <Tooltip
          crosshairs={{
            type: "y",
            style: {
              stroke: '#B2B2B2',
              lineWidth: 2
            }
          }}
        />
        <Geom
          type="interval"
          position={`questionName*${discriminationText}`}
          size={15}
          color='#228EFF'
          tooltip={[`questionName*${discriminationText}`, (questionName, value) => {
            const qesName = `${questionName.slice(questionName.indexOf('_') + 1)}`;
            return {
              title: qesName,
              name: discriminationText,
              value
            }
          }]}
        />
        <Geom
          type="line"
          position={`questionName*${difficultyText}`}
          size={3}
          color='#FFB400'
          tooltip={[`questionName*${difficultyText}`, (questionName, value) => {
            const qesName = `${questionName.slice(questionName.indexOf('_') + 1)}`;
            return {
              title: qesName,
              name: difficultyText,
              value
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

export default PaperChartLine
