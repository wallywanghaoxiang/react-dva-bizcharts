import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import delay  from "@/frontlib/utils/delay";
import upload from '@/frontlib/assets/upload.gif';
import tastDoneIcon from '@/frontlib/assets/tast_done_icon.png';
import IconButton from '../../IconButton';
import styles from './index.less';


/**
 * 下载试卷loading组件
 */
@connect(({examBlock})=>{
  const { snapshotId } = examBlock;
  return {snapshotId};
})
class Upload extends PureComponent {

  state={
    status : "loading"  // "loading" :  "上传中", "success" : "上传成功", "上传失败"
  }

  componentDidMount(){
    this.uploadPaper();
  }


  // 状态改变的时候的回调
  onChange = ( state )=>{
    const { dispatch, onChange, snapshotId } = this.props;
    if( typeof(onChange) === "function" ){
      onChange( state );
    }
    dispatch({
      type : "updatePaperState",
      payload : {
        snapshotId,
        uploadState : state
      }
    });
  }


  // 上传时间
  uploadPaper = async ()=>{
    const { dispatch, uploadEffect } = this.props;
    this.setState({ status : "loading" });
    this.onChange( "loading" );
    // 为了效果 延迟一会儿
    await delay(1000);
    // 上传试卷
    const result = await dispatch({
      type    : "examBlock/uploadPaper",
      payload : uploadEffect
    });

    // 是否下载成功失败
    const status = result ? "success" : "fail";
    this.setState({
      status
    });
    this.onChange( status );
  }


  render() {
    const { status } = this.state;
    // 答卷正在上传中
    if (status === 'loading') {
      return (
        <div className={styles.loading}>
          <div style={{ textAlign: 'center' }}>
            <img src={upload} alt="logo" />
            <div className={styles.loadingText}>{formatMessage({id:"app.text.exporting",defaultMessage:"正在上传答案包...请耐心等待"})}</div>
          </div>
        </div>
      );
    }

    // 上传失败
    if (status === 'fail') {
      return (
        <div className={styles.loading}>
          <div style={{ textAlign: 'center' }} className="PaperLoadingFailed">
            <IconButton iconName="icon-warning warning" />
            <div className={styles.loadingbtn}>
              {formatMessage({id:"app.message.upload.answer.failed.again",defaultMessage:"答案包上传失败...请重试"})}
            </div>
            <div className={styles.loadingbtn}>
              <IconButton
                text={formatMessage({id:"app.button.upload.again",defaultMessage:"重新上传"})}
                iconName=""
                type="button"
                className={styles.redcordBtn}
                onClick={this.uploadPaper}
              />
            </div>
          </div>
        </div>
      );
    }

    // 上传成功
    if( status === "success" ){
      return (
        <div className={styles.loading}>
          <div style={{ textAlign: 'center' }}>
            <img src={tastDoneIcon} alt="logo" />
            <div className={styles.tipsText}>
              {formatMessage({id:"app.message.upload.answer.success",defaultMessage:"答案包上传成功"})}
            </div>
          </div>
        </div>
      );
    }

    return null;


  }
}


export default Upload;
