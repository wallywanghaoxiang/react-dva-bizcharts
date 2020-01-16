/**
 * 试卷详情
 * @author tina
 */
import React, { PureComponent } from 'react';
import { Divider, Tooltip, message } from 'antd';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import IconButton from '@/frontlib/components/IconButton';
import ExampaperPreview from '@/frontlib/components/ExampaperPreview/ExampaperPreview';
import noneicon from '@/assets/examination/none_choose_icon@2x.png';
import NoData from '@/components/NoData/index';
import { showTime } from '@/utils/timeHandle';
import { MatchUnitType } from '@/frontlib/utils/utils';

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
  choosed: { id: 'app.examination.publish.paper.selected', defaultMessage: '已选' },
  addtask: { id: 'app.examination.publish.paper.addtask', defaultMessage: '加入任务' },
});

@connect(({ release }) => ({
  currentPaperDetail: release.currentPaperDetail,
  showData: release.showData,
  paperSelected: release.paperSelected,
  taskType: release.taskType,
  paperList: release.paperList,
  tabkey: release.tabkey,
  myPaperList: release.myPaperList,
}))
class PaperDetail extends PureComponent {
  addPaper = item => {
    const { paperSelected, addPaperCart } = this.props;
    if (paperSelected.length > 10) {
      const mgs = formatMessage({
        id: 'app.message.exam.selected.papers.reached.upper.limit',
        defaultMessage: '所选试卷已达上限',
      });
      message.warning(mgs);
    } else {
      addPaperCart(item);
    }
  };

  render() {
    const {
      currentPaperDetail,
      showData,
      addCartStatus,
      containerHeight,
      paperList,
      tabkey,
      myPaperList,
    } = this.props;

    if (currentPaperDetail) {
      return (
        <div className="testDetail" style={{ display: 'block' }}>
          <div className="paperTitle">
            <div>
              <div className="title">{currentPaperDetail.name}</div>
              <div className="tips">
                <span>{formatMessage(messages.fullmark)}：</span>
                <span className="black">
                  {currentPaperDetail.fullMark} {formatMessage(messages.mark)}
                </span>
                &nbsp;&nbsp;
                <Divider type="vertical" />
                &nbsp;&nbsp;
                <span>{formatMessage(messages.time)}：</span>
                <span className="black">{showTime(currentPaperDetail.paperTime, 's')}</span>{' '}
                &nbsp;&nbsp;
                <Divider type="vertical" />
                &nbsp;&nbsp;
                <span>{formatMessage(messages.grade)}：</span>
                <span className="black">{MatchUnitType(currentPaperDetail)}</span>&nbsp;&nbsp;
                <Divider type="vertical" />
                &nbsp;&nbsp;
                <span>{formatMessage(messages.paperTemplate)}：</span>
                <span className="black">{currentPaperDetail.templateName}</span>
              </div>
            </div>

            <div>
              <div>
                {addCartStatus ? (
                  <div className="selectedTest">
                    <IconButton
                      text={formatMessage(messages.choosed)}
                      type="button"
                      className="button"
                      iconName="iconfont icon-right"
                      textColor="textColor"
                    />
                  </div>
                ) : (
                  <Tooltip placement="top" title={formatMessage(messages.addtask)}>
                    <div className="addCart">
                      <div
                        className="iconButton button"
                        onClick={() => this.addPaper(currentPaperDetail)}
                      >
                        <i className="iconfont iconfont icon-add" />
                      </div>
                    </div>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
          <div
            className="paperContent"
            style={{ height: containerHeight - 64 - 20 - 67, backgroundColor: '#f5f5f5' }}
          >
            <div className="paperDetail">
              <div style={{ position: 'absolute' }}>
                <div id="recorder_swf" />
              </div>
              <div>
                {currentPaperDetail.id && (
                  <ExampaperPreview
                    key={currentPaperDetail.id}
                    showData={showData}
                    paperData={currentPaperDetail}
                    displayMode="paper_preview"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    const paperListData = tabkey === '1' ? paperList : myPaperList;
    return (
      <div className="testDetail_none" style={{ height: containerHeight }}>
        {paperListData.records && paperListData.records.length !== 0 ? (
          <NoData
            noneIcon={noneicon}
            tip={formatMessage({
              id: 'app.text.exam.publish.preview.paper.tip',
              defaultMessage: '点击左侧试卷名称预览试卷',
            })}
          />
        ) : null}
      </div>
    );
  }
}

export default PaperDetail;
