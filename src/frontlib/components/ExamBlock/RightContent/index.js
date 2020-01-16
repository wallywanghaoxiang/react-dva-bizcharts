import React, { PureComponent } from 'react';
import styles from './index.less';
import ItemCard from '../Components/ItemCard';
import PaperTimeProcess from '../Components/PaperTimeProcess';
import { toChinesNum, autoCreatePatternInfoText, returnSubs,isUsePlugin } from '@/frontlib/utils/utils';
import Spliter from '@/frontlib/components/ExampaperProduct/Components/Spliter';
import RecallPage from '../Components/RecallPage';
import CountDown from './CountDown';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';

const messages = defineMessages({
  introLabel: {
    id: 'app.open.book.intro.label',
    defaultMessage: '开卷介绍',
  }
});
/**
 * paperData 试卷详情
 * masterData 主控数据
 */
export default class RightContent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      questionPatternInstanceName: '',
      answerGuideText: '',
      contentData: {},
      paperHeadAudio: '',
      isRecord: -1, //展示录音组件
      isLoad: true,
      hintText: "" //提示语优化
    };
  }

  componentDidMount() {
    const { paperData, masterData } = this.props;
    this.assemblyData(paperData, masterData);

  }
  componentWillReceiveProps(nextProps) {
    const { paperData, masterData } = nextProps;

    this.assemblyData(paperData, masterData);
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-26
   * @copyright 刷新paperData
   * @return    {[type]}    [description]
   */
  reLoadPaperData() {
    this.props.index.reLoadPaperData();
  }
  reLoadVerifiesData() {
    this.props.index.reLoadVerifiesData();
  }
  assemblyData(paperData, masterData) {
    let mainIndex = masterData.staticIndex.mainIndex;

    let paperInstance = paperData.paperInstance;

    let staticIndex = masterData.staticIndex;
    let isRecord = -1;

    if (mainIndex == 0) {
      this.setState({
        questionPatternInstanceName: formatMessage(messages.introLabel),
        contentData: {},
        answerGuideText: '',
        isRecord: isRecord,
        isLoad: false,
      });
    } else if (mainIndex != 0 && paperInstance[staticIndex.mainIndex - 1].type != 'SPLITTER' && paperInstance[staticIndex.mainIndex - 1].type != 'RECALL') {
      let mainPatterns = paperInstance[mainIndex - 1].pattern.mainPatterns;
      let mains = masterData.mains;
      let scripts = mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts;
      let script = scripts[masterData.dynamicIndex.scriptIndex];
      if (script && script.stepPhase == "QUESTION_INFO") {
        this.state.hintText = script.info;
      } else if (masterData.dynamicIndex.scriptIndex == 0 && script && script.stepPhase != "QUESTION_INFO") {
        this.state.hintText = "";
      } else { //上一步的时候遍历之前最近的提示语展示
        let falg = true
        for (let i = masterData.dynamicIndex.scriptIndex; i >= 0; i--) {
          if (scripts[i].stepPhase == "QUESTION_INFO" && scripts[i].info != "") {
            this.state.hintText = scripts[i].info;
            falg = false;
            break;
          }
        }
        if (falg) {
          this.state.hintText = "";
        }
      }



      this.setState({
        questionPatternInstanceName: this.switchLabel(
          mainIndex,
          mainPatterns.questionPatternInstanceName ||
          paperInstance[mainIndex - 1].pattern.questionPatternName,
          mainPatterns.fullMark,
          paperData,
          masterData
        ),
        answerGuideText: mainPatterns.answerGuideText,
        contentData: paperInstance[mainIndex - 1].pattern,
        isRecord: isRecord,
        isLoad: false,
      });
    } else if (paperInstance[staticIndex.mainIndex - 1].type == 'SPLITTER') {
      this.setState({
        questionPatternInstanceName: '分隔页',
        contentData: {},
        answerGuideText: '',
        isRecord: isRecord,
        isLoad: false,
      });
    } else if (paperInstance[staticIndex.mainIndex - 1].type == 'RECALL') {
      this.setState({
        questionPatternInstanceName: 'RECALL',
        contentData: {},
        answerGuideText: '',
        isRecord: isRecord,
        isLoad: false,
      });
    }
  }

  switchLabel(index, label, fullMark, paperData, masterData) {
    let paperInstance = paperData.paperInstance;
    let mainIndex = index;

    let mainGuideSinglePage = false;
    if (paperData.config && paperData.config.mainGuideSinglePage == "Y") {
      mainGuideSinglePage = true;
    }
    let text = "";
    if (mainIndex > 0) {
      if (paperInstance[mainIndex - 1].pattern.mainPatterns && paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceName) {
        text = (paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceSequence || "") + paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceName + (paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceHint || "")
      } else {
        let num = 0;
        let paperInstance = paperData.paperInstance;
        for (let i = 1; i < index; i++) {
          if (paperInstance[Number(i) - 1].type != "PATTERN" && paperInstance[Number(i) - 1].type != null) {
            num = num + 1;
          }
        }
        let questionPatternInstanceName = toChinesNum(index - num) + '、' + label;
        text = questionPatternInstanceName + " " + autoCreatePatternInfoText(paperInstance[mainIndex - 1], false)
      }
    }

    return text
  }

  changeleftMeus(mainIndex, questionIndex, subIndex, type) {
    this.props.index.changeleftMeus(mainIndex, questionIndex, subIndex, type);
  }

  scoringMachine(data, questionData = undefined, preStaticIndex = undefined) {
    const { paperData, masterData } = this.props;
    let paperInstance = paperData.paperInstance;
    let mainIndex = masterData.staticIndex.mainIndex;
    let staticIndex = masterData.staticIndex;
    if (questionData != undefined) {
      this.props.index.scoringMachine(data, questionData, preStaticIndex);
    } else if (paperInstance[staticIndex.mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
      this.props.index.scoringMachine(data, paperInstance[staticIndex.mainIndex - 1].questions[0]);
    } else {
      console.log(paperInstance[mainIndex - 1].questions[masterData.staticIndex.questionIndex]);
      this.props.index.scoringMachine(
        data,
        paperInstance[mainIndex - 1].questions[masterData.staticIndex.questionIndex]
      );
    }
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-17
   * @copyright 渲染添加题型卡片
   * @return    {[type]}    [description]
   */
  renderItemCard() {
    const { paperData, masterData, showData, invalidate } = this.props;
    const { contentData } = this.state;
    let jsx = [];
    let viewInfo = {};
    let mainIndex = masterData.staticIndex.mainIndex;
    let paperInstance = paperData.paperInstance;
    if (contentData.questionPatternType == 'NORMAL') {
      let questionIndex = masterData.staticIndex.questionIndex;
      viewInfo =
        showData[paperInstance[mainIndex - 1].pattern.questionPatternId].structure.viewInfo;
      let startIndex = 0;
      let endIndex = Number(contentData.mainPatterns.questionCount);
      if (paperInstance[mainIndex - 1].pattern.pageSplit) {
        let pageSplit = paperInstance[mainIndex - 1].pattern.pageSplit;
        pageSplit = pageSplit.sort();
        for (let a in pageSplit) {
          if (Number(pageSplit[a]) >= Number(questionIndex)) {
            if (a != 0) {
              startIndex = pageSplit[Number(a) - 1] + 1;
            }
            endIndex = pageSplit[a] + 1;
            break;
          }
        }
        for (let b = pageSplit.length; b >= 0; b--) {
          if (Number(pageSplit[b]) < Number(questionIndex)) {
            startIndex = pageSplit[b] + 1;
            if (b != pageSplit.length - 1) {
              endIndex = pageSplit[Number(b) + 1] + 1;
            }
            break;
          }
        }
      }
      console.log('startIndex', startIndex);
      console.log('endIndex', endIndex);
      if (viewInfo.multipleQuestionPerPage == 'Y') {
        for (let i = startIndex; i < endIndex; i++) {
          jsx.push(
            <ItemCard
              index={i + 1}
              self={this}
              config={paperData.config}
              paperData = {paperData}
              focus={masterData.staticIndex.questionIndex == i ? true : false}
              mainIndex={mainIndex}
              showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
              // editData={editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
              dataSource={paperInstance[mainIndex - 1].questions}
              pattern={paperInstance[mainIndex - 1].pattern}
              masterData={masterData}
              invalidate={invalidate}
              paperId={paperData.id}
              questionIndex={i + 1}
              type={contentData.questionPatternType}
              key={'ItemCard1_' + paperInstance[mainIndex - 1].pattern.questionPatternId + i}
            />
          );
        }
      } else {
        jsx.push(
          <ItemCard
            index={questionIndex + 1}
            self={this}
            focus={true}
            config={paperData.config}
            paperData = {paperData}
            mainIndex={mainIndex}
            showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
            // editData={editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
            dataSource={paperInstance[mainIndex - 1].questions}
            pattern={paperInstance[mainIndex - 1].pattern}
            invalidate={invalidate}
            masterData={masterData}
            paperId={paperData.id}
            questionIndex={questionIndex + 1}
            type={contentData.questionPatternType}
            key={'ItemCard1_' + paperInstance[mainIndex - 1].pattern.questionPatternId}
          />
        );
      }
    } else if (contentData.questionPatternType == 'TWO_LEVEL') {
      let questionIndex = masterData.staticIndex.questionIndex;

      let beforeNum = 0;
      if (questionIndex != 0) {
        let subQuestionCount = 0;
        for (let o = 0; o < questionIndex; o++) {
          subQuestionCount = subQuestionCount + contentData.subQuestionPatterns[o].subQuestionCount;
        }
        beforeNum = subQuestionCount;
      }

      jsx.push(
        <div key={'ItemCard1s_div' + mainIndex} className={styles.title}>
          {contentData.subQuestionPatterns[questionIndex].hintText}
        </div>
      );
      jsx.push(
        <ItemCard
          index={questionIndex + 1}
          focus={true}
          config={paperData.config}
          paperData = {paperData}
          subIndex={masterData.staticIndex.subIndex}
          mainIndex={mainIndex}
          questionIndex={questionIndex}
          beforeNum={questionIndex + 1}
          beforeNums={beforeNum}
          invalidate={invalidate}
          subs={returnSubs(masterData)}
          self={this}
          key={'ItemCard1s' + paperInstance[mainIndex - 1].pattern.questionPatternId}
          paperId={paperData.id}
          showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          // editData={editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          dataSource={paperInstance[mainIndex - 1].questions}
          pattern={paperInstance[mainIndex - 1].pattern}
          masterData={masterData}
          type={contentData.questionPatternType}
        />
      );
    } else if (contentData.questionPatternType == 'COMPLEX') {
      let questionIndex = masterData.staticIndex.questionIndex;
      let groupsItem = contentData.groups[questionIndex];
      //console.log(questionIndex);

      let questionNum = 0;

      for (let m = 0; m < questionIndex; m++) {
        if (contentData.groups[questionIndex - 1].pattern.questionPatternType == 'TWO_LEVEL') {
          questionNum =
            questionNum +
            contentData.groups[questionIndex - 1].pattern.mainPatterns.subQuestionCount;
        } else {
          questionNum = questionNum + contentData.groups[m].pattern.mainPatterns.questionCount;
        }
      }

      jsx.push(
        <div key={'ItemCard1x_div' + mainIndex} className={styles.title}>
          {contentData.groups[questionIndex].pattern.mainPatterns.answerGuideText}
        </div>
      );

      if (
        contentData.groups[questionIndex].pattern.subQuestionPatterns &&
        contentData.groups[questionIndex].pattern.subQuestionPatterns[0]
      ) {
        jsx.push(
          <div key={'ItemCard1x_divmainIndex' + mainIndex} className={styles.title}>
            {contentData.groups[questionIndex].pattern.subQuestionPatterns[0].hintText}
          </div>
        );
      }

      jsx.push(
        <ItemCard
          index={questionIndex + 1}
          focus={true}
          mainIndex={mainIndex}
          subIndex={masterData.staticIndex.subIndex}
          questionIndex={questionIndex}
          beforeNum={questionIndex + 1}
          beforeNums={questionNum}
          invalidate={invalidate}
          self={this}
          subs={returnSubs(masterData)}
          showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          // editData={editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          dataSource={paperInstance[mainIndex - 1].questions}
          pattern={paperInstance[mainIndex - 1].pattern}
          paperId={paperData.id}
          masterData={masterData}
          key={'ItemCard1x' + paperInstance[mainIndex - 1].pattern.questionPatternId}
          type={contentData.questionPatternType}
          config={paperData.config}
          paperData = {paperData}
        />
      );
    }

    return jsx;
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-19
   * @copyright 开题介绍
   * @return    {[type]}    [description]
   */
  renderPaperHead() {
    const { paperData, index, isExamine, invalidate } = this.props;
    let modelStatus = localStorage.getItem('ExampaperStatus');
    let invalidateArr = [];
    if (invalidate && invalidate.paperHead) {
      invalidateArr.push(invalidate.paperHead);
    }
    if (paperData.paperHead && paperData.paperHead.paperHeadName) {
      return (
        <div className={styles.addquestion_card + ' ' + styles.addquestion_focus} style={{height:"611px"}}>
          <div className={styles.addquestion_center}>
            <div className={styles.addquestion_head}>{paperData.paperHead.paperHeadName}</div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }


  renderDescription(questionPatternInstanceName, script,script2) {
    const { answerGuideText, contentData, isRecord, hintText } = this.state;
    const { paperData, masterData } = this.props;
    let paperInstance = paperData.paperInstance;
    let mainIndex = masterData.staticIndex.mainIndex;

    let mainGuideSinglePage = false;
    if (paperData.config && paperData.config.mainGuideSinglePage == "Y") {
      mainGuideSinglePage = true;
    }
    switch (questionPatternInstanceName) {
      case formatMessage(messages.introLabel):
        let jsx = this.renderPaperHead();
        return jsx;
      case "分隔页":
        return <Spliter
                  paperData={paperData}
                  masterData={masterData}
                  ExampaperStatus="exam"
                />
      case "RECALL":
        return <RecallPage
            paperData={paperData}
            masterData={masterData}
            script={script}
            ExampaperStatus="exam"
          />
      default:
        let text = "";
        let subText = "";
        let showQuestionPatternInstanceName = true;
        // console.log("contentData", contentData)
        // console.log("mains", masterData.mains[mainIndex])
        if (mainIndex > 0) {
          // if (paperInstance[mainIndex - 1].pattern.questionPatternType == "COMPLEX") {
          //   let groupItem = paperInstance[mainIndex - 1].pattern.groups[masterData.staticIndex.questionIndex];

          //   if (paperInstance[mainIndex - 1].pattern.mainPatterns.showQuestionPatternInstanceName && paperInstance[mainIndex - 1].pattern.mainPatterns.showQuestionPatternInstanceName == "Y") {
          //     text = paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceSequence + paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceName + paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceHint;
          //     subText = groupItem.pattern.mainPatterns.questionPatternInstanceSequence + groupItem.pattern.mainPatterns.questionPatternInstanceName + groupItem.pattern.mainPatterns.questionPatternInstanceHint;
          //   } else {
          //     if (groupItem.pattern.mainPatterns && groupItem.pattern.mainPatterns.questionPatternInstanceSequence) {
          //       text = groupItem.pattern.mainPatterns.questionPatternInstanceSequence + groupItem.pattern.mainPatterns.questionPatternInstanceName + groupItem.pattern.mainPatterns.questionPatternInstanceHint
          //     } else {
          //       text = questionPatternInstanceName + " " + autoCreatePatternInfoText(groupItem, false)
          //     }
          //   }
          // } else {
          //   if (paperInstance[mainIndex - 1].pattern.mainPatterns && paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceSequence) {
          //     text = paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceSequence + paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceName + paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceHint
          //   } else {
          //     text = questionPatternInstanceName + " " + autoCreatePatternInfoText(paperInstance[mainIndex - 1], false)
          //   }

          // }

          if (paperInstance[mainIndex - 1].pattern.questionPatternType == "COMPLEX") {
            let groupItem = paperInstance[mainIndex - 1].pattern.groups[masterData.staticIndex.questionIndex];

            subText = (groupItem.pattern.mainPatterns.questionPatternInstanceSequence || "") + groupItem.pattern.mainPatterns.questionPatternInstanceName + (groupItem.pattern.mainPatterns.questionPatternInstanceHint || "");
            if (paperInstance[mainIndex - 1].pattern.mainPatterns.showQuestionPatternInstanceName && paperInstance[mainIndex - 1].pattern.mainPatterns.showQuestionPatternInstanceName == "N") {
              showQuestionPatternInstanceName = false;
            }
          }

        }
        if (mainGuideSinglePage) {
          if (script && (script.stepPhase == "MAIN_GUIDE" || (script.stepPhase=="TITLE" && script2 && script2.stepPhase=="MAIN_GUIDE"))) {
            return (<div className="problem" style={{paddingBottom:0}}>
              <div className="title">{questionPatternInstanceName}</div>
              {answerGuideText == "NO_GUIDE" ? null : <div className="description">{answerGuideText}</div>}
            </div>)
          } else {
            if(showQuestionPatternInstanceName){
              return (<div className="problem">
                <div className="title">{questionPatternInstanceName}</div>
                {subText!="" && <div className="description">{subText}</div>}
                {<div className="description_hint">{hintText}</div>}
              </div>)
            }else{
              return (<div className="problem" style={{paddingBottom:0}}>
                <div className="title">{subText}</div>
                {<div className="description_hint">{hintText}</div>}
              </div>)
            }

          }

        } else {
          return (<div className="problem" style={{paddingBottom:0}}>
            <div className="title">{questionPatternInstanceName}</div>
            {subText!="" && <div className="description">{subText}</div>}
            {answerGuideText == "NO_GUIDE" ? null : <div className="description">{answerGuideText}</div>}
            {<div className="description_hint">{hintText}</div>}
          </div>)
        }

    }

  }

  //停止整卷试做
  stopPlay() {
    const { masterData, } = this.props;
    let staticIndex = masterData.staticIndex;
    let mains = masterData.mains;
    let script =
      mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
        masterData.dynamicIndex.scriptIndex
      ];
    if (script.stepPhase == "PAPER_INTRODUCTION_COUNTDOWN") {
      return false
    }
    this.refs.paperTimeProcess.stopTheButton();
    return true
  }


  /**
   *
   * 插件底部进度条
   * @author tina.zhang
   * @date 2019-03-14
   * @returns
   * @memberof RightContent
   */
  renderPluginProcess(script,contentData,frontEndModuleName){
      const { paperData, masterData, isExam } = this.props;
      let staticIndex = masterData.staticIndex;
      if(frontEndModuleName){

          const PluginProcess = require("@/frontlib/"+frontEndModuleName+"Plugin/Dynamic"+frontEndModuleName+"Card/PaperTimeProcess").default;
          return <PluginProcess
                    script={script}
                    key={
                      'PaperTimeProcess_' +
                      script.index +
                      staticIndex.mainIndex +
                      staticIndex.questionIndex +
                      script.time
                    }
                    paperData={paperData}
                    masterData={masterData}
                    self={this}
                    type={contentData.questionPatternType}
                    isExam={isExam}
                    ref="paperTimeProcess"
                    // onStateChange={}
                    callback={e => {
                      this.props.index.stopRecorded('down');
                    }}
                    scoringcallback={(e, preStaticIndex) => {
                      this.props.index.SpecialPluginScoring();
                    }}
                />
      }
  }

  render() {
    const {
      questionPatternInstanceName,
      contentData,
      isLoad,
    } = this.state;
    const { paperData, masterData, isExam, isOpenSwitchTopic } = this.props;
    if (isLoad) {
      return null;
    } else {
      let staticIndex = masterData.staticIndex;
      let mains = masterData.mains;
      let script =
        mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
          masterData.dynamicIndex.scriptIndex
        ];
      let script2 =
        mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
          Number(masterData.dynamicIndex.scriptIndex) + 1
        ];
      // console.log(masterData)
      if(masterData.recallIndex){
        staticIndex = masterData.recallIndex
        script =
          mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
            masterData.dynamicIndex.scriptIndex
          ];
        script2 =
          mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
            Number(masterData.dynamicIndex.scriptIndex) + 1
          ];
      }

      // console.log(script)
      let isPlugin = false;//是否使用插件

      let isUsePlugins = false;
      let frontEndModuleName = "";
      if(staticIndex.mainIndex>0 && paperData.paperInstance[staticIndex.mainIndex - 1].pattern && paperData.paperInstance[staticIndex.mainIndex - 1].pattern.patternPlugin){
        isUsePlugins = isUsePlugin(paperData.paperInstance[staticIndex.mainIndex - 1].pattern.patternPlugin.pluginPhase,"P5_SHOW_DYNAMIC_QUESTION");
        frontEndModuleName = paperData.paperInstance[staticIndex.mainIndex - 1].pattern.patternPlugin.frontEndModuleName;
      }
      if(isUsePlugins){
        if(script.stepPhase !="MAIN_GUIDE" && (script2 && script2.stepPhase!="MAIN_GUIDE" || script2 == undefined)){
          isPlugin = true;
        }
      }

      let mainGuideSinglePage = false;
      if (paperData.config && paperData.config.mainGuideSinglePage == "Y") {
          mainGuideSinglePage = true;
      }

      if (script && script.stepPhase == "PAPER_INTRODUCTION_COUNTDOWN") {
        return <div className="paper_rightContent" id="paper_rightContent" style={{ height: '707px' }}>
            <CountDown  index={this} time={script.time}/>
        </div>
      } else {
        return (
          <div className="paper_rightContent" id="paper_rightContent" style={{ height: '631px' }}>
            {this.renderDescription(questionPatternInstanceName,script,script2)}

            {(mainGuideSinglePage && script && (script.stepPhase=="MAIN_GUIDE" || (script.stepPhase=="TITLE" && script2 && script2.stepPhase=="MAIN_GUIDE")))?"":<div className="addquestion_Item" id="addquestion_Item">
                          {this.renderItemCard()}
                        </div>}

            {!isPlugin ? <PaperTimeProcess
                script={script}
                key={
                  'PaperTimeProcess_' +
                  script.index +
                  staticIndex.mainIndex +
                  staticIndex.questionIndex +
                  script.time

                }
                paperData={paperData}
                masterData={masterData}
                self={this}
                type={contentData.questionPatternType}
                isExam={isExam}
                isOpenSwitchTopic = {isOpenSwitchTopic}
                ref="paperTimeProcess"
                // onStateChange={}
                callback={e => {
                  this.props.index.stopRecorded('down');
                }}
                scoringcallback={(e, preStaticIndex) => {
                  let staticIndex = masterData.staticIndex;
                  let paperInstance = paperData.paperInstance;
                  let ItemData = {};
                  let questionData = {};
                  if (
                    paperInstance[staticIndex.mainIndex - 1].pattern.questionPatternType == 'COMPLEX'
                  ) {
                    ItemData =
                      paperInstance[staticIndex.mainIndex - 1].questions[0].data.groups[
                        staticIndex.questionIndex
                      ].data;
                    questionData = paperInstance[staticIndex.mainIndex - 1].questions[0];
                  } else {
                    ItemData =
                      paperInstance[staticIndex.mainIndex - 1].questions[staticIndex.questionIndex]
                        .data;
                    questionData =
                      paperInstance[staticIndex.mainIndex - 1].questions[staticIndex.questionIndex];
                  }
                  /**
                   * @Author    tina.zhang
                   * @DateTime  2018-11-02
                   * @copyright 返回小题序号
                   * @return    {[type]}    [description]
                   */
                  let returnSubIndex = function(masterData) {
                    let staticIndex = masterData.staticIndex;
                    let mainData = masterData.mains;
                    let subs =
                      mainData[staticIndex.mainIndex].questions[staticIndex.questionIndex].subs;

                    for (let i in subs) {
                      if (Number(subs[i]) == Number(staticIndex.subIndex)) {
                        return i;
                      }
                    }
                  };
                  if (ItemData.patternType == 'NORMAL') {
                    ItemData.mainQuestion.answerValue = e;
                  } else {
                    let subIndex = returnSubIndex(masterData);
                    ItemData.subQuestion[subIndex].answerValue = e;
                  }
                  this.scoringMachine(ItemData, questionData, preStaticIndex);
                }}
              /> :this.renderPluginProcess(script,contentData,frontEndModuleName)
            }
          </div>
        );
      }
    }
  }
}
