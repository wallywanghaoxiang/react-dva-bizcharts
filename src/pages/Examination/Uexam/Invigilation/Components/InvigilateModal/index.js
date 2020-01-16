import React, { useState, useCallback, useMemo } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, message, Divider } from 'antd';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import InvigilateTeacher from './InvigilateTeacher';
import SetMaster from './SetMaster';
import styles from './index.less';

/**
 * 导入学生
 * @author tina.zhang
 * @date   2019-7-30 18:43:55
 * @param {string} batchList - 批次列表
 * @param {string} onModalClose - 弹窗关闭事件
 */
function InvigilateModal(props) {
  const { batchList, dispatch, onModalClose } = props;

  const [selectedTeachers, setSelectedTeachers] = useState([]);

  const [showSetMaster, setShowSetMaster] = useState(false);

  // 已选批次数量
  const seletedBatches = useMemo(() => {
    return batchList.filter(v => v.selected);
  }, []);

  // 提交监考老师
  const submitTeachers = useCallback(teachers => {
    const postData = [];
    seletedBatches.forEach(v => {
      teachers.forEach(t => {
        postData.push({
          subTaskId: v.subTaskId,
          teacherId: t.teacherId,
          teacherName: t.teacherName,
          type: t.type,
        });
      });
    });

    dispatch({
      type: 'invigilation/submitInvigilations',
      payload: postData,
    }).then(res => {
      if (res.responseCode !== '200') {
        message.error(res.data);
        return;
      }
      if (onModalClose && typeof onModalClose === 'function') {
        onModalClose(true);
      }
    });
  }, []);

  // 确定按钮事件
  const handleSubmit = useCallback(() => {
    if (selectedTeachers.length === 0) {
      message.warn(
        formatMessage({
          id: 'app.message.uexam.examination.invigilation.modal.invigilateteacher.noselected',
          defaultMessage: '请设置监考老师',
        })
      );
      return;
    }
    if (selectedTeachers.length > 1 && !showSetMaster) {
      setShowSetMaster(true);
      return;
    }
    submitTeachers(selectedTeachers);
  }, [selectedTeachers, showSetMaster]);

  // 取消按钮事件
  const handleCancel = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, [selectedTeachers]);

  // 教师选择回调
  const handleTeacherItemClick = useCallback(
    teacher => {
      const exists = selectedTeachers.some(v => v.teacherId === teacher.teacherId);
      if (!exists && selectedTeachers.length >= 3) {
        message.warn(
          formatMessage({
            id: 'app.message.uexam.examination.invigilation.modal.invigilateteacher.maxtip',
            defaultMessage: '监考老师最多只能选择3名',
          })
        );
        return;
      }
      let newList = [];
      if (exists) {
        newList = selectedTeachers.filter(v => v.teacherId !== teacher.teacherId);
      } else {
        newList = selectedTeachers.concat([teacher]);
      }
      setSelectedTeachers(
        newList.map((v, idx) => {
          return {
            ...v,
            type: idx === 0 ? 'MASTER' : 'TEACHER',
          };
        })
      );
    },
    [selectedTeachers]
  );

  // 设置主监考老师回调
  const handleSetMasterClick = useCallback(
    teacherId => {
      const teachers = selectedTeachers.map(v => {
        return {
          ...v,
          type: v.teacherId === teacherId ? 'MASTER' : 'TEACHER',
        };
      });
      setSelectedTeachers(teachers);
    },
    [selectedTeachers]
  );

  return (
    <div>
      <Modal
        visible
        closable={false}
        centered
        title={
          showSetMaster
            ? formatMessage({
                id: 'app.title.uexam.examination.invigilation.modal.setmasterTitle',
                defaultMessage: '设置主监考教师',
              })
            : formatMessage({
                id: 'app.title.uexam.examination.invigilation.modal.title',
                defaultMessage: '安排监考',
              })
        }
        maskClosable={false}
        destroyOnClose
        width={showSetMaster ? '450px' : '580px'}
        wrapClassName={styles.invigilateModal}
        onCancel={handleCancel}
        onOk={handleSubmit}
        // cancelText={formatMessage({ id: "app.button.uexam.examination.inspect.registration.import.footer.cancel", defaultMessage: "取消" })}
        okText={formatMessage({ id: 'app.button.comfirm', defaultMessage: '确认' })}
        // getContainer={false}
      >
        <div id="popWindow">
          {!showSetMaster && (
            <>
              <div className={styles.headerInfo}>
                <FormattedMessage
                  id="app.text.uexam.examination.invigilation.modal.selectedbatchnum"
                  defaultMessage="已选中批次：{batchNum}个"
                  values={{
                    batchNum: <span className={styles.batchNum}>{seletedBatches.length}</span>,
                  }}
                />
                <Divider type="horizontal" />
              </div>
              <InvigilateTeacher
                selectedTeachers={selectedTeachers}
                onItemClick={handleTeacherItemClick}
              />
            </>
          )}
          {showSetMaster && (
            <SetMaster selectedTeachers={selectedTeachers} onItemClick={handleSetMasterClick} />
          )}
        </div>
      </Modal>
    </div>
  );
}

export default connect(({ invigilation, loading }) => ({
  loading: loading.effects['invigilation/submitTeachers'],
}))(withRouter(InvigilateModal));
