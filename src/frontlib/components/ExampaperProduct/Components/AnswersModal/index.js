import React, { Component } from 'react';
import { Modal, message } from 'antd';

import cs from "classnames";
import styles from './index.less';
import { fromCharCode } from '@/frontlib/utils/utils';
import AutoPlay from '../AutoPlay';
import right_icon from '@/frontlib/assets/qus_right_icon.png';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import ColumnGroup from 'antd/lib/table/ColumnGroup';
const messages = defineMessages({
  CheckAnswerBtn: { id: 'app.check.answer.btn', defaultMessage: '答案' },
  ReferenceByMachine: { id: 'app.reference.by.machine', defaultMessage: '机评参考' },
  ReferenceReMark: { id: 'app.reference.by.remark', defaultMessage: '机评标注' },
  AudioExample: { id: 'app.audio.example', defaultMessage: '示范朗读' },
  ReferenceAnswerlabel: { id: 'app.reference.answerlabel', defaultMessage: '参考答案' },
  ReferenceAnswerlabelTips: { id: 'app.reference.answerlabeltip', defaultMessage: '提示答案' },
  ReferenceAnswerlabelError: { id: 'app.reference.answerlabelerror', defaultMessage: '错误答案' },
  keywordsExclude: { id: 'app.reference.keywordsExclude', defaultMessage: '评分关键词' },
  keywordsunExclude: { id: 'app.reference.keywordsunExclude', defaultMessage: '排除关键词' },
  weight: { id: 'app.reference.keywordsweight', defaultMessage: '权重' },
  closeBtn: { id: 'app.close.btn', defaultMessage: '关闭' },
});
/**
 * 答案
 */
class AnswersModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      upLoadSuccess: false,
      id: '',
      duration: 0,
      audioData: null,
      name: '',
      audioUrl: '',
      isPlay: false,
    };
  }

  componentDidMount() { }

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };
  onHandleOK = () => {
    this.setState({
      visible: false,
    });

    this.props.onClose();
  };


  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-02
   * @copyright 返回小题序号
   * @return    {[type]}    [description]
   */
  returnSubIndex(masterData, index) {
    if (this.props.report) {
      return Number(masterData) + index;
    } else {
      let staticIndex = masterData.staticIndex;
      if (staticIndex.mainIndex != false) { //单题试做兼容 by tina.zhang
        let mainData = masterData.mains;
        let subs = mainData[staticIndex.mainIndex].questions[staticIndex.questionIndex].subs;
        return subs[index];
      } else {
        return index + 1;
      }
    }
  }
  /**
   *  input 框处理
   */
  handlePaperHeadName = () => { };
  handleNavTime = () => { };

  renderContent(dataSource) {

    let patternType = dataSource.patternType;
    let jsx = [];
    switch (patternType) {
      case 'NORMAL':
        let maindata = dataSource.mainQuestion;
        jsx = this.renderAnswer(maindata, 0);

        return jsx;
      case 'TWO_LEVEL':
        let subsdata = dataSource.subQuestion;
        if (typeof (this.props.subIndex) != "undefined") {//线上平台老师报告页
          jsx = this.renderAnswer(subsdata[this.props.subIndex], Number(this.props.subIndex));
        } else {
          jsx = subsdata.map((item, index) => {
            return this.renderAnswer(item, index);
          });
        }

        return jsx;
    }
  }

  renderAnswer(data, index) {
    const { where, hiddenReferenceByMachine, modelStatus,report } = this.props;
    let patternType = this.props.dataSource.patternType;

    let questionsNumber = this.returnSubIndex(this.props.masterData, index) + "";
    if (questionsNumber.trim() != "") {
      questionsNumber = questionsNumber + ".";
    } else {
      questionsNumber = "";
    }
    if(report){
      questionsNumber="";// tina.zhang 1.3需求：报告页去掉答案前面的题号
    }
    let keywords = null;

    let validateStyle = {};

    // let validateTextStyle = {};
    // if(modelStatus === "VALIDATE"){
    validateStyle = {
      "background": "#F5F5F5",
      "padding": "0px 10px"
    }
    // validateTextStyle = {
    //   "background":"#F5F5F5",
    //   "padding":"0px 10px"
    // }
    // }

    let lineJsx = (<div className={styles.lineOutside}>
      <div className={styles.line}></div>
    </div>)

    if (where == "online") {
      lineJsx = (<div className={styles.lineOutside}></div>)
    }

    switch (data.answerType) {
      case 'GAP_FILLING': // 填空题
        let answersText = [];
        for (let i in data.gapFillingQuestionAnswerInfo.answers) {
          answersText.push(data.gapFillingQuestionAnswerInfo.answers[i].text)
        }
        if (where == "online") {
          return <div>
            <div>{questionsNumber + formatMessage({ id: "app.text.da", defaultMessage: "答案" }) + "：" + answersText.join(", ")}</div>
            {data.answerExplanation && <div className={styles.answerTipsName}>
              <div className={styles.answerTips}>{formatMessage({ id: "app.question.tips", defaultMessage: "点拨" })}</div>
              <div className={styles.answerTip2}></div>
              <div style={{ "width": "90%" }}>{data.answerExplanation}</div>
            </div>} </div>;
        } else {
          return <div>{questionsNumber + answersText.join(", ")}</div>;
        }
      //选择
      case 'CHOICE':
        let answerOptions = data.choiceQuestionAnswerInfo.options;
        for (let i in answerOptions) {
          if (answerOptions[i].isAnswer == 'Y') {
            if (where == "online") {
              return (<div>
                <div><span>{questionsNumber + formatMessage({ id: "app.text.da", defaultMessage: "答案" }) + "：" + fromCharCode(Number(i) + 1)}</span> </div>
                {data.answerExplanation && <div className={styles.answerTipsName}>
                  <div className={styles.answerTips}>{formatMessage({ id: "app.question.tips", defaultMessage: "点拨" })}</div>
                  <div className={styles.answerTip2}></div>
                  <div style={{ "width": "90%" }}>{data.answerExplanation}</div>
                </div>}</div>)
            } else {
              return <div><span>{questionsNumber + fromCharCode(Number(i) + 1)}</span> <img src={right_icon} /></div>;
            }
          }
        }

      case 'CLOSED_ORAL':
        let closeOralAnswer = data.closeOralQuestionAnswerInfo;
        keywords = closeOralAnswer.keywords;
        return (
          <div className={styles.marginTop20}>
            {!this.props.report && questionsNumber}
            {closeOralAnswer.referenceAudio && <div className={styles.marginTop10} style={validateStyle}>
              <div className={styles.marginTop10}>{formatMessage(messages.AudioExample)}</div>
              <AutoPlay id={closeOralAnswer.referenceAudio} />
            </div>}
            {closeOralAnswer.referenceAudio && lineJsx}
            {data.answerExplanation && <div className={styles.answerTipsName} style={validateStyle}>
              <div className={styles.answerTips}>{formatMessage({ id: "app.question.tips", defaultMessage: "点拨" })}</div>
              <div className={styles.answerTip2}></div>
              <div style={{ "width": "90%" }}>{data.answerExplanation}</div>
            </div>}
            {data.answerExplanation && lineJsx}
            {modelStatus != "VALIDATE" && !hiddenReferenceByMachine &&
              <div style={validateStyle}>
                <div>
                  {formatMessage(messages.ReferenceByMachine)}
                </div>
                {closeOralAnswer.referenceText}
              </div>
            }

            {modelStatus === "VALIDATE" && this.renderClosedReferenceByMachine(questionsNumber, closeOralAnswer)}

            {modelStatus === "VALIDATE" && this.renderKeywords(keywords)}
          </div>


        );
        return;
      //口语开放
      case 'OPEN_ORAL':
        let OpenAnswer = data.openOralQuestionAnswerInfo;
        let Openanswer1 = OpenAnswer.referenceMachineEvaluation;
        let Openanswer2 = OpenAnswer.referenceAnswer;

        keywords = OpenAnswer.keywords;
        return (
          <div className={styles.marginTop20}>
            <div className={styles.marginTop10} >
              {!this.props.report && questionsNumber}
              <div style={validateStyle}>{formatMessage(messages.ReferenceAnswerlabel)}</div>
              {Openanswer2.map((item, index) => {
                if(index>4)return // 最多显示5个参考答案 
                return (
                  <div className={modelStatus === "VALIDATE" && styles.black} style={validateStyle}>
                    &nbsp;&nbsp;
                      {Number(index) + 1}
                    .&nbsp;
                    {item}
                  </div>
                );
              })}
            </div>
            {lineJsx}
            {data.answerExplanation && <div className={styles.answerTipsName} style={validateStyle}>
              <div className={styles.answerTips}>{formatMessage({ id: "app.question.tips", defaultMessage: "点拨" })}</div>
              <div className={styles.answerTip2}></div>
              <div style={{ "width": "90%", "color": '#333' }}>{data.answerExplanation}</div>
            </div>}
            {data.answerExplanation && lineJsx}
            {!hiddenReferenceByMachine &&
              <div style={validateStyle}>

                {formatMessage(messages.ReferenceByMachine)}

                {Openanswer1.map((item, index) => {
                  return (
                    <div className={modelStatus === "VALIDATE" && styles.black}>
                      &nbsp;&nbsp;
                      {Number(index) + 1}
                      .&nbsp;
                    {item}
                    </div>
                  );
                })}
              </div>}
            {!hiddenReferenceByMachine && lineJsx}

            {modelStatus === "VALIDATE" && this.renderKeywords(keywords)}


          </div>
        );
      //口语半开放
      case 'HALF_OPEN_ORAL':
        let halfOpenAnswer = data.halfOpenOralQuestionAnswerInfo;
        let answer1 = halfOpenAnswer.referenceMachineEvaluation;
        let answer2 = halfOpenAnswer.referenceAnswer;

        let hintReference = halfOpenAnswer.hintReferenceMachineEvaluation;
        let errorReference = halfOpenAnswer.errorReferenceMachineEvaluation;

        keywords = halfOpenAnswer.keywords;


        return (
          <div className={styles.marginTop20}>
            <div>
              {!this.props.report && questionsNumber}
              <div style={validateStyle} >{formatMessage(messages.ReferenceAnswerlabel)}</div>
              {answer2.map((item, index) => {
                if(index>4)return
                return (
                  <div className={modelStatus === "VALIDATE" && styles.black} style={validateStyle}>
                    &nbsp;&nbsp;
                    {Number(index) + 1}
                    .&nbsp;
                    {item}
                  </div>
                );
              })}
            </div>
            {lineJsx}



            {data.answerExplanation && <div className={styles.answerTipsName} style={validateStyle}>
              <div className={styles.answerTips}>{formatMessage({ id: "app.question.tips", defaultMessage: "点拨" })}</div>
              <div className={styles.answerTip2}></div>
              <div style={{ "width": "90%", "color": '#333' }}>{data.answerExplanation}</div>
            </div>}


            {data.answerExplanation && lineJsx}

            {!hiddenReferenceByMachine &&
              <div style={validateStyle} className={styles.marginTop10}>
                <div>
                  {formatMessage(messages.ReferenceByMachine)}
                </div>
                {answer1.map((item, index) => {
                  return (
                    <div className={modelStatus === "VALIDATE" && styles.black}>
                      &nbsp;&nbsp;
                    {Number(index) + 1}
                      .&nbsp;
                    {item}
                    </div>
                  );
                })}
              </div>
            }
            {!hiddenReferenceByMachine && lineJsx}

            {modelStatus === "VALIDATE" && this.renderKeywords(keywords)}

            {hintReference && hintReference.length > 0 &&
              <div className={styles.marginTop10} style={validateStyle}>
                <div><FormattedMessage {...messages.ReferenceAnswerlabelTips} /></div>
                {hintReference.map((item, index) => {
                  return (
                    <div className={modelStatus === "VALIDATE" && styles.black}>
                      &nbsp;&nbsp;
                      {Number(index) + 1}
                      .&nbsp;
                        {item}
                    </div>
                  );
                })}
              </div>
            }

            {hintReference && hintReference.length > 0 && lineJsx}
            {errorReference && errorReference.length > 0 &&
              <div className={styles.marginTop10} style={validateStyle}>
                <div><FormattedMessage {...messages.ReferenceAnswerlabelError} /></div>
                {errorReference.map((item, index) => {
                  return (
                    <div className={modelStatus === "VALIDATE" && styles.black}>
                      &nbsp;&nbsp;
                      {Number(index) + 1}
                      .&nbsp;
                      {item}
                    </div>
                  );
                })}

              </div>
            }
          </div>
        );
    }
  }

  renderKeywords = (keywords) => {
    const { modelStatus } = this.props;
    let keywordsExclude = false;
    let keywordsunExclude = false;
    for (let i in keywords) {
      if (keywords[i].exclude) {
        keywordsunExclude = true;
      }

      if (!keywords[i].exclude) {
        keywordsExclude = true;
      }
    }
    let validateStyle = {};
    validateStyle = {
      "background": "#F5F5F5",
      "padding": "0px 10px"
    }
    let lineJsx = (<div className={styles.lineOutside}>
      <div className={styles.line}></div>
    </div>)

    if(keywords && keywords.every((item)=> item.text === "")){
      return null;
    }
    if (keywords && keywords.length > 0) {
      return <div className={styles.marginTop10} style={validateStyle}>
        {keywordsExclude && <div><FormattedMessage {...messages.keywordsExclude} /></div>}
        {keywords.map((item, index) => {
          if (!item.exclude) {
            return (
              <div className={modelStatus === "VALIDATE" && styles.black}>
                {item.text} &nbsp;&nbsp;
                            <span style={{ color: "#999" }}><FormattedMessage {...messages.weight} />（{item.weight}）</span>
              </div>
            );
          }
        })}
        {keywordsExclude && lineJsx}
        {keywordsunExclude && <div><FormattedMessage {...messages.keywordsunExclude} /></div>}
        {keywords.map((item, index) => {
          if (item.exclude) {
            return (
              <div className={modelStatus === "VALIDATE" && styles.black}>
                {item.text} &nbsp;&nbsp;
                            <span style={{ color: "#999" }}><FormattedMessage {...messages.weight} />（{item.weight}）</span>
              </div>
            );
          }
        })}
        {keywordsunExclude && lineJsx}
      </div>
    }
  }

  renderClosedReferenceByMachine(questionsNumber, closeOralAnswer) {
    let validateStyle = {};
    validateStyle = {
      "background": "#F5F5F5",
      "padding": "0px 10px"
    }
    let lineJsx = (<div className={styles.lineOutside}>
      <div className={styles.line}></div>
    </div>)
    let referenceText = closeOralAnswer.referenceText;
    let referenceTextArr = referenceText.split("");
    let referenceTextCard = [];
    let referenceTextMark = closeOralAnswer.referenceTextMark;
    if (referenceTextMark.length > 0) {
      for (let i in referenceTextArr) {
        let falg = true;
        let word = "";
        for (let j in referenceTextMark) {
          if (Number(i) >= referenceTextMark[j].startIndex && Number(i) <= referenceTextMark[j].endIndex) {
            falg = false;
            if (Number(i) == referenceTextMark[j].endIndex) {
              word = referenceTextMark[j].word
            }
          }
        }
        if (falg) {
          referenceTextCard.push(<span>{referenceTextArr[i]}</span>)
        } else {
          if (word) {
            referenceTextCard.push(<span className={styles.numberDataFocus}>{word}</span>)
          }

        }

      }
    } else {
      referenceTextCard = referenceText;
    }

    return <div style={validateStyle}>

      <div>
        {formatMessage(messages.ReferenceByMachine)}
      </div>
      {referenceTextCard}
      <div style={{ marginTop: "10px" }}>
        {referenceTextMark && referenceTextMark.length!==0 && formatMessage(messages.ReferenceReMark)}
        <div className={styles.remarkList}>
          {referenceTextMark.map((item, index) => {
            return <div className={styles.remarkDetail}><span key={index}>{item.word}&nbsp;&nbsp;>&nbsp;&nbsp;{item.markedWord}</span>
            </div>
          })}
        </div>
      </div>
    </div>
  }

  render() {
    const { dataSource } = this.props;
    const { upLoadSuccess, name, audioUrl, isPlay } = this.state;
    return (
      <div>
        {this.props.report ?
          <div>
            {this.props.online ? <div className={cs(styles.answerContent, 'answerContent')}>
              {this.renderContent(dataSource)}
            </div> :
              <div>
                <div className={styles.up} />
                <div className={styles.answer}>
                  <div className={cs(styles.answerContent, 'answerContent')}>
                    {this.renderContent(dataSource)}
                  </div>
                </div></div>}
          </div>
          : <Modal
            visible={this.state.visible}
            centered={true}
            title={formatMessage(messages.CheckAnswerBtn)}
            closable={false}
            maskClosable={false}
            className={styles.PaperModal}
            destroyOnClose={true}
            footer={
              <button type="button" class="ant-btn ant-btn-primary answerBtn" onClick={this.onHandleOK}>
                <FormattedMessage {...messages.closeBtn} />
              </button>
            }
          >
            <div>{this.renderContent(dataSource)}</div>
          </Modal>}
      </div>
    );
  }
}

export default AnswersModal;
