import React, { PureComponent } from 'react';
import styles from './index.less';
import AutoPlay from '../AutoPlay';
import IconButton from '@/frontlib/components/IconButton';
import StemImage from './StemImage';
import StemVideo from './StemVideo';
import StemVideoText from './StemVideoText';

import SubQuestionAnswerArea from './SubQuestionAnswerArea';
import AddNewSubjectModal from '../AddSubject/AddNewSubjectModal/api';
import ValidateQuestion from '../ValidateQuestion/api';
import PublishCorrect from '../PublishCorrect/api';
import SubjectTag from '../SubjectTag/api';
import { Radio, message, Drawer } from 'antd';
import {
  fromCharCode,
  IsEmpty,
  returnSubIndex,
  CHOICEPICTUREWIDTH,
  CHOICEPICTUREHEIGHT,
  DoWithNum,
  checkTempStr,
  isNowRecording
} from '@/frontlib/utils/utils';
import { delPaperQuestion } from '@/services/api';
import right_icon from '@/frontlib/assets/qus_right_icon.png';
import wrong_icon from '@/frontlib/assets/qus_wrong_icon.png';
import AnswersModal from '../AnswersModal/api';
import AnalysisModal from '../AnalysisModal/api';
import Analysis from '../AnalysisModal/';
import emitter from '@/utils/ev';

import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';

const messages = defineMessages({
  questionProofread: { id: 'app.question.to.be.proofread', defaultMessage: '待校对' },
  validateFail: { id: 'app.fail.question.proofread', defaultMessage: '不通过' },
  validatePass: { id: 'app.pass.question.proofread', defaultMessage: '通过' },
  validateIgnored: { id: 'app.question.modify.ignored', defaultMessage: '已忽略' },
  validateModified: { id: 'app.question.modified', defaultMessage: '已修正' },
  proofreadBtn: { id: 'app.question.proofread.btn', defaultMessage: '校对' },
  passProofread: { id: 'app.question.pass.proofread', defaultMessage: '校对通过' },
  proofreadFailure: { id: 'app.question.proofread.failure', defaultMessage: '校对不通过' },
  QuestionEditBtn: { id: 'app.question.edit.btn', defaultMessage: '编辑' },
  QuestionDelBtn: { id: 'app.question.del.btn', defaultMessage: '删除' },
  CheckQuestionTagDialogTitle: {
    id: 'app.check.question.tag.dialog.title',
    defaultMessage: '题目标签',
  },
  CheckAnswerBtn: { id: 'app.check.answer.btn', defaultMessage: '答案' },
  ProofreadResultDialogTitle: {
    id: 'app.proofread.result.dialog.title',
    defaultMessage: '校对结果',
  },
  tagBtnTitle: { id: 'app.check.question.tag.btn', defaultMessage: '标签' },
  answerAnalysisBtnTitle: { id: 'app.answer.analysis.btn', defaultMessage: '答案解析' },
});

const RadioGroup = Radio.Group;
/**
 * 题目展示组件
 *
 */

export default class QuestionShowCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      showDetail: false,
    };
    this.falg = false;
  }

  componentDidMount() {
    emitter.addListener('closedModal', x => {
      // 练习其他试卷||结束练习
      const { showDetail } = this.state;
      if (showDetail) {
        this.setState({ showDetail: false });
      }
    });
  }

  componentWillUnmount() {
    // if(emitter){
    //   emitter.removeListeners('closedModal');
    // }
  }
  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-25
   * @copyright 编辑题目
   * @return    {[type]}    [description]
   */
  editQuestion() {
    if(isNowRecording(false)) return;
    const {
      dataSource,
      showData,
      editData,
      masterData,
      paperID,
      questionIndex,
      type,
      questionCount,
      mainIndex,
      subIndex,
    } = this.props;
    AddNewSubjectModal({
      dataSource: {
        title: formatMessage({ id: 'app.text.bjtm', defaultMessage: '编辑题目' }),
        questionData: editData,
        paperID: paperID,
        masterData: masterData,
        patternType: type,
        initData: dataSource, //初始数据
      },
      callback: questioJson => {
        //this.reLoadPaperData();
        this.reLoadVerifiesData();
      },
    });
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-26
   * @copyright 删除题目
   * @return    {[type]}    [description]
   */
  delQuestion() {
    if(isNowRecording(false)) return;
    const { dataSource, paperID } = this.props;
    delPaperQuestion({
      questionId: dataSource.id,
      paperId: paperID,
    }).then(e => {
      if (e) {
        let res = e;
        if (typeof e == 'string') {
          res = JSON.parse(e);
        }
        if (res.responseCode === '200') {
          message.success(
            formatMessage({ id: 'app.text.tmsccg', defaultMessage: '题目删除成功' }) + '！'
          );
          this.reLoadPaperData();
        } else {
          message.error(
            res.data ||
              formatMessage({ id: 'app.text.tmscsb', defaultMessage: '题目删除失败' }) + '！'
          );
        }
      }
    });
  }
  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-26
   * @copyright 刷新paperData
   * @return    {[type]}    [description]
   */
  reLoadPaperData() {
    this.props.self.reLoadPaperData();
  }
  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-01
   * @copyright 刷新校对信息
   * @return    {[type]}    [description]
   */
  reLoadVerifiesData() {
    this.props.self.reLoadVerifiesData();
  }

  submitAnswer = () => {
    const { dataSource, type, questionIndex } = this.props;
    let mainData = dataSource.data;
    if (type == 'COMPLEX') {
      mainData = mainData.groups[questionIndex].data;
    }
    if (mainData.patternType === 'NORMAL') {
      if (mainData.mainQuestion.gapAnswerValue || mainData.mainQuestion.gapAnswerValue === '') {
        mainData.mainQuestion.answerValue = mainData.mainQuestion.gapAnswerValue;
      }
    } else {
      mainData.subQuestion.map((Item, index) => {
        //填空题将临时数据填入到正式字段
        if (Item.gapAnswerValue || Item.gapAnswerValue === '') {
          Item.answerValue = Item.gapAnswerValue;
        }
      });
    }

    this.props.self.scoringMachine(mainData);
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-25
   * @copyright 答题区域渲染
   * @param     {[type]}    data  题目渲染数据
   * @param     {[type]}    index 题序
   * @return    {[type]}          [description]
   */
  renderAnswer(displaySize, data, index, showData = undefined, allowMultiAnswerMode = 'N') {
    switch (data.answerType) {
      case 'GAP_FILLING': //填空题
        if (data.gapFillingQuestionAnswerInfo.gapFloatMode == 'HORIZENTAL') {
          this.subStyle = 'flex';
        }
        if (data.gapFillingQuestionAnswerInfo.gapMode == 'UNIQUE') {
          return (
            <SubQuestionAnswerArea
              key={index + data.isRight}
              index={index}
              subStyle={this.subStyle}
              value={data.answerValue}
              isRight={data.isRight}
              gapMode={true}
              allowMultiAnswerMode={allowMultiAnswerMode}
              changeleftMeus={() => {
                this.props.changeleftMeus();
              }}
              callback={e => {
                // data.answerValue = e;
                data.gapAnswerValue = e;
              }}
              callbackBlur={e => {
                if (showData && showData.structure.flowInfo.allowMultiAnswerMode == 'Y') {
                  //合并答题有提交按钮
                } else {
                  this.submitAnswer();
                }
              }}
            />
          );
        } else {
          return (
            <SubQuestionAnswerArea
              key={index + data.isRight}
              index={index}
              value={data.answerValue}
              isRight={data.isRight}
              subStyle={this.subStyle}
              allowMultiAnswerMode={allowMultiAnswerMode}
              changeleftMeus={() => {
                this.props.changeleftMeus();
              }}
              callback={e => {
                // data.answerValue = e;
                data.gapAnswerValue = e;
              }}
              callbackBlur={e => {
                this.submitAnswer();
              }}
            />
          );
        }
      //选择
      case 'CHOICE':
        let option = data.choiceQuestionAnswerInfo.options;
        if (IsEmpty(option)) {
          return;
        }
        if (Object.prototype.toString.call(displaySize) === '[Object Object]') {
          if (displaySize.width) {
          } else {
            displaySize.width = CHOICEPICTUREWIDTH;
          }
          if (displaySize.height) {
          } else {
            displaySize.height = CHOICEPICTUREHEIGHT;
          }
        } else {
          displaySize = { width: CHOICEPICTUREWIDTH, height: CHOICEPICTUREHEIGHT };
        }

        let width;
        if (data.choiceQuestionAnswerInfo.floatMode == 'VERTICAL') {
          width = { width: '100%' };
        }
        let jsx = option.map((item, index) => {
          if (item.text) {
            return (
              <Radio value={item.id} key={item.id} className={styles.choosetext} style={width}>
                {fromCharCode(index + 1) + '. ' + (item.text + '').trim()}
                &nbsp;&nbsp;&nbsp;
                {data.answerId && data.answerId == item.id && data.isRight && (
                  <img src={right_icon} />
                )}
                {data.answerId && data.answerId == item.id && !data.isRight && (
                  <img src={wrong_icon} />
                )}
              </Radio>
            );
          } else if (item.image) {
            return (
              <Radio value={item.id} key={item.id} className={styles.chooseimage} style={width}>
                <div className="stemImageflex">
                  <div>{fromCharCode(index + 1) + '. '}</div>
                  <StemImage
                    id={item.image}
                    className="stemImage_little"
                    style={displaySize}
                    key={item.image}
                    customStyle={{ padding: '0px 10px', justifyContent: 'flex-start' }}
                  />
                  {data.answerId && data.answerId == item.id && data.isRight && (
                    <img src={right_icon} />
                  )}
                  {data.answerId && data.answerId == item.id && !data.isRight && (
                    <img src={wrong_icon} />
                  )}
                </div>
              </Radio>
            );
          }
        });

        return (
          <RadioGroup
            value={data.answerId}
            style={{ marginTop: 10 }}
            onChange={e => {
              let self = this;
              setTimeout(function() {
                data.answerId = e.target.value;
                self.submitAnswer();
              }, 100);
            }}
          >
            {jsx}
          </RadioGroup>
        );
      //口语封闭
      case 'CLOSED_ORAL':
        return;
      //口语开放
      case 'OPEN_ORAL':
        return;
      //口语半开放
      case 'HALF_OPEN_ORAL':
        return;
    }
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-25
   * @copyright 答按区域
   * @param     {[type]}    data  题目渲染数据
   * @param     {[type]}    index 题序
   * @return    {[type]}          [description]
   */
  renderBeforeAnswer(data) {
    let jsx;
    if (data.patternType == 'TWO_LEVEL') {
      jsx = data.subQuestion.map((item, index) => {
        return <SubQuestionAnswerArea index={index + 1} value={item.answerValue} disabled={true} />;
      });
    } else {
      jsx = (
        <SubQuestionAnswerArea index={1} value={data.mainQuestion.answerValue} disabled={true} />
      );
    }

    return <div style={{ display: 'flex', flexWrap: 'wrap' }}>{jsx}</div>;
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-28
   * @copyright 换行文本
   * @param     {[type]}    value [description]
   * @return    {[type]}          [description]
   */
  splitText(value) {
    if (value) {
      let stemText = value.split('\n');
      let jsx = stemText.map((item, index) => {
        return (
          <div className={checkTempStr(value) ? styles.card_content : styles.card_content_normal}>
            {item}
          </div>
        );
      });
      return jsx;
    }
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-25
   * @copyright 小题主题干部分渲染 包含普通，二层
   * @param     {[type]}    newData  [description]
   * @param     {[type]}    mainData [description]
   * @param     {[type]}    jsx      [description]
   * @return    {[type]}             [description]
   */
  mainQuestionItem(newData, mainData, jsx, componentsConfig = []) {
    const { questionCount, type, focus, dataSource, masterData } = this.props;
    let num = '';
    if (type == 'NORMAL' && questionCount && questionCount.trim() != '') {
      num = questionCount + '. ';
    } else {
      num = '';
    }
    let questionCountFlag = true; //题号是否已经展示
    for (let i in newData) {
      if (newData[i].components) {
        if (newData[i].components && newData[i].components.audioButton) {
          //音频播放图标
          if (
            newData[i].components.audioButton == 'stemAudio' &&
            mainData.mainQuestion['stemAudio2'] != undefined &&
            mainData.mainQuestion['stemAudio2'] != null &&
            mainData.mainQuestion['stemAudio2'] != ''
          ) {
            jsx.push(
              <AutoPlay
                id={mainData.mainQuestion[newData[i].components.audioButton]}
                id2={mainData.mainQuestion['stemAudio2']}
                text={mainData.mainQuestion[newData[i].components.textButton]}
                key={
                  mainData.mainQuestion['stemAudio2']
                    ? 'AutoPlay_' + mainData.mainQuestion['stemAudio2']
                    : 'AutoPlay_' + mainData.mainQuestion[newData[i].components.audioButton]
                }
                focus={focus}
                isQuestionCard={true}
                focusId={this.state.id}
                callback={id => {
                  // if(id != mainData.mainQuestion[newData[i].components.audioButton]){
                  this.setState({ id: id });
                  // }
                }}
              />
            );
          } else {
            if (mainData.mainQuestion[newData[i].components.audioButton]) {
              jsx.push(
                <AutoPlay
                  id={mainData.mainQuestion[newData[i].components.audioButton]}
                  text={mainData.mainQuestion[newData[i].components.textButton]}
                  key={'AutoPlay_' + mainData.mainQuestion[newData[i].components.audioButton]}
                  focus={focus}
                  isQuestionCard={true}
                  focusId={this.state.id}
                  callback={id => {
                    // if(id != mainData.mainQuestion[newData[i].components.audioButton]){
                    this.setState({ id: id });
                    // }
                  }}
                />
              );
            }
          }
        }
        if (newData[i].components.name == 'answerBeforeArea') {
          if (type == 'COMPLEX') {
            if (masterData.staticIndex.questionIndex > 0) {
              for (let a = 0; a < masterData.staticIndex.questionIndex; a++) {
                if (dataSource.data.groups[a].data.mainQuestion.answerType == 'GAP_FILLING') {
                  if (
                    (componentsConfig[a].structure &&
                      componentsConfig[a].structure.viewInfo.showAnswerAfter) == 'Y'
                  ) {
                    jsx.push(this.renderBeforeAnswer(dataSource.data.groups[a].data));
                  }
                }
              }
            }
          }
        } else if (newData[i].components.name == 'stemVideo') {
          //主题干视频
          if (questionCountFlag) {
            questionCountFlag = false;
            jsx.push(
              <span className={styles.card_content} style={{ marginTop: '10px' }}>
                {num}&nbsp;
              </span>
            );
          }
          if (mainData.mainQuestion[newData[i].components.name]) {
            if (
              newData[i].components.textButton === 'stemVideoText' &&
              mainData.mainQuestion[newData[i].components.textButton] != '' &&
              mainData.mainQuestion[newData[i].components.textButton] != null
            ) {
              jsx.push(
                <StemVideoText
                  text={mainData.mainQuestion[newData[i].components.textButton]}
                  key={'AutoPlay_' + mainData.mainQuestion[newData[i].components.textButton]}
                  isQuestionCard={true}
                  style={{ marginTop: '10px' }}
                  callback={id => {}}
                />
              );
            }
            jsx.push(
              <StemVideo
                id={mainData.mainQuestion[newData[i].components.name]}
                key={
                  mainData.mainQuestion[newData[i].components.name] +
                  masterData.staticIndex.questionIndex
                }
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'stemImage') {
          if (questionCountFlag) {
            questionCountFlag = false;
            jsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
          }
          //主题干图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <StemImage
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'stemAudioSpace') {

          if (!mainData.mainQuestion["stemText"] && questionCountFlag) {
            questionCountFlag = false;
            if(num){
              jsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
            }
          }
          //展示空白区域，作用是占位。
          // jsx.push(<div className={styles.stemAudioSpace} />);
        } else if (newData[i].components.name == 'guidePrefixText') {
          //题前指导文本
          jsx.push(
            <div className={styles.card_title}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guideMiddleText') {
          //中间指导文本
          jsx.push(
            <div className={styles.card_title}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guideSuffixText') {
          //题后指导文本
          jsx.push(
            <div className={styles.card_title}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guidePrefixImage') {
          //题前指导图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <StemImage
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'guideMiddleImage') {
          //中间指导图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <StemImage
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'guideSuffixImage') {
          //中间指导图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <StemImage
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'answerArea') {
          //答案区域 todo...
          jsx.push(
            this.renderAnswer(newData[i].components.displaySize, mainData.mainQuestion, num)
          );
        } else if (newData[i].components.name == 'stemAudio') {
          //音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示
          let stemAudioFalg = true;
          let stemImageFalg = true;
          let stemVideoFalg = true;

          for (let j in newData) {
            if (newData[j].components) {
              if (newData[j].components.name == 'stemText') {
                stemAudioFalg = false;
              }
              if (newData[j].components.name == 'stemImage') {
                stemImageFalg = false;
              }

              if (newData[j].components.name == 'stemVideo') {
                stemVideoFalg = false;
              }

              if (
                newData[j].components.name == 'stemText' &&
                (mainData.mainQuestion.stemText == null || mainData.mainQuestion.stemText === '')
              ) {
                stemAudioFalg = true;
              }

              if (
                newData[j].components.name == 'stemImage' &&
                (mainData.mainQuestion.stemImage == null || mainData.mainQuestion.stemImage === '')
              ) {
                stemImageFalg = true;
              }

              if (
                newData[j].components.name == 'stemVideo' &&
                (mainData.mainQuestion.stemVideo == null || mainData.mainQuestion.stemVideo === '')
              ) {
                stemVideoFalg = true;
              }
            }
          }
          if (stemAudioFalg && stemImageFalg && stemVideoFalg) {
            jsx.push(
              <div className="stemAudioTop" style={{ display: 'flex' }}>
                {questionCountFlag && <span className={styles.card_content}>{num}&nbsp;</span>}
                <AutoPlay />
              </div>
            );
            if (questionCountFlag) {
              questionCountFlag = false;
            }
          }
        } else if (newData[i].components.name == 'stemText') {
          //主题干文本
          let stemText = '';

          if (mainData.mainQuestion[newData[i].components.name]) {
            stemText = mainData.mainQuestion[newData[i].components.name].split('\n');
          } else {
            stemText = [];
          }

          // if (
          //   mainData.mainQuestion.answerValue &&
          //   mainData.mainQuestion.answerValue.result &&
          //   mainData.mainQuestion.answerValue.result.details &&
          //   mainData.mainQuestion.answerValue.result.details[0] &&
          //   mainData.mainQuestion.answerType != "HALF_OPEN_ORAL"
          // )
          if (false) {
            if (stemText.length == 1) {
              jsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
            }

            let res = mainData.mainQuestion.answerValue.result.details[0].words;
            if (res == undefined) {
              res = mainData.mainQuestion.answerValue.result.details;
              jsx = this.analysis(mainData, res, jsx, newData[i].components.name);
            } else {
              res = [];
              for (let l in mainData.mainQuestion.answerValue.result.details) {
                res = res.concat(mainData.mainQuestion.answerValue.result.details[l].words);
              }
              jsx = this.analysis(mainData, res, jsx, newData[i].components.name);
            }
          } else {
            let speStyles = {};
            if (
              mainData.mainQuestion &&
              mainData.mainQuestion.evaluationEngineInfo &&
              mainData.mainQuestion.evaluationEngineInfo.evaluationEngine === 'eval.word.en'
            ) {
              speStyles = { fontFamily: 'Arial' };
            }
            if (stemText.length == 1) {
              //短文前面空2格
              // let spanJsx = [];
              // let len = stemText[0].split('  ').length - 1;
              // for (let p = 0; p < len; p++) {
              //   spanJsx.push(<span className={styles.card_content}>&nbsp;&nbsp;</span>);
              // }
              jsx.push(
                <div
                  className={
                    checkTempStr(stemText[0]) ? styles.card_content : styles.card_content_normal
                  }
                  style={speStyles}
                >
                  <span className={styles.card_content}>{questionCountFlag ? num : ''}</span>
                  {/* {spanJsx} */}
                  {stemText[0]}
                </div>
              );
              if (questionCountFlag) {
                questionCountFlag = false;
              }
            } else {
              {
                stemText.map((item, index) => {
                  //短文前面空2格
                  // let spanJsx = [];
                  // let len = item.split('  ').length - 1;
                  // for (let p = 0; p < len; p++) {
                  //   spanJsx.push(
                  //     <span className={styles.card_content}>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                  //   );
                  // }

                  jsx.push(
                    <div
                      className={
                        checkTempStr(mainData.mainQuestion[newData[i].components.name])
                          ? styles.card_content
                          : styles.card_content_normal
                      }
                    >
                      {index === 0 && (
                        <span className={styles.card_content}>{questionCountFlag ? num : ''}</span>
                      )}
                      {/* {spanJsx} */}
                      {item}
                    </div>
                  );
                });
              }
              if (questionCountFlag) {
                questionCountFlag = false;
              }
            }
          }
        }
      }
    }
    return jsx;
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-22
   * @copyright 封闭题型答题后的分析（朗读短文...）
   * @param     {[type]}    mainData [description]
   * @param     {[type]}    res      [description]
   * @param     {[type]}    jsx      [description]
   * @param     {[type]}    name     [description]
   * @return    {[type]}             [description]
   */
  analysis(mainData, res, jsx, name) {
    let text = mainData.mainQuestion[name];
    let referenceTextMark;
    if (mainData.mainQuestion.answerType == 'CLOSED_ORAL') {
      text = mainData.mainQuestion.answerValue.request.reference.answers.text;
      referenceTextMark = mainData.mainQuestion.closeOralQuestionAnswerInfo.referenceTextMark;
    }

    let textJsx = [];
    let rank = 100;
    if (mainData.mainQuestion.answerValue.request) {
      rank = mainData.mainQuestion.answerValue.request.rank;
    } else {
      rank = mainData.mainQuestion.answerValue.params.request.rank;
    }

    let score = 0;
    for (let m in res) {
      let color = '';
      // if (referenceTextMark) { //备注转换
      //   for (let i in referenceTextMark) {
      //     if (res[m].beginindex == referenceTextMark[i].convertStartIndex) {
      //       this.falg = true;
      //     } else if (res[m].endindex == referenceTextMark[i].convertEndIndex) {
      //       this.referenceTextMarkWord = referenceTextMark[i].word;
      //       score = res[m].score;
      //       this.falg = false;

      //     }
      //   }
      // }

      let details = res[m].details;
      for (let i in details) {
        if (rank == 100) {
          if (details[i].score >= 0 && details[i].score <= 54) {
            color = 'red';
          } else if (details[i].score >= 55 && details[i].score <= 69) {
            color = 'blue';
          } else if (details[i].score >= 70 && details[i].score <= 84) {
            color = 'orange';
          } else if (details[i].score >= 85 && details[i].score <= 100) {
            color = 'green';
          }
        } else {
          if (details[i].score == 4) {
            color = 'green';
          } else if (details[i].score == 3) {
            color = 'orange';
          } else if (details[i].score == 2) {
            color = 'blue';
          } else if (details[i].score == 1) {
            color = 'red';
          } else if (details[i].score == 0) {
            color = 'red';
          }
        }
        if (details[i].type == 7) {
          textJsx.push(<span className={styles[color]}>{details[i].text}&nbsp;</span>);
        } else {
          textJsx.push(<span className={styles[color]}>&nbsp;{details[i].text}&nbsp;</span>);
        }
      }

      // if (!this.falg) {

      //   if (m == 0 && res[0].beginindex != 0) {
      //     for (let p = 0; p < res[0].beginindex; p++) {
      //       textJsx.push(<span className={styles.card_content}>&nbsp;</span>);
      //     }
      //   }

      //   if (this.referenceTextMarkWord) {
      //     textJsx.push(
      //       <span className={styles[color]}>{this.referenceTextMarkWord}</span>
      //     );
      //     this.referenceTextMarkWord = "";
      //   } else {
      //     textJsx.push(
      //       <span className={styles[color]}>{text.slice(res[m].beginindex, res[m].endindex + 1)}</span>
      //     );
      //   }

      //   if (res[Number(m) + 1]) {
      //     textJsx.push(
      //       <span className={styles.green}>
      //           {text.slice(res[m].endindex + 1, res[Number(m) + 1].beginindex)}
      //         </span>
      //     );

      //     if (text.slice(res[m].endindex + 1, res[Number(m) + 1].beginindex).indexOf('\n') > -1) {
      //       textJsx.push(<br />);
      //       let len =
      //         text.slice(res[m].endindex + 1, res[Number(m) + 1].beginindex).split(' ').length - 1;
      //       for (let p = 0; p < len; p++) {
      //         textJsx.push(<span className={styles.card_content}>&nbsp;</span>);
      //       }
      //     }
      //   }
      //   if (m == res.length - 1 && res[m].endindex != text.length) {
      //     textJsx.push(
      //       <span className={styles.green}>{text.slice(res[m].endindex + 1, text.length)}</span>
      //     );
      //   }
      // }
    }
    jsx.push(
      <div className={styles.card_content} style={{ display: 'flex', flexWrap: 'wrap' }}>
        {textJsx}
      </div>
    );
    return jsx;
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-25
   * @copyright 子题渲染 二层子题
   * @param     {[type]}    showData [description]
   * @param     {[type]}    newData  [description]
   * @param     {[type]}    mainData [description]
   * @param     {[type]}    subJsx   [description]
   * @return    {[type]}             [description]
   */
  subQuestionItem(showData, newData, mainData, subJsx) {
    const {
      mainIndex,
      questionIndex,
      beforeNum,
      type,
      subIndex,
      dataSource,
      questionCount,
      focus,
      masterData,
    } = this.props;

    this.subStyle = '';
    let num = '';

    if (showData.structure.flowInfo.allowMultiAnswerMode == 'Y') {
      //合并答题todo
      let cardJsx = [];
      for (let i in mainData.subQuestion) {
        let subCardJsx = [];

        let Stide = returnSubIndex(masterData, questionIndex, i) + '';
        if (Stide.trim() != '') {
          num = Stide + '. ';
        }
        let questionCountFlag = true; //题号是否已经展示
        for (let j in newData) {
          if (newData[j]) {
            if (newData[j].subComponents) {
              if (newData[j].subComponents.audioButton) {
                if (
                  newData[j].subComponents.audioButton == 'subQuestionStemAudio' &&
                  mainData.subQuestion[i]['subQuestionStemAudio2'] != undefined &&
                  mainData.subQuestion[i]['subQuestionStemAudio2'] != null
                ) {
                  subCardJsx.push(
                    <AutoPlay
                      id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                      id2={mainData.subQuestion[i]['subQuestionStemAudio2']}
                      text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                      focus={focus}
                      focusId={this.state.id}
                      isQuestionCard={true}
                      key={
                        mainData.subQuestion[i]['subQuestionStemAudio2']
                          ? 'AutoPlay_' + mainData.subQuestion[i]['subQuestionStemAudio2'] + i
                          : 'AutoPlay_' + mainData.subQuestion[i]['subQuestionStemAudio'] + i
                      }
                      callback={id => {
                        // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                        this.setState({ id: id });
                        // }
                      }}
                    />
                  );
                } else {
                  subCardJsx.push(
                    <AutoPlay
                      id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                      text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                      focus={focus}
                      focusId={this.state.id}
                      isQuestionCard={true}
                      key={
                        'AutoPlay_' +
                        mainData.subQuestion[i][newData[j].subComponents.audioButton] +
                        i
                      }
                      callback={id => {
                        // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                        this.setState({ id: id });
                        // }
                      }}
                    />
                  );
                }
              }
              if (newData[j].subComponents.name == 'subQuestionAnswerArea') {
                //7.3.16   小题答案区域展示
                subCardJsx.push(
                  this.renderAnswer(
                    newData[j].subComponents.displaySize,
                    mainData.subQuestion[i],
                    num,
                    showData,
                    'Y'
                  )
                );
              } else if (newData[j].subComponents.name == 'subQuestionStemImage') {
                if (questionCountFlag) {
                  questionCountFlag = false;
                  subCardJsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
                }
                //7.3.14  小题题干图片展示
                if (mainData.subQuestion[i][newData[j].subComponents.name]) {
                  subCardJsx.push(
                    <StemImage
                      id={mainData.subQuestion[i][newData[j].subComponents.name]}
                      style={newData[j].subComponents.displaySize}
                    />
                  );
                }
              } else if (newData[j].subComponents.name == 'subQuestionStemAudio') {
                //7.3.15  小题题干音频展示
                //音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示
                let stemAudioFalg = true;
                let stemImageFalg = true;

                for (let m in newData) {
                  if (newData[m].subComponents) {
                    if (newData[m].subComponents.name == 'subQuestionStemText') {
                      stemAudioFalg = false;
                    }

                    if (newData[m].subComponents.name == 'subQuestionStemImage') {
                      stemImageFalg = false;
                    }

                    if (
                      newData[m].subComponents.name == 'subQuestionStemText' &&
                      (mainData.subQuestion[i].subQuestionStemText == null ||
                        mainData.subQuestion[i].subQuestionStemText === '')
                    ) {
                      stemAudioFalg = true;
                    }

                    if (
                      newData[m].subComponents.name == 'subQuestionStemImage' &&
                      (mainData.subQuestion[i].subQuestionStemImage == null ||
                        mainData.subQuestion[i].subQuestionStemImage === '')
                    ) {
                      stemImageFalg = true;
                    }
                  }
                }
                if (stemAudioFalg && stemImageFalg) {
                  subCardJsx.push(
                    <div className="stemAudioTop" style={{ display: 'flex' }}>
                      {questionCountFlag && (
                        <span className={styles.card_content}>{num}&nbsp;</span>
                      )}
                      <AutoPlay />
                    </div>
                  );
                  if (questionCountFlag) {
                    questionCountFlag = false;
                  }
                }
              } else if (newData[j].subComponents.name == 'subQuestionStemText') {
                //"subQuestionStemText"
                subCardJsx.push(
                  <div className={styles.card_title} style={{ display: 'flex' }}>
                    <div
                      className={styles.card_content}
                      style={
                        checkTempStr(mainData.subQuestion[i][newData[j].subComponents.name])
                          ? { margin: '6px 0px' }
                          : { margin: '0px 0px' }
                      }
                    >
                      {questionCountFlag ? num : ''}&nbsp;
                    </div>
                    <div className={styles.card_content_normal}>
                      {this.splitText(mainData.subQuestion[i][newData[j].subComponents.name])}
                    </div>
                  </div>
                );

                if (questionCountFlag) {
                  questionCountFlag = false;
                }
              }
            }
          }
        }
        cardJsx.push(subCardJsx);
      }
      if (mainData.subQuestion[0].answerType == 'GAP_FILLING') {
        let myStyle = '';
        if (this.subStyle == 'flex') {
          myStyle = styles.flex;
        }
        subJsx.push(
          <div className={'backs'}>
            <div className={styles.tips}>
              {formatMessage({ id: 'app.text.answerarea', defaultMessage: '请在以下区域作答' })}
            </div>
            <div className={myStyle}>{cardJsx}</div>
            <div className={'GAP_FILLING'}>
              <div className={'button submit_GAP_FILLING'} onClick={this.submitAnswer}>
                <span className="icontext" style={{ color: '#fff' }}>
                  {formatMessage({ id: 'app.button.submitquestion', defaultMessage: '提交本题' })}
                </span>
              </div>
            </div>
            {mainData.totalPoints != undefined ? (
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">
                    {formatMessage({ id: 'app.text.df', defaultMessage: '得分' })}:
                  </span>
                  <span className="icontext receivePoints">
                    {DoWithNum(mainData.receivePoints)}
                  </span>
                  <span className="icontext">
                    /
                    {formatMessage({
                      id: 'app.examination.inspect.task.detail.full.mark',
                      defaultMessage: '总分',
                    })}
                    :
                  </span>
                  <span className="icontext">{mainData.totalPoints}</span>
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        );
      } else {
        let myStyle = '';
        if (this.subStyle == 'flex') {
          myStyle = styles.flex;
        }
        subJsx.push(
          <div className={'backs'}>
            <div className={myStyle}>{cardJsx}</div>
            {mainData.totalPoints != undefined ? (
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">
                    {formatMessage({ id: 'app.text.df', defaultMessage: '得分' })}:
                  </span>
                  <span className="icontext receivePoints">
                    {DoWithNum(mainData.receivePoints)}
                  </span>
                  <span className="icontext">
                    /
                    {formatMessage({
                      id: 'app.examination.inspect.task.detail.full.mark',
                      defaultMessage: '总分',
                    })}
                    :
                  </span>
                  <span className="icontext">{mainData.totalPoints}</span>
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        );
      }
    } else {
      //非合并答题

      for (let i in mainData.subQuestion) {
        let subCardJsx = [];
        let Stide1 = returnSubIndex(masterData, questionIndex, i) + '';
        if (Stide1.trim() != '') {
          num = Stide1 + '. ';
        } else {
          num = '';
        }
        let questionCountFlag = true; //题号是否已经展示
        // if (type == 'TWO_LEVEL') {
        //   num = beforeNum + Number(i) + 1 + '. ';
        // } else {
        //   num = Number(i) + 1 + '. ';
        // }
        for (let j in newData) {
          if (newData[j].subComponents) {
            if (newData[j].subComponents.audioButton) {
              if (
                newData[j].subComponents.audioButton == 'subQuestionStemAudio' &&
                mainData.subQuestion[i]['subQuestionStemAudio2'] != undefined &&
                mainData.subQuestion[i]['subQuestionStemAudio2'] != null
              ) {
                subCardJsx.push(
                  <AutoPlay
                    id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                    id2={mainData.subQuestion[i]['subQuestionStemAudio2']}
                    text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                    focus={focus}
                    focusId={this.state.id}
                    key={
                      mainData.subQuestion[i]['subQuestionStemAudio2']
                        ? 'AutoPlay_' + mainData.subQuestion[i]['subQuestionStemAudio2'] + i
                        : 'AutoPlay_' + mainData.subQuestion[i]['subQuestionStemAudio'] + i
                    }
                    isQuestionCard={true}
                    callback={id => {
                      // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                      this.setState({ id: id });
                      // }
                    }}
                  />
                );
              } else {
                subCardJsx.push(
                  <AutoPlay
                    id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                    text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                    key={
                      'AutoPlay_' + mainData.subQuestion[i][newData[j].subComponents.audioButton]
                    }
                    focusId={this.state.id}
                    focus={focus}
                    key={
                      'AutoPlay_' + mainData.subQuestion[i][newData[j].subComponents.audioButton]
                    }
                    isQuestionCard={true}
                    callback={id => {
                      // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                      this.setState({ id: id });
                      // }
                    }}
                  />
                );
              }
            }

            if (newData[j].subComponents.name == 'subQuestionAnswerArea') {
              subCardJsx.push(
                this.renderAnswer(
                  newData[j].subComponents.displaySize,
                  mainData.subQuestion[i],
                  num,
                  showData
                )
              );
            } else if (newData[j].subComponents.name == 'subQuestionStemImage') {
              if (questionCountFlag) {
                questionCountFlag = false;
                subCardJsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
              }
              //7.3.14  小题题干图片展示
              subCardJsx.push(
                <StemImage
                  id={mainData.subQuestion[i][newData[j].subComponents.name]}
                  style={newData[j].subComponents.displaySize}
                />
              );
            } else if (newData[j].subComponents.name == 'subQuestionStemAudio') {
              //7.3.15  小题题干音频展示
              //音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示
              let stemAudioFalg = true;
              let stemImageFalg = true;

              for (let m in newData) {
                if (newData[m].subComponents) {
                  if (newData[m].subComponents.name == 'subQuestionStemText') {
                    stemAudioFalg = false;
                  }

                  if (newData[m].subComponents.name == 'subQuestionStemImage') {
                    stemImageFalg = false;
                  }

                  if (
                    newData[m].subComponents.name == 'subQuestionStemText' &&
                    (mainData.subQuestion[i].subQuestionStemText == null ||
                      mainData.subQuestion[i].subQuestionStemText === '')
                  ) {
                    stemAudioFalg = true;
                  }

                  if (
                    newData[m].subComponents.name == 'subQuestionStemImage' &&
                    (mainData.subQuestion[i].subQuestionStemImage == null ||
                      mainData.subQuestion[i].subQuestionStemImage === '')
                  ) {
                    stemImageFalg = true;
                  }
                }
              }
              if (stemAudioFalg && stemImageFalg) {
                subCardJsx.push(
                  <div className="stemAudioTop" style={{ display: 'flex' }}>
                    {questionCountFlag && <span className={styles.card_content}>{num}&nbsp;</span>}
                    <AutoPlay />
                  </div>
                );
                if (questionCountFlag) {
                  questionCountFlag = false;
                }
              }
            } else if (newData[j].subComponents.name == 'subQuestionStemText') {
              //"subQuestionStemText"

              subCardJsx.push(
                <div className={styles.card_title} style={{ display: 'flex' }}>
                  <div
                    className={styles.card_content}
                    style={
                      checkTempStr(mainData.subQuestion[i][newData[j].subComponents.name])
                        ? { margin: '6px 0px' }
                        : { margin: '0px 0px' }
                    }
                  >
                    {questionCountFlag ? num : ''}&nbsp;
                  </div>
                  <div className={styles.card_content_normal}>
                    {this.splitText(mainData.subQuestion[i][newData[j].subComponents.name])}
                  </div>
                </div>
              );

              if (questionCountFlag) {
                questionCountFlag = false;
              }
            }
          }
        }

        subJsx.push(
          <div
            className={
              subIndex == returnSubIndex(masterData, questionIndex, i) ? 'backs' : 'nobacks'
            }
            onClick={e => {
              e.stopPropagation();
              this.props.self.changeleftMeus(
                mainIndex,
                questionIndex,
                returnSubIndex(masterData, questionIndex, i),
                type
              );
            }}
          >
            {subCardJsx}

            {mainData.subQuestion[i].totalPoints != undefined ? (
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">
                    {formatMessage({ id: 'app.text.df', defaultMessage: '得分' })}:
                  </span>
                  <span className="icontext receivePoints">
                    {DoWithNum(mainData.subQuestion[i].receivePoints)}
                  </span>
                  <span className="icontext">
                    /{formatMessage({ id: 'app.total.proper', defaultMessage: '总分' })}:
                  </span>
                  <span className="icontext">{mainData.subQuestion[i].totalPoints}</span>
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        );
      }
    }

    return subJsx;
  }

  /**
   * @Author    tina
   * @DateTime  2018-11-01
   * @copyright 标签
   * @param     {[type]}    tag [description]
   * @return    {[type]}             [description]
   */
  tagQuestion(e) {
    e.stopPropagation()
    // if(isNowRecording(false)) return;
    const { paperID, dataSource, type, isExamine, ExampaperStatus } = this.props;
    // let isExamine = localStorage.getItem('isExamine');
    // let modelStatus = localStorage.getItem('ExampaperStatus');
    SubjectTag({
      dataSource: {
        title: formatMessage(messages.CheckQuestionTagDialogTitle),
        paperID: paperID,
        checkAbilityValue: dataSource.checkAbilityValue,
        difficultLevelValue: dataSource.difficultLevelValue,
        questionId: dataSource.id,
        type: type,
        status: ExampaperStatus == 'VALIDATE' || isExamine == 1 ? 'SHOW' : '',
      },
      callback: questioJson => {},
    });
  }
  /**
   * @Author    tina
   * @DateTime  2018-11-01
   * @copyright 校对
   * @param     {[type]}    validate [description]
   * @return    {[type]}             [description]
   */
  validateQuestionSubmit() {
    if(isNowRecording(false)) return;
    const { paperID, masterData, dataSource, invalidate, isExamine, ExampaperStatus } = this.props;
    // let isExamine = localStorage.getItem('isExamine');
    let invalidateArr = [];
    if (invalidate && invalidate.mains) {
      invalidate.mains.map(item => {
        if (item && item.verifies) {
          item.verifies.map(vo => {
            if (vo.questionId == dataSource.id) {
              invalidateArr.push(vo);
            }
          });
        }
      });
    }
    ValidateQuestion({
      dataSource: {
        title: '验证',
        paperID: paperID,
        masterData: masterData,
        questionId: dataSource.id,
        invalidate: invalidateArr,
        status: isExamine == 1 && ExampaperStatus !== 'VALIDATE' ? 'SHOW' : '',
      },
      callback: questioJson => {
        this.reLoadVerifiesData();
        //this.reLoadPaperData();
      },
    });
  }
  /**
   * @Author    tina
   * @DateTime  2018-11-06
   * @copyright 修正
   * @param     {[type]}    validate [description]
   * @return    {[type]}             [description]
   */
  publishCorrectSubmit() {
    if(isNowRecording(false)) return;
    // let isExamine = localStorage.getItem('isExamine');
    const { paperID, masterData, dataSource, invalidate, isExamine } = this.props;
    let invalidateArr = [];
    if (invalidate && invalidate.mains) {
      invalidate.mains.map(item => {
        if (item && item.verifies) {
          item.verifies.map(vo => {
            if (vo.questionId == dataSource.id) {
              invalidateArr.push(vo);
            }
          });
        }
      });
    }
    PublishCorrect({
      dataSource: {
        title: formatMessage(messages.ProofreadResultDialogTitle),
        paperID: paperID,
        masterData: masterData,
        questionId: dataSource.id,
        invalidate: invalidateArr,
        status: isExamine == 1 ? 'SHOW' : '',
      },
      callback: questioJson => {
        this.reLoadVerifiesData();
        //this.reLoadPaperData();
      },
    });
  }

  // 开关详情页面
  toggleDetailPage = () => {
    const { showDetail } = this.state;
    this.setState({
      showDetail: !showDetail,
    });
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-05
   * @copyright 底部按钮控制
   * @param     {[type]}    questionIndexData 题目数据
   * @param     {[type]}    modelStatus       页面状态
   * @param     {string}   isExamine         是否查看模式
   * @return    {[type]}                      [description]
   */
  renderFooter(questionIndexData, modelStatus, isExamine) {
    let jsx = [];
    if (questionIndexData.totalPoints != undefined) {
      jsx.push(
        <div
          className={styles.questionbtn}
          onClick={() => {
            if(isNowRecording(false)) return;
            this.setState({ id: -1 });
            emitter.emit('stopPromptSound');
            if (['EXAM', 'AFTERCLASS'].includes(window.ExampaperStatus)) {
              this.setState({ showDetail: true });
            } else {
              AnalysisModal({
                dataSource: questionIndexData,
                masterData: this.props.masterData,
                // callback: (paperHeadName, navTime, state) => {},
              });
            }
          }}
        >
          <IconButton iconName="icon-file" text={formatMessage(messages.answerAnalysisBtnTitle)} />
        </div>
      );

      jsx.push(<div className={styles.addquestion_line} />);
    }
    const { invalidate, dataSource } = this.props;
    let invalidateArr = [];
    if (invalidate && invalidate.mains) {
      invalidate.mains.map(item => {
        if (item && item.verifies) {
          item.verifies.map(vo => {
            if (vo.questionId == dataSource.id) {
              invalidateArr.push(vo);
            }
          });
        }
      });
    }
    if (isExamine == '1') {
      //查看模式
      if (modelStatus == 'EDIT' || modelStatus == 'SHOW') {
        return (
          <div className={styles.addquestion_flex}>
            {jsx}
            <div
              className={styles.questionbtn}
              onClick={(e) => {
                e.stopPropagation();
                let self = this;
                this.setState({ id: -1 });
                setTimeout(function() {
                  AnswersModal({
                    dataSource: questionIndexData,
                    masterData: self.props.masterData,
                    callback: (paperHeadName, navTime, state) => {},
                  });
                }, 100);
              }}
            >
              <IconButton iconName="icon-file" text={formatMessage(messages.CheckAnswerBtn)} />
            </div>
            <div className={styles.addquestion_line} />
            <div className={styles.questionbtn}>
              <IconButton
                iconName="icon-tag"
                text={formatMessage(messages.tagBtnTitle)}
                onClick={this.tagQuestion.bind(this)}
              />
            </div>
          </div>
        );
      } else if (modelStatus == 'VALIDATE' || modelStatus == 'CORRECT') {
        return (
          <div className={styles.addquestion_flex}>
            {jsx}
            <div
              className={styles.questionbtn}
              onClick={(e) => {
                e.stopPropagation();
                let self = this;
                this.setState({ id: -1 });
                setTimeout(function() {
                  AnswersModal({
                    dataSource: questionIndexData,
                    masterData: self.props.masterData,
                    callback: (paperHeadName, navTime, state) => {},
                  });
                }, 300);
              }}
            >
              <IconButton iconName="icon-file" text={formatMessage(messages.CheckAnswerBtn)} />
            </div>
            <div className={styles.addquestion_line} />
            <div className={styles.questionbtn}>
              <IconButton
                iconName="icon-tag"
                text={formatMessage(messages.tagBtnTitle)}
                onClick={this.tagQuestion.bind(this)}
              />
            </div>
            <div className={styles.addquestion_line} />
            <div className={styles.questionbtn}>
              <div>
                <IconButton
                  iconName="icon-serach"
                  text={formatMessage(messages.proofreadBtn)}
                  onClick={this.validateQuestionSubmit.bind(this)}
                  className={styles.validateQuestion}
                />
                <span className={styles.validateStatus}>
                  {invalidateArr.length == 0 && (
                    <span className={styles.statusShow}>
                      {formatMessage(messages.questionProofread)}
                    </span>
                  )}
                  {invalidateArr.length > 0 && invalidateArr[0].verifyStatus == 300 && (
                    <span className={styles.statusOk}>{formatMessage(messages.validatePass)}</span>
                  )}
                  {invalidateArr.length > 0 && invalidateArr[0].verifyStatus == 0 && (
                    <span className={styles.statusNo}>{formatMessage(messages.validateFail)}</span>
                  )}
                  <IconButton iconName="icon-link-arrow" text="" className="validateNext" />
                </span>
              </div>
            </div>
          </div>
        );
      }
    } else {
      //非查看模式

      switch (modelStatus) {
        case 'EDIT':
          return (
            <div className={styles.addquestion_flex}>
              {jsx}
              <div
                className={styles.questionbtn}
                onClick={(e) => {
                  e.stopPropagation();
                  let self = this;
                  this.setState({ id: -1 });
                  setTimeout(function() {
                    AnswersModal({
                      dataSource: questionIndexData,
                      masterData: self.props.masterData,
                      callback: (paperHeadName, navTime, state) => {},
                    });
                  }, 300);
                }}
              >
                <IconButton iconName="icon-file" text={formatMessage(messages.CheckAnswerBtn)} />
              </div>
              <div className={styles.addquestion_line} />
              <div className={styles.questionbtn}>
                <IconButton
                  iconName="icon-edit"
                  text={formatMessage(messages.QuestionEditBtn)}
                  onClick={this.editQuestion.bind(this)}
                />
              </div>
              <div className={styles.addquestion_line} />
              <div className={styles.questionbtn}>
                <IconButton
                  iconName="icon-detele"
                  text={formatMessage(messages.QuestionDelBtn)}
                  onClick={this.delQuestion.bind(this)}
                />
              </div>
            </div>
          );
        case 'VALIDATE':
          return (
            <div className={styles.addquestion_flex}>
              {jsx}
              <div
                className={styles.questionbtn}
                onClick={(e) => {
                  e.stopPropagation();
                  let self = this;
                  this.setState({ id: -1 });
                  setTimeout(function() {
                    AnswersModal({
                      dataSource: questionIndexData,
                      masterData: self.props.masterData,
                      modelStatus: 'VALIDATE',
                      callback: (paperHeadName, navTime, state) => {},
                    });
                  }, 300);
                }}
              >
                <IconButton iconName="icon-file" text={formatMessage(messages.CheckAnswerBtn)} />
              </div>
              <div className={styles.addquestion_line} />
              <div className={styles.questionbtn}>
                <IconButton
                  iconName="icon-tag"
                  text={formatMessage(messages.tagBtnTitle)}
                  onClick={this.tagQuestion.bind(this)}
                />
              </div>
              <div className={styles.addquestion_line} />
              <div className={styles.questionbtn}>
                <div>
                  <IconButton
                    iconName="icon-serach"
                    text={formatMessage(messages.proofreadBtn)}
                    onClick={this.validateQuestionSubmit.bind(this)}
                    className={styles.validateQuestion}
                  />
                  <span className={styles.validateStatus}>
                    {invalidateArr.length == 0 && (
                      <span className={styles.statusShow}>
                        {formatMessage(messages.questionProofread)}
                      </span>
                    )}
                    {invalidateArr.length > 0 && invalidateArr[0].verifyStatus == 300 && (
                      <span className={styles.statusOk}>
                        {formatMessage(messages.validatePass)}
                      </span>
                    )}
                    {invalidateArr.length > 0 && invalidateArr[0].verifyStatus == 100 && (
                      <span className={styles.statusMeger}>
                        {formatMessage(messages.validateIgnored)}
                      </span>
                    )}
                    {invalidateArr.length > 0 &&
                      (invalidateArr[0].verifyStatus == 200 ||
                        invalidateArr[0].verifyStatus == 250) && (
                        <span className={styles.statusMeger}>
                          {formatMessage(messages.validateModified)}
                        </span>
                      )}
                    {invalidateArr.length > 0 && invalidateArr[0].verifyStatus == 0 && (
                      <span className={styles.statusNo}>
                        {formatMessage(messages.validateFail)}
                      </span>
                    )}
                    <IconButton iconName="icon-link-arrow" text="" className="validateNext" />
                  </span>
                </div>
              </div>
            </div>
          );
        case 'CORRECT':
          return (
            <div className={styles.addquestion_flex}>
              {jsx}
              <div
                className={styles.questionbtn}
                onClick={(e) => {
                  e.stopPropagation();
                  let self = this;
                  this.setState({ id: -1 });
                  setTimeout(function() {
                    AnswersModal({
                      dataSource: questionIndexData,
                      masterData: self.props.masterData,
                      callback: (paperHeadName, navTime, state) => {},
                    });
                  }, 300);
                }}
              >
                <IconButton iconName="icon-file" text={formatMessage(messages.CheckAnswerBtn)} />
              </div>
              <div className={styles.addquestion_line} />
              <div className={styles.questionbtn}>
                <IconButton
                  iconName="icon-edit"
                  text={formatMessage(messages.QuestionEditBtn)}
                  onClick={this.editQuestion.bind(this)}
                />
              </div>
              <div className={styles.addquestion_line} />
              <div className={styles.questionbtn}>
                <IconButton
                  iconName="icon-detele"
                  text={formatMessage(messages.QuestionDelBtn)}
                  onClick={this.delQuestion.bind(this)}
                />
              </div>
              <div className={styles.addquestion_line} />
              <div className={styles.questionbtn}>
                {invalidateArr.length > 0 && invalidateArr[0].verifyStatus == 100 && (
                  <span className={styles.statusMeger}>
                    {formatMessage(messages.validateIgnored)}
                  </span>
                )}
                {invalidateArr.length > 0 &&
                  (invalidateArr[0].verifyStatus == 200 ||
                    invalidateArr[0].verifyStatus == 250) && (
                    <span className={styles.statusMeger}>
                      {formatMessage(messages.validateModified)}
                    </span>
                  )}
                {invalidateArr.length > 0 && invalidateArr[0].verifyStatus == 300 && (
                  <span className={styles.statusOk} onClick={this.publishCorrectSubmit.bind(this)}>
                    {formatMessage(messages.passProofread)}
                  </span>
                )}
                {invalidateArr.length > 0 && invalidateArr[0].verifyStatus == 0 && (
                  <IconButton
                    iconName="icon-info-circle"
                    text={formatMessage(messages.proofreadFailure)}
                    onClick={this.publishCorrectSubmit.bind(this)}
                    className="statusNo"
                  />
                )}
              </div>
            </div>
          );
        case 'EXAM':
        case 'AFTERCLASS':
          if (questionIndexData.totalPoints != undefined) {
            return <div className={styles.addquestion_flex}>{jsx}</div>;
          } else {
            return null;
          }
      }
    }
  }

  render() {
    const {
      dataSource,
      showData,
      questionIndex,
      type,
      questionCount,
      mainIndex,
      subIndex,
      beforeNum,
      invalidate,
      masterData,
      isExamine,
      ExampaperStatus,
    } = this.props;

    // console.log('====题目实体数据===');
    // console.log(dataSource);
    // console.log('====题目展示数据===');
    // console.log(showData);
    // console.log('====属性===');
    // console.log(type);
    // console.log('====masterData===');
    // console.log(masterData);
    /*题目实体数据*/
    let mainData = {};

    /*小题目展示数据*/
    let componentsData = [];
    /*子题目展示数据*/
    let subComponentsData = [];

    let componentsConfig = [];
    /*veiwinfo排序数组*/
    let newData = [];
    /*小题展示*/
    let jsx = [];
    /*子题展示*/
    let subJsx = [];

    /*横竖排展示*/
    let subStyle = '';

    mainData = dataSource.data; //题目实体数据

    let transformStyle = {};
    if (this.state.showDetail) {
      transformStyle = {
        transform: 'translateY(0px)',
        transition: 'transform 0.2s ease 0.2s',
      };
    } else {
      transformStyle = {
        transform: 'translateY(900px)',
        transition: 'transform 0.2s ease 0.2s',
      };
    }
    /*小题Data*/
    let questionIndexData = {};
    let invalidateArr = [];
    if (invalidate && invalidate.mains) {
      invalidate.mains.map(item => {
        if (item && item.verifies) {
          item.verifies.map(vo => {
            if (vo.questionId == dataSource.id) {
              invalidateArr.push(vo);
            }
          });
        }
      });
    }
    // console.log('===========')
    // console.log(invalidateArr)
    // console.log('==========')
    if (type == 'COMPLEX') {
      componentsData = showData.structure.groups[questionIndex].structure.viewInfo.components; //小题的配置
      subComponentsData = showData.structure.groups[questionIndex].structure.viewInfo.subComponents; //子题的配置
      componentsConfig = showData.structure.groups;
    } else {
      componentsData = showData.structure.viewInfo.components; //小题的配置
      subComponentsData = showData.structure.viewInfo.subComponents; //子题的配置
    }

    /*sort排序components*/
    for (let i in componentsData) {
      let index = Number(componentsData[i].orderIndex);
      newData[index] = {};
      newData[index].components = componentsData[i];
    }
    /*sort排序subComponents*/
    for (let i in subComponentsData) {
      let index = Number(subComponentsData[i].orderIndex);
      if (newData[index] == undefined) {
        newData[index] = {};
        newData[index].subComponents = subComponentsData[i];
      } else {
        newData[index].subComponents = subComponentsData[i];
      }
    }

    if (type == 'NORMAL') {
      //普通题型展示
      questionIndexData = mainData;
      jsx = this.mainQuestionItem(newData, mainData, jsx, componentsConfig);
    } else if (type == 'TWO_LEVEL') {
      //二层题型展示
      questionIndexData = mainData;
      jsx = this.mainQuestionItem(newData, mainData, jsx, componentsConfig);

      subJsx = this.subQuestionItem(showData, newData, mainData, subJsx);
    } else if (type == 'COMPLEX') {
      //复合题型展示
      let groupsItem = mainData.groups[questionIndex].data;
      questionIndexData = groupsItem;
      if (groupsItem.patternType == 'NORMAL') {
        jsx = this.mainQuestionItem(newData, groupsItem, jsx, componentsConfig);
      } else if (groupsItem.patternType == 'TWO_LEVEL') {
        jsx = this.mainQuestionItem(newData, groupsItem, jsx, componentsConfig);
        subJsx = this.subQuestionItem(
          showData.structure.groups[questionIndex],
          newData,
          groupsItem,
          subJsx
        );
      }
    }

    // let modelStatus = ExampaperStatus;
    // let isExamine = localStorage.getItem('isExamine');
    return (
      <div key="logo">
        {jsx}
        {subJsx}
        {questionIndexData.totalPoints != undefined && questionIndexData.patternType == 'NORMAL' ? (
          <div className={'GAP_FILLING'}>
            <div className={styles.scroe}>
              <span className="icontext">
                {formatMessage({ id: 'app.text.df', defaultMessage: '得分' })}:
              </span>
              <span className="icontext receivePoints">
                {DoWithNum(questionIndexData.receivePoints)}
              </span>
              <span className="icontext">
                /{formatMessage({ id: 'app.total.proper', defaultMessage: '总分' })}:
              </span>
              <span className="icontext">{questionIndexData.totalPoints}</span>
            </div>
          </div>
        ) : (
          ''
        )}
        {this.renderFooter(questionIndexData, ExampaperStatus, isExamine)}
        {['EXAM', 'AFTERCLASS'].includes(window.ExampaperStatus) && (
          <div className={styles.drawer + ' questiondrawers'} style={transformStyle}>
            <div className="close" onClick={this.toggleDetailPage}>
              <i className={'iconfont icon-close'} />
            </div>
            {this.state.showDetail ? (
              <Analysis
                dataSource={questionIndexData}
                masterData={this.props.masterData}
                examReport={true}
                pop={true}
              />
            ) : (
              <div style={{ width: '770px', height: '656px', overflow: 'auto' }} />
            )}
          </div>
        )}
      </div>
    );
  }
}
