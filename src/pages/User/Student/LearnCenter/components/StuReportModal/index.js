import React, { Component } from 'react';
import { Modal } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import ModalReport from '@/frontlib/components/MissionReport/StudentReport/ModalReport';

const messages = defineMessages({
  modalTit: { id: 'app.student.report.modal.title', defaultMessage: '报告详情' },
});
class StuReportModal extends Component {
  state = {
    show: true,
  };

  componentWillMount() {}

  onClose = () => {
    const { onCloseModal } = this.props;
    onCloseModal();
  };

  render() {
    const { show } = this.state;
    const { data } = this.props;
    return (
      <Modal
        visible={show}
        centered
        title={formatMessage(messages.modalTit)}
        maskClosable={false}
        destroyOnClose
        onCancel={this.onClose}
        okText=""
        style={{ height: 'calc(100vh - 60px)' }}
        width="calc(100vw - 20px)"
        wrapClassName={styles.stuReportModal}
      >
        <div id="popWindow">
          <ModalReport id={data.taskId} paperId={data.paperId} studentId={data.studentId} />
        </div>
      </Modal>
    );
  }
}

export default StuReportModal;
