import React from 'react';
import { Input, Button, Icon, Radio, Divider } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';

/**
 * Input 筛选组件（用于 Table 表头筛选）
 * @author tina.zhang
 * @date   2019-8-7 22:26:40
 * @param {string} dataIndex - 列key
 * @param {function} handleSearch - 搜索回调,参数 dataIndex,selectedKeys
 * @param {function} handleReset - 重置
 * @param {string} placeholder - 默认值：“筛选关键字”
 */
export function InputFilter(dataIndex, handleSearch, handleReset, placeholder = '') {
  let searchInput;
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className={styles.tableHeaderSearchBox}>
        <Input
          ref={node => {
            searchInput = node;
          }}
          placeholder={`请输入${placeholder || '筛选关键字'}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(dataIndex, selectedKeys, confirm)}
        />
        <div className={styles.footer}>
          <Button onClick={() => {
            clearFilters();
            handleReset(dataIndex);
          }}
          >
            {formatMessage({ id: "app.button.uexam.examination.inspect.registration.tablefilter.reset", defaultMessage: "重置" })}
          </Button>
          <Button
            className={styles.btnOk}
            onClick={() => {
              confirm();
              handleSearch(dataIndex, selectedKeys)
            }}
          >
            {formatMessage({ id: "app.button.uexam.examination.inspect.registration.tablefilter.search", defaultMessage: "搜索" })}
          </Button>
        </div>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
    // onFilter: (value, record) =>
    //   record[dataIndex]
    //     .toString()
    //     .toLowerCase()
    //     .includes(value.toLowerCase()),
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => searchInput.select());
      }
    },
    // render: text => (
    //   <span>{text}</span>
    //   //   <Highlighter
    //   //     highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
    //   //     searchWords={[searchCondition]}
    //   //     autoEscape
    //   //     textToHighlight={text.toString()}
    //   //   />
    // ),
  };
}

/**
 * Selector 筛选组件（用于 Table 表头筛选）
 * @author tina.zhang
 * @date   2019-8-7 22:41:12
 * @param {Array} filterOptions - 筛选数据源 Array({value,text})
 * @param {string} dataIndex - 列key
 * @param {function} handleSearch - 搜索回调
 * @param {function} handleReset - 重置
 * @param {boolean} multiple - 是否允许多选，默认false
 */
export function SelectorFilter(filterOptions, dataIndex, handleSearch, handleReset, multiple = false) {
  return {
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className={styles.tableHeaderSearchBox}>
        <div className={styles.radioContainer}>
          {filterOptions.map(v => {
            return (
              <div key={v.value}>
                <Radio
                  checked={selectedKeys.indexOf(v.value) !== -1}
                  onClick={e => {
                    const { checked } = e.target;
                    if (multiple) {
                      if (checked && selectedKeys.indexOf(v.value) === -1) {
                        setSelectedKeys([...selectedKeys, v.value]);
                      } else {
                        setSelectedKeys([...selectedKeys.filter(k => k !== v.value)]);
                      }
                    } else if (checked && selectedKeys.indexOf(v.value) === -1) {
                      setSelectedKeys([v.value])
                    } else {
                      setSelectedKeys([])
                    }
                  }}
                  defaultChecked={false}
                >
                  {v.text}
                </Radio>
                <br />
              </div>
            )
          })}
        </div>
        <Divider type="horizontal" />
        <div className={styles.footer}>
          <Button onClick={() => {
            clearFilters();
            handleReset(dataIndex);
          }}
          >
            {formatMessage({ id: "app.button.uexam.examination.inspect.registration.tablefilter.reset", defaultMessage: "重置" })}
          </Button>
          <Button
            className={styles.btnOk}
            onClick={() => {
              confirm();
              handleSearch(dataIndex, selectedKeys)
            }}
          >
            {formatMessage({ id: "app.button.uexam.examination.inspect.registration.tablefilter.search", defaultMessage: "搜索" })}
          </Button>
        </div>
      </div>
    ),
    filterIcon: filtered => (
      <Icon type="filter" style={{ color: filtered ? '#1890ff' : undefined }} />
    ),
  };
}
