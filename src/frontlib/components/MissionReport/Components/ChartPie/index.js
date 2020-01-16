import React, { useState } from 'react'
import { Chart, Geom, Axis, Tooltip, Coord, Legend } from "bizcharts";
import DataSet from "@antv/data-set";
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const messages = defineMessages({
  tooltipPerson: { id: 'app.examination.report.charpie.tooltipPerson', defaultMessage: '人' },
  lose: { id: 'app.examination.report.charpie.lose', defaultMessage: '失' },
  score: { id: 'app.examination.report.charpie.score', defaultMessage: '分' },
});

/**
 * 考后报告 饼图
 * @author tina.zhang
 * @date   2019-05-10
 * @param {array} graphData - 图表数据源
 * @param {string} tootipType - tootip显示方式（默认为分数构成、losescore:失分构成）
 */
function CharPie(props) {

  const { graphData, tootipType } = props;

  // 默认选中第三项的结果
  const handleAlwaysShowTooltip = (chartIns) => {
    // const gemos = chartIns.getAllGeoms()[0];
    // gemos.setShapeSelected(gemos.getShapes()[0], true);
  };

  // DataView
  const getDataView = () => {
    const { DataView } = DataSet;
    const dv = new DataView();
    dv.source(graphData).transform({
      type: "percent",
      field: "value",
      dimension: "item",
      as: "percent",
    });
    return dv;
  }

  // VB-8527 【v1.3】【线上平台】【听说模考】学生报告的练习/考试情况统计界面，能力分析和失分构成显示不全
  const [containerHeight, setContainerHeight] = useState(300);
  const [chartInstance, setChartInstance] = useState(null);
  if (chartInstance) {
    chartInstance.on('afterrender', () => {
      const legendHeight = document.getElementById('chartPie').getElementsByClassName('g2-legend-list')[0].clientHeight;
      if (legendHeight > 50) {
        setContainerHeight(300 + legendHeight - 50);
      }
    });
  }

  return (
    // style={{ minHeight: `${containerHeight}px` }}
    <div id="chartPie" className={styles.chartPie} style={{ overflowY: `${containerHeight !== 300 ? 'auto' : 'hidden'}` }}>
      <Chart
        width='100%'
        height={300}
        data={getDataView()}
        padding={[0, 0, 80, 0]}
        onGetG2Instance={g2Chart => {
          setChartInstance(g2Chart);
        }}
        forceFit
      >
        <Coord type="theta" radius={0.75} />
        <Axis name="value" />
        <Legend
          position="bottom"
          marker="square"
          useHtml
          // containerTpl={'<div class="g2-legend" style="position:absolute;top:20px;right:60px;width:auto;">'
          //   + '<h4 class="g2-legend-title"></h4>'
          //   + '<ul class="g2-legend-list" style="list-style-type:none;margin:0;padding:0;"></ul>'
          //   + '</div>'}
          // itemTpl={'<li class="g2-legend-list-item item-{index} {checked}" data-color="{originColor}" data-value="{originValue}" style="cursor: pointer;font-size: 14px;">'
          //   + '<i class="g2-legend-marker" style="width:10px;height:10px;display:inline-block;margin-right:10px;background-color: {color};"></i>'
          //   + '<span class="g2-legend-text">{value}</span>'
          //   + '</li>'}
          g2-legend-marker={{
            borderRadius: '0px',
            marginTop: '-3px',
          }}
          itemFormatter={(val) => {
            return val.indexOf('_') > -1 ? val.substring(val.indexOf('_') + 1) : val;
          }}
        />
        <Tooltip
          showTitle={false}
          itemTpl='<li><span class="g2-tooltip-marker" style="background-color:{color};"></span>{name}{value}</li>'
        />
        <Geom
          type="intervalStack"
          position="percent"
          color="item"
          tooltip={[
            "item*value*rate",
            (item, value, rate) => {
              let formatValue = `<br/>${value}${formatMessage(messages.tooltipPerson)}&nbsp;&nbsp;&nbsp;${rate}%`;
              if (tootipType === 'losescore') {
                formatValue = `：&nbsp;${formatMessage(messages.lose)}${value}${formatMessage(messages.score)}&nbsp;&nbsp;&nbsp;${rate}%`;
              }
              return {
                name: item.indexOf('_') > -1 ? item.substring(item.indexOf('_') + 1) : item,
                value: formatValue
              }
            }
          ]}
          style={{
            lineWidth: 1,
            stroke: "#fff"
          }}
        >
          {/* <Label
                content="percent"
                formatter={(val, i) => {
                  return i.point.questionName + "     " + val;
                }}
              /> */}
        </Geom>
      </Chart>
    </div>
  )
}

export default CharPie
