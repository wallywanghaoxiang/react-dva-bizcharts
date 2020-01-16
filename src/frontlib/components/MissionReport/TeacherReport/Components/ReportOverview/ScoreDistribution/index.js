import React, { useMemo } from 'react'
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../../../Components/ReportPanel';
import ScoreDistributionGrid from './ScoreDistributionGrid';
import ChartBarContrast from '../../../../Components/ChartBarContrast';
import styles from './index.less';

const messages = defineMessages({
  panelTitle: { id: 'app.examination.report.scoredistribution.panelTitle', defaultMessage: '分数构成' },
  avgScore: { id: 'app.examination.report.rankingdistribution.chartbarcontrast.avgScore', defaultMessage: '均分' },
  sumScore: { id: 'app.examination.report.rankingdistribution.chartbarcontrast.sumScore', defaultMessage: '总分' },
  takeRate: { id: 'app.examination.report.rankingdistribution.chartbarcontrast.takeRate', defaultMessage: '占' },
});

/**
 * 教师报告-分数构成
 * @author tina.zhang
 * @date   2019-05-13
 * @param {number} classCount - 班级数量
 * @param {array} dataSource - REPORT-102 -> data.questionList
 */
function ScoreDistribution(props) {

  const { dataSource, classCount } = props;

  // #region formatDataSource
  const formatDataSource = useMemo(() => {
    if (classCount !== 1) {
      return {
        fullMark: 0,
        barCount: 0,
        source: null
      };
    }
    // 单班
    const fullMark = parseFloat(dataSource[0].mark) || 0;
    const valueData = [];
    const contrastData = [];
    dataSource[0].statis.forEach(qt => {
      const key = `${qt.questionName}(${formatMessage(messages.takeRate)}${fullMark === 0 ? 0 : parseFloat(((parseFloat(qt.mark) / fullMark) * 1000 / 10).toFixed(1))}%)`;
      valueData.push({
        item: formatMessage(messages.avgScore),
        key,
        value: parseFloat(qt.avgScore)
      });
      contrastData.push({
        item: 'contrast',
        key,
        value: parseFloat(qt.mark) - parseFloat(qt.avgScore)
      })
    });
    const source = contrastData.concat(valueData);
    return {
      fullMark,
      barCount: dataSource[0].statis.length,
      source
    };
  }, [dataSource])
  // #endregion

  const { fullMark, barCount, source } = formatDataSource;

  return (
    <div className={styles.reportScoreDistribution}>
      {classCount > 1 &&
        <ReportPanel title={formatMessage(messages.panelTitle)} padding="0" style={{ borderRadius: '0px' }}>
          <ScoreDistributionGrid dataSource={dataSource} />
        </ReportPanel>
      }
      {classCount === 1 && source.length > 0 &&
        <ReportPanel title={formatMessage(messages.panelTitle)}>
          <ChartBarContrast graphData={source} contrastName={formatMessage(messages.sumScore)} showLegend barCount={barCount} size="large" fullMark={fullMark} />
        </ReportPanel>
      }
    </div>
  )
}

export default ScoreDistribution
