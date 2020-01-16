import React, { Component } from 'react';
import { Modal, message } from 'antd';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';

import ResultPaper from "./ResultPaper";
import styles from './index.less';


/**
 * 保存开卷介绍入参 {
paperId (string, optional): 试卷ID ,
paperHeadName (string, optional): 开卷介绍文本 ,
paperHeadAudio (string, optional): 开卷介绍音频ID ,
paperIntroductionTime (integer, optional): 开卷介绍音频持续时间 ,
navTime (integer, optional): 跳转倒计时
}
 */
class ResultExamModal extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      upLoadSuccess: false,
      id: '',
      duration: 0,
      audioData: null,
      name: '',
      audioUrl: "",
      isPlay: false,
    };
  }

  componentDidMount() {
    const { dataSource } = this.props;
    if (dataSource.paperHeadAudioUrl) {
      this.paperHeadName = dataSource.paperHeadName;
      this.navTime = dataSource.paperHeadNavTime;
      this.setState({
        id: dataSource.paperHeadAudio,
        audioUrl: dataSource.paperHeadAudioUrl,
        duration: dataSource.paperHeadAudioTime,
        name: dataSource.name
      })
    }
  }

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
    this.props.callback();
  };

  onHandleOK = () => {
    let self = this;
    const { form } = self.props;
    form.validateFields((err, values) => {
      if (err) {
        message.warning(formatMessage({id:"app.text.validateFields",defaultMessage:"请填写完整数据！"}));
        return
      }
      if (Number(self.navTime) >= 0) {
        self.props.callback(self.paperHeadName, self.navTime, self.state, this.paperHeadDelay);
        self.setState({
          visible: false,
        });
        self.props.onClose();
      } else {
        // message.warning('等待时间请输入大于0的数字!');
      }
    })
  };

  isRequired = (rules, value, callback) => {
    if (Number(value) >= 0 && Number(value) < 100) {
      callback()
    } else {
      callback(formatMessage({id:"app.text.ddsjqsrxy",defaultMessage:"等待时间请输入大于0,小于100的数字"}))
    }

  }

  render() {
    const { dataSource ,instructions} = this.props;
    const { visible } = this.state;
    return (
      <Modal
        visible={visible}
        centered
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className={styles.PaperModal}
        destroyOnClose
        maskClosable={false}
        footer={false}
      >
        <div className="paperTitle"><FormattedMessage id="app.open.book.add.btn" defaultMessage="查看练习结果" /></div>
        <ResultPaper paperList={dataSource} index={this} instructions={instructions}/>
      </Modal>
    );
  }
}

export default ResultExamModal;
