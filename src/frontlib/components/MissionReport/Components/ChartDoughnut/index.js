import React from 'react'
import { Chart, Geom, Axis, Tooltip, Coord, Legend } from "bizcharts";
import DataSet from "@antv/data-set";
import styles from './index.less';

/**
 * 考后报告 环形图
 * @author tina.zhang
 * @date   2019-05-10
 * @param {array} graphData - 图表数据源
 */
function ChartDoughnut(props) {

  const { graphData } = props;

  // // 状态保存
  // const [dataSource, setDataSource] = useState(graphData);

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

  return (
    <div className={styles.chartDoughnut}>
      <Chart
        height={300}
        data={getDataView()}
        padding={[0, 0, 60, 0]}
        onGetG2Instance={handleAlwaysShowTooltip}
        forceFit
      >
        <Coord type="theta" radius={0.75} innerRadius={0.8} />
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
          itemTpl='<li><span class="g2-tooltip-marker" style="background-color:{color};"></span>{name} <br/>{value}</li>'
        />
        <Geom
          type="intervalStack"
          position="percent"
          color="item"
          tooltip={[
            "item*value*rate",
            (item, value, rate) => {
              return {
                name: item,
                value: `${value}人&nbsp;&nbsp;&nbsp;${rate}%`
              };
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

export default ChartDoughnut
