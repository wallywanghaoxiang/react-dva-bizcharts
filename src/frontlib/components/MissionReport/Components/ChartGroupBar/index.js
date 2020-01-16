import React, { useState, useMemo } from 'react';
import { Chart, Geom, Axis, Tooltip, Legend } from "bizcharts";
import DataSet from "@antv/data-set";
import { BizChartColors } from '@/utils/color';
import styles from './index.less';

// #region getEnWord a-z
const getWordsAToZ = () => {
  const arr = [];
  for (let i = 97; i < 122; i++) {
    arr.push(String.fromCharCode(i));
  }
  return arr;
}
// #endregion

/**
 * 考后报告 柱状图
 * @author tina.zhang
 * @date   2019-05-08
 * @param {array} graphData - 图表数据源
 * @param {array} fields - 数据列
 */
function ChartGroupBar(props) {

  const { fields, graphData } = props;

  // #region 可配置样式
  const label = {
    formatter(text, item, index) {
      if (text.length > 8) {
        return `${text.slice(0, 8)}...`;
      }
      return `${text}`;
    }
  }
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
      ticks: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
    }
  };
  // #endregion

  // #region formatFields
  // 配置能力项颜色
  const initFieldsColors = useMemo(() => {
    const fieldsColors = fields.map((item, index) => {
      return {
        field: item,
        color: BizChartColors[index],
      }
    });
    return fieldsColors;
  }, fields);
  // 添加灰色柱 field
  const formatFields = useMemo(() => {
    const newSource = [];
    fields.forEach(item => {
      newSource.push(`${item}_full`);
      newSource.push(item);
    });
    return newSource;
  }, fields);
  // #endregion

  // 状态保存
  const [state] = useState(() => ({
    dataSource: graphData,
    fieldsColors: initFieldsColors
  }));

  // 构建分组名称(a-z)
  const randomTypes = useMemo(() => { return getWordsAToZ(); }, []);
  // DataSet
  const getDataSet = () => {
    const ds = new DataSet();
    const dv = ds.createView().source(state.dataSource);
    dv.transform({
      type: "fold",
      fields: formatFields, // 展开字段集
      key: "abilityName", // key字段
      value: "value",    // value字段
      retains: ["className"]
    }).transform({
      type: "map",
      callback: obj => {
        let key = obj.abilityName;
        // let fullKey;
        if (key.indexOf('_full') > 0) {
          // fullKey = key;
          key = key.replace('_full', '');
        }
        // else {
        //   fullKey = `${key}_full`;
        // }
        const fieldIndex = fields.indexOf(key);
        const type = randomTypes[fieldIndex];
        obj.type = type;
        return obj;
      }
    })
    // .transform({
    //   type: 'reverse',
    // });
    return dv;
  }

  // 需要宽度：(能力项数量*20 + 间隔85)*班级数量 + 图表paddingLeft + 图表paddingRight
  const containerWidth = document.getElementById('divReportOverview').clientWidth - 48;
  let chartStyle = {};
  const needWidth = ((fields.length * 20 + 85) * state.dataSource.length) + 60;
  let innerWidth = 0;
  innerWidth = containerWidth;
  if (needWidth > innerWidth) {
    chartStyle = {
      width: needWidth,
      margin: '0px auto'
    };
  }

  return (
    <div className={styles.chartGroupbar}>
      <Chart height={300} data={getDataSet()} padding={[20, 20, 80, 40]} scale={scale} forceFit style={chartStyle}>
        <Axis name="className" line={tickLine} label={label} />
        <Axis name="value" line={axisLine} tickLine={tickLine} />
        <Legend
          clickable={false} // TODO 点击事件需要处理灰色柱状数据，临时禁止点击（如必须可通过排除该图例的“filed_full”数据实现）
          useHtml
          containerTpl={'<div class="g2-legend" style="position:absolute;top:20px;right:60px;width:auto;">'
            + '<h4 class="g2-legend-title"></h4>'
            + '<ul class="g2-legend-list" style="list-style-type:none;margin:0;padding:0;"></ul>'
            + '</div>'}
          itemTpl={(field, color, checked, index) => {
            // const settingColor = fieldsColors.find(v => v.field === field).color;
            let activeClass = '';
            if (field.indexOf('_full') >= 0) {
              activeClass = 'g2-legend-list-item-hidden';
            }
            return `<li class="g2-legend-list-item item-{index} checked ${activeClass}" data-color="{originColor}" data-value="{originValue}" style="cursor: pointer;font-size: 14px;">`
              + `<i class="g2-legend-marker" style="width:10px;height:10px;border-radius:50px;display:inline-block;margin:1px 4px 4px 0px;background-color:${color};"></i>`
              + `<span class="g2-legend-text">{value}</span>`
              + `</li>`;
          }}
        />
        <Tooltip
          showTitle={false}
          crosshairs={{
            type: 'x',
            style: {
              stroke: '#03C46B',
              lineWidth: 1
            }
          }}
          useHtml
          htmlContent={(title, items) => {
            const tipItems = items.map((it, index) => {
              if (it.name.indexOf('_full') >= 0) {
                return '';
              }
              const tipItem = `<li class="g2-tooltip-item" data-index=${index}><span class="g2-tooltip-marker" style="background-color:${it.color};"></span>${it.name}&nbsp;&nbsp;&nbsp;&nbsp;<span class="g2-tooltip-value">${it.value}</span></li>`;
              return tipItem;
            });
            const tip = `<div class="g2-tooltip"><div class="g2-tooltip-title" style="margin-bottom: 4px;"></div><ul class="g2-tooltip-list">
                    ${tipItems.join('')}
                  </ul></div>`
            return tip;
          }}
        />
        <Geom
          type="interval"
          size={20}
          position="className*value"
          color={['abilityName', (abilityName) => {
            if (abilityName.indexOf('_full') > 0) {
              return '#E5E5E5';
            }
            const { color } = state.fieldsColors.find(v => v.field === abilityName);
            return color;
          }]}
          adjust={[
            {
              type: "dodge",
              dodgeBy: "type",
              // 按照 type 字段进行分组
              marginRatio: 0 // 分组中各个柱子之间不留空隙
            },
            {
              type: "stack"
            }
          ]}
        />
      </Chart>
    </div>
  )
}


export default ChartGroupBar
