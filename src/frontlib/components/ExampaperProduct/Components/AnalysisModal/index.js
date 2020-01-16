import React, { Component } from 'react';
import { Modal } from 'antd';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import TopOverallScore from './Components/TopOverallScore';
import Evaluate from './Components/Evaluate';
import ContentDetails from './Components/ContentDetails';
import OtherInfo from './Components/OtherInfo';

const messages = defineMessages({
  ReferenceAnswerLabel: {
    id: 'app.reference.answer.label',
    defaultMessage: '参考答案',
  },
  answerAnalysisDialogTitle: { id: 'app.answer.analysis.dialog.title', defaultMessage: '答案解析' },
  myAnswerLabel: { id: 'app.my.answer.label', defaultMessage: '我的答案' },
  closeBtnTit: { id: 'app.close.btn', defaultMessage: '关闭' },
  integrity: { id: 'app.integrity', defaultMessage: '完整度' },
  accuracy: { id: 'app.accuracy', defaultMessage: '发音准确度' },
  pronunciation: { id: 'app.pronunciation', defaultMessage: '发音' },
  fluency: { id: 'app.fluency', defaultMessage: '流利度' },
  rhythm: { id: 'app.rhythm', defaultMessage: '韵律度' },
  overallAssessmentLabel: { id: 'app.overall.assessment.label', defaultMessage: '整体评价' },
  tip: { id: 'app.question.tips', defaultMessage: '点拨' },
});

const legendData = [
  {
    color: 'rgba(3,196,107,1)',
    title: formatMessage({ id: 'app.text.y', defaultMessage: '优' }),
  },
  {
    color: 'rgba(255,183,74,1)',
    title: formatMessage({ id: 'app.text.l', defaultMessage: '良' }),
  },
  {
    color: '#228EFF',
    title: formatMessage({ id: 'app.text.z', defaultMessage: '中' }),
  },
  {
    color: '#FF6E4A',
    title: formatMessage({ id: 'app.text.c', defaultMessage: '差' }),
  },
];

/**
 * 答案
 */
class AnalysisModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      tokenId: '',
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    const { focusId } = this.props;

    console.log(nextProps);
    if (nextProps.focusId) {
      if (nextProps.focusId !== focusId) {
        this.setState({ tokenId: nextProps.focusId });
      }
    }
  }

  onHandleCancel = () => {
    const { onClose } = this.props;
    this.setState({
      visible: false,
    });
    onClose();
  };

  onHandleOK = () => {
    const { onClose } = this.props;
    this.setState({
      visible: false,
    });
    onClose();
  };

  /**
   *  input 框处理
   */
  // handlePaperHeadName = () => { };
  // handleNavTime = () => { };

  // 获取小题得分，如果没有成绩，或者评分报错，都显示0分
  getItemOverall = maindata => {
    if (maindata.answerValue) {
      if (maindata.answerValue.result) {
        return maindata.answerValue.result.overall;
      }
      return 0;
    }
    return 0;
  };

  closedOral = count => {
    switch (count) {
      case 4:
        return (
          <span className={styles.green}>
            {formatMessage({ id: 'app.text.y', defaultMessage: '优' })}
          </span>
        );
      case 3:
        return (
          <span className={styles.orange}>
            {formatMessage({ id: 'app.text.l', defaultMessage: '良' })}
          </span>
        );
      case 2:
        return (
          <span className={styles.blue}>
            {formatMessage({ id: 'app.text.z', defaultMessage: '中' })}
          </span>
        );
      case 1:
        return (
          <span className={styles.red}>
            {formatMessage({ id: 'app.text.c', defaultMessage: '差' })}
          </span>
        );
      case 0:
        return (
          <span className={styles.red}>
            {formatMessage({ id: 'app.text.c', defaultMessage: '差' })}
          </span>
        );
      default:
        return '';
    }
  };

  showReult = answerValue => {
    const item = ['integrity', 'pronunciation', 'fluency', 'rhythm'];
    const html = [];
    item.map(i => {
      if (answerValue.result[i] !== undefined) {
        html.push(
          <div key={`showReult_${i}`} style={{ marginRight: '20px' }}>
            <FormattedMessage {...messages[i]} />：{this.closedOral(answerValue.result[i].score)}
          </div>
        );
      }
      return '';
    });
    return html;
  };

  renderLengend = () => {
    return (
      <div className={styles.flex}>
        {legendData.map((item, index) => {
          const n = index;
          return (
            <div className={styles.flex_then} key={`legendData_${n}`}>
              <div
                className={styles.dot}
                style={{ backgroundColor: item.color, border: `1px solid ${item.border}` }}
              />
              <div className={styles.legendtext}>{item.title}</div>
            </div>
          );
        })}
      </div>
    );
  };

  renderContent = dataSource => {
    const { hiddenRecordAnswer, mark, online, pop, masterData, isCanSee, evaluations } = this.props;
    const { tokenId } = this.state;
    const { patternType } = dataSource;
    switch (patternType) {
      case 'NORMAL': {
        const maindata = dataSource.mainQuestion;
        if (maindata.answerType === 'CHOICE') {
          return (
            <div>
              <TopOverallScore
                score={dataSource.receivePoints ? dataSource.receivePoints : 0}
                mark={dataSource.totalPoints ? dataSource.totalPoints : mark}
                data={dataSource.mainQuestion}
                normal
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                noShow
                online={online} // 线上报告页
                pop={pop} // 弹框模式
              />
              <OtherInfo
                model="CHOICE"
                normal
                evaluations={evaluations}
                pop={pop}
                data={maindata}
                hiddenRecordAnswer={hiddenRecordAnswer}
                tokenId={tokenId}
                callback={this.playingId}
              />
            </div>
          );
        }
        if (maindata.answerType === 'GAP_FILLING') {
          return (
            <div>
              <TopOverallScore
                score={dataSource.receivePoints ? dataSource.receivePoints : 0}
                mark={dataSource.totalPoints ? dataSource.totalPoints : mark}
                data={dataSource.mainQuestion}
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                normal
                noShow
                online={online}
                pop={pop}
              />
              <OtherInfo
                model="GAP_FILLING"
                normal
                evaluations={evaluations}
                data={maindata}
                pop={pop}
                hiddenRecordAnswer={hiddenRecordAnswer}
                tokenId={tokenId}
                callback={this.playingId}
              />
            </div>
          );
        }
        if (maindata.answerType === 'CLOSED_ORAL') {
          if (
            maindata.evaluationEngineInfo &&
            (maindata.evaluationEngineInfo.evaluationEngine === 'eval.sent.en' ||
              maindata.evaluationEngineInfo.evaluationEngine === 'en.sent.score')
          ) {
            return (
              <div>
                <TopOverallScore
                  score={this.getItemOverall(maindata)}
                  mark={maindata.totalPoints ? maindata.totalPoints : mark}
                  normal
                  data={maindata}
                  tokenId={tokenId}
                  isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                  callback={this.playingId}
                  noContent
                  online={online}
                  pop={pop}
                />
                <Evaluate normal data={maindata} model="eval.sent.en" />
                <ContentDetails data={maindata} model="eval.sent.en" normal />
                <OtherInfo
                  data={maindata}
                  normal
                  evaluations={evaluations}
                  tokenId={tokenId}
                  callback={this.playingId}
                  pop={pop}
                  hiddenRecordAnswer={hiddenRecordAnswer}
                />
              </div>
            );
          }
          if (
            maindata.evaluationEngineInfo &&
            (maindata.evaluationEngineInfo.evaluationEngine === 'eval.word.en' ||
              maindata.evaluationEngineInfo.evaluationEngine === 'en.word.score')
          ) {
            return (
              <div>
                <TopOverallScore
                  score={this.getItemOverall(maindata)}
                  mark={maindata.totalPoints ? maindata.totalPoints : mark}
                  normal
                  data={maindata}
                  tokenId={tokenId}
                  isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                  callback={this.playingId}
                  noContent
                  online={online}
                  pop={pop}
                />
                <ContentDetails data={maindata} model="eval.word.en" normal />
                <OtherInfo
                  data={maindata}
                  normal
                  evaluations={evaluations}
                  tokenId={tokenId}
                  callback={this.playingId}
                  online={online}
                  model="eval.word.en"
                  pop={pop}
                  hiddenRecordAnswer={hiddenRecordAnswer}
                />
              </div>
            );
          }
          return (
            <div>
              <TopOverallScore
                score={this.getItemOverall(maindata)}
                mark={maindata.totalPoints ? maindata.totalPoints : mark}
                normal
                data={maindata}
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                noContent
                online={online}
                pop={pop}
              />
              <Evaluate normal data={maindata} model="eval.para.en" />
              <ContentDetails normal data={maindata} model="eval.para.en" />
              <OtherInfo
                data={maindata}
                normal
                evaluations={evaluations}
                tokenId={tokenId}
                callback={this.playingId}
                pop={pop}
                hiddenRecordAnswer={hiddenRecordAnswer}
              />
            </div>
          );
        }
        if (maindata.answerType === 'HALF_OPEN_ORAL') {
          if (
            maindata.evaluationEngineInfo &&
            (maindata.evaluationEngineInfo.evaluationEngine === 'eval.choc.en' ||
              maindata.evaluationEngineInfo.evaluationEngine === 'en.sent.rec')
          ) {
            return (
              // todo 测试有限分支识别的结果
              <div>
                <TopOverallScore
                  score={this.getItemOverall(maindata)}
                  mark={maindata.totalPoints ? maindata.totalPoints : mark}
                  data={maindata}
                  tokenId={tokenId}
                  isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                  callback={this.playingId}
                  normal
                  online={online}
                  pop={pop}
                />
                <OtherInfo
                  model="eval.choc.en"
                  online={online}
                  normal
                  evaluations={evaluations}
                  data={maindata}
                  tokenId={tokenId}
                  pop={pop}
                  callback={this.playingId}
                  hiddenRecordAnswer={hiddenRecordAnswer}
                />
                {/* <Evaluate
                  normal={false}
                  data={maindata}
                /> */}
              </div>
            );
          }
          return (
            <div>
              <TopOverallScore
                score={this.getItemOverall(maindata)}
                mark={maindata.totalPoints ? maindata.totalPoints : mark}
                data={maindata}
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                normal
                online={online}
                pop={pop}
              />
              <OtherInfo
                model="HALF_OPEN_ORAL"
                normal
                evaluations={evaluations}
                data={maindata}
                online={online}
                tokenId={tokenId}
                pop={pop}
                callback={this.playingId}
                hiddenRecordAnswer={hiddenRecordAnswer}
              />
            </div>
          );
        }
        if (maindata.answerType === 'OPEN_ORAL') {
          return (
            <div>
              <TopOverallScore
                score={this.getItemOverall(maindata)}
                mark={maindata.totalPoints ? maindata.totalPoints : mark}
                data={maindata}
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                normal
                online={online}
                pop={pop}
              />
              <OtherInfo
                model="OPEN_ORAL"
                normal
                evaluations={evaluations}
                data={maindata}
                online={online}
                tokenId={tokenId}
                pop={pop}
                callback={this.playingId}
                hiddenRecordAnswer={hiddenRecordAnswer}
              />
            </div>
          );
        }
        return <div>不支持的题型</div>;
      }

      case 'TWO_LEVEL': {
        const subsdata = dataSource.subQuestion;
        let html = '';
        if (
          dataSource.mainQuestion.answerType === 'CHOICE' ||
          subsdata[0].answerType === 'CHOICE'
        ) {
          html = subsdata.map((item, index) => {
            const n = index;
            return (
              <div className={styles.greyBack}>
                <OtherInfo
                  key={`OtherInfo${n}`}
                  model="CHOICE"
                  evaluations={evaluations}
                  pop={pop}
                  index={`${this.returnSubIndex(masterData, index)}. `}
                  data={item}
                  hiddenRecordAnswer={hiddenRecordAnswer}
                  tokenId={tokenId}
                  callback={this.playingId}
                />
              </div>
            );
          });
          return (
            <div>
              <TopOverallScore
                score={dataSource.receivePoints ? dataSource.receivePoints : 0}
                mark={dataSource.totalPoints ? dataSource.totalPoints : mark}
                data={dataSource.mainQuestion}
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                online={online}
                pop={pop}
                noShow
              />
              <div style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                {formatMessage({ id: 'app.text.answerdetail', defaultMessage: '答题详情' })}
              </div>
              {html}
            </div>
          );
        }
        if (
          dataSource.mainQuestion.answerType === 'GAP_FILLING' ||
          subsdata[0].answerType === 'GAP_FILLING'
        ) {
          html = subsdata.map((item, index) => {
            const n = index;
            return (
              <div className={styles.greyBack}>
                <OtherInfo
                  key={`OtherInfo${n}`}
                  model="GAP_FILLING"
                  evaluations={evaluations}
                  index={`${this.returnSubIndex(masterData, index)}. `}
                  pop={pop}
                  data={item}
                  hiddenRecordAnswer={hiddenRecordAnswer}
                  tokenId={tokenId}
                  callback={this.playingId}
                />
              </div>
            );
          });
          return (
            <div>
              <TopOverallScore
                score={dataSource.receivePoints ? dataSource.receivePoints : 0}
                mark={dataSource.totalPoints ? dataSource.totalPoints : mark}
                data={dataSource.mainQuestion}
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                pop={pop}
                online={online}
                noShow
              />
              <div style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                {formatMessage({ id: 'app.text.answerdetail', defaultMessage: '答题详情' })}
              </div>
              {html}
            </div>
          );
        }
        if (dataSource.mainQuestion.answerType === 'CLOSED_ORAL') {
          html = subsdata.map((item, index) => {
            const n = index;
            if (
              item.evaluationEngineInfo &&
              (item.evaluationEngineInfo.evaluationEngine === 'eval.sent.en' ||
                item.evaluationEngineInfo.evaluationEngine === 'en.sent.score')
            ) {
              return (
                <div key={`ContentDetails${n}`} className={styles.greyBack}>
                  <ContentDetails
                    normal={false}
                    index={`${this.returnSubIndex(masterData, index)}. `}
                    data={item}
                    model="eval.sent.en"
                  />
                  <Evaluate normal={false} data={item} model="eval.sent.en" />
                  <OtherInfo
                    normal={false}
                    data={item}
                    evaluations={evaluations}
                    pop={pop}
                    tokenId={tokenId}
                    callback={this.playingId}
                    hiddenRecordAnswer={hiddenRecordAnswer}
                  />
                </div>
              );
            }
            if (
              item.evaluationEngineInfo &&
              (item.evaluationEngineInfo.evaluationEngine === 'eval.word.en' ||
                item.evaluationEngineInfo.evaluationEngine === 'en.word.score')
            ) {
              return (
                <div key={`ContentDetails${n}`} className={styles.greyBack}>
                  <ContentDetails
                    normal={false}
                    index={`${this.returnSubIndex(masterData, index)}. `}
                    data={item}
                    model="eval.word.en"
                  />
                  <OtherInfo
                    normal={false}
                    data={item}
                    evaluations={evaluations}
                    tokenId={tokenId}
                    callback={this.playingId}
                    pop={pop}
                    online={online}
                    model="eval.word.en"
                    hiddenRecordAnswer={hiddenRecordAnswer}
                  />
                </div>
              );
            }
            return (
              <div key={`ContentDetails${n}`} className={styles.greyBack}>
                <ContentDetails
                  normal={false}
                  index={`${this.returnSubIndex(masterData, index)}. `}
                  data={item}
                  model="eval.para.en"
                />
                <Evaluate normal={false} data={item} model="eval.para.en" />
                <OtherInfo
                  normal={false}
                  data={item}
                  evaluations={evaluations}
                  tokenId={tokenId}
                  callback={this.playingId}
                  pop={pop}
                  hiddenRecordAnswer={hiddenRecordAnswer}
                />
              </div>
            );
          });
          return (
            <div>
              <TopOverallScore
                score={dataSource.receivePoints ? dataSource.receivePoints : 0}
                mark={dataSource.totalPoints ? dataSource.totalPoints : mark}
                data={dataSource}
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                normal={false}
                online={online}
                pop={pop}
                noContent
              />
              <div style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                {formatMessage({ id: 'app.text.answerdetail', defaultMessage: '答题详情' })}
              </div>
              {html}
            </div>
          );
        }
        if (dataSource.mainQuestion.answerType === 'HALF_OPEN_ORAL') {
          html = subsdata.map((item, index) => {
            const n = index;
            if (
              item.evaluationEngineInfo &&
              (item.evaluationEngineInfo.evaluationEngine === 'eval.choc.en' ||
                item.evaluationEngineInfo.evaluationEngine === 'en.sent.rec')
            ) {
              return (
                // todo 测试有限分支识别的结果
                <div key={`OtherInfo${n}`} className={styles.greyBack}>
                  <OtherInfo
                    index={`${this.returnSubIndex(masterData, index)}. `}
                    model="eval.choc.en"
                    normal={false}
                    data={item}
                    evaluations={evaluations}
                    online={online}
                    tokenId={tokenId}
                    pop={pop}
                    callback={this.playingId}
                    hiddenRecordAnswer={hiddenRecordAnswer}
                  />
                  {/* <Evaluate
                    normal={false}
                    data={item}
                  /> */}
                </div>
              );
            }
            return (
              <div className={styles.greyBack}>
                <OtherInfo
                  index={`${this.returnSubIndex(masterData, index)}. `}
                  model="HALF_OPEN_ORAL"
                  evaluations={evaluations}
                  online={online}
                  normal={false}
                  data={item}
                  tokenId={tokenId}
                  pop={pop}
                  callback={this.playingId}
                  hiddenRecordAnswer={hiddenRecordAnswer}
                />
              </div>
            );
          });
          return (
            <div>
              <TopOverallScore
                score={dataSource.receivePoints ? dataSource.receivePoints : 0}
                mark={dataSource.totalPoints ? dataSource.totalPoints : mark}
                data={dataSource.mainQuestion}
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                online={online}
                pop={pop}
                normal={false}
              />
              <div style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                {formatMessage({ id: 'app.text.answerdetail', defaultMessage: '答题详情' })}
              </div>
              {html}
            </div>
          );
        }
        if (dataSource.mainQuestion.answerType === 'OPEN_ORAL') {
          html = subsdata.map((item, index) => {
            const n = index;
            return (
              <div key={`OtherInfo${n}`} className={styles.greyBack}>
                <OtherInfo
                  index={`${this.returnSubIndex(masterData, index)}. `}
                  model="OPEN_ORAL"
                  online={online}
                  normal={false}
                  evaluations={evaluations}
                  data={item}
                  tokenId={tokenId}
                  pop={pop}
                  callback={this.playingId}
                  hiddenRecordAnswer={hiddenRecordAnswer}
                />
              </div>
            );
          });
          return (
            <div>
              <TopOverallScore
                // score={dataSource.receivePoints?dataSource.receivePoints.toFixed(2):0}
                // mark={dataSource.totalPoints?dataSource.totalPoints.toFixed(2):this.props.mark.toFixed(2)}
                score={dataSource.receivePoints ? dataSource.receivePoints : 0}
                mark={dataSource.totalPoints ? dataSource.totalPoints : mark}
                data={dataSource.mainQuestion}
                tokenId={tokenId}
                isCanSee={!evaluations || isCanSee} // 非教师互评可看得分 || 教师互评是否可看 true|false
                callback={this.playingId}
                online={online}
                pop={pop}
                normal={false}
              />
              <div style={{ fontSize: '16px', color: '#333333', fontWeight: '500' }}>
                {formatMessage({ id: 'app.text.answerdetail', defaultMessage: '答题详情' })}
              </div>
              {html}
            </div>
          );
        }
        return (
          <div>
            {formatMessage({ id: 'app.text.notsupportquestion', defaultMessage: '不支持的题型' })}
          </div>
        );
      }

      default:
        return '';
    }
  };

  playingId = Id => {
    const { callback } = this.props;
    if (callback) {
      callback(Id);
    } else {
      this.setState({ tokenId: Id });
    }
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-02
   * @copyright 返回小题序号
   * @return    {[type]}    [description]
   */
  returnSubIndex(masterData, index) {
    const { report } = this.props;
    if (report) {
      return Number(masterData) + index;
    }
    const { staticIndex } = masterData;
    if (staticIndex.mainIndex !== false) {
      // 单题试做兼容 by tina.zhang
      const mainData = masterData.mains;
      const { subs } = mainData[staticIndex.mainIndex].questions[staticIndex.questionIndex];
      return subs[index];
    }
    return index + 1;
  }

  render() {
    const { dataSource, examReport, report, evaluations } = this.props;
    const { visible } = this.state;
    const heightModal = window.innerHeight - 238;

    if (examReport) {
      return (
        <div style={evaluations ? {} : { height: '608px', overflow: 'auto' }}>
          {this.renderContent(dataSource)}
          <div className={styles.line} />
        </div>
      );
    }
    return (
      <div>
        {report ? (
          <div>
            <div className={styles.up} />
            <div className={styles.answer}>{this.renderContent(dataSource)}</div>
          </div>
        ) : (
          <Modal
            visible={visible}
            centered
            closable={false}
            maskClosable={false}
            className={styles.PaperModal}
            destroyOnClose
            footer={
              <button
                type="button"
                className={styles.close_footer_button}
                onClick={this.onHandleOK}
              >
                <FormattedMessage {...messages.closeBtnTit} />
              </button>
            }
          >
            <div style={{ maxHeight: heightModal, height: 'auto', overflow: 'auto' }}>
              {this.renderContent(dataSource)}
              <div className={styles.line} />
            </div>
          </Modal>
        )}
      </div>
    );
  }
}

export default AnalysisModal;
