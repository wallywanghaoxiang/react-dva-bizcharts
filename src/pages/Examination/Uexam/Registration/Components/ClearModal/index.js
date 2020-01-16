import React, { useState, useCallback, useRef } from 'react';
import { Modal, Button, Radio } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';

const { confirm } = Modal;

/**
 * 清空名单弹窗
 * @author tina.zhang
 * @date   2019-8-2 17:16:01
 * @param {string} onModalClose - 弹窗关闭事件
 */
function ClearModal(props) {
  const { onModalClose } = props;
  const [value, setValue] = useState(null);
  const [showTip, setShowTip] = useState(false);

  // radio 选择事件
  const handleRadioChange = useCallback(e => {
    setShowTip(false);
    const { value: val } = e.target;
    setValue(val);
  }, []);

  // 取消按钮事件
  const handleCancel = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, []);

  // 确定按钮事件
  const valueRef = useRef();
  valueRef.current = value;
  const handleSubmit = useCallback(() => {
    if (!valueRef.current) {
      setShowTip(true);
      return;
    }
    confirm({
      title: formatMessage({
        id: 'app.message.uexam.examination.inspect.registration.clearmodal.confirm',
        defaultMessage: '清空后考生名单将无法找回，确定清空？',
      }),
      okText: formatMessage({
        id: 'app.button.uexam.examination.inspect.registration.clearmodal.confirmOK',
        defaultMessage: '清空',
      }),
      cancelText: formatMessage({
        id: 'app.button.uexam.examination.inspect.registration.import.footer.cancel',
        defaultMessage: '取消',
      }),
      className: styles.clearConfirm,
      onOk() {
        if (onModalClose && typeof onModalClose === 'function') {
          onModalClose(valueRef.current);
        }
      },
      onCancel() {},
    });
  }, [value, showTip]);

  // 弹窗底部菜单
  const renderFooter = useCallback(() => {
    return (
      <div className={styles.modalFooter}>
        {showTip && (
          <span className={styles.footerInfo}>
            {formatMessage({
              id: 'app.text.uexam.examination.inspect.registration.clearmodal.tip',
              defaultMessage: '请选择清空范围',
            })}
          </span>
        )}
        <Button onClick={() => handleCancel()}>
          {formatMessage({
            id: 'app.button.uexam.examination.inspect.registration.import.footer.cancel',
            defaultMessage: '取消',
          })}
        </Button>
        <Button className={styles.btnOk} onClick={() => handleSubmit()}>
          {formatMessage({
            id: 'app.button.uexam.examination.inspect.registration.import.footer.submit',
            defaultMessage: '确定',
          })}
        </Button>
      </div>
    );
  }, [showTip]);

  return (
    <Modal
      visible
      closable={false}
      centered
      title={formatMessage({
        id: 'app.title.uexam.examination.inspect.registration.clearmodal',
        defaultMessage: '请选择',
      })}
      maskClosable={false}
      destroyOnClose
      okText=""
      width="360px"
      wrapClassName={styles.clearModal}
      footer={renderFooter()}
      // getContainer={false}
    >
      <div id="popWindow" className={styles.popWindow}>
        <Radio.Group onChange={handleRadioChange} value={value}>
          <div className={styles.radioItem}>
            <Radio value="all">
              {formatMessage({
                id: 'app.button.uexam.examination.inspect.registration.clearmodal.all',
                defaultMessage: '全部',
              })}
            </Radio>
          </div>
          <div className={styles.radioItem}>
            <Radio value="class">
              {formatMessage({
                id: 'app.button.uexam.examination.inspect.registration.clearmodal.class',
                defaultMessage: '当前班级',
              })}
            </Radio>
          </div>
        </Radio.Group>
      </div>
    </Modal>
  );
}

export default ClearModal;
