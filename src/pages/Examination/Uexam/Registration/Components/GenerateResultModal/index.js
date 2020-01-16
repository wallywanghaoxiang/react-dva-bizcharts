/* eslint-disable react/jsx-indent */
import React, { useCallback } from 'react';
import { Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './index.less';

/**
 * 生成考号结果弹窗
 * @author tina.zhang
 * @date   2019-8-29 16:54:17
 * @param {number} studentNum - 弹窗关闭回调
 * @param {function} onModalClose - 弹窗关闭回调
 */
function GenerateResultModal(props) {
  const { studentNum, onModalClose } = props;

  // 关闭回调
  const handleModalCancel = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, []);

  return (
    <Modal
      visible
      closable
      centered
      maskClosable={false}
      destroyOnClose
      width="400px"
      wrapClassName={styles.generateResultModal}
      footer={null}
      onCancel={handleModalCancel}
      // getContainer={false}
    >
      <div id="popWindow" className={styles.generateResult}>
        <div className={styles.successIcon}>
          <i className="iconfont icon-right" />
        </div>
        <div className={styles.successText}>
          <FormattedMessage
            id="app.text.uexam.examination.inspect.registration.generate.result1"
            defaultMessage="为{content}生成考号成功！"
            values={{
              content: (
                <span className={styles.info}>
                  {formatMessage(
                    {
                      id: 'app.text.uexam.examination.inspect.registration.generate.result3',
                      defaultMessage: '{studentNum}名考生',
                    },
                    { studentNum: studentNum }
                  )}
                </span>
              ),
            }}
          />
        </div>
      </div>
    </Modal>
  );
}

export default GenerateResultModal;
