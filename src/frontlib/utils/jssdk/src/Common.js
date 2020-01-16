
import TYPE_D1 from "../assets/audio/DeviceTestGuide.mp3";
import TYPE_D2 from "../assets/audio/StartRecord.mp3";
import TYPE_D3 from "../assets/audio/StopRecord.mp3";
import TYPE_D4 from "../assets/audio/ExamCompleted.mp3";
import TYPE_D5 from "../assets/audio/Sample.mp3";
import TYPE_01 from "../assets/audio/TYPE_01.mp3";
import TYPE_02 from "../assets/audio/TYPE_02.mp3";
import TYPE_03 from "../assets/audio/TYPE_03.mp3";
import TYPE_04 from "../assets/audio/TYPE_04.mp3";
import TYPE_05 from "../assets/audio/TYPE_05.mp3";
import TYPE_06 from "../assets/audio/TYPE_06.mp3";


const audioTarget = {
  TYPE_D1,
  TYPE_D2,
  TYPE_D3,
  TYPE_D4,
  TYPE_D5,
  TYPE_01,
  TYPE_02,
  TYPE_03,
  TYPE_04,
  TYPE_05,
  TYPE_06
};


class Common {

	static floatTo16BitPCM(input)
	{
		var output = new Int16Array(input.length);
		for (let i = 0; i < input.length; i++){
			var s = Math.max(-1, Math.min(1, input[i]));
			if(s < 0)
				output[i] = s * 0x8000;
			else
				output[i] = s * 0x7FFF; // 二进制小数向右移动15位，相当于扩大2^15倍
		}
		return output;
  }

	static getBufferSize() {
    if (/(Win(dows )?NT 6\.2)/.test(navigator.userAgent)) {
      return 1024;  // W indows 8
    }
    if (/(Win(dows )?NT 6\.1)/.test(navigator.userAgent)) {
      return 1024;  // Windows 7
    }
    if (/(Win(dows )?NT 6\.0)/.test(navigator.userAgent)) {
      return 2048;  // Windows Vista
    }
    if (/Win(dows )?(NT 5\.1|XP)/.test(navigator.userAgent)) {
      return 4096;  // Windows XP
    }
    if (/Mac|PPC/.test(navigator.userAgent)) {
      return 1024;  // Mac OS X
    }
    if (/Linux/.test(navigator.userAgent)) {
      return 8192;  // Linux
    }
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        return 2048;  // iOS
    }
    return 16384; // Otherwise
  };

	/**
     * 判断当前浏览器是否支持HTML5模式。<br/>
     * 如果在初始化ChiVoxSDK的时候没有指定mode参数，会自动根据这个函数返回值来决定是否自动使用HTML5模式。
     *
     * @function Utils.support_h5
     * @return  {boolean} - 当前浏览器是否支持HTML5模式。
     */
	static support_h5() {
    let supported = false;
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    const agent = navigator.userAgent.toLowerCase();

    if (agent.indexOf("msie") > 0 || agent.indexOf("edge") > 0) {
        console.warn(`[ Utils.support_h5 ] Can not running HTML5 mode on Internet Explorer. userAgent: ${agent}`);
    } else if (!navigator.getUserMedia) {
        console.warn(`[ Utils.support_h5 ] Your Browser does not support getUserMedia. current: ${navigator.getUserMedia}`);
    } else if (!window.WebSocket) {
        console.warn('[ Utils.support_h5 ] Your Browser does not support window.WebSocket.');
    } else if (document.location.protocol !== 'https:') {
        console.warn(`[ Utils.support_h5 ] The current address: ${document.location.href}, it not based on HTTPS.`);
    } else if (!window.Worker) {
        console.warn('[ Utils.support_h5 ] Your Browser does not support window.Worker.');
    } else {
        supported = true;
    }
    return supported;
	}


	static getGuid() {
        let token=""
		token= "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16)
        });
        return token.replace(/\-/g,"");// tokenId去掉-
    };

  /**
   * 设置默认的音频
   * @param {*} type
   */
  static getAudioSrc(type){
    if( type in audioTarget ){
      return audioTarget[type];
    }
    return null;
  }

}
export default Common
