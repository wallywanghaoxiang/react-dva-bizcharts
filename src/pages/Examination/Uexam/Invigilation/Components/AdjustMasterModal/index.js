import React, { useState, useCallback, useMemo } from 'react';
import { Modal, message } from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import { stringFormat } from '@/utils/utils';
import styles from './index.less';

/**
 * 调整主监考老师
 * @author tina.zhang
 * @date   2019-8-15 17:11:13
 * @param {Array} batchList - 批次列表
 * @param {string} onModalClose - 弹窗关闭事件
 */
function AdjustMasterModal(props) {
  const { batchList, dispatch, onModalClose } = props;

  // 已选批次数量
  const seletedBatches = useMemo(() => {
    return batchList.filter(v => v.selected);
  }, [batchList]);

  // 主监考设置结果
  const [masters, setMasters] = useState(() => {
    const batches = [];
    seletedBatches.forEach(v => {
      if (v.teacherList && v.teacherList.length > 0) {
        const master = v.teacherList.find(t => t.type === 'MASTER');
        batches.push({
          subTaskId: master.subTaskId,
          teacherId: master.teacherId,
          teacherName: master.teacherName,
          type: 'MASTER',
        });
      }
    });
    return batches;
  });

  // 提交监考老师
  const submitTeachers = useCallback(() => {
    dispatch({
      type: 'invigilation/submitMasters',
      payload: masters,
    }).then(res => {
      if (res.responseCode !== '200') {
        message.error(res.data);
        return;
      }
      if (onModalClose && typeof onModalClose === 'function') {
        onModalClose(true);
      }
    });
  }, [masters]);

  // 确定按钮事件
  const handleSubmit = useCallback(() => {
    submitTeachers();
  }, [masters]);

  // 取消按钮事件
  const handleCancel = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, []);

  // 列表项点击事件
  const handleTeacherItemClick = useCallback(
    teacher => {
      const newMasters = masters.filter(m => m.subTaskId !== teacher.subTaskId);
      newMasters.push({
        subTaskId: teacher.subTaskId,
        teacherId: teacher.teacherId,
        teacherName: teacher.teacherName,
        type: 'MASTER',
      });
      setMasters(newMasters);
    },
    [masters]
  );

  // 渲染列表
  const renderList = useCallback(
    batch => {
      return (
        <>
          <div key={batch.subTaskId} className={styles.batchInfo}>
            {batch.examBatchName}
          </div>
          {(!batch.teacherList || batch.teacherList.length === 0) && (
            <div
              key={batch.subTaskId}
              className={classnames(styles.batchInfo, styles.noneTeachers)}
            >
              {formatMessage({
                id: 'app.text.uexam.examination.invigilation.modal.resetmaster.none',
                defaultMessage: '暂无监考教师',
              })}
            </div>
          )}
          {batch.teacherList &&
            batch.teacherList.length > 0 &&
            batch.teacherList.map(t => {
              const isMaster = masters.some(
                m => m.subTaskId === t.subTaskId && m.teacherId === t.teacherId
              );
              return (
                <div
                  key={t.teacherId}
                  className={styles.teacherListItem}
                  onClick={() => handleTeacherItemClick(t)}
                  title={t.teacherName}
                >
                  {stringFormat(t.teacherName, 5)}
                  {isMaster && (
                    <span className={styles.master}>
                      {formatMessage({
                        id: 'app.text.uexam.examination.invigilation.modal.master',
                        defaultMessage: '主',
                      })}
                    </span>
                  )}
                </div>
              );
            })}
        </>
      );
    },
    [masters]
  );

  return (
    <Modal
      visible
      closable={false}
      centered
      title={formatMessage({
        id: 'app.title.uexam.examination.invigilation.modal.resetmasterTitle',
        defaultMessage: '调整主监考教师',
      })}
      maskClosable={false}
      destroyOnClose
      width="460px"
      wrapClassName={styles.adjustMasterModal}
      onCancel={handleCancel}
      onOk={handleSubmit}
      // cancelText={formatMessage({ id: "app.button.uexam.examination.inspect.registration.import.footer.cancel", defaultMessage: "取消" })}
      okText={formatMessage({ id: 'app.button.comfirm', defaultMessage: '确认' })}
      // getContainer={false}
    >
      <div id="popWindow">
        <div className={styles.teacherList} style={{ maxHeight: `${window.innerHeight - 200}px` }}>
          {seletedBatches.map(v => renderList(v))}
        </div>
      </div>
    </Modal>
  );
}

export default connect()(AdjustMasterModal);
