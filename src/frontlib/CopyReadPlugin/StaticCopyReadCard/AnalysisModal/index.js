import React, { Component } from 'react';
import { Modal} from 'antd';
import styles from './index.less';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import TopOverallScore from './Components/TopOverallScore'
import Evaluate from './Components/Evaluate'
import ContentDetails from './Components/ContentDetails'
import OtherInfo from './Components/OtherInfo'

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
  pronunciation:{id: 'app.pronunciation', defaultMessage: '发音'},
  fluency: { id: 'app.fluency', defaultMessage: '流利度' },
  rhythm: { id: 'app.rhythm', defaultMessage: '韵律度' },
  overallAssessmentLabel: { id: 'app.overall.assessment.label', defaultMessage: '整体评价' },
  tip: { id: 'app.question.tips', defaultMessage: '点拨' },
});


/**
 * 答案
 */
class AnalysisModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      tokenId: "",
    };
  }

  componentDidMount() {

   
  }

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
   *句子权重计算
   *
   * @author tina.zhang
   * @date 2019-03-15
   * @param {*} dataSource
   * @param {*} index
   * @returns
   * @memberof AnalysisModal
   */
  weightGain(dataSource,index){
    let weightGainArr = [];
    let totalLength = 0 ;
    for(let i in dataSource.subQuestion){
      let itemLength = (dataSource.subQuestion[i]).closeOralQuestionAnswerInfo.referenceText.length;
      weightGainArr.push(itemLength);
      totalLength = totalLength + itemLength;
    }
    let weightGainNumber = (weightGainArr[index]/totalLength).toFixed(2);
    return weightGainNumber;
  }


  /**
   *跟读模仿的完整度，发育得分，流利度，韵律度计算
   *
   * @author tina.zhang
   * @date 2019-03-15
   * @param {*} key
   * @returns
   * @memberof AnalysisModal
   */
  calculateScore(key){
    const { dataSource } = this.props;
    let points = 0 ;
    for(let i in dataSource.subQuestion){
      let answerValue = (dataSource.subQuestion[i]).answerValue;
      if(answerValue && answerValue.result[key]){
        points = points + answerValue.result[key].score * this.weightGain(dataSource,i)
      }
    }
    return Math.ceil(points)
  }

  fourpointConversion(rank){
      if(rank < 70){
        return 1
      }else if(rank >=  70 && rank < 80){
        return 2
      }else if(rank >= 80 && rank < 90){
        return 3
      }else if(rank >= 90){
        return 4
      }
  }

  renderContent(dataSource) {
    let answerValue = {};
    answerValue= {
      "result":{
        "overall": dataSource.receivePoints,
        "rank": dataSource.totalPoints,
        "precision": 0.5,
        "pronunciation": {
            "score": this.calculateScore("pronunciation")
        },
        "integrity": {
            "score": this.calculateScore("integrity")
        },
        "fluency": {
            "score": this.calculateScore("fluency")
        },
        "rhythm": {
            "score": this.calculateScore("rhythm")
        }
      }
    }
    answerValue.result.details = [];
    for(let i in dataSource.subQuestion){
      answerValue.result.details[i] = {};
      if(dataSource.subQuestion[i].answerValue){
        answerValue.result.details[i].details = (dataSource.subQuestion[i]).answerValue.result.details;
        answerValue.result.details[i].text = "";
        answerValue.result.details[i].type = 2;
        answerValue.result.details[i].score = this.fourpointConversion((dataSource.subQuestion[i]).answerValue.result.overall);
      }else{
        answerValue.result.details[i].details = [];
        let referenceTextArr = ((dataSource.subQuestion[i]).closeOralQuestionAnswerInfo.referenceText+"").split(" ");
        for(let j in referenceTextArr){
          answerValue.result.details[i].details.push({
            "text":referenceTextArr[j],
            "type":2,
            "score":1
          })
        }
        answerValue.result.details[i].text = "";
        answerValue.result.details[i].type = 2;
        answerValue.result.details[i].score = 1;
      }
    }
    dataSource.answerValue = answerValue
    return (
      <div>
        <TopOverallScore
          score={dataSource.receivePoints}
          mark={dataSource.totalPoints}
        />
        <Evaluate
          big={true}
          resultJson={answerValue}
          normal={true}
        />
        <ContentDetails
          normal={true}
          data={dataSource}
          model={"eval.para.en"}
        />
        <OtherInfo
          data={dataSource}
          tokenId={this.state.tokenId}
          callback={this.playingId}
        />
      </div>
    );
  }
  playingId = (Id) => {
    this.setState({ tokenId: Id })
  }



  render() {
    const { dataSource } = this.props;
    const heightModal = window.innerHeight - 238;

    return (
      <Modal
          visible={this.state.visible}
          centered={true}
          title={formatMessage(messages.answerAnalysisDialogTitle)}
          closable={false}
          maskClosable={false}
          className={styles.PaperModal}
          destroyOnClose={true}
          footer={
            <button type="button" className="ant-btn ant-btn-primary" onClick={this.onHandleOK}>
              <FormattedMessage {...messages.closeBtnTit} />
            </button>}>
          <div  style={{ maxHeight: heightModal ,height: 'auto' ,overflow:"auto"}}>
            {this.renderContent(dataSource)}
          </div>
        </Modal>
      
    );
  }
}

export default AnalysisModal;
