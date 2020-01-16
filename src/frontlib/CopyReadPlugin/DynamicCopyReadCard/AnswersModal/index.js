import React, { Component } from 'react';
import { Modal, message } from 'antd';
import styles from './index.less';
import { fromCharCode } from '@/frontlib/utils/utils';
// import AutoPlay from '../AutoPlay';
import right_icon from '@/frontlib/assets/qus_right_icon.png';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
const messages = defineMessages({
  CheckAnswerBtn: { id: 'app.check.answer.btn', defaultMessage: '答案' },
  ReferenceByMachine: { id: 'app.reference.by.machine', defaultMessage: '机评参考' },
  AudioExample: { id: 'app.audio.example', defaultMessage: '示范朗读' },
  ReferenceAnswerlabel: { id: 'app.reference.answerlabel', defaultMessage: '参考答案' },
  ReferenceAnswerlabelTips: { id: 'app.reference.answerlabeltip', defaultMessage: '提示答案' },
  ReferenceAnswerlabelError: { id: 'app.reference.answerlabelerror', defaultMessage: '错误答案' },
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

  componentDidMount() {}

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
    if(this.props.report){
      return Number(masterData)+index;
    }else{
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
  handlePaperHeadName = () => {};
  handleNavTime = () => {};

  renderContent(dataSource) {
    let patternType = dataSource.patternType;
    let jsx = [];
    let subsdata = dataSource.subQuestion;
    jsx = subsdata.map((item, index) => {
      return this.renderAnswer(item, index);
    });

    return jsx;
  }

  renderAnswer(data, index) {
    let patternType = this.props.dataSource.patternType;
    let closeOralAnswer = data.closeOralQuestionAnswerInfo;
      return (
        <div className={styles.marginTop20}>
          <div>
            <div>
              {Number(index) + 1 + '. '}
              {formatMessage(messages.ReferenceByMachine)}
            </div>
            {closeOralAnswer.referenceText}
          </div>
          {closeOralAnswer.referenceAudio && <div className={styles.marginTop10}>
            <div>{formatMessage(messages.AudioExample)}</div>
            {/* <AutoPlay id={closeOralAnswer.referenceAudio} /> */}
          </div>}
        </div>
      );
  }

  render() {
    const { dataSource } = this.props;
    console.log(dataSource)
    const { upLoadSuccess, name, audioUrl, isPlay } = this.state;
    return (
      <div>
        <Modal
            visible={this.state.visible}
            centered={true}
            title={formatMessage(messages.CheckAnswerBtn)}
            closable={false}
            maskClosable={false}
            className={styles.PaperModal}
            destroyOnClose={true}
            footer={
              <button type="button" class="ant-btn ant-btn-primary" onClick={this.onHandleOK}>
                <FormattedMessage {...messages.closeBtn} />
              </button>
            }
          >
            <div>{this.renderContent(dataSource)}</div>
    </Modal> 
      </div>
    );
  }
}

export default AnswersModal;
