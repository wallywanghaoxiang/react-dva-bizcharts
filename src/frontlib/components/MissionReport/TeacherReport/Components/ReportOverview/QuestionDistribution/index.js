/* eslint-disable react/no-array-index-key */
import React, { useCallback, useMemo } from 'react';
import { Row, Col } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../../../Components/ReportPanel';
import ChartBar from '../../../../Components/ChartBar';
import ChartDoughnut from '../../../../Components/ChartDoughnut';

const messages = defineMessages({
  panelTitle: { id: 'app.examination.report.questiondistribution.panelTitle', defaultMessage: '各大题分数分段' },
  scoreRangeText: { id: 'app.examination.report.questiondistribution.scoreRangeText', defaultMessage: '得分' },
});

/**
 * 教师报告-各大题分数分布
 * @author tina.zhang
 * @date   2019-05-08
 * @param {number} classCount - 班级数量
 * @param {array} dataSource - REPORT-102 -> data.questionStatis
 */
function QuestionDistribution(props) {

  const { dataSource, classCount } = props;

  // #region formatDataSource
  const formatLevel = useCallback((level) => {
    const numArray = level.slice(1, level.length - 1).split(',');
    const num0 = parseFloat(numArray[0]);
    const num1 = parseFloat(numArray[1]);
    if (num0 === num1) {
      return `${formatMessage(messages.scoreRangeText)}=${num0}`;
    }
    // 前后反转
    const startSymbol = level.charAt(0);
    const endSymbol = level.charAt(level.length - 1);
    const start = endSymbol === ']' ? '≥' : '>';
    const end = startSymbol === '[' ? '≥' : '>';
    return `${num1}${start}${formatMessage(messages.scoreRangeText)}${end}${num0}`;
  }, []);

  const formatDataSource = useMemo(() => {
    let graphData = [];
    // 多班级柱状图
    if (classCount > 1) {
      dataSource.forEach(qes => {
        const questionData = {
          questionNo: qes.questionNo,
          questionName: qes.questionName,
          fields: [],
          classData: []
        }
        qes.statis.forEach(classItem => {
          const classData = {
            classId: classItem.classId,
            className: classItem.className,
          };
          classItem.statis.forEach(st => {
            const level = formatLevel(st.level);
            if (questionData.fields.indexOf(level) < 0) {
              questionData.fields.push(level);
            }
            classData[`${level}_count`] = parseInt(st.num);
            classData[`${level}`] = parseFloat(st.rate);
          });
          questionData.classData.push(classData);
        })
        graphData.push(questionData);
      })
      return graphData;
    }

    // 单班环形图
    graphData = dataSource.filter(v => v.statis).map(qes => {
      const classData = qes.statis[0].statis.map(st => {
        const level = formatLevel(st.level);
        return {
          item: level,
          value: parseInt(st.num),
          rate: parseFloat(st.rate)
        }
      });
      return {
        questionNo: qes.questionNo,
        questionName: qes.questionName,
        classData
      };
    })
    return graphData;
  }, [dataSource]);
  // #endregion

  // 环形图：多个大题时，一行显示2个
  const doughnutColSpan = formatDataSource.length > 1 ? 12 : 24;

  // 柱状图：班级数量超过4 或者 大题数量为1个时，一行显示一个
  let barColSpan = 12;
  let barSize = 'small';
  if (formatDataSource.length === 1 || classCount > 4) {
    barColSpan = 24;
    barSize = "large";
  }

  return (
    <ReportPanel title={formatMessage(messages.panelTitle)} bgColor="#fff" padding='0' showExtendBtn hidden style={{ overflow: 'hidden' }}>
      <Row gutter={20}>
        {dataSource && classCount > 1
          && formatDataSource.map((item, index) => (
            <Col key={`col_${item.questionNo}_${index}`} span={barColSpan} style={{ paddingBottom: '20px' }}>
              <ReportPanel key={`panel_${item.questionNo}`} innerTitle={item.questionName}>
                <ChartBar fields={item.fields} graphData={item.classData} size={barSize} />
              </ReportPanel>
            </Col>
          ))}
        {dataSource && classCount === 1
          && formatDataSource.map((item, index) => (
            <Col key={`col_${item.questionNo}_${index}`} span={doughnutColSpan} style={{ paddingBottom: '20px' }}>
              <ReportPanel key={`panel_${item.questionNo}`} innerTitle={item.questionName}>
                <ChartDoughnut graphData={item.classData} />
              </ReportPanel>
            </Col>
          ))}
      </Row>
    </ReportPanel>
  )
}

export default QuestionDistribution
