
import React, { Component } from 'react';
import './index.less';
import IconButton from '../IconButton';
import RateButton from './Components/RateButton';
import WaveSurfer from '@/frontlib/utils/wavesurfer.min';
import RegionsPlugin from "@/frontlib/utils/wavesurfer.regions.min";
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
    this.rate = 1.0; // 音频播放速度，默认原速

    this.state = {
      isPlay: false,
    };
  }




  // 加载音频
  componentDidMount = () => {
    const { audioSrc } = this.props;
    const that = this;
    wavesurfer = WaveSurfer.create({
      container: '.waveform',
      waveColor: '#228EFF',
      progressColor: 'rgba(255,255,255,0.8)',
      height:70,
      hideScrollbar:true,
      maxCanvasWidth:700,
      plugins: [
        RegionsPlugin.create({
         
        })
    ]      
    });
    fetchAudioFileUrl({ // 线上平台，下载音频文件
      tokenId: audioSrc,
    }).then((e) => {
      if (e.data) {
        wavesurfer.load( e.data.path);
      }
    })    
    document.addEventListener("mousedown",function(){
      wavesurfer.clearRegions();
    })
    this.currentRegion = wavesurfer.enableDragSelection({
      loop: true,
      drag: true,
      resize: true
    });
    
    wavesurfer.on('ready',  () =>{
      wavesurfer.play();
      that.setState({
        isPlay: true,
      })
    });
    // wavesurfer.on('seek',  () =>{
    //   wavesurfer.clearRegions();
    // });
    wavesurfer.on('pause',  () =>{
      that.setState({
        isPlay: false,
      })
    });
  };


  componentWillReceiveProps(nextProps){
   
    const{focusId}=this.props
    console.log(focusId,nextProps.focusId)
    if(focusId!==nextProps.focusId){
      fetchAudioFileUrl({ // 线上平台，下载音频文件
        tokenId: nextProps.audioSrc,
      }).then((e) => {
        if (e.data) {
          wavesurfer.load( e.data.path);
          this.play();  
        }
      })
    
    }
  
  }

  componentWillUnmount() {
    this.stop();
  }


  // 播放
  play = () => {  
    wavesurfer.play();
    this.setState({ isPlay: true });
   
  };

  stop = () => {
    wavesurfer.pause();
    this.setState({ isPlay: false });
    clearInterval(this.timer);
    this.onTiming = false;
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
      default:
        break;
    }
    wavesurfer.setPlaybackRate(this.rate)
  };


  // 点击播放按钮
  
  playButtonChange=()=> {
    const { isPlay } = this.state;
    if(isPlay) {
      this.stop()
    } else {
      this.play()
    }

  }

  render() {
  const {isPlay} = this.state;
    return (
      <div>       
        <div className="mediatoolCorrect">        
          <div id="waveform" className="waveform" />
          <IconButton
            iconName={isPlay ? 'icon-v-pause' : 'icon-v-play'}
            className="mediatoolCorrect-playbutton"
            onClick={this.playButtonChange}
          />
          <RateButton onRateChange={(e)=>{this.onRateChange(e)}} />
         

        </div>
      </div>
      
    );
  }
}

export default AudioCorrect;
