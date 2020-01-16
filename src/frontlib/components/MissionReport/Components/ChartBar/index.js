/* eslint-disable no-underscore-dangle */
import React, { useState, useCallback, useRef } from 'react';
import { Button } from 'antd';
import { Chart, Geom, Axis, Tooltip, Label, Legend, Guide } from "bizcharts";
import { formatMessage, defineMessages } from 'umi/locale';
import DataSet from "@antv/data-set";
import styles from './index.less';

const messages = defineMessages({
  tooltipPerson: { id: 'app.examination.report.chartbar.tooltipPerson', defaultMessage: '人' },
  resetBtnText: { id: 'app.examination.report.chartbar.resetBtnText', defaultMessage: '重置' },
});

/**
 * 考后报告 柱状图
 * @author tina.zhang
 * @date   2019-05-08
 * @param {array} graphData - 图表数据源
 * @param {array} fields - 数据列
 * @param {string} size - 图表尺寸(large、small)
 */
function ChartBar(props) {

  // 国际化
  const tooltipPersonText = formatMessage(messages.tooltipPerson);

  // TODO 浮点数失精问题，对图表所需数据进行放大100处理，注意需要显示该数据的位置做还原处理
  const floatRate = 100;

  // #region 可配置样式
  const axisLine = {
    lineWidth: 1,
    stroke: '#333333',
  }
  const tickLine = {
    lineWidth: 1,
    stroke: '#333333',
    length: 5,
  }
  const scale = {
    value: {
      // 放大y轴刻度，规避浮点数失精问题
      // ticks:  [0, 10 , 20 , 30 , 40 , 50 , 60 , 70 , 80 , 90 , 100 ]
      ticks: [...Array(11)].map((v, i) => i * 10 * floatRate)

    }
  };
  const label = {
    X: {
      offset: 12,
      formatter(text, item, index) {
        if (text.length > 8) {
          return `${text.slice(0, 8)}...`;
        }
        return `${text}`;
      }
    },
    Y: {
      formatter(text, item, index) {
        // 还原y轴刻度
        return `${parseInt(text) / floatRate}%`;

      }
    }
  }
  const geomLabelStyle = {
    lineStyle: {
      lineWidth: 1,
      stroke: '#ff8800',
      lineDash: [2, 2]
    },
    textStyle: {
      fill: '#333333',
      fontSize: '12px',
      fontWeight: '400',
    }
  }
  // #endregion

  const { fields, graphData, size } = props;

  // 状态保存
  const [state, setState] = useState({
    dataSource: graphData, // 图表数据源
    activeLegend: null,     // 默认选中图例项
    activeShape: null       // 保存当前活动的shape
  });

  // 图例点击事件
  const handleLegendClick = useCallback((field) => {
    let ds = [];
    if (field) {
      ds = graphData.map(item => ({
        classId: item.classId,
        className: item.className,
        [field]: item[field],
        [`${field}_count`]: item[`${field}_count`],
      }));
    } else {
      ds = graphData;
    }
    setState({
      ...state,
      dataSource: ds, // 图表数据源
      activeLegend: field     // 默认选中图例项
    });
  }, []);

  // DataSet
  const getDataSet = () => {
    const ds = new DataSet();
    const dv = ds.createView().source(state.dataSource);
    dv.transform({
      type: "fold",
      fields, // 展开字段集
      key: "range", // key字段
      value: "value",    // value字段
    }).transform({ // 放大 value，规避浮点数失精问题
      type: 'map',
      callback(row) {
        row.value *= floatRate
        return row;
      }
    });
    return dv;
  }

  // 动态计算图表宽度
  const containerWidth = document.getElementById('divReportOverview').clientWidth - 48;
  let chartStyle = {};
  const needWidth = (state.dataSource.length * (40 + 70)) + 60;
  let innerWidth = 0;
  if (size === 'small') {
    innerWidth = (containerWidth - 20) / 2;
  } else {
    innerWidth = containerWidth;
  }
  if (needWidth > innerWidth) {
    chartStyle = {
      width: needWidth,
      margin: '0px auto'
    };
  }

  let chartPaddingTop = 50;
  const legendWidth = Object.keys(state.dataSource[0]).filter(v => ["classId", "className"].indexOf(v) === -1 && v.indexOf('_count') === -1).length * 110;
  if (legendWidth > innerWidth) {
    chartPaddingTop += (Math.ceil(legendWidth/innerWidth)*20);
  }

  // useRef 缓存最新数据源，否则 onPlotMove 回调中取不到最新的state.dataSource
  const stateRef = useRef();
  stateRef.current = state;
  const handlePlotMove = useCallback((ev) => {
    if (ev.shape && ev.shape.name === 'interval') {
      if (!ev.shape._cfg.destroyed && (!state.activeShape || ev.shape._id !== state.activeShape.shapeId)) {
        setState({
          ...stateRef.current,
          activeShape: {
            shapeId: ev.shape._id,
            origin: ev.shape._cfg.origin._origin
          }
        })
      }
    }
    else if (state.activeShape) {
      setState({
        ...stateRef.current,
        activeShape: null
      })
    }
  }, [state.activeShape]);

  return (
    <div className={styles.chartbar}>
      <Chart
        height={300}
        data={getDataSet()}
        padding={[chartPaddingTop, 20, 50, 40]}
        scale={scale}
        forceFit
        style={chartStyle}
        onPlotMove={handlePlotMove}
      // onPlotEnter={ev => {
      //   if (state.activeShape) {
      //     setState({
      //       ...state,
      //       activeShape: null
      //     })
      //   }
      // }}
      >
        <Legend
          position="top-left"
          selectedMode='single'
          offsetY={-10}
          marker="square"
          useHtml
          onClick={(ev) => {
            //   // console.log('ev', ev)
            handleLegendClick(ev.item.value);
          }}
          containerTpl={'<div class="g2-legend" style="position:absolute;top:20px;right:60px;width:auto;">'
            + '<h4 class="g2-legend-title"></h4>'
            + '<ul class="g2-legend-list" style="list-style-type:none;margin:0;padding:0;"></ul>'
            + '</div>'}
          itemTpl={(range, color, checked, index) => {
            const activeClass = state.activeLegend === range ? 'g2-legend-list-item-active' : '';
            return `<li class="g2-legend-list-item item-{index} {checked} ${activeClass}" data-color="{originColor}" data-value="{originValue}" style="cursor: pointer;font-size: 14px;">`
              + `<i class="g2-legend-marker" style="width:10px;height:10px;display:inline-block;margin-right:10px;background-color: {color};"></i>`
              + `<span class="g2-legend-text">{value}</span>`
              + `</li>`;
          }}
          g2-legend={{
            maxWidth: 'auto',
            right: 'auto',
            top: '14.5px',
            borderRadius: '15px',
            lineHeight: '28px',
          }}
          g2-legend-list-item={{
            background: '#fff',
            border: '1px solid #E5E5E5',
            margin: '0',
            padding: '0 10px',
            height: '28px'
          }}
          g2-legend-marker={{
            verticalAlign: 'inherit',
            borderRadius: '0px'
          }}
          g2-legend-text={{
            color: '#888888',
            fontSize: '12px'
          }}
        />
        <Axis name="className" line={axisLine} label={label.X} />
        <Axis name="value" line={axisLine} tickLine={tickLine} label={label.Y} />
        <Tooltip
          shared={false}
          containerTpl='<div class="g2-tooltip"><div class="g2-tooltip-title" style="margin-bottom: 4px;"></div><ul class="g2-tooltip-list"></ul></div>'
          itemTpl='<li data-index={index}><span style="background-color:{color};width:8px;height:8px;border-radius:0;display:inline-block;margin-right:8px;"></span>{name}&nbsp;&nbsp;&nbsp;&nbsp;{value}</li>'
        />
        <Geom
          type="intervalStack"
          position="className*value"
          color="range"
          size={['range*className', (range, className) => {
            const { activeShape } = state;
            if (activeShape && range === activeShape.origin.range && className === activeShape.origin.className) {
              return 46;
            }
            return 40;
          }]}
          tooltip={
            ['range*value*className', (range, value, className) => {
              let theCount = 0;
              const origindata = state.dataSource.find(t => t.className === className)
              if (origindata) {
                theCount = origindata[`${range}_count`];
              }
              return {
                name: range,
                // 还原value
                value: `${theCount}${tooltipPersonText}&nbsp;&nbsp;&nbsp;&nbsp;${value / floatRate}%`

              }
            }]}
        >
          {state.activeLegend &&
            <Label
              offset={6}
              textStyle={geomLabelStyle.textStyle}
              content={['range*value*className', (range, value, className) => {
                let theCount = 0;
                const origindata = state.dataSource.find(t => t.className === className)
                if (origindata) {
                  theCount = origindata[`${range}_count`];
                }
                if (!theCount) {
                  return null;
                }
                // 还原value
                return `${value / floatRate}% ${theCount}${tooltipPersonText}`;

              }]}
            />}
        </Geom>
        <Guide>
          {state.activeLegend && <Button className={styles.btnReset} shape="round" onClick={() => handleLegendClick()}>{formatMessage(messages.resetBtnText)}</Button>}
        </Guide>
      </Chart>
    </div>
  )
}

export default ChartBar
