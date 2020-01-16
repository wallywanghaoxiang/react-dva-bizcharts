import React, { useCallback } from 'react';
import { Divider, Badge, Tooltip, Icon } from 'antd';
import { formatMessage, defineMessages, FormattedMessage } from 'umi/locale';
import ReportPanel from '../../../Components/ReportPanel';
import styles from './index.less';

const messages = defineMessages({
  suggestItemRank: { id: 'app.examination.report.transcript.suggest.item.rank', defaultMessage: '第{rank}名' },
  suggestUp: { id: 'app.examination.report.transcript.suggest.up', defaultMessage: '排名明显上升' },
  suggestDown: { id: 'app.examination.report.transcript.suggest.down', defaultMessage: '排名明显下降' },
});

/**
 * 教师报告-成绩单
 * @author tina.zhang
 * @date   2019-05-08
 * @param {object} dataSource - 数据源
 * @param {object} classCount - 班级数量
 */
function SuggestList(props) {

  // #region formatDataSource
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
  // #endregion

  const { dataSource, classCount } = props;
  const { rankUpList, rankDownList } = dataSource.attention;

  // 渲染学生信息
  const renderStudentItem = useCallback((item, type) => {

    const diffRank = parseInt(item.diffRank);
    const title = `${item.studentName}　${item.studentClassNo}`
    return (
      <div key={item.studentId} className={styles.studentListItem}>
        <div className={styles.rank}><FormattedMessage values={{ rank: item.classRank }} {...messages.suggestItemRank} /></div>
        <Tooltip title={title}>
          <div className={styles.name}>
            {formatString(item.studentName, 4)}
          </div>
        </Tooltip>
        <div className={styles.diffRank}>
          <Icon type={type === 'up' ? "arrow-up" : "arrow-down"} />{diffRank >= 0 ? diffRank : -diffRank} 名
        </div>
      </div>
    )
  }, []);


  return (
    <div className={styles.suggestResultPanel}>
      {((rankUpList && rankUpList.length > 0) || (rankDownList && rankDownList.length > 0)) &&
        <ReportPanel>
          {classCount > 1 &&
            <div className={styles.suggestHeader}>
              <div className={styles.title}>{dataSource.className}</div>
              <Divider />
            </div>
          }
          {/* 上升列表 */}
          {rankUpList && rankUpList.length > 0 &&
            <>
              <div>
                <div className={styles.suggestType}><Badge dot color="#03C46B" />{formatMessage(messages.suggestUp)}：</div>
                <div className={styles.studentList}>
                  {rankUpList.map(item => renderStudentItem(item, 'up'))}
                </div>
              </div>
              <Divider className={styles.middleDivider} />
            </>
          }
          {/* 下降列表 */}
          {rankDownList && rankDownList.length > 0 &&
            <>
              <div className={styles.suggestType}><Badge dot color="#FF6E4A" />{formatMessage(messages.suggestDown)}：</div>
              <div className={styles.studentList}>
                {rankDownList.map(item => renderStudentItem(item, 'down'))}
              </div>
            </>
          }
        </ReportPanel>
      }
    </div>
  )
}

export default SuggestList
