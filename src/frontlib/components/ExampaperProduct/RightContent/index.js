import React, { PureComponent } from 'react';
import { Layout, Menu, Icon, message, Dropdown, Button } from 'antd';
import pathToRegexp from 'path-to-regexp';
import { Link } from 'dva/router';
import router from 'umi/router';
import styles from './index.less';
import ItemCard from '../Components/ItemCard';
import AutoPlay from '../Components/AutoPlay';
import SoundRecording from '../Components/SoundRecord';
import showAddPaperModal from '../Components/AddPaperHeader/api';
import ValidateQuestion from '../Components/ValidateQuestion/api';
import { savePaperHead, fetchPaperFileUrl } from '@/services/api';
import IconButton from '@/frontlib/components/IconButton';
import {
  toChinesNum,
  autoCreatePatternInfoText,
  returnSubIndex,
  filterPrompt,
  returnSubs,
  isUsePlugin,
} from '@/frontlib/utils/utils';
import PublishCorrect from '../Components/PublishCorrect/api';
import Spliter from '../Components/Spliter';
import RecallPage from '../Components/RecallPage';
import PromptSound from '@/frontlib/components/PromptSound';
import emitter from '@/utils/ev';
import Tips from './Tips';

import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
const messages = defineMessages({
  introLabel: {
    id: 'app.open.book.intro.label',
    defaultMessage: '开卷介绍',
  },
  questionProofread: { id: 'app.question.to.be.proofread', defaultMessage: '待校对' },
  validateFail: { id: 'app.fail.question.proofread', defaultMessage: '不通过' },
  validatePass: { id: 'app.pass.question.proofread', defaultMessage: '通过' },
  validateIgnored: { id: 'app.question.modify.ignored', defaultMessage: '已忽略' },
  validateModified: { id: 'app.question.modified', defaultMessage: '已修正' },
  proofreadBtn: { id: 'app.question.proofread.btn', defaultMessage: '校对' },
  passProofread: { id: 'app.question.pass.proofread', defaultMessage: '校对通过' },
  proofreadFailure: { id: 'app.question.proofread.failure', defaultMessage: '校对不通过' },
  bookAddBtn: { id: 'app.open.book.add.btn', defaultMessage: '添加开卷' },
});

/**
 * paperData 试卷详情
 * masterData 主控数据
 * mainType 是否独立展示答题指导
 * guideIndex 答题指导index
 */
export default class RightContent extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      questionPatternInstanceName: '',
      answerGuideText: '',
      contentData: {},
      paperHeadAudio: '',
      isRecord: -1, // 展示录音组件
      mainType: false,
      focusId: '',
      text: '',
      subText: '',
      subfocusIndex: 0, // 模仿跟读子题型subIndex
      ishaveMore: false,
    };
  }

  componentDidMount() {
    const { paperData, masterData } = this.props;
    this.assemblyData(paperData, masterData);

    // 监听滚动事件
    // document
    //   .getElementById('paper_rightContent')
    //   .addEventListener('scroll', this.handScroll, { passive: true });
  }

  /**
   * 右侧滚动去除样式
   */
  // handScroll = () => {
  //   const { ishaveMore } = this.state;
  //   // const scrollDiv = document.getElementById("paper_rightContent");

  //   // // 变量scrollTop是滚动条滚动时，距离顶部的距离
  //   // const {scrollTop} = scrollDiv;
  //   // // 变量windowHeight是可视区的高度
  //   // const windowHeight = scrollDiv.clientHeight;
  //   // // 变量scrollHeight是滚动条的总高度
  //   // const {scrollHeight} = scrollDiv;
  //   // // 滚动条到底部的条件
  //   // if(scrollTop + windowHeight === scrollHeight){
  //   //   // 写后台加载数据的函数
  //   //   console.log(`距顶部${scrollTop}可视区高度${windowHeight}滚动条总高度${scrollHeight}`);
  //   //   this.setState({ishaveMore:false})
  //   // }
  //   if (ishaveMore) {
  //     this.setState({ ishaveMore: false });
  //   }
  // };

  componentWillReceiveProps(nextProps) {
    const { paperData, masterData } = nextProps;
    if (nextProps.mainType) {
      let mainIndex = nextProps.guideIndex;
      let paperInstance = paperData.paperInstance;
      let mainPatterns = paperInstance[mainIndex - 1].pattern.mainPatterns;
      this.setState({
        questionPatternInstanceName: this.switchLabel(
          mainIndex,
          mainPatterns.questionPatternInstanceName ||
            paperInstance[mainIndex - 1].pattern.questionPatternName,
          mainPatterns.fullMark,
          paperData,
          masterData
        ),
        answerGuideText:
          mainPatterns.answerGuideText == 'NO_GUIDE' ? null : mainPatterns.answerGuideText,
        mainType: true,
      });
    } else {
      // this.state.ishaveMore = false;
      this.state.mainType = false;
      this.assemblyData(paperData, masterData);

      // const newstaticIndex = masterData.staticIndex;
      // const oldstaticIndex = this.props.masterData.staticIndex;

      // if (
      //   paperData.paperInstance[newstaticIndex.mainIndex - 1] &&
      //   paperData.paperInstance[newstaticIndex.mainIndex - 1].pattern &&
      //   paperData.paperInstance[newstaticIndex.mainIndex - 1].pattern.questionPatternType ===
      //     'NORMAL'
      // ) {
      //   if (newstaticIndex.mainIndex !== oldstaticIndex.mainIndex) {
      //     setTimeout(() => {
      //       const scrollDiv = document.getElementById('paper_rightContent');
      //       if (scrollDiv.scrollHeight > scrollDiv.clientHeight) {
      //         this.setState({ ishaveMore: true });
      //       }
      //     }, 1000);
      //   } else {
      //     // 分页处理
      //     const { mains } = masterData;
      //     const max =
      //       Number(newstaticIndex.questionIndex) > Number(oldstaticIndex.questionIndex)
      //         ? Number(newstaticIndex.questionIndex)
      //         : Number(oldstaticIndex.questionIndex);
      //     const min =
      //       Number(newstaticIndex.questionIndex) < Number(oldstaticIndex.questionIndex)
      //         ? Number(newstaticIndex.questionIndex)
      //         : Number(oldstaticIndex.questionIndex);
      //     let falg = false;
      //     for (let i = min; i < max; i++) {
      //       if (mains[newstaticIndex.mainIndex].questions[i].pageSplit === 'Y') {
      //         falg = true;
      //         break;
      //       }
      //     }
      //     if (falg) {
      //       setTimeout(() => {
      //         const scrollDiv = document.getElementById('paper_rightContent');

      //         if (scrollDiv.scrollHeight > scrollDiv.clientHeight) {
      //           this.setState({ ishaveMore: true });
      //         }
      //       }, 1000);
      //     }
      //   }
      // } else if (
      //   newstaticIndex.mainIndex !== oldstaticIndex.mainIndex ||
      //   newstaticIndex.questionIndex !== oldstaticIndex.questionIndex
      // ) {
      //   setTimeout(() => {
      //     const scrollDiv = document.getElementById('paper_rightContent');
      //     if (scrollDiv.scrollHeight > scrollDiv.clientHeight) {
      //       this.setState({ ishaveMore: true });
      //     }
      //   }, 1000);
      // }
    }
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

    /**=======================================================================================================================
     * 录音组件是否展示
     * paperData  试卷详情
     * masterData 主控数据
     */
    let staticIndex = masterData.staticIndex;
    let isRecord = -1;
    // console.log('===录音组件是否展示===')
    if (
      staticIndex.mainIndex != 0 &&
      paperInstance[staticIndex.mainIndex - 1].type != 'SPLITTER' &&
      paperInstance[staticIndex.mainIndex - 1].type != 'RECALL'
    ) {
      let itemData = paperInstance[staticIndex.mainIndex - 1].questions[staticIndex.questionIndex];
      let type = paperInstance[staticIndex.mainIndex - 1].pattern.questionPatternType;

      if (type == 'COMPLEX') {
        let complexData = paperInstance[staticIndex.mainIndex - 1].questions[0];
        if (complexData == null) {
          itemData = null;
        } else {
          itemData = complexData.data.groups[staticIndex.questionIndex];
        }
      }

      if (itemData == null || itemData == undefined) {
        //还未录题
        isRecord = -1;
      } else {
        let answerType = itemData.data.mainQuestion.answerType;
        if (
          answerType != 'GAP_FILLING' &&
          answerType != 'CHOICE' &&
          answerType != null &&
          answerType != ''
        ) {
          //口语题展示录音
          isRecord = 0;
        } else {
          isRecord = -1;
        }
      }
    } else {
      isRecord = -1;
    }

    /*=======================================================================================================================*/
    if (mainIndex == 0) {
      this.setState({
        questionPatternInstanceName: formatMessage(messages.introLabel),
        contentData: {},
        answerGuideText: '',
        isRecord: isRecord,
      });
    } else if (
      mainIndex != 0 &&
      paperInstance[staticIndex.mainIndex - 1].type != 'SPLITTER' &&
      paperInstance[staticIndex.mainIndex - 1].type != 'RECALL'
    ) {
      let mainPatterns = paperInstance[mainIndex - 1].pattern.mainPatterns;
      this.setState({
        questionPatternInstanceName: this.switchLabel(
          mainIndex,
          mainPatterns.questionPatternInstanceName ||
            paperInstance[mainIndex - 1].pattern.questionPatternName,
          mainPatterns.fullMark,
          paperData,
          masterData
        ),
        answerGuideText:
          mainPatterns.answerGuideText == 'NO_GUIDE' ? null : mainPatterns.answerGuideText,
        contentData: paperInstance[mainIndex - 1].pattern,
        isRecord: isRecord,
      });
    } else if (paperInstance[staticIndex.mainIndex - 1].type == 'SPLITTER') {
      this.setState({
        questionPatternInstanceName: formatMessage({
          id: 'app.text.separatorpage',
          defaultMessage: '分隔页',
        }),
        contentData: {},
        answerGuideText: '',
        isRecord: isRecord,
      });
    } else if (paperInstance[staticIndex.mainIndex - 1].type == 'RECALL') {
      this.setState({
        questionPatternInstanceName: formatMessage({
          id: 'app.text.hsy',
          defaultMessage: '回溯页',
        }),
        contentData: {},
        answerGuideText: '',
        isRecord: isRecord,
      });
    }
  }

  switchLabel(index, label, fullMark, paperData, masterData) {
    let paperInstance = paperData.paperInstance;
    let mainIndex = index;

    let mainGuideSinglePage = false;
    if (paperData.config && paperData.config.mainGuideSinglePage == 'Y') {
      mainGuideSinglePage = true;
    }
    let text = '';
    if (mainIndex > 0) {
      if (
        paperInstance[mainIndex - 1].pattern.mainPatterns &&
        paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceName
      ) {
        text =
          (paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceSequence ||
            '') +
          paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceName +
          (paperInstance[mainIndex - 1].pattern.mainPatterns.questionPatternInstanceHint || '');
      } else {
        let num = 0;
        let paperInstance = paperData.paperInstance;
        for (let i = 1; i < index; i++) {
          if (
            paperInstance[Number(i) - 1].type != 'PATTERN' &&
            paperInstance[Number(i) - 1].type != null
          ) {
            num = num + 1;
          }
        }
        let questionPatternInstanceName = toChinesNum(index - num) + '、' + label;
        text =
          questionPatternInstanceName +
          ' ' +
          autoCreatePatternInfoText(paperInstance[mainIndex - 1], false);
      }
    }

    return text;
  }

  changeleftMeus(mainIndex, questionIndex, subIndex, type) {
    this.props.index.changeleftMeus(mainIndex, questionIndex, subIndex, type);
  }

  scoringMachine(data, preStaticIndex) {
    const { paperData, masterData } = this.props;
    let paperInstance = paperData.paperInstance;
    let mainIndex = masterData.staticIndex.mainIndex;
    let staticIndex = masterData.staticIndex;
    if (preStaticIndex) {
      staticIndex = preStaticIndex;
    }

    if (paperInstance[staticIndex.mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
      this.props.index.scoringMachine(
        data,
        paperInstance[staticIndex.mainIndex - 1].questions[0],
        preStaticIndex
      );
    } else {
      this.props.index.scoringMachine(
        data,
        paperInstance[staticIndex.mainIndex - 1].questions[staticIndex.questionIndex],
        preStaticIndex
      );
    }
  }

  changeSubIndex = e => {
    // console.log('changeSubIndex', e);
    this.setState({ subfocusIndex: e });
  };

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-17
   * @copyright 渲染添加题型卡片
   * @return    {[type]}    [description]
   */
  renderItemCard() {
    const {
      paperData,
      masterData,
      editData,
      showData,
      invalidate,
      isExamine,
      ExampaperStatus,
    } = this.props;
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
      // console.log('startIndex', startIndex);
      // console.log('endIndex', endIndex);
      if (viewInfo.multipleQuestionPerPage == 'Y') {
        //一页多题
        for (let i = startIndex; i < endIndex; i++) {
          jsx.push(
            <ItemCard
              index={i + 1}
              self={this}
              focus={masterData.staticIndex.questionIndex == i ? true : false}
              mainIndex={mainIndex}
              showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
              editData={
                editData && editData[paperInstance[mainIndex - 1].pattern.questionPatternId]
              }
              dataSource={paperInstance[mainIndex - 1].questions}
              pattern={paperInstance[mainIndex - 1].pattern}
              masterData={masterData}
              invalidate={invalidate}
              paperId={paperData.id}
              paperData={paperData}
              isExamine={isExamine}
              questionIndex={i + 1}
              type={contentData.questionPatternType}
              key={'ItemCard1_' + paperInstance[mainIndex - 1].pattern.questionPatternId + i}
              ExampaperStatus={ExampaperStatus}
            />
          );
        }
      } else {
        //一页单题
        jsx.push(
          <ItemCard
            index={questionIndex + 1}
            self={this}
            focus={true}
            mainIndex={mainIndex}
            showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
            editData={editData && editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
            dataSource={paperInstance[mainIndex - 1].questions}
            pattern={paperInstance[mainIndex - 1].pattern}
            invalidate={invalidate}
            masterData={masterData}
            paperId={paperData.id}
            paperData={paperData}
            isExamine={isExamine}
            questionIndex={questionIndex + 1}
            type={contentData.questionPatternType}
            key={'ItemCard1_' + paperInstance[mainIndex - 1].pattern.questionPatternId}
            ExampaperStatus={ExampaperStatus}
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
          paperData={paperData}
          isExamine={isExamine}
          showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          editData={editData && editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          dataSource={paperInstance[mainIndex - 1].questions}
          pattern={paperInstance[mainIndex - 1].pattern}
          masterData={masterData}
          type={contentData.questionPatternType}
          ExampaperStatus={ExampaperStatus}
          onChange={this.changeSubIndex}
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
          {contentData.groups[questionIndex].pattern.mainPatterns.answerGuideText == 'NO_GUIDE'
            ? null
            : contentData.groups[questionIndex].pattern.mainPatterns.answerGuideText}
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
          subs={returnSubs(masterData)}
          self={this}
          showData={showData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          editData={editData && editData[paperInstance[mainIndex - 1].pattern.questionPatternId]}
          dataSource={paperInstance[mainIndex - 1].questions}
          pattern={paperInstance[mainIndex - 1].pattern}
          paperId={paperData.id}
          paperData={paperData}
          isExamine={isExamine}
          masterData={masterData}
          key={'ItemCard1x' + paperInstance[mainIndex - 1].pattern.questionPatternId}
          type={contentData.questionPatternType}
          ExampaperStatus={ExampaperStatus}
        />
      );
    }

    return jsx;
  }

  /**
   * @Author    tina
   * @DateTime  2018-11-06
   * @copyright 校对
   * @param     {[type]}    validate [description]
   * @return    {[type]}             [description]
   */
  validateQuestionSubmit() {
    const { masterData, paperData, invalidate, isExamine, ExampaperStatus } = this.props;
    let invalidateArr = [];
    if (invalidate && invalidate.paperHead) {
      invalidateArr.push(invalidate.paperHead);
    }
    ValidateQuestion({
      dataSource: {
        title: '验证',
        paperID: paperData.id,
        masterData: masterData,
        questionId: '',
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
    const { paperID, masterData, paperData, invalidate } = this.props;
    let invalidateArr = [];
    if (invalidate && invalidate.paperHead) {
      invalidateArr.push(invalidate.paperHead);
    }
    PublishCorrect({
      dataSource: {
        title: '校对结果',
        paperID: paperData.id,
        masterData: masterData,
        questionId: '',
        invalidate: invalidateArr,
      },
      callback: questioJson => {
        this.reLoadVerifiesData();
        //this.reLoadPaperData();
      },
    });
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-19
   * @copyright 开题介绍
   * @return    {[type]}    [description]
   */
  renderPaperHead() {
    const { paperData, index, isExamine, invalidate, ExampaperStatus } = this.props;
    let invalidateArr = [];
    if (invalidate && invalidate.paperHead) {
      invalidateArr.push(invalidate.paperHead);
    }
    if (paperData.paperHead && paperData.paperHead.paperHeadName) {
      return (
        <div className={styles.addquestion_card + ' ' + styles.addquestion_focus}>
          <div className={styles.addquestion_center}>
            <div className={styles.addquestion_head}>{paperData.paperHead.paperHeadName}</div>
            <div className={styles.addquestion_myicon}>
              <AutoPlay id={paperData.paperHead.paperHeadAudio} />
            </div>
          </div>

          <div className={styles.addquestion_flexbottom}>
            {ExampaperStatus !== 'VALIDATE' &&
              ExampaperStatus !== 'EXAM' &&
              ExampaperStatus !== 'AFTERCLASS' &&
              isExamine != '1' && (
                <div
                  className={styles.questionbtn}
                  onClick={() => {
                    let that = this;
                    fetchPaperFileUrl({
                      fileId: paperData.paperHead.paperHeadAudio,
                    }).then(e => {
                      if (e && e.data) {
                        paperData.paperHead.paperHeadAudioUrl = e.data.path;
                        paperData.paperHead.name = e.data.fileName;

                        this.setState({ paperHeadAudio: e.data.path });

                        showAddPaperModal({
                          dataSource: paperData.paperHead,
                          callback: (paperHeadName, navTime, state, paperHeadDelay) => {
                            let paperHead = {
                              replierId: localStorage.getItem('specialistId'),
                              paperId: paperData.id,
                              paperHeadName: paperHeadName,
                              paperHeadAudio: state.id,
                              paperIntroductionTime: state.duration,
                              navTime: Number(navTime),
                              paperHeadAudioUrl: state.audioUrl,
                              name: state.name,
                              paperHeadAudioTime: state.duration,
                              paperHeadNavTime: Number(navTime),
                              paperHeadDelay: paperHeadDelay,
                            };

                            that.state.paperHeadAudio = state.audioUrl;
                            savePaperHead(paperHead).then(e => {
                              paperData.paperHead = paperHead;
                              emitter.emit('hideModal');
                              if (e.responseCode == '200') {
                                index.paperHeadChange(paperData, e.data);
                                that.reLoadVerifiesData();
                              } else {
                                message.error(e.data || '保存失败！');
                                if (e.responseCode === '464') {
                                  router.push('/task');
                                }
                              }
                            });
                          },
                        });
                      }
                    });
                  }}
                >
                  编辑
                </div>
              )}
            {ExampaperStatus == 'VALIDATE' && (
              <div className={styles.questionbtn}>
                <div>
                  <IconButton
                    iconName="icon-serach"
                    text={formatMessage(messages.proofreadBtn)}
                    onClick={this.validateQuestionSubmit.bind(this)}
                    className={styles.validateQuestion}
                  />
                  <span className={styles.validateStatusHeader}>
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
            )}

            {ExampaperStatus == 'CORRECT' && (
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
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className={styles.addquestion_card}>
          <div className={styles.addquestion_flex}>
            {isExamine == '1' ? (
              ' '
            ) : (
              <div
                className={styles.questionbtn}
                onClick={() => {
                  let that = this;
                  showAddPaperModal({
                    dataSource: [],
                    callback: (paperHeadName, navTime, state, paperHeadDelay) => {
                      let paperHead = {
                        paperId: paperData.id,
                        paperHeadName: paperHeadName,
                        paperHeadAudio: state.id,
                        paperIntroductionTime: state.duration,
                        navTime: Number(navTime),
                        replierId: localStorage.getItem('specialistId'),
                        paperHeadAudioUrl: state.audioUrl,
                        name: state.name,
                        paperHeadAudioTime: state.duration,
                        paperHeadNavTime: Number(navTime),
                        paperHeadDelay: paperHeadDelay,
                      };
                      this.state.paperHeadAudio = state.audioUrl;
                      savePaperHead(paperHead).then(e => {
                        paperData.paperHead = paperHead;
                        emitter.emit('hideModal');
                        if (e.responseCode == '200') {
                          index.paperHeadChange(paperData, e.data);
                          that.reLoadPaperData();
                        } else {
                          message.error(e.data || '保存失败！');
                          if (e.responseCode === '464') {
                            router.push('/task');
                          }
                        }
                      });
                    },
                  });
                }}
              >
                {formatMessage(messages.bookAddBtn)}
              </div>
            )}
          </div>
        </div>
      );
    }
  }

  renderDescription(questionPatternInstanceName, isPlugin, frontEndModuleName) {
    const { answerGuideText, contentData, isRecord, text } = this.state;
    const { paperData, masterData, mainType, ExampaperStatus } = this.props;
    let paperInstance = paperData.paperInstance;
    let mainIndex = masterData.staticIndex.mainIndex;
    let staticIndex = masterData.staticIndex;
    let mainGuideSinglePage = false;
    if (paperData.config && paperData.config.mainGuideSinglePage == 'Y') {
      mainGuideSinglePage = true;
    }

    switch (questionPatternInstanceName) {
      case formatMessage(messages.introLabel):
        let jsx = this.renderPaperHead();
        return jsx;
      case formatMessage({ id: 'app.text.separatorpage', defaultMessage: '分隔页' }):
        return <Spliter paperData={paperData} masterData={masterData} />;
      case formatMessage({ id: 'app.text.hsy', defaultMessage: '回溯页' }):
        return <RecallPage />;
      default:
        let text = '';
        let hintText = [];
        let subText = '';
        let showQuestionPatternInstanceName = true;
        if (mainIndex > 0) {
          if (paperInstance[mainIndex - 1].pattern.questionPatternType == 'COMPLEX') {
            let groupItem =
              paperInstance[mainIndex - 1].pattern.groups[masterData.staticIndex.questionIndex];

            subText =
              (groupItem.pattern.mainPatterns.questionPatternInstanceSequence || '') +
              groupItem.pattern.mainPatterns.questionPatternInstanceName +
              (groupItem.pattern.mainPatterns.questionPatternInstanceHint || '');
            if (
              paperInstance[mainIndex - 1].pattern.mainPatterns.showQuestionPatternInstanceName &&
              paperInstance[mainIndex - 1].pattern.mainPatterns.showQuestionPatternInstanceName ==
                'N'
            ) {
              showQuestionPatternInstanceName = false;
            }
          }
          let hintData = masterData.mains[mainIndex].questions[staticIndex.questionIndex].hints;
          if (isPlugin) {
            const { pluginFilterPrompt } = require('@/frontlib/' +
              frontEndModuleName +
              'Plugin/utils');
            hintText = pluginFilterPrompt(hintData, 'Y');
          } else {
            if (hintData) {
              hintText = filterPrompt(
                hintData,
                masterData.mains[mainIndex].questions[staticIndex.questionIndex]
                  .allowMultiAnswerMode,
                returnSubIndex(masterData)
              );
            }
          }
        }
        let hintJsx = [];

        for (let i in hintText) {
          hintJsx.push(
            <Menu.Item key={i}>
              <PromptSound
                hint={hintText[i]}
                key={'hint_' + i}
                idx={this.state.focusId}
                callback={e => {
                  this.setState({ focusId: e });
                }}
              />
            </Menu.Item>
          );
          if (i != hintText.length - 1) {
            hintJsx.push(<Menu.Divider />);
          }
        }
        const menu = <Menu>{hintJsx}</Menu>;
        if (mainGuideSinglePage) {
          if (showQuestionPatternInstanceName) {
            //显示复合题型标题
            return (
              <div
                className="problem"
                key={'problem_' + mainIndex + staticIndex.questionIndex + staticIndex.subIndex}
              >
                <div className="title">{questionPatternInstanceName}</div>
                {mainType && answerGuideText != 'NO_GUIDE' ? (
                  <div className="description">{answerGuideText}</div>
                ) : null}
                {subText != '' && !mainType && <div className="description">{subText}</div>}
                {hintText.length != 0 &&
                  !mainType &&
                  ExampaperStatus !== 'EXAM' &&
                  ExampaperStatus !== 'AFTERCLASS' && (
                    <Dropdown overlay={menu}>
                      <div className={styles.tipButton}>
                        {/* {"提示语（"+hintText.length+"）"} */}
                        <FormattedMessage
                          id="app.paper.process.node.tip"
                          defaultMessage="提示语({param})"
                          values={{ param: hintText.length }}
                        ></FormattedMessage>
                        <Icon type="down" />
                      </div>
                    </Dropdown>
                  )}
              </div>
            );
          } else {
            return (
              <div
                className="problem"
                key={'problem_' + mainIndex + staticIndex.questionIndex + staticIndex.subIndex}
              >
                {mainType && <div className="title">{questionPatternInstanceName}</div>}
                {mainType && answerGuideText != 'NO_GUIDE' ? (
                  <div className="description">{answerGuideText}</div>
                ) : null}
                {subText != '' && !mainType && <div className="title">{subText}</div>}
                {hintText.length != 0 &&
                  !mainType &&
                  ExampaperStatus !== 'EXAM' &&
                  ExampaperStatus !== 'AFTERCLASS' && (
                    <Dropdown overlay={menu}>
                      <div className={styles.tipButton}>
                        {/* {"提示语（"+hintText.length+"）"} */}
                        <FormattedMessage
                          id="app.paper.process.node.tip"
                          defaultMessage="提示语({param})"
                          values={{ param: hintText.length }}
                        ></FormattedMessage>
                        <Icon type="down" />
                      </div>
                    </Dropdown>
                  )}
              </div>
            );
          }
        } else {
          return (
            <div
              className="problem"
              key={'problem_' + mainIndex + staticIndex.questionIndex + staticIndex.subIndex}
            >
              <div className="title">{questionPatternInstanceName}</div>
              {answerGuideText == 'NO_GUIDE' ? null : (
                <div className="description">{answerGuideText}</div>
              )}
              {subText != '' && <div className="description">{subText}</div>}
              {hintText.length != 0 &&
                ExampaperStatus !== 'EXAM' &&
                ExampaperStatus !== 'AFTERCLASS' && (
                  <Dropdown overlay={menu}>
                    <div className={styles.tipButton}>
                      {/* {"提示语（"+hintText.length+"）"} */}
                      <FormattedMessage
                        id="app.paper.process.node.tip"
                        defaultMessage="提示语({param})"
                        values={{ param: hintText.length }}
                      ></FormattedMessage>
                      <Icon type="down" />
                    </div>
                  </Dropdown>
                )}
            </div>
          );
        }
    }
  }

  renderSoundRecord(keyTime, frontEndModuleName) {
    const { paperData, masterData, index } = this.props;
    const { subfocusIndex, mainType } = this.state;
    if (mainType) {
      //答题指导独立显示
      return null;
    }
    if (frontEndModuleName) {
      const PluginSoundRecord = require('@/frontlib/' +
        frontEndModuleName +
        'Plugin/Static' +
        frontEndModuleName +
        'Card/SoundRecord').default;

      return (
        <PluginSoundRecord
          paperData={paperData}
          masterData={masterData}
          subfocusIndex={subfocusIndex}
          key={keyTime.getTime()}
          callback={(res, preStaticIndex) => {
            const ItemData =
              paperData.paperInstance[masterData.staticIndex.mainIndex - 1].questions[
                masterData.staticIndex.questionIndex
              ].data;
            ItemData.subQuestion[subfocusIndex].receivePoints = res.result.overall;
            ItemData.subQuestion[subfocusIndex].answerValue = res;
            ItemData.totalPoints = res.result.rank;
            let receivePoints = 0;
            for (let i in ItemData.subQuestion) {
              if (ItemData.subQuestion[i].receivePoints) {
                receivePoints = receivePoints + Number(ItemData.subQuestion[i].receivePoints);
              }
            }
            receivePoints = receivePoints / ItemData.subQuestion.length;
            ItemData.receivePoints = receivePoints;
            index.SpecialPluginScoring();
          }}
        />
      );
    }
  }

  render() {
    const { questionPatternInstanceName, isRecord, mainType, ishaveMore } = this.state;
    const { paperData, masterData } = this.props;
    let keyTime = new Date();

    let height = '583px';

    let isPlugin = false;
    let frontEndModuleName = '';
    if (
      masterData.staticIndex.mainIndex > 0 &&
      paperData.paperInstance[masterData.staticIndex.mainIndex - 1].pattern &&
      paperData.paperInstance[masterData.staticIndex.mainIndex - 1].pattern.patternPlugin
    ) {
      isPlugin = isUsePlugin(
        paperData.paperInstance[masterData.staticIndex.mainIndex - 1].pattern.patternPlugin
          .pluginPhase,
        'P4_SHOW_STATIC_QUESTION'
      );
      frontEndModuleName =
        paperData.paperInstance[masterData.staticIndex.mainIndex - 1].pattern.patternPlugin
          .frontEndModuleName;
    }

    if (isRecord == -1 && !isPlugin) {
      height = '659px';
    }

    return (
      <div className="paper_rightContent" id="paper_rightContent" style={{ height: height }}>
        {this.renderDescription(questionPatternInstanceName, isPlugin, frontEndModuleName)}

        {!mainType && (
          <div className="addquestion_Item" id="addquestion_Item">
            {this.renderItemCard()}
          </div>
        )}
        <Tips paperData={paperData} masterData={masterData} mainType={mainType} isRecord={isRecord} isPlugin={isPlugin} />
        {!mainType && !isPlugin ? (
          <SoundRecording
            paperData={paperData}
            masterData={masterData}
            isRecord={isRecord}
            key={keyTime.getTime()}
            callback={(e, preStaticIndex) => {
              let staticIndex = masterData.staticIndex;

              if (preStaticIndex) {
                staticIndex = preStaticIndex;
              }
              let paperInstance = paperData.paperInstance;
              let ItemData = {};
              if (
                paperInstance[staticIndex.mainIndex - 1].pattern.questionPatternType == 'COMPLEX'
              ) {
                ItemData =
                  paperInstance[staticIndex.mainIndex - 1].questions[0].data.groups[
                    staticIndex.questionIndex
                  ].data;
              } else {
                ItemData =
                  paperInstance[staticIndex.mainIndex - 1].questions[staticIndex.questionIndex]
                    .data;
              }
              /**
               * @Author    tina.zhang
               * @DateTime  2018-11-02
               * @copyright 返回小题序号
               * @return    {[type]}    [description]
               */
              let returnSubIndex = function(masterData, staticIndex) {
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
                let subIndex = returnSubIndex(masterData, staticIndex);
                ItemData.subQuestion[subIndex].answerValue = e;
              }
              this.scoringMachine(ItemData, preStaticIndex);
            }}
          />
        ) : (
          this.renderSoundRecord(keyTime, frontEndModuleName)
        )}
      </div>
    );
  }
}
