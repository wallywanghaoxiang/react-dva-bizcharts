/**
 * 键盘锁（client）, 录音，放音 工具类
 * 根据设备不同（浏览器，还是客户端不同，选择不同 工具）
 */
import { message } from 'antd';
import VB from '@/frontlib/utils/jssdk/src/VB';

export class Tool{

  static fns = {};

  on = (key,fn)=>{
    if( key && fn && typeof(fn) === "function" ){
      if( Tool.fns[key] && Tool.fns[key].length>0 && !Tool.fns[key].find(item=>item===fn) ){
        Tool.fns[key].push(fn);
      }else{
        Tool.fns[key]=[fn];
      }
    }
  }

  remove = (key,fn)=>{
    if( key && fn && typeof(fn) === "function" && Tool.fns[key] &&  Tool.fns[key].length>0 ){
      Tool.fns[key] = Tool.fns[key].filter(item=>item!==fn);
    }
  }



  // 重新绑定 vb 事件
  bind = ()=>{
    // 判断是客户端，还是浏览器端
    if( window.jsBridge ){
      this.model = "client";
      this.vb = window.vb || {};
    }else{
      this.model = "brower";
      this.vb = new VB();
    }

    // 监听耳机或麦克风的变化
    // this.emit("deviceStateChanged","");
    this.getRecorderManager = this.vb.getRecorderManager;
    this.getPlayerManager = this.vb.getPlayerManager;
    if( this.getRecorderManager().onDeviceStateChanged ){
      this.getRecorderManager().onDeviceStateChanged(async (type)=>{
        // 获取当前的设备状态
        const res = await this.checkEarAndMicphoneStatus();
        // 判断是否
        Tool.fns.deviceStateChanged.forEach(item=>{
          item(res,type);
        });
      });
    }

  }

  /**
   * 检测麦克风或耳机的状态
   */
  checkEarAndMicphoneStatus= ()=>this.vb.deviceReadyState();

  /**
   * 检测评分引擎是否可用
   */
  checkComputeAi=()=>{
    return new Promise( (resolve) => {
      this.getRecorderManager().onTestEngine((res)=>{
        resolve(res);
      });
      setTimeout(()=>{
        this.getRecorderManager().testEngine();
      },1000)
    });
  }

  /**
   * 统一的设置静音和放音
   */
  setMute=({player,recorder})=>{
    if( this.getPlayerManager().setMute ){
      this.getPlayerManager().setMute(player);
    }
    if(this.getRecorderManager().setMute){
      this.getRecorderManager().setMute(recorder);
    }
  }


  // =================== 放音操作 ===================


  /**
   * 放音操作
   * resourceType : 系统自带的音频
   * tokenId :      录音返回的id
   */
  play=(params={})=>{
    return new Promise((resolve)=>{

      this.getPlayerManager().onPlay((res)=>{
        console.log("======开始放音=======：",params,res)
      })

      // 放音成功的回调
      this.getPlayerManager().onStop(data=>{
        console.log("======放音成功=======：",params,data)
        resolve(data);
      });

      // 放音失败的回调
      this.getPlayerManager().onError(res=>{
        console.log("======放音失败=======：",params,res)
        throw res;
      });

      // 开始放音
      this.getPlayerManager().play(params);
    });
  }

  // ==================== 录音操作 =======================

  /**
   * 停止录音
   */
  stopRecord=()=>{
    // 判断当期是否有录音，如果有则停止
    const recordManager = this.getRecorderManager();
    if( recordManager.recording ){
      recordManager.stop();
    }
  }

  /**
   * 开始路录音
   */
  recordSound=(params={})=>{

    // 先停止录音
    this.stopRecord();

    const recordManager = this.getRecorderManager();
    const {
      type="normal",       // "normal" : 普通模式(默认)   "test": 测试录音
      duration=5,         // 录音时长
      request={}
    } = params;

    // 默认的配置项
    const recordFns = {
      onEval        : "",   // 评测结果回调
      onVolumeMeter : "",   // 音量大小的回调
      onCountDown   : "",   // 倒计时的回调，每秒放回，用于一些功能上显示录音时长
      ...params
    };

    // 开始倒计时
    let clearTime;
    const onCountDown = ()=>{
      let time = duration;
      // 倒计时状态
      clearTime = setInterval(()=>{
        time -= 1;
        if( time >=0 ){
          // 回调信息
          if( typeof(recordFns.onCountDown) === "function" ){
            recordFns.onCountDown(time);
          }
        }else{
          clearInterval(clearTime);
        }
      },1000);
    }

    const clearBind = ()=>{
      // 清除 绑定事件
      recordManager.onStart(()=>{});
      recordManager.onError(()=>{});
      recordManager.onVolumeMeter(()=>{});
      recordManager.onStop(()=>{});
    }

    return new Promise((resolve)=>{

      // 倒计时的回调
      if( typeof(recordFns.onCountDown) === "function" ){
        // 开始倒计时
        onCountDown();
      }

      // 开始录音
      recordManager.onStart(()=>{
        console.log("===============开始录音==============");
      });

      // 录音异常
      recordManager.onError((err)=>{
        console.log("===============录音错误==============",err);
        if( clearTime ){
          clearInterval(clearTime);
        }
        clearBind();
        throw err;
      });

      // 录音的实时音量
      recordManager.onVolumeMeter((data)=>{
        // console.log("===============录音音量==============",data);
        if( typeof(recordFns.onVolumeMeter) === "function" ){
          recordFns.onVolumeMeter(data);
        }
      });


      if( type === "test" ){
        recordManager.onTest((data)=>{
          console.log("===============录音成功==============",data);
          if( clearTime ){
            clearInterval(clearTime);
          }
          clearBind();
          resolve(data);
        });
        recordManager.test({
          duration,
          nsx: false,
          resourceType:"",
          request
        });
      }else{
        recordManager.onStop((data)=>{
          console.log("===============录音成功==============",data);
          if( clearTime ){
            clearInterval(clearTime);
          }
          clearBind();
          resolve(data);
        });
        recordManager.start({
          duration,
          nsx: false,
          resourceType:"off",
          request
        });
      }
    });
  }

  // 监听方式
  onReceive = ()=>{}

  sendMS=()=>{}

  sendM=()=>{}

  storeData=()=>{}

}

export default new Tool();

/**
 * 判断是否是 Edga 浏览器
 */
export const isVb = typeof vb === 'object';

/**
 * 提示vb，是否存在
 */
export const getVb = () => {
  try {
    if (isVb) {
      return vb;
    }
    throw new Error('当前设备，不支持该功能！');
  } catch (e) {
    message.warning(e.message);
    return null;
  }
};

/**
 * 关闭当前窗体
 */
export function close() {
  const vb = getVb();
  return vb && vb.close();
}
