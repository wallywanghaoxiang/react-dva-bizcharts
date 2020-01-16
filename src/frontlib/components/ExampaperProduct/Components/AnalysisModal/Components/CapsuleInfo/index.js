import React, { Component } from 'react';
import './index.less';


/**
 * 胶囊信息，用于开放题型显示“我的表现”和得分点扣分点
 */
class CapsuleInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  onClick = () => {
    const { callback, id, index } = this.props;
    if (id === index) {
      callback(false);
    } else {
      callback(true);
    }
  }

  /*
  *type 1: 我的表现 title名称  content 内容
  *2: 得分点  word单词 result 是否得到
  *3: 扣分点 word单词 result 是否扣到
  * 
  */
  render() {
    const { type, title, content, word, result } = this.props;
    const html = []
    if (type === 1) {
      html.push(
        <div className="capsule"><span className="leftTitle">{title}</span><span className="rightContent">{content}</span></div>
      )
    } else if (type === 2) {
      html.push(
        <div className={result ? "capsule2 get221" : "capsule2 loss221"}>{word}<i className={result ? "iconfont icon-face-2 face221" : "iconfont icon-face-1 face221"} /></div>
      )
    } else if (type === 3) {
      html.push(
        <div className={result ? "capsule2 bad221" : "capsule2 nomal221"}>{word}{result && <i className="iconfont icon-face- face221" />}</div>
      )
    }
    return (
      <div>
        {html}
      </div>
    );
  }
}

export default CapsuleInfo;
