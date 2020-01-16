import React, { useState, useEffect, useCallback } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, Button, message, Divider } from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import ImportStudent from './ImportStudent';
import LoadingModal from '../LoadingModal';
// import loadingGif from '@/assets/loading.gif';
import styles from './index.less';

/**
 * 导入学生
 * @author tina.zhang
 * @date   2019-7-30 18:43:55
 * @param {string} taskId - 任务ID
 * @param {string} onModalClose - 弹窗关闭事件
 */
function ImportModal(props) {
  const { taskId, dispatch, campusInfo, onModalClose, selectedStudentList } = props;

  // 组件卸载，清空已选学生列表
  useEffect(() => {
    return () => {
      dispatch({
        type: 'registration/updateSelectedStudents',
        payload: { students: [], type: 'unmout' },
      });
    };
  }, []);

  // const [visible, setVisible] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 取消按钮事件
  const handleCancel = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, [selectedStudentList]);

  // 确定按钮事件
  const handleSubmit = useCallback(() => {
    if (selectedStudentList.length < 1) {
      message.warn('请添加学生');
      return;
    }
    setSubmitting(true);
    dispatch({
      type: 'registration/submitStudentList',
      payload: {
        campusId: localStorage.campusId,
        studentList: selectedStudentList,
      },
    }).then(res => {
      setSubmitting(false);
      if (res.responseCode !== '200') {
        message.error(res.data);
        return;
      }
      message.success('导入成功');
      if (onModalClose && typeof onModalClose === 'function') {
        onModalClose(true);
      }
    });
  }, [selectedStudentList]);

  // 弹窗底部菜单
  const renderFooter = useCallback(() => {
    return (
      <div className={styles.modalFooter}>
        <span className={styles.footerInfo}>
          {/* 已选学生数量 */}
          <FormattedMessage
            id="app.text.examination.inspect.registration.import.footer.selectedNum"
            defaultMessage="已选：{selectedNum}"
            values={{
              selectedNum: <span className={styles.selectedNum}>{selectedStudentList.length}</span>,
            }}
          />
          {/* 已导入学生总数 existNum */}
          {campusInfo && (
            <>
              <Divider type="vertical" />
              <FormattedMessage
                id="app.text.examination.inspect.registration.import.footer.impotNum"
                defaultMessage="已导：{importNum}"
                values={{
                  importNum: <span className={styles.normalNum}>{campusInfo.existNum}</span>,
                }}
              />
            </>
          )}
          {/* 学生总数 studentNum */}
          {campusInfo && (
            <>
              <Divider type="vertical" />
              <FormattedMessage
                id="app.text.examination.inspect.registration.import.footer.stuSumNum"
                defaultMessage="总人数：{stuSumNum}"
                values={{
                  stuSumNum: <span className={styles.normalNum}>{campusInfo.studentNum}</span>,
                }}
              />
            </>
          )}
        </span>
        <Button onClick={() => handleCancel()}>
          {formatMessage({
            id: 'app.button.uexam.examination.inspect.registration.import.footer.cancel',
            defaultMessage: '取消',
          })}
        </Button>
        <Button
          className={styles.btnOk}
          onClick={() => handleSubmit()}
          disabled={selectedStudentList.length <= 0}
        >
          {formatMessage({
            id: 'app.button.uexam.examination.inspect.registration.import.footer.import',
            defaultMessage: '导入',
          })}
        </Button>
      </div>
    );
  }, [selectedStudentList, campusInfo]);

  return (
    <Modal
      // style={{ height: "463px" }} // {{ height: 'calc(523px - 60px)' }}
      visible
      closable={false}
      centered
      title={formatMessage({
        id: 'app.title.uexam.examination.inspect.registration.import.modalTitle',
        defaultMessage: '选择考生',
      })}
      maskClosable={false}
      destroyOnClose
      // onCancel={handleCloseModal}
      okText=""
      width="630px" // 'calc(100vw - 160px)'
      wrapClassName={styles.importModal}
      footer={renderFooter()}
      // getContainer={false}
    >
      <div id="popWindow">
        <ImportStudent taskId={taskId} />
        {submitting && (
          <LoadingModal>
            {formatMessage({
              id: 'app.text.uexam.examination.inspect.registration.import.submitting',
              defaultMessage: '正在导入考生…请稍候',
            })}
          </LoadingModal>
        )}
      </div>
    </Modal>
  );
}

export default connect(({ registration }) => ({
  selectedStudentList: registration.selectedStudentList, // 已选中学生名单
  campusInfo: registration.campusInfo, // 当前校区状态信息
}))(withRouter(ImportModal));
