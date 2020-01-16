import React, { Component } from 'react';
import { Modal, Button, message } from 'antd';
import cs from "classnames";
import { formatMessage } from 'umi/locale';
import styles from './index.less';

/**
 *
 * @author tina.zhang
 * @date 2018-12-18
 * @class DeviceStatusModal
 * @extends {Component}
 */
class DeviceStatusModal extends Component {

  state = {
    visible  : true,
    downTime : 10
  };

  constructor(props) {
    super(props);
    const {bindOnClose} = props;

    // 判断是否有bindOnClose
    bindOnClose(()=>{
      // 停止倒计时
      if( this.times ){
        clearInterval(this.times);
      }
      // 关闭弹出框
      this.setState({
        visible: false,
      });

    });
  }

  componentDidMount(){
    this.handleDownTime();
  }

  // 倒计时
  handleDownTime =()=>{
    const { dataSource : { status, downTime:propsDownTime, downTimeChange } } = this.props;
    if( status === "tasking" ){
      this.setState({ downTime : propsDownTime });
      this.times = setInterval(()=>{
        const { downTime } = this.state;
        this.setState({
          downTime : downTime-1
        },()=>{
          const { downTime : newDownTime } = this.state;
          downTimeChange(newDownTime);
        });
      },1000);
    }
  }


  onHandleCancel = () => {
    const { onClose } = this.props;
    this.setState({
      visible: false,
    });
    onClose();
  };

  // 重新检测
  onHandleOK = () => {
    const { onClose, callback } = this.props;
    onClose();
    this.setState({
      visible: false,
    });
    callback();
  };

  // 点击触发举手事件
  help = () => {
    const { dataSource : { instructions } } = this.props;
    const { sendMS } = instructions;
    const studentIpAddress = localStorage.getItem('studentIpAddress');
    sendMS("help", { "ipAddr": studentIpAddress })
    message.success(formatMessage({id:"app.text.raiseyourhand",defaultMessage:"举手成功！"}))
  }

  render() {
    const { dataSource : { status, recorder, player }} = this.props;
    const { visible, downTime=0 } = this.state;

    let msg = "";
    let taskingMsg = "";
    let icon = "icon-warning";

    if( !recorder && !player ){
      // 耳机，麦克风都不存在
      icon = "icon-warning";
      msg = formatMessage({id:"app.message.no.earphone.and.microphone",defaultMessage:"未检测到耳机和麦克风，请确认耳机和麦克风都已正确接入！"});
      taskingMsg = formatMessage({id:"app.message.no.earphone.and.microphone.downTime",defaultMessage:"未检测到耳机和麦克风，请在 {downTime} 秒内接入耳机和麦克风!"},{"downTime":downTime})
    }else if( !recorder ){
      // 没有麦克风
      icon = "icon-microphone";
      msg = formatMessage({id:"app.message.no.check.microphone",defaultMessage:"未检测到麦克风，请确认麦克风已正确接入！"});
      taskingMsg = formatMessage({id:"app.message.no.microphone.downTime",defaultMessage:"未检测到麦克风，请在 {downTime} 秒内接入麦克风!"},{"downTime":downTime});
    }else if( !player ){
      // 没有耳机
      icon = "icon-earphone";
      msg = formatMessage({id:"app.message.earphone_tip_a",defaultMessage:"未检测到耳机，请确认耳机已正确接入！"});
      taskingMsg = formatMessage({id:"app.message.no.earphone.downTime",defaultMessage:"未检测到耳机，请在 {downTime} 秒内接入耳机!"},{"downTime":downTime});
    }

    const params = {
      icon    : <span className={cs('iconfont',icon,styles.icon)} />,
      content : msg,
      footer  : [
        <Button key="submit" className={styles.reset} onClick={this.onHandleOK}>
          {formatMessage({id:"app.text.retest",defaultMessage:"重新检测"})}
        </Button>,
        <div key="hand" className={styles["hand-button"]}>
          {formatMessage({id:"app.text.problem",defaultMessage:"遇到问题"})}？
          <span className={cs("iconfont","icon-raise-hand",styles.hand)} onClick={this.help}>
            {formatMessage({id:"app.text.raisehand",defaultMessage:"举手"})}
          </span>
          {formatMessage({id:"app.text.waitdeal",defaultMessage:"等待老师处理"})}
        </div>
      ]
    };

    if( status === "tasking" ){
      params.footer = [];
      params.content = taskingMsg;
    }else if( status === "taskError" ){
      params.icon = <span className={cs('iconfont','icon-warning',styles.warning)} />;
      params.footer = [<Button key="submit" className={styles.reset} onClick={this.onHandleCancel}>确认</Button>];
      params.content = formatMessage({id:"app.text.earphone_tip_d",defaultMessage:"答题过程中耳机出现异常，答题终止！"});
    }

    return (
      <Modal
        visible={visible}
        centered
        title={formatMessage({id:"app.message.tip",defaultMessage:"提示"})}
        destroyOnClose
        closable={false}
        maskClosable={false}
        cancelText=""
        onCancel={this.onHandleCancel}
        className={styles.deviceStatusModal}
        width={520}
        footer={params.footer}
      >
        <div className={styles.tip}>
          <div>{params.icon}</div>
          <div className={styles.info}>{params.content}</div>
        </div>
      </Modal>
    );
  }
}

export default DeviceStatusModal;
