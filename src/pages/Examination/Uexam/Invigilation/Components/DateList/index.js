/* eslint-disable react/no-array-index-key */
import React, { useCallback } from 'react';
import { Badge } from 'antd';
import { formatMessage } from 'umi/locale';
import classNames from 'classnames';
import styles from './index.less';

/**
 * 监考安排日期列表
 * @author tina.zhang
 * @date   2019-8-13 17:35:38
 * @param {Array} dateList - 日期列表
 * @param {Date} activeDateId - 当前选中的日期
 * @param {Date} onDateChanged - 日期切换回调
 */
function DateList(props) {
  const { dateList, activeDateId, onDateChanged } = props;

  // 获取月份和日期
  const getMonthAndDate = useCallback(time => {
    if (time) {
      const dt = new Date(time);
      const month = dt.getMonth() + 1;
      const date = dt.getDate();
      return {
        month,
        date,
      };
    }
    return {
      month: '-',
      date: '-',
    };
  }, []);

  // 日期选中事件
  const handleDateClick = dateId => {
    if (dateId !== activeDateId && onDateChanged && typeof onDateChanged === 'function') {
      onDateChanged(dateId);
    }
  };

  return (
    <div className={styles.dateList}>
      <Badge
        status="error"
        color="#FF6E4A"
        offset={[0, 0]}
        style={{ fontSize: '12px', color: 'rgba(136,136,136,1)' }}
        text={formatMessage({
          id: 'app.text.uexam.examination.invigilation.datelist.dottip',
          defaultMessage: '表示考试日期中还有必须安排的批次未安排监考教师',
        })}
      />
      <div className={styles.dateListContainer}>
        {dateList.map(v => {
          const monthAndDate = getMonthAndDate(v.examDate);

          return (
            <div
              key={`${v.id}`}
              className={classNames(
                styles.dateListItem,
                activeDateId === v.id ? styles.active : null
              )}
              onClick={() => handleDateClick(v.id)}
            >
              <Badge dot={!!v.hasUnArrange}>
                <div className={styles.month}>
                  {formatMessage(
                    {
                      id: 'app.text.uexam.examination.invigilation.datelist.month',
                      defaultMessage: '{month}月',
                    },
                    { month: monthAndDate.month }
                  )}
                </div>
                <div className={styles.date}>{monthAndDate.date}</div>
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DateList;
