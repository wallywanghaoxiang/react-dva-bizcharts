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
function FinishModal(props) {
  const { batchList, onModalClose } = props;

  // get columns
  const getColumns = useMemo(() => {
    const columns = [
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.examination.invigilation.result.examPlaceName',
              defaultMessage: '考点',
            })}
          </span>
        ),
        dataIndex: 'examPlaceName',
        key: 'examPlaceName',
        align: 'left',
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.examination.invigilation.result.examDate2',
              defaultMessage: '考试日期',
            })}
          </span>
        ),
        dataIndex: 'examDate',
        key: 'examDate',
        align: 'left',
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.examination.invigilation.result.examRoomName',
              defaultMessage: '考场',
            })}
          </span>
        ),
        dataIndex: 'examRoomName',
        key: 'examRoomName',
        align: 'left',
      },
      {
        title: (
          <span>
            {formatMessage({
              id: 'app.title.uexam.examination.invigilation.result.examBatchName',
              defaultMessage: '批次',
            })}
          </span>
        ),
        dataIndex: 'examBatchName',
        key: 'examBatchName',
        align: 'left',
      },
    ];
    return columns;
  }, [batchList]);

  // 去安排
  const handleSubmit = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, []);

  return (
    <Modal
      visible
      closable={false}
      centered
      maskClosable={false}
      destroyOnClose
      width="500px"
      wrapClassName={styles.finishModal}
      onOk={handleSubmit}
      cancelButtonProps={{ style: { display: 'none' } }}
      okText={formatMessage({
        id: 'app.button.uexam.examination.invigilation.finishmodal.goto',
        defaultMessage: '去安排',
      })}
      // getContainer={false}
    >
      <div id="popWindow">
        <div className={styles.warningInfo}>
          <i className="iconfont icon-tip" />
          {formatMessage({
            id: 'app.message.uexam.examination.invigilation.finishmodal.tip',
            defaultMessage: '以下批次还没有安排监考老师，请安排',
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

export default FinishModal;
