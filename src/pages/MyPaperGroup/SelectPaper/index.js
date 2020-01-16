/* eslint-disable no-shadow */
/* eslint-disable react/jsx-no-bind */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable import/no-named-as-default */
/* eslint-disable import/no-named-as-default-member */
import React from 'react';
import { connect } from 'dva';
import { message, Menu, Dropdown, Modal, Spin } from 'antd';
import { formatMessage } from 'umi/locale';
import Dimensions from 'react-dimensions';
import styles from '../index.less';
import PaperList from './PaperList';
import Pagination from '@/components/Pagination';
import PaperDetail from './PaperDetail';
import PaperFilter from './PaperFilter';
import ShopCart from './ShopCart';
import SearchBar from '@/components/SearchBar';
// import emitter from '@/utils/ev';

@connect(({ dict, papergroup, loading }) => ({
  paperSelected: papergroup.paperSelected,
  taskType: papergroup.taskType,
  classList: papergroup.classList,
  gradeIndex: papergroup.gradeIndex,
  currentPaperDetail: papergroup.currentPaperDetail,
  paperQestion: papergroup.paperQestion,
  questionIds: papergroup.questionIds,
  grade: papergroup.grade,
  paperList: papergroup.paperList,
  papergroup,
  dict,
  fetchPaperDetailing: loading.effects['papergroup/fetchPaperDetail'] || false,
  fetchPaperListing: loading.effects['papergroup/fetchPaper'],
}))
class Step extends React.PureComponent {
  state = {
    pageIndex: 1,
    paperType: 1, // 1样本资源  2我的试卷 暂定

    shopCartShow: false,
    grade: '', // 筛选条件 年级
    annual: '', // 筛选条件 年度
    difficultLevel: '', // 筛选条件 难度
    templateId: '', // 筛选条件 试卷结构
    addCartStatus: false,
    visible: true,
    paperDetailkey: '',
    baseInfoVisible: false,
    paperGrade: '',
    gradeItem: {},
    paperScope: [],
    keyword: '',
    showStyle: {},
  };

  componentDidMount() {
    localStorage.removeItem('confirmInputScore');
    // 课后训练
    this.setState({
      shopCartShow: false,
    });
    const { pageIndex } = this.state;

    this.getPaperList('', '', '', '', '', pageIndex);
    document.addEventListener('scroll', this.handScroll, { passive: true });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'papergroup/clearFilterPrams',
      payload: {},
    });
    document.removeEventListener('scroll', this.handScroll);
  }

  handScroll = () => {
    const scrollTop = document.body.scrollTop + document.documentElement.scrollTop;
    if (scrollTop > 64) {
      this.setState({
        showStyle: { top: '74px' },
      });
    } else {
      this.setState({
        showStyle: {},
      });
    }
  };

  // 获取试卷列表接口
  getPaperList = (
    paperType,
    grade,
    annual,
    difficultLevel,
    templateId,
    pageIndex,
    examtype = '',
    keyword = ''
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
      keyword,
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
      type: 'papergroup/initData',
      payload: {},
    });
    dispatch({
      type: 'papergroup/fetchPaper',
      payload: params,
    }).then(() => {
      // const { paperList } = this.props;
      // const paperlistLength = paperList ? paperList.total : 0;
      // if (paperlistLength) {
      //   const { records } = paperList;
      //   this.getPaperDetail(records[0].paperId);
      // }
    });
  };

  getPaperDetail = id => {
    const { dispatch, taskType } = this.props;
    /*
     *获取试卷详情接口*
     */
    const params = {
      paperId: id,
    };

    dispatch({
      type: 'papergroup/fetchPaperDetail',
      payload: params,
    }).then(() => {
      const { paperSelected } = this.props;
      window.scrollTo(0, 0); // 返回顶部
      if (taskType === 'TT_5') {
        // 修改model中selectedPaper的值
        this.addPaper();
      } else {
        this.paperStatus(paperSelected);
      }
    });
  };

  // TT_5 课后练习情况下
  addPaper = () => {
    const { dispatch, currentPaperDetail } = this.props;
    const shopCart = [];
    shopCart.push(currentPaperDetail);
    dispatch({
      type: 'papergroup/fetchPaperSelected',
      payload: {
        selectedPaper: shopCart,
      },
    });
  };

  // 我的资源分页
  onChangeMyList = page => {
    const { paperType, grade, annual, difficultLevel, templateId } = this.state;
    this.setState({
      pageIndex: page,
    });
    this.getMyPaperList(paperType, grade, annual, difficultLevel, templateId, page);
  };

  onChangeList = page => {
    const { paperType, grade, annual, difficultLevel, templateId, examtype, keyword } = this.state;
    this.setState({
      pageIndex: page,
    });
    this.getPaperList(
      paperType,
      grade,
      annual,
      difficultLevel,
      templateId,
      page,
      examtype,
      keyword
    );
  };

  // 添加购物车
  addPaperCart = (item, type) => {
    const { dispatch } = this.props;
    if (type === 'add') {
      // emitter.emit('addPapergroupQuestions');
      dispatch({
        type: 'papergroup/addPaperQuestion',
        payload: item,
      }).then(e => {
        if (e === 'fail') {
          this.setState({ paperDetailkey: new Date().getTime() });
        }
      });
    } else {
      console.log('移除本题');
      const LocalData = localStorage.getItem('confirmInputScore');
      let body = {};
      if (LocalData) {
        body = JSON.parse(LocalData);
      }
      if (item.data.patternType === 'COMPLEX') {
        item.data.groups.forEach(dataItem => {
          body[dataItem.id] = true;
        });
      } else {
        body[item.id] = true;
      }

      localStorage.setItem('confirmInputScore', JSON.stringify(body));
      this.setState({ paperDetailkey: item.id });
      dispatch({
        type: 'papergroup/delPaperQuestion',
        payload: item,
      });
    }
  };

  // 清空购物车
  delAllPaperCart = (key = '') => {
    const { dispatch, paperQestion } = this.props;
    if (key === '') {
      localStorage.removeItem('confirmInputScore');
      this.setState({ paperDetailkey: new Date().getTime() });
      dispatch({
        type: 'papergroup/delPaperQuestions',
      });
    } else {
      this.setState({ paperDetailkey: `${key}empty` });
      const LocalData = localStorage.getItem('confirmInputScore');
      let body = {};
      if (LocalData) {
        body = JSON.parse(LocalData);
      }
      paperQestion[key].forEach(item => {
        if (item.data.patternType === 'COMPLEX') {
          item.data.groups.forEach(dataItem => {
            body[dataItem.id] = true;
          });
        } else {
          body[item.id] = true;
        }
      });
      localStorage.setItem('confirmInputScore', JSON.stringify(body));
      dispatch({
        type: 'papergroup/delPaperQuestions',
        payload: { questionPatternId: key },
      });
    }
  };

  // 判断当前试卷是否被选中
  paperStatus = paperlist => {
    const { props } = this;
    const current = props.papergroup.currentPaperDetail;
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
    const { paperType, keyword } = this.state;
    this.setState({
      grade: paper, // 筛选条件 年级
      annual: years, // 筛选条件 年度
      difficultLevel: difficulty, // 筛选条件 难度
      templateId: address, // 筛选条件 试卷结构
      examtype,
      pageIndex: 1,
    });
    if (paperType === 1 || paperType === '1') {
      this.getPaperList(paperType, paper, years, difficulty, address, 1, examtype, keyword);
    } else {
      // this.getMyPaperList(paperType,paper,years,difficulty,address,pageIndex)
    }
  };

  // 删除该试卷
  deletePaperCurrent = id => {
    const { paperSelected, dispatch } = this.props;
    const paper = paperSelected.filter(x => x.id !== id);
    dispatch({
      type: 'papergroup/fetchPaperSelected',
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
      type: 'papergroup/fetchPaperSelected',
      payload: {
        selectedPaper: [],
      },
    });
    this.setState({
      addCartStatus: false,
    });
  };

  savePaperData = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'papergroup/savePaperData',
    });
  };

  savemyPaperdata = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'dict/getDictionariesData',
      payload: { type: 'PAPER_SCOPE' },
    }).then(e => {
      dispatch({
        type: 'papergroup/fetchGrade',
      }).then(() => {
        this.setState({
          baseInfoVisible: true,
          paperGrade: '',
          gradeItem: {},
          paperScope: e,
        });
      });
    });
  };

  chooseGrade = item => {
    this.setState({
      paperGrade: item.gradeValue || item.value,
      gradeItem: item,
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

  onHandleCancel = () => {
    this.setState({
      baseInfoVisible: false,
    });
  };

  onHandleOK = () => {
    this.state.warntext = '';
    const { paperGrade } = this.state;
    const { successCallback } = this.props;
    if (this.nameInput.value === '') {
      this.setState({
        warntext: formatMessage({
          id: 'app.text.nameCannotBeEmpty',
          defaultMessage: '试卷名称不能为空',
        }),
      });
      return;
    }
    if (paperGrade === '') {
      this.setState({
        warntext: formatMessage({
          id: 'app.text.trialScopeCannotBeEmpty',
          defaultMessage: '试用范围不能为空',
        }),
      });
      return;
    }

    const { dispatch } = this.props;
    const { gradeItem } = this.state;
    dispatch({
      type: 'papergroup/publishPaperData',
      payload: {
        name: this.nameInput.value,
        grade: gradeItem.grade || '',
        paper_scope: gradeItem.grade ? 'SCOPE_NORMAL' : gradeItem.code,
      },
    }).then(e => {
      if (e === 'SUCCESS') {
        message.success(formatMessage({ id: 'app.text.saveSuccess', defaultMessage: '保存成功' }));
        this.setState({
          baseInfoVisible: false,
        });
        successCallback();
      }
    });
  };

  renderLeft() {
    const { fetchPaperListing, papergroup, containerHeight } = this.props;
    const { pageIndex, paperType, visible, showStyle } = this.state;

    if (visible) {
      return (
        <div
          className="selectpaperDrawer"
          style={{ height: containerHeight - 64 - 50, top: showStyle.top }}
        >
          <PaperFilter
            filterPaper={(paper, years, difficulty, address, examtype) =>
              this.filterPaperList(paper, years, difficulty, address, examtype)
            }
          />
          <SearchBar
            // width={327}
            maxLength="100"
            placeholder={formatMessage({
              id: 'app.text.typeTestNameSearch',
              defaultMessage: '输入试卷名称搜索',
            })}
            onSearch={value => {
              const { grade, annual, difficultLevel, templateId, examtype } = this.state;
              this.setState({ pageIndex: 1, keyword: value });
              this.getPaperList(
                paperType,
                grade,
                annual,
                difficultLevel,
                templateId,
                1,
                examtype,
                value
              );
            }}
          />
          <Spin delay={500} spinning={fetchPaperListing}>
            {!fetchPaperListing && (
              <PaperList
                little
                currentPaperId={id => {
                  this.getPaperDetail(id);
                }}
              />
            )}
          </Spin>
          <div className="pages">
            <Pagination
              current={pageIndex}
              pageSize={10}
              showLessItems
              total={
                paperType === '1' || paperType === 1
                  ? papergroup.paperList && papergroup.paperList.total
                  : papergroup.myPaperList && papergroup.myPaperList.total
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
      <div
        className="selectpaperDraweropen"
        style={{ height: containerHeight - 64 - 50, top: showStyle.top }}
      >
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
      fetchPaperListing,
      fetchPaperDetailing,
      papergroup,
      containerWidth,
      containerHeight,
      paperQestion,
      questionIds,
      grade,
    } = this.props;
    const {
      addCartStatus,
      pageIndex,
      paperType,
      paperDetailkey,
      baseInfoVisible,
      paperGrade,
      warntext,
      showStyle,
    } = this.state;
    let { paperScope } = this.state;
    let menu = null;
    if (grade) {
      paperScope = paperScope.concat(grade);
      // eslint-disable-next-line no-shadow
      const jsx = paperScope.map(item => {
        if (item.code === 'SCOPE_NORMAL') {
          return null;
        }

        // add by ace
        if (item.code === 'SCOPE_P2J' && !grade.some(v => v.paperScope === 'SCOPE_P2J')) {
          return null;
        }
        if (item.code === 'SCOPE_J2S' && !grade.some(v => v.paperScope === 'SCOPE_J2S')) {
          return null;
        }
        if (item.code === 'SCOPE_S2U' && !grade.some(v => v.paperScope === 'SCOPE_S2U')) {
          return null;
        }

        // eslint-disable-next-line react/jsx-no-bind
        return (
          <Menu.Item onClick={this.chooseGrade.bind(this, item)}>
            <span>{item.gradeValue || item.value}</span>
          </Menu.Item>
        );
      });
      menu = <Menu style={{ maxHeight: 300, overflow: 'auto' }}>{jsx}</Menu>;
    }

    return (
      <div className="releaseStep selectpaper">
        {containerWidth <= 1466 || containerHeight < 880 ? (
          this.renderLeft()
        ) : (
          <div className="left" ref={this.saveContainer} style={showStyle}>
            <PaperFilter
              filterPaper={(paper, years, difficulty, address, examtype) =>
                this.filterPaperList(paper, years, difficulty, address, examtype)
              }
            />
            <SearchBar
              // width={327}
              maxLength={30}
              placeholder={formatMessage({
                id: 'app.text.typeTestNameSearch',
                defaultMessage: '输入试卷名称搜索',
              })}
              onSearch={value => {
                const { grade, annual, difficultLevel, templateId, examtype } = this.state;
                this.setState({ pageIndex: 1, keyword: value });
                this.getPaperList(
                  paperType,
                  grade,
                  annual,
                  difficultLevel,
                  templateId,
                  1,
                  examtype,
                  value
                );
              }}
            />
            <Spin delay={500} spinning={fetchPaperListing}>
              {!fetchPaperListing && (
                <PaperList
                  currentPaperId={id => {
                    this.getPaperDetail(id);
                  }}
                />
              )}
            </Spin>
            <div className="pages">
              <Pagination
                current={pageIndex}
                pageSize={10}
                showLessItems
                total={
                  paperType === '1' || paperType === 1
                    ? papergroup.paperList && papergroup.paperList.total
                    : papergroup.myPaperList && papergroup.myPaperList.total
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
          style={
            containerWidth <= 1466 || containerHeight < 880
              ? { width: '100%', margin: 'auto' }
              : { width: containerWidth - 200 - 367 - 48 - 17, marginLeft: '367px' }
          }
        >
          <Spin delay={500} spinning={fetchPaperDetailing}>
            <PaperDetail
              key={paperDetailkey}
              addPaperCart={(item, type) => this.addPaperCart(item, type)}
              addCartStatus={addCartStatus}
              containerHeight={containerHeight - 64 - 50}
            />
          </Spin>
        </div>

        {
          <ShopCart
            paperQestion={paperQestion}
            questionIds={questionIds}
            key={questionIds.length}
            showStyle={showStyle}
            addPaperCart={item => this.addPaperCart(item, 'del')}
            delAllPaperCart={e => this.delAllPaperCart(e)}
            savePaperData={() => this.savePaperData()}
            savemyPaperdata={() => this.savemyPaperdata()}
          />
        }
        <Modal
          visible={baseInfoVisible}
          centered
          title={formatMessage({ id: 'app.text.saveToMyGroup', defaultMessage: '保存到我的组卷' })}
          maskClosable={false}
          closable={false}
          width={460}
          zIndex={999}
          className={styles.addNewPaperModal}
          okText={formatMessage({ id: 'app.save', defaultMessage: '保存' })}
          onCancel={this.onHandleCancel}
          footer={
            <div className={styles.footerbtn}>
              <div className={styles.warntext}>{warntext}</div>
              <div>
                <button
                  type="button"
                  className="ant-btn ant-btn-round"
                  onClick={this.onHandleCancel}
                >
                  <span>取 消</span>
                </button>
                <button
                  type="button"
                  className="ant-btn ant-btn-primary ant-btn-round"
                  onClick={this.onHandleOK}
                >
                  <span>保 存</span>
                </button>
              </div>
            </div>
          }
        >
          <div className="itemModal">
            <div className="paper-title">
              {formatMessage({ id: 'app.title.uexam.paper.name', defaultMessage: '试卷名称' })}
              <span className="required">&nbsp;*</span>
            </div>
            <input
              placeholder={formatMessage({
                id: 'app.text.pleaseEnterAName',
                defaultMessage: '请输入试卷名称',
              })}
              maxLength={30}
              ref={nameInput => {
                this.nameInput = nameInput;
              }}
            />
          </div>
          <div className="itemModal" style={{ display: 'flex' }}>
            <div className="paper-title">
              {formatMessage({ id: 'app.grade', defaultMessage: '适用范围' })}
              <span className="required">&nbsp;*</span>
            </div>
            <Dropdown overlay={menu} trigger={['click']}>
              <div>
                {paperGrade ||
                  formatMessage({
                    id: 'app.menu.learninggroup.selectPlaceholder',
                    defaultMessage: '请选择',
                  })}
              </div>
            </Dropdown>
            <i className="iconfont icon-link-arrow-down suffix" onClick={this.onRegionInputFucus} />
          </div>
        </Modal>
      </div>
    );
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
