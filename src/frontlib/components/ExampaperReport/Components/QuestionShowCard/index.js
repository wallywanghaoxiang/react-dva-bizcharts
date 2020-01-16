/* eslint-disable no-param-reassign */
/* eslint-disable no-empty */
/* eslint-disable default-case */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable react/destructuring-assignment */
import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import styles from './index.less';
import AutoPlay from '@/frontlib/components/ExampaperProduct/Components/AutoPlay';
import IconButton from '@/components/IconButton';
import StemImage from './StemImage';
import SubQuestionAnswerArea from './SubQuestionAnswerArea';
import { Radio, Modal } from 'antd';
import {
  fromCharCode,
  IsEmpty,
  autoCreatePatternInfoText,
  CHOICEPICTUREWIDTH,
  CHOICEPICTUREHEIGHT,
  checkTempStr,
} from '@/frontlib/utils/utils';
import right_icon from '@/frontlib/assets/qus_right_icon.png';
import wrong_icon from '@/frontlib/assets/qus_wrong_icon.png';
import StemVideo from './StemVideo';
import StemVideoText from '@/frontlib/components/ExampaperProduct/Components/QuestionShowCard/StemVideoText';
import AnalysisModal from '@/frontlib/components/ExampaperProduct/Components/AnalysisModal';
import AnswersModal from './AnswersModal';

const { confirm } = Modal;

const messages = defineMessages({
  answerAnalysisBtnTit: { id: 'app.answer.analysis.btn', defaultMessage: '答案解析' },
  scoreLabel: { id: 'app.score.label', defaultMessage: '得分' },
  totalScoreLabel: { id: 'app.total.score.label', defaultMessage: '总分' },
});

const RadioGroup = Radio.Group;
/**
 * 题目展示组件
 * displayMode!="paper_preview" 控制【音频】【原文】两个按钮
 */

// @connect(({ permission }) => ({
//   defaultPermissionList: permission.defaultPermissionList,
// }))
export default class QuestionShowCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // id: '',
      showAnswer: false,
      ischoosed: false,
      showNormalAnswer: false,
    };
    this.subNumber = 1; // 小题数量，用于计算题目总分
  }

  componentWillMount() {
    const { isPapergroupFooter, questionIds, dataSource } = this.props;
    if (isPapergroupFooter) {
      if (questionIds.join(',').includes(dataSource.id)) {
        this.state.ischoosed = true;
      }
    }
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-26
   * @copyright 刷新paperData
   * @return    {[type]}    [description]
   */
  reLoadPaperData = () => {
    this.props.self.reLoadPaperData();
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-01
   * @copyright 刷新校对信息
   * @return    {[type]}    [description]
   */
  reLoadVerifiesData = () => {
    this.props.self.reLoadVerifiesData();
  };

  submitAnswer = () => {
    const { dataSource, type, questionIndex } = this.props;
    const mainData = dataSource.data;
    if (type === 'COMPLEX') {
      const groupsItem = mainData.groups[questionIndex].data;
      this.props.self.scoringMachine(groupsItem);
    } else {
      this.props.self.scoringMachine(mainData);
    }
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-25
   * @copyright 答题区域渲染
   * @param     {[type]}    data  题目渲染数据
   * @param     {[type]}    index 题序
   * @return    {[type]}          [description]
   */
  renderAnswer(displaySize, data, index, allowMultiAnswerMode = 'N') {
    switch (data.answerType) {
      case 'GAP_FILLING': // 填空题
        if (data.gapFillingQuestionAnswerInfo.gapFloatMode == 'HORIZENTAL') {
          this.subStyle = 'flex';
        }
        if (data.gapFillingQuestionAnswerInfo.gapMode == 'UNIQUE') {
          return (
            <SubQuestionAnswerArea
              index={index}
              value={data.answerValue}
              isRight={data.isRight}
              allowMultiAnswerMode={allowMultiAnswerMode}
              callback={e => {
                // data.answerValue = e;
              }}
            />
          );
        }
        return (
          <SubQuestionAnswerArea
            index={index}
            value={data.answerValue}
            isRight={data.isRight}
            allowMultiAnswerMode={allowMultiAnswerMode}
            callback={e => {
              // data.answerValue = e;
            }}
          />
        );

      // 选择
      case 'CHOICE':
        // eslint-disable-next-line no-case-declarations
        const option = data.choiceQuestionAnswerInfo.options;
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
              <Radio
                key={'Radio' + item.id}
                value={item.id}
                key={item.id}
                className={styles.choosetext}
                style={width}
              >
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
              <Radio
                key={'Radio' + item.id}
                value={item.id}
                key={item.id}
                className={styles.chooseimage}
                style={width}
              >
                <div className="stemImageflex2">
                  <div>{fromCharCode(index + 1) + '. '}</div>
                  <StemImage
                    id={item.image}
                    apiUrl={this.props.apiUrl}
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
            defaultValue={data.answerId}
            style={{ marginTop: 10 }}
            onChange={e => {
              // data.answerId = e.target.value;
              // this.submitAnswer();
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
  mainQuestionItem(newData, mainData, jsx) {
    const { mainIndex, type, focus, subStartIndex, displayMode } = this.props;
    // let num = this.getSubNum(subStartIndex)+"";
    // if (type == 'NORMAL' && num && num.trim()!= "") {
    //   num = num + '.';
    // } else {
    //   num = '';
    // }

    let subtitle = this.getSubtitle();
    let questionCountFlag = true; //题号是否已经展示
    jsx.push(<div>{subtitle}</div>);
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
                key={'AutoPlay_' + mainData.mainQuestion[newData[i].components.audioButton]}
                focus={focus}
                focusId={this.props.id}
                callback={id => {
                  // if(id != mainData.mainQuestion[newData[i].components.audioButton]){
                  this.props.self.changeId(id);
                  //this.setState({ id: id });
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
                  focusId={this.props.id}
                  callback={id => {
                    // if(id != mainData.mainQuestion[newData[i].components.audioButton]){
                    this.props.self.changeId(id);
                    //this.setState({ id: id });
                    // }
                  }}
                />
              );
            }
          }
        }

        if (newData[i].components.name == 'stemImage') {
          if (questionCountFlag && type == 'NORMAL') {
            jsx.push(
              <div className={styles.card_content}>
                {this.getSubNum(subStartIndex) ? this.getSubNum(subStartIndex) + '.' : ''}
              </div>
            );
            questionCountFlag = false;
          }
          //主题干图片
          jsx.push(
            <StemImage
              id={mainData.mainQuestion[newData[i].components.name]}
              apiUrl={this.props.apiUrl}
              style={newData[i].components.displaySize}
            />
          );
        } else if (newData[i].components.name == 'stemVideo') {
          //主题干视频
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
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
                focusId={this.props.id}
                callback={id => {
                  this.props.self.changeId(id);
                }}
              />
            );
          }
        } else if (newData[i].components.name == 'stemAudioSpace') {
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
          jsx.push(
            <StemImage
              id={mainData.mainQuestion[newData[i].components.name]}
              apiUrl={this.props.apiUrl}
              key={mainData.mainQuestion[newData[i].components.name]}
              style={newData[i].components.displaySize}
            />
          );
        } else if (newData[i].components.name == 'guideMiddleImage') {
          //中间指导图片
          jsx.push(
            <StemImage
              id={mainData.mainQuestion[newData[i].components.name]}
              apiUrl={this.props.apiUrl}
              key={mainData.mainQuestion[newData[i].components.name]}
              style={newData[i].components.displaySize}
            />
          );
        } else if (newData[i].components.name == 'guideSuffixImage') {
          //中间指导图片
          jsx.push(
            <StemImage
              id={mainData.mainQuestion[newData[i].components.name]}
              apiUrl={this.props.apiUrl}
              key={mainData.mainQuestion[newData[i].components.name]}
              style={newData[i].components.displaySize}
            />
          );
        } else if (newData[i].components.name == 'answerArea') {
          //答案区域 todo...
          jsx.push(
            this.renderAnswer(
              newData[i].components.displaySize,
              mainData.mainQuestion,
              this.getSubNum(subStartIndex)
            )
          );
        } else if (newData[i].components.name == 'stemAudio') {
          //音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示
          let stemAudioFalg = true;
          let stemImageFalg = true;
          for (let j in newData) {
            if (newData[j].components) {
              if (newData[j].components.name == 'stemText') {
                stemAudioFalg = false;
              }
              if (newData[j].components.name == 'stemImage') {
                stemImageFalg = false;
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
            }
          }
          if (stemAudioFalg && stemImageFalg) {
            if (questionCountFlag && type == 'NORMAL') {
              jsx.push(
                <div className={styles.card_content}>
                  {this.getSubNum(subStartIndex) ? this.getSubNum(subStartIndex) + '.' : ''}
                </div>
              );
              questionCountFlag = false;
            }
            jsx.push(<AutoPlay className="stemAudioTop" />);
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
          //   mainData.mainQuestion.answerValue.result.details[0]
          // )
          if (false) {
            if (stemText.length == 1) {
              jsx.push(<span className={styles.card_content} />);
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
            // if (questionCountFlag && type == 'NORMAL' && stemText.length == 0) {
            //   jsx.push(
            //     <div className={styles.card_content}>
            //       {this.getSubNum(subStartIndex) ? this.getSubNum(subStartIndex) + '.' : ''}
            //     </div>
            //   );
            //   questionCountFlag = false;
            // }
            if (stemText.length == 1) {
              //如果没有序号，就不显示点
              jsx.push(
                <div
                  className={
                    checkTempStr(stemText[0]) ? styles.card_content : styles.card_content_normal
                  }
                  style={speStyles}
                >
                  <span className={styles.card_content}>
                    {this.getSubNum(subStartIndex) && type == 'NORMAL'
                      ? this.getSubNum(subStartIndex) + '.'
                      : ''}
                  </span>
                  {stemText[0]}
                </div>
              );
              questionCountFlag = false;
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
                        <span className={styles.card_content}>
                          {questionCountFlag && type == 'NORMAL'
                            ? this.getSubNum(subStartIndex)
                              ? this.getSubNum(subStartIndex) + '.'
                              : ''
                            : ''}
                        </span>
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
    console.log(text);
    let textJsx = [];
    let rank = 100;
    if (mainData.mainQuestion.answerValue.request) {
      rank = mainData.mainQuestion.answerValue.request.rank;
    } else {
      rank = mainData.mainQuestion.answerValue.params.request.rank;
    }
    for (let m in res) {
      let color = '';
      if (rank == 100) {
        if (res[m].score >= 0 && res[m].score <= 54) {
          color = 'red';
        } else if (res[m].score >= 55 && res[m].score <= 69) {
          color = 'blue';
        } else if (res[m].score >= 70 && res[m].score <= 84) {
          color = 'orange';
        } else if (res[m].score >= 85 && res[m].score <= 100) {
          color = 'green';
        }
      } else {
        if (res[m].score == 4) {
          color = 'green';
        } else if (res[m].score == 3) {
          color = 'orange';
        } else if (res[m].score == 2) {
          color = 'blue';
        } else if (res[m].score == 1) {
          color = 'red';
        } else if (res[m].score == 0) {
          color = 'red';
        }
      }

      if (m == 0 && res[0].beginindex != 0) {
        for (let p = 0; p < res[0].beginindex; p++) {
          textJsx.push(<span className={styles.card_content}>&nbsp;</span>);
        }
      }

      textJsx.push(
        <span className={styles[color]}>{text.slice(res[m].beginindex, res[m].endindex + 1)}</span>
      );

      if (res[Number(m) + 1]) {
        textJsx.push(
          <span className={styles.green}>
            {text.slice(res[m].endindex + 1, res[Number(m) + 1].beginindex)}
          </span>
        );

        if (text.slice(res[m].endindex + 1, res[Number(m) + 1].beginindex).indexOf('\n') > -1) {
          textJsx.push(<br />);
          let len =
            text.slice(res[m].endindex + 1, res[Number(m) + 1].beginindex).split(' ').length - 1;
          for (let p = 0; p < len; p++) {
            textJsx.push(<span className={styles.card_content}>&nbsp;</span>);
          }
        }
      }
      if (m == res.length - 1 && res[m].endindex != text.length) {
        textJsx.push(
          <span className={styles.green}>{text.slice(res[m].endindex + 1, text.length)}</span>
        );
      }
    }
    jsx.push(<span className={styles.card_content}>{textJsx}</span>);
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
      subStartIndex,
      noFooter,
      displayMode,
    } = this.props;

    this.subStyle = '';
    this.subNumber = mainData.subQuestion.length;
    if (showData.structure.flowInfo.allowMultiAnswerMode == 'Y') {
      //合并答题todo
      let cardJsx = [];
      for (let i in mainData.subQuestion) {
        let subCardJsx = [];
        let num = this.getSubNum(i);
        //let num =subStartIndex+1+Number(i)
        if (num && num.trim() != '') {
          num = num + '.';
        } else {
          num = '';
        }
        // if (type == 'TWO_LEVEL') {
        //   num = returnSubIndex(masterData,(questionIndex),i) + '. ';
        // } else {
        //   num = returnSubIndex(masterData,(questionIndex),i) + '. ';
        // }
        let questionCountFlag = true;
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
                      focusId={this.props.id}
                      key={
                        'AutoPlay_' + mainData.subQuestion[i][newData[j].subComponents.audioButton]
                      }
                      callback={id => {
                        // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                        this.props.self.changeId(id);
                        //this.setState({ id: id });
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
                      focusId={this.props.id}
                      key={
                        'AutoPlay_' + mainData.subQuestion[i][newData[j].subComponents.audioButton]
                      }
                      callback={id => {
                        // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                        this.props.self.changeId(id);
                        //this.setState({ id: id });
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
                    'Y'
                  )
                );
              } else if (newData[j].subComponents.name == 'subQuestionStemImage') {
                if (questionCountFlag) {
                  questionCountFlag = false;
                  subCardJsx.push(
                    <div className={styles.card_content} style={{ display: 'flex' }}>
                      <div style={{ margin: '6px 0px' }}>{num}</div>
                    </div>
                  );
                }
                //7.3.14  小题题干图片展示
                subCardJsx.push(
                  <StemImage
                    id={mainData.subQuestion[i][newData[j].subComponents.name]}
                    apiUrl={this.props.apiUrl}
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
                  subCardJsx.push(<AutoPlay className="stemAudioTop" />);
                }
              } else if (newData[j].subComponents.name == 'subQuestionStemText') {
                questionCountFlag = false;
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
                      {num}
                    </div>
                    <div className={styles.card_content_normal}>
                      {this.splitText(mainData.subQuestion[i][newData[j].subComponents.name])}
                    </div>
                  </div>
                );
              }
            }
          }
        }
        // if(questionCountFlag){
        //   subCardJsx.push(
        //     <div className={styles.card_content} style={{display:"flex"}}>
        //       <div style={{ margin:"6px 0px"}}>{num}</div>
        //     </div>
        //   );
        // }
        cardJsx.push(subCardJsx);
      }

      if (noFooter) {
        let myStyle = '';
        if (this.subStyle == 'flex') {
          myStyle = styles.flex;
        }
        subJsx.push(
          <div className="backsReport">
            <div className={myStyle}>{cardJsx}</div>
          </div>
        );
      } else {
        if (mainData.subQuestion[0].answerType == 'GAP_FILLING') {
          let myStyle = '';
          if (this.subStyle == 'flex') {
            myStyle = styles.flex;
          }
          subJsx.push(
            <div>
              <div className={myStyle}>{cardJsx}</div>
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">
                    <FormattedMessage {...messages.scoreLabel} />:
                  </span>
                  <span className="icontext receivePoints">
                    {mainData.receivePoints != undefined ? mainData.receivePoints : '0'}
                  </span>
                  <span className="icontext">
                    /<FormattedMessage {...messages.totalScoreLabel} />:
                  </span>
                  <span className="icontext">{this.props.subFallMark}</span>
                </div>
              </div>
            </div>
          );
        } else {
          let myStyle = '';
          if (this.subStyle == 'flex') {
            myStyle = styles.flex;
          }
          subJsx.push(
            <div className={'backsReport'}>
              <div className={myStyle}>{cardJsx}</div>
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">
                    <FormattedMessage {...messages.scoreLabel} />:
                  </span>
                  <span className="icontext receivePoints">
                    {mainData.receivePoints != undefined ? mainData.receivePoints : '0'}
                  </span>
                  <span className="icontext">
                    /<FormattedMessage {...messages.totalScoreLabel} />:
                  </span>
                  <span className="icontext">{this.props.subFallMark * this.subNumber}</span>
                </div>
              </div>
            </div>
          );
        }
      }
    } else {
      //非合并答题

      for (let i in mainData.subQuestion) {
        let subCardJsx = [];
        let num = this.getSubNum(i);
        //let num =subStartIndex+1+Number(i);
        if (num && num.trim() != '') {
          num = num + '.';
        } else {
          num = '';
        }
        // if (type == 'TWO_LEVEL') {
        //   num = beforeNum + Number(i) + 1 + '. ';
        // } else {
        //   num = Number(i) + 1 + '. ';
        // }
        let questionCountFlag = true;
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
                    key={
                      'AutoPlay_' + mainData.subQuestion[i][newData[j].subComponents.audioButton]
                    }
                    focusId={this.props.id}
                    focus={focus}
                    callback={id => {
                      // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                      this.props.self.changeId(id);
                      //this.setState({ id: id });
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
                    focusId={this.props.id}
                    focus={focus}
                    callback={id => {
                      // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                      this.props.self.changeId(id);
                      //this.setState({ id: id });
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
                  num
                )
              );
            } else if (newData[j].subComponents.name == 'subQuestionStemImage') {
              if (questionCountFlag) {
                questionCountFlag = false;
                subCardJsx.push(
                  <div className={styles.card_content} style={{ display: 'flex' }}>
                    <div style={{ margin: '6px 0px' }}>{num}</div>
                  </div>
                );
              }
              //7.3.14  小题题干图片展示
              subCardJsx.push(
                <StemImage
                  id={mainData.subQuestion[i][newData[j].subComponents.name]}
                  apiUrl={this.props.apiUrl}
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
                subCardJsx.push(<AutoPlay className="stemAudioTop" />);
              }
            } else if (newData[j].subComponents.name == 'subQuestionStemText') {
              //"subQuestionStemText"
              questionCountFlag = false;
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
                    {num}
                  </div>
                  <div className={styles.card_content_normal}>
                    {this.splitText(mainData.subQuestion[i][newData[j].subComponents.name])}
                  </div>
                </div>
              );
            }
          }
        }
        if (questionCountFlag) {
          subCardJsx.push(
            <div className={styles.card_content} style={{ display: 'flex' }}>
              <div style={{ margin: '6px 0px' }}>{num}</div>
            </div>
          );
        }
        if (noFooter) {
          subJsx.push(<div className="backsReport">{subCardJsx}</div>);
        } else {
          subJsx.push(
            <div className="nobacks1">
              {subCardJsx}
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">
                    <FormattedMessage {...messages.scoreLabel} />:
                  </span>
                  <span className="icontext receivePoints">
                    {mainData.subQuestion[i].receivePoints != undefined
                      ? mainData.subQuestion[i].receivePoints
                      : '0'}
                  </span>
                  <span className="icontext">
                    /<FormattedMessage {...messages.totalScoreLabel} />:
                  </span>
                  <span className="icontext">{this.props.subFallMark}</span>
                </div>
              </div>
            </div>
          );
        }
      }
    }

    return subJsx;
  }

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
    const { titleData, questionIndex, mainIndex } = this.props;
    let jsx = [];
    let answer = '';
    let type = titleData.questionPatternType;
    let subAnswerIndex = '';
    /*给答案和解析的题号 */
    if (type == 'COMPLEX') {
      subAnswerIndex = titleData.groups[questionIndex].pattern.sequenceNumber[0][0];
    } else {
      subAnswerIndex = titleData.sequenceNumber[questionIndex][0];
    }

    jsx.push(
      <div
        className={styles.questionbtn}
        onClick={() => {
          this.setState({
            showAnswer: !this.state.showAnswer,
          });
        }}
      >
        <IconButton iconName="icon-file" text={formatMessage(messages.answerAnalysisBtnTit)} />
      </div>
    );

    answer = (
      <AnalysisModal
        dataSource={questionIndexData}
        masterData={subAnswerIndex}
        report={true}
        mark={this.props.subFallMark * this.subNumber}
        focusId={this.props.id}
        callback={id => {
          this.props.self.changeId(id);
        }}
      />
    );
    return (
      <div>
        <div className={styles.addquestion_flex}>{jsx}</div>
        <div>{this.state.showAnswer && answer}</div>
      </div>
    );
  }

  getTitle() {
    const { titleData, mainIndex, paperInstance } = this.props;
    let nlist = titleData.mainPatterns.questionPatternInstanceSequence; //序号
    let num = 0;
    let paper = paperInstance;
    for (let i = 0; i < mainIndex; i++) {
      if (paper[i].type != 'PATTERN' && paper[i].type != null) {
        num = num + 1;
      }
    }
    let titlename = titleData.mainPatterns.questionPatternInstanceName
      ? titleData.mainPatterns.questionPatternInstanceName
      : titleData.questionPatternName;

    //为兼容autoCreatePatternInfoText接口制造的数据
    let data = {
      pattern: titleData,
    };
    return (
      <div className="titleInfo">
        <div className="title">{nlist + titlename + autoCreatePatternInfoText(data, false)}</div>
        <div className="titleWords">
          {titleData.mainPatterns.answerGuideText == 'NO_GUIDE'
            ? null
            : titleData.mainPatterns.answerGuideText}
        </div>
        <div className="titleLine myLine" />
      </div>
    );
  }

  getSubtitle() {
    const { titleData, questionIndex, type } = this.props;
    let subtitle = null;
    if (type == 'TWO_LEVEL') {
      subtitle = (
        <div className={styles.subTitle}>
          {titleData.subQuestionPatterns[questionIndex].hintText}
        </div>
      );
    } else if (type == 'COMPLEX') {
      subtitle = (
        <div className={styles.subTitle}>
          {titleData.groups[questionIndex].pattern.mainPatterns.answerGuideText == 'NO_GUIDE'
            ? null
            : titleData.groups[questionIndex].pattern.mainPatterns.answerGuideText}
        </div>
      );
    }
    return subtitle;
  }

  getSubNum(index) {
    const { titleData, questionIndex, type } = this.props;
    let num = null;
    if (type == 'NORMAL') {
      num = titleData.sequenceNumber[index][0];
    }
    if (type == 'TWO_LEVEL') {
      num = titleData.sequenceNumber[questionIndex][index];
    } else if (type == 'COMPLEX') {
      num = titleData.groups[questionIndex].pattern.sequenceNumber[0][index];
    }
    if (num) {
      return num.trim();
    } else {
      return num;
    }
  }

  chooseQuestion = type => {
    console.log('选择组卷', this.props);
    const { defaultPermissionList } = this.props;
    const { selectQuestion } = this.props.self;
    const { dataSource } = this.props;
    if (
      !localStorage.getItem('proVersion') &&
      defaultPermissionList &&
      !defaultPermissionList.V_CUSTOM_PAPER
    ) {
      localStorage.setItem('proVersion', true);
      confirm({
        title: '',
        className: 'alreadyVersion',
        width: 500,
        centered: true,
        content: (
          <div className="infomations">
            <i className="iconfont icon-info" />
            <div className="proVersion">
              当前版本，自由组卷仅开放 <span>模拟体验</span>
            </div>
            <p className="proInfo">如需使用完整功能，请联系经销商升级版本</p>
          </div>
        ),
        okText: formatMessage({
          id: 'app.button.iHaveKnownBeganToExperience',
          defaultMessage: '我已知晓，开始体验',
        }),
        onOk() {},
      });
    }
    if (type === 'add') {
      this.setState({ ischoosed: true });
    } else {
      this.setState({ ischoosed: false });
    }
    if (selectQuestion) {
      selectQuestion(dataSource, type);
    }
  };

  renderPaperFooter(questionIndexData, ishaveFooter) {
    const {
      isPapergroupFooter,
      questionIds,
      dataSource,
      titleData,
      questionIndex,
      mainIndex,
    } = this.props;
    const { ischoosed } = this.state;
    const type = titleData.questionPatternType;
    let subAnswerIndex = '';
    /* 给答案和解析的题号 */
    if (type === 'COMPLEX') {
      subAnswerIndex = titleData.groups[questionIndex].pattern.sequenceNumber[0][0];
    } else {
      subAnswerIndex = titleData.sequenceNumber[questionIndex][0];
    }

    const jsx = <AnswersModal dataSource={questionIndexData} masterData={subAnswerIndex} />;
    if (isPapergroupFooter) {
      if (questionIds.join(',').includes(dataSource.id) || ischoosed) {
        return (
          <div>
            <div className={styles.flex}>
              <div
                className={styles.addquestion_flex}
                onClick={() => {
                  this.setState({
                    showNormalAnswer: !this.state.showNormalAnswer,
                  });
                }}
              >
                <div className={styles.questionbtn}>{'答案'}</div>
              </div>
              <div
                className={styles.addquestion_flex}
                onClick={() => {
                  this.chooseQuestion('del');
                }}
              >
                <div className={styles.questionbtn}>
                  <IconButton iconName="" text={'移除本题'} />
                </div>
              </div>
            </div>
            {this.state.showNormalAnswer && jsx}
          </div>
        );
      }
      return (
        <div>
          <div className={styles.flex}>
            <div
              className={styles.addquestion_flex}
              onClick={() => {
                this.setState({
                  showNormalAnswer: !this.state.showNormalAnswer,
                });
              }}
            >
              <div className={styles.questionbtn}>{'答案'}</div>
            </div>
            <div
              className={styles.addquestion_paper}
              onClick={() => {
                this.chooseQuestion('add');
              }}
            >
              <div className={styles.questionpaper}>{'选题组卷'}</div>
            </div>
          </div>
          {this.state.showNormalAnswer && jsx}
        </div>
      );
    } else {
      if (!ishaveFooter) {
        return (
          <div>
            <div
              className={styles.addquestion_flex}
              onClick={() => {
                this.setState({
                  showNormalAnswer: !this.state.showNormalAnswer,
                });
              }}
            >
              <div className={styles.questionbtn}>{'答案'}</div>
            </div>
            {this.state.showNormalAnswer && jsx}
          </div>
        );
      }
    }
  }

  render() {
    const {
      dataSource,
      showData,
      questionIndex,
      type,
      subStartIndex,
      questionCount,
      mainIndex,
      subIndex,
      beforeNum,
      titleData,
      noFooter,
      isPapergroupFooter,
    } = this.props;
    // console.log("====题目实体数据===")
    // console.log(dataSource)
    console.log('====题目展示数据===');
    console.log(showData);

    //题目标题信息
    let title = this.getTitle();

    /*题目实体数据*/
    let mainData = {};

    /*小题目展示数据*/
    let componentsData = [];
    /*子题目展示数据*/
    let subComponentsData = [];
    /*veiwinfo排序数组*/
    let newData = [];
    /*小题展示*/
    let jsx = [];
    /*子题展示*/
    let subJsx = [];

    /*横竖排展示*/
    let subStyle = '';

    mainData = dataSource.data; //题目实体数据

    /*小题Data*/
    let questionIndexData = {};

    if (type == 'COMPLEX') {
      console.log('last showdata');
      console.log(showData);
      componentsData = showData.structure.groups[questionIndex].structure.viewInfo.components; //小题的配置
      subComponentsData = showData.structure.groups[questionIndex].structure.viewInfo.subComponents; //子题的配置
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
      jsx = this.mainQuestionItem(newData, mainData, jsx);
    } else if (type == 'TWO_LEVEL') {
      //二层题型展示
      questionIndexData = mainData;
      jsx = this.mainQuestionItem(newData, mainData, jsx);

      subJsx = this.subQuestionItem(showData, newData, mainData, subJsx);
    } else if (type == 'COMPLEX') {
      //复合题型展示
      let groupsItem = mainData.groups[questionIndex].data;
      questionIndexData = groupsItem;
      console.log(questionIndex);
      console.log(groupsItem);
      if (groupsItem.patternType == 'NORMAL') {
        jsx = this.mainQuestionItem(newData, groupsItem, jsx);
      } else if (groupsItem.patternType == 'TWO_LEVEL') {
        jsx = this.mainQuestionItem(newData, groupsItem, jsx);
        subJsx = this.subQuestionItem(
          showData.structure.groups[questionIndex],
          newData,
          groupsItem,
          subJsx
        );
      }
    }

    let modelStatus = localStorage.getItem('ExampaperStatus');
    let isExamine = localStorage.getItem('isExamine');

    let ishaveFooter = true;
    if (noFooter) {
      ishaveFooter = false;
    }
    return (
      <div>
        <div className={styles.card_detail} key="logo">
          {subStartIndex > 0 ? null : title}
          {jsx}
          {subJsx}
          {questionIndexData.patternType == 'NORMAL' && ishaveFooter ? (
            <div className={'GAP_FILLING'}>
              <div className={styles.scroe}>
                <span className="icontext">
                  <FormattedMessage {...messages.scoreLabel} />:
                </span>
                <span className="icontext receivePoints">
                  {questionIndexData.receivePoints != undefined
                    ? questionIndexData.receivePoints
                    : '0'}
                </span>
                <span className="icontext">
                  /<FormattedMessage {...messages.totalScoreLabel} />:
                </span>
                <span className="icontext">{this.props.subFallMark}</span>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
        {ishaveFooter && this.renderFooter(questionIndexData, modelStatus, isExamine)}

        {this.renderPaperFooter(questionIndexData, ishaveFooter)}
      </div>
    );
  }
}
