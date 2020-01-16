import React, { useState, useMemo, useCallback } from 'react';
import { Row, Col } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import ReportPanel from '../../../../Components/ReportPanel';
import ChartRadar from '../../../../Components/ChartRadar';
import ChartGroupBar from '../../../../Components/ChartGroupBar';
import RightGrid from './RightGrid';
import NoAbility from '../../../../Components/NoAbility';
import constant from '../../../../constant';
import styles from './index.less';

const messages = defineMessages({
  panelTitle: { id: 'app.examination.report.abilityAnalysis.paneltitle', defaultMessage: '能力分析' },

  fullClassName: { id: 'app.report.constant.fullclassname', defaultMessage: '本次考试' },
  fullExerciseName: { id: 'app.report.constant.fullexercisename', defaultMessage: '本次练习' },
});

// const keys
const { FULL_CLALSS_NAME, FULL_CLALSS_COLOR } = constant;

/**
 * 教师报告-成绩分布
 * @author tina.zhang
 * @date   2019-05-10
 * @param {array} dataSource - REPORT-102 -> data.abilityStatis
 */
function AbilityAnalysis(props) {

  const { dataSource } = props;

  const fullClassName = formatMessage(messages.fullClassName);
  const fullExerciseName = formatMessage(messages.fullExerciseName);

  // #region formatDataSource
  // 判断是否有数据
  const hasData = useMemo(() => {
    if (!dataSource || dataSource.length <= 0 || !dataSource.some(v => v.statis && v.statis.length > 0)) {
      return false;
    }
    return true;
  }, [dataSource]);

  // 格式化数据源
  const formatDataSource = useMemo(() => {
    if (!hasData) {
      return null;
    }
    const fields = [];
    const graphData = [];
    const abilityCount = dataSource[0].statis.length;
    // 能力项超过4个
    if (abilityCount > 4) {
      dataSource.forEach(classItem => {
        if (classItem.statis) {
          if (fields.indexOf(classItem.className) < 0) {
            fields.push(classItem.className);
          }
          classItem.statis.forEach(st => {
            const dataItem = graphData.find(v => v.abilityName === st.abilityCode);// st.abilityName
            if (dataItem) {
              dataItem[classItem.className] = parseFloat(st.abilityAvgScore);
              // 用于堆叠
              dataItem[`${classItem.className}_full`] = 1 - parseFloat(st.abilityAvgScore);
            } else {
              graphData.push({
                abilityCode: st.abilityCode,
                abilityName: st.abilityCode, // st.abilityName,
                [classItem.className]: parseFloat(st.abilityAvgScore),
                // 用于堆叠
                [`${classItem.className}_full`]: 1 - parseFloat(st.abilityAvgScore),
              });
            }
          });
        }
      });
      return {
        fields,
        graphData
      }
    }
    // 能力项小于等于4个时 (// TODO reverse:分组柱状图需要翻转数据源)
    dataSource.forEach(classItem => {
      if (classItem.statis) {
        const classData = {
          className: classItem.className
        }
        classItem.statis.forEach(st => {
          if (fields.indexOf(st.abilityCode) < 0) {// st.abilityName
            fields.push(st.abilityCode); // st.abilityName
          }
          classData[st.abilityCode] = parseFloat(st.abilityAvgScore); // st.abilityName
          classData[`${st.abilityCode}_full`] = 1 - parseFloat(st.abilityAvgScore); // st.abilityName
        });
        graphData.push(classData);
      }
    });
    return {
      fields, // :fields.reverse()
      graphData// :graphData.reverse()
    }
  }, [dataSource]);
  // #endregion

  // 存储数据源
  const initState = useMemo(() => {
    if (!hasData) {
      return null;
    }
    const leftDataSource = formatDataSource;
    const rightGridDataSource = dataSource.length > 1 ? dataSource.find(v => v.className === fullClassName || v.className === fullExerciseName) : dataSource[0];
    return {
      ...leftDataSource,
      rightGridDataSource,
      activeClassColor: FULL_CLALSS_COLOR
    }
  }, [dataSource]);

  const [state, setState] = useState(() => initState);

  // 左侧雷达图图例Click回调
  const handleRadarLegendClick = useCallback((field, color) => {
    const rightGridDataSource = dataSource.find(v => v.className === field);
    setState({
      ...state,
      activeClassColor: color,
      rightGridDataSource
    })
  }, []);

  return (
    <ReportPanel title={formatMessage(messages.panelTitle)}>
      <div className={styles.abilityAnalysis}>
        {!hasData && <NoAbility />}
        {/* 能力项4种以上时 雷达图展示 */}
        {hasData && dataSource[0].statis.length > 4 && // state.fields.length > 4 &&// dataSource[0].statis.length > 4
          <Row>
            <Col span={12}>
              <ChartRadar fields={state.fields} graphData={state.graphData} clickable={true} onLegendClick={handleRadarLegendClick} />
            </Col>
            <Col span={12}>
              <RightGrid dataSource={state.rightGridDataSource} color={state.activeClassColor} />
            </Col>
          </Row>
        }
        {/* 能力项4种及以下时 分组柱状图展示 */}
        {hasData && dataSource[0].statis.length <= 4 && // dataSource[0].statis.length <= 4 &&
          <ChartGroupBar fields={state.fields} graphData={state.graphData} />
        }
      </div>
    </ReportPanel>
  )
}

export default AbilityAnalysis
