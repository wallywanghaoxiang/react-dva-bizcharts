import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Select } from 'antd';
import { Chart, Geom, Axis, Tooltip, Legend, Guide } from "bizcharts";
import DataSet from "@antv/data-set";
import styles from './index.less';

const { Option } = Select;

// ! 根据 level 其实范围从小到大排序
const compareByLevel = (propName) => {
  // ascend
  return (obj1, obj2) => {
    const level1Start = parseFloat(obj1[propName].replace(/([\\(\\)\\[\]\\{\\}\\^\\$\\+\-\\*\\?\\"\\'\\|\\/\\])/g, '').split(',')[0]);
    const level2Start = parseFloat(obj2[propName].replace(/([\\(\\)\\[\]\\{\\}\\^\\$\\+\-\\*\\?\\"\\'\\|\\/\\])/g, '').split(',')[0]);
    if (level1Start < level2Start) {
      return -1;
    }
    if (level1Start === level2Start) {
      return 0;
    }
    return 1;
  }
}

/**
 * 区域图（正态图）
 * filed:score
 * @param {Array} dataSource - 数据源([{level:'[0,10)',num:10,rate:20}])
//  * @param {string} activeQuestionId - 当前选中的题目ID
//  * @param {Array} questionList - 题目下拉框数据源
//  * @param {Array} onQuestionChanged - 题目下拉框筛选回调
 */
function ChartArea(props) {

  // , activeQuestionId, questionList, onQuestionChanged
  const { dataSource } = props;

  const dataView = useMemo(() => {
    const afterSort = dataSource.sort(compareByLevel('level'));
    const dv = new DataSet.View().source(afterSort);
    dv.transform({
      type: "fold",
      fields: ["num"],
      key: "type",
      value: "value"
    });
    return dv;
  }, [dataSource]);

  // TODO 计算刻度值
  const getTicks = useMemo(() => {

    // // 计算刻度间隔
    // function getTickInterval(max, precision) {
    //   const interval = max / 5;
    //   const mod = interval % precision;
    //   let tickInterval = 0;
    //   if (mod > 0) {
    //     tickInterval = (Math.ceil(interval / precision) + 1) * precision;
    //   } else {
    //     tickInterval = interval / precision * precision;
    //   }
    //   return tickInterval;
    // }

    const maxNum = Math.max.apply(Math, [...dataSource.map(v => v.num || 0)]);
    // let precision = 0;
    // if (maxNum > 10000) {
    //   precision = 1000;
    // } else if (maxNum > 5000) {
    //   precision = 500;
    // } else if (maxNum > 200) {
    //   precision = 200;
    // } else {
    //   return null;
    // }
    // const tickInterval = getTickInterval(maxNum, precision);
    const tickInterval = Math.ceil(maxNum / 5) || 1; // maxNum为0时，会导致y轴无坐标显示，默认值赋值为1，坐标轴显示为 0-5
    return [...Array(6)].map((v, idx) => {
      return tickInterval * idx;
    })
  }, [dataSource]);

  const scale = {
    value: {
      nice: true,
      ticks: (getTicks && getTicks.length > 0) ? getTicks : null
    },
    level: {
      range: [0, 1],
      formatter: (val) => {
        const rangeArr = val.replace(/([\\(\\)\\[\]\\{\\}\\^\\$\\+\-\\*\\?\\"\\'\\|\\/\\])/g, '').split(',');
        if (rangeArr[0] === rangeArr[1]) {
          return `${parseFloat(rangeArr[0])}分`;
        }
        return `${parseFloat(rangeArr[0])}-${parseFloat(rangeArr[1])}分`;
        // return `${val}`;
      }
    },
    // value:{
    //   min: 0, // 定义数值范围的最小值
    //   max: 10000, // 定义数值范围的最大值
    //   ticks: [100, 1000, 2000, 3000], // 用于指定坐标轴上刻度点的文本信息，当用户设置了 ticks 就会按照 ticks 的个数和文本来显示。
    //   tickInterval: 1, // 用于指定坐标轴各个标度点的间距，是原始数据之间的间距差值，tickCount 和 tickInterval 不可以同时声明。
    //   tickCount: 10, // 定义坐标轴刻度线的条数，默认为 5
    //   type:"linear",
    // }
  };

  const xLabel = {
    formatter: (val) => {
      // return parseFloat(val.replace(/([\\(\\)\\[\]\\{\\}\\^\\$\\+\-\\*\\?\\"\\'\\|\\/\\]分)/g, '').split('-')[1]);
      // return val.substring(val.indexOf('-') + 1).replace('分', '');
      const separatorIndex = val.indexOf('-');
      if (separatorIndex < 0) {
        return val.replace('分', '');
      }
      return val.substring(0, val.indexOf('-')).replace('分', '');
    }
  }

  // // 渲染左侧筛选框
  // const renderSelector = useCallback(() => {
  //   return (
  //     <Select
  //       className={styles.areaSelector}
  //       value={activeQuestionId}
  //       showArrow
  //       onChange={onQuestionChanged}
  //       dropdownMatchSelectWidth={false}
  //     >
  //       {questionList.map(v => {
  //         return (
  //           <Option className={styles.areaSelectorItem} key={v.questionId} value={v.questionId} disabled={!v.hasData}>
  //             {v.questionName}
  //           </Option>
  //         )
  //       })}
  //     </Select>
  //   )
  // }, [activeQuestionId, questionList]);

  // forceFit 为true时，chart 不能自适应父组件宽度
  const [chart, setChart] = useState(null);
  const [chartWidth, setChartWidth] = useState(() => {
    // 宽度计算
    const hasScroll = false;
    const flowChart = document.getElementById('report_flowchart');
    const cWidth = document.getElementById('divReportOverview').clientWidth - 50 - (!flowChart ? 0 : 152) - (hasScroll ? 20 : 0);
    return cWidth;
  });
  const handleWindowResize = useCallback((e) => {
    if (chart) {
      chart.forceFit();
    }
    // 宽度计算
    const hasScroll = false;// document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight);
    const flowChart = document.getElementById('report_flowchart');
    const cWidth = document.getElementById('divReportOverview').clientWidth - 50 - (!flowChart ? 0 : 152) - (hasScroll ? 20 : 0);
    setChartWidth(cWidth);
  }, [chart]);

  useEffect(() => {
    // if (chart) {
    //   chart.forceFit();
    // }
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [chart])

  return (
    <div className={styles.chartArea}>
      <Chart
        height={320}
        width={chartWidth}
        data={dataView}
        padding={[15, 50, 50, 50]}
        scale={scale}
        forceFit
        onGetG2Instance={(cht) => {
          setChart(cht);
        }}
      >
        <Tooltip crosshairs hideMarkers />
        <Axis name="level" label={xLabel} />
        <Legend />
        <Geom type="area" position="level*value" color="l (90) 0:rgba(3, 196, 107, 1) 1:rgba(3, 196, 107, 0)" shape="smooth" tooltip={false} />
        <Geom
          type="line"
          position="level*value"
          color="#03C46B"
          shape="smooth"
          size={2}
          tooltip={['level*value', (level) => {
            const item = dataSource.find(v => v.level === level);
            return {
              name: `${item.num}人`,
              value: `${item.rate}%`
            }
          }]}
        />
        {/* <Guide>
          <div className={styles.leftTopInfo}>
            {renderSelector()}
          </div>
        </Guide> */}
      </Chart>
    </div>
  )
}

export default ChartArea
