import React, { Component } from 'react';
import { Modal, message } from 'antd';
import cs from "classnames";
import { formatMessage} from 'umi/locale';
import styles from './index.less';

/**
 * 输入鉴权密钥弹窗
 */
class SecretKeyModal extends Component {

  state = {
    visible   : true,    // 弹框
    inputCode : ""       // 输入的密钥
  }

  /**
   * 导出试卷包
   * @Author   tina.zhang
   * @DateTime 2018-12-20T15:21:10+0800
   * @param    {[type]}                 teacherCode [description]
   * @return   {[type]}                             [description]
   */
  exportPaper =(teacherCode)=>{
    const { callback,dataSource:{exportLM},item,respondentsObject } = this.props;
    let md5 = localStorage.getItem('md5'); // 答卷MD5
    let fileName = localStorage.getItem('fileName'); // 答卷名称

    if(item && item.paperMd5){// 练习中导出处理
      md5 = item.packageResult && item.packageResult.respondentsObject && item.packageResult.respondentsObject.respondentsObject.respondentsMd5; // 答卷MD5
      fileName = item.packageResult && item.packageResult.respondentsObject && item.packageResult.respondentsObject.respondentsObject.paperName; // 答卷名称
    }

    exportLM({
      code: teacherCode,
      md5,
      fileName,
      userData : item ? JSON.stringify(item.packageResult.respondentsObject.respondentsObject||{}) : respondentsObject,
      success: ()=> {
        callback(true)
      },
      fail: (e) => {
        console.log(e);
        message.warning(formatMessage({id:"app.text.exportfail",defaultMessage:"导出失败！"}));
      },
    });
  }

  // 关闭弹框
  onHandleCancel = () => {
    const { onClose=()=>{} } = this.props;
    this.setState({
      visible: false,
    });
    onClose();
  };



  // 选择数字
  clickNumber = ( val )=>{

    const { dataSource : { getcode } } = this.props;
    const { inputCode } = this.state;

    if( inputCode.length === 4 ) return;
    // 如果有提示code不正确的提示框，则关闭
    if( this.errorCodeMsg && typeof(this.errorCodeMsg) === "function" ){
      this.errorCodeMsg();
    }
    this.setState({
      inputCode : `${inputCode}${val}`
    },()=>{
      const { inputCode : newCode } = this.state;

      if( newCode.length === 4 ){
        // 如果当前已经输入了4位，则进行确认
        const { code } = getcode();
        if( newCode ===code.toString() ){
          console.log("鉴权密钥正确")
          // 开始导出
          this.exportPaper( code );
          // 关闭弹框
          this.onHandleCancel();
        }else{
          this.errorCodeMsg = message.error(formatMessage({id:"task.message.input.control.code.is.error",defaultMessage:"鉴权码错误"}));
        }
      }
    });
  }

  // 回退按钮
  backCodeVal = ()=>{
    const { inputCode } = this.state;
    if( inputCode.length === 0 ) return;
    this.setState({
      inputCode : inputCode.substring(0, inputCode.length - 1)
    });
  }

  render() {
    const { visible, inputCode } = this.state;
    const len = inputCode.length;

    return (
      <Modal
        visible={visible}
        width={380}
        className={cs(styles.confirm,styles.close)}
        centered
        title={formatMessage({id:"app.text.enterkey",defaultMessage:"鉴权密钥"})}
        closable
        maskClosable={false}
        onCancel={this.onHandleCancel}
        footer={null}
        destroyOnClose
      >
        <div className={styles.SecretKeyModal}>
          {
            Array.from({length:4}, (_,key) =>(
              <div className={styles.item} key={key}>
                { len>key && <div className={styles.around} /> }
              </div>
            ))
          }
        </div>
        <div className={styles.keyword}>
          <div className={styles['keyword-num']}>
            {
              Array.from({length:10},(_,key)=>(
                <div
                  className={styles['num-button']}
                  key={key}
                  onClick={()=>this.clickNumber((key+1)%10)}
                >
                  {(key+1)%10}
                </div>
              ))
            }
          </div>
          <div className={styles['keyword-del']} onClick={this.backCodeVal}>
            回退
          </div>
        </div>
      </Modal>
    );
  }
}

export default SecretKeyModal;
