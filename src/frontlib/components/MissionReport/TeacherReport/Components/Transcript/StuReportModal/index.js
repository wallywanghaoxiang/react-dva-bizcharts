import React, { Component } from 'react';
import { Modal } from 'antd';
import styles from './index.less';
import ModalReport from '@/frontlib/components/MissionReport/StudentReport/ModalReport';

class StuReportModal extends Component {
  state = {
    show: true
  };

  componentWillMount() {
  }

  onClose = () => {
    const { onCloseModal } = this.props;
    onCloseModal();
  }


  render() {
    const { show } = this.state;
    const { type, data } = this.props;
    const tit = (
      <span style={{ marginBottom: '10px' }}>
        {data.name}
        <span style={{ width: "1px", height: "14px", background: "rgba(204,204,204,1)", display: "inline-block", margin: "0px 20px" }} />
        {data.className}
      </span>
    )
    return (
      <Modal
        style={{ height: 'calc(100vh - 60px)' }}
        visible={show}
        centered
        title={tit}
        maskClosable={false}
        destroyOnClose
        onCancel={this.onClose}
        okText=""
        width='calc(100vw - 20px)'
        wrapClassName={styles.stuReportModal}
      >
        <div id="popWindow">
          <ModalReport type={type} id={data.taskId} paperId={data.paperId} studentId={data.studentId} />
        </div>

      </Modal>
    )
  }
}

export default StuReportModal
