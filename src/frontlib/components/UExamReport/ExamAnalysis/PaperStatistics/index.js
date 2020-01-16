import React, { useMemo } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../Components/ReportPanel';
import PaperChartLine from '../../Components/PaperChartLine';
import PaperChartBar from '../../Components/PaperChartBar';
import styles from './index.less';

const messages = defineMessages({
  linePanelTitle: { id: 'app.examination.report.paperstatistics.linePanelTitle', defaultMessage: '试卷难度和区分度' },
  barPanelTitle: { id: 'app.examination.report.paperstatistics.barPanelTitle', defaultMessage: '试卷得分率' },
  difficulty: { id: 'app.examination.report.paperstatistics.difficulty', defaultMessage: '难度' },
  discrimination: { id: 'app.examination.report.paperstatistics.discrimination', defaultMessage: '区分度' },
  scoreRate: { id: 'app.examination.report.paperstatistics.scoreRate', defaultMessage: '得分率' },
});

/**
 * 试卷难度和区分度、得分率
 * @author tina.zhang
 * @date   2019-8-26
 * @param {array} dataSource - data.subquestionList
 * @param {string} paperName - 试卷名称
 */
function PaperStatistics(props) {

  const { dataSource, paperName } = props;

  // 初始化数据源
  const formatDataSource = useMemo(() => {
    const difficultyMsg = formatMessage(messages.difficulty);
    const discriminationMsg = formatMessage(messages.discrimination);
    const scoreRateMsg = formatMessage(messages.scoreRate);

    const lineDataSource = [];
    const barDataSource = [];
    // 折线图
    dataSource.forEach((item, index) => {
      const qesName = `${index}_${item.subquestionName}`;

      if (!lineDataSource.some(v => v.subquestionNo.indexOf(item.subquestionNo) >= 0)) {
        lineDataSource.push({
          subquestionNo: item.subquestionNo,
          questionName: qesName,
          [difficultyMsg]: parseFloat(item.difficulty) || 0,
          [discriminationMsg]: parseFloat(item.discrimination) || 0,
        });
      }

      if (!barDataSource.some(v => v.subquestionNo.indexOf(item.subquestionNo) >= 0)) {
        barDataSource.push({
          subquestionNo: item.subquestionNo,
          questionName: qesName,
          [scoreRateMsg]: (parseFloat(item.scoreRate) || 0) * 1000 / 10,
        })
      }
    });
    return {
      lineFields: [discriminationMsg, difficultyMsg],
      lineDataSource,
      barFields: [scoreRateMsg],
      barDataSource
    }
  }, [dataSource]);

  return (
    <div className={styles.paperStatistics}>
      <ReportPanel title={formatMessage(messages.linePanelTitle)}>
        <PaperChartLine graphData={formatDataSource.lineDataSource} fields={formatDataSource.lineFields} paperName={paperName} />
      </ReportPanel>
      <ReportPanel title={formatMessage(messages.barPanelTitle)}>
        <PaperChartBar graphData={formatDataSource.barDataSource} fields={formatDataSource.barFields} paperName={paperName} />
      </ReportPanel>
    </div>
  )
}

export default PaperStatistics
