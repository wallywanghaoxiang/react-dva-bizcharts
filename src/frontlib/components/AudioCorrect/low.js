import { Slider, Icon } from 'antd';
import React, { Component } from 'react';
import './index.less';
import OwnSlider from './Components/OwnSlider';
import AudioTimer from './Components/AudioTimer';
import IconButton from '../IconButton';
import RateButton from './Components/RateButton';
import ChangeTypeButton from './Components/ChangeTypeButton';
import { fetchAudioFileUrl } from '@/services/api';

let wavesurfer ;

/**
 * 支持区间播放的音频播放器
 *
 * @author tina.zhang.xu
 */

class AudioCorrect extends Component {
  constructor(props) {
    super(props);
    this.audio = document.createElement('audio');
    this.timer; //定时器
    this.onTiming = false; //定是中
    this.startTime = 0; //区间开始时间
    this.endTime = 0; //区间结束时间
    this.hasCuted = false; //裁剪过判断
    this.rate = 1.0; //音频播放速度，默认原速

    this.state = {
      timeNow: 0, //播放器当前时间
      max: 95,
      value: 0,
      isCuting: false,
      sep: [0,95],
      isPlay: false,
    };
  }
  componentWillUnmount() {
    this.stop();
  }

  //加载音频
  componentDidMount = () => {
    const { audioSrc,id } = this.props;
    fetchAudioFileUrl({ // 线上平台，下载音频文件
      tokenId: audioSrc,
    }).then((e) => {
      if (e.data) {
        this.audio.src =e.data.path;
        this.audio.onloadeddata = () => {
          this.setState({
            max: this.audio.duration*10,//增加10倍，让几秒的音频，在进度条上更顺滑
          });
          
          if(window.vb&&window.vb.role!=86) {//把录音回放关闭,如果是考中的教师端，则跳过判断
            var vb = window.vb;
            vb.getPlayerManager().stop();
          }
      
          this.play();     
        };
      }
    }) 

  };

  componentWillReceiveProps(nextProps){
   
    const{focusId}=this.props
    console.log(focusId,nextProps.focusId)
    if(focusId!==nextProps.focusId){
      fetchAudioFileUrl({ // 线上平台，下载音频文件
        tokenId: nextProps.audioSrc,
      }).then((e) => {
        if (e.data) {
          this.audio.src =e.data.path;
          this.play();  
        }
      })
    
    }
  
  }

  // 点击播放按钮
  playButtonChange() {
    const { isPlay } = this.state;
    isPlay ? this.stop() : this.play();

  }
  //点击裁剪按钮
  cutButtonChange() {
    //const { isCuting } = this.state;
    // let s = 0,
    //   e;
    this.setState({
      isCuting: !this.state.isCuting,
      sep: [0, this.state.max],
    });
    //提供区间初始值
    // if (this.endTime == 0) {
    //   if (this.audio.currentTime - 2 > 0) {
    //     s = this.audio.currentTime - 2;
    //   }
    //   if (this.audio.currentTime + 10 < this.state.max) {
    //     e = this.audio.currentTime + 10;
    //   } else {
    //     e = this.state.max;
    //   }
      // this.setState({
      // });
    //}
  }

  //裁剪区间变化
  onCutTimeChange = e => {
    this.hasCuted = true;
    this.startTime = e[0]/10;
    this.endTime = e[1]/10;
  };
  //播放
  play = () => {
    console.log('play');
    console.log(this.audio.src);
    if (this.state.isCuting) {
      this.audio.currentTime = this.startTime;
    }
    this.audio.play();
    this.setState({ isPlay: true });
    this.timer = setInterval(this.getCurrentTime, 200);
    this.onTiming = true;
  };

  stop = () => {
    this.audio.pause();
    this.setState({ isPlay: false });
    clearInterval(this.timer);
    this.onTiming = false;
  };
  getCurrentTime = () => {
    if (this.state.isPlay) {
      if (this.state.isCuting) {
        if (
          this.hasCuted &&
          (this.audio.currentTime > this.endTime || this.audio.currentTime < this.startTime)
        ) {
          this.audio.currentTime = this.startTime;
        }
      }
      this.setState({
        timeNow: this.audio.currentTime,
        value: this.audio.currentTime*10,
      });
      if (this.audio.ended) {
        this.stop();
      }
    }
  };
  ontouchChange = (a, v) => {
    if (a) {
      if (this.onTiming) {
        clearInterval(this.timer);
        this.onTiming = false;
      }
    } else {
      this.audio.currentTime = v/10;
      if (!this.onTiming) {
        this.setState({
          value: v,
        });
        this.timer = setInterval(this.getCurrentTime, 200);
        this.onTiming = true;
      }
    }
  };

  onRateChange = a => {
    switch (a) {
      case 'normal':
        this.rate = 1.0;
        break;
      case 'slow':
        this.rate = 0.8;
        break;
      case 'slower':
        this.rate = 0.6;
        break;
    }
    this.audio.playbackRate = this.rate;
  };

  onTypeChange = (e) => {
    const { audioSrc, audioSrc2 } = this.props;

    if (e == '1') {
      this.audio.src = audioSrc;
    } else {
      this.audio.src = audioSrc2;
    }

    this.audio.onloadeddata = () => {
      this.setState({
        max: this.audio.duration*10,
        timeNow: 0, //播放器当前时间
        isCuting: false
      });
      this.play();
    };
  }

  render() {
    const { audioSrc2 } = this.props;
 
  
    return (
      <div>
        <div className="mediatoolCorrect">        
          <OwnSlider
            value={this.state.value}
            rangevalue={this.state.sep}
            max={this.state.max}
            ontouch={(a, v)=>{this.ontouchChange(a, v)}}
            oncut={(e)=>{this.onCutTimeChange(e)}}
            isCuting={this.state.isCuting}
          />
          <AudioTimer timeNow={this.state.timeNow} />
          <IconButton
            iconName={this.state.isPlay ? 'icon-v-pause' : 'icon-v-play'}
            className="mediatoolCorrect-playbutton"
            onClick={this.playButtonChange.bind(this)}
          />
          <IconButton
            iconName={this.state.isCuting ? 'icon-play-between-close' : 'icon-play-between'}
            className="mediatoolCorrect-cutbutton"
            onClick={this.cutButtonChange.bind(this)}
          />
          <RateButton onRateChange={(e)=>{this.onRateChange(e)}} />
          { audioSrc2 && audioSrc2 != "" && <ChangeTypeButton onTypeChange={(e)=>{this.onTypeChange(e)}} /> }

        </div>
      </div>
      
    );
  }
}

export default AudioCorrect;
