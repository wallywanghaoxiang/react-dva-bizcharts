/* eslint-disable react/jsx-closing-tag-location */
/**
 * 试卷详情
 * @author tina
 */
import React, { PureComponent } from 'react';
// import {message} from 'antd';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import ExampaperPreview from '@/frontlib/components/ExampaperPreview/ExampaperPreview';
import noneicon from '@/assets/examination/none_choose_icon@2x.png';
import NoData from '@/components/NoData/index';

@connect(({ papergroup, permission }) => ({
  currentPaperDetail: papergroup.currentPaperDetail,
  showData: papergroup.showData,
  paperSelected: papergroup.paperSelected,
  taskType: papergroup.taskType,
  questionIds: papergroup.questionIds,
  defaultPermissionList: permission,
}))
class PaperDetail extends PureComponent {
  addPaperQuestion = (item, type) => {
    const { addPaperCart } = this.props;
    addPaperCart(item, type);
  };

  render() {
    const {
      currentPaperDetail,
      showData,
      containerHeight,
      questionIds,
      defaultPermissionList,
    } = this.props;

    if (currentPaperDetail) {
      return (
        <div style={{ display: 'block', marginTop: '-10px' }}>
          <div>
            <div>
              <div style={{ position: 'absolute' }}>
                <div id="recorder_swf" />
              </div>
              <div>
                {currentPaperDetail.id && (
                  <ExampaperPreview
                    key={currentPaperDetail.id}
                    showData={showData}
                    defaultPermissionList={defaultPermissionList}
                    paperData={currentPaperDetail}
                    isPapergroupFooter
                    questionIds={questionIds}
                    displayMode="paper_preview"
                    selectCallback={(e, type) => {
                      this.addPaperQuestion(e, type);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="testDetail_none" style={{ height: containerHeight }}>
        <NoData
          noneIcon={noneicon}
          tip={formatMessage({
            id: 'app.text.exam.publish.preview.paper.tip',
            defaultMessage: '点击左侧试卷名称预览试卷',
          })}
        />
      </div>
    );
  }
}

export default PaperDetail;
