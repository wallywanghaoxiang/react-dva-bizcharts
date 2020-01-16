// 无试卷包列表
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import { Button, List, Tooltip, BackTop } from 'antd';
import SearchBar from '@/components/SearchBar';

import IconPro from '@/assets/icon_pro.png';
import styles from '../index.less';

const messages = defineMessages({
  examinationpapers: { id: 'app.menu.papermanage.examinationpapers', defaultMessage: '试卷数' },
  paperset: { id: 'app.menu.papermanage.paperset', defaultMessage: '套' },
  Itemnumber: { id: 'app.menu.papermanage.Itemnumber', defaultMessage: '题目数' },
  paperItem: { id: 'app.menu.papermanage.paperItem', defaultMessage: '题' },
  Cumulativeuse: { id: 'app.menu.papermanage.Cumulativeuse', defaultMessage: '累计使用' },
  paperSeconds: { id: 'app.menu.papermanage.paperSeconds', defaultMessage: '次' },
  paperAdd: { id: 'app.menu.papermanage.paperAdd', defaultMessage: '添加试卷包' },
  Search: { id: 'app.teacher.papermanage.search', defaultMessage: '请输入试卷包名称搜索' },
});

@connect(({ papermanage, permission }) => {
  const { paperInfoList, countPaperPackages, curentPaperPackage, filterWord } = papermanage;
  return {
    paperInfoList,
    countPaperPackages,
    curentPaperPackage,
    filterWord,
    defaultPermissionList: permission,
  };
})
class PackageItem extends Component {
  state = {};

  componentWillMount() {}

  // 将当前试卷包保存到state里
  setCurrentPaper = item => {
    // eslint-disable-next-line func-names
    setTimeout(function() {
      // eslint-disable-next-line no-multi-assign
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }, 1000);
    const { dispatch } = this.props;
    dispatch({
      type: 'papermanage/saveCurrent',
      payload: {
        curentPaperPackage: item,
      },
    });
  };

  // 获取试卷包列表

  fetchPaperPackageList = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'papermanage/fetchPaperPackage',
      payload: {
        filterWord: data.filterWord,
        pageIndex: 1,
        pageSize: 12 * data.pageIndex,
      },
    });
  };

  // 搜索试卷包列表
  onSearch = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'papermanage/saveCurrent',
      payload: {
        filterWord: data,
      },
    });
    const { currentIndex } = this.state;
    this.fetchPaperPackageList({ filterWord: data, pageIndex: currentIndex });
  };

  doHandleMonth = month => {
    let m = month;
    if (month.toString().length === 1) {
      m = `0${month}`;
    }
    return m;
  };

  getDay = day => {
    const today = new Date();
    const targetdayMilliseconds = today.getTime() + 1000 * 60 * 60 * 24 * day;
    today.setTime(targetdayMilliseconds);

    const tYear = today.getFullYear();
    let tMonth = today.getMonth();
    let tDate = today.getDate();
    tMonth = this.doHandleMonth(tMonth + 1);
    tDate = this.doHandleMonth(tDate);
    return `${tYear}-${tMonth}-${tDate}`;
  };

  // 比较时间是否是最近三天内的
  switchTime = time => {
    const current = new Date(time);
    const y = current.getFullYear();
    const m = this.doHandleMonth(current.getMonth() + 1);
    const tDate = current.getDate();
    const d = this.doHandleMonth(tDate);
    const currentTime = `${y}-${m}-${d}`;
    console.log(currentTime, this.getDay(0), this.getDay(-1), this.getDay(-2));
    if (
      currentTime === this.getDay(0) ||
      currentTime === this.getDay(-1) ||
      currentTime === this.getDay(-2)
    ) {
      return <div className={styles.news} />;
    }
    return '';
  };

  render() {
    const {
      paperInfoList,
      countPaperPackages,
      addTeach,
      onSearchKey,
      defaultPermissionList,
    } = this.props;
    const { records } = paperInfoList;
    const { totalPaperCount, totalQuestionCount, totalUserCount } = countPaperPackages;
    const isAdmin = localStorage.getItem('isAdmin');
    const isSubjectAdmin = localStorage.getItem('isSubjectAdmin');
    return (
      <div>
        <div className={styles.teacherAll}>
          <span className={styles.itemNumberFirst}>
            <span>{formatMessage(messages.examinationpapers)}</span>
            <i>{totalPaperCount || 0}</i>
            <b>{formatMessage(messages.paperset)}</b>
          </span>
          <span className={styles.itemNumber}>
            <span>{formatMessage(messages.Itemnumber)}</span>
            <i>{totalQuestionCount || 0}</i>
            <b>{formatMessage(messages.paperItem)}</b>
          </span>
          <span className={styles.itemNumberLast}>
            <span>{formatMessage(messages.Cumulativeuse)}</span> <i>{totalUserCount || 0}</i>
            <b>{formatMessage(messages.paperSeconds)}</b>
          </span>
          {(isAdmin === 'true' || isSubjectAdmin === 'true') && (
            <Button className={styles.add} onClick={addTeach}>
              <i className="iconfont icon-add" />
              {formatMessage(messages.paperAdd)}
              {defaultPermissionList && !defaultPermissionList.V_ADD_PACKAGE && (
                <img src={IconPro} alt="" />
              )}
            </Button>
          )}
        </div>
        <div className={styles.searchs}>
          <SearchBar
            placeholder={formatMessage(messages.Search)}
            onSearch={data => onSearchKey(data)}
            maxLength={30}
          />
        </div>
        <List
          grid={{ gutter: 59, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 3 }}
          className={styles.paperInfo}
          dataSource={records}
          renderItem={item => (
            <List.Item onClick={() => this.setCurrentPaper(item)}>
              <BackTop />
              {this.switchTime(item.importDate)}
              <div className={styles.paperName}>
                <Tooltip title={item.name}>{item.name}</Tooltip>
              </div>
              <div className={styles.paperDetail}>
                <span className={styles.itemDetail}>
                  <span>{formatMessage(messages.examinationpapers)}</span>
                  <i>{item.paperCount || 0}</i>
                </span>
                <span className={styles.itemDetail}>
                  <span>{formatMessage(messages.Itemnumber)}</span>
                  <i>{item.questionCount || 0}</i>
                </span>
                <span className={styles.itemDetail}>
                  <span>{formatMessage(messages.Cumulativeuse)}</span> <i>{item.usedCount || 0}</i>
                </span>
              </div>
              <div className={styles.paperCode}>{item.serialNumber}</div>
            </List.Item>
          )}
        />
      </div>
    );
  }
}

export default PackageItem;
