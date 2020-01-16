import React, { PureComponent } from 'react';
import { Table, Tooltip, Empty } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import styles from './index.less';
import empty from '@/assets/examination/none_user_pic.png';
import NoData from '@/components/NoData/index';
import noneicon from '@/frontlib/assets/MissionReport/none_icon_class@2x.png';
import { lessWords } from '@/frontlib/utils/utils';
/**
 * 完成编排页面 和 查看编排详情页面的弹框内容
 * @author tina.zhang.xu
 * @date   2019-8-15
 */

@connect(({ editroom, loading }) => ({
  searchStudentList: editroom.searchStudentList,
  loading: loading.effects['editroom/getSearchStudentList'],
}))
class FinishList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tableData: [],
      current: 1,
      total: 1,
    };
    this.columns = [
      {
        title: formatMessage({ id: 'app.text.kh', defaultMessage: '考号' }),
        dataIndex: 'examNo',
        width: '15%',
        render: data => <div className={styles.info}>{`${data}`}</div>,
      },

      {
        title: formatMessage({ id: 'app.text.xm', defaultMessage: '姓名' }),
        dataIndex: 'studentName',
        width: '10%',
        render: data => (
          <div className={styles.info}>
            <Tooltip title={data.studentName}>{`${lessWords(data.studentName, 5)}`}</Tooltip>
            {data.reExam && <span className={styles.bubm}>补</span>}
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'app.text.bj', defaultMessage: '班级' }),
        dataIndex: 'className',
        width: '10%',
        render: data => (
          <div className={styles.info}>{data ? <Tooltip title={data}>{data}</Tooltip> : '--'}</div>
        ),
      },
      {
        title: formatMessage({ id: 'app.text.kd', defaultMessage: '考点' }),
        dataIndex: 'examPlaceName',
        width: '25%',
        render: data => (
          <div className={styles.info}>
            {data ? <Tooltip title={data}>{`${lessWords(data)}`}</Tooltip> : '--'}
          </div>
        ),
      },
      {
        title: formatMessage({ id: 'app.text.pc', defaultMessage: '批次' }),
        dataIndex: 'examBatchName',
        width: '7%',
        render: data => <div className={styles.info}>{`${data || '--'}`}</div>,
      },
      {
        title: formatMessage({ id: 'app.text.kc', defaultMessage: '考场' }),
        dataIndex: 'examRoomName',
        width: '9%',
        render: data => <div className={styles.info}>{`${data || '--'}`}</div>,
      },
      {
        title: formatMessage({ id: 'app.text.ksrq', defaultMessage: '考试日期' }),
        dataIndex: 'examDate',
        width: '14%',
        render: data => <div className={styles.info}>{`${data || '--'}`}</div>,
      },
    ];
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.getAllStudentList(1);
  }

  reFlash = () => {
    this.getAllStudentList(1);
  };

  // 113 搜索结果-传空，获取所有结果，用于弹出擦看详情页
  getAllStudentList = pageIndex => {
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'editroom/getSearchStudentList',
      payload: {
        pageSize: 12,
        pageIndex,
        taskId,
        filterWord: '',
        campusId: localStorage.getItem('campusId'),
      },
    }).then(() => {
      const { searchStudentList } = this.props;
      this.initData(searchStudentList);
    });
  };

  initData = data => {
    const a = data.records;
    let list = [];
    if (a) {
      list = a.map((Item, index) => {
        return {
          key: index,
          examNo: Item.examNo,
          campusName: Item.campusName,
          studentName: {
            studentName: Item.studentName,
            reExam: Item.reEnrollType === 'URET_1',
          },
          examPlaceName: Item.examPlaceName,
          examRoomName: Item.examRoomName,
          examBatchName: Item.examBatchName,
          examDate: Item.dateFormat,
          className: Item.className,
        };
      });
    }
    this.setState({
      tableData: list,
      total: data.total,
    });
  };

  render() {
    const { loading } = this.props;
    const { tableData, current, total } = this.state;
    const pagination = {
      position: 'bottom',
      defaultPageSize: 12,
      current,
      total,
      onChange: e => {
        this.setState({
          current: e,
        });
        this.getAllStudentList(e);
      },
    };
    return (
      <div className={styles.finishList}>
        {loading && (
          <NoData
            noneIcon={noneicon}
            tip={formatMessage({
              id: 'app.message.registration.taskinfo.loading.tip',
              defaultMessage: '信息加载中，请稍等...',
            })}
            onLoad={loading}
          />
        )}
        {!loading && (
          <>
            {tableData.length > 0 ? (
              <Table
                pagination={pagination}
                columns={this.columns}
                dataSource={tableData}
                size="small"
                style={{ height: 570, overflow: 'auto' }}
              />
            ) : (
              <div className={styles.empty}>
                <Empty
                  image={empty}
                  description={
                    <span>
                      {formatMessage({ id: 'app.text.zwbpxx', defaultMessage: '暂无编排信息' })}
                    </span>
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    );
  }
}

export default FinishList;
