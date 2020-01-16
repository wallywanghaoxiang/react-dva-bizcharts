/* eslint-disable react/jsx-closing-bracket-location */
/* eslint-disable react/jsx-indent-props */
/* eslint-disable react/jsx-indent */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable no-lonely-if */
import React from 'react';
import { connect } from 'dva';
import { message, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import router from 'umi/router';
import Dimensions from 'react-dimensions';
import IconButton from '@/components/IconButton';
import StepBottom from '../components/StepBottom';
import './index.less';
import PaperList from './PaperList';
import Pagination from '@/components/Pagination';
import PaperDetail from './PaperDetail';
import { parabola } from './parabola';
import ShopCart from './ShopCart';

@connect(({ dict, release, loading }) => ({
  paperSelected: release.paperSelected,
  taskType: release.taskType,
  classList: release.classList,
  gradeIndex: release.gradeIndex,
  currentPaperDetail: release.currentPaperDetail,
  release,
  dict,
  fetchPaperDetailing: loading.effects['release/fetchPaperDetail'] || false,
  fetchPaperListing: loading.effects['release/fetchPaper'],
}))
class Step extends React.PureComponent {
  state = {
    examtype: '',
    pageIndex: 1,
    pageMyIndex: 1,
    paperType: '1', // 1样本资源  2我的试卷 暂定
    shopCartShow: false,
    grade: '', // 筛选条件 年级
    annual: '', // 筛选条件 年度
    difficultLevel: '', // 筛选条件 难度
    templateId: '', // 筛选条件 试卷结构
    addCartStatus: false,
    visible: true,
  };

  componentDidMount() {
    const { match } = this.props;
    const { taskType } = match.params;
    const { dispatch } = this.props;
    // 课后训练
    this.setState({
      shopCartShow: false,
    });
    dispatch({
      type: 'release/changeTaskType',
      taskType,
    });
    const { pageIndex } = this.state;

    const falg = localStorage.getItem('publishReload');
    if (!falg) {
      dispatch({
        type: 'release/changeTaskType',
        taskType,
      });
      dispatch({
        type: 'release/initPaperData',
      });
      this.getPaperList('', '', '', '', '', pageIndex);
    } else {
      this.getPaperList('', '', '', '', '', pageIndex);
    }
    localStorage.removeItem('publishReload');
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'release/clearFilterPrams',
      payload: {},
    });
  }

  // 获取试卷列表接口
  getPaperList = (
    paperType,
    grade,
    annual,
    difficultLevel,
    templateId,
    pageIndex,
    examtype = ''
  ) => {
    const campusId = localStorage.getItem('campusId');
    const { dispatch } = this.props;
    /*
     *获取试卷列表接口*
     */
    const params = {
      grade: grade || '',
      annual,
      difficultLevel,
      paperTemplateId: templateId,
      campusId,
      pageIndex,
      pageSize: '10',
      paperScope: '',
      unitId: '',
      unitType: '',
    };

    if (examtype === 'SCOPE_P2J,SCOPE_J2S,SCOPE_S2U') {
      params.paperScope = examtype;
    } else if (examtype === 'MID_TERM,MID_TERM_FIRST,MID_TERM_SECOND') {
      params.unitId = examtype;
    } else if (examtype === 'END_TERM,END_TERM_FIRST,END_TERM_SECOND') {
      params.unitId = examtype;
    } else if (examtype === 'UNIT') {
      params.unitType = examtype;
    } else if (examtype === 'COMPREHENSIVE') {
      params.unitId = examtype;
    }

    dispatch({
      type: 'release/initData',
      payload: {},
    });
    dispatch({
      type: 'release/fetchPaper',
      payload: params,
    });
  };

  // 获取试卷详情
  getPaperDetail = (id, type = '') => {
    const { dispatch } = this.props;
    const { paperType } = this.state;
    /*
     *获取试卷详情接口*
     */
    const params = {
      paperId: id,
    };
    if (type === 'STANDARD_PAPER' || (paperType === '1' && type === '')) {
      dispatch({
        type: 'release/fetchPaperDetail',
        payload: params,
      }).then(() => {
        // if (taskType === 'TT_5') {
        //   // 修改model中selectedPaper的值
        //   this.addPaper();
        // } else {
        const { paperSelected } = this.props;
        this.paperStatus(paperSelected);
        // }
      });
    } else {
      dispatch({
        type: 'release/fetchCustomPaperDetail',
        payload: { id: params.paperId },
      }).then(() => {
        // if (taskType === 'TT_5') {
        //   // 修改model中selectedPaper的值
        //   this.addPaper();
        // } else {
        const { paperSelected } = this.props;
        this.paperStatus(paperSelected);
        // }
      });
    }
  };

  // TT_5 课后练习情况下
  addPaper = () => {
    const { dispatch, currentPaperDetail } = this.props;
    const shopCart = [];
    shopCart.push(currentPaperDetail);
    dispatch({
      type: 'release/fetchPaperSelected',
      payload: {
        selectedPaper: shopCart,
      },
    });
  };

  // 我的资源分页
  onChangeMyList = page => {
    this.setState({
      pageMyIndex: page,
    });
    this.getMyPaperList(page);
  };

  onChangeList = page => {
    const { paperType, grade, annual, difficultLevel, templateId, examtype } = this.state;
    this.setState({
      pageIndex: page,
    });
    this.getPaperList(paperType, grade, annual, difficultLevel, templateId, page, examtype);
  };

  // 添加购物车
  addPaperCart = item => {
    const shopCart = [];
    const { paperSelected, dispatch, taskType } = this.props;

    if (taskType === 'TT_5' && paperSelected.length >= 1) {
      const mgs = formatMessage({
        id: 'app.text.youCanAddOnly1PieceOfPaper',
        defaultMessage: '只可以添加 1 张试卷',
      });
      message.warn(mgs);
      return;
    }

    let falg = true;
    if (taskType !== 'TT_2') {
      if (paperSelected[0] && paperSelected[0].templateId) {
        if (paperSelected[0].templateId !== item.templateId) {
          falg = false;
        }
      }
    }

    if (!falg) {
      const mgs = formatMessage({
        id: 'app.text.pleaseSelectTheSameTestPaperExaminationPaperStructure',
        defaultMessage: '请选择试卷结构相同的试卷',
      });
      message.warn(mgs);
      return;
    }
    if (paperSelected.length >= 10) {
      const mgs = formatMessage({
        id: 'app.text.youCanAddUpTo10SheetsOfPaper',
        defaultMessage: '您最多可以添加 10 张试卷',
      });
      message.warn(mgs);
    } else {
      this.onAnimate().then(() => {
        shopCart.push(item);
        dispatch({
          type: 'release/fetchPaperSelected',
          payload: {
            selectedPaper: shopCart.concat(paperSelected),
          },
        });
        this.setState({
          addCartStatus: true,
        });
      });
    }
  };

  // 判断当前试卷是否被选中
  paperStatus = paperlist => {
    const { props } = this;
    const current = props.release.currentPaperDetail;
    const paper = paperlist.filter(x => x.id !== current.id);
    if (paper.length < paperlist.length) {
      this.setState({
        addCartStatus: true,
      });
    } else {
      this.setState({
        addCartStatus: false,
      });
    }
  };

  // 点击已选试卷显示列表
  showPaperCart = () => {
    const { shopCartShow } = this.state;
    this.setState({
      shopCartShow: !shopCartShow,
    });
  };

  // 筛选当前试卷列表
  filterPaperList = (paper, years, difficulty, address, examtype) => {
    const { paperType } = this.state;

    this.setState({
      grade: paper, // 筛选条件 年级
      annual: years, // 筛选条件 年度
      difficultLevel: difficulty, // 筛选条件 难度
      templateId: address, // 筛选条件 试卷结构
      examtype,
      pageIndex: 1,
    });
    if (paperType === 1 || paperType === '1') {
      this.getPaperList(paperType, paper, years, difficulty, address, 1, examtype);
    }
  };

  getMyPaperList = (page = 1) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'release/fetchMyPaper',
      payload: {
        teacherId: localStorage.getItem('teacherId'),
        keyword: '',
        paper_scope: '',
        grade: '',
        pageIndex: page,
        pageSize: '10',
      },
    });
  };

  // 删除该试卷
  deletePaperCurrent = id => {
    const { paperSelected, dispatch } = this.props;
    const paper = paperSelected.filter(x => x.id !== id);
    dispatch({
      type: 'release/fetchPaperSelected',
      payload: {
        selectedPaper: paper,
      },
    });
    this.paperStatus(paper);
  };

  // 清空已选试卷
  deleteSelectedAll = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'release/fetchPaperSelected',
      payload: {
        selectedPaper: [],
      },
    });
    this.setState({
      addCartStatus: false,
    });
  };

  showDrawer = () => {
    this.setState({
      visible: true,
    });
  };

  onChangeLeft = () => {
    const { visible } = this.state;

    this.setState({
      visible: !visible,
    });
  };

  onAnimate = () => {
    return new Promise(resolve => {
      function animationDone() {
        this.setState({
          isVisible: false,
        });
        resolve();
      }

      const config = {
        ballWrapper: this.$wrapper,
        origin: this.$origin,
        target: this.$target,
        time: 500,
        a: 0.0006,
        callback: this.updateLocation,
        finish: animationDone.bind(this),
        offset: 8,
      };
      parabola(config);
    });
  };

  updateLocation = (x, y) => {
    this.setState({
      x,
      y,
      isVisible: true,
    });
  };

  changeType = key => {
    const { dispatch } = this.props;
    dispatch({
      type: 'release/savetabKey',
      payload: {
        key,
      },
    });

    if (key === '1') {
      this.getPaperList('', '', '', '', '', 1);
    }
    this.setState({
      paperType: key,
      pageIndex: 1,
      pageMyIndex: 1,
      examtype: '',
      grade: '', // 筛选条件 年级
      annual: '', // 筛选条件 年度
      difficultLevel: '', // 筛选条件 难度
      templateId: '', // 筛选条件 试卷结构
    });
  };

  renderLeft() {
    const { fetchPaperListing, release, containerHeight } = this.props;
    const { pageIndex, paperType, visible } = this.state;

    if (visible) {
      return (
        <div className="selectpaperDrawer" style={{ height: containerHeight - 64 - 50 }}>
          {/* <PaperFilter filterPaper={(paper, years, difficulty, address, examtype) => this.filterPaperList(paper, years, difficulty, address, examtype)} /> */}
          <Spin delay={500} spinning={fetchPaperListing}>
            <PaperList
              currentPaperId={id => {
                this.getPaperDetail(id);
              }}
              filterPaperLists={(paper, years, difficulty, address, examtype) =>
                this.filterPaperList(paper, years, difficulty, address, examtype)
              }
              styles={{ height: containerHeight - 380, overflowY: 'auto', overflowX: 'hidden' }}
              changePaperType={key => this.changeType(key)}
            />
          </Spin>
          <div className="pages">
            <Pagination
              current={pageIndex}
              pageSize={10}
              showLessItems
              total={
                paperType === '1' || paperType === 1
                  ? release.paperList && release.paperList.total
                  : release.myPaperList && release.myPaperList.total
              }
              onChange={
                paperType === '1' || paperType === 1 ? this.onChangeList : this.onChangeMyList
              }
            />
          </div>
          <div className="tag" onClick={this.onChangeLeft}>
            <div>
              <div>
                <i className="iconfont icon-link-arrow-left" />
              </div>
              <div className="text">
                {formatMessage({
                  id: 'app.examination.inspect.task.detail.check.btn.title1',
                  defaultMessage: '收起',
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="selectpaperDraweropen" style={{ height: containerHeight - 64 - 50 }}>
        <div className="tag" onClick={this.onChangeLeft}>
          <div>
            <div>
              <i className="iconfont icon-link-arrow" />
            </div>
            <div className="text">
              {formatMessage({ id: 'app.examination.publish.paper', defaultMessage: '试卷' })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      taskType,
      fetchPaperListing,
      fetchPaperDetailing,
      release,
      containerWidth,
      containerHeight,
    } = this.props;
    const {
      addCartStatus,
      shopCartShow,
      pageIndex,
      paperType,
      x,
      y,
      isVisible,
      pageMyIndex,
    } = this.state;
    const { paperSelected } = release;
    const current = release.currentPaperDetail;

    const animateStyle = {
      transform: `translate(${x}px, ${y}px)`,
      // transition : "transform 0.5s ease 0s",
      // '-webkit-transform'       : `translate(${this.state.x}px, ${this.state.y}px)`,
      // '-webkit-transition' : "transform 0.5s ease 0s",
      opacity: isVisible ? 1 : 0,
    };

    if (taskType) {
      return (
        <div className="releaseStep selectpaper" style={{ height: containerHeight - 64 - 50 }}>
          {containerWidth <= 1466 ? (
            this.renderLeft()
          ) : (
            <div className="left" ref={this.saveContainer}>
              <Spin delay={500} spinning={fetchPaperListing}>
                <PaperList
                  currentPaperId={id => {
                    this.getPaperDetail(id);
                  }}
                  filterPaperLists={(paper, years, difficulty, address, examtype) =>
                    this.filterPaperList(paper, years, difficulty, address, examtype)
                  }
                  styles={{ height: containerHeight - 380, overflowY: 'auto', overflowX: 'hidden' }}
                  changePaperType={key => this.changeType(key)}
                />
              </Spin>
              <div className="pages">
                <Pagination
                  current={paperType === '1' || paperType === 1 ? pageIndex : pageMyIndex}
                  pageSize={10}
                  showLessItems
                  total={
                    paperType === '1' || paperType === 1
                      ? release.paperList && release.paperList.total
                      : release.myPaperList && release.myPaperList.total
                  }
                  onChange={
                    paperType === '1' || paperType === 1 ? this.onChangeList : this.onChangeMyList
                  }
                />
              </div>
            </div>
          )}

          <div
            className="right"
            ref={dom => {
              this.$wrapper = dom;
            }}
          >
            <div
              className="origin"
              ref={dom => {
                this.$origin = dom;
              }}
            />

            <Spin delay={500} spinning={fetchPaperDetailing}>
              <PaperDetail
                addPaperCart={item => this.addPaperCart(item)}
                addCartStatus={addCartStatus}
                containerHeight={containerHeight - 64 - 50}
              />
            </Spin>
            <div
              className="target"
              ref={dom => {
                this.$target = dom;
              }}
            />
            <div className="selectedPaper">
              <div className="showPaperList" onClick={this.showPaperCart}>
                <div className="selectedCount">
                  <IconButton text="" iconName="iconfont icon-paper" />
                  {paperSelected.length > 0 && (
                    <span className="counts">{paperSelected.length}</span>
                  )}
                </div>
                已选试卷
                {shopCartShow ? (
                  <IconButton text="" iconName="iconfont icon-link-arrow-down" />
                ) : (
                  <IconButton text="" iconName="iconfont icon-link-arrow-up" />
                )}
              </div>

              <div className="r">
                <StepBottom
                  // prevText={formatMessage({ id: 'app.cancel', defaultMessage: '取消' })}
                  nextText={formatMessage({
                    id: 'app.button.exam.publish.confirm.papers',
                    defaultMessage: '确认试卷',
                  })}
                  disabled={paperSelected.length === 0}
                  nextStyle={
                    paperSelected.length === 0
                      ? {}
                      : {
                          background: 'rgba(3,196,107,1)',
                          boxShadow: '0px 2px 5px 0px rgba(3,196,107,0.5)',
                        }
                  }
                  prev={() => {
                    router.push(`/examination/publish/step`);
                  }}
                  next={() => {
                    if (taskType === 'TT_5') {
                      const { dispatch } = this.props;
                      dispatch({
                        type: 'release/savePublishTaskData',
                      });
                      router.push(`/examination/publish/affterclasstrain`);
                    } else {
                      // const { dispatch } = this.props;
                      // dispatch({
                      //   type: 'release/savePublishTaskData',
                      // })
                      if (paperSelected.length > 0) {
                        router.push(`/examination/publish/configuration/${taskType}`);
                      }
                    }
                  }}
                />
              </div>
            </div>
            {/* 购物车 */}
            <div className="ball" style={animateStyle} />
            {shopCartShow && (
              <div className="shopCart">
                <ShopCart
                  currentId={current.id}
                  selectedPaperList={paperSelected}
                  hideSelectedPaper={this.showPaperCart}
                  deletePaperCurrent={id => this.deletePaperCurrent(id)}
                  deleteSelectedAll={this.deleteSelectedAll}
                  currentPaperId={(id, type) => {
                    this.getPaperDetail(id, type);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  }
}

export default Dimensions({
  getHeight() {
    // element
    return window.innerHeight;
  },
  getWidth() {
    // element
    return window.innerWidth;
  },
})(Step);
