import React, { useCallback } from 'react';
import { Select, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';

const { Option } = Select;

/**
 * 监考安排操作栏
 * @author tina.zhang
 * @date   2019-8-9 14:56:27
 * @param {Array} examPlaceList - 考点列表
 * @param {string} activeExamPlaceId - 当前活动的考点ID
 * @param {string} onExamPlaceChanged - 考点选择事件回调
 */
function Toolbar(props) {

  const { examPlaceList, activeExamPlaceId, onExamPlaceChanged } = props;

  // 考点选择事件
  const handleExamPlaceChanged = useCallback((value) => {
    if (onExamPlaceChanged && typeof (onExamPlaceChanged) === 'function') {
      onExamPlaceChanged(value);
    }
  }, [])

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftInfo}>
        <div className={styles.title}>{formatMessage({ id: "app.text.uexam.examination.invigilation.toolbar.title", defaultMessage: "监考安排" })}</div>
        <div className={styles.statis}>
          {formatMessage({ id: "app.text.menu.campus.examPlaceList", defaultMessage: "考点" })}：
          <Select
            className={styles.selector}
            value={activeExamPlaceId}
            onChange={handleExamPlaceChanged}
          >
            {examPlaceList && examPlaceList.map(v => {
              return <Option key={v.examPlaceId} value={v.examPlaceId}>{v.examPlaceName}</Option>
            })}
          </Select>
        </div>
        <Divider type="horizontal" />
      </div>
    </div>
  )
}

export default Toolbar
