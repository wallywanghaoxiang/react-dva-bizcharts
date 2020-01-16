import React, { useState, useCallback, useMemo } from 'react'
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../../../Components/ReportPanel';
import ChartBar from '../../../../Components/ChartBar';
import ChartPie from '../../../../Components/ChartPie';

const messages = defineMessages({
  panelTitle: { id: 'app.examination.report.gradedistribution.paneltitle', defaultMessage: '成绩分布' },
});

/**
 * 教师报告-成绩分布
 * @author tina.zhang
 * @date   2019-05-08
 * @param {number} classCount - 班级数量
 * @param {array} dataSource - REPORT-102 -> data.scoreStatis
 */
function GradeDistribution(props) {

  const { dataSource, classCount } = props;

  // #region formatDataSource
  const formatLevel = useCallback((level) => {
    const numArray = level.slice(1, level.length - 1).split(',');
    const num0 = parseFloat(numArray[0]);
    const num1 = parseFloat(numArray[1]);
    if (num0 === num1) {
      return `得分=${num0}`;
    }
    // 前后反转
    const startSymbol = level.charAt(0);
    const endSymbol = level.charAt(level.length - 1);
    const start = endSymbol === ']' ? '≥' : '>';
    const end = startSymbol === '[' ? '≥' : '>';
    return `${num1}${start}得分${end}${num0}`;
  }, []);

  const formatDataSource = useMemo(() => {
    const fields = [];
    let graphData = [];
    // 多班柱状图
    if (classCount > 1) {
      dataSource.forEach(item => {
        if (item && item.statis) {
          const classData = {
            classId: item.classId,
            className: item.className,
          };
          item.statis.forEach(st => {
            const level = formatLevel(st.level);
            if (fields.indexOf(level) < 0) {
              fields.push(level);
            }
            classData[`${level}_count`] = parseFloat(st.num);
            classData[`${level}`] = parseFloat(st.rate);
          });
          graphData.push(classData);
        }
      })
      return {
        fieldList: fields,
        graphDataSource: graphData
      }
    }

    // 单班饼图
    if (dataSource[0].statis && dataSource[0].statis.length > 0) {
      graphData = dataSource[0].statis.map(item => {
        const level = formatLevel(item.level);
        return {
          item: level,
          value: parseFloat(item.num),
          rate: parseFloat(item.rate)
        }
      })
    }
    return {
      fieldList: fields,
      graphDataSource: graphData
    }
  }, [dataSource]);
  // #endregion

  const { fieldList, graphDataSource } = formatDataSource;
  const [fields] = useState(fieldList);
  const [graphData] = useState(graphDataSource);

  return (
    <ReportPanel title={formatMessage(messages.panelTitle)}>
      {dataSource && classCount > 1 && <ChartBar fields={fields} graphData={graphData} />}
      {dataSource && classCount === 1 && <ChartPie graphData={graphData} />}
    </ReportPanel>
  )
}

export default GradeDistribution
