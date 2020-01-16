import React, { PureComponent } from 'react';
import { Progress, Divider } from 'antd';
import logo2 from '@/frontlib/assets/logo_inside@2x.png';
import { FormattedMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import Timer from './Timer';

const messages = defineMessages({
  examDuration: { id: 'app.exam.duration', defaultMessage: '考试时长' },
  about: { id: 'app.about', defaultMessage: '约' },
  minute: { id: 'app.minute', defaultMessage: '分' },
  second: { id: 'app.second', defaultMessage: '秒' }
})
/**
 * 制作试卷头部
 */

export default class SiderMenu extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isPlay: true
    }
  }

  componentWillReceiveProps(nextProps) {
    const { isPlay } = nextProps;
    if (isPlay !== this.props.isPlay) {
      this.setState({
        isPlay
      });
    }

  }


  render() {
    const { coverRate, paperTime, callback,paperList } = this.props;
    return (
      <div className="logos" key="logo" style={window.ExampaperStatus === "EXAM" ? {} :{background: "#f5f5f5"}}>
                <div>
                    <img src={window.ExampaperStatus === "EXAM" ? "http://res.gaocloud.local/logos/logo_top_bar@2x.png":logo2} alt="logo" style={window.ExampaperStatus === "EXAM" ? {width:310,height:26}:{width:166,height:44}}/>
                </div>
                <div>
                    {window.ExampaperStatus === 'EXAM' ? <div className="flex">
                            <div className="text_exam">
                                <FormattedMessage id="app.exam.totalTime" defaultMessage="总用时"></FormattedMessage>
                            </div>
                            &nbsp;&nbsp;
                            <div className="timer">
                                <Timer isPlay={this.state.isPlay} callback={(e)=>{callback(e)}}/>
                            </div>

                            <Divider type="vertical" />

                            <div className="text_exam">
                                <FormattedMessage id="app.exam.exampaper" defaultMessage="练习用卷"></FormattedMessage>
                            </div>
                            &nbsp;&nbsp;
                            <div className="exampaper">
                                {paperList.length}
                            </div>
                            &nbsp;&nbsp;
                            <div className="text_exam">
                                <FormattedMessage id="app.exam.exampaper.num" defaultMessage="套"></FormattedMessage>
                            </div>

                        </div> :
                        <div className="flex">
                            <div className="text">
                            <FormattedMessage id="app.paper.making.prograss" defaultMessage="完成度"></FormattedMessage>
                            </div>
                            <Progress percent={coverRate} showInfo={false}/>
                            <div className="coverRate">
                                {Math.floor(coverRate)+"%"}
                            </div>
                            {paperTime==0 ?<div className="flex">
                                                    <div className={styles.line}/>
                                                    <div className="text">
                                                        <FormattedMessage {...messages.examDuration} />：
                                                    </div>
                                                    <div className="text">
                                                        <span><FormattedMessage {...messages.about} /></span>
                                                        <span className={styles.time}>0</span>
                                                        <span> <FormattedMessage {...messages.minute} /> </span>
                                                        <span className={styles.time}>0</span>
                                                        <span> <FormattedMessage {...messages.second} /></span>
                                                    </div>
                                                </div>
                                                :
                                                <div className="flex">
                                                    <div className={styles.line}/>
                                                    <div className="text">
                                                        <FormattedMessage {...messages.examDuration} />：
                                                    </div>
                                                    <div className="text">
                                                        <span><FormattedMessage {...messages.about} /></span>
                                                        <span className={styles.time}>{paperTime.split(":")[0]}</span>
                                                        <span> <FormattedMessage {...messages.minute} /> </span>
                                                        <span className={styles.time}>{paperTime.split(":")[1]}</span>
                                                        <span> <FormattedMessage {...messages.second} /></span>
                                                    </div>
                                                </div>}
                        </div>
                    }


                </div>
            </div>
    );
  }
}
