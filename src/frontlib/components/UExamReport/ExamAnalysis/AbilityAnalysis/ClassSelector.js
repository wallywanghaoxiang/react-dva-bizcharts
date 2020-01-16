import React, { useState, useEffect, useCallback } from 'react';
import { Select } from 'antd';
import classNames from 'classnames';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';

const { Option } = Select;
const messages = defineMessages({
  panelTitle: {
    id: 'app.examination.report.abilityAnalysis.paneltitle',
    defaultMessage: '能力分析',
  },

  fullClassName: { id: 'app.report.constant.fullclassname', defaultMessage: '本次考试' },
  fullExerciseName: { id: 'app.report.constant.fullexercisename', defaultMessage: '本次练习' },
  fullClassSelector: { id: 'app.report.constant.fullclassselector', defaultMessage: '全部' },
});

/**
 * 能力分析班级下拉框
 * @author tina.zhang
 * @date   2019-10-31 18:23:11
 * @param {Array} classList - 班级列表
 * @param {Array} selectedValues - 已选班级列表
 * @param {function} onClassChanged - 班级选择回调
 */
function ClassSelector(props) {
  const { classList, selectedValues, onClassChanged } = props;
  const [classSelector, setClassSelector] = useState({
    selectedValues: selectedValues || [],
    open: false,
  });

  // 更新选中班级
  useEffect(() => {
    setClassSelector({
      ...classSelector,
      selectedValues,
    });
  }, [selectedValues]);

  // 选择
  const handleClassSelect = useCallback(
    value => {
      let { selectedValues: selectedItems } = classSelector;
      if (value === 'ALL') {
        selectedItems = [];
      } else {
        const valueIndex = selectedItems.indexOf(value);
        if (valueIndex < 0) {
          selectedItems.push(value);
        } else {
          selectedItems.splice(valueIndex, 1);
        }
      }
      setClassSelector({
        open: false,
        selectedValues: selectedItems,
      });
      // change
      if (onClassChanged && typeof onClassChanged === 'function') {
        onClassChanged([...selectedItems]);
      }
    },
    [classSelector, onClassChanged]
  );

  // 取消选择
  const handleClassDeselect = useCallback(
    value => {
      const selectedItems = classSelector.selectedValues;
      if (value !== 'ALL') {
        const valueIndex = selectedItems.indexOf(value);
        selectedItems.splice(valueIndex, 1);
        setClassSelector({
          open: false,
          selectedValues: selectedItems,
        });
      }
      // change
      if (onClassChanged && typeof onClassChanged === 'function') {
        onClassChanged([...selectedItems]);
      }
    },
    [classSelector, onClassChanged]
  );

  // 班级下拉列表改变事件
  const onClassDropdownVisibleChange = useCallback(
    open => {
      setClassSelector({
        ...classSelector,
        open,
      });
    },
    [classSelector]
  );

  // 禁止 select 输入
  useEffect(() => {
    if (classList && classList.length > 1) {
      const selector = document.getElementsByClassName('abilityClassSelector');
      if (selector && selector.length > 0) {
        const ipt = selector[0].getElementsByClassName('ant-select-search__field');
        if (ipt && ipt.length > 0) {
          ipt[0].setAttribute('readonly', 'readonly');
        }
      }
    }
  }, [classList]);

  return (
    <>
      <Select
        className={classNames(styles.abilitySelector, 'abilityClassSelector')}
        mode="multiple"
        placeholder={formatMessage(messages.fullClassSelector)}
        value={classSelector.selectedValues}
        showArrow
        dropdownMatchSelectWidth={false}
        onSelect={val => handleClassSelect(val)}
        onDeselect={val => handleClassDeselect(val)}
        open={classSelector.open}
        onDropdownVisibleChange={open => onClassDropdownVisibleChange(open)}
      >
        <Option className={styles.abilitySelectorItem} key="ALL" value="ALL">
          {formatMessage(messages.fullClassSelector)}
        </Option>
        {classList.map(v => {
          return (
            <Option className={styles.abilitySelectorItem} key={v.classId} value={v.classId}>
              <span title={v.className}>{v.className}</span>
            </Option>
          );
        })}
      </Select>
    </>
  );
}

export default ClassSelector;
