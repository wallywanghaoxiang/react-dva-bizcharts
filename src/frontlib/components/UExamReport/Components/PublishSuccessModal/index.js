import React, { useCallback } from 'react';
import { Modal } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './index.less';

/**
 * 生成考号结果弹窗
 * @author tina.zhang
 * @date   2019-8-3 16:45:37
 * @param {number} campusNum - 校区数量
 * @param {function} onModalClose - 弹窗关闭回调
 */
function PublishSuccessModal(props) {
  const { campusNum, onModalClose } = props;

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
      wrapClassName={styles.PublishSuccessModal}
      footer={null}
      getContainer={false}
      onCancel={handleModalCancel}
    >
      <div id="popWindow" className={styles.generateResult}>
        <div className={styles.successIcon}>
          <i className="iconfont icon-right" />
        </div>
        <div className={styles.successText}>
          <FormattedMessage
            id="app.text.uexam.publish.results.success.tip"
            defaultMessage="为{element}生成考试成绩报告成功！"
            values={{
              element: (
                <span className={styles.info}>
                  {formatMessage(
                    {
                      id: 'app.text.uexam.publish.campus.number',
                      defaultMessage: '{number}所学校',
                    },
                    { number: campusNum }
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

export default PublishSuccessModal;
