import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Modal, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import Pagination from '@/components/Pagination';
import styles from './index.less';

/**
 * 完成报名弹窗
 * @author tina.zhang
 * @date   2019-8-29 16:49:57
 * @param {Array} classList - 班级列表
 * @param {function} onModalClose - 弹窗关闭回调
 */
function FinishModal(props) {
  const { classList, onModalClose } = props;

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: classList.length,
  });
  const paginationRef = useRef();
  paginationRef.current = pagination;

  // 渲染列表项
  const renderClassItem = useCallback(clazz => {
    return (
      <div key={clazz.classId} className={styles.campusLisItem}>
        {clazz.className}
      </div>
    );
  }, []);

  // 分页事件
  const handlePageChanged = useCallback(pageIndex => {
    setPagination({
      ...paginationRef.current,
      current: pageIndex,
    });
  }, []);

  // 数据源
  const dataSource = useMemo(() => {
    const { current, pageSize } = pagination;
    const take = (current - 1) * pageSize;
    const source = classList.slice(take, take + pageSize);
    return source;
  }, [pagination.current]);

  // 忽略并完成报名
  const handleSubmit = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose('submit');
    }
  }, []);

  // 去报名
  const handleGotoRegistration = useCallback(() => {
    if (onModalClose && typeof onModalClose === 'function') {
      onModalClose();
    }
  }, []);

  // 渲染弹窗底部按钮
  const renderFooter = useCallback(() => {
    return (
      <div className={styles.modalFooter}>
        <Button onClick={() => handleGotoRegistration()}>
          {formatMessage({
            id: 'app.text.uexam.examination.inspect.registration.finishmodal.goreg',
            defaultMessage: '去报名',
          })}
        </Button>
        <Button onClick={() => handleSubmit()}>
          {formatMessage({
            id: 'app.button.uexam.examination.inspect.registration.finishmodal.submit',
            defaultMessage: '忽略并上报名单',
          })}
        </Button>
      </div>
    );
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
      footer={renderFooter()}
      // getContainer={false}
    >
      <div id="popWindow">
        <div className={styles.warningInfo}>
          <i className="iconfont icon-tip" />
          {formatMessage({
            id: 'app.message.uexam.examination.inspect.registration.finishmodal.tip2',
            defaultMessage: '以下班级没有考生信息，确定不需要报名？',
          })}
        </div>
        <div className={styles.campusList}>{dataSource.map(v => renderClassItem(v))}</div>
        {pagination.total > pagination.pageSize && (
          <div className={styles.pagination}>
            <Pagination
              {...pagination}
              // current={state.pagination.current}
              // pageSize={state.pagination.pageSize}
              // total={studentList.length}
              onChange={handlePageChanged}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default FinishModal;
