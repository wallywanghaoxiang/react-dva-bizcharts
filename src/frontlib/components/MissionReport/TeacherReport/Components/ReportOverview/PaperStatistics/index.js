import React, { useMemo } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../../../Components/ReportPanel';
import PaperChartLine from '../../../../Components/PaperChartLine';
import PaperChartBar from '../../../../Components/PaperChartBar';
import styles from './index.less';

const messages = defineMessages({
  linePanelTitle: { id: 'app.examination.report.paperstatistics.linePanelTitle', defaultMessage: '试卷难度和区分度' },
  barPanelTitle: { id: 'app.examination.report.paperstatistics.barPanelTitle', defaultMessage: '试卷得分率' },
  difficulty: { id: 'app.examination.report.paperstatistics.difficulty', defaultMessage: '难度' },
  discrimination: { id: 'app.examination.report.paperstatistics.discrimination', defaultMessage: '区分度' },
  scoreRate: { id: 'app.examination.report.paperstatistics.scoreRate', defaultMessage: '得分率' },
});

/**
 * 教师报告-试卷难度和区分度、得分率
 * @author tina.zhang
 * @date   2019-05-13
 * @param {array} dataSource - REPORT-102 -> data.subquestionList
 * @param {string} paperName - 试卷名称
 */
function PaperStatistics(props) {

  const { dataSource, paperName } = props;

  // #region formatdatasource
  const formatDataSource = useMemo(() => {
    const difficultyMsg = formatMessage(messages.difficulty);
    const discriminationMsg = formatMessage(messages.discrimination);
    const scoreRateMsg = formatMessage(messages.scoreRate);

    const lineDataSource = [];
    const barDataSource = [];
    // 折线图
    dataSource.forEach((item, index) => {
      const qesName = `${index}_${item.subquestionName}`;
      lineDataSource.push({
        questionName: qesName,
        [difficultyMsg]: parseFloat(item.difficulty) || 0,
        [discriminationMsg]: parseFloat(item.discrimination) || 0,
      });
      barDataSource.push({
        questionName: qesName,
        [scoreRateMsg]: (parseFloat(item.scoreRate) || 0) * 1000 / 10,
      })
    });
    return {
      lineFields: [discriminationMsg, difficultyMsg],
      lineDataSource,
      barFields: [scoreRateMsg],
      barDataSource
    }
  }, [dataSource]);
  // #endregion


  // const [state] = useState(() => formatDataSource);

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
