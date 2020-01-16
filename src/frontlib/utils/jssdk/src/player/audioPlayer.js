import common from "../Common";

class audioPlayer{
    constructor(options){
        this.audio=document.createElement('audio');
        this.list=options.recorderAudioList; // 存放临时录音文件
        this.Callback_onPlay=null;
        this.Callback_onStop=null;
        this.Callback_onError=null;

    }

    /**
     * 设置取消静音（同vbclient）
     */
    setMute=()=>{}

    // 回调函数设置
    onPlay=(callback)=>{
        if(typeof(callback)==="function"){
            this.Callback_onPlay=callback;
        }
    }

    onStop=(callback)=>{
      if(typeof(callback)==="function"){
          this.Callback_onStop=callback;
      }
    }

    onError=(callback)=>{
      if(typeof(callback)==="function"){
        this.Callback_onError=(a)=>{
           // callback(a);
        };
      }
    }

    // 判断tokenId是否存在
    exist=(params)=>{
      if(this.list[params.tokenId]){
        return true
      }
      return false
    }

    play(params){
        if (!this.audio){
            this.audio = document.createElement('audio');
        }
        if(params.tokenId){
            try {
                const fileReader = new FileReader();
                fileReader.onload = (event) => {
                  console.log(event.currentTarget.result)
                    if (!this.audio){
                        this.audio = document.createElement('audio');
                    }
                    this.audio.type = "audio/wav";
                    this.audio.loop = false;
                    this.audio.src=event.currentTarget.result;
                    this.audio.play();
                };
                console.log(this.list[params.tokenId]);
                fileReader.readAsDataURL(this.list[params.tokenId]);
            } catch (err) {
                console.warn(err);
            }
        }else if(params.resourceType){
          const src = common.getAudioSrc(params.resourceType) || "";
          this.audio.src = src;
          this.audio.type = "audio/mp3";
          this.audio.play();
        }else if(params.audioUrl){ // 线上服务中获取的转码mp3
          this.audio.src =params.audioUrl;
          this.audio.type = "audio/mp3";
          this.audio.play();
        }else if(params.audioStreaming){ //考中播放音频流
          this.audio.src =params.audioStreaming;
          this.audio.type = 'audio/mpeg';
          this.audio.play();
        }else if(this.Callback_onError){
          this.Callback_onError({"errId":10020,"error":"no resourceType or no tokenId!"});
          return;
        }
        if(this.Callback_onPlay){
            this.Callback_onPlay();
        }

        this.audio.addEventListener('ended',()=>{
            this.stop();
        });

    }

    stop(){
      if(this.audio){
          this.audio.pause();
      }
      if(this.Callback_onStop){
          this.Callback_onStop();
          this.audio=null;
      }
    }

    setVolume(value){
      this.setVolume=value;
    }

}
export default audioPlayer;
