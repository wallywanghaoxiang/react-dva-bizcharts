import React, { PureComponent } from 'react';
import styles from './index.less';
import AutoPlay from '@/frontlib/components/ExampaperProduct/Components/AutoPlay';
import IconButton from '@/components/IconButton';
import StemImage from './StemImage';
import SubQuestionAnswerArea from './SubQuestionAnswerArea';
import { Radio, message } from 'antd';
import {
  calculatScore,
  scoringMachine,
  fromCharCode,
  IsEmpty,
  toChinesNum,
  autoCreatePatternInfoText,
  CHOICEPICTUREWIDTH,
  CHOICEPICTUREHEIGHT,
} from '@/frontlib/utils/utils';
import { SectionToChinese } from '@/utils/utils';
import right_icon from '@/frontlib/assets/qus_right_icon.png';
import wrong_icon from '@/frontlib/assets/qus_wrong_icon.png';
import { DoWithNum, GetLevel, IfLevel } from '@/frontlib/utils/utils';
//import AnalysisModal from '../AnalysisModal';
import { connect } from 'dva';
import AnswersModal from '@/frontlib/components/ExampaperProduct/Components/AnswersModal';
import AnalysisModal from '@/frontlib/components/ExampaperProduct/Components/AnalysisModal';
import HideAnalysisModal from '../../../HideAnalysisModal';

import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import BarChart from '../../BarChart';
import ShowRightNumber from '../../BarChart/ShowRightNumber';
import Item from 'antd/lib/list/Item';
import StemVideo from '@/frontlib/components/ExampaperReport/Components/QuestionShowCard/StemVideo';
import StemVideoText from '@/frontlib/components/ExampaperProduct/Components/QuestionShowCard/StemVideoText';
const messages = defineMessages({
  answerAnalysisBtnTit: { id: 'app.answer.analysis.btn', defaultMessage: '答案解析' },
  scoreLabel: { id: 'app.score.label', defaultMessage: '得分' },
  totalScoreLabel: { id: 'app.total.score.label', defaultMessage: '总分' },
});

const RadioGroup = Radio.Group;
/**
 * 题目展示组件
 *
 */
@connect(({ report }) => ({
  studentAnswer: report.studentAnswer,
}))
class QuestionShowCard extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      //id: '',
      showAnswer: false,
    };
    this.numberSub = 1; //小题的数量，用于计算总分
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
   * @param {number} analysisPromission 是否有查看答案解析权限（有权限全部显示，没有权限仅显示前两个）
   */
  reLoadVerifiesData() {
    this.props.self.reLoadVerifiesData();
  }

  submitAnswer = () => {
    const { dataSource, type, questionIndex } = this.props;
    let mainData = dataSource.data;
    if (type == 'COMPLEX') {
      let groupsItem = mainData.groups[questionIndex].data;
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
  renderAnswer(displaySize, data, index) {
    const { mainIndex, questionIndex } = this.props;
    switch (data.answerType) {
      case 'GAP_FILLING': //填空题
        if (data.gapFillingQuestionAnswerInfo.gapFloatMode == 'HORIZENTAL') {
          this.subStyle = 'flex';
        }
        if (data.gapFillingQuestionAnswerInfo.gapMode == 'UNIQUE') {
          let tempindex;
          if (typeof index === 'string') {
            tempindex = index.replace('.', '').trim(); //删除点和空格
          } else if (typeof index === 'object' && index.length > 0) {
            tempindex = index[0];
          }

          return (
            <SubQuestionAnswerArea
              link={String(mainIndex) + '-' + String(questionIndex) + '-'}
              type={this.getType()}
              index={tempindex}
              subStyle={this.subStyle}
              value={data.answerValue}
              isRight={data.isRight}
              callback={e => {
                //data.answerValue = e;
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
              <Radio
                key={'Radio' + item.id}
                value={item.id}
                key={item.id}
                className={styles.choosetext}
                style={width}
              >
                {fromCharCode(index + 1) + '. ' + item.text.trim()}
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
          <div key={'div' + index} className={styles.card_content}>
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
   * id 普通题型的题目ID
   */
  mainQuestionItem(newData, mainData, jsx, id) {
    const { mainIndex, titleData, type, focus, subStartIndex, questionIndex } = this.props;

    //let num = toChinesNum(mainIndex + 1);
    let subtitle = this.getSubtitle();
    jsx.push(<div>{subtitle}</div>);
    let questionCountFlag = true; //题号是否已经展示
    for (let i in newData) {
      if (newData[i].components) {
        if (newData[i].components && newData[i].components.audioButton) {
          //音频播放图标
          if (
            newData[i].components.audioButton == 'stemAudio' &&
            mainData.mainQuestion['stemAudio2'] != undefined &&
            mainData.mainQuestion['stemAudio2'] != null
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
        if (newData[i].components.name == 'stemVideo') {
          //主题干视频
          if (mainData.mainQuestion[newData[i].components.name]) {
            if (
              newData[i].components.textButton === 'stemVideoText' &&
              mainData.mainQuestion[newData[i].components.textButton] != '' &&
              mainData.mainQuestion[newData[i].components.textButton] != null
            ) {
              jsx.push(
                <div
                  id={
                    String(mainIndex) +
                    '-' +
                    String(questionIndex) +
                    '-' +
                    String(this.getSubNum(subStartIndex)) +
                    '-' +
                    this.getType()
                  }
                >
                  <StemVideoText
                    text={mainData.mainQuestion[newData[i].components.textButton]}
                    key={'AutoPlay_' + mainData.mainQuestion[newData[i].components.textButton]}
                    isQuestionCard={true}
                    style={{ marginTop: '10px' }}
                    callback={id => {}}
                  />
                </div>
              );
            }
            jsx.push(
              <StemVideo
                id={mainData.mainQuestion[newData[i].components.name]}
                key={mainData.mainQuestion[newData[i].components.name] + i}
                style={newData[i].components.displaySize}
                callback={id => {
                  this.props.self.changeId(id);
                }}
              />
            );
          }
        } else if (newData[i].components.name == 'stemImage') {
          //主题干图片
          if (mainData.mainQuestion[newData[i].components.name]) {
            jsx.push(
              <div
                id={
                  String(mainIndex) +
                  '-' +
                  String(questionIndex) +
                  '-' +
                  String(this.getSubNum(subStartIndex)) +
                  '-' +
                  this.getType()
                }
              >
                {/* <a>{'6link' + String(mainIndex)+"-"+ String(questionIndex)+"-"+ String(this.getSubNum(subStartIndex))+"-"+this.getType()}</a> */}
                <StemImage
                  id={mainData.mainQuestion[newData[i].components.name]}
                  key={mainData.mainQuestion[newData[i].components.name]}
                  style={newData[i].components.displaySize}
                />
              </div>
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
            <div
              className={styles.card_content}
              id={
                String(mainIndex) +
                '-' +
                String(questionIndex) +
                '-' +
                String(this.getSubNum(subStartIndex)) +
                '-' +
                this.getType()
              }
            >
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guideSuffixText') {
          //题后指导文本
          jsx.push(
            <div className={styles.card_content}>
              {this.splitText(mainData.mainQuestion[newData[i].components.name])}
            </div>
          );
        } else if (newData[i].components.name == 'guidePrefixImage') {
          //题前指导图片
          jsx.push(
            <StemImage
              id={mainData.mainQuestion[newData[i].components.name]}
              key={mainData.mainQuestion[newData[i].components.name]}
              style={newData[i].components.displaySize}
            />
          );
        } else if (newData[i].components.name == 'guideMiddleImage') {
          //中间指导图片
          jsx.push(
            <StemImage
              id={mainData.mainQuestion[newData[i].components.name]}
              key={mainData.mainQuestion[newData[i].components.name]}
              style={newData[i].components.displaySize}
            />
          );
        } else if (newData[i].components.name == 'guideSuffixImage') {
          //中间指导图片
          jsx.push(
            <StemImage
              id={mainData.mainQuestion[newData[i].components.name]}
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
          let stemAudioFalg = false; //不显示音频占位符
          for (let j in newData) {
            if (newData[j].components) {
              if (
                newData[j].components.name == 'stemImage' ||
                newData[j].components.name == 'stemText'
              ) {
                stemAudioFalg = false;
              }
            }
          }
          if (stemAudioFalg) {
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
            if (stemText.length == 1) {
              jsx.push(
                <div
                  id={
                    String(mainIndex) +
                    '-' +
                    String(questionIndex) +
                    '-' +
                    String(this.getSubNum(subStartIndex)) +
                    '-' +
                    this.getType()
                  }
                  className={styles.card_content}
                >
                  {/* <a>{'7link' + String(mainIndex)+"-"+ String(questionIndex)+"-"+ String(this.getSubNum(subStartIndex))+"-"+this.getType()}</a> */}
                  {this.getSubNum(subStartIndex) == ' ' ? '' : this.getSubNum(subStartIndex) + '.'}
                  {stemText[0]}
                </div>
              );
            } else {
              {
                stemText.map((item, index) => {
                  //短文前面空2格
                  let spanJsx = [];
                  let len = item.split('  ').length - 1;
                  for (let p = 0; p < len; p++) {
                    spanJsx.push(
                      <span key={'span' + p} className={styles.card_content}>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                      </span>
                    );
                  }
                  jsx.push(
                    <div
                      key={'div1' + index}
                      className={styles.card_content}
                      id={
                        String(mainIndex) +
                        '-' +
                        String(questionIndex) +
                        '-' +
                        String(this.getSubNum(subStartIndex)) +
                        '-' +
                        this.getType()
                      }
                    >
                      {/*<div id={'link' + String(mainIndex) + String(questionIndex) + '0'} className={styles.card_content}>
                     <a>{'8link' + String(mainIndex) + String(questionIndex) + '0'}</a> */}
                      {spanJsx}
                      {item}
                    </div>
                  );
                });
              }
            }
          }
        }
      }
    }
    if (mainData.patternType == 'NORMAL') {
      jsx.push(
        <div>
          {this.props.role && this.renderFooter(mainData)}
          <BarChart
            role={this.props.role}
            subId={this.getSubId(mainData, undefined, id)}
            taskId={this.props.taskId}
            paperId={this.props.paperId}
            classId={this.props.classId}
            teacherPaperInfo={this.props.teacherPaperInfo}
            setRate={this.props.setRate}
          />
        </div>
      );
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
      classNum,
    } = this.props;

    this.subStyle = '';
    let ShowRightNumberSource = [];
    if (showData.structure.flowInfo.allowMultiAnswerMode == 'Y') {
      //合并答题todo
      let cardJsx = [];
      let subNum = mainData.subQuestion.length;
      let addBarChart = [];
      let isGAP_FILLING = true;
      for (let i in mainData.subQuestion) {
        let subCardJsx = [];
        let num = this.getSubNum(i);
        //let num =subStartIndex+1+Number(i)
        num = num + '. ';
        // if (type == 'TWO_LEVEL') {
        //   num = returnSubIndex(masterData,(questionIndex),i) + '. ';
        // } else {
        //   num = returnSubIndex(masterData,(questionIndex),i) + '. ';
        // }

        ShowRightNumberSource.push({
          data: this.findAnswer(this.getSubId(mainData, Number(i)).id),
          num: this.getSubNum(i),
        });
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
                    num
                  )
                );
              } else if (newData[j].subComponents.name == 'subQuestionStemImage') {
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
                let stemAudioFalg = false; //不显示音频占位符
                for (let m in newData) {
                  if (newData[m].subComponents) {
                    if (
                      newData[m].subComponents.name == 'subQuestionStemImage' ||
                      newData[m].subComponents.name == 'subQuestionStemText'
                    ) {
                      stemAudioFalg = false;
                    }
                  }
                }
                if (stemAudioFalg) {
                  subCardJsx.push(<AutoPlay className="stemAudioTop" />);
                }
              } else if (newData[j].subComponents.name == 'subQuestionStemText') {
                //"subQuestionStemText"
                subCardJsx.push(
                  <div
                    key={'subQuestionStemText' + i}
                    className={styles.card_content}
                    style={{ display: 'flex' }}
                  >
                    <div
                      id={
                        String(mainIndex) +
                        '-' +
                        String(questionIndex) +
                        '-' +
                        String(this.getSubNum(i)) +
                        '-' +
                        this.getType()
                      }
                      style={{ margin: '6px 0px' }}
                    >
                      {num}
                      {/* <a>{'1link' +String(mainIndex)+"-"+ String(questionIndex)+"-"+ String(this.getSubNum(i))+"-"+this.getType()}</a>*/}
                    </div>
                    <div style={{ width: '100%' }}>
                      {this.splitText(mainData.subQuestion[i][newData[j].subComponents.name])}
                    </div>
                  </div>
                );
              }
            }
          }
        }
        addBarChart.push(
          <div>
            {this.props.role && this.renderFooter(mainData, i)}
            <BarChart
              key={'BarChart' + i}
              role={this.props.role}
              subId={this.getSubId(mainData, i)}
              taskId={this.props.taskId}
              paperId={this.props.paperId}
              teacherPaperInfo={this.props.teacherPaperInfo}
              classId={this.props.classId}
            />
          </div>
        );
        cardJsx.push(subCardJsx);
        if (mainData.subQuestion[i].answerType != 'GAP_FILLING') {
          cardJsx.push(addBarChart);
          addBarChart = [];
          isGAP_FILLING = false;
        }
      }

      if (mainData.subQuestion[0].answerType == 'GAP_FILLING') {
        let myStyle = '';
        if (this.subStyle == 'flex') {
          myStyle = styles.flex;
        }
        subJsx.push(
          <div>
            <div id={'link' + String(mainIndex) + String(questionIndex) + '0'} className={myStyle}>
              {cardJsx}
            </div>
            {/* 填空题最后显示答案解析 */}
            {isGAP_FILLING && addBarChart}
            {!this.props.role && (
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
                <br />
              </div>
            )}
            {/* {!this.props.role&&<div className={'GAP_FILLING'}>
             <ShowRightNumber dataSource={ShowRightNumberSource} exercise={this.props.exercise} twoLevel={true} classNum={classNum}/>
            </div>}  UI修改，学生报告不需要展示班级正确人数*/}
          </div>
        );
      } else {
        let myStyle = '';
        if (this.subStyle == 'flex') {
          myStyle = styles.flex;
        }
        subJsx.push(
          <div
            id={
              String(mainIndex) +
              '-' +
              String(questionIndex) +
              '-' +
              String(1) +
              '-' +
              this.getType()
            }
            className={'backsReport'}
          >
            {/* <a>{'3link' + String(mainIndex)+"-"+ String(questionIndex)+"-"+ String(1)+"-"+this.getType()}</a> */}
            <div className={myStyle}>{cardJsx}</div>
            {!this.props.role && (
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">
                    <FormattedMessage {...messages.scoreLabel} />:
                  </span>
                  <span className="icontext receivePoints">
                    {!this.props.role && mainData.receivePoints != undefined
                      ? mainData.receivePoints
                      : '0'}
                  </span>
                  <span className="icontext">
                    /<FormattedMessage {...messages.totalScoreLabel} />:
                  </span>
                  <span className="icontext">{this.props.subFallMark * subNum}</span>
                </div>
              </div>
            )}
            {/* {!this.props.role&&<div className={'GAP_FILLING'}>
             <ShowRightNumber dataSource={ShowRightNumberSource} exercise={this.props.exercise} twoLevel={true} classNum={classNum}/>
            </div>}  UI修改，学生报告不需要展示班级正确人数*/}
          </div>
        );
      }
    } else {
      //非合并答题

      for (let i in mainData.subQuestion) {
        let subCardJsx = [];
        let num = this.getSubNum(i);
        //let num =subStartIndex+1+Number(i);
        num = num + '. ';
        // if (type == 'TWO_LEVEL') {
        //   num = beforeNum + Number(i) + 1 + '. ';
        // } else {
        //   num = Number(i) + 1 + '. ';
        // }

        ShowRightNumberSource.push({
          data: this.findAnswer(this.getSubId(mainData, Number(i)).id),
          num: this.getSubNum(i),
        });
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
              let stemAudioFalg = false; //不显示音频占位符
              for (let m in newData) {
                if (newData[m].subComponents) {
                  if (
                    newData[m].subComponents.name == 'subQuestionStemImage' ||
                    newData[m].subComponents.name == 'subQuestionStemText'
                  ) {
                    stemAudioFalg = false;
                  }
                }
              }
              if (stemAudioFalg) {
                subCardJsx.push(<AutoPlay className="stemAudioTop" />);
              }
            } else if (newData[j].subComponents.name == 'subQuestionStemText') {
              //"subQuestionStemText"

              subCardJsx.push(
                <div
                  key={j + 'subQuestionStemText'}
                  className={styles.card_content}
                  style={{ display: 'flex' }}
                >
                  <div style={{ margin: '6px 0px' }}>{num}</div>
                  <div style={{ width: '100%' }}>
                    {this.splitText(mainData.subQuestion[i][newData[j].subComponents.name])}
                  </div>
                </div>
              );
            }
          }
        }
        subCardJsx.push(
          <div>
            {this.props.role && this.renderFooter(mainData, Number(i))}
            <BarChart
              key={'BarChart' + i}
              role={this.props.role}
              subId={this.getSubId(mainData, Number(i))}
              taskId={this.props.taskId}
              paperId={this.props.paperId}
              classId={this.props.classId}
              teacherPaperInfo={this.props.teacherPaperInfo}
              setRate={this.props.setRate}
            />
          </div>
        );
        subJsx.push(
          <div
            id={
              String(mainIndex) +
              '-' +
              String(questionIndex) +
              '-' +
              String(this.getSubNum(i)) +
              '-' +
              this.getType()
            }
            className="nobacks"
          >
            {/* <a>{'4link' + String(mainIndex) + String(questionIndex) + String(this.getSubNum(i))}</a> */}
            {subCardJsx}
            {!this.props.role && (
              <div className={'GAP_FILLING'}>
                <div className={styles.scroe}>
                  <span className="icontext">
                    <FormattedMessage {...messages.scoreLabel} />:
                  </span>
                  <span className="icontext receivePoints">
                    {mainData.subQuestion[i].receivePoints != undefined
                      ? mainData.subQuestion[i].receivePoints
                      : '0.0'}
                  </span>
                  <span className="icontext">
                    /<FormattedMessage {...messages.totalScoreLabel} />:
                  </span>
                  <span className="icontext">{this.props.subFallMark}</span>
                </div>
              </div>
            )}
            {/* {!this.props.role&&<div className={'GAP_FILLING'}>
             <ShowRightNumber  dataSource={ShowRightNumberSource} exercise={this.props.exercise}  twoLevel={true} classNum={classNum}/>
            </div>} UI修改，学生报告不需要展示班级正确人数*/}
          </div>
        );
      }
    }

    return subJsx;
  }

  //获取小题的ID和题型和选择题答案
  //id 普通题型的id
  getSubId(questionIndexData, sIndex, id) {
    let answer = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
    let i = -1;
    let length = 0;
    if (typeof sIndex == 'undefined') {
      if (questionIndexData.mainQuestion.answerType == 'CHOICE') {
        length = questionIndexData.mainQuestion.choiceQuestionAnswerInfo.options.length;
        questionIndexData.mainQuestion.choiceQuestionAnswerInfo.options.map((item, index) => {
          if (item.isAnswer == 'Y') {
            i = index;
            return;
          }
        });
      }
      return {
        id: id ? id : questionIndexData.mainQuestion.id,
        type: questionIndexData.mainQuestion.answerType,
        rightChoice: i > -1 ? answer[i] : '', //选择题答案
        choiceList: length,
      };
    } else {
      if (questionIndexData.subQuestion[sIndex].answerType == 'CHOICE') {
        length = questionIndexData.subQuestion[sIndex].choiceQuestionAnswerInfo.options.length;
        questionIndexData.subQuestion[sIndex].choiceQuestionAnswerInfo.options.map(
          (item, index) => {
            if (item.isAnswer == 'Y') {
              i = index;
              return;
            }
          }
        );
      }
      return {
        id: questionIndexData.subQuestion[sIndex].id,
        type: questionIndexData.subQuestion[sIndex].answerType,
        rightChoice: i > -1 ? answer[i] : '',
        choiceList: length,
      };
    }
  }

  //学生详情页，再试卷中加入答题结果
  getStudentReport(questionIndexData) {
    const { questionIndex, mainIndex, dataSource, paperData } = this.props;
    let score;
    let res;
    let subIndex = [];
    let masterData = {
      staticIndex: {
        mainIndex: Number(mainIndex) + 1,
        questionIndex: questionIndex,
      },
    };
    score = calculatScore(masterData.staticIndex, paperData);
    subIndex = this.getStudentAnswer(questionIndexData);

    if (subIndex.length > 0) {
      this.numberSub = subIndex.length;
      subIndex.map(item => {
        res = scoringMachine(
          masterData,
          questionIndexData,
          score,
          dataSource,
          undefined,
          undefined,
          item
        );
      });
    }
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
  renderFooter(questionIndexData, sIndex) {
    const {
      titleData,
      questionIndex,
      mainIndex,
      dataSource,
      paperData,
      role,
      analysisPromission,
    } = this.props;

    let jsx = [];
    let answer = '';
    let type = titleData.questionPatternType;
    let subAnswerIndex = '';
    /*给答案和解析的题号 */
    if (type == 'COMPLEX') {
      subAnswerIndex = titleData.groups[questionIndex].pattern.sequenceNumber
        ? titleData.groups[questionIndex].pattern.sequenceNumber[0][0]
        : questionIndex;
    } else {
      subAnswerIndex = titleData.sequenceNumber
        ? titleData.sequenceNumber[questionIndex][0]
        : questionIndex;
    }

    jsx.push(
      <div
        className={this.state.showAnswer ? styles.showstatus : styles.questionbtn}
        onClick={() => {
          this.setState({
            showAnswer: !this.state.showAnswer,
          });
        }}
      >
        <IconButton iconName="icon-file" text={formatMessage(messages.answerAnalysisBtnTit)} />
      </div>
    );
    if (!role) {
      if (analysisPromission) {
        answer = (
          <AnalysisModal
            dataSource={questionIndexData}
            masterData={subAnswerIndex}
            mark={this.props.subFallMark * this.numberSub}
            report={true}
            online={true}
            hiddenRecordAnswer={'online'}
          />
        );
      } else {
        answer = <HideAnalysisModal />;
      }
    } else {
      answer = (
        <AnswersModal
          dataSource={questionIndexData}
          masterData={subAnswerIndex}
          report={true}
          online={true}
          subIndex={sIndex}
          hiddenReferenceByMachine={true}
          where={'online'}
        />
      );
    }

    return (
      <div>
        {!this.props.role ? (
          <div>
            <div className={styles.addquestion_flex}>{jsx}</div>
            {this.state.showAnswer && answer}
          </div>
        ) : (
          <div>{answer}</div>
        )}
      </div>
    );
  }

  getTitle() {
    const { titleData, mainIndex, paperInstance, questionIndex, type } = this.props;
    let num = 0;
    let paper = paperInstance;
    for (let i = 0; i < mainIndex; i++) {
      if (paper[i].type != 'PATTERN' && paper[i].type != null) {
        num = num + 1;
      }
    }
    let nlist = titleData.mainPatterns.questionPatternInstanceSequence; //序号
    let titlename = titleData.mainPatterns.questionPatternInstanceName
      ? titleData.mainPatterns.questionPatternInstanceName
      : titleData.questionPatternName;

    //为兼容autoCreatePatternInfoText接口制造的数据
    let data = {
      pattern: titleData,
    };
    if (questionIndex == 0) {
      let startIndex;
      if (type == 'COMPLEX') {
        startIndex = paperInstance[mainIndex].questions[0].data.groups[0].data.subQuestion ? 1 : 0;
      } else {
        startIndex = paperInstance[mainIndex].questions[0].data.subQuestion.length ? 1 : 0;
      }
      return (
        <div
          id={
            String(mainIndex) +
            '-' +
            String(questionIndex) +
            '-' +
            String(startIndex) +
            '-' +
            this.getType()
          }
          className="titleInfo"
        >
          {/* <a>{'5link' + String(mainIndex)+"-"+ String(questionIndex)+"-"+ String(startIndex)+"-"+this.getType()}</a> */}
          <div className="title">{nlist + titlename + autoCreatePatternInfoText(data, false)}</div>
          <div className="titleWords">
            {titleData.mainPatterns.answerGuideText == 'NO_GUIDE'
              ? null
              : titleData.mainPatterns.answerGuideText}
          </div>
          <div className="titleLine" />
        </div>
      );
    } else {
      return (
        <div className="titleInfo">
          <div className="title">{nlist + titlename + autoCreatePatternInfoText(data, false)}</div>
          <div className="titleWords">
            {titleData.mainPatterns.answerGuideText == 'NO_GUIDE'
              ? null
              : titleData.mainPatterns.answerGuideText}
          </div>
          <div className="titleLine" />
        </div>
      );
    }
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
      num = titleData.sequenceNumber ? titleData.sequenceNumber[index] : questionIndex;
    }
    if (type == 'TWO_LEVEL') {
      num = titleData.sequenceNumber
        ? titleData.sequenceNumber[questionIndex][index]
        : questionIndex;
    } else if (type == 'COMPLEX') {
      if (titleData.groups[questionIndex].pattern.questionPatternType == 'TWO_LEVEL') {
        num = titleData.groups[questionIndex].pattern.sequenceNumber
          ? titleData.groups[questionIndex].pattern.sequenceNumber[0][index]
          : questionIndex;
      } else {
        num = titleData.groups[questionIndex].pattern.sequenceNumber
          ? titleData.groups[questionIndex].pattern.sequenceNumber[0]
          : questionIndex;
      }
    }
    return num;
  }

  //将学生答案拼接到试卷里-筛选小题id
  getStudentAnswer(questionIndexData) {
    const { dataSource, type, questionIndex } = this.props;
    let patternType = questionIndexData.patternType;
    let data = dataSource;
    let i = [];
    if (type == 'COMPLEX') {
      patternType = dataSource.data.groups[questionIndex].data.patternType;
      data = dataSource.data.groups[questionIndex];
    }
    if ('TWO_LEVEL' == patternType) {
      questionIndexData.subQuestion.map((Item, index) => {
        if (this.getAnswer(Item, Item.id)) {
          i.push(index);
        }
      });
    } else if ('NORMAL' == patternType) {
      if (this.getAnswer(questionIndexData.mainQuestion, data.id)) {
        i.push(0);
      }
    }
    return i;
  }

  //拼接实际数据
  getAnswer(Item, id) {
    //debugger
    let num = {
      //选择题换算成Id
      A: 0,
      B: 1,
      C: 2,
      D: 3,
      E: 4,
      F: 5,
      G: 6,
      H: 7,
      I: 8,
      J: 9,
      K: 10,
    };
    let type = Item.answerType;
    let data = this.findAnswer(id);
    if (data) {
      if (type === 'CHOICE') {
        if (data.studentAnswers !== 'server.wzd' && data.studentAnswers !== null) {
          if (data.answerOptionOrder) {
            let list = data.answerOptionOrder.split(',');
            let index = -1;
            for (let i = 0; i < list.length; i++) {
              if (num[data.studentAnswers] == Number(list[i])) {
                index = i;
              }
            }
            if (index > -1) {
              Item.answerId = Item.choiceQuestionAnswerInfo.options[index].id;
            }
          } else {
            Item.answerId = Item.choiceQuestionAnswerInfo.options[num[data.studentAnswers]].id;
          }
        }
      } else if ('GAP_FILLING' == type) {
        Item.answerValue = data.studentAnswers === 'server.wzd' ? '未作答' : data.studentAnswers;
      } else {
        // 临时方案，因为人工纠偏，口语题分数要显示人工调整后的分数
        if (data && data.engineResult && data.engineResult.result) {
          // let rank=Number(data.engineResult.result.rank);
          // let Loverall=GetLevel((Number(data.engineResult.result.overall)/rank)*100)
          // let Lscore=GetLevel((DoWithNum(data.score)/rank)*100)
          // let offset=Lscore-Loverall;//偏移等级，用于调整分数细节
          let offset = data.offset || 0; // 获取得分偏差
          if (!data.engineResult.result.hasOwnProperty('offset')) {
            data.engineResult.result.offset = offset;
            // 修改口语题原数据
            data.engineResult.result.overall = DoWithNum(data.score); //总分
            if (
              data.engineResult.result.pronunciation &&
              data.engineResult.result.pronunciation.score
            ) {
              data.engineResult.result.pronunciation.score = IfLevel(
                Number(data.engineResult.result.pronunciation.score) + offset
              ); //发音
            }
            if (data.engineResult.result.integrity && data.engineResult.result.integrity.score) {
              data.engineResult.result.integrity.score = IfLevel(
                Number(data.engineResult.result.integrity.score) + offset
              ); //完整度
            }
            if (data.engineResult.result.fluency && data.engineResult.result.fluency.score) {
              data.engineResult.result.fluency.score = IfLevel(
                Number(data.engineResult.result.fluency.score) + offset
              ); //流利度
            }
            if (data.engineResult.result.rhythm && data.engineResult.result.rhythm.score) {
              data.engineResult.result.rhythm.score = IfLevel(
                Number(data.engineResult.result.rhythm.score) + offset
              );
            }
            if (data.engineResult.result.rhythm && data.engineResult.result.rhythm.sense) {
              data.engineResult.result.rhythm.sense = IfLevel(
                Number(data.engineResult.result.rhythm.sense) + offset
              );
            }
            if (data.engineResult.result.rhythm && data.engineResult.result.rhythm.stress) {
              data.engineResult.result.rhythm.stress = IfLevel(
                Number(data.engineResult.result.rhythm.stress) + offset
              );
            }
            if (data.engineResult.result.rhythm && data.engineResult.result.rhythm.tone) {
              data.engineResult.result.rhythm.tone = IfLevel(
                Number(data.engineResult.result.rhythm.tone) + offset
              );
            }
          }
          // 2019-11-20 17:20:44
          // Item.answerValue=data.engineResult;
          // // 其他答题属性
          // Item.fileId=data.fileId;// 有值代表录音了，没值代表没录音
          // Item.manualDetail=data.manualDetail;// 人工纠偏的点评
        }
        // update 2019-11-20 17:19:49
        // VB-8892 学生 报告部分题目的答案解析显示未作答，无机评结果时显示 不清晰balabala...
        Item.answerValue = data.engineResult;
        // 其他答题属性
        Item.fileId = data.fileId; // 有值代表录音了，没值代表没录音
        Item.manualDetail = data.manualDetail; // 人工纠偏的点评
      }
      return true;
    } else {
      return false;
    }
  }
  //用小题ID查找,学生答案
  findAnswer(qid) {
    const { studentAnswer } = this.props;
    let a = studentAnswer.find(function(item) {
      return item.subquestionNo === qid;
    });
    return a;
  }

  //获取type TWO_LEVEL or NORMAL
  getType() {
    const { type, dataSource, questionIndex } = this.props;
    return type == 'COMPLEX' ? dataSource.data.groups[questionIndex].data.patternType : type;
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
      role,
      classNum,
    } = this.props;

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
    let id = ''; //每道题目id

    mainData = dataSource.data; //题目实体数据

    /*小题Data*/
    let questionIndexData = {};

    if (type == 'COMPLEX') {
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
      if (!role) {
        this.getStudentReport(questionIndexData);
      }
      jsx = this.mainQuestionItem(newData, mainData, jsx, dataSource.id);
      id = dataSource.id;
    } else if (type == 'TWO_LEVEL') {
      //二层题型展示
      questionIndexData = mainData;
      if (!role) {
        this.getStudentReport(questionIndexData);
      }
      jsx = this.mainQuestionItem(newData, mainData, jsx);
      subJsx = this.subQuestionItem(showData, newData, mainData, subJsx);
    } else if (type == 'COMPLEX') {
      //复合题型展示
      let groupsItem = mainData.groups[questionIndex].data;
      questionIndexData = groupsItem;
      if (!role) {
        this.getStudentReport(questionIndexData);
      }

      if (groupsItem.patternType == 'NORMAL') {
        jsx = this.mainQuestionItem(newData, groupsItem, jsx, mainData.groups[questionIndex].id);
        id = mainData.groups[questionIndex].id;
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

    return (
      <div>
        <div className={styles.card_detail} key="logo">
          {subStartIndex > 0 ? null : title}
          {jsx}
          {subJsx}
          {!this.props.role && questionIndexData.patternType == 'NORMAL' ? (
            <div>
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
              {/* {!this.props.role&&<div className={'GAP_FILLING'}>
             <ShowRightNumber dataSource={this.findAnswer(id) } exercise={this.props.exercise} twoLevel={false} classNum={classNum}/>
            </div>} UI修改，学生报告不需要展示班级正确人数*/}
            </div>
          ) : (
            ''
          )}
        </div>
        {!this.props.role && this.renderFooter(questionIndexData)}
      </div>
    );
  }
}

export default QuestionShowCard;
