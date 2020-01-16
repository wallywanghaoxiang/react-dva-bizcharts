import React, { Component } from 'react';
import {  Slider } from 'antd';
import { formatMessage } from 'umi/locale';
import './index.less';

/**
 * type: ''(耳麦调整)、earphone（耳机调整）、micphone（麦克风调整）
 * dataSource:{
 *   earVolume:'耳机默认值',
 *   micVolume:'麦克风默认值'
 * }
 *
 * @author tina.zhang
 * @date 2018-12-15
 * @class EarMicVolumeView
 * @extends {Component}
 */
class EarMicVolumeView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      earValue: props.dataSource.earVolume,
      micValue: props.dataSource.micVolume,
    };
  }

  //关闭view
  closeView = () => {
    this.props.onClose();
  };

  //耳机音量变化
  handleEarChange = value => {
    const { setEarphoneVolume } = this.props.dataSource.instructions;
    this.playing = true;
    this.setState({
      earValue: value,
    });
    setEarphoneVolume(value);
  };

  // 麦克风音量值变化
  handleMicChange = value => {
    const { setMicphoneVolume } = this.props.dataSource.instructions;
    this.setState({
      micValue: value,
    });
    setMicphoneVolume(value);
  };

    /**
   * 播放叮
   */
  playVolume = (val)=>{
    const { setEarphoneVolume } = this.props.dataSource.instructions;
    if( this.playing ){
      // playType("TYPE_01");
      setEarphoneVolume(val,true);
      this.playing = false;
    }
  }


  render() {
    const { dataSource } = this.props;
    const type = dataSource.type;
    let view_tittle = '';
    if (type == '') {
      view_tittle = formatMessage({id:"app.text.headsettoadjust",defaultMessage:"耳麦调整"});
    } else if (type == 'earphone') {
      view_tittle = formatMessage({id:"app.text.headphonestoadjust",defaultMessage:"耳机调整"});
    } else if (type == 'micphone') {
      view_tittle = formatMessage({id:"app.text.microphoneadjustment",defaultMessage:"麦克风调整"});
    }
    return (
      <div className="ear-mic-view">
        <div className="title-box">
          <div className="title">{view_tittle}</div>
          <div className="close" onClick={this.closeView}>
            <i className="iconfont icon-close" />
          </div>
        </div>
        {/* 耳机音量 */}
        <div
          className="earphone-box"
          style={{ display: type == '' || type == 'earphone' ? 'block' : 'none' }}
        >
          <div className="title">
            <i
              className="iconfont icon-earphone"
              style={{ fontSize: '13px', paddingRight: '6px' }}
            />
            {formatMessage({id:"app.text.earphonevoice",defaultMessage:"耳机音量"})}
          </div>
          <div className="slider-box">
            <Slider
              style={{ width: '200px' }}
              value={this.state.earValue}
              onChange={this.handleEarChange}
              onAfterChange={this.playVolume}
            />
            <div className="volumeTip small">
              <div className="vline" />
              <span>{formatMessage({id:"app.text.little",defaultMessage:"小"})}</span>
            </div>
            <div className="volumeTip earphone-normal">
              <div className="vline" />
              <span>{formatMessage({id:"app.text.recommend",defaultMessage:"推荐"})}</span>
            </div>
            <div className="volumeTip big">
              <div className="vline" />
              <span>{formatMessage({id:"app.text.big",defaultMessage:"大"})}</span>
            </div>
          </div>
        </div>
        {/* 麦克风音量 */}
        <div
          className="micphone-box"
          style={{ display: type == '' || type == 'micphone' ? 'block' : 'none' }}
        >
          <div className="title">
            <i
              className="iconfont icon-microphone"
              style={{ fontSize: '13px', paddingRight: '6px' }}
            />
            {formatMessage({id:"app.text.microphonevoice",defaultMessage:"麦克风音量"})}
          </div>
          <div className="slider-box">
            <Slider
              style={{ width: '200px' }}
              value={this.state.micValue}
              onChange={this.handleMicChange}
            />
            <div className="volumeTip small">
              <div className="vline" />
              <span>{formatMessage({id:"app.text.little",defaultMessage:"小"})}</span>
            </div>
            <div className="volumeTip micphone-normal">
              <div className="vline" />
              <span>{formatMessage({id:"app.text.recommend",defaultMessage:"推荐"})}</span>
            </div>
            <div className="volumeTip big">
              <div className="vline" />
              <span>{formatMessage({id:"app.text.big",defaultMessage:"大"})}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default EarMicVolumeView;
