import React, { Component } from 'react';
import { Modal, messag, Tabs } from 'antd';
import  './index.less';


/**
 * 总分得分显示
 */
class LabelButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {

  }

  onClick=()=>{
    const {callback,id,index}=this.props;
    if(id==index){
      callback(false);
    }else{
      callback(true);
    }
  }

  render() {
    const{name,id,index}=this.props;

    return (
      <label className={id==index?"click1":"unclick1"} onClick={this.onClick}>{name}</label>
    );
  }
}

export default LabelButton;
