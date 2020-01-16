import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tooltip as AntTooltip, Icon } from 'antd';
import { Chart, Geom, Axis, Coord, Legend, Guide } from 'bizcharts';
import DataSet from '@antv/data-set';
import { formatMessage, defineMessages } from 'umi/locale';
import { BizChartColors } from '@/utils/color';
import constant from '../../constant';
import styles from './index.less';

const messages = defineMessages({
  mine: { id: 'app.examination.report.chartradar.mine', defaultMessage: '我的' },
  currentClass: { id: 'app.examination.report.chartradar.currentClass', defaultMessage: '本班' },
  antTooltip: { id: 'app.examination.report.chartradar.antTooltip', defaultMessage: '提示' },
  antTooltipText: {
    id: 'app.examination.report.chartradar.antTooltipText',
    defaultMessage: '点击班级查看能力详情',
  },

  fullClassName: { id: 'app.report.constant.fullclassname', defaultMessage: '本次考试' },
  fullExerciseName: { id: 'app.report.constant.fullexercisename', defaultMessage: '本次练习' },
});

// const keys
const { FULL_CLALSS_NAME, FULL_CLALSS_COLOR, FULL_EXERCISE_NAME } = constant;

const COLOR_MY_SCORE = '#03C46B';
const COLOR_TASK_COLOR = '#FF9900';
const COLOR_CLASS_COLOR = '#228EFF';

/**
 * 考后报告 雷达图
 * @author tina.zhang
 * @date   2019-05-10
 * @param {array} fields - 数据列
 * @param {array} graphData - 图表数据源
 * @param {boolean} clickable - 是否开启图例点击回事件(教师报告开启，学生报告关闭)
 * @param {function} onLegendClick - 图例点击回调事件
 */
function ChartRadar(props) {
  const { fields, graphData, clickable, onLegendClick } = props;

  const mineText = formatMessage(messages.mine);
  const currentClass = formatMessage(messages.currentClass);
  const fullClassName = formatMessage(messages.fullClassName);
  const fullExerciseName = formatMessage(messages.fullExerciseName);

  // #region const
  const cols = {
    value: {
      min: 0,
      max: 1,
    },
  };
  // #endregion

  // #region init colors
  const initFieldWithColor = useMemo(() => {
    const fieldsColors = fields.map((item, index) => {
      // 多班时本次考试默认选中，单班直接选中
      const active =
        fields.length === 1 ? true : item === fullClassName || item === fullExerciseName; // item === mineText 我的默认非活动状态，线条不加粗
      let color = '';
      switch (item) {
        case fullClassName:
        case fullExerciseName:
          if (clickable) {
            color = FULL_CLALSS_COLOR;
          } else {
            color = COLOR_TASK_COLOR;
          }
          break;
        case mineText:
          color = COLOR_MY_SCORE;
          break;
        case currentClass:
          color = COLOR_CLASS_COLOR;
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
  }, [fields]);
  // #endregion

  const [fieldsColors, setFieldsColors] = useState(() => initFieldWithColor);
  // 存储当前field数组，切换图例项时用以更改 图形渲染层级
  const [fieldsSource, setFieldsSource] = useState(() => fields);

  // DataView
  const getDataView = () => {
    const { DataView } = DataSet;
    const dv = new DataView().source(graphData);
    dv.transform({
      type: 'fold',
      fields: fieldsSource,
      // 展开字段集
      key: 'name',
      // key字段
      value: 'value', // value字段
    });
    return dv;
  };

  // 图例点击事件
  const handleLegendClick = useCallback(
    field => {
      const newFieldsColors = fieldsColors.map(item => ({
        ...item,
        active: item.field === field,
      }));
      setFieldsColors(newFieldsColors);
      // 重置fields排序
      const newfields = fields.filter(f => f !== field);
      newfields.push(field);
      setFieldsSource(newfields);
      // 回调事件
      if (onLegendClick && typeof onLegendClick === 'function') {
        const { color } = fieldsColors.find(v => v.field === field);
        onLegendClick(field, color);
      }
    },
    [fields, fieldsColors]
  );

  // VB-8244 【线上平台】【考后报告】能力分析图，如果班级数达到10个以上时，班级选项显示不全【V1.3 未提测前Dev修改，SIT验证】
  const [containerHeight, setContainerHeight] = useState(340);
  const [chartInstance, setChartInstance] = useState(null);
  if (chartInstance) {
    chartInstance.on('afterrender', () => {
      const legendHeight = document
        .getElementById('chartRadar')
        .getElementsByClassName('g2-legend-list')[0].clientHeight;
      if (legendHeight > 58) {
        setContainerHeight(340 + legendHeight - 58);
      }
    });
  }

  // 动态计算 chart padding
  const chartPadding = useMemo(() => {
    const abilityLength = graphData.length;
    const rightHeight = Math.ceil(abilityLength / 2) * 60;
    let chartHeight = 320;
    let paddingTop = 20;
    let paddingBottom = 80;
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
      <Chart
        height={chartPadding.chartHeight}
        data={getDataView()}
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
            // hideFirstLine: false
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
        {/* <Tooltip shared={false} /> */}
        <Legend
          marker="square"
          offset={30}
          hoverable={false}
          clickable={clickable === true}
          custom
          items={fieldsColors.map(f => ({ value: f.field, fill: f.color, marker: 'square' }))}
          onClick={ev => {
            if (clickable) {
              handleLegendClick(ev.item.value);
            }
          }}
          useHtml
          containerTpl={
            '<div class="g2-legend" style="position:absolute;top:20px;right:60px;width:auto;">' +
            '<h4 class="g2-legend-title"></h4>' +
            '<ul class="g2-legend-list" style="list-style-type:none;margin:0;padding:0;"></ul>' +
            '</div>'
          }
          itemTpl={(field, color, checked, index) => {
            const settingColor = fieldsColors.find(v => v.field === field).color;
            const active = fieldsColors.find(v => v.active === true);
            let activeClass = '';
            if (clickable && active && field === active.field) {
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
        <Geom
          type="area"
          active={false}
          position="abilityName*value"
          opacity={[
            'name',
            cut => {
              // update 2019-12-2 16:55:04
              // VB-8837 能力分析图，参考用线(本次考试、本次练习、本校)，目标用阴影
              // if (cut === fullClassName || cut === currentClass || cut === fullExerciseName) {
              //   return 0.5;
              // }
              // return 0;
              if (cut === fullClassName || cut === fullExerciseName) {
                return 0;
              }
              return 0.5;
            },
          ]}
          color={[
            'name',
            cut => {
              return fieldsColors.find(v => v.field === cut).color;
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
              const active = fieldsColors.find(v => v.active === true);
              if (active && cut === active.field) {
                return 3;
              }
              return 2;
            },
          ]}
          opacity={[
            'name',
            cut => {
              // update 2019-12-2 16:55:04
              // VB-8837 能力分析图，参考用线(本次考试、本次练习、本校)，目标用阴影
              // if (cut === fullClassName || cut === currentClass || cut === fullExerciseName) {
              //   return 0;
              // }
              // return 1;
              if (cut === fullClassName || cut === fullExerciseName) {
                return 1;
              }
              return 0;
            },
          ]}
          color={[
            'name',
            cut => {
              return fieldsColors.find(v => v.field === cut).color;
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
        {clickable && (
          <Guide>
            <div className={styles.leftTopInfo}>
              <AntTooltip title={formatMessage(messages.antTooltipText)}>
                {/* <div className={styles.iconbox}><i className="iconfont icon-info" /></div> */}
                <i className="iconfont icon-info" />
                <span className={styles.ttext}>{formatMessage(messages.antTooltip)}</span>
              </AntTooltip>
            </div>
          </Guide>
        )}
      </Chart>
    </div>
  );
}

export default ChartRadar;
