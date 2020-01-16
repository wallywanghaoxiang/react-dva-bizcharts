import React, { PureComponent } from 'react';
import './index.less';
import smallLogo from '@/frontlib/assets/report_page_icon.png';
import right_icon from '@/frontlib/assets/qus_right_icon.png';
import wrong_icon from '@/frontlib/assets/qus_wrong_icon.png';
import unanswered_icon from '@/frontlib/assets/unanswered.png';
import { autoCreatePatternInfoText } from '@/frontlib/utils/utils';
import { FormattedMessage, defineMessages } from 'umi/locale';
import { showTime } from '@/utils/timeHandle';

const messages = defineMessages({
  paperTrialTimeCost: { id: 'app.paper.trial.time.cost', defaultMessage: '总时长' },
  totalScoreLabel: { id: 'app.trial.total.score.label', defaultMessage: '总得分' },
  proper: { id: 'app.proper', defaultMessage: '分' },
  totalProper: { id: 'app.total.proper', defaultMessage: '总分' },
  oralScoreLabel: { id: 'app.trial.oral.score.label', defaultMessage: '口语部分' },
  nonOralScoreLabel: { id: 'app.trial.non.oral.score.label', defaultMessage: '非口语部分' },
  scoreLabel: { id: 'app.score.label', defaultMessage: '得分' },
});

/**
 *整卷报告总分页
 *
 * @author tina.zhang
 * @date 2018-12-18
 * @export
 * @class ExampaperReport
 * @extends {PureComponent}
 */
export default class OverallPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      titleData: '', //标题数据
      overallData: [], //总分数据
      subData: [], //内容数据
      subIndex: [], //用于显示子题在一起的数据
    };
  }

  componentDidMount() {
    this.getTitleData();
    this.getSubData();
  }

  getTitleData() {
    const { paperData, allTime, eaxmTime } = this.props;
    if (eaxmTime) {
      this.setState({
        titleData: {
          title: paperData.name,
          time: eaxmTime,
        },
      });
    } else {
      this.setState({
        titleData: {
          title: paperData.name,
          time: showTime(allTime, 's'),
        },
      });
    }
  }

  getSubData() {
    const { paperData } = this.props;
    let question = [];
    if (paperData && paperData.paperInstance && paperData.paperInstance.length > 0) {
      paperData.paperInstance.map((Item, index) => {
        if (!Item.type || (Item.type != 'RECALL' && Item.type != 'SPLITTER')) {
          let temp = '';
          temp = {
            index: Item.pattern.mainPatterns.questionPatternInstanceSequence,
            name: Item.pattern.mainPatterns.questionPatternInstanceName
              ? Item.pattern.mainPatterns.questionPatternInstanceName
              : Item.pattern.questionPatternName,
            nameScore: autoCreatePatternInfoText(Item, false),
            fullMark: Item.pattern.mainPatterns.fullMark,
            sub: this.getSubScore(Item),
            overall: 0,
          };
          question.push(temp);
        }
      });
      this.getOverallData(question);
    }
  }

  getSubScore(data) {
    let sub = [];
    let type = data.pattern.questionPatternType;

    if ('NORMAL' == type) {
      data.questions.forEach((item, index) => {
        if (data.questions[index]) {
          // 排除空试题
          sub.push({
            subFallMark:
              data.pattern.mainPatterns.questionMark ||
              data.pattern.subQuestionPatterns[index].questionMark, // 子题总分
            score: this.checkScore(data.questions[index].data.mainQuestion), // 子题得分
            unanswered: this.checkNoAnswer(data.questions[index].data.mainQuestion),
            isOral: this.isOral(data.questions[index].data.mainQuestion),
            sequenceIndex: index, // 子题目序号，用于判断是否为同一道题
            sequenceSub: data.pattern.sequenceNumber[index][0], // 子题的真实题号
          });
        } else {
          sub.push({
            subFallMark: data.pattern.mainPatterns.questionMark, // 子题总分
            score: 0, // 子题得分
            unanswered: 0,
            isOral: this.isOral(data.pattern),
            sequenceIndex: index,
            sequenceSub: data.pattern.sequenceNumber[index][0],
          });
        }
      });
    } else if ('TWO_LEVEL' == type) {
      let subQuestionMark = '';
      data.pattern.subQuestionPatterns.forEach((Item, index) => {
        subQuestionMark =
          Item.subQuestionMark == 0
            ? data.pattern.mainPatterns.subQuestionMark
            : Item.subQuestionMark;
        if (data.questions[index]) {
          data.questions[index].data.subQuestion.map((Item1, index1) => {
            sub.push({
              subFallMark: subQuestionMark,
              score: this.checkScore(Item1),
              unanswered: this.checkNoAnswer(Item1),
              isOral: this.isOral(Item1),
              sequenceIndex: index, // 子题目序号，用于判断是否为同一道题
              sequenceSub: data.pattern.sequenceNumber[index][index1], // 子题的真实题号
            });
          });
        } else {
          for (let i = 0; i < Item.subQuestionCount; i++) {
            sub.push({
              subFallMark: subQuestionMark,
              score: 0,
              unanswered: 0,
              isOral: this.isOral(data.pattern),
              sequenceIndex: index, // 子题目序号，用于判断是否为同一道题
              sequenceSub: data.pattern.sequenceNumber[index][i], // 子题的真实题号
            });
          }
        }
      });
    } else if ('COMPLEX' == type) {
      data.pattern.groups.map((Item, index) => {
        let subtype = Item.pattern.questionPatternType;
        let subFullMark;
        if ('NORMAL' == subtype) {
          subFullMark = Item.pattern.mainPatterns.questionMark;
          if (data.questions[0]) {
            sub.push({
              subFallMark: subFullMark, // 子题总分
              score: this.checkScore(data.questions[0].data.groups[index].data.mainQuestion), // 子题得分
              unanswered: this.checkNoAnswer(
                data.questions[0].data.groups[index].data.mainQuestion
              ),
              isOral: this.isOral(data.questions[0].data.groups[index].data.mainQuestion),
              sequenceIndex: index, // 子题目序号，用于判断是否为同一道题
              sequenceSub: data.pattern.groups[index].pattern.sequenceNumber[0][0], // 子题的真实题号
            });
          } else {
            sub.push({
              subFallMark: subFullMark, //子题总分
              score: 0, //子题得分
              unanswered: 0,
              isOral: this.isOral(Item.pattern),
              sequenceIndex: index, //子题目序号，用于判断是否为同一道题
              sequenceSub: data.pattern.groups[index].pattern.sequenceNumber[0][0], //子题的真实题号
            });
          }
        } else if ('TWO_LEVEL' == subtype) {
          subFullMark = Item.pattern.mainPatterns.subQuestionMark;
          if (data.questions[0]) {
            data.questions[0].data.groups[index].data.subQuestion.map((Item1, index1) => {
              sub.push({
                subFallMark: subFullMark, //子题总分
                score: this.checkScore(Item1), //子题得分
                unanswered: this.checkNoAnswer(Item1),
                isOral: this.isOral(Item1),
                sequenceIndex: index, //子题目序号，用于判断是否为同一道题
                sequenceSub: data.pattern.groups[index].pattern.sequenceNumber[0][index1], //子题的真实题号
              });
            });
          } else {
            for (let i = 0; i < Item.pattern.mainPatterns.subQuestionCount; i++) {
              sub.push({
                subFallMark: subFullMark,
                score: 0,
                unanswered: 0,
                isOral: this.isOral(Item.pattern),
                sequenceIndex: index, //子题目序号，用于判断是否为同一道题
                sequenceSub: data.pattern.groups[index].pattern.sequenceNumber[0][i], //子题的真实题号
              });
            }
          }
        }
      });
    }
    return sub;
  }

  checkScore = data => {
    return data.receivePoints ? data.receivePoints : 0;
  };

  // 在练习未完成的情况下，报告页顶端小题不展示X
  checkNoAnswer = data => {
    const { isFinish } = this.props;
    let score = '';
    if (isFinish == 'no') {
      //表示练习中
      if (data.hasOwnProperty('answerId') || data.hasOwnProperty('answerValue')) {
        score = 0;
      } else {
        score = -1; //未答题
      }
    }
    return score;
  };

  /**
   *判断是口语题还是非口语题,如果是非口语题判断对错
   *
   * @author tina.zhang
   * @date 2018-12-20
   * @param {*} data
   * @memberof OverallPage
   * -1：口语题 0：错误 1：正确
   * subjectiveAndObjective
   * "OBJECTIVE"//客观题
   * "SUBJECTIVE_ORAL";//口语题
   */
  isOral = data => {
    let type = data.answerType;
    let objectType = data.subjectiveAndObjective;
    if (objectType) {
      //在未制题的时候判断是否为口语题
      if (objectType == 'OBJECTIVE') {
        return 0;
      } else if (objectType == 'SUBJECTIVE_ORAL') {
        return -1;
      }
    }
    if ('GAP_FILLING' == type) {
      return data.isRight ? 1 : 0;
    } else if ('CHOICE' == type) {
      return data.isRight ? 1 : 0;
    } else {
      return -1;
    }
  };

  getOverallData(question) {
    let oralFullMark = 0; //口语题总分
    let oralScore = 0; //口语题总得分
    let notOralFullMark = 0;
    let notOralScore = 0;
    let rate = 1000; //保留三位小数

    question.map((Item, index) => {
      if (!Item.type || (Item.type != 'RECALL' && Item.type != 'SPLITTER')) {
        let overall = 0;
        Item.sub.map((Item1, index1) => {
          switch (Item1.isOral) {
            case -1:
              oralFullMark += Item1.subFallMark * rate;
              oralScore += Item1.score * rate;
              overall += Item1.score * rate;
              break;
            case 0:
              notOralFullMark += Item1.subFallMark * rate;
              break;
            case 1:
              notOralFullMark += Item1.subFallMark * rate;
              notOralScore += Item1.subFallMark * rate;
              overall += Item1.subFallMark * rate;
              break;
            default:
              break;
          }
        });
        Item.overall = Number(overall / rate);
      }
    });
    this.setState({
      subData: question,
      subIndex: this.getTogether(question),
      overallData: {
        overallScore: Number((oralScore + notOralScore) / rate),
        fullMark: Number((oralFullMark + notOralFullMark) / rate),
        oralFullMark: Number(oralFullMark / rate),
        oralScore: Number(oralScore / rate),
        notOralFullMark: Number(notOralFullMark / rate),
        notOralScore: Number(notOralScore / rate),
      },
    });
    this.props.self.postSubData(question);
  }

  // 将相同子题放到一起
  getTogether = data => {
    let temp = [];
    data.map((Item, index) => {
      let sub = [];
      Item.sub.map((Item1, index1) => {
        if (!sub[Item1.sequenceIndex]) {
          sub[Item1.sequenceIndex] = [];
        }
        sub[Item1.sequenceIndex].push(Item1);
      });
      temp.push(sub);
    });
    return temp;
  };

  log = () => {
    console.log(this.state.subData);
    console.log(this.state.overallData);
  };

  render() {
    const { titleData, overallData, subData, subIndex } = this.state;
    console.log(subData);
    return (
      <div className="overallPage">
        <div className="heard">
          <div className="title">{titleData.title}</div>
          <div className="time">
            <i className="iconfont icon-time" />
            <FormattedMessage {...messages.paperTrialTimeCost} />：{titleData.time}
          </div>
        </div>
        <div className="content">
          <img className="smalllogo" src={smallLogo} alt="logo" onClick={this.log} />
          <div className="heard-score">
            <div className="score first">
              <div className="title showfont">
                <FormattedMessage {...messages.totalScoreLabel} />
              </div>
              <div>
                <span className="overall red">
                  {overallData.overallScore}
                  <FormattedMessage {...messages.proper} />
                </span>
                <span>
                  /<FormattedMessage {...messages.totalProper} /> {overallData.fullMark}
                  <FormattedMessage {...messages.proper} />
                </span>
              </div>
            </div>
            {overallData.notOralFullMark * overallData.oralFullMark != 0 ? (
              <div style={{ display: 'flex' }}>
                <div className="score">
                  <div className="title showfont">
                    <FormattedMessage {...messages.oralScoreLabel} />
                  </div>
                  <div>
                    <span className="overall">
                      {overallData.oralScore}
                      <FormattedMessage {...messages.proper} />
                    </span>
                    <span>
                      /<FormattedMessage {...messages.totalProper} /> {overallData.oralFullMark}
                      <FormattedMessage {...messages.proper} />
                    </span>
                  </div>
                </div>
                <div className="score">
                  <div className="title showfont">
                    <FormattedMessage {...messages.nonOralScoreLabel} />
                  </div>
                  <div>
                    <span className="overall">
                      {overallData.notOralScore}
                      <FormattedMessage {...messages.proper} />
                    </span>
                    <span>
                      /<FormattedMessage {...messages.totalProper} /> {overallData.notOralFullMark}
                      <FormattedMessage {...messages.proper} />
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          <div className="line" />
          <div className="subscore">
            <table className="tab">
              {subData.map((Item, index) => {
                return (
                  <tbody>
                    <tr colSpan="2">
                      <td className="left-title showfont">{Item.index + Item.name}</td>
                      <td className="right">{Item.nameScore}</td>
                    </tr>
                    <tr className="tab-title">
                      <td className="left">
                        <div className="item-left">
                          <span className="showfont">
                            <FormattedMessage {...messages.scoreLabel} /> {Item.overall}
                            <FormattedMessage {...messages.proper} />{' '}
                          </span>
                          <span>
                            | <FormattedMessage {...messages.totalProper} /> {Item.fullMark}
                            <FormattedMessage {...messages.proper} />
                          </span>
                        </div>
                      </td>
                      <td className="right">
                        {subIndex[index].map((Item2, index2) => {
                          return (
                            <div className="toGroup">
                              {Item2.map((Item1, index1) => {
                                let a = '';
                                switch (Item1.isOral) {
                                  case -1:
                                    a = (
                                      <span className="item-score">
                                        {Item1.unanswered == -1 ? (
                                          <img src={unanswered_icon} />
                                        ) : (
                                          Item1.score + '分'
                                        )}
                                        <span className="light">
                                          /{Item1.subFallMark}
                                          <FormattedMessage {...messages.proper} />
                                        </span>
                                      </span>
                                    );
                                    break;
                                  case 0:
                                    a = (
                                      <span className="item-score">
                                        <img
                                          src={
                                            Item1.unanswered == -1 ? unanswered_icon : wrong_icon
                                          }
                                        />
                                        0<FormattedMessage {...messages.proper} />
                                      </span>
                                    );
                                    break;
                                  case 1:
                                    a = (
                                      <span className="item-score">
                                        <img src={right_icon} />
                                        {Item1.subFallMark}
                                        <FormattedMessage {...messages.proper} />
                                      </span>
                                    );
                                    break;
                                  default:
                                    break;
                                }
                                return (
                                  <div className="item-right">
                                    <span className="number">{Item1.sequenceSub}</span>
                                    {a}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </td>
                    </tr>
                  </tbody>
                );
              })}
            </table>
          </div>
        </div>
      </div>
    );
  }
}
