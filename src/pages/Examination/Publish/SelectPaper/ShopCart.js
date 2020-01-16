/* eslint-disable react/no-unused-state */
/* eslint-disable react/destructuring-assignment */
/**
 * 已选试卷
 * @author tina
 */
import React, { PureComponent } from 'react';
import { Icon, List, Divider } from 'antd';
import { formatMessage, defineMessages } from 'umi/locale';
import NoData from '@/components/NoData/index';
import noneicon from '@/assets/none_asset_icon.png';
import { MatchUnitType } from '@/frontlib/utils/utils';
import { showTime } from '@/utils/timeHandle';

const messages = defineMessages({
  schoolYear: { id: 'app.school.year', defaultMessage: '学年' },
  grade: { id: 'app.grade', defaultMessage: '适用范围' },
  time: { id: 'app.examination.inspect.task.detail.time', defaultMessage: '时长' },
  fullmark: { id: 'app.examination.inspect.task.detail.full.mark', defaultMessage: '总分' },
  paperTemplate: {
    id: 'app.examination.inspect.task.detail.paper.template',
    defaultMessage: '试卷结构',
  },
  mark: { id: 'app.examination.inspect.paper.mark', defaultMessage: '分' },
  selected: { id: 'app.examination.publish.selectedpaper', defaultMessage: '已选试卷' },
  emptypaper: { id: 'app.examination.publish.empty.selectedpaper', defaultMessage: '清空所选' },
  delpaper: { id: 'app.examination.publish.delpaper', defaultMessage: '删除试卷' },
  del: { id: 'app.examination.publish.del', defaultMessage: '删除' },
  cancel: { id: 'app.examination.publish.cancel', defaultMessage: '取消' },
  isdel: { id: 'app.examination.publish.isdelpaper', defaultMessage: '确认要删除该试卷吗？' },
  emptytip: { id: 'app.examination.publish.emptytips', defaultMessage: '您还没有加入试卷' },
});

export default class ShopCart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { cartList: props.selectedPaperList };
  }

  deleteSelected = () => {
    this.props.deleteSelectedAll();
  };

  hideSelected = () => {
    this.props.hideSelectedPaper();
  };

  deletePaper = (id, e) => {
    e.stopPropagation();
    const propRemove = this.props;
    propRemove.deletePaperCurrent(id);
  };

  render() {
    const { currentId, selectedPaperList, currentPaperId } = this.props;
    return (
      <div className="paperSelected">
        <div className="navTitle">
          <span className="tips">{formatMessage(messages.selected)}</span>
          <span className="clearAll">
            <span onClick={this.deleteSelected}>{formatMessage(messages.emptypaper)}</span>
            <Icon type="close" theme="outlined" onClick={this.hideSelected} />
          </span>
        </div>
        {selectedPaperList.length > 0 && (
          <List
            className="selectedlist"
            dataSource={selectedPaperList}
            renderItem={item => (
              <List.Item
                className="listItem"
                onClick={() => {
                  currentPaperId(item.id, item.paperType);
                }}
                style={currentId === item.id ? { background: '#CDF3E1' } : {}}
              >
                <div>
                  <div className="title">{item.name}</div>
                  <div className="tips">
                    <span>{formatMessage(messages.fullmark)}：</span>
                    <span className="black">
                      {item.fullMark} {formatMessage(messages.mark)}
                    </span>
                    &nbsp;&nbsp;
                    <Divider type="vertical" />
                    &nbsp;&nbsp;
                    <span>{formatMessage(messages.time)}：</span>
                    <span className="black">{showTime(item.paperTime, 's')}</span> &nbsp;&nbsp;
                    <Divider type="vertical" />
                    &nbsp;&nbsp;
                    <span>{formatMessage(messages.grade)}：</span>
                    <span className="black">{MatchUnitType(item)}</span>&nbsp;&nbsp;
                    <Divider type="vertical" />
                    &nbsp;&nbsp;
                    {/* <span>{formatMessage(messages.schoolYear)}：</span><span className="black">{item.annualValue}</span> &nbsp;&nbsp;<Divider type="vertical" />&nbsp;&nbsp; */}
                    <span>{formatMessage(messages.paperTemplate)}：</span>
                    <span className="black">{item.templateName}</span>
                  </div>
                </div>
                <div className="deleteTest" onClick={e => this.deletePaper(item.id, e)}>
                  <Icon type="delete" />
                </div>
              </List.Item>
            )}
          />
        )}
        {selectedPaperList.length === 0 && (
          <NoData
            noneIcon={noneicon}
            tip={formatMessage(messages.emptytip)}
            textStyle={{ marginBottom: '48px' }}
            imgStyle={{ marginTop: '48px' }}
          />
        )}
      </div>
    );
  }
}
