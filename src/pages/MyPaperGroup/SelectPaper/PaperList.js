/* eslint-disable no-unused-vars */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable eqeqeq */
/**
 * 试卷列表
 * @author tina
 */
import React, { PureComponent } from 'react';
import { List, Checkbox, Tooltip } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { connect } from 'dva';
import '../index.less';
import NoData from '@/components/NoData/index';
import noneicon from '@/assets/none_asset_icon.png';
import rellicon from '@/assets/examination/rell_icon.png';

@connect(({ papergroup }) => ({
  paperList: papergroup.paperList,
  myPaperList: papergroup.myPaperList,
  paperSelected: papergroup.paperSelected,
  taskType: papergroup.taskType,
  currentPaperDetail: papergroup.currentPaperDetail,
}))
class PaperList extends PureComponent {
  state = { currentSingle: '' };

  componentWillMount() {
    const { paperList, currentPaperId } = this.props;
    const paperlistLength = paperList ? paperList.total : 0;
    if (paperlistLength) {
      const { records } = paperList;
      this.setState({
        currentSingle: records[0].paperId,
      });
      currentPaperId(records[0].paperId);
    }
  }

  checkSingle = e => {
    this.setState({
      currentSingle: e.target.value,
    });
    const { currentPaperId } = this.props;
    currentPaperId(e.target.value);
  };

  render() {
    const paperList = this.props.paperList && this.props.paperList.records;
    const myPaperList = this.props.myPaperList && this.props.myPaperList.records;
    const paperlistLength = paperList ? this.props.paperList.total : 0;
    const myListLength = myPaperList ? this.props.myPaperList.total : 0;
    const number = paperlistLength + myListLength;
    const operations = (
      <FormattedMessage
        values={{ number }}
        {...{ id: 'app.text.exam.publish.paper.total.number', defaultMessage: '共{number}套' }}
      />
    );
    // const operations = '共'+(paperlistLength+myListLength)+'套';
    const res = formatMessage({
      id: 'app.menu.papermanage.schoolpaper',
      defaultMessage: '校本资源',
    });
    const mainTitle = `${res}(${paperlistLength})`;
    const myPaper = formatMessage({
      id: 'app.menu.papermanage.mypaper',
      defaultMessage: '我的试卷',
    });
    const myTitle = `${myPaper}(${myListLength})`;

    const { paperSelected, taskType, currentPaperDetail, little } = this.props;

    return (
      <div className="paperSource">
        {paperlistLength > 0 && (
          <List
            className="paperlist"
            dataSource={paperList}
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
              if (falg) {
                myCalssName =
                  this.state.currentSingle == item.paperId && currentPaperDetail.id
                    ? 'paperItem selected'
                    : 'paperItem';
              } else {
                myCalssName = 'paperItem noselected';
              }
              // 课后训练
              if (taskType === 'TT_5') {
                myCalssName =
                  this.state.currentSingle == item.paperId && currentPaperDetail.id
                    ? 'paperItem selected'
                    : 'paperItem';
              }
              return (
                <Tooltip
                  placement="top"
                  title={
                    !falg &&
                    taskType !== 'TT_5' &&
                    formatMessage({
                      id: 'app.message.exam.publish.selected.is.different.tip',
                      defaultMessage: '该试卷结构与已选试卷的结构不同',
                    })
                  }
                >
                  <List.Item className={myCalssName} style={little ? { width: '301px' } : {}}>
                    <Checkbox
                      value={item.paperId}
                      onChange={e => {
                        if (taskType === 'TT_5') {
                          this.checkSingle(e, item);
                        } else {
                          if (!falg) return;
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
        )}
        {!paperlistLength && (
          <NoData
            noneIcon={noneicon}
            tip={formatMessage({
              id: 'app.text.notSearchToThePaper',
              defaultMessage: '未搜索到试卷',
            })}
          />
        )}
      </div>
    );
  }
}

export default PaperList;
