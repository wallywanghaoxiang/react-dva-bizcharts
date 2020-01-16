/* eslint-disable eqeqeq */
/**
 * 试卷列表
 * @author tina
 */
import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Tabs, List, Checkbox, Tooltip } from 'antd';
import { connect } from 'dva';
import './index.less';
import NoData from '@/components/NoData/index';
import noneicon from '@/assets/none_asset_icon.png';
import rellicon from '@/assets/examination/rell_icon.png';
import PaperFilter from './PaperFilter';

const { TabPane } = Tabs;
@connect(({ release }) => ({
  paperList: release.paperList,
  myPaperList: release.myPaperList,
  paperSelected: release.paperSelected,
  taskType: release.taskType,
  currentPaperDetail: release.currentPaperDetail,
}))
class PaperList extends PureComponent {
  state = { currentSingle: '', key: '1' };

  onSwitch = key => {
    const { changePaperType, dispatch } = this.props;
    changePaperType(key);
    this.setState({ key });
    // 当切换到我的组卷时获取 我的组件列表
    if (key === '2') {
      dispatch({
        type: 'release/fetchMyPaper',
        payload: {
          teacherId: localStorage.getItem('teacherId'),
          keyword: '',
          paper_scope: '',
          grade: '',
          pageIndex: '1',
          pageSize: '10',
        },
      });
    }
  };

  checkSingle = e => {
    const { currentPaperId } = this.props;
    this.setState({
      currentSingle: e.target.value,
    });
    currentPaperId(e.target.value);
  };

  render() {
    const { paperList, myPaperList, styles } = this.props;

    console.log(styles);
    const paperLists = paperList && paperList.records;
    const myPaperLists = myPaperList && myPaperList.records;
    const paperlistLength = paperList ? paperList.total : 0;
    const myListLength = myPaperList ? myPaperList.total : 0;
    // const number = paperlistLength + myListLength;
    const operations = '';
    const res = formatMessage({
      id: 'app.menu.papermanage.schoolpaper',
      defaultMessage: '校本资源',
    });
    const mainTitle = `${res}`;
    const myPaper = formatMessage({ id: 'app.text.myGroup', defaultMessage: '我的组卷' });
    const myTitle = `${myPaper}`;

    const { paperSelected, taskType, currentPaperDetail, filterPaperLists } = this.props;
    const { currentSingle, key } = this.state;

    return (
      <div className="paperSource">
        <Tabs
          defaultActiveKey="1"
          onChange={this.onSwitch}
          animated={false}
          tabBarExtraContent={operations}
        >
          <TabPane tab={mainTitle} key="1">
            {key === '1' && (
              <PaperFilter
                filterPaper={(paper, years, difficulty, address, examtype) =>
                  filterPaperLists(paper, years, difficulty, address, examtype)
                }
              />
            )}
            {paperlistLength > 0 && (
              <div style={styles}>
                <List
                  className="paperlist"
                  dataSource={paperLists}
                  renderItem={item => {
                    let falg = true;
                    if (taskType != 'TT_2') {
                      if (paperSelected[0] && paperSelected[0].templateId) {
                        if (paperSelected[0].templateId != item.paperTemplateId) {
                          falg = false;
                        }
                      }
                    }
                    let myCalssName = '';
                    // myCalssName = this.state.currentSingle == item.paperId && currentPaperDetail.id ? 'paperItem selected' : 'paperItem';
                    if (falg) {
                      myCalssName =
                        currentSingle == item.paperId && currentPaperDetail.id
                          ? 'paperItem selected'
                          : 'paperItem';
                    } else {
                      myCalssName = 'paperItem noselected';
                    }
                    // 课后训练
                    if (taskType === 'TT_5') {
                      myCalssName =
                        currentSingle == item.paperId && currentPaperDetail.id
                          ? 'paperItem selected'
                          : 'paperItem';
                    }
                    return (
                      <Tooltip placement="top">
                        <List.Item className={myCalssName}>
                          <Checkbox
                            value={item.paperId}
                            onChange={e => {
                              if (taskType === 'TT_5') {
                                // if (!falg) return;
                                this.checkSingle(e, item);
                              } else {
                                // if (!falg) return;
                                this.checkSingle(e, item);
                              }
                            }}
                          />
                          <span className="paperNameDetail">{item.paperName}</span>
                          {item.isExamination == 'Y' && (
                            <img src={rellicon} alt="" className="isExamination" />
                          )}
                        </List.Item>
                      </Tooltip>
                    );
                  }}
                />
              </div>
            )}
            {!paperlistLength && (
              <NoData
                noneIcon={noneicon}
                tip={formatMessage({
                  id: 'app.text.exam.publish.no.paper',
                  defaultMessage: '暂无试卷',
                })}
              />
            )}
          </TabPane>
          <TabPane tab={myTitle} key="2">
            {myListLength > 0 && (
              <div style={styles}>
                <List
                  className="paperlist"
                  dataSource={myPaperLists}
                  renderItem={item => {
                    let falg = true;
                    if (taskType != 'TT_2') {
                      if (paperSelected[0] && paperSelected[0].templateId) {
                        if (paperSelected[0].templateId != item.paperTemplateId) {
                          falg = false;
                        }
                      }
                    }
                    let myCalssName = '';
                    // myCalssName = this.state.currentSingle == item.paperId && currentPaperDetail.id ? 'paperItem selected' : 'paperItem';
                    if (falg) {
                      myCalssName =
                        currentSingle == item.paperId && currentPaperDetail.id
                          ? 'paperItem selected'
                          : 'paperItem';
                    } else {
                      myCalssName = 'paperItem noselected';
                    }
                    // 课后训练
                    if (taskType === 'TT_5') {
                      myCalssName =
                        currentSingle == item.paperId && currentPaperDetail.id
                          ? 'paperItem selected'
                          : 'paperItem';
                    }
                    return (
                      <List.Item className={myCalssName}>
                        <Checkbox value={item.paperId} onChange={e => this.checkSingle(e, item)} />
                        <span className="paperNameDetail">{item.paperName}</span>
                      </List.Item>
                    );
                  }}
                />
              </div>
            )}
            {!myListLength && <NoData noneIcon={noneicon} tip="暂无试卷" />}
          </TabPane>
        </Tabs>
      </div>
    );
  }
}

export default PaperList;
