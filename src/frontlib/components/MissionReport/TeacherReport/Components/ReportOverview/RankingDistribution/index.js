import React, { useState, useCallback, useMemo, useRef } from 'react';
import { List, Button, Tooltip } from 'antd';
import { formatMessage, defineMessages, FormattedMessage } from 'umi/locale';
import ReportPanel from '../../../../Components/ReportPanel/index';
import NoData from './NoData';
import styles from './index.less';

const ButtonGroup = Button.Group;

const messages = defineMessages({
  panelTitle: { id: 'app.examination.report.rankingdistribution.panelTitle', defaultMessage: '排名分布' },
  groupByRank: { id: 'app.examination.report.rankingdistribution.groupByRank', defaultMessage: '按名次' },
  groupByClass: { id: 'app.examination.report.rankingdistribution.groupByClass', defaultMessage: '按班级' },
  rangeTextFirst: { id: 'app.examination.report.rankingdistribution.rangeTextFirst', defaultMessage: '前{endRank}名' },
  rangeTextNormal: { id: 'app.examination.report.rankingdistribution.rangeTextNormal', defaultMessage: '第{fromRank}-{endRank}名' },
  rangeTextLast: { id: 'app.examination.report.rankingdistribution.rangeTextLast', defaultMessage: '{fromRank}名以后' },
  studentItemTip: { id: 'app.examination.report.rankingdistribution.studentItemTip', defaultMessage: '第{rank}名' },
  studentItemScore: { id: 'app.examination.report.rankingdistribution.studentItemScore', defaultMessage: '分' },
});

// 按排名显示
const SORT_BY_RANK = 'rank';
// 按班级显示
const SORT_BY_CLASS = 'class';

/**
 * 考后报告 排名分布
 * @author tina.zhang
 * @date   2019-05-12
 * @param {number} classCount - 班级数量
 * @param {array} dataSource - REPORT-107 -> data
 */
function RankingDistribution(props) {
  const { dataSource, classCount } = props;

  // #region format string
  const formatString = useCallback((str, len) => {
    let formatStr = '';
    if (str === null) {
      return formatStr;
    }
    if (typeof str !== "string") {
      formatStr = str.toString();
    } else {
      formatStr = str;
    }
    const strLen = formatStr.length;
    if (strLen > len) {
      return `${formatStr.slice(0, len)}...`;
    }
    return formatStr;
  }, []);

  // 是否有数据
  const hasData = useCallback((dataIndex) => {
    const levelData = dataSource[dataIndex];// .find(v => v.level === level);
    if (levelData && levelData && levelData.byRank && levelData.byRank.length > 0) {
      return true;
    }
    return false;
  }, []);
  // #endregion

  const [state, setState] = useState({
    hasData: hasData(0),
    activeRangeIndex: 0,
    sortType: SORT_BY_RANK
  });

  // #region 事件处理
  const stateRef = useRef();
  stateRef.current = state;
  const handleRangeItemClick = useCallback((item, index) => {
    setState({
      ...stateRef.current,
      hasData: hasData(index),// (item.level),
      activeRangeIndex: index// item.level
    })
  }, []);

  const handleRankBtnClick = useCallback((sort) => {
    setState({
      ...stateRef.current,
      sortType: sort
    })
  }, []);

  // #endregion

  // #region 渲染左侧分段列表
  const renderRangeItem = (item, index) => {
    const activeClass = index === state.activeRangeIndex ? styles.active : '';
    let rangeText = '';
    if (index === 0) {
      rangeText = <FormattedMessage values={{ endRank: item.endRank }} {...messages.rangeTextFirst} />;
    } else if (index === dataSource.length - 1) {
      rangeText = <FormattedMessage values={{ fromRank: item.fromRank }} {...messages.rangeTextLast} />;
    } else {
      rangeText = <FormattedMessage values={{ fromRank: item.fromRank, endRank: item.endRank }} {...messages.rangeTextNormal} />;
    }
    return (
      <List.Item className={activeClass} onClick={() => { handleRangeItemClick(item, index) }}>
        <div className={styles.rangeListItem}>
          <Button shape="circle" className={styles.highlightCircle} />
          <span className={styles.rangeListItemContent}>{rangeText}</span>
        </div>
      </List.Item>
    )
  }
  // #endregion

  // #region 渲染右侧学生列表
  const renderStudentList = useMemo(() => {
    let coms = [];
    const levelData = dataSource[state.activeRangeIndex];// .find(v => v.level === state.activeRange);
    if (state.sortType === SORT_BY_RANK) {
      const { byRank } = levelData;
      coms = byRank.map((item) => {

        const title = `${item.className}　${item.studentClassNo}${item.studentName.length > 4 ? `　${item.studentName}` : ''}`;

        return (
          <Tooltip key={item.studentId} title={`${title}`}>
            <div className={styles.studentListItem}>
              <div className={styles.rank}><FormattedMessage values={{ rank: item.rank }} {...messages.studentItemTip} /></div>
              <div className={styles.name}>
                {formatString(item.studentName, 4)}
              </div>
              <div className={styles.score}>{item.score || 0}{formatMessage(messages.studentItemScore)}</div>
            </div>
          </Tooltip>
        )
      });
    } else {
      const { byClass } = levelData;
      if (byClass && byClass.length > 0) {
        byClass.forEach((cls) => {
          coms.push(<div key={cls.classId} className={styles.cName}>{cls.className}</div>);
          const stList = cls.statis.map(st => {
            const title = `${st.className}　${st.studentClassNo}${st.studentName.length > 4 ? `　${st.studentName}` : ''}`;
            return (
              <Tooltip key={st.studentId} title={`${title}`}>
                <div className={styles.studentListItem}>
                  <div className={styles.rank}><FormattedMessage values={{ rank: st.rank }} {...messages.studentItemTip} /></div>
                  <div className={styles.name}>
                    {formatString(st.studentName, 4)}
                  </div>
                  <div className={styles.score}>{st.score || 0}{formatMessage(messages.studentItemScore)}</div>
                </div>
              </Tooltip>
            )
          });
          coms.push(stList);
        });
      }
    }
    return coms;
  }, [state.activeRangeIndex, state.sortType]);

  // #endregion

  // 隐藏分段样式
  const dynamicStyle = useMemo(() => {
    const rightContainerStyle = {
      width: '100%',
      borderLeft: 'none',
    }
    const studentListStyle = {
      height: '280px'
    };
    if (dataSource.length > 1) {
      rightContainerStyle.width = 'calc(100% - 160px)';
      rightContainerStyle.borderLeft = '1px solid #E5E5E5';
      rightContainerStyle.paddingLeft = '20px'
    }
    // 按钮不显示时，内容区域高度增加
    if (state.hasData && classCount > 1) {
      studentListStyle.height = '245px';
    }

    return {
      rightContainerStyle,
      studentListStyle
    }
  }, [dataSource]);

  return (
    <div className={styles.reportRanking}>
      <ReportPanel title={formatMessage(messages.panelTitle)}>
        <div>
          {/* // TODO 学生排名按班级显示-参加考试人数较少时 */}
          <div className={styles.rangeList}>
            {dataSource && dataSource.length > 1 &&
              <List
                size="large"
                split={false}
                dataSource={dataSource}
                renderItem={(item, index) => renderRangeItem(item, index)}
              />
            }
          </div>
          <div className={styles.rightContainer} style={dynamicStyle.rightContainerStyle}>
            {state.hasData && classCount > 1 &&
              <div className={styles.btngroup}>
                <ButtonGroup>
                  <Button className={state.sortType === SORT_BY_RANK ? styles.sortable : ''} onClick={() => { handleRankBtnClick(SORT_BY_RANK) }}>{formatMessage(messages.groupByRank)}</Button>
                  <Button className={state.sortType === SORT_BY_CLASS ? styles.sortable : ''} onClick={() => { handleRankBtnClick(SORT_BY_CLASS) }}>{formatMessage(messages.groupByClass)}</Button>
                </ButtonGroup>
              </div>
            }
            {state.hasData &&
              <div className={styles.studentList} style={dynamicStyle.studentListStyle}>
                {renderStudentList}
              </div>
            }
            {!state.hasData && <NoData />}
          </div>
        </div>
      </ReportPanel>
    </div>
  )
}

export default RankingDistribution
