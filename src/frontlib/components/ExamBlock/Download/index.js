import React, { PureComponent } from 'react';
import Single from './Single';
import Mutiple from "./Mutiple";

/**
 * 1、 type
 * single ： 单试卷考试模式   mutiple : 多试卷考试模式
 *
 * 2、 downloadEffect
 * 下载试卷需要调用外包，请求的外部modal的  type 和 payload
 *
 * 3、onChange
 * 状态变更的回调
 *
 */

export default class Download extends PureComponent {

  render() {
    const { type, downloadEffect, onChange } = this.props;

    // 单试卷考试模式
    if( type === "single" ){
      return <Single downloadEffect={downloadEffect} onChange={onChange} />
    }

    // 多试卷考试模式
    if( type === "mutiple" ){
      return <Mutiple downloadEffect={downloadEffect} onChange={onChange} />
    }

    return null;
  }
}
