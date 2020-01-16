import React, { PureComponent, } from 'react';
import { Button, Divider, Input } from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { connect } from 'dva';
import styles from './index.less';


@connect(({ editroom, loading }) => ({
  strategyNum: editroom.strategyNum,
  examStatistics: editroom.examStatistics,
  loading: loading.effects['editroom/getExamStatistics'],
}))

/**
 * 操作栏
 * @author tina.zhang.xu
 * @date   2019-8-7
 */

class Toolbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showSearch: false,
      searchText: ""
    }
  }

  componentDidMount() {
  }


  onClick = () => {
    const { onClick } = this.props
    onClick();
  }

  // 显示和隐藏搜索框的开关
  handleSearchSwitch = result => {
    const { changeStatus } = this.props;
    this.setState({
      showSearch: result,
      searchText: ""
    })
    if (!result) {
      changeStatus("", "")// 关闭搜索显示
    }

  }

  // 开始搜索
  handleSearch = value => {
    const { changeStatus } = this.props;
    changeStatus("none", value)
    this.getSearchStudentList(value)
  }

  // 搜索框输入
  handleChange = e => {
    if (e.target.value.length < 31) {// 最多输入30个字
      this.setState({
        searchText: e.target.value
      })
    }
  }

  // 清空搜索框
  handleClearSearch = () => {
    this.setState({
      searchText: ""
    })
  }

  // 回到策略调整
  backToStep1 = () => {
    const { back } = this.props;
    back()
  }

  // 113 搜索结果
  getSearchStudentList = (value) => {
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'editroom/getSearchStudentList',
      payload: {
        pageSize: 12,
        pageIndex: 1,
        taskId,
        filterWord: value,
        campusId: localStorage.getItem('campusId'),
      }
    })
  }

  render() {
    const { strategyNum, step, examStatistics, title, loading, watchInfo } = this.props;
    const { showSearch, searchText } = this.state;
    const { Search } = Input;
    let css1;
    let css2;
    if (step === "step1") {
      css1 = styles.doing;
      css2 = styles.normal;
    } else if (step === "step2") {
      css1 = styles.finish;
      css2 = styles.doing;
    }
    return (
      <div className={styles.toolbar}>
        <div className={styles.leftInfo}>
          {!title ?
            <div className={styles.step}>
              <div className={css1}><div className={styles.yuan}><span>{step === "step2" ? <i className="iconfont icon-right" /> : 1}</span></div><span>{formatMessage({ id: "app.text.pzcl", defaultMessage: "配置策略" })}</span></div>
              <div className={styles.shortline} />
              <div className={css2}><div className={styles.yuan}><span>2</span></div><span>{formatMessage({ id: "app.text.bpks", defaultMessage: "编排考生" })}</span></div>
            </div>
            :
            <div className={styles.title}>
              {title}
            </div>}
          {!loading &&
            <div className={styles.statiss}>
              <>
                {step === "step1" && <FormattedMessage
                  id="app.text.strategynum"
                  defaultMessage="已经分配策略{strategynum}个"
                  values={{
                    strategynum: <span className={styles.boldNum}>{strategyNum}</span>,
                  }}
                />}
                {step !== "step1" &&
                  <>
                    <FormattedMessage
                      id="app.text.bpbj"
                      defaultMessage="编排班级{num}个"
                      values={{
                        num: <span className={styles.boldNum}>{examStatistics.classFinishNum}</span>,
                      }}
                    />
                    <Divider type="vertical" />
                    <FormattedMessage
                      id="app.text.bbksrrr"
                      defaultMessage="编排考生{num}人"
                      values={{
                        num: <span className={styles.boldNum}>{examStatistics.studentFinishNum}</span>,
                      }}
                    />
                  </>}
              </>
            </div>}
        </div>
        <div className={styles.rightBtngroup}>
          {step === "step2" &&
            <>
              <Button className={styles.btnCustom} shape="round" onClick={this.backToStep1}>
                <i className="iconfont icon-link-arrow-left" /><span>{formatMessage({ id: "app.text.tzcl", defaultMessage: "调整策略" })}</span>
              </Button>
              <Button className={styles.btnCustom} shape="round" onClick={() => { watchInfo() }}>
                <i className="iconfont icon-eye" /><span>{formatMessage({ id: "app.button.uexam.paper.arrange.see.arrange.detail", defaultMessage: "查看编排详情" })}</span>
              </Button>

              {!showSearch &&
                <Button className={styles.search} shape="round" onClick={() => this.handleSearchSwitch(true)}>
                  <i className="iconfont icon-serach" />
                </Button>}
              {showSearch &&
                <>
                  <Search
                    className={styles.searchInput}
                    placeholder={formatMessage({ id: "app.placeholder.uexam.examination.inspect.registration.toolbar.search", defaultMessage: "请输入考生姓名搜索" })}
                    onChange={e => this.handleChange(e)}
                    onSearch={value => this.handleSearch(value)}
                    value={searchText}
                    style={{ width: 240 }}
                    suffix={!searchText ? null : <i className="iconfont icon-error" onClick={() => this.handleClearSearch()} />}
                  />
                  <Button className={styles.cancelSearch} type="link" onClick={() => this.handleSearchSwitch(false)}>
                    {formatMessage({ id: "app.button.uexam.examination.inspect.registration.import.cancelSearch", defaultMessage: "取消搜索" })}
                  </Button>
                </>}
            </>
          }
          {/* <Divider type="vertical" /> */}
        </div>
      </div>
    )
  }
}


export default Toolbar
