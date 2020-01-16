import React, { Component } from 'react';
import { Modal, message } from 'antd';
import styles from './index.less';
import { formatMessage, defineMessages } from 'umi/locale';

/**
 * 音频原文
 */
class AudioTextModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
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
   *  input 框处理
   */
  handlePaperHeadName = () => {};
  handleNavTime = () => {};

  render() {
    let { dataSource } = this.props;

    dataSource = dataSource.split('\n');
    // dataSource = dataSource.replace(/\n/g,"<br/>");

    return (
      <Modal
        visible={this.state.visible}
        centered={true}
        title={formatMessage({id:"app.title.tlyw",defaultMessage:"听力原文"})}
        closable={false}
        // cancelText="取消"
        // okText="关闭"
        maskClosable={false}
        // onCancel={this.onHandleCancel}
        // onOk={this.onHandleOK}
        className={styles.PaperModal}
        destroyOnClose={true}
        footer={
          <button type="button" class="ant-btn ant-btn-primary" onClick={this.onHandleOK}>
            <span>{formatMessage({id:"app.text.close",defaultMessage:"关 闭"})}</span>
          </button>
        }
      >
        <div>
          {dataSource.map((item, index) => {
            return <div>{item}</div>;
          })}
        </div>
      </Modal>
    );
  }
}

export default AudioTextModal;
