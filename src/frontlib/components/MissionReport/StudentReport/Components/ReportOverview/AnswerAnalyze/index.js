import React from 'react';
import { Row, Col } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../../../Components/ReportPanel/index';
import ChartBarContrast from '../../../../Components/ChartBarContrast';
import ChartPie from '../../../../Components/ChartPie';
import WellDone from './WellDone';

const messages = defineMessages({
  panelText: { id: 'app.examination.report.st.answeranalyze.panelText', defaultMessage: '答题分析' },
  scoreDistributionPanelText: { id: 'app.examination.report.answeranalyze.st.scoreDistributionPanelText', defaultMessage: '分数构成' },
  loseDistributionPanelText: { id: 'app.examination.report.answeranalyze.st.loseDistributionPanelText', defaultMessage: '失分构成' },
  score: { id: 'app.examination.report.st.answeranalyze.chartbarcontrast.score', defaultMessage: '得分' },
});

/**
 * 学生报告-答 题分析
 * @author tina.zhang
 * @date   2019-05-16
 * @param {array} dataSource - 数据源
 */
function AnswerAnalyze(props) {

  // #region formatDataSource
  const formatDataSource = (source) => {
    const valueData = [];    // 得分(柱状图)
    const contrastData = []; // 失分(柱状图)
    const pieDataSource = [];// 饼图数据源

    let loseSum = 0; // 用于失分占比计算
    source.forEach(item => {
      const lose = parseFloat(item.loseScore) || 0;
      loseSum += lose;
    });

    source.forEach(qt => {
      valueData.push({
        item: formatMessage(messages.score),
        key: `${qt.questionNo}_${qt.questionName}`,
        value: parseFloat(qt.score) || 0
      });
      const contrastItem = {
        item: 'contrast',
        key: `${qt.questionNo}_${qt.questionName}`,
        value: parseFloat(qt.loseScore) || 0
      }
      contrastData.push(contrastItem);

      if (contrastItem.value > 0) {
        pieDataSource.push({
          item: `${qt.questionNo}_${qt.questionName}`,
          value: contrastItem.value,
          rate: parseFloat((contrastItem.value / loseSum * 1000 / 10).toFixed(1))
        });
      }
    });
    const dataSource = contrastData.concat(valueData);

    return {
      barCount: source.length,
      graphDataSource: dataSource,
      pieDataSource
    };
  }
  // #endregion

  const { dataSource } = props;
  // 分数构成(柱状图)数据源
  const { barCount, graphDataSource, pieDataSource } = formatDataSource(dataSource);

  return (
    <ReportPanel title={formatMessage(messages.panelText)} padding="0" bgColor="#fff" style={{ overflow: 'hidden' }}>
      <Row gutter={20}>
        <Col span={12}>
          <ReportPanel innerTitle={formatMessage(messages.scoreDistributionPanelText)}>
            <ChartBarContrast graphData={graphDataSource} barCount={barCount} size="small" />
          </ReportPanel>
        </Col>
        <Col span={12}>
          <ReportPanel innerTitle={formatMessage(messages.loseDistributionPanelText)}>
            {pieDataSource.length > 0
              ? <ChartPie graphData={pieDataSource} tootipType="losescore" />
              : <WellDone />
            }
          </ReportPanel>
        </Col>
      </Row>
    </ReportPanel>
  )
}

export default AnswerAnalyze
