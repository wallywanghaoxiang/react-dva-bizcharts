import React, { PureComponent } from 'react';
import { Divider } from 'antd';
import { connect } from 'dva';
import Link from 'umi/link';
import { formatMessage, defineMessages } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import InspectionHeader from '../Components/Inspection/InspectionHeader';
import InspectionList from '../Components/Inspection/InspectionList';
import styles from './index.less';

const messages = defineMessages({
  inspect: { id: 'app.menu.examination.inspect', defaultMessage: '检查' },
  inspection: { id: 'app.menu.examination.inspection', defaultMessage: '课后训练' },
});

/**
 * 课后训练任务-检查详情
 * @author tina.zhang
 */
@connect(({ inspect, loading }) => ({
  pageLoading: loading.effects['inspect/tsmkInspection'],
  inspectInfo: inspect.inspectInfo
}))
class Inspection extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    const { dispatch, match } = this.props;
    dispatch({
      type: 'inspect/tsmkInspection',
      payload: { taskId: match.params.id }
    });
  }

  render() {

    const { pageLoading, inspectInfo } = this.props

    return (
      <div className={styles.inspection}>
        <h1 className={styles.menuName}>
          <Link to="/examination/inspect">
            <span>{formatMessage(messages.inspect)}
              <i>/</i>
            </span>
          </Link>
          {formatMessage(messages.inspection)}
        </h1>

        <PageHeaderWrapper wrapperClassName="wrapperMain">
          {pageLoading && <NoData noneIcon={noneicon} tip="任务信息加载中，请稍等..." onLoad={pageLoading} />}
          {!pageLoading &&
            <>
              {inspectInfo && <InspectionHeader inspectInfo={inspectInfo} />}
              <div className={styles.competeInfo}>
                完成情况
                <Divider type="horizontal" />
              </div>
              {inspectInfo && inspectInfo.statis && <InspectionList taskId={inspectInfo.taskId} inspectClassData={inspectInfo.statis} />}
            </>
          }
        </PageHeaderWrapper>
      </div>
    )
  }
}

export default Inspection
