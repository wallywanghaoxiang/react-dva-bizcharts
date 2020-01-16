import React, { Component } from 'react';
import './index.less';
import {Spin} from 'antd';
class NoData extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const{textStyle,imgStyle} = this.props;
    return (
      <div className="noData">       
        {this.props.onLoad&&<Spin size="large" />}
        {!this.props.onLoad&&<img src={this.props.noneIcon} style={imgStyle}/>}
        <p style={textStyle}>{this.props.tip}</p>
      </div>
    );
  }
}

export default NoData;
