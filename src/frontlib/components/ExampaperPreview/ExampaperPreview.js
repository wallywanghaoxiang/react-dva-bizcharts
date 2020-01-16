/* eslint-disable react/no-unused-state */
import React, { PureComponent } from 'react';
import DetailPage from './DetailPage';
import './index.less';

/**
 *整卷报告组件
 *
 * @author tina.zhang
 * @date 2018-12-18
 * @export
 * @class ExampaperReport
 * @extends {PureComponent}
 */
export default class ExampaperReport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      paperData: {}, // 主控数据
      showData: {}, // 答题json数据
      subScoreData: '',
    };
  }

  componentDidMount() {
    const { paperData, showData } = this.props;
    this.setState({
      paperData,
      showData,
    });
  }

  postSubData(data) {
    this.setState({
      subScoreData: data,
    });
  }

  render() {
    const {
      paperData,
      showData,
      displayMode,
      apiUrl,
      isPapergroupFooter,
      questionIds,
      defaultPermissionList,
    } = this.props;
    const { subScoreData } = this.state;
    return (
      <div className="ExampaperReport">
        <DetailPage
          paperData={paperData}
          defaultPermissionList={defaultPermissionList}
          subScoreData={subScoreData}
          showData={showData}
          displayMode={displayMode}
          apiUrl={apiUrl}
          isPapergroupFooter={isPapergroupFooter}
          questionIds={questionIds}
          self={this}
          selectCallback={(e, type) => {
            const { selectCallback } = this.props;
            if (selectCallback) {
              selectCallback(e, type);
            }
          }}
        />
      </div>
    );
  }
}
