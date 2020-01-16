import React, { useState, useCallback, useRef } from 'react';
import { Button, Divider, Input } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './index.less';

const { Search } = Input;

/**
 * 报名管理操作栏
 * @author tina.zhang
 * @date   2019-8-29 16:07:59
 * @param {string} page - 当前页面
 * @param {string} classNum - 班级数量
 * @param {string} studentNum - 学生数量
 * @param {function} onBtnImportClick - 导入考生按钮事件
 * @param {function} onBtnClearClick - 清空名单按钮事件
 * @param {function} onBtnRegenerateClick - 重新生成考号按钮事件
 * @param {function} onSearchSwitch - 搜索切换事件
 * @param {function} onSearch - 搜索回调
 */
function Toolbar(props) {

  const { page, classNum, studentNum, onBtnImportClick, onBtnClearClick, onBtnRegenerateClick, onSearchSwitch, onSearch } = props;

  const [state, setState] = useState({
    searchText: null,
    showSearchbar: false
  });

  // 搜索切换
  const stateRef = useRef();
  stateRef.current = state;

  // onChange
  const handleChange = useCallback((e) => {
    setState({
      ...stateRef.current,
      searchText: e.target.value,
    });
  }, [])

  // 搜索回调事件
  const handleSearch = useCallback((value) => {
    if (onSearch && typeof (onSearch) === 'function') {
      onSearch(value);
    }
  }, [])

  // 清空搜索条件
  const handleClearSearch = useCallback(() => {
    setState({
      ...stateRef.current,
      searchText: null,
    });
    if (onSearch && typeof (onSearch) === 'function') {
      onSearch(null);
    }
  }, []);

  // 切换/取消搜索事件
  const handleSearchSwitch = useCallback((open) => {
    setState({
      ...stateRef.current,
      showSearchbar: open,
      searchText: null
    });
    if (onSearchSwitch && typeof (onSearchSwitch) === 'function') {
      onSearchSwitch(open);
    }
  }, [])

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftInfo}>
        <div className={styles.title}>{formatMessage({ id: "app.text.uexam.examination.inspect.registration.toolbar.registrationlist", defaultMessage: "报名名单" })}</div>
        <div className={styles.statis}>
          <FormattedMessage
            id="app.text.uexam.examination.inspect.registration.toolbar.classnum"
            defaultMessage="班级{classNum}个"
            values={{
              classNum: <span className={styles.boldNum}>{classNum || 0}</span>,
            }}
          />
          <Divider type="vertical" />
          <FormattedMessage
            id="app.text.uexam.examination.inspect.registration.toolbar.stunum2"
            defaultMessage="考生{stunum}人"
            values={{
              stunum: <span className={styles.boldNum}>{studentNum || 0}</span>,
            }}
          />
        </div>
      </div>
      <div className={styles.rightBtngroup}>
        {!state.showSearchbar && page !== 'result' &&
          <>
            <Button className={styles.btnCustom} shape="round" icon="upload" onClick={() => onBtnImportClick()}>
              {formatMessage({ id: "app.text.uexam.examination.inspect.registration.toolbar.btn.import", defaultMessage: "导入考生" })}
            </Button>
            <Button className={styles.btnCustom} shape="round" onClick={() => onBtnClearClick()} disabled={(studentNum || 0) === 0}>
              {formatMessage({ id: "app.text.uexam.examination.inspect.registration.toolbar.btn.clear", defaultMessage: "清空名单" })}
            </Button>
            <Divider type="vertical" />
            <Button className={styles.btnCustom} shape="round" onClick={() => onBtnRegenerateClick()} disabled={(studentNum || 0) === 0}>
              {formatMessage({ id: "app.text.uexam.examination.inspect.registration.toolbar.btn.regenerate", defaultMessage: "重新生成考号" })}
            </Button>
            <Divider type="vertical" />
            <Button className={styles.btnCustom} shape="circle" icon="search" onClick={() => handleSearchSwitch(true)} />
          </>
        }
        {state.showSearchbar &&
          <>
            <Search
              maxLength={30}
              className={styles.searchInput}
              placeholder={formatMessage({ id: "app.placeholder.uexam.examination.inspect.registration.toolbar.search", defaultMessage: "请输入考生姓名搜索" })}
              onChange={e => handleChange(e)}
              onSearch={value => handleSearch(value)}
              value={state.searchText}
              style={{ width: 350 }}
              suffix={!state.searchText ? null : <i className="iconfont icon-error" onClick={() => handleClearSearch()} />}
            />
            <Button className={styles.cancelSearch} type="link" onClick={() => handleSearchSwitch(false)}>
              {formatMessage({ id: "app.button.uexam.examination.inspect.registration.import.cancelSearch", defaultMessage: "取消搜索" })}
            </Button>
          </>
        }
      </div>
    </div>
  )
}

export default Toolbar
