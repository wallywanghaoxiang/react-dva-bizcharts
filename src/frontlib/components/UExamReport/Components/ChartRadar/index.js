import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chart, Geom, Axis, Coord, Legend } from 'bizcharts';
import DataSet from '@antv/data-set';
import { formatMessage, defineMessages } from 'umi/locale';
import { BizChartColors } from '@/utils/color';
import constant from '../../constant';
import styles from './index.less';

const messages = defineMessages({
  mine: { id: 'app.examination.report.chartradar.mine', defaultMessage: '我的' },
  currentClass: { id: 'app.text.uexam.report.chartradar.currentClass', defaultMessage: '班级' },
  antTooltip: { id: 'app.examination.report.chartradar.antTooltip', defaultMessage: '提示' },
  antTooltipText: {
    id: 'app.examination.report.chartradar.antTooltipText',
    defaultMessage: '点击班级查看能力详情',
  },

  fullClassName: { id: 'app.report.constant.fullclassname', defaultMessage: '本次考试' },
  fullExerciseName: { id: 'app.report.constant.fullexercisename', defaultMessage: '本次练习' },

  currentCampus: {
    id: 'app.text.examination.report.chartradar.currentCampus',
    defaultMessage: '本校',
  },
});

// const keys
const { SYS_TYPE, SYS_COLORS } = constant;

// @param {boolean} clickable - 是否开启图例点击回事件(教师报告开启，学生报告关闭)

/**
 * 统考分析报告 雷达图
 * @author tina.zhang
 * @date   2019-8-26
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 * @param {Array} fields - 数据列
 * @param {Array} graphData - 图表数据源
 * @param {function} onLegendClick - 图例点击回调事件
 */
function ChartRadar(props) {
  const { type, fields, graphData, onLegendClick } = props;

  const currentClass = formatMessage(messages.currentClass);
  const currentCampus = formatMessage(messages.currentCampus);
  const fullClassName = formatMessage(messages.fullClassName);

  // 初始化图例颜色
  const initFieldWithColor = useCallback(_fields => {
    const fieldsColors = _fields.map((item, index) => {
      const active = index === 0; // fields.length === 1 ? true : (item === fullClassName);
      let color = '';
      switch (item) {
        case fullClassName:
          color = SYS_COLORS.FULL_CLASS;
          break;
        case currentCampus:
          color = SYS_COLORS.CAMPUS;
          break;
        case currentClass:
          color = SYS_COLORS.CLASS;
          break;
        default:
          color = BizChartColors[index];
          break;
      }
      return {
        field: item,
        color,
        active,
      };
    });
    return fieldsColors;
  }, []);

  // 图表数据源
  // 存储当前field数组，切换图例项时用以更改 图形渲染层级
  const [state, setState] = useState(null);

  // DataView
  const { DataView } = DataSet;
  const getDataView = (_graphData, _fields) => {
    const dv = new DataView().source(_graphData);
    dv.transform({
      type: 'fold',
      fields: _fields,
      // 展开字段集
      key: 'name',
      // key字段
      value: 'value', // value字段
    });
    return dv;
  };

  useEffect(() => {
    const fieldsColors = initFieldWithColor(fields);
    const dataView = getDataView(graphData, fields);
    setState({
      fieldsSource: fields,
      fieldsColors,
      dv: dataView,
    });
  }, [fields, graphData]);

  // 图例点击事件
  const handleLegendClick = useCallback(
    field => {
      const newFieldsColors = state.fieldsColors.map(item => ({
        ...item,
        active: item.field === field,
      }));

      // 重置fields排序
      const newfields = fields.filter(f => f !== field);
      newfields.push(field);
      const dataView = getDataView(graphData, newfields);
      setState({
        fieldsColors: newFieldsColors,
        fieldsSource: newfields,
        dv: dataView,
      });

      // 回调事件
      if (onLegendClick && typeof onLegendClick === 'function') {
        const { color } = state.fieldsColors.find(v => v.field === field);
        onLegendClick(field, color);
      }
    },
    [onLegendClick, state]
  );

  const cols = {
    value: {
      min: 0,
      max: 1,
    },
  };

  // const padding = [type !== SYS_TYPE.UEXAM ? 20 : 40, 0, type !== SYS_TYPE.UEXAM ? 80 : 40, 0]
  // VB-8244 【线上平台】【考后报告】能力分析图，如果班级数达到10个以上时，班级选项显示不全【V1.3 未提测前Dev修改，SIT验证】
  const [containerHeight, setContainerHeight] = useState(320);
  const [chartInstance, setChartInstance] = useState(null);
  if (chartInstance) {
    chartInstance.on('afterrender', () => {
      const chartRadar = document.getElementById('chartRadar');
      if (chartRadar) {
        const g2Legend = chartRadar.getElementsByClassName('g2-legend-list');
        if (g2Legend && g2Legend.length > 0) {
          const legendHeight = g2Legend[0].clientHeight;
          if (legendHeight > 58) {
            setContainerHeight(320 + legendHeight - 58);
          }
        }
      }
    });
  }

  // 动态计算 chart padding
  const chartPadding = useMemo(() => {
    const abilityLength = graphData.length;
    const rightHeight = Math.ceil(abilityLength / 2) * 80 + 20;
    let chartHeight = 320;
    let paddingTop = 20;
    let paddingBottom = type === SYS_TYPE.UEXAM ? 40 : 80;
    if (rightHeight > 320) {
      const needPlusPadding = (rightHeight - 320) / 2;
      chartHeight = rightHeight;
      paddingTop += needPlusPadding;
      paddingBottom += needPlusPadding;
    }

    return {
      chartHeight,
      paddingTop,
      paddingBottom,
    };
  }, [graphData]);

  return (
    <div
      id="chartRadar"
      className={styles.chartRadar}
      style={{ minHeight: `${containerHeight}px` }}
    >
      {state && state.dv && state.fieldsColors && (
        <Chart
          height={chartPadding.chartHeight}
          data={state.dv}
          padding={[chartPadding.paddingTop, 0, chartPadding.paddingBottom, 0]}
          scale={cols}
          forceFit
          onGetG2Instance={g2Chart => {
            setChartInstance(g2Chart);
          }}
        >
          <Coord type="polar" radius={0.8} />
          <Axis
            name="abilityName"
            line={null}
            tickLine={null}
            grid={{
              lineStyle: {
                lineDash: null,
              },
            }}
          />
          <Axis
            name="value"
            line={null}
            label={null}
            tickLine={null}
            grid={{
              type: 'polygon',
              lineStyle: {
                lineDash: null,
              },
              alternateColor: ['#fff', '#fff'],
            }}
          />
          {/* 统考，不显示图例 */}
          {type !== SYS_TYPE.UEXAM && (
            <Legend
              marker="square"
              offset={30}
              hoverable={false}
              clickable
              custom
              items={state.fieldsColors.map(f => ({
                value: f.field,
                fill: f.color,
                marker: 'square',
              }))}
              onClick={ev => {
                handleLegendClick(ev.item.value);
              }}
              useHtml
              containerTpl={
                '<div class="g2-legend" style="position:absolute;top:20px;right:60px;width:auto;">' +
                '<h4 class="g2-legend-title"></h4>' +
                '<ul class="g2-legend-list" style="list-style-type:none;margin:0;padding:0;"></ul>' +
                '</div>'
              }
              itemTpl={(field, color, checked, index) => {
                const setting = state.fieldsColors.find(v => v.field === field);
                if (!setting) {
                  return '';
                }
                const settingColor = setting.color;
                const active = state.fieldsColors.find(v => v.active === true);
                let activeClass = '';
                if (active && field === active.field) {
                  activeClass = 'g2-legend-list-item-active';
                }
                return (
                  `<li class="g2-legend-list-item item-{index} checked ${activeClass}" data-color="{originColor}" data-value="{originValue}" style="cursor: pointer;font-size: 14px;">` +
                  `<i class="g2-legend-marker" style="width:10px;height:10px;border-radius:0px;display:inline-block;margin:1px 4px 4px 0px;background-color:${settingColor};"></i>` +
                  `<span class="g2-legend-text">{value}</span>` +
                  `</li>`
                );
              }}
              g2-legend-list-item={{
                height: '24px',
                padding: '0px 5px',
                marginRight: '5px',
                border: '1px solid transparent',
                lineHeight: '24px',
                borderRadius: '4px',
              }}
              g2-legend-marker={{
                borderRadius: '0px',
              }}
              g2-legend-text={{
                color: '#888888',
              }}
            />
          )}
          <Geom
            type="area"
            active={false}
            position="abilityName*value"
            opacity={[
              'name',
              cut => {
                // 1. [本次考试始] 不区分报告类型，均显示为 area   2. 班级报告中：[本校] 也显示为 area
                // update 2019-12-2 16:55:04
                // VB-8837 能力分析图，参考用线(本次考试、本次练习、本校)，目标用阴影
                // if (cut === fullClassName || (type === SYS_TYPE.CLASS && cut === currentCampus)) {
                //   return 0.5;
                // }
                // return 0;
                if (cut === fullClassName || cut === currentCampus) {
                  return 0;
                }
                return 0.5;
              },
            ]}
            color={[
              'name',
              cut => {
                const field = state.fieldsColors.find(v => v.field === cut);
                if (field) {
                  return field.color;
                }
                return '';
              },
            ]}
            tooltip={[
              'abilityName*value',
              (abilityName, value) => {
                return {
                  name: abilityName,
                  value,
                };
              },
            ]}
          />
          <Geom
            type="line"
            active={false}
            position="abilityName*value"
            style={{
              lineJoin: 'bevel',
              miterLimit: 1,
            }}
            size={[
              'name',
              cut => {
                // update 2019-12-2 16:55:04
                // VB-8837 能力分析图，参考用线(本次考试、本次练习、本校)，目标用阴影

                // if (cut === fullClassName) {
                //   return 1;
                // }
                // const active = stateRef.current.fieldsColors.find(v => v.active === true);
                // if (active && cut === active.field) {
                //   return 3;
                // }
                // return 2;

                const active = state.fieldsColors.find(v => v.active === true);
                if (active && cut === active.field) {
                  return 3;
                }
                if (cut === fullClassName || cut === currentCampus) {
                  return 2;
                }
                return 1;
              },
            ]}
            opacity={[
              'name',
              cut => {
                // 1. [本次考试] 不区分报告类型，均添加稍窄边框
                // 2. 校报告中：[本校] 显示为 line
                // if (cut === fullClassName || (type === SYS_TYPE.CLASS && cut === currentCampus)) {
                //   return 0.3;
                // }
                // return 1;
                if (cut === fullClassName || cut === currentCampus) {
                  return 1;
                }
                return 0.3;
              },
            ]}
            color={[
              'name',
              cut => {
                const field = state.fieldsColors.find(v => v.field === cut);
                if (field) {
                  return field.color;
                }
                return '';
              },
            ]}
            tooltip={[
              'abilityName*value',
              (abilityName, value) => {
                return {
                  name: abilityName,
                  value,
                };
              },
            ]}
          />
        </Chart>
      )}
    </div>
  );
}

export default ChartRadar;
