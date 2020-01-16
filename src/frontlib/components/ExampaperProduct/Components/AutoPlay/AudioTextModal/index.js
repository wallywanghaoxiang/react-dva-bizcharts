/* eslint-disable prefer-const */
import React, { Component } from 'react';
import { Modal } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import { checkTempStr } from '@/frontlib/utils/utils';

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
    const { onClose } = this.props;
    onClose();
  };

  onHandleOK = () => {
    this.setState({
      visible: false,
    });
    const { onClose } = this.props;
    onClose();
  };

  /**
   *  input 框处理
   */
  handlePaperHeadName = () => {};

  handleNavTime = () => {};

  render() {
    let { dataSource, title, evaluations } = this.props;

    dataSource = dataSource.split('\n');
    // dataSource = dataSource.replace(/\n/g,"<br/>");
    const { visible } = this.state;

    let style = {};
    if (evaluations) {
      style = {
        right: '100px',
      };
    }
    return (
      <Modal
        visible={visible}
        centered
        title={title || formatMessage({ id: 'app.title.tlyw', defaultMessage: '听力原文' })}
        closable={false}
        style={style}
        // cancelText="取消"
        // okText="关闭"
        maskClosable={false}
        // onCancel={this.onHandleCancel}
        // onOk={this.onHandleOK}
        className={evaluations ? styles.PaperevaluationsModal : styles.PaperModal}
        destroyOnClose
        footer={
          <button type="button" className="ant-btn ant-btn-primary" onClick={this.onHandleOK}>
            <span>{formatMessage({ id: 'app.text.close', defaultMessage: '关 闭' })}</span>
          </button>
        }
      >
        <div>
          {dataSource.map(item => {
            return (
              <div className={checkTempStr(item) ? styles.text : styles.text_normal}>{item}</div>
            );
          })}
        </div>
      </Modal>
    );
  }
}

export default AudioTextModal;
