import React, { PureComponent } from 'react';
import { Button, Divider, Tooltip, Empty, Pagination, List } from 'antd';
import { formatMessage } from 'umi/locale';
import Dimensions from 'react-dimensions';
import { connect } from 'dva';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';

import empty from '@/assets/examination/none_list_pic.png';
import styles from './index.less';

import LittleCard from '../LittleCard';
import NoData from '@/components/NoData/index';
import Details from '../Details/index';
import AddOneRule from '../AddOneRule/index';
import { lessWords } from '@/frontlib/utils/utils';

/**
 * 调整策略
 * @author tina.zhang.xu
 * @date   2019-8-8
 *
 */

@connect(({ editroom, loading }) => ({
  allstragy: editroom.allstragy,
  allstragyLoading: loading.effects['editroom/getAllStrategy'],
  bandLoading: loading.effects['editroom/bindStrategy'],
  strategyinfo: editroom.strategyinfo,
}))
class ChangeRule extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      page: 1, // 当前分页码
      showDetails: false, // 详情页弹框
      showAddOneRule: false,
      item: '', // 详情页弹框数据
      checkedIndex: 0, // 被选中的Card的序号
      showTip: false, // 绑定警告提示
      showCardNum: 8, // 显示策略card的数量
      bindMess: '',
    };
  }

  componentDidMount() {
    const { page, cardIndex } = this.props;
    console.log(page, cardIndex);
    this.loadAllStrategy();
    this.getStdDict();
  }

  componentWillReceiveProps(nextProps) {
    this.changeCardNum(nextProps.containerWidth);
  }

  // 102 查询所有策略
  loadAllStrategy = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'editroom/getAllStrategy',
      // payload: { orgId: localStorage.getItem('orgId') }
      payload: { orgId: localStorage.getItem('campusId') },
    }).then(() => {
      const { page, cardIndex } = this.props;
      console.log(page, cardIndex);
      this.setState({
        page,
        checkedIndex: cardIndex,
      });
    });
  };

  // 查询字典
  getStdDict = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'editroom/getStdDict',
      payload: { type: 'UE_BATCH_TYPE' },
    });
  };

  // 104 设置默认策略
  updateStrategy = id => {
    const { dispatch } = this.props;
    dispatch({
      type: 'editroom/updateStrategy',
      payload: {
        id,
        isDefault: 'Y',
      },
    }).then(() => {
      this.loadAllStrategy(); // 重新获取
    });
  };

  // 绑定策略
  handleOk = () => {
    const { dispatch, taskId, allstragy, strategyinfo, callback } = this.props;
    const { checkedIndex, page } = this.state;
    const oldId = strategyinfo.find(Item => {
      return Item.campusId === localStorage.getItem('campusId');
    });
    if (oldId.strategyId !== allstragy[checkedIndex].id) {
      // 105绑定策略
      dispatch({
        type: 'editroom/bindStrategy',
        payload: {
          taskId,
          campusId: localStorage.getItem('campusId'),
          strategyId: allstragy[checkedIndex].id,
        },
        callback: e => {
          if (e.data === 'server.uexam.examplace_is_not_existed') {
            this.setState({
              showTip: true,
              bindMess: formatMessage({
                id:
                  'app.text.theSchoolIsNotConfiguredTestexaminationRoomPleaseGoToCampusManagementInTheConfiguration',
                defaultMessage: '该学校未配置考点/考场，请前往校区管理中配置',
              }),
            });
          } else if (e.responseCode === '460') {
            this.setState({
              showTip: true,
              bindMess: e.data,
            });
          } else {
            callback(page, checkedIndex); // next step
          }
        },
      });
    } else {
      callback(page, checkedIndex); // next step
    }
  };

  // 根据页面宽度，调整卡牌的数量
  changeCardNum = width => {
    const { showCardNum } = this.state;
    const num = width > 1864 ? 8 : 6;
    if (showCardNum !== num) {
      this.setState({
        showCardNum: num,
      });
    }
  };

  // 新增策略
  addNewOne = () => {
    this.setState({
      showAddOneRule: true,
    });
  };

  check = e => {
    this.setState({
      checkedIndex: e,
    });
  };

  // 弹窗内容卡片信息，每次最多六张卡片
  showAllCard = (page, showCardNum) => {
    const { allstragy } = this.props;
    const { checkedIndex } = this.state;
    const html = [];
    let index = 0;
    for (let i = 0; i < showCardNum; i += 1) {
      index = i + showCardNum * (page - 1);
      if (allstragy[index]) {
        html.push(
          <List.Item>
            <div key={i} className={styles.eachCard}>
              <LittleCard
                index={index}
                checked={checkedIndex}
                Item={allstragy[index]}
                show
                updateStrategy={this.updateStrategy}
                callback={this.check}
                showDetails={this.showDetails}
              />
            </div>
          </List.Item>
        );
      }
    }
    return (
      <List
        grid={{
          gutter: 20,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 2,
          xl: 3,
          xxl: 4,
        }}
      >
        {html}
      </List>
    );
  };

  // 弹框底部功能：分页和按钮
  footer = (page, showCardNum) => {
    const { allstragy } = this.props;
    const html = (
      <div className={styles.footer}>
        {allstragy.length > 0 && (
          <div className={styles.add}>
            {formatMessage({ id: 'app.text.zbd', defaultMessage: '找不到?' })}
            <a onClick={this.addNewOne}>
              {formatMessage({ id: 'app.text.xzyg', defaultMessage: '新增一个' })}
            </a>
          </div>
        )}
        <div className={styles.pagination}>
          {allstragy.length > 0 && (
            <Pagination
              total={allstragy.length}
              current={page}
              defaultPageSize={showCardNum}
              onChange={e => {
                this.setState({
                  page: e,
                });
              }}
            />
          )}
        </div>
      </div>
    );
    return html;
  };

  // 弹窗顶部的信息
  head = () => {
    const { allstragy, school } = this.props;
    let name = '';
    if (school === 'FULL') {
      name = formatMessage({ id: 'app.text.plfpcl', defaultMessage: '批量分配策略' });
    } else {
      name = (
        <>
          {formatMessage({ id: 'app.text.w', defaultMessage: '为' })}
          <Tooltip title={school.campusName}>
            <span> {`${lessWords(school.campusName, 15)}`}</span>
          </Tooltip>
          {formatMessage({ id: 'app.text.tzcl', defaultMessage: '调整策略' })}
        </>
      );
    }
    const html = (
      <div className={styles.head}>
        <div className={styles.title}>{name}</div>
        {allstragy.length > 0 && (
          <div className={styles.add}>
            {formatMessage({ id: 'app.text.zbd', defaultMessage: '找不到?' })}
            <a onClick={this.addNewOne}>
              {formatMessage({ id: 'app.text.xzyg', defaultMessage: '新增一个' })}
            </a>
          </div>
        )}
      </div>
    );
    return html;
  };

  showDetails = data => {
    this.setState({
      showDetails: true,
      item: data,
    });
  };

  render() {
    const { allstragy, allstragyLoading, bandLoading } = this.props;
    const { page, showDetails, item, showAddOneRule, showTip, showCardNum, bindMess } = this.state;
    return (
      <div className={styles.changeRule}>
        {allstragyLoading && (
          <NoData
            noneIcon={noneicon}
            tip={formatMessage({
              id: 'app.message.registration.taskinfo.loading.tip',
              defaultMessage: '信息加载中，请稍等...',
            })}
            onLoad={allstragyLoading}
          />
        )}
        {!allstragyLoading && (
          <>
            {!allstragy.length > 0 ? (
              <div className={styles.empty}>
                <Empty
                  image={empty}
                  description={
                    <div>
                      <div className={styles.word1}>
                        {formatMessage({
                          id:
                            'app.text.campus.examination.uexam.editroom.changerule.youHaveNotYetCreatedAStrategy',
                          defaultMessage: '您还没有创建过策略',
                        })}
                      </div>
                      <div className={styles.word2}>
                        {formatMessage({
                          id:
                            'app.text.createAStrategyTheSelectionOfTheExamineeInTheExaminationRoomAfter',
                          defaultMessage: '创建一个策略，选择后即可对考生进行考场编',
                        })}
                      </div>
                      <Button className={styles.btnOk} onClick={this.addNewOne}>
                        {formatMessage({
                          id:
                            'app.button.campus.examination.uexam.editroom.changerule.theNewStrategy',
                          defaultMessage: '新增策略',
                        })}
                      </Button>
                    </div>
                  }
                />
              </div>
            ) : (
              <div className={styles.cards}>{this.showAllCard(page, showCardNum)}</div>
            )}
          </>
        )}

        {!allstragyLoading && (
          <>
            {this.footer(page, showCardNum)}
            {allstragy.length > 0 && (
              <>
                <Divider type="horizontal" />
                <div className={styles.btns}>
                  {showTip && <div className={styles.warnTips}>{bindMess}</div>}
                  <Button
                    className={allstragy.length === 0 ? styles.btnDis : styles.btnOk}
                    disabled={!(allstragy.length > 0)}
                    loading={bandLoading}
                    onClick={this.handleOk}
                  >
                    {formatMessage({ id: 'app.text.ksbp', defaultMessage: '开始编排' })}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {showDetails && (
          <Details
            dataSource={item}
            callback={() => {
              this.setState({
                showDetails: false,
              });
            }}
          />
        )}
        {showAddOneRule && (
          <AddOneRule
            callback={e => {
              // 新增策略
              if (e === 'add') {
                this.loadAllStrategy();
              }
              this.setState({
                showAddOneRule: false,
              });
            }}
          />
        )}
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
})(ChangeRule);
