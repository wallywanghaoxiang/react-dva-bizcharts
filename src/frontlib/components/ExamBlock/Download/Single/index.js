import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import styles from './index.less';
import loading from '@/frontlib/assets/download.gif';
import readyOk from '@/frontlib/assets/ready_ok.png';
import IconButton from '../../../IconButton';

const delay = (time)=>{
  return new Promise(resolve=>{
    setTimeout(()=>{
      resolve()
    },time);
  })
}

/**
 * 下载试卷loading组件
 */
@connect()
class Single extends PureComponent {

  state={
    status : "loading"  // "loading" :  "下载中", "success" : "下载成功", "下载失败"
  }

  componentDidMount(){
    // 下载试卷
    this.downloadPaper();
  }


  // 下载试卷
  downloadPaper = async ()=>{
    const { dispatch, onChange, downloadEffect } = this.props;

    this.setState({ status : "loading" });
    onChange( "loading" );
    // 为了效果 延迟一会儿
    await delay(2000);
    // 下载试卷
    const result = await dispatch({
      type    : "examBlock/downloadPaper",
      payload : downloadEffect
    });

    // 是否下载成功失败
    const status = result ? "success" : "fail";
    this.setState({
      status
    });
    onChange( status );
  }


  render() {
    const { status } = this.state;
    // 试卷正在下载
    if (status === 'loading') {
      return (
        <div className={styles.loading}>
          <div style={{ textAlign: 'center' }}>
            <img src={loading} alt="logo" />
            <div className={styles.loadingText}>
              {formatMessage({id:"app.text.paperloading",defaultMessage:"正在下载试卷...请耐心等待"})}
            </div>
          </div>
        </div>
      );
    }

    // 试卷下载失败
    if (status === 'failed') {
      return (
        <div className={styles.loading}>
          <div style={{ textAlign: 'center' }} className="PaperLoadingFailed">
            <IconButton iconName="icon-warning warning" />
            <div className={styles.loadingbtn}>
              {formatMessage({id:"app.text.reloadpaper",defaultMessage:"试卷下载失败...请重试"})}
            </div>
            <div className={styles.loadingbtn}>
              <IconButton
                text={formatMessage({id:"app.text.reloadingpaper",defaultMessage:"重新下载"})}
                iconName=""
                type="button"
                className={styles.redcordBtn}
                onClick={this.downloadPaper}
              />
            </div>
          </div>
        </div>
      );
    }

    // 下载成功
    if( status === "success" ){
      return (
        <div className={styles.loading}>
          <div style={{ textAlign: 'center' }}>
            <img src={readyOk} alt="logo" />
            <div className={styles.completeText}>
              {formatMessage({id:"app.text.prepare",defaultMessage:"准备就绪"})}
            </div>
            <div className={styles.tipsText}>
              {formatMessage({id:"app.text.examtip",defaultMessage:"请不要再动麦克风和耳机，安静等待考试指令"})}
            </div>
          </div>
        </div>
      );
    }

    return null;


  }
}


export default Single;
