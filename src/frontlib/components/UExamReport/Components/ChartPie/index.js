import React, { useCallback } from 'react';
import { Select } from 'antd';
import { Chart, Geom, Axis, Tooltip, Coord, Legend, Guide } from "bizcharts";
import DataSet from "@antv/data-set";
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const { Option } = Select;

const messages = defineMessages({
  tooltipPerson: { id: 'app.examination.report.charpie.tooltipPerson', defaultMessage: '人' },
  // lose: { id: 'app.examination.report.charpie.lose', defaultMessage: '失' },
  // score: { id: 'app.examination.report.charpie.score', defaultMessage: '分' },
});

/**
 * 饼图
 * @author tina.zhang
 * @date   2019-8-27
 * @param {array} graphData - 图表数据源
 * @param {string} activeClassId - 当前选中的班级ID
 * @param {Array} classList - 班级下拉框数据源
 * @param {Array} onClassChanged - 班级下拉框筛选回调
 * @param {string} activeQuestionId - 当前选中的题目ID
 * @param {Array} questionList - 题目下拉框数据源
 * @param {Array} onQuestionChanged - 题目下拉框筛选回调
 */
function CharPie(props) {

  const { graphData, activeClassId, classList, onClassChanged, activeQuestionId, questionList, onQuestionChanged } = props;

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

  // 渲染左侧筛选框
  const renderSelector = useCallback(() => {
    return (
      <>
        {classList && classList.length > 1 &&
          <Select
            className={styles.areaSelector}
            value={activeClassId}
            showArrow
            onChange={onClassChanged}
            dropdownMatchSelectWidth={false}
          >
            {classList.map(v => {
              return (
                <Option className={styles.areaSelectorItem} key={v.classId} value={v.classId}>
                  <span title={v.className}>{v.className}</span>
                </Option>
              )
            })}
          </Select>
        }
        <Select
          className={styles.areaSelector}
          value={activeQuestionId}
          showArrow
          onChange={onQuestionChanged}
          dropdownMatchSelectWidth={false}
        >
          {questionList.map(v => {
            return (
              <Option className={styles.areaSelectorItem} key={v.questionId} value={v.questionId}>
                {v.questionName}
              </Option>
            )
          })}
        </Select>
      </>
    )
  }, [activeQuestionId, questionList]);

  return (
    <div className={styles.chartPie}>
      <Chart
        height={300}
        data={getDataView()}
        padding={[0, 0, 80, 0]}
        forceFit
      >
        <Coord type="theta" radius={0.75} />
        <Axis name="value" />
        <Legend
          position="bottom"
          marker="square"
          itemFormatter={(val) => {
            return val;
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
              const formatValue = `<br/>${value}${formatMessage(messages.tooltipPerson)}&nbsp;&nbsp;&nbsp;${rate}%`;
              return {
                name: item,
                value: formatValue
              }
            }
          ]}
          style={{
            lineWidth: 1,
            stroke: "#fff"
          }}
        >
          <Guide>
            <div className={styles.leftTopInfo}>
              {renderSelector()}
            </div>
          </Guide>
        </Geom>
      </Chart>
    </div>
  )
}

export default CharPie
