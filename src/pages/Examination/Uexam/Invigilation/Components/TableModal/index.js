import React, { useCallback } from 'react';
import { Modal, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import InvigilationTable from '../InvigilationTable';
import styles from './index.less';

/**
 * 监考信息弹窗（完成安排的确认信息、查看安排详情）
 * @author tina.zhang
 * @date   2019-8-16 14:47:09
 * @param {Array} batchList - 考点批次列表
 * @param {string} title - 弹窗标题
 * @param {boolean} closeable - 是否显示关闭按钮
 * @param {boolean} showFooter - 是否显示底部按钮
 * @param {function} onModalClose - 弹窗关闭回调
 */
function TableModal(props) {
  const { batchList, title, closeable, showFooter, onModalClose } = props;

  // 确定
  const handleSubmit = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose(true);
    }
  }, []);

  // 取消
  const handleCancel = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, []);

  // 弹窗底部按钮
  const renderFooter = useCallback(() => {
    if (!showFooter) {
      return null;
    }
    return (
      <div className={styles.modalFooter}>
        <Button onClick={() => handleCancel()}>
          {formatMessage({
            id: 'app.button.uexam.examination.inspect.registration.import.footer.cancel',
            defaultMessage: '取消',
          })}
        </Button>
        <Button className={styles.btnOk} onClick={() => handleSubmit()}>
          {formatMessage({ id: 'app.button.comfirm', defaultMessage: '确认' })}
        </Button>
      </div>
    );
  }, [showFooter]);

  return (
    <Modal
      visible
      closable={closeable || false}
      centered
      title={title}
      maskClosable={false}
      destroyOnClose
      width="890px"
      wrapClassName={styles.tableModal}
      onOk={handleSubmit}
      onCancel={handleCancel}
      okText={formatMessage({ id: 'app.button.comfirm', defaultMessage: '确认' })}
      footer={renderFooter()}
      // getContainer={false}
    >
      <div id="popWindow">
        <InvigilationTable dataSource={batchList} />
      </div>
    </Modal>
  );
}

export default TableModal;
