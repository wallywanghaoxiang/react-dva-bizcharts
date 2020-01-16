import React, { useState, useCallback } from 'react';
import { Select, Input, Divider, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';

const { Option } = Select;
const { Search } = Input;

/**
 * 学生筛选、导入操作栏（导入学生弹窗）
 * @author tina.zhang
 * @date 2019-8-1 09:30:29
 * @param {Array} classList - 校区列表
 * @param {string} activeClassId - 选中班级ID
 * @param {function} onClassSelect - 班级选中事件
 * @param {function} onSearch - 搜索事件
 * @param {function} onCancelSearch - 搜索事件
 * @param {function} onSelectAll - 全选事件
 * @param {function} onClearAll - 取消全选
 * @param {function} onClearTransient - 取消选择借读生
 */
function StudentInfoFilter(props) {

  const { classList, activeClassId, onClassSelect, onSearch, onCancelSearch, onSelectAll, onClearAll, onClearTransient } = props;

  const [onSearching, setOnSearching] = useState(false);
  const [searchText, setSearchText] = useState('');

  // onKeyUp
  const handleKeyUp = useCallback(() => {
    if (onSearching) {
      return;
    }
    setOnSearching(true);
  }, [onSearching])

  // onChange
  const handleTextChange = useCallback((e) => {
    setSearchText(e.target.value);
  }, [])

  // 清空搜索条件
  const handleClearSearchText = useCallback(() => {
    onSearch(null);
    setSearchText('');
  }, [onSearch])

  // 取消搜索
  const handleCancelSearch = useCallback(() => {
    setOnSearching(false);
    setSearchText('');

    if (onCancelSearch && typeof (onCancelSearch) === 'function') {
      onCancelSearch();
    }
  }, [onCancelSearch])

  // 搜索
  const handleSearch = useCallback((value) => {
    if (onSearch && typeof (onSearch) === 'function') {
      onSearch(value);
    }
  }, [onSearch]);

  // 班级切换事件
  const handleClassChange = useCallback((value) => {
    handleCancelSearch();
    if (onClassSelect && typeof (onClassSelect) === 'function') {
      onClassSelect(value);
    }
  }, [onClassSelect]);

  // 全选
  const handleSelectAll = useCallback(() => {
    if (onSelectAll && typeof (onSelectAll) === 'function') {
      onSelectAll();
    }
  }, [onSelectAll]);

  // 取消全选
  const handleClearAll = useCallback(() => {
    if (onClearAll && typeof (onClearAll) === 'function') {
      onClearAll();
    }
  }, [onClearAll]);

  // 取消选择借读生
  const handleClearTransient = useCallback(() => {
    if (onClearTransient && typeof (onClearTransient) === 'function') {
      onClearTransient();
    }
  }, [onClearTransient]);

  return (
    <div className={styles.studentInfoFilter}>
      <Select className={styles.classSelector} value={activeClassId} onChange={handleClassChange} dropdownMatchSelectWidth={false}>
        <Option value="all">{formatMessage({ id: "app.text.uexam.examination.inspect.registration.import.allClass", defaultMessage: "全部班级" })}</Option>
        {classList && classList.map(v =>
          <Option key={v.classId} value={v.classId}><span title={v.className}>{v.className}</span></Option>
        )}
      </Select>
      <Divider type="vertical" />
      <Search
        maxLength={30}
        style={{ 'width': onSearching === true ? '312px' : '180px' }}
        className={styles.searchInput}
        placeholder={formatMessage({ id: "app.placeholder.uexam.examination.inspect.registration.import.search", defaultMessage: "考生姓名快速检索" })}
        onKeyUp={() => handleKeyUp()}
        onSearch={value => handleSearch(value)}
        onChange={e => handleTextChange(e)}
        value={searchText}
      />
      {!onSearching &&
        <>
          <Button type="link" onClick={() => handleSelectAll()}>
            {formatMessage({ id: "app.button.uexam.examination.inspect.registration.import.selectall", defaultMessage: "全选" })}
          </Button>
          <Divider type="vertical" />
          <Button type="link" onClick={() => handleClearAll()}>
            {formatMessage({ id: "app.button.uexam.examination.inspect.registration.import.clearall", defaultMessage: "取消全选" })}
          </Button>
          <Divider type="vertical" />
          <Button type="link" onClick={() => handleClearTransient()} disabled={!onClearTransient}>
            {formatMessage({ id: "app.button.uexam.examination.inspect.registration.import.clearTransient", defaultMessage: "取消选择借读生" })}
          </Button>
        </>
      }
      {onSearching &&
        <>
          {!searchText ? <span style={{ width: '36px', display: 'inline-block' }} /> : <i className="iconfont icon-error" onClick={() => handleClearSearchText()} />}
          <Button type="link" onClick={() => handleCancelSearch()}>
            {formatMessage({ id: "app.button.uexam.examination.inspect.registration.import.cancelSearch", defaultMessage: "取消搜索" })}
          </Button>
        </>
      }
    </div>
  )
}

export default StudentInfoFilter
