import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Row, Col } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import { BizChartColors } from '@/utils/color';
import ReportPanel from '../../Components/ReportPanel';
import ChartRadar from '../../Components/ChartRadar';
import ChartGroupBar from '../../Components/ChartGroupBar';
import RightGrid from './RightGrid';
import NoAbility from '../../Components/NoAbility';
import constant from '../../constant';
import styles from './index.less';
import ClassSelector from './ClassSelector';

const messages = defineMessages({
  panelTitle: {
    id: 'app.examination.report.abilityAnalysis.paneltitle',
    defaultMessage: '能力分析',
  },

  currentClass: { id: 'app.text.uexam.report.chartradar.currentClass', defaultMessage: '班级' },
  // fullClassName: { id: 'app.report.constant.fullclassname', defaultMessage: '本次考试' },
  // fullExerciseName: { id: 'app.report.constant.fullexercisename', defaultMessage: '本次练习' },
  // fullClassSelector: { id: 'app.report.constant.fullclassselector', defaultMessage: '全部' },
});

// const keys
const { SYS_TYPE, SYS_COLORS } = constant;

/**
 * 能力分析
 * @author tina.zhang
 * @date   2019-8-26
 * @param {string} type - 显示类型，默认区级（uexam:区级、campus：校级、class：班级）
 * @param {Array} dataSource - 能力分析数据源 data.abilityStatis
 * @param {Array} classList - 班级列表（class 报告,使用）
 * @param {Array} selectedClassIds - 已选班级列表
 * @param {function} onClassChanged(value,item) - 班级切换
 */
function AbilityAnalysis(props) {
  const { type, dataSource, classList, selectedClassIds, onClassChanged } = props;

  // 判断是否有数据
  const hasData = useMemo(() => {
    if (
      !dataSource ||
      dataSource.length <= 0 ||
      !dataSource.some(v => v.statis && v.statis.length > 0)
    ) {
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
    const filterSource = [];

    // 过滤+排序处理 本次考试->本校->本班
    const exam = dataSource.find(v => v.type === SYS_TYPE.UEXAM);
    if (exam) {
      filterSource.push(exam);
    }

    if (type !== SYS_TYPE.UEXAM) {
      const campus = dataSource.find(v => v.type === SYS_TYPE.CAMPUS);
      if (campus) {
        filterSource.push(campus);
      }
    }
    if (type === SYS_TYPE.CLASS) {
      const clazz = dataSource.filter(v => v.type !== SYS_TYPE.CAMPUS && v.type !== SYS_TYPE.UEXAM);
      if (clazz) {
        const currentClassName = formatMessage(messages.currentClass);
        // 单班时，班级名称替换为 “班级”  同时更新dataSource中的班级名称
        if (!classList || classList.length === 1) {
          clazz.forEach(c => {
            filterSource.push({
              ...c,
              className: c.type === SYS_TYPE.CLASS ? currentClassName : c.className,
            });
          });
          dataSource.forEach(c => {
            if (c.type === SYS_TYPE.CLASS) {
              // eslint-disable-next-line no-param-reassign
              c.className = currentClassName;
            }
          });
        } else {
          filterSource.push(...clazz);
        }
      }
    }

    const abilityCount = filterSource[0].statis.length;
    if (abilityCount > 4) {
      filterSource.forEach(classItem => {
        // if (classItem.statis) { // 空数据 正常显示图例项
        if (fields.indexOf(classItem.className) < 0) {
          fields.push(classItem.className);
        }
        if (classItem.statis) {
          classItem.statis.forEach(st => {
            const dataItem = graphData.find(v => v.abilityName === st.abilityCode);
            if (dataItem) {
              dataItem[classItem.className] = parseFloat(st.abilityAvgScore);
            } else {
              graphData.push({
                abilityCode: st.abilityCode,
                abilityName: st.abilityCode,
                [classItem.className]: parseFloat(st.abilityAvgScore),
              });
            }
          });
        }
      });
    }
    // TODO 能力项小于等于4个时 (reverse:分组柱状图需要翻转数据源)
    else {
      filterSource.forEach(classItem => {
        // if (classItem.statis) { // 空数据 正常显示图例项
        const classData = {
          className: classItem.className || classItem.classId,
        };
        if (classItem.statis) {
          classItem.statis.forEach(st => {
            if (fields.indexOf(st.abilityCode) < 0) {
              fields.push(st.abilityCode);
            }
            classData[st.abilityCode] = parseFloat(st.abilityAvgScore);
            classData[`${st.abilityCode}_full`] =
              (1000 - parseFloat(st.abilityAvgScore) * 1000) / 1000;
          });
          graphData.push(classData);
        } else {
          // 空数据，补全能力项以及值设置为0
          const hasDataItem = filterSource.find(v => v.statis && v.statis.length > 0);
          hasDataItem.statis.forEach(a => {
            classData[a.abilityCode] = 0;
            classData[`${a.abilityCode}_full`] = 1;
          });
          graphData.push(classData);
        }
      });
    }
    return {
      abilityCount,
      fields,
      graphData,
    };
  }, [dataSource]);

  const [state, setState] = useState(null);
  useEffect(() => {
    if (!hasData) {
      return;
    }
    const leftDataSource = formatDataSource;
    // 雷达图 需处理右侧能力项列表数据源
    let rightGridDataSource;
    let defaultItemColor = '';
    if (leftDataSource.abilityCount > 4) {
      rightGridDataSource = dataSource.find(v => v.className === leftDataSource.fields[0]);
      const { type: defaultItemType } = rightGridDataSource;
      switch (defaultItemType) {
        case SYS_TYPE.UEXAM:
          defaultItemColor = SYS_COLORS.FULL_CLASS;
          break;
        case SYS_TYPE.CAMPUS:
          defaultItemColor = SYS_COLORS.CAMPUS;
          break;
        case SYS_TYPE.CLASS:
          defaultItemColor = SYS_COLORS.CLASS;
          break;
        default:
          [defaultItemColor] = BizChartColors;
          break;
      }
      if (!rightGridDataSource.statis) {
        const examOrCampus =
          dataSource.find(v => v.type === SYS_TYPE.UEXAM) ||
          dataSource.find(v => v.type === SYS_TYPE.CAMPUS);
        rightGridDataSource.statis = examOrCampus.statis.map(a => ({
          ...a,
          abilityAvgScore: '--',
        }));
      }
    }

    setState({
      ...leftDataSource,
      rightGridDataSource,
      activeClassColor: defaultItemColor,
    });
  }, [formatDataSource]);

  // 左侧雷达图图例Click回调
  const handleRadarLegendClick = useCallback(
    (field, color) => {
      const rightGridDataSource = dataSource.find(v => v.className === field);
      if (!rightGridDataSource.statis) {
        const examOrCampus =
          dataSource.find(v => v.type === SYS_TYPE.UEXAM) ||
          dataSource.find(v => v.type === SYS_TYPE.CAMPUS);
        rightGridDataSource.statis = examOrCampus.statis.map(a => ({
          ...a,
          abilityAvgScore: '--',
        }));
      }
      setState({
        ...state,
        activeClassColor: color,
        rightGridDataSource,
      });
    },
    [state, dataSource]
  );

  return (
    <ReportPanel title={formatMessage(messages.panelTitle)}>
      <div className={styles.classSelectorAcrea}>
        {type === SYS_TYPE.CLASS && classList && classList.length > 1 && (
          <ClassSelector
            classList={classList}
            selectedValues={selectedClassIds}
            onClassChanged={onClassChanged}
          />
        )}
      </div>
      <div className={styles.abilityAnalysis}>
        {!formatDataSource && <NoAbility />}
        {/* 能力项超过4个，雷达图展示 */}
        {formatDataSource && formatDataSource.abilityCount > 4 && state && (
          <div className={styles.radarContainer}>
            <div className={styles.left}>
              <ChartRadar
                type={type}
                fields={state.fields}
                graphData={state.graphData}
                onLegendClick={handleRadarLegendClick}
              />
            </div>
            <div className={styles.right}>
              <RightGrid dataSource={state.rightGridDataSource} color={state.activeClassColor} />
            </div>
          </div>
        )}
        {/* 能力项4种及以下时 分组柱状图展示 */}
        {formatDataSource && formatDataSource.abilityCount <= 4 && state && (
          <ChartGroupBar type={type} fields={state.fields} graphData={state.graphData} />
        )}
      </div>
    </ReportPanel>
  );
}

export default AbilityAnalysis;
