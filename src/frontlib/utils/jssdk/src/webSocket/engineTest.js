class EngineTest{

    constructor(){
      this.test_websocket =null;
      this.callback=null;
    }

    testEngine(){
      let access_token=null;
      let x=this;
      let url = "wss://wt.gaocloud.com";
      let hasResult = false;
      if(localStorage.hasOwnProperty("access_token")){
        access_token=localStorage.access_token;
        console.log('access_token:'+access_token);
      }
      this.test_websocket = new WebSocket(url,"browser."+access_token);
      this.test_websocket.onopen = () => {
        if(x.callback && !hasResult ){
            x.callback(true);
            hasResult = true;
        };
      }

      this.test_websocket.onError = () => {
        if(x.callback && !hasResult ){
            x.callback(false);
            hasResult = true;
        }
      }

      // 最近检测时间为10s
      setTimeout(()=>{
        if(x.callback && !hasResult ){
          x.callback(false);
          hasResult = true;
        }
      },3000);


    }

    onTestEngine(callback) {
    if (typeof callback === 'function') {
      this.callback = callback;
    }
  }

    disconnect(params){
            //this._websocket.close();
            this._websocket = null;
            this._buf_cmd_data=[];//清空缓存信息
    }

}

export default EngineTest;
