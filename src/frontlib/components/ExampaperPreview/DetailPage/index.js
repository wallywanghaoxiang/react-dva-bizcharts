/* eslint-disable react/sort-comp */
import React, { PureComponent } from 'react';
import QuestionShowCard from '@/frontlib/components/ExampaperReport/Components/QuestionShowCard';
import './index.less';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';

const messages = defineMessages({
  paperAnalysisTit: { id: 'app.paper.analysis.separator.txt', defaultMessage: '试卷解析' },
});

/**
 *整卷报告组件
 *
 * @author tina.zhang
 * @date 2018-12-20
 * @export
 * @class DetailPage
 * @extends {PureComponent}
 */
export default class DetailPage extends PureComponent {
  constructor(props) {
    super(props);
    this.subScoreData;
    this.state = {
      isShow: false,
      masterData: {
        questionIndex: '',
        subIndex: 0,
        id: '',
      },
    };
  }

  componentDidMount() {}

  selectQuestion = (e, type) => {
    const { selectCallback } = this.props;
    selectCallback(e, type);
  };

  // 用于控制跨showCard之间只有一个音频能播放
  changeId(id) {
    this.setState({ id });
  }

  /**
   *获取每道题目的总分
   *
   * @author tina.zhang
   * @date 2018-12-28
   * @param {*} mainIndex
   * @param {*} subIndex
   * @param {*} type
   * @returns
   * @memberof DetailPage
   */
  getSubFallMark(mainIndex, subIndex, type) {
    const { paperData } = this.props;
    const data = paperData.paperInstance[mainIndex].pattern;
    let subFallMark = -1;
    switch (type) {
      case 'NORMAL':
        subFallMark = data.mainPatterns.questionMark;
        break;
      case 'TWO_LEVEL':
        console.log(subIndex, '==============', data.subQuestionPatterns);
        console.log(data.subQuestionPatterns[subIndex]);
        subFallMark =
          data.subQuestionPatterns[subIndex].subQuestionMark == 0
            ? data.mainPatterns.subQuestionMark
            : data.subQuestionPatterns[subIndex].subQuestionMark;
        break;
      case 'COMPLEX':
        if (
          paperData.paperInstance[mainIndex].questions[0].data.groups[subIndex].data.mainQuestion
            .answerType != 'GAP_FILLING'
        ) {
          subFallMark =
            data.groups[subIndex].pattern.mainPatterns.questionMark != 0
              ? data.groups[subIndex].pattern.mainPatterns.questionMark
              : data.groups[subIndex].pattern.mainPatterns.subQuestionMark;
        } else {
          subFallMark = data.groups[subIndex].pattern.mainPatterns.fullMark;
        }
        break;
      default:
        break;
    }
    return subFallMark;
  }

  /**
   *计算每道小题的起始序号，小题按1开始依次起算
   *
   * @author tina.zhang
   * @date 2018-12-28
   * @param {*} mainIndex
   * @param {*} subIndex
   * @param {*} type
   * @returns
   * @memberof DetailPage
   */
  getSubStartNum(mainIndex, subIndex, type) {
    const { paperData } = this.props;
    const data = paperData.paperInstance[mainIndex].questions;
    let num = 0;
    if (type == 'NORMAL') {
      return subIndex;
    }
    if (subIndex > 0) {
      for (let i = subIndex - 1; i >= 0; i--) {
        switch (type) {
          case 'TWO_LEVEL':
            if (data[i].data.subQuestion) {
              num += data[i].data.subQuestion.length;
            } else {
              num += 1;
            }
            break;
          case 'COMPLEX':
            if (data[0].data.groups[i].data.subQuestion) {
              num += data[0].data.groups[i].data.subQuestion.length;
            } else {
              num += 1;
            }
            break;
          default:
            break;
        }
      }
    }
    return num;
  }

  render() {
    const {
      paperData,
      showData,
      isPapergroupFooter,
      questionIds,
      defaultPermissionList,
    } = this.props;
    const { id } = this.state;
    const sub = [];
    let type = '';
    paperData.paperInstance.map((Item, index) => {
      if (!Item.type || (Item.type != 'RECALL' && Item.type != 'SPLITTER')) {
        type = Item.pattern.questionPatternType;
        if (type != 'COMPLEX') {
          Item.questions.map((Item1, index1) => {
            if (Item1) {
              sub.push(
                <div
                  key={String(index1)}
                  className="card"
                  style={{ boxShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0.15)' }}
                >
                  <QuestionShowCard
                    defaultPermissionList={defaultPermissionList}
                    dataSource={Item1}
                    showData={showData[Item1.questionPatternId]}
                    titleData={Item.pattern}
                    paperInstance={paperData.paperInstance}
                    type={type}
                    subStartIndex={this.getSubStartNum(index, index1, type)}
                    key={Item1.id + index1 + Item1.questionPatternId}
                    subFallMark={this.getSubFallMark(index, index1, type)}
                    patternType={type}
                    mainIndex={index}
                    questionIndex={index1}
                    apiUrl={this.props.apiUrl}
                    self={this}
                    focus
                    id={id}
                    noFooter
                    displayMode={this.props.displayMode}
                    isPapergroupFooter={isPapergroupFooter}
                    questionIds={questionIds}
                  />
                </div>
              );
            }
          });
        } else {
          for (const i in Item.pattern.groups) {
            if (Item.questions[0]) {
              sub.push(
                <div
                  key={String(i)}
                  className="card"
                  style={{ boxShadow: '0px 0px 0px 0px rgba(0, 0, 0, 0.15)' }}
                >
                  <QuestionShowCard
                    defaultPermissionList={defaultPermissionList}
                    dataSource={Item.questions[0]}
                    // showData={showData[Item.questions[0].questionPatternId]}
                    showData={showData[Item.pattern.questionPatternId]}
                    titleData={Item.pattern}
                    paperInstance={paperData.paperInstance}
                    questionIndex={i}
                    subFallMark={this.getSubFallMark(index, i, type)}
                    type={type}
                    subStartIndex={this.getSubStartNum(index, i, type)}
                    mainIndex={index}
                    patternType={type}
                    key={Item.questions[0].id + i + Item.pattern.questionPatternId}
                    apiUrl={this.props.apiUrl}
                    self={this}
                    focus
                    id={id}
                    noFooter
                    displayMode={this.props.displayMode}
                    isPapergroupFooter={
                      Number(i) === Item.pattern.groups.length - 1 ? isPapergroupFooter : false
                    }
                    questionIds={questionIds}
                  />
                </div>
              );
            }
          }
        }
      }
    });

    return <div className="DetailPage">{sub}</div>;
  }
}
