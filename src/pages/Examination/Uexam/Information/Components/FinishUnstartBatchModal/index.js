import React, { useCallback, useMemo } from 'react';
import { Modal, Table } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
/**
 * 完成安排弹窗
 * @date   2019-8-3 15:19:43
 * @param {Array} batchList - 考点批次列表
 * @param {function} onModalClose - 弹窗关闭回调
 */
function FinishUnstartBatchModal(props) {
  const { batchList, onModalClose } = props;

  // get columns
  const getColumns = useMemo(() => {
    const columns = [
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.batch.finishmodal.examBatchTime',
              defaultMessage: '考试日期',
            })}
          </span>
        ),
        dataIndex: 'examBatchTime',
        key: 'examBatchTime',
        align: 'left',
        width: '25%',
        render: text => {
          return <span title={text}>{text}</span>;
        },
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.batch.finishmodal.examBatchName',
              defaultMessage: '批次',
            })}
          </span>
        ),
        dataIndex: 'examBatchName',
        key: 'examBatchName',
        align: 'left',
        width: '10%',
        render: text => {
          return <span title={text}>{text}</span>;
        },
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.batch.finishmodal.examPlaceName',
              defaultMessage: '考点',
            })}
          </span>
        ),
        dataIndex: 'examPlaceName',
        key: 'examPlaceName',
        align: 'left',
        width: '25%',
        render: text => {
          return <span title={text}>{text}</span>;
        },
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.batch.finishmodal.examRoomName',
              defaultMessage: '考场',
            })}
          </span>
        ),
        dataIndex: 'examRoomName',
        key: 'examRoomName',
        align: 'left',
        width: '10%',
        render: text => {
          return <span title={text}>{text}</span>;
        },
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.batch.finishmodal.teacherNames',
              defaultMessage: '监考老师',
            })}
          </span>
        ),
        dataIndex: 'teacherNames',
        key: 'teacherNames',
        align: 'left',
        width: '20%',
        render: text => {
          return <span title={text}>{text}</span>;
        },
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.batch.finishmodal.statusValue',
              defaultMessage: '状态',
            })}
          </span>
        ),
        dataIndex: 'statusValue',
        key: 'statusValue',
        align: 'left',
        width: '10%',
        render: text => {
          return <span title={text}>{text}</span>;
        },
      },
    ];
    return columns;
  }, [batchList]);

  // 结束
  const handleModalClose = useCallback(
    submit => {
      if (onModalClose && typeof onModalClose === 'function') {
        onModalClose(submit);
      }
    },
    [onModalClose]
  );

  return (
    <Modal
      visible
      wrapClassName={styles.finishUnstartBatchModal}
      closable={false}
      centered
      maskClosable={false}
      destroyOnClose
      width="750px"
      onOk={() => handleModalClose(true)}
      onCancel={() => handleModalClose()}
      okText={formatMessage({
        id: 'app.button.uexam.batch.finishmodal.confirm',
        defaultMessage: '确认结束',
      })}
      // getContainer={false}
    >
      <div>
        <div className={styles.warningInfo}>
          <i className="iconfont icon-tip" />
          {formatMessage({
            id: 'app.message.uexam.batch.finishmodal.tip',
            defaultMessage: '结束后，未开始批次中的学生将置为缺考，并不可修复，请谨慎操作',
          })}
        </div>
        <div className={styles.invigilationList}>
          <Table
            rowKey="subTaskId"
            className={styles.searchTable}
            pagination={{ hideOnSinglePage: true, pageSize: 10 }}
            columns={getColumns}
            dataSource={batchList}
          />
        </div>
      </div>
    </Modal>
  );
}

export default FinishUnstartBatchModal;
