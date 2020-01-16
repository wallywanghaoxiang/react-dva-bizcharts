import React, { Component } from 'react';
import { Modal, Input,Checkbox } from 'antd';
const { TextArea } = Input;
import { formatMessage,FormattedMessage,defineMessages} from 'umi/locale';
const messages = defineMessages({ 
  BatchAnswersEdit: {
    id: 'app.batch.answers.edit',
    defaultMessage: '批量设置答案',
  }, 
  SaveBtn: {
    id: 'app.save',
    defaultMessage: '保存',
  },
  cancelBtn: {
    id: 'app.cancel',
    defaultMessage: '取消',
  },
  BatchAnswersEditIntroTips: {
    id: 'app.batch.answers.edit.intro.tips',
    defaultMessage: '多个答案使用“|”分隔!',
  },
});
class AddMoreAnswer extends Component {
  constructor(props) {
    super(props);
    const { dataSource } = props;
    this.state = {
      visible: true,
      values:'',
      isChecked:true
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
    this.props.callback(this.state.values,this.state.isChecked)
    this.props.onClose();
  };
  saveAnswers=(e)=>{
    this.setState({
      values: e.target.value,
    });
  }

  onChangeCheckbox = (e) => {
    this.setState({
      isChecked:e.target.checked
    })
  }
  render() {
    return (
      <Modal
        visible={this.state.visible}
        centered={true}
        title={formatMessage(messages.BatchAnswersEdit)}
        closable={false}
        width={725}
        maskClosable={false}
        cancelText={formatMessage(messages.cancelBtn)}
        okText={formatMessage(messages.SaveBtn)}
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
      >
      <div style={{position:"relative"}}>
        <p>{formatMessage(messages.BatchAnswersEditIntroTips)}</p>
        <Checkbox  style={{position:"absolute",top:"0px",right:"0px"}} checked={this.state.isChecked} onChange={this.onChangeCheckbox}>
          {<FormattedMessage id="app.auto.revising" defaultMessage="自动修订" />}
        </Checkbox>
        <TextArea rows={15}  onChange={this.saveAnswers}/>
      </div>
      </Modal>
    );
  }
}

export default AddMoreAnswer;
