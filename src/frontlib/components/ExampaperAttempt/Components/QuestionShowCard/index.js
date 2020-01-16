/* eslint-disable eqeqeq */
import React, { PureComponent } from 'react';
import { Radio } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import AutoPlay from '../AutoPlay';
import StemVideo from './StemVideo';
import StemImage from './StemImage';
import SubQuestionAnswerArea from './SubQuestionAnswerArea';
import {
  fromCharCode,
  IsEmpty,
  returnSubIndex,
  CHOICEPICTUREWIDTH,
  CHOICEPICTUREHEIGHT,
  checkTempStr,
} from '@/frontlib/utils/utils';

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
    };
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-26
   * @copyright 刷新paperData
   * @return    {[type]}    [description]
   */
  reLoadPaperData = () => {
    const { self } = this.props;
    self.reLoadPaperData();
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-01
   * @copyright 刷新校验信息
   * @return    {[type]}    [description]
   */
  reLoadVerifiesData = () => {
    const { self } = this.props;
    self.reLoadVerifiesData();
  };

  submitAnswer = () => {
    const { dataSource, type, questionIndex, mainIndex, self } = this.props;
    const mainData = dataSource.data;
    if (type == 'COMPLEX') {
      const groupsItem = mainData.groups[questionIndex].data;
      self.scoringMachine(groupsItem);
    } else {
      let normalIndex = questionIndex;
      if (type == 'NORMAL') {
        normalIndex = {
          mainIndex,
          questionIndex: Number(normalIndex) - 1,
        };
      }
      self.scoringMachine(mainData, normalIndex);
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
  renderAnswer = (displaySize, data, index, i = undefined, allowMultiAnswerMode = 'N') => {
    let { masterData, mainIndex, questionIndex, subIndex, config } = this.props;
    let staticIndex = masterData.recallIndex || masterData.staticIndex;
    let dynamicIndex = masterData.dynamicIndex;
    let mains = masterData.mains;

    let script =
      mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
        masterData.dynamicIndex.scriptIndex
      ];

    let subQuestionIndex = 0;

    let disabled = false;

    if (mains[staticIndex.mainIndex].type == 'NORMAL') {
      questionIndex = questionIndex - 1;
    }

    if (config && config.lockForm == 'Y') {
      if (questionIndex > staticIndex.questionIndex) {
        disabled = true;
      } else if (questionIndex == staticIndex.questionIndex) {
        if (i != undefined) {
          subIndex = Number(returnSubIndex(masterData, questionIndex, i));
        }
        if (allowMultiAnswerMode == 'N') {
          //合并答题不需要计数器
          subQuestionIndex = Number(returnSubIndex(masterData)); //多到小题答题计数器
        }
        if (subIndex > staticIndex.subIndex) {
          disabled = true;
        } else if (subIndex == staticIndex.subIndex) {
          let scripts = mains[staticIndex.mainIndex].questions[questionIndex].scripts;
          disabled = true;

          for (let a = 0; a <= dynamicIndex.scriptIndex; a++) {
            if (scripts[a].stepPhase.indexOf('ANSWER') > -1) {
              if (subQuestionIndex == 0 || isNaN(subQuestionIndex)) {
                disabled = false;
                break;
              } else {
                subQuestionIndex = subQuestionIndex - 1;
              }
            }
          }
        }
      }
    }
    if (script.stepPhase === 'RECALL') {
      disabled = false;
      if (window.ExampaperStatus === 'EXAM') {
        vb.isKeyLocked = 'special';
      }
    }
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
              key={'gapFillingQuestionAnswerInfo' + index}
              allowMultiAnswerMode={allowMultiAnswerMode}
              isDisabled={disabled}
              callback={e => {
                if (masterData.recallIndex) {
                  //是否是回溯状态
                  data.answerValue = e;
                } else {
                  data.gapAnswerValue = e;
                }
                // data.answerValue = e;
                // data.gapAnswerValue = e;
              }}
              callbackBlur={e => {
                if (masterData.recallIndex) {
                  this.submitAnswer();
                }
              }}
            />
          );
        }
        return (
          <SubQuestionAnswerArea
            key={index + data.isRight}
            index={index}
            value={data.answerValue}
            isRight={data.isRight}
            subStyle={this.subStyle}
            isDisabled={disabled}
            allowMultiAnswerMode={allowMultiAnswerMode}
            callback={e => {
              // data.answerValue = e;
              // data.gapAnswerValue = e;
              if (masterData.recallIndex) {
                data.answerValue = e;
              } else {
                data.gapAnswerValue = e;
              }
            }}
            callbackBlur={e => {
              this.submitAnswer();
            }}
          />
        );

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
              <Radio
                value={item.id}
                key={item.id + index}
                className={styles.choosetext}
                style={width}
                disabled={disabled}
              >
                {fromCharCode(index + 1) + '. ' + item.text}
              </Radio>
            );
          } else if (item.image) {
            return (
              <Radio
                value={item.id}
                key={item.id + index}
                className={styles.chooseimage}
                style={width}
                disabled={disabled}
              >
                <div className="stemImageflex">
                  <div>{fromCharCode(index + 1) + '. '}</div>
                  <StemImage
                    id={item.image}
                    className="stemImage"
                    style={displaySize}
                    customStyle={{ padding: '0px 10px', justifyContent: 'flex-start' }}
                  />
                </div>
              </Radio>
            );
          }
        });

        return (
          <RadioGroup
            defaultValue={data.answerId}
            style={{ marginTop: 10 }}
            onChange={e => {
              data.answerId = e.target.value;
              this.submitAnswer();
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
  };

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
        return <SubQuestionAnswerArea index={index + 1} value={item.answerValue} disabled />;
      });
    } else {
      jsx = <SubQuestionAnswerArea index={1} value={data.mainQuestion.answerValue} disabled />;
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
  splitText = value => {
    if (value) {
      const stemText = value.split('\n');
      const jsx = stemText.map(item => {
        return (
          <div className={checkTempStr(value) ? styles.card_content : styles.card_content_normal}>
            {item}
          </div>
        );
      });
      return jsx;
    }
    return null;
  };

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
      num = `${questionCount}. `;
    } else {
      num = '';
    }
    let questionCountFlag = true; // 题号是否已经展示
    for (const i in newData) {
      if (newData[i].components) {
        /*if (newData[i].components && newData[i].components.audioButton) {
          //音频播放图标
          jsx.push(
            <AutoPlay
              id={mainData.mainQuestion[newData[i].components.audioButton]}
              text={mainData.mainQuestion[newData[i].components.textButton]}
              key={'AutoPlay_' + mainData.mainQuestion[newData[i].components.audioButton]}
              focus={focus}
              focusId={this.state.id}
              callback={id => {
                // if(id != mainData.mainQuestion[newData[i].components.audioButton]){
                this.setState({ id: id });
                // }
              }}
            />
          );
        } */

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
        } else if (newData[i].components.name == 'stemImage') {
          if (questionCountFlag) {
            questionCountFlag = false;
            jsx.push(
              <span className={styles.card_content} style={{ marginTop: '10px' }}>
                {num}&nbsp;
              </span>
            );
          }
          // 主题干图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <StemImage
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name]}
                style={newData[i].components.displaySize}
              />
            );
          }
        } else if (newData[i].components.name == 'stemVideo') {
          if (questionCountFlag) {
            questionCountFlag = false;
            jsx.push(
              <span className={styles.card_content} style={{ marginTop: '10px' }}>
                {num}&nbsp;
              </span>
            );
          }
          // 主题干视频
          if (mainData.mainQuestion[newData[i].components.name]) {
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
        } else if (newData[i].components.name == 'stemAudioSpace') {
          if (!mainData.mainQuestion["stemText"] && questionCountFlag) {
            questionCountFlag = false;
            if(num){
              jsx.push(
                <span className={styles.card_content} style={{ marginTop: '10px' }}>
                  {num}&nbsp;
                </span>
              );
            }
          }
          // 展示空白区域，作用是占位。
          // jsx.push(<div className={styles.stemAudioSpace} />);
        } else if (newData[i].components.name == 'guidePrefixText') {
          // 题前指导文本
          jsx.push(
            <div className={styles.card_title}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guideMiddleText') {
          // 中间指导文本
          jsx.push(
            <div className={styles.card_title}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guideSuffixText') {
          // 题后指导文本
          jsx.push(
            <div className={styles.card_title}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guidePrefixImage') {
          // 题前指导图片
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
          // 中间指导图片
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
          // 中间指导图片
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
          // 答案区域 todo...
          jsx.push(
            this.renderAnswer(newData[i].components.displaySize, mainData.mainQuestion, num)
          );
        } else if (newData[i].components.name == 'stemAudio') {
          // 音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示

          let stemAudioFalg = true;
          let stemImageFalg = true;
          let stemVideoFalg = true;

          for (const j in newData) {
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
          // 主题干文本
          // let stemText = mainData.mainQuestion[newData[i].components.name].split('\n');
          let stemText = '';

          if (mainData.mainQuestion[newData[i].components.name]) {
            stemText = mainData.mainQuestion[newData[i].components.name].split('\n');
          } else {
            stemText = [];
          }
          
          // if (
          //   mainData.mainQuestion.answerValue &&
          //   mainData.mainQuestion.answerValue.result.details &&
          //   mainData.mainQuestion.answerValue.result.details[0]
          // ) {
          //   if (stemText.length == 1) {
          //     jsx.push(<span className={styles.card_content}>{num}</span>);
          //   }

          //   let res = mainData.mainQuestion.answerValue.result.details[0].words;
          //   if (res == undefined) {
          //     res = mainData.mainQuestion.answerValue.result.details;
          //     jsx = this.analysis(mainData, res, jsx, newData[i].components.name);
          //   } else {
          //     res = [];
          //     for (let l in mainData.mainQuestion.answerValue.result.details) {
          //       res = res.concat(mainData.mainQuestion.answerValue.result.details[l].words);
          //     }
          //     jsx = this.analysis(mainData, res, jsx, newData[i].components.name);
          //   }
          // } else {
          let speStyles = {};
          if (
            mainData.mainQuestion &&
            mainData.mainQuestion.evaluationEngineInfo &&
            mainData.mainQuestion.evaluationEngineInfo.evaluationEngine === 'eval.word.en'
          ) {
            speStyles = { fontFamily: 'Arial' };
          }
          
          if (stemText.length == 1) {
            // 短文前面空2格
            // const spanJsx = [];
            // const len = stemText[0].split('  ').length - 1;
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
                // 短文前面空2格
                // const spanJsx = [];
                // const len = item.split('  ').length - 1;
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
                    {index === 0 && <span className={styles.card_content}>{questionCountFlag ? num : ''}</span>}
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
          // }
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
  analysis = (mainData, res, jsx, name) => {
    const text = mainData.mainQuestion[name];
    console.log(text);
    const textJsx = [];
    const { rank } = mainData.mainQuestion.answerValue.request;
    for (const m in res) {
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
      } else if (res[m].score == 4) {
        color = 'green';
      } else if (res[m].score == 3) {
        color = 'orange';
      } else if (res[m].score == 2) {
        color = 'blue';
      } else if (res[m].score == 1) {
        color = 'red';
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
          <span className={styles.normal}>
            {text.slice(res[m].endindex + 1, res[Number(m) + 1].beginindex)}
          </span>
        );

        if (text.slice(res[m].endindex + 1, res[Number(m) + 1].beginindex).indexOf('\n') > -1) {
          textJsx.push(<br />);
          const len =
            text.slice(res[m].endindex + 1, res[Number(m) + 1].beginindex).split(' ').length - 1;
          for (let p = 0; p < len; p++) {
            textJsx.push(<span className={styles.card_content}>&nbsp;</span>);
          }
        }
      }
      if (m == res.length - 1 && res[m].endindex != text.length) {
        textJsx.push(
          <span className={styles.normal}>{text.slice(res[m].endindex + 1, text.length)}</span>
        );
      }
    }
    jsx.push(<span className={styles.card_content}>{textJsx}</span>);
    return jsx;
  };

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
    const { staticIndex } = masterData;
    const { mains } = masterData;
    const script =
      mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
        masterData.dynamicIndex.scriptIndex
      ];
    this.subStyle = '';
    let num = '';
    if (showData.structure.flowInfo.allowMultiAnswerMode == 'Y') {
      // 合并答题todo
      const cardJsx = [];
      for (const i in mainData.subQuestion) {
        const subCardJsx = [];
        // num = returnSubIndex(masterData, questionIndex, i) + '. ';
        const Stide = `${returnSubIndex(masterData, questionIndex, i)}`;
        if (Stide.trim() != '') {
          num = `${Stide}. `;
        }
        let questionCountFlag = true; // 题号是否已经展示
        for (const j in newData) {
          if (newData[j]) {
            if (newData[j].subComponents) {
              /* if (newData[j].subComponents.audioButton) {
                subCardJsx.push(
                  <AutoPlay
                    id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                    text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                    focus={focus}
                    focusId={this.state.id}
                    key={
                      'AutoPlay_' + mainData.subQuestion[i][newData[j].subComponents.audioButton]
                    }
                    callback={id => {
                      // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                      this.setState({ id: id });
                      // }
                    }}
                  />
                );
              }*/
              if (newData[j].subComponents.name == 'subQuestionAnswerArea') {
                // 7.3.16   小题答案区域展示
                subCardJsx.push(
                  this.renderAnswer(
                    newData[j].subComponents.displaySize,
                    mainData.subQuestion[i],
                    num,
                    undefined,
                    'Y'
                  )
                );
              } else if (newData[j].subComponents.name == 'subQuestionStemImage') {
                if (questionCountFlag) {
                  questionCountFlag = false;
                  subCardJsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
                }
                // 7.3.14  小题题干图片展示
                if (mainData.subQuestion[i][newData[j].subComponents.name]) {
                  subCardJsx.push(
                    <StemImage
                      id={mainData.subQuestion[i][newData[j].subComponents.name]}
                      style={newData[j].subComponents.displaySize}
                    />
                  );
                }
              } else if (newData[j].subComponents.name == 'subQuestionStemAudio') {
                // 7.3.15  小题题干音频展示
                // 音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示
                let stemAudioFalg = true;
                let stemImageFalg = true;

                for (const m in newData) {
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
                // "subQuestionStemText"
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
      if (mainData.subQuestion[0] && mainData.subQuestion[0].answerType == 'GAP_FILLING') {
        let myStyle = '';
        if (this.subStyle == 'flex') {
          myStyle = styles.flex;
        }
        subJsx.push(
          <div className="backs">
            <div className={styles.tips}>
              {formatMessage({ id: 'app.text.answerarea', defaultMessage: '请在以下区域作答' })}
            </div>
            <div className={myStyle}>{cardJsx}</div>
            {/*<div className={'GAP_FILLING'}>
              <div className={'button submit_GAP_FILLING'} onClick={this.submitAnswer}>
                <span className="icontext">提交本题</span>
              </div>
            </div> */}
            {/* mainData.totalPoints != undefined ? (
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">得分:</span>
                  <span className="icontext receivePoints">
                    {mainData.receivePoints.toFixed(1)}
                  </span>
                  <span className="icontext">/总分:</span>
                  <span className="icontext">{mainData.totalPoints.toFixed(1)}</span>
                </div>
              </div>
            ) : (
              ''
            )*/}
          </div>
        );
      } else {
        let myStyle = '';
        if (this.subStyle == 'flex') {
          myStyle = styles.flex;
        }
        subJsx.push(
          <div className="backs">
            <div className={myStyle}>{cardJsx}</div>
            {/*mainData.totalPoints != undefined ? (
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">得分:</span>
                  <span className="icontext receivePoints">
                    {mainData.receivePoints.toFixed(1)}
                  </span>
                  <span className="icontext">/总分:</span>
                  <span className="icontext">{mainData.totalPoints.toFixed(1)}</span>
                </div>
              </div>
            ) : (
              ''
            ) */}
          </div>
        );
      }
    } else {
      // 非合并答题

      for (const i in mainData.subQuestion) {
        const subCardJsx = [];
        // num = returnSubIndex(masterData, questionIndex, i) + '. ';
        const Stide1 = `${returnSubIndex(masterData, questionIndex, i)}`;
        if (Stide1.trim() != '') {
          num = `${Stide1}. `;
        } else {
          num = '';
        }
        let questionCountFlag = true; // 题号是否已经展示
        for (const j in newData) {
          if (newData[j].subComponents) {
            /*if (newData[j].subComponents.audioButton) {
              subCardJsx.push(
                <AutoPlay
                  id={mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                  text={mainData.subQuestion[i][newData[j].subComponents.textButton]}
                  key={'AutoPlay_' + mainData.subQuestion[i][newData[j].subComponents.audioButton]}
                  focusId={this.state.id}
                  focus={focus}
                  callback={id => {
                    // if(id != mainData.subQuestion[i][newData[j].subComponents.audioButton]){
                    this.setState({ id: id });
                    // }
                  }}
                />
              );
            } */

            if (newData[j].subComponents.name == 'subQuestionAnswerArea') {
              subCardJsx.push(
                this.renderAnswer(
                  newData[j].subComponents.displaySize,
                  mainData.subQuestion[i],
                  num,
                  i
                )
              );
            } else if (newData[j].subComponents.name == 'subQuestionStemImage') {
              if (questionCountFlag) {
                questionCountFlag = false;
                subCardJsx.push(<span className={styles.card_content}>{num}&nbsp;</span>);
              }
              // 7.3.14  小题题干图片展示
              subCardJsx.push(
                <StemImage
                  id={mainData.subQuestion[i][newData[j].subComponents.name]}
                  style={newData[j].subComponents.displaySize}
                />
              );
            } else if (newData[j].subComponents.name == 'subQuestionStemAudio') {
              // 7.3.15  小题题干音频展示
              // 音频图标占位，当题干文本或图片存在时，不用展示；只有在没有题干文本/图片的时候展示
              let stemAudioFalg = true;
              let stemImageFalg = true;

              for (const m in newData) {
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
              // "subQuestionStemText"
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
              subIndex == returnSubIndex(masterData, questionIndex, i) && script.showSubFocus == 'Y'
                ? 'backs'
                : 'nobacks'
            }
            onClick={e => {
              if (window.ExampaperStatus == 'EXAM') {
              }
              // e.stopPropagation();
              // this.props.self.changeleftMeus(
              //   mainIndex,
              //   questionIndex,
              //   returnSubIndex(masterData, questionIndex, i),
              //   type
              // );
            }}
          >
            {subCardJsx}

            {/* mainData.subQuestion[i].totalPoints != undefined ? (
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">得分:</span>
                  <span className="icontext receivePoints">
                    {mainData.subQuestion[i].receivePoints.toFixed(1)}
                  </span>
                  <span className="icontext">/总分:</span>
                  <span className="icontext">{mainData.subQuestion[i].totalPoints.toFixed(1)}</span>
                </div>
              </div>
            ) : (
              ''
            )*/}
          </div>
        );
      }
    }

    return subJsx;
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
    } = this.props;

    // console.log("====题目实体数据===")
    // console.log(dataSource)
    // console.log("====题目展示数据===")
    // console.log(showData)

    /* 题目实体数据*/
    let mainData = {};

    /* 小题目展示数据*/
    let componentsData = [];
    /*子题目展示数据 */
    let subComponentsData = [];

    let componentsConfig = [];
    /*veiwinfo排序数组 */
    const newData = [];
    /* 小题展示*/
    let jsx = [];
    /* 子题展示*/
    let subJsx = [];

    /* 横竖排展示*/
    const subStyle = '';

    mainData = dataSource.data; // 题目实体数据

    /*小题Data */
    let questionIndexData = {};
    const invalidateArr = [];
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
      componentsData = showData.structure.groups[questionIndex].structure.viewInfo.components; // 小题的配置
      subComponentsData = showData.structure.groups[questionIndex].structure.viewInfo.subComponents; // 子题的配置
      componentsConfig = showData.structure.groups;
    } else {
      componentsData = showData.structure.viewInfo.components; // 小题的配置
      subComponentsData = showData.structure.viewInfo.subComponents; // 子题的配置
    }

    /*sort排序components */
    for (const i in componentsData) {
      const index = Number(componentsData[i].orderIndex);
      newData[index] = {};
      newData[index].components = componentsData[i];
    }
    /*sort排序subComponents */
    for (const i in subComponentsData) {
      const index = Number(subComponentsData[i].orderIndex);
      if (newData[index] == undefined) {
        newData[index] = {};
        newData[index].subComponents = subComponentsData[i];
      } else {
        newData[index].subComponents = subComponentsData[i];
      }
    }

    if (type == 'NORMAL') {
      // 普通题型展示
      questionIndexData = mainData;
      jsx = this.mainQuestionItem(newData, mainData, jsx, componentsConfig);
    } else if (type == 'TWO_LEVEL') {
      // 二层题型展示
      questionIndexData = mainData;
      jsx = this.mainQuestionItem(newData, mainData, jsx, componentsConfig);

      subJsx = this.subQuestionItem(showData, newData, mainData, subJsx);
    } else if (type == 'COMPLEX') {
      // 复合题型展示
      const groupsItem = mainData.groups[questionIndex].data;
      questionIndexData = groupsItem;
      // console.log(questionIndex);
      // console.log(groupsItem);
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

    const modelStatus = localStorage.getItem('ExampaperStatus');
    const isExamine = localStorage.getItem('isExamine');
    return (
      <div key="logo" className="questionshow_card">
        {jsx}
        {subJsx}
        {/*questionIndexData.totalPoints != undefined && questionIndexData.patternType == 'NORMAL' ? (
          <div className={'GAP_FILLING'}>
            <div className={styles.scroe}>
              <span className="icontext">得分:</span>
              <span className="icontext receivePoints">
                {questionIndexData.receivePoints.toFixed(1)}
              </span>
              <span className="icontext">/总分:</span>
              <span className="icontext">{questionIndexData.totalPoints.toFixed(1)}</span>
            </div>
          </div>
        ) : (
          ''
        ) */}
        {/* this.renderFooter(questionIndexData, modelStatus, isExamine)*/}
      </div>
    );
  }
}
