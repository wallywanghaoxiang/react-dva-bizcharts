// 试卷详情
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import { Select, Button, List, Pagination, Tooltip } from 'antd';
import cs from 'classnames';
import { MatchUnitType } from '@/frontlib/utils/utils';
import ExampaperPreview from '@/frontlib/components/ExampaperPreview/index';
import { showTime } from '@/utils/timeHandle';
import styles from './index.less';

const { Option } = Select;

const messages = defineMessages({
  paperback: { id: 'app.menu.papermanage.paperback', defaultMessage: '返回' },
  paperview: { id: 'app.menu.papermanage.view', defaultMessage: '预览' },
  papersercet: { id: 'app.menu.papermanage.papersercet', defaultMessage: '保密' },
  paperopen: { id: 'app.menu.papermanage.paperopen', defaultMessage: '开放' },
});

@connect(({ papermanage, release }) => {
  const { paperInfoDetail, gradeList, curentPaperPackage } = papermanage;
  const { currentPaperDetail, showData } = release;
  return { paperInfoDetail, gradeList, curentPaperPackage, currentPaperDetail, showData };
})
class PaperDetail extends Component {
  state = {
    grade: '',
    pageIndex: 1,
    showPaper: false,
  };

  componentWillMount() {
    const { curentPaperPackage, dispatch } = this.props;
    const { pageIndex, grade } = this.state;
    // 获取年级信息
    dispatch({
      type: 'papermanage/PaperPackageGradeList',
      payload: {
        campusPackageId: curentPaperPackage.id,
      },
    });
    this.fetchPaperList(grade, pageIndex);
  }

  // 获取试卷包详情列表
  fetchPaperList = (grade, pageIndex) => {
    const { curentPaperPackage, dispatch } = this.props;
    dispatch({
      type: 'papermanage/PaperPackageDetail',
      payload: {
        campusPackageId: curentPaperPackage.id,
        grade,
        pageIndex,
        pageSize: '8',
      },
    });
  };

  // 切换年级

  handleChange = value => {
    this.setState({
      grade: value,
    });
    this.fetchPaperList(value, '1');
  };

  // 返回
  back = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'papermanage/saveCurrent',
      payload: {
        curentPaperPackage: '',
        paperInfoDetail: {},
      },
    });
  };

  // 格式化时间
  formatSeconds = value => showTime(value, 's');

  // 是否开放保密

  changeStatus = (status, campusPaperId) => {
    const { dispatch } = this.props;
    const { grade, pageIndex } = this.state;
    const that = this;
    dispatch({
      type: 'papermanage/PaperChangeStatus',
      payload: {
        campusPaperId,
        status,
      },
    }).then(() => {
      that.fetchPaperList(grade, pageIndex);
    });
  };

  // 切换分页
  onChangePage = page => {
    this.setState({
      pageIndex: page,
    });
    const { grade } = this.state;
    this.fetchPaperList(grade, page);
  };

  // 渲染是否开放 保密按钮
  renderBtn = (status, id) => {
    const isAdmin = localStorage.getItem('isAdmin');
    const isSubjectAdmin = localStorage.getItem('isSubjectAdmin');
    if (isAdmin === 'true' || isSubjectAdmin === 'true') {
      switch (status) {
        case 'N':
          return (
            <Button className={styles.view} onClick={() => this.changeStatus('Y', id)}>
              <i className="iconfont icon-plane" />
              {formatMessage(messages.paperopen)}
            </Button>
          );
        case 'Y':
          return (
            <Button className={styles.view} onClick={() => this.changeStatus('N', id)}>
              <i className="iconfont icon-hide" />
              {formatMessage(messages.papersercet)}
            </Button>
          );
        case 'null':
          return (
            <Button className={styles.view} onClick={() => this.changeStatus('N', id)}>
              <i className="iconfont icon-hide" />
              {formatMessage(messages.papersercet)}
            </Button>
          );
        default:
          return 0;
      }
    }
    return '';
  };

  // 已开发 保密中
  renderStatusBtn = status => {
    switch (status) {
      case 'N':
        return formatMessage({ id: 'app.text.paperManage.sercet', defaultMessage: '保密中' });
      case 'Y':
        return formatMessage({ id: 'app.text.paperManage.state.open', defaultMessage: '已开放' });
      case 'null':
        return formatMessage({ id: 'app.text.paperManage.state.open', defaultMessage: '已开放' });
      default:
        return 0;
    }
  };

  // 试卷
  previewPaper = id => {
    const { dispatch } = this.props;

    const params = {
      paperId: id,
    };
    dispatch({
      type: 'release/fetchPaperDetail',
      payload: params,
    }).then(() => {
      this.setState({
        showPaper: true,
      });
    });
  };

  render() {
    const {
      paperInfoDetail,
      gradeList,
      curentPaperPackage,
      showData,
      currentPaperDetail,
    } = this.props;
    const { showPaper } = this.state;
    const { records, total, size } = paperInfoDetail;
    const grade = gradeList.filter(item => item && item.grade !== '');
    return (
      <div className={styles.PaperDetail}>
        <div className={styles.paperTitle}>
          <div className={styles.paperPackageName}>{curentPaperPackage.name}</div>
          <Button className={styles.back} onClick={this.back}>
            <i className="iconfont icon-link-arrow-down" />
            {formatMessage(messages.paperback)}
          </Button>
          {grade.length > 1 && <span className={styles.r}>|</span>}
          {grade.length > 1 && (
            <Select
              defaultValue={formatMessage({
                id: 'app.notice.list.filter.all',
                defaultMessage: '全部',
              })}
              style={{ width: 120 }}
              onChange={this.handleChange}
            >
              {gradeList.map(item => {
                return (
                  <Option value={item.grade} key={item.grade}>
                    {item.gradeValue}
                  </Option>
                );
              })}
            </Select>
          )}
        </div>
        <div className={styles.detailList}>
          <List
            grid={{ gutter: 33, xs: 1, sm: 2, md: 2, lg: 2, xl: 3, xxl: 4 }}
            className={styles.paperInfoListanbul}
            dataSource={records}
            renderItem={item => (
              <List.Item className={item.status === 'N' ? styles.bindStatus : ''}>
                <div className={cs('lockUp', styles.lockUp)}>
                  <span />
                  <i className="iconfont icon-lock" />
                </div>
                <div className={cs('paperListName', styles.paperListName)}>
                  <Tooltip title={item.name}>{item.name}</Tooltip>
                </div>
                <div className={cs('times', styles.times)}>
                  {item.fullMark || 0}
                  <span>
                    {formatMessage({
                      id: 'app.examination.inspect.paper.mark',
                      defaultMessage: '分',
                    })}
                  </span>
                </div>
                <div className={cs('tips', styles.tips)}>
                  <span>
                    {item.questionCount || 0}
                    {formatMessage({ id: 'app.menu.papermanage.paperItem', defaultMessage: '题' })}
                  </span>
                  <span>{this.formatSeconds(item.paperTime || 0)}</span>
                  <span className={styles.zeroFire}>
                    <i className="iconfont icon-fire" />
                    {Math.round((item.usedCount / curentPaperPackage.usedCount) * 100) || 0}℃
                  </span>
                </div>
                <div className={cs('intro', styles.intro)}>
                  <ul>
                    <li>
                      <span>{MatchUnitType(item)}</span>
                      {formatMessage({
                        id: 'app.examination.inspect.task.detail.paper.range',
                        defaultMessage: '适用范围',
                      })}
                    </li>
                    <li>
                      <span>{this.renderStatusBtn(item.status || 'Y')}</span>
                      {formatMessage({ id: 'app.text.classManage.state', defaultMessage: '状态' })}
                    </li>
                  </ul>
                </div>

                <div className={styles.operBtn}>
                  <Button className={styles.view} onClick={() => this.previewPaper(item.paperId)}>
                    <i className="iconfont icon-eye" />
                    {formatMessage(messages.paperview)}
                  </Button>
                  {this.renderBtn(item.status || 'Y', item.id)}
                </div>
              </List.Item>
            )}
          />
          <Pagination
            defaultCurrent={1}
            total={total}
            pageSize={size}
            onChange={this.onChangePage}
            disabled={total < size}
          />
        </div>
        {showPaper && (
          <ExampaperPreview
            dataSource={{
              showData,
              paperData: currentPaperDetail,
              displayMode: 'campus-resource',
            }}
            onClose={() => {
              this.setState({
                showPaper: false,
              });
            }}
          />
        )}
      </div>
    );
  }
}

export default PaperDetail;
