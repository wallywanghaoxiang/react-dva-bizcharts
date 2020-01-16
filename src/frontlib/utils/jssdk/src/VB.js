import H5Recorder from './recorder/H5Recorder';
import common from './Common';
import FlashRecorder from './recorder/flashRecorder';
import AudioPlayer from './player/audioPlayer';
import EngineTest from './webSocket/engineTest';

export default class VB{
  constructor(){
    const version = "v0.2.1";
    this.recorderAudioList=[]; // 存放临时录音文件
    this.H5params = {
        appKey: "",
        alg: "sha1",
        sigurl: "",
        userId: "",
        duration:100000,
        H5:0,
        encode: "speex", // 编码类型，raw：不压缩， speex：speex压缩
    };
    this.recorderid="recorder_swf",
    this.relPlayer=null;
    this.test = new EngineTest();
    this.flashplayer={

        play: params=>{
          if(params.resourceType){
            this.player.play(params)
          }else{
            this.relPlayer.startReplay(params);
          }
        },

        stop: ()=>{
          this.relPlayer.stopReplay()
        },

        onPlay: (params)=>{
          this.relPlayer.onReplayStart(params);
          this.player.onPlay(params)
        },
        onStop: (params)=>{
          this.relPlayer.onReplayStop(params);
          this.player.onStop(params);
        },
        onError: (params)=>{
          this.relPlayer.onReplayError(params);
          this.player.onError(params)
        }
    }

    /*
    *对象赋值
    */
    // if (typeof options != "undefined") {
    //     for (var i in options) {
    //         if (x.params.hasOwnProperty(i)) {
    //             x.params[i] = options[i];
    //         } else {
    //             console.log("Engine: unknown param: " + i);
    //             continue;
    //         }
    //     }
    // }

    this.H5params.H5 = common.support_h5() ? 1 : 0;
    console.log(`jssdk-${version}`);
    if(this.H5params.H5){
      this.recorder=new H5Recorder(this);
      console.log("created H5 Recorder success!");
    }else{
      this.recorder=new FlashRecorder(this);
      this.relPlayer=this.recorder;
      console.log("created Flash Recorder success!");
    }
    // delete x.options;
    this.player=new AudioPlayer(this);

    this.recorder.onTestEngine=(res)=>{
      this.test.onTestEngine(res);
    }

    this.recorder.testEngine=()=>{
      this.test.testEngine()
    }
  }

  getRecorderManager=()=>{
    return this.recorder;
  }

  getPlayerManager=()=>{
    // if(typeof(Blob)==="function"){
    //     return this.player;
    // }
    if(this.H5params.H5){
      console.log("h5");
      return this.player;
    }else{
      console.log("flash");
      return this.flashplayer; // 在flash模式下回放也是通过flash实现
    }
  }


  /**
   * 获取设备状态
   */
  deviceReadyState = ()=>{
    // 进行设置的条件判断
    return new Promise((resolve)=>{

      const result = {
        recorder : false,  // 是否有录音设备
        player   : false,  // 是否有放音设置
        recorderStatus : "undetectable", // 设备状态： undetectable : 无法检测  hasDevice：设备存在  noDevice: 设备不存在 noPower 没有权限
        recorderMsg : "",  // 录音设备的相关状态
        playerMsg   : "",  // 放音设备的相关状态
      };

      // 1、如果无法检测设备，则默认 设备都是可用的
      if( !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices ){
        result.recorder = true;
        result.recorderStatus = "undetectable";
        result.recorderMsg    = "无法检测录音设备(不支持原生方法)";

        result.player   = true;
        result.playerStatus = "undetectable";
        result.playerMsg    = "无法检测放音设备(不支持原生方法)";
        resolve(result);
      }

      // 获取设备列表
      navigator.mediaDevices.enumerateDevices().then(devices => {
        // 2、 判断是否有放音设备
        // 特殊情况（如果是火狐，一般情况下是检测不到 audiooutput的，故默认为，放音设备是存在的）
        if( navigator.userAgent.includes("Firefox") ){
          result.player = true;
          result.playerStatus = "undetectable";
          result.playerMsg    = "无法检测放音设备(firefox无法获取放音设备)";
        }else if( devices.some(item=>item.kind==="audiooutput") ){
          result.player = true;
          result.playerStatus = "hasDevice";
          result.playerMsg  = "有放音设备";
        }else{
          result.player = false;
          result.playerStatus = "noDevice";
          result.playerMsg  = "没有放音设备";
        }

        // 3、 判断是否有录音设备
        if( devices.some(item=>item.kind==="audioinput") ){
          result.recorder = true;
          result.recorderStatus = "hasDevice";
          result.recorderMsg  = "有录音设备";
        }else{
          result.recorder = false;
          result.recorderStatus = "noDevice";
          result.recorderMsg  = "没有录音设备";
        }

        // 4、如果有录音设备则判断是否有录音权限
        if( result.recorder && !devices.some(item=>item.kind==="audioinput" && !!item.label) ){
          result.recorder = false;
          result.recorderStatus = "noPower";
          result.recorderMsg  = "没有放音权限";
        }

        resolve(result);
      });
    });
  }






}
// window.vb=new VB();
