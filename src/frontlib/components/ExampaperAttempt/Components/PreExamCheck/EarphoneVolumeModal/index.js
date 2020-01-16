import React, { Component } from 'react';
import { Modal, Slider } from 'antd';
import { formatMessage } from 'umi/locale';
import './index.less';

/**
 * type: earphone(耳机) 、micphone（麦克风）
 *
 * @author tina.zhang
 * @date 2018-12-15
 * @class EarphoneVolumeModal
 * @extends {Component}
 */
class EarphoneVolumeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      volumeValue: props.dataSource.volume ? props.dataSource.volume : 0
    };
  };

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
    this.setState({
      visible: false,
    });
    onClose();
    callback();
    // 10.2.2 提示需求，点击确认不需要再次重新检测
  };


  handleChange = (value) => {
    const { setEarphoneVolume, setMicphoneVolume } = this.props.dataSource.instructions;
    const { dataSource: { type } } = this.props;
    this.setState({
      volumeValue: value
    })

    if (type === 'earphone') {
      this.playing = true;
      setEarphoneVolume(value);
    } else if (type === 'micphone') {
      setMicphoneVolume(value);
    }
  }

  /**
   * 播放叮
   */
  playVolume = (val)=>{
    const { dataSource } = this.props;
    const { type, instructions : { setEarphoneVolume } } = dataSource;
    if( type === "earphone" && this.playing ){
      // playType("TYPE_01");
      setEarphoneVolume(val,true)
      this.playing=false;
    }
  }

  /**
   * 接收到有播放或者在录音时修改样式
   */
  //  handleRecieve = () => {

  //   var slider = ReactDOM.findDOMNode(this.refs['volumeModal']);
  //   var sliderRail = slider.getElementsByClassName('ant-slider-rail')[0];
  //   sliderRail.setAttribute('style', `background-image: url(${progress_ing}) !important`);

  //  }
  render() {
    const { dataSource } = this.props;
    const { visible, volumeValue } = this.state;
    const { type } = dataSource;
    return (
      <Modal
        visible={visible}
        centered
        title={type==="earphone"?"耳机音量调节":"麦克风音量调节"}
        closable={false}
        maskClosable={false}
        cancelText=""
        okText="调整好了"
        onCancel={this.onHandleCancel}
        onOk={this.onHandleOK}
        className="earphoneVolumeModal"
        width={622}
      >
        <div className="tip"><i className="iconfont icon-warning" style={{fontSize:'14px',paddingRight:'6px'}} />
          {type === 'earphone'?"系统检测到耳机音量过小，请确认是否已经调整到合适值！":"系统检测到麦克风音量过小，请确认是否已经调整到合适值！"}
        </div>
        <div className="item">
          {
            type === 'earphone' ? <div className="title"><i className="iconfont icon-earphone" style={{fontSize:'13px',paddingRight:'6px'}} />{formatMessage({id:"app.text.earphonevoice",defaultMessage:"耳机音量"})}</div> :
            <div className="title"><i className="iconfont icon-microphone" style={{fontSize:'13px',paddingRight:'6px'}} />{formatMessage({id:"app.text.microphonevoice",defaultMessage:"麦克风音量"})}</div>
          }
          <div className="slider-box">
            <Slider style={{width:'200px'}} value={volumeValue} onChange={this.handleChange} onAfterChange={this.playVolume} />
            <div className="volumeTip small">
              <div className="vline" />
              <span>{formatMessage({id:"app.text.little",defaultMessage:"小"})}</span>
            </div>
            <div className={`volumeTip ${type === 'earphone'?'earphone-normal':'micphone-normal'}`}>
              <div className="vline" />
              <span>{formatMessage({id:"app.text.recommend",defaultMessage:"推荐"})}</span>
            </div>
            <div className="volumeTip big">
              <div className="vline" />
              <span>{formatMessage({id:"app.text.big",defaultMessage:"大"})}</span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default EarphoneVolumeModal;
