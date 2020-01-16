import React from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import noneicon from '@/frontlib/assets/MissionReport/none_teacher_icon.png';

const messages = defineMessages({
  nodata: { id: 'app.examination.report.rankingdistribution.nodata', defaultMessage: '该排名区间暂无学生' },
});

/**
 * 排名分布 无数据
 * @author tina.zhang
 * @date   2019-05-12
 */
function NoData() {
  const style = {
    color: '#888888',
    fontSize: '13px',
    fontWeight: '400',
    textAlign: 'center',
    height: '245px'
  }
  const GradeListNoDataStyle = {
    position: 'relative',
    paddingTop: '70px'
  }

  return (
    <div className="empty-chart" style={style}>
      <div className="well-done" style={GradeListNoDataStyle}>
        <img src={noneicon} alt="no data!" />
      </div>
      <div>{formatMessage(messages.nodata)}</div>
    </div>
  )
}

export default NoData
