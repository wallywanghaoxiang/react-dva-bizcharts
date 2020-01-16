import React, { Component } from 'react';
import styles from './index.less';
import AutoPlay from '@/frontlib/components/ExampaperProduct/Components/AutoPlay';
import IconButton from '@/frontlib/components/IconButton';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import AddNewSubjectModal from '@/frontlib/components/ExampaperProduct/Components/AddSubject/AddNewSubjectModal/api';
import { delPaperQuestion } from '@/services/api';
import { message } from 'antd';
import AnswersModal from './AnswersModal/api';
import AnalysisModal from './AnalysisModal/api';
import SubjectTag from '@/frontlib/components/ExampaperProduct/Components/SubjectTag/api';
import ValidateQuestion from '@/frontlib/components/ExampaperProduct/Components/ValidateQuestion/api';
import PublishCorrect from '@/frontlib/components/ExampaperProduct/Components/PublishCorrect/api';

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
  CheckQuestionTagDialogTitle: { id: 'app.check.question.tag.dialog.title', defaultMessage: '题目标签' },
  CheckAnswerBtn: { id: 'app.check.answer.btn', defaultMessage: '答案' },
  ProofreadResultDialogTitle: { id: 'app.proofread.result.dialog.title', defaultMessage: '校对结果' },
  tagBtnTitle: { id: 'app.check.question.tag.btn', defaultMessage: '标签' },
  answerAnalysisBtnTitle: { id: 'app.answer.analysis.btn', defaultMessage: '答案解析' },
});
/**
 * 跟读模仿card展示插件
 * 制题时展示的card
 * @author tina.zhang
 */
class CopyReadCard extends Component {
  constructor(props) {
    super(props);
    this.state={
      id:"",
      subfocusIndex:0,
      receivePoints:undefined
    }
  }

  componentWillMount(){
  }

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-25
   * @copyright 编辑题目
   * @return    {[type]}    [description]
   */
  editQuestion() {
    const {
      dataSource,
      editData,
      masterData,
      paperID,
      type,
      pattern,
    } = this.props;
    AddNewSubjectModal({
      dataSource: {
        title: '编辑题目',
        questionData: editData,
        paperID: paperID,
        masterData: masterData,
        patternType: type,
        initData: dataSource, //初始数据
        pattern:pattern
      },
      callback: questioJson => {
        //this.reLoadPaperData();
        this.reLoadVerifiesData();
      },
    });
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
   * @DateTime  2018-10-26
   * @copyright 删除题目
   * @return    {[type]}    [description]
   */
  delQuestion() {
    const { dataSource, paperID } = this.props;
    delPaperQuestion({
      questionId: dataSource.id,
      paperId: paperID,
    }).then(e => {
      if (e) {
        let res = e
        if (typeof(e) == "String") {
          res = JSON.parse(e);
        }
        if (res.responseCode === '200') {
          message.success('题目删除成功！');
          this.reLoadPaperData();
        } else {
          message.error(res.data);
        }
      }
    });
  }


  /**
   * @Author    tina
   * @DateTime  2018-11-01
   * @copyright 标签
   * @param     {[type]}    tag [description]
   * @return    {[type]}             [description]
   */
  tagQuestion() {
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
    const { paperID, masterData, dataSource, invalidate, isExamine,ExampaperStatus } = this.props;
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
        status: isExamine == 1&&ExampaperStatus!=='VALIDATE' ? 'SHOW' : '',
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

  /**
   * @Author    tina.zhang
   * @DateTime  2018-10-25
   * @copyright 小题主题干部分渲染 包含普通，二层
   * @param     {[type]}    newData  [description]
   * @param     {[type]}    mainData [description]
   * @param     {[type]}    jsx      [description]
   * @return    {[type]}             [description]
   */
  mainQuestionItem(mainData, jsx) {
    const { questionCount, type, focus, dataSource, masterData } = this.props;
    let num = '';
    if (type == 'NORMAL' && questionCount && questionCount.trim()!= "") {
      num = questionCount + '. ';
    } else {
      num = '';
    }
    console.log(mainData)
    jsx.push(
      <AutoPlay
        id={mainData.mainQuestion["stemAudio"]}
        id2={mainData.mainQuestion["stemAudio2"] || ""}
        key={mainData.mainQuestion["stemAudio2"] ? 'AutoPlay_' +mainData.mainQuestion["stemAudio2"] : 'AutoPlay_' + mainData.mainQuestion["stemAudio"]}
        focusId={this.state.id}
        focus={true}
        callback={id => {
          this.setState({ id: id });
        }}
      />
    );

    //主题干文本
    let stemText = "";

    if (mainData.mainQuestion["stemText"]) {
      stemText = mainData.mainQuestion["stemText"].split('. ')
    } else {
      stemText = [];
    }


    stemText.map((item, index) => {
      let endStr = ". ";
      if(Number(index) === Number(stemText.length - 1)){
        endStr =  "";
      }
      //短文前面空2格
      if(Number(index) === Number(this.state.subfocusIndex)){
        jsx.push(<span className={styles.orange}>{item + endStr}</span>);
      }else{
        jsx.push(<span className={styles.card_content}>{item + endStr}</span>);
      }
      
    });

 
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
  subQuestionItem(mainData, subJsx) {
    const {
      type,
      onChange
    } = this.props;
    const {subfocusIndex} = this.state;
    this.subStyle = '';
    //非合并答题
    for (let i in mainData.subQuestion) {
      let subCardJsx = [];
      subCardJsx.push(
          <AutoPlay
            id={mainData.subQuestion[i]["subQuestionStemAudio"]}
            id2={mainData.subQuestion[i]["subQuestionStemAudio2"]}
            focus={true}
            focusId={this.state.id}
            key={mainData.subQuestion[i]["subQuestionStemAudio2"] ? 'AutoPlay_' +mainData.subQuestion[i]["subQuestionStemAudio2"]+i : 'AutoPlay_' + mainData.subQuestion[i]["subQuestionStemAudio"] + i}
            callback={id => {
              this.setState({ id: id });
            }}
          />
      )
      subJsx.push(
        <div className={Number(subfocusIndex) === Number(i) ? "backs" : "nobacks"}
          onClick={()=>{
            this.setState({subfocusIndex:i})
            onChange(i);
          }}>
          {subCardJsx}
        </div>
      );
    }
    return subJsx;
  }
  /**
   * @Author    tina.zhang
   * @DateTime  2018-11-05
   * @copyright 底部按钮控制
   * @param     {[type]}    questionIndexData 题目数据
   * @param     {[type]}    modelStatus       页面状态
   * @param     {string}   isExamine          是否查看模式
   * @return    {[type]}                      [description]
   */
  renderFooter(questionIndexData, modelStatus, isExamine) {
    let jsx = [];
    if (questionIndexData.totalPoints != undefined) {
      jsx.push(
        <div
          className={styles.questionbtn}
          onClick={() => {
            AnalysisModal({
              dataSource: questionIndexData,
              masterData: this.props.masterData,
              callback: (paperHeadName, navTime, state) => {},
            });
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
              onClick={() => {
                let self = this;
                setTimeout(function(){
                  AnswersModal({
                    dataSource: questionIndexData,
                    masterData: self.props.masterData,
                    callback: (paperHeadName, navTime, state) => {},
                  });
                },100)
              }}
            >
              <IconButton iconName="icon-file" text={formatMessage(messages.CheckAnswerBtn)} />
            </div>
            <div className={styles.addquestion_line} />
            <div className={styles.questionbtn}>
              <IconButton iconName="icon-tag" text={formatMessage(messages.tagBtnTitle)} onClick={this.tagQuestion.bind(this)} />
            </div>
          </div>
        );
      } else if (modelStatus == 'VALIDATE' || modelStatus == 'CORRECT') {
        return (
          <div className={styles.addquestion_flex}>
            {jsx}
            <div
              className={styles.questionbtn}
              onClick={() => {
                let self = this;
                setTimeout(function(){
                    AnswersModal({
                      dataSource: questionIndexData,
                      masterData: self.props.masterData,
                      callback: (paperHeadName, navTime, state) => {},
                    });
                },100)
              }}
              
            >
              <IconButton iconName="icon-file" text={formatMessage(messages.CheckAnswerBtn)} />
            </div>
            <div className={styles.addquestion_line} />
            <div className={styles.questionbtn}>
              <IconButton iconName="icon-tag" text={formatMessage(messages.tagBtnTitle)} onClick={this.tagQuestion.bind(this)} />
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
                  {invalidateArr.length == 0 && <span className={styles.statusShow}>{formatMessage(messages.questionProofread)}</span>}
                  {invalidateArr.length > 0 &&
                    invalidateArr[0].verifyStatus == 300 && (
                      <span className={styles.statusOk}>{formatMessage(messages.validatePass)}</span>
                    )}
                  {invalidateArr.length > 0 &&
                    invalidateArr[0].verifyStatus == 0 && (
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
                onClick={() => {
                  let self = this;
                  setTimeout(function(){
                    AnswersModal({
                      dataSource: questionIndexData,
                      masterData: self.props.masterData,
                      callback: (paperHeadName, navTime, state) => {},
                    });
                  },100)
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
                onClick={() => {
                  let self = this;
                  setTimeout(function(){
                    AnswersModal({
                      dataSource: questionIndexData,
                      masterData: self.props.masterData,
                      callback: (paperHeadName, navTime, state) => {},
                    });
                  },100)
                }}
              >
                <IconButton iconName="icon-file" text={formatMessage(messages.CheckAnswerBtn)} />
              </div>
              <div className={styles.addquestion_line} />
              <div className={styles.questionbtn}>
                <IconButton iconName="icon-tag" text={formatMessage(messages.tagBtnTitle)} onClick={this.tagQuestion.bind(this)} />
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
                    {invalidateArr.length == 0 && <span className={styles.statusShow}>{formatMessage(messages.questionProofread)}</span>}
                    {invalidateArr.length > 0 &&
                      invalidateArr[0].verifyStatus == 300 && (
                        <span className={styles.statusOk}>{formatMessage(messages.validatePass)}</span>
                      )}
                    {invalidateArr.length > 0 &&
                      invalidateArr[0].verifyStatus == 100 && (
                        <span className={styles.statusMeger}>{formatMessage(messages.validateIgnored)}</span>
                      )}
                    {invalidateArr.length > 0 &&
                      (invalidateArr[0].verifyStatus == 200||invalidateArr[0].verifyStatus == 250) && (
                        <span className={styles.statusMeger}>{formatMessage(messages.validateModified)}</span>
                      )}
                    {invalidateArr.length > 0 &&
                      invalidateArr[0].verifyStatus == 0 && (
                        <span className={styles.statusNo}>{formatMessage(messages.validateFail)}</span>
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
                onClick={() => {
                  let self = this;
                  setTimeout(function(){
                    AnswersModal({
                      dataSource: questionIndexData,
                      masterData: self.props.masterData,
                      callback: (paperHeadName, navTime, state) => {},
                    });
                  },100)
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
                {invalidateArr.length > 0 &&
                  invalidateArr[0].verifyStatus == 100 && (
                    <span className={styles.statusMeger}>{formatMessage(messages.validateIgnored)}</span>
                  )}
                {invalidateArr.length > 0 &&
                  (invalidateArr[0].verifyStatus == 200||invalidateArr[0].verifyStatus == 250) && (
                    <span className={styles.statusMeger}>{formatMessage(messages.validateModified)}</span>
                  )}
                {invalidateArr.length > 0 &&
                  invalidateArr[0].verifyStatus == 300 && (
                    <span
                      className={styles.statusOk}
                      onClick={this.publishCorrectSubmit.bind(this)}
                    >
                      {formatMessage(messages.passProofread)}
                    </span>
                  )}
                {invalidateArr.length > 0 &&
                  invalidateArr[0].verifyStatus == 0 && (
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
        case "EXAM":
          if (questionIndexData.totalPoints != undefined) {
            return (
              <div className={styles.addquestion_flex}>
              {jsx}
            </div>
            );
          } else {
            return null
          }
      }
    }
  }

  render() {
    const {
      dataSource,
      mainIndex,
      masterData,
      isExamine,
      paperData,
      ExampaperStatus,
    } = this.props;
    console.log(dataSource)
    
    /*小题展示*/
    let jsx = [];
    /*子题展示*/
    let subJsx = [];
    /*小题Data*/
    let questionIndexData = {};

    //二层题型展示
    questionIndexData = dataSource.data;
    jsx = this.mainQuestionItem(dataSource.data, jsx);

    subJsx = this.subQuestionItem(dataSource.data, subJsx);

    console.log("渲染")
    return (
      <div >
          {jsx}
          {subJsx}
          {questionIndexData.totalPoints != undefined? (
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
          )}
          {this.renderFooter(questionIndexData, ExampaperStatus, isExamine)}
      </div>
    );
  }
}

export default CopyReadCard;
