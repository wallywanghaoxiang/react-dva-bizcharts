import React, { Component } from 'react';
import './index.less';
import {Button} from 'antd';


/**
 * 带图标的按钮组件
 * onClick 	点击事件
 * text 	按钮文字
 * iconName 图标
 *
 * @author tina.zhang
 */
class IconButton extends Component {

 constructor(props) {
   super(props);
 }
 
 render() {
	 const {iconName,onClick,text,style,type} = this.props
	 if (type == 'button') {
		return (			
		  <div className={'button'} onClick={onClick} style={style}>
			<i className={'iconfont ' + iconName} />
			<span className="icontext">{text}</span>
		  </div>
		);
	  } else {
		return (
		  <div className={'icon-btn'} onClick={onClick} style={style}>
			<i className={'iconfont ' + iconName} />
			<span className="icontext">{text}</span>
		  </div>
		);
	  }
 }
}

export default IconButton;
