import React, { Component } from 'react';
import { Modal, Slider, Divider } from 'antd';
import './index.less';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';

class VolumeWarnModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      value: props.dataSource.number,
      volumeValue: 30,
    };
  }

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };
  onHandleOK = () => {
    const { volumeValue } = this.state;
    this.props.callback(volumeValue);
    this.props.onClose();
    this.setState({
      visible: false,
    });
  };

  handleChange = value => {
    this.setState({
      volumeValue: value,
    });
  };
  render() {
    const { dataSource } = this.props;
    const type = dataSource.type;
    return (
      <Modal
        visible={this.state.visible}
        centered={true}
        title={formatMessage({id:"app.message.tip",defaultMessage:"提示"})}
        closable={true}
        maskClosable={false}
        cancelText=""
        okText={formatMessage({id:"app.text.know",defaultMessage:"我知道了"})}
        onOk={this.onHandleOK}
        onCancel={this.onHandleCancel}
        className="volumeWarnModal"
        width={500}
      >
        <div className="tip-box">
          <div className="icon">
            <i className="iconfont icon-info" />
          </div>
          <div className="text">{formatMessage({id:"app.text.tips_a",defaultMessage:"您的录音音量过小，请重新录音！"})}</div>
        </div>
      </Modal>
    );
  }
}

export default VolumeWarnModal;
