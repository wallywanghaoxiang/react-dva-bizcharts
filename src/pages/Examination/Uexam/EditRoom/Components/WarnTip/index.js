import React, { PureComponent } from 'react';
import { Modal, Button, Pagination, Tooltip } from 'antd';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { lessWords } from '@/frontlib/utils/utils'
import styles from './index.less';


/**
 * 未分配策略警告页面
 * @author tina.zhang.xu
 * @date   2019-8-10
 */

@connect(({ editroom }) => ({
  noStrategyList: editroom.noStrategyList,
  finishNoStrategyList: editroom.finishNoStrategyList
}))
class WarnTip extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,    // 默认页数
    }
  }

  componentDidMount() {
  }


  handleback = () => {
    const { callback } = this.props;
    callback(false);
  }

  finish = () => {
    const { callback } = this.props;
    callback(true)
  }

  footer = () => {
    const { step } = this.props;
    const html = (
      <div className={styles.footer}>
        <div className={styles.info} />
        <div className={styles.btns}>
          {step === "step1" && <Button className={styles.btnOk} onClick={this.handleback}>{formatMessage({ id: "app.know", defaultMessage: "我知道了" })}</Button>}
          {/* {this.props.step!="step1"&& <Button className={styles.btnRed} onClick={this.finish}>{formatMessage({id:"app.text.hlbwcbp",defaultMessage:"忽略并完成编排"})}</Button>} */}
          {step !== "step1" && <Button className={styles.btnOk} onClick={this.handleback}>{formatMessage({ id: "app.text.qbp", defaultMessage: "去编排" })}</Button>}
        </div>
      </div>
    )
    return html;
  }

  // 弹窗顶部的信息
  head = () => {
    const html = (
      <div className={styles.head}>
        <i className="iconfont icon-warning" /><span>{formatMessage({ id: "app.text.waringtip", defaultMessage: "以下班级存在考生没有考编信息，请前往编排" })}</span>
      </div>
    )
    return html;
  }

  showList = (page) => {
    const { noStrategyList, finishNoStrategyList, step } = this.props
    let data = [];
    const html = [];
    let index = 0;
    if (step === "step1") {
      data = noStrategyList
    } else {
      data = finishNoStrategyList;
    }
    for (let i = 0; i < 5; i += 1) {// 每页只显示5条数据
      index = i + 5 * (page - 1);
      if (data[index]) {
        if (i > 0) {
          html.push(<div className={styles.line} />)
        }
        html.push(
          <div className={styles.school}>
            <Tooltip title={data[index].name}>
              <span>{lessWords(data[index].name, 25)}</span>
            </Tooltip>
          </div>
        )
      }
    }
    return html;
  }

  render() {
    const { noStrategyList, finishNoStrategyList, step } = this.props;
    const { page } = this.state;
    const data = step === "step1" ? noStrategyList : finishNoStrategyList;
    return (
      <Modal
        title={null}
        visible
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okButtonProps={{ disabled: true }}
        width={500}
        closable={false}
        footer={null}
      >
        <div className={styles.warnTip}>
          <>{this.head()}</>
          <div className={styles.content}>
            {this.showList(page)}
          </div>
          <div className={styles.pagination}>
            <Pagination
              total={data.length}
              current={page}
              defaultPageSize={6}
              onChange={(e) => {
                this.setState({
                  page: e
                })
              }}
            />
          </div>
          <div className={styles.line2} />
          <>{this.footer()}</>
        </div>
      </Modal>
    )
  }
}
export default WarnTip
