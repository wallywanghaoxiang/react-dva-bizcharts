import React, { Component } from 'react';
import styles from './index.less';
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
  CheckQuestionTagDialogTitle: { id: 'app.check.question.tag.dialog.title', defaultMessage: '题目标签' },
  CheckAnswerBtn: { id: 'app.check.answer.btn', defaultMessage: '答案' },
  ProofreadResultDialogTitle: { id: 'app.proofread.result.dialog.title', defaultMessage: '校对结果' },
  tagBtnTitle: { id: 'app.check.question.tag.btn', defaultMessage: '标签' },
  answerAnalysisBtnTitle: { id: 'app.answer.analysis.btn', defaultMessage: '答案解析' },
});
/**
 * 跟读模仿card展示插件
 *  整卷试做 展示card
 * @author tina.zhang
 */
class CopyReadCard extends Component {
  constructor(props) {
    super(props);
    this.state={
      id:"",
      subfocusIndex:-1,
      receivePoints:undefined
    }
  }

  componentWillMount(){
  }

  componentWillReceiveProps(nextProps) {
    const {masterData} = nextProps;
    let staticIndex = masterData.staticIndex;
    let mains = masterData.mains;
    let script =
      mains[staticIndex.mainIndex].questions[staticIndex.questionIndex].scripts[
        masterData.dynamicIndex.scriptIndex
      ];

    this.setState({subfocusIndex:script.subMappingIndex[0]})
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
      paperData,
      ExampaperStatus,
    } = this.props;
    
    /*小题展示*/
    let jsx = [];
    /*子题展示*/
    let subJsx = [];
    /*小题Data*/
    let questionIndexData = {};

    //二层题型展示
    questionIndexData = dataSource.data;
    jsx = this.mainQuestionItem(dataSource.data, jsx);

    return (
      <div style={{ height: '470px',overflow:'auto' }}>
          {jsx}        
      </div>
    );
  }
}

export default CopyReadCard;
