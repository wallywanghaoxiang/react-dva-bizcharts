import React, { Component } from 'react';
import Dimensions from 'react-dimensions';

import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import { Button, Drawer } from 'antd';
import router from 'umi/router';
import PackageItem from './components/PackageItem';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from './components/NoData';
import NewPaper from './components/NewPaper';
import PaperDetail from './components/PaperDetail';
import Permission from '@/pages/Permission';
import styles from './index.less';

const messages = defineMessages({
  schoolpaper: { id: 'app.menu.papermanage.schoolpaper', defaultMessage: '校本资源' },
  paperManage: { id: 'app.menu.papermanage.paperManage', defaultMessage: '试卷管理' },
  examinationpapers: { id: 'app.menu.papermanage.examinationpapers', defaultMessage: '试卷数' },
  paperset: { id: 'app.menu.papermanage.paperset', defaultMessage: '套' },
  Itemnumber: { id: 'app.menu.papermanage.Itemnumber', defaultMessage: '题目数' },
  paperItem: { id: 'app.menu.papermanage.paperItem', defaultMessage: '题' },
  Cumulativeuse: { id: 'app.menu.papermanage.Cumulativeuse', defaultMessage: '累计使用' },
  paperSeconds: { id: 'app.menu.papermanage.paperSeconds', defaultMessage: '次' },
  paperAdd: { id: 'app.menu.papermanage.paperAdd', defaultMessage: '添加试卷包' },
  Search: { id: 'app.teacher.papermanage.search', defaultMessage: '请输入试卷包名称搜索' },
  More: { id: 'app.teacher.papermanage.more', defaultMessage: '加载更多...' },
  end: { id: 'app.teacher.papermanage.end', defaultMessage: '我是有底线的 (⊙ˍ⊙)' },
});

@connect(({ papermanage, login, permission }) => {
  const { paperInfoList, countPaperPackages, curentPaperPackage, filterWord } = papermanage;
  const { campusID } = login;
  return {
    paperInfoList,
    countPaperPackages,
    curentPaperPackage,
    filterWord,
    campusID,
    defaultPermissionList: permission,
  };
})
class PaperManage extends Component {
  state = {
    showModal: false,
    currentIndex: 1,
  };

  componentWillMount() {
    const { dispatch, filterWord } = this.props;
    // 获取统计数据
    dispatch({
      type: 'papermanage/CountPaperPackage',
      payload: {},
    });

    this.fetchPaperPackageList({ filterWord, pageIndex: 1 });
  }

  componentWillReceiveProps(nextProps) {
    const { campusID } = nextProps;
    const { props } = this;
    if (campusID !== props.campusID) {
      const { dispatch, filterWord } = this.props;
      // 获取统计数据
      dispatch({
        type: 'papermanage/CountPaperPackage',
        payload: {},
      });

      this.fetchPaperPackageList({ filterWord, pageIndex: 1 });
    }
  }
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

    this.fetchPaperPackageList({ filterWord: data, pageIndex: '1' });
  };

  // 添加试卷包弹窗
  addPaperPackage = () => {
    const { defaultPermissionList } = this.props;
    if (defaultPermissionList && !defaultPermissionList.V_ADD_PACKAGE) {
      // console.log('弹窗');
      Permission.open('V_ADD_PACKAGE');
    } else {
      this.setState({
        showModal: true,
      });
    }
  };

  // 关闭添加试卷包

  hideMidal = res => {
    console.log(res);
    if (res) {
      const { currentIndex } = this.state;
      const { filterWord, dispatch } = this.props;
      this.fetchPaperPackageList({ filterWord, pageIndex: currentIndex });
      // 获取统计数据
      dispatch({
        type: 'papermanage/CountPaperPackage',
        payload: {},
      });
    }
    this.setState({
      showModal: false,
    });
  };

  // 将当前试卷包保存到state里
  setCurrentPaper = item => {
    const { dispatch } = this.props;
    dispatch({
      type: 'papermanage/saveCurrent',
      payload: {
        curentPaperPackage: item,
      },
    });
  };

  // 加载更多...
  loadMoreList = () => {
    const { filterWord } = this.props;
    let { currentIndex } = this.state;
    currentIndex += 1;
    this.setState({ currentIndex });
    this.fetchPaperPackageList({ filterWord, pageIndex: currentIndex });
  };

  // 无试卷包列表显示
  renderNodata = () => {
    const { paperInfoList, countPaperPackages, defaultPermissionList } = this.props;
    const { totalPaperCount } = countPaperPackages;
    const { total } = paperInfoList;
    return (
      total === 0 &&
      totalPaperCount === 0 && (
        <NoData addTeach={this.addPaperPackage} defaultPermissionList={defaultPermissionList} />
      )
    );
  };

  // 显示加载更多...或者显示已经到底了

  renderLoading = (currentIndex, showTotal, total) => {
    if (total > 12 && currentIndex !== showTotal) {
      return (
        <Button className={styles.loadingMore} onClick={this.loadMoreList}>
          {formatMessage(messages.More)}
        </Button>
      );
    }
    return (
      currentIndex === showTotal && (
        <div className={styles.noDataLoading}>{formatMessage(messages.end)}</div>
      )
    );
  };

  // 显示列表item
  renderItem = () => {
    const { countPaperPackages } = this.props;
    const { totalPaperCount } = countPaperPackages;
    return (
      totalPaperCount > 0 && (
        <PackageItem addTeach={this.addPaperPackage} onSearchKey={data => this.onSearch(data)} />
      )
    );
  };

  // 渲染试卷包详情

  renderDetail = curentPaperPackage => {
    return curentPaperPackage && curentPaperPackage.id && <PaperDetail />;
  };

  goPaper = () => {
    router.push('/papermanage/schoolpaper');
  };

  render() {
    const { paperInfoList, curentPaperPackage } = this.props;
    const { total } = paperInfoList;
    const { showModal, currentIndex } = this.state;
    const showTotal = Math.ceil(total / 12);

    // console.log(containerWidth);
    // const number = containerWidth < 1205 ? 2 : 3;

    // 根据数据，判断
    // let stepStyle = {
    //   transform: 'translateY(0)',
    //   transition: 'transform 0.5s ease 0s',
    //   '-webkit-transform': 'translateY(0)',
    //   '-webkit-transition': 'transform 0.5s ease 0s',
    //   display: 'block',
    // };
    // const counts = total > size ? size : total;
    // console.log(Math.ceil(counts / number));
    // const transY =
    //   total > 12 ? Math.ceil(counts / number) * 230 + 233 : Math.ceil(counts / number) * 230 + 235;
    // if (curentPaperPackage !== '') {
    //   stepStyle = {
    //     transform: `translateY(-${transY}px)`,
    //     transition: 'transform 1s ease 0s',
    //     '-webkit-transform': `translateY(-${transY}px)`,
    //     '-webkit-transition': 'transform 1s ease 0s',
    //   };
    //   console.log(stepStyle);
    // }

    // // 根据数据，判断
    // let detailStyle = {
    //   transform: 'translateY(0)',
    //   transition: 'transform 0.5s ease 0s',
    //   '-webkit-transform': 'translateY(0)',
    //   '-webkit-transition': 'transform 0.5s ease 0s',
    // };
    // if (curentPaperPackage !== '') {
    //   detailStyle = {
    //     transform: `translateY(-${transY}px)`,
    //     transition: `transform 1s ease 0s`,
    //     '-webkit-transform': `translateY(-${transY}px)`,
    //     '-webkit-transition': 'transform 1s ease 0s',
    //   };
    // }
    return (
      <div
        className={styles['teacher-manager']}
        style={
          curentPaperPackage && curentPaperPackage.id ? { height: '84vh', overflow: 'hidden' } : {}
        }
      >
        <h1 className={styles.stylesName}>
          <span>{formatMessage(messages.schoolpaper)}&nbsp;&nbsp;/&nbsp;&nbsp;</span>
          <span onClick={this.goPaper} style={{ cursor: 'pointer' }}>
            {formatMessage({ id: 'app.teacher.home.paper.title', defaultMessage: '试卷库' })}
            &nbsp;&nbsp;/&nbsp;&nbsp;
          </span>
          {formatMessage({ id: 'app.title.paperBag', defaultMessage: '试卷包' })}
        </h1>
        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {
            // curentPaperPackage===''&&
            <div className={styles.animated}>
              {/*
               **无数据渲染
               */}
              {this.renderNodata()}
              {/*
               **数据渲染
               */}
              {this.renderItem()}
              {/*
               **加载更多
               */}
              {this.renderLoading(currentIndex, showTotal, total)}
            </div>
          }
          {/*
           **渲染试卷包详情
           */}
          {curentPaperPackage && curentPaperPackage.id && (
            <Drawer
              placement="bottom"
              closable={false}
              onClose={this.toggleDetailPage}
              destroyOnClose
              maskClosable={false}
              mask={false}
              visible={curentPaperPackage && curentPaperPackage.id}
              className={styles.curentPaperPackage}
              width="calc( 100% - 200px )"
              height="calc( 100% - 109px )"
            >
              <div>{this.renderDetail(curentPaperPackage)} </div>
            </Drawer>
          )}
        </PageHeaderWrapper>

        <NewPaper showModal={showModal} hideDialg={res => this.hideMidal(res)} />
      </div>
    );
  }
}

export default Dimensions({
  getHeight: () => {
    return window.innerHeight;
  },
  getWidth: () => {
    return window.innerWidth;
  },
})(PaperManage);
