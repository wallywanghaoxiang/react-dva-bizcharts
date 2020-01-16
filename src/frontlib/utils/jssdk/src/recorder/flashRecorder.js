import socket_VB from '../webSocket/socket_VB';
import Common from '../Common';
import { swfobject } from './swfobject';

const FLASH_RECORDER_URL = `https://sdk.gaocloud.com/jssdk/assets/swf/AudioRecorder4JS.swf`;
const EXPRESS_INSTALL_SWF_URL = `https://sdk.gaocloud.com/jssdk/assets/swf/expressInstall.swf`;

window._cfr_callbacks = {
    maxValue:0,
    minValue:0,
    count:0,
    recBuffers:[],
    audioBuffers:[],
    audioLength:0,
    on_flash_load: (code, msg) => {
        console.log('on_flash_load:', code, msg);
        window.g_flashrecorder_is_load = true;
    },

    decode_flash_msg: (msg) => {
        return (typeof msg == "string") ? msg.replace(/%22/g, "\"").replace(/%5c/g, "\\").replace(/%26/g, "&").replace(/%25/g, "%") : msg;
    },

    on_mic_event: (code, message) => {
        let recorder = window.recorder;
        message = window._cfr_callbacks.decode_flash_msg(message);
        console.log('on_mic_event:', code, message);
        switch (String(code)) {
            case '50001':
                recorder.mic_allow = true;
                window.g_flashrecorder_is_load = true;
                console.log("麦克风正常")
                break;
            case '50002':
                console.log("麦克风静音")
                break;
            case '50003':
                console.log("麦克风有问题")
                break;
            default:
                recorder.mic_allow = false;
                break;
        }
        recorder.refresh_status();
    },
    on_record_event: (code, message) => {
        let r=window.recorder;
        message = window._cfr_callbacks.decode_flash_msg(message);
        message = JSON.parse(message);
        if(code=="50302"){
            r.Callback_replay_onStop()
        }
        console.log('on_record_event:', code, message);
    },

    on_feed_event:(code,message)=>{
        let recorder = window.recorder;
        let tempArray = [];
        let recBuffers=[];
        if ("50602"==code){
            // console.log("50602");
            // console.log(message);
            window._cfr_callbacks.doWithSamples(message);
        }
        if ("50777"==code){
            // console.log("50777");
            // console.log(message);
            window._cfr_callbacks.doWithSamples(message);
            recorder.socket.send_audio(1,null);
        }
    },
    doWithSamples:(message)=>{
        let r=window.recorder;
        let outputBuffer =[];
        for(var i=0;i<message.length;i++){
            outputBuffer.push(parseFloat(message[i]));
            //window._cfr_callbacks.audioBuffers.push(parseFloat(message[i]));
            window._cfr_callbacks.maxValue = Math.max(window._cfr_callbacks.maxValue, parseFloat(message[i]));
            window._cfr_callbacks.minValue = Math.min(window._cfr_callbacks.minValue, parseFloat(message[i]));
            window._cfr_callbacks.count++;

        if(window._cfr_callbacks.count>1600){
            let v=Math.max(Math.abs(window._cfr_callbacks.maxValue),Math.abs(window._cfr_callbacks.minValue))
            r.Callback_onVolumeMeter({
                'volume' :v,
                'max': window._cfr_callbacks.maxValue,
                'min': window._cfr_callbacks.minValue
            })
            window._cfr_callbacks.maxValue=0;
            window._cfr_callbacks.minValue=0;
            window._cfr_callbacks.count=0
        }
    }
    let data = Common.floatTo16BitPCM(outputBuffer);
    window._cfr_callbacks.audioBuffers.push(data);
    window._cfr_callbacks.audioLength+=outputBuffer.length;
    for (let i = 0 ; i < data.length ; i++) {
        window._cfr_callbacks.recBuffers.push(data[i]);
    }

    while(window._cfr_callbacks.recBuffers.length > 320)//每0.02秒计算一次音量
    {
        let items = window._cfr_callbacks.recBuffers.splice(0, 320);
        let result = new Int16Array(320);
        let senddata;
        for(let i = 0; i < 320; i++)
        {
            result[i] = items[i];
        }
        //senddata=r.spxCodec.encode(result,false);
       // console.log("result",result);
        r.socket.send_audio(0,result);
    }
    }
};


class flashRecorder{
    constructor(options) {
        let x=this;

        window.recorder = this;
        this.options = options;
        this.list = options.recorderAudioList;
        this.userAgent=window.navigator.userAgent;//获取用户当前浏览器信息
        this.recording = false;
        this.canRecord = false;
        this.loaded = false;
        this.mic_allow = false;

        this.duration=5000;//初始录音时长5秒
        this.hint=true;//是否播放录音提示音的标志
        this.nsx=null;//降噪开关

        this.socket=new socket_VB(x);
        // this.spxCodec = new Speex({
        //     quality: 8,
        //     mode: 1,
        //     bits_size: 70
        // })

        //一些回调函数
        this.Callback_onStart=null;
        this.Callback_onStop=null;
        this.Callback_onVolumeMeter=null;
        this.Callback_onEval=null;
        this.Callback_onError=null;

        this.Callback_replay_onStart=null;
        this.Callback_replay_onStop=null;
        this.Callback_replay_onError=null;

        this.tokenId=null;

        this.recorderDom=null;


        this.__embedswf();
    }

    canIRecord() {
      if (!this.recording) {
        return true;
      }
      return false;
    }

    //录音开始和停止函数
    /*params参数：
     *duration: Int, //录音时长（秒）
     *hint: Bool, //是否播放提示音
     *nsx: Bool, //是否降噪处理（暂不实现）
     *request: Object //语音评测相关传入json
     */
    start(params){
        window._cfr_callbacks.recBuffers=[];
        if (this.recording && this.Callback_onError) {
            this.Callback_onError({ errId: 10012, error: 'please wait the last record end!' });
            return;
          }
        if(!this.recorderDom){
            this.recorderDom = document.getElementById(this.options.recorderid);
        }
        if (params.data) {
            params = params.data;
          }
        console.log("flash start:",params);
		let temp={
			protocol: 16777216,
			client: {
				version: 16777216,
				sourceType: "browser",
				userAgent: this.userAgent
			},
			audio: {
				audioType: "wav",//支持wav和spx
				sampleRate: 16000,
				channel: 1,
				sampleBytes: 2
			},
        }
        this.tokenId=Common.getGuid();
        this.socket.tokenId=this.tokenId;
        params.request.tokenId=this.tokenId;
        temp.request=params.request;
        var p = {
            recordLength: params.duration*1000,
            playDing: params.hint,
            tokenId:this.tokenId
        };
        if(this.Callback_onStart){
            this.Callback_onStart();
        }
        try {
            this.recorderDom.startRecord(p);
        } catch (e) {
            this.Callback_onError(e);
        }
        this.recording = true;
        this.socket.disconnect();
        this.socket.start_cmd(temp);
    }

    stop(){
        console.log("stop");
        if (!this.recording) return;
        var x=this;
        this.recording = false;
        this.recorderDom.stopRecord({});
        if(this.Callback_onStop){
            this.Callback_onStop({"tokenId":this.tokenId});
        }
        this.socket.send_audio(1,null);
        //this.exportAudio() //由于IE的audio标签不支持wav格式播放，因此flash下就直接用flash回放

    }
     exportAudio()
        {
            var dataview = null;
            var pa = new Float32Array(window._cfr_callbacks.audioLength);
            var offset = 0;
            let x=this;
            for(var i = 0; i < window._cfr_callbacks.audioBuffers.length; ++i) {
                pa.set(window._cfr_callbacks.audioBuffers[i], offset);
                offset += window._cfr_callbacks.audioBuffers[i].length;
            }
             dataview = this.encodeWAV(pa);

            var audioBlob = new Blob([dataview.buffer], {type: "audio/wav"});
            window._cfr_callbacks.audioBuffers=[];
            window._cfr_callbacks.audioLength=0;
            x.list[x.tokenId.toString()]=audioBlob;

        }

     //回调函数设置
    onStart(callback){
        if(typeof(callback)=="function"){
           this.Callback_onStart=callback;
        }
    }
    onStop(callback){
        if(typeof(callback)=="function"){
            this.Callback_onStop=callback;
         }
    }
    onVolumeMeter(callback){
        if(typeof(callback)=="function"){
            this.Callback_onVolumeMeter=callback;
         }
    }
    onEval(callback){
        if(typeof(callback)=="function"){
            this.socket.Callback_onEval=callback;
         }
    }
    onError(callback){
        if(typeof(callback)=="function"){
            this.Callback_onError=function(a){
                 callback(a);
            };
            this.socket.Callback_onError=function(a){
                callback({ errId: 10030, error: a });
            };
         }
    }

    onReplayStart(callback){
        if(typeof(callback)=="function"){
           this.Callback_replay_onStart=callback;
        }
    }
    onReplayStop(callback){
        if(typeof(callback)=="function"){
            this.Callback_replay_onStop=callback;
         }
    }
    onReplayError(callback){
        if(typeof(callback)=="function"){
            this.Callback_replay_onError=function(a){
                callback({"errId":10010,"error":a})
            };
         }
    }
    canRecord(){
        if(this.canRecord && this.socket.canRecord){
            return true;
        }else{
            return false;
        }
    }

    __on_flash_loaded() {
        console.log("onflash");
        this.canRecord = true;
        this.loaded = true;
        this.recorderDom = document.getElementById(this.options.recorderid); //refresh
    }
    __embedswf() {
        let params = {
            allowScriptAccess: 'always',
            wmode: "transparent"
        };
        let attribs = {
            id: this.recorderid,
            name: this.recorderid,
            wmode: "transparent"
        };
        let vars = {
            jssdkVersion: "0.0.2",
            flashLoadEventHandler: "window._cfr_callbacks.on_flash_load",
            micEventHandler: "window._cfr_callbacks.on_mic_event",
            recorderEventHandler: "window._cfr_callbacks.on_record_event",
            feedEventHandler:"window._cfr_callbacks.on_feed_event"
        };


        let _secs_passed = 0;
        let _interval = 500;
        let _check_loading_status = () => {
            _secs_passed += _interval;

            if (window.g_flashrecorder_is_load) {
                this.__on_flash_loaded();
                window.g_flashrecorder_is_load = null;
            } else if (_secs_passed > 10000) {//flash超时时间为10秒
                if(this.Callback_onError){
                    this.Callback_onError(`timeout(${_secs_passed / 1000} secs) when loading swf: ${FLASH_RECORDER_URL}`);
                }else{
                    console.log(`timeout(${_secs_passed / 1000} secs) when loading swf: ${FLASH_RECORDER_URL}`);
                }

                window.g_flashrecorder_is_load = null;
            } else {
                setTimeout(_check_loading_status, _interval);
            }
        };

        window.g_flashrecorder_is_load = null; //什么情况下变成true?
        console.log(FLASH_RECORDER_URL);
        console.log(this.options.recorderid);
        swfobject.embedSWF(FLASH_RECORDER_URL, this.options.recorderid, 220, 140, '10.0.0',EXPRESS_INSTALL_SWF_URL,
            vars, params, attribs);
        setTimeout(_check_loading_status, _interval);
    }

    refresh_status() {
        this.canRecord = (this.loaded && this.mic_allow);
    }
    startReplay(params) {
        if (params.hasOwnProperty("tokenId")) {
            var p = {
                tokenId: params.tokenId
            };
            if(typeof(this.Callback_replay_onStart)=="function"){
                this.Callback_replay_onStart();
             }

            try {
                this.recorderDom.startReplay(p);
            } catch (e) {}
        } else {
            this.Callback_replay_onError('no tokenId.');
        }
    }
    /** 停止回放。*/
    stopReplay(){
        try {
            this.recorderDom.stopReplay();
        } catch (e) {}
        if(typeof(this.Callback_replay_onStop)=="function"){
            this.Callback_replay_onStop();
         }

    }


    writeString(view, offset, string){
        for (var i = 0; i < string.length; i++){
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    floatTo16BitPCM2(output, offset, input){
    for (var i = 0; i < input.length; i++, offset+=2){
        var s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }

    encodeWAV(samples){
        var buffer = new ArrayBuffer(44 + samples.length*2);
        var view = new DataView(buffer);

        /* RIFF identifier */
        this.writeString(view, 0, 'RIFF');
        /* RIFF chunk length */
        view.setUint32(4, 36 + samples.length*2, true);
        /* RIFF type */
        this.writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        this.writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, 1, true);
        /* sample rate */
        view.setUint32(24, 16000, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, 16000 * 4, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        this.writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, samples.length*2, true);

        //view.setInt16(44, samples, true);
        this.floatTo16BitPCM2(view, 44, samples);

        return view;
      }
};

export default flashRecorder;
