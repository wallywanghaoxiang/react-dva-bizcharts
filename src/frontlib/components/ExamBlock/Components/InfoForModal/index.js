/**
 * 通用的提示类型的弹框消息
 * type  : info warn error success
 * icon  : 图标
 * title : 主题
 * text  : 提示文本
 * footer : 自定义按钮
 */

import React, { PureComponent } from 'react';
import {Icon, Button} from "antd";
import cs from 'classnames';
import styles from "./index.less";

class infoForModal extends PureComponent {

  // 头部提示信息
  renderHeader = ()=>{
    const { title } = this.props;
    if( title === null ){
      return null;
    }

    return (
      <div className={styles.header}>
        {title||"提示"}
      </div>
    )
  }

  // 中间内容区域
  renderContent =()=>{
    const { icon, type, text } = this.props;
    const typeClass = `${type||"info"}`;

    let iconDom = null;
    if( icon ){
      iconDom = icon;
    }else{
      const typeIcon = {
        "info"    : "info-circle",
        "warn"    : "exclamation-circle",
        "error"   : "close-circle",
        "success" : "check-circle"
      }[type||"info"];
      iconDom = <Icon className={cs(styles.icon,styles[typeClass])} type={typeIcon} theme="filled" />;
    }

    return (
      <div className={styles.connent}>
        {iconDom}
        <div className={cs(styles.text,styles[typeClass])}>{text}</div>
      </div>
    )
  }

  // 根据参数生成button
  getButtonsRender = ()=>{
    const { buttons=[] } = this.props;
    if( buttons.length === 0 ) return null;
    const btns = buttons.map((item,key)=>{
      const {title,...params} = item;
      return <Button className={styles.button} key={String(key)} {...params}>{title}</Button>
    });
    return (
      <div className={styles.footer}>
        {btns}
      </div>
    )
  }


  render(){

    return (
      <div className={styles.body}>
        {/* 头部 */}
        {this.renderHeader()}
        {/* 主体 */}
        {this.renderContent()}
        {/* 底部 */}
        {this.getButtonsRender()}
      </div>
    )
  }
}

export default infoForModal;
