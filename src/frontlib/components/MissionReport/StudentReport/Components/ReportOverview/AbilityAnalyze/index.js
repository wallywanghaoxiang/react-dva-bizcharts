import React, { useMemo } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import ChartRadar from '../../../../Components/ChartRadar';
import ReportPanel from '../../../../Components/ReportPanel/index';
import AbilityBar from './AbilityBar';
import NoAbility from '../../../../Components/NoAbility';

const messages = defineMessages({
  panelText: { id: 'app.examination.report.st.abilityanalyze.panelText', defaultMessage: '能力分析' },
  mine: { id: 'app.examination.report.chartradar.mine', defaultMessage: '我的' },
  currentClass: { id: 'app.examination.report.chartradar.currentClass', defaultMessage: '本班' },
  currentExercise: { id: 'app.examination.report.st.abilityanalyze.currentExercise', defaultMessage: '本次练习' },
  currentExam: { id: 'app.examination.report.st.abilityanalyze.currentExam', defaultMessage: '本次考试' }
});

/**
 * 学生报告-能力分析
 * @author tina.zhang
 * @date   2019-05-16
 * @param {array} dataSource - 数据源
 * @param {number} classCount - 班级数量
 */
function AbilityAnalyze(props) {

  const { dataSource, classCount, isExerciseReport } = props;

  const mine = formatMessage(messages.mine);
  const currentClass = formatMessage(messages.currentClass);

  // #region formatDataSource

  // 判断是否有数据
  const hasData = useMemo(() => {
    if (!dataSource || dataSource.length <= 0 || !dataSource.some(v => v.statics && v.statics.length > 0)) {
      return false;
    }
    return true;
  }, [dataSource]);

  // 格式化数据源
  const formatDataSource = useMemo(() => {
    if (!hasData) {
      return {
        fields: null,
        graphData: null
      };
    }
    const taskTypeValue = isExerciseReport ? formatMessage(messages.currentExercise) : formatMessage(messages.currentExam);
    const fields = classCount > 1 ? [mine, taskTypeValue, currentClass] : [mine, currentClass];
    const graphData = [];
    // 能力项超过4个
    dataSource.map(item => {
      let field = mine;
      switch (item.type) {
        case 'STUDENT':
          break;
        case 'CLASS':
          field = currentClass;
          break;
        default:
          field = taskTypeValue;
          break;
      }
      item.statics.forEach(st => {
        const dataItem = graphData.find(v => v.abilityName === st.abilityCode);// st.abilityName
        if (dataItem) {
          dataItem[field] = parseFloat(st.abilityAvgScore);
        } else {
          graphData.push({
            abilityCode: st.abilityCode,
            abilityName: st.abilityCode,// st.abilityName,
            [field]: parseFloat(st.abilityAvgScore)
          });
        }
      });
    });
    return {
      fields,
      graphData
    }
  }, [dataSource])
  // #endregion

  // const [state] = useState(() => formatDataSource);
  const { fields, graphData } = formatDataSource;

  return (
    <ReportPanel title={formatMessage(messages.panelText)}>
      {!hasData && <NoAbility />}
      {hasData && dataSource[0].statics.length > 4 &&
        <ChartRadar fields={fields} graphData={graphData} />
      }
      {hasData && dataSource[0].statics.length <= 4 &&
        <AbilityBar fields={fields} graphData={graphData} classCount={classCount} />
      }
    </ReportPanel>
  )
}

export default AbilityAnalyze
