import React from 'react';
import { Select } from 'antd';
import styles from './index.less';

const { Option } = Select;
/**
 * 成绩分布班级、题目下拉框
 * @author tina.zhang
 * @date   2019-11-4 10:35:18
 * @param {Array} classList - 班级列表
 * @param {string} activeClassId - 当前选中的班级ID
 * @param {function} onClassChanged - 班级选择回调
 * @param {Array} questionList - 题目下拉框数据源
 * @param {Array} onQuestionChanged - 题目下拉框筛选回调
 * @param {string} activeQuestionId - 当前选中的题目ID
 */
function GradeFilter(props) {
  const { classList, onClassChanged, activeClassId, questionList, onQuestionChanged, activeQuestionId } = props;
  return (
    <>
      {classList && classList.length > 1 &&
        <Select
          className={styles.areaSelector}
          value={activeClassId}
          showArrow
          onChange={onClassChanged}
          dropdownMatchSelectWidth={false}
        >
          {classList.map(v => {
            return (
              <Option className={styles.areaSelectorItem} key={v.classId} value={v.classId}>
                <span title={v.className}>{v.className}</span>
              </Option>
            )
          })}
        </Select>
      }
      <Select
        className={styles.areaSelector}
        value={activeQuestionId}
        showArrow
        onChange={onQuestionChanged}
        dropdownMatchSelectWidth={false}
      >
        {questionList.map(v => {
          return (
            <Option className={styles.areaSelectorItem} key={v.questionId} value={v.questionId}>
              {v.questionName}
            </Option>
          )
        })}
      </Select>
    </>
  )
}

export default GradeFilter
