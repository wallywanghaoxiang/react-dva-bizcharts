import React, { useCallback, useMemo, useRef } from 'react';
import { Checkbox, Button } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './index.less';

/**
 * 批次列表
 * @author tina.zhang
 * @date   2019-8-14 11:43:15
 * @param {Array} batchList - 批次列表(含是否已选属性)
 * @param {function} onBatchChanged - 批次选中回调事件
 * @param {function} onInvigilateClick - 安排监考按钮按钮回调事件
 * @param {function} onCancelInvigilateClick - 取消安排按钮回调事件
 * @param {function} onSetMasterClick - 调整主监考老师按钮回调事件
 */
function ExamBatchList(props) {

  const { batchList, onBatchChanged, onInvigilateClick, onCancelInvigilateClick, onSetMasterClick } = props;

  // 回调批次选中
  const callOnBatchChanged = useCallback((selectedValues) => {
    if (onBatchChanged && typeof (onBatchChanged) === 'function') {
      onBatchChanged(selectedValues);
    }
  }, []);

  const batchListRef = useRef();
  batchListRef.current = batchList;
  // 全选
  const handleCheckAll = useCallback((e) => {
    const { checked } = e.target;
    let keys = [];
    if (checked) {
      keys = batchListRef.current.map(v => {
        return v.examBatchId;
      })
    }
    callOnBatchChanged(keys);
  }, [batchList]);

  // 列表checkbox选中事件
  const handleCheckItem = useCallback((e) => {
    const { checked, value } = e.target;

    let keys = batchListRef.current.filter(v => v.selected).map(v => {
      return v.examBatchId;
    })

    if (checked && keys.indexOf(value) === -1) {
      keys.push(value);
    } else if (!checked) {
      keys = keys.filter(v => v !== value);
    }
    callOnBatchChanged(keys);
  }, [batchList]);



  // 渲染列表项
  const renderBatchItem = useCallback((batch) => {
    return (
      <div key={batch.examBatchId} className={styles.batchListItem}>
        <div className={styles.left}>
          <Checkbox
            value={batch.examBatchId}
            onChange={handleCheckItem}
            checked={batch.selected}
          >
            <span className={styles.name}>{batch.examBatchName}</span>
          </Checkbox>

          {/* //! TODO 批次增加有无考试标记，待接口作出调整  VB-VB-7376 */}
          {batch.studentNum > 0 ?
            <span className={styles.hasStu}>{formatMessage({ id: "app.text.uexam.examination.invigilation.batchlist.hasstu", defaultMessage: "有考生" })}</span>
            :
            <span className={styles.noneStu}>{formatMessage({ id: "app.text.uexam.examination.invigilation.batchlist.nonestu", defaultMessage: "无考生" })}</span>
          }
        </div>
        <div className={styles.right} style={{ paddingRight: '10px' }}>
          {formatMessage({ id: "app.text.uexam.examination.invigilation.batchlist.teachernames", defaultMessage: "监考教师：" })}
          {batch.teacherNames || '--'}
        </div>
      </div>
    )
  }, []);

  // 全选/半选状态，已选数量
  const selectedInfo = useMemo(() => {
    const selected = batchListRef.current.filter(v => v.selected);
    return {
      length: selected.length,
      checkALl: !!selected.length && selected.length === batchListRef.current.length,
      indeterminate: !!selected.length && selected.length < batchListRef.current.length
    }
  }, [batchList]);

  // 安排监考
  const handleInvigilateClick = useCallback(() => {
    if (onInvigilateClick && typeof (onInvigilateClick) === 'function') {
      onInvigilateClick();
    }
  }, [])

  // 取消安排
  const handleCancelInvigilateClick = useCallback(() => {
    if (onCancelInvigilateClick && typeof (onCancelInvigilateClick) === 'function') {
      onCancelInvigilateClick();
    }
  }, [])

  // 调整主监考老师
  const handleSetMasterClick = useCallback(() => {
    if (onSetMasterClick && typeof (onSetMasterClick) === 'function') {
      onSetMasterClick();
    }
  }, [])

  return (
    <div className={styles.examBatchList}>
      <div className={styles.batchListItem}>
        <div className={styles.left}>
          <Checkbox
            indeterminate={selectedInfo.indeterminate}
            onChange={handleCheckAll}
            checked={selectedInfo.checkALl}
          >
            {formatMessage({ id: "app.button.uexam.examination.inspect.registration.import.selectall", defaultMessage: "全选" })}
          </Checkbox>
        </div>
        <div className={styles.right}>
          <span>
            <FormattedMessage
              id="app.text.uexam.examination.invigilation.batchlist.selectedNum"
              defaultMessage="选中：{selectedNum}"
              values={{
                selectedNum: <span className={styles.num}>{selectedInfo.length}</span>
              }}
            />
          </span>
          <Button onClick={() => handleInvigilateClick()} disabled={selectedInfo.length <= 0}>
            {formatMessage({ id: "app.button.uexam.examination.invigilation.batchlist.set", defaultMessage: "安排监考" })}
          </Button>
          <Button onClick={() => handleCancelInvigilateClick()} disabled={selectedInfo.length <= 0}>
            {formatMessage({ id: "app.button.uexam.examination.invigilation.batchlist.cancelset", defaultMessage: "取消安排" })}
          </Button>
          <Button onClick={() => handleSetMasterClick()} disabled={selectedInfo.length <= 0}>
            {formatMessage({ id: "app.button.uexam.examination.invigilation.batchlist.changemaster", defaultMessage: "调整主监考教师" })}
          </Button>
        </div>
      </div>
      {batchList.map(v => renderBatchItem(v))}
    </div>
  )
}

export default ExamBatchList
