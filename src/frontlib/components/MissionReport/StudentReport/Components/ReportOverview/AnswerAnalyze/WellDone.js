import React from 'react'
import { formatMessage, defineMessages } from 'umi/locale';
import welldone from '@/frontlib/assets/MissionReport/text_well_done.png';

const messages = defineMessages({
  welldone: { id: 'app.examination.report.st.answeranalyze.welldone', defaultMessage: '完全正确，没有失分' }
});

/**
 * 学生报告-无失分
 * @author tina.zhang
 * @date   2019-05-16
 */
function WellDone() {
  const style = {
    height: '300px',
    color: '#333333',
    fontSize: '18px',
    fontWeight: '500',
    textAlign: 'center'
  }
  const wellDoneStyle = {
    position: 'relative',
    paddingTop: '90px'
  }
  return (
    <div className="empty-chart" style={style}>
      <div className="well-done" style={wellDoneStyle}><img src={welldone} alt="well done!" /></div>
      <div>{formatMessage(messages.welldone)}</div>
    </div>
  )
}
export default WellDone;
