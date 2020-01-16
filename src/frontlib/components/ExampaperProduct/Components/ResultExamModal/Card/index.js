import React, { PureComponent } from 'react';
import styles from '../index.less';
import SecretKeyModal from '@/frontlib/components/ExampaperAttempt/Components/SecretKeyModal/api';
import { message, Tooltip } from 'antd';
import showExampaperReport from '@/frontlib/components/ExampaperReport/api';
import showResultExamModal from '../api';
import corner_fail_icon from '@/frontlib/assets/corner_fail_icon.png';
import corner_less_icon from '@/frontlib/assets/corner_less_icon.png';
import { formatMessage } from 'umi/locale';
import { countDown } from '@/utils/timeHandle';

import { showWaiting, hideLoading, DoWithNum } from '@/frontlib/utils/utils';
import uploading from '@/frontlib/assets/upload.gif';

export default class Card extends PureComponent {
  state = {
    item: this.props.item,
  };

  goToReport(item, type = '') {
    localStorage.setItem('report_paperMd5', item.paperMd5);
    if (this.props.type === 'result') {
      this.props.index.props.index.onHandleCancel();
    }

    let self = this;
    showExampaperReport({
      dataSource: {
        paperData: item.paperData,
        showData: item.showData,
        allTime: countDown(item.finishTime),
      },
      isFinish: type === 'answering' ? 'no' : '',
      callback: e => {
        localStorage.removeItem('report_paperMd5');
        if (self.props.type === 'result') {
          showResultExamModal({
            dataSource: self.props.index.props.index.props.dataSource,
            instructions: self.props.index.props.index.props.instructions,
            id: '',
            callback: e => {},
          });
        }
      },
    });
  }

  /**
   * 上传试卷包
   * @Author   tina.zhang
   * @DateTime 2018-12-20T09:15:04+0800
   * @return   {[type]}                 [description]
   */
  uploadPaper(item) {
    showWaiting({
      img: uploading,
      text:
        formatMessage({ id: 'app.text.zzscdjbqsh', defaultMessage: '正在上传答卷包，请稍等' }) +
        '..',
    });
    let self = this;
    const { sendMS, upload, storeData } = this.props.instructions;
    let studentInfo = localStorage.getItem('studentInfo');
    studentInfo = JSON.parse(studentInfo);

    let snapshotId = item.snapshotId;
    let paperMd5 = item.paperMd5;
    let studentIpAddress = localStorage.getItem('studentIpAddress');
    let respondentsObject = item.packageResult.respondentsObject;

    if (respondentsObject.respondentsObject) {
      if (
        respondentsObject.respondentsObject.needFileCount >=
        respondentsObject.respondentsObject.fileCount
      ) {
        respondentsObject.respondentsObject.respondentsStatus = 'RS_5';
      }

      if (respondentsObject.respondentsObject.zeroCount > 0) {
        respondentsObject.respondentsObject.respondentsStatus = 'RS_6';
      }
    }

    let body = {};
    upload({
      url: `proxyapi/proxy/file?taskId=${studentInfo.taskId}&snapshotId=${snapshotId}&studentId=${
        studentInfo.stuid
      }`,
      paperMd5: respondentsObject.respondentsObject.respondentsMd5,
      fileName: respondentsObject.respondentsObject.paperName,
      success: e => {
        respondentsObject.respondentsObject.upLoadStatus = 1;
        body = {
          ipAddr: studentIpAddress,
          paperid: snapshotId,
          result: 1,
          respondentsObject,
        };
        item.packageResult = body;
        self.setState({ item: JSON.parse(JSON.stringify(item)) });
        // self.updatePaperList(body);
        hideLoading();
        sendMS('recycle:reply', body);

        //当上传试卷包成功，发送recycle:reply指令后，调用Shell
        storeData({ binessStatus: 'MS_14' });
        console.log('上传试卷包成功');
        message.success(
          formatMessage({ id: 'app.text.scsjbcg', defaultMessage: '上传试卷包成功' })
        );
      },
      fail: () => {
        // 学生机在考试阶段：当答卷上传自动重试3次无效后，走上传答卷包异常流程

        hideLoading();
        console.log('上传试卷包失败');
        message.warn(formatMessage({ id: 'app.text.scsjbsb', defaultMessage: '上传试卷包失败' }));
        respondentsObject.respondentsObject.upLoadStatus = 0;
        body = {
          ipAddr: studentIpAddress,
          paperid: snapshotId,
          result: 3,
          respondentsObject,
        };
        sendMS('recycle:reply', body);
        //当上传试卷包失败，发送recycle:reply指令后，调用Shell
        storeData({ binessStatus: 'MS_13' });
      },
    });
    return true;
  }

  renderFooter(data) {
    const { instructions } = this.props;
    if (data.packageResult) {
      let type = data.packageResult.result;
      switch (type) {
        case 1: //上传成功
          return (
            <div className={styles.footer}>
              <div>
                <span className={styles.normal}>答案包：</span>
                <span className={styles.black}>正常</span>
              </div>
              <div />
            </div>
          );
        case 2: //打包失败
          return (
            <div className={styles.footer}>
              <div>
                <span className={styles.normal}>答案包：</span>
                <span className={styles.warning}>打包失败</span>
              </div>
              <div />
            </div>
          );
        case 3: //上传失败
          return (
            <div className={styles.footer}>
              <div>
                <span className={styles.normal}>答案包：</span>
                <span className={styles.warning}>上传失败</span>
              </div>
              <div
                className={styles.btn}
                onClick={() => {
                  SecretKeyModal({
                    dataSource: instructions,
                    item: data,
                    callback: tag => {
                      message.success('导出成功！');
                      // this.exportBack(tag);
                    },
                  });
                }}
              >
                导出
              </div>
            </div>
          );
      }
    }
  }

  renderNewFooter(data) {
    const { instructions, type } = this.props;
    let snapshotId = localStorage.getItem('snapshotId');
    if (type === 'result' && data.snapshotId == snapshotId) {
      return (
        <div className={styles.footer}>
          <div>
            <span className={styles.orange}>
              {formatMessage({ id: 'app.text.dtz', defaultMessage: '答题中' })}...
            </span>
          </div>
          <div className={styles.blue} onClick={this.goToReport.bind(this, data, 'answering')}>
            <i className={'iconfont icon-file'} style={{ marginRight: '5px' }} />
            {formatMessage({ id: 'app.text.xq', defaultMessage: '详情' })}
          </div>
        </div>
      );
    }
    if (data.packageResult) {
      let result = data.packageResult.result;
      switch (result) {
        case 1: //上传成功
          return (
            <div className={styles.footer}>
              <div>
                <span className={styles.green}>
                  {formatMessage({ id: 'app.text.jjcg', defaultMessage: '交卷成功' })}
                </span>
              </div>
              <div className={styles.blue} onClick={this.goToReport.bind(this, data)}>
                <i className={'iconfont icon-file'} style={{ marginRight: '5px' }} />
                {formatMessage({ id: 'app.text.xq', defaultMessage: '详情' })}
              </div>
            </div>
          );
        case 2: //打包失败
          return (
            <div className={styles.footer}>
              <img src={corner_less_icon} className={styles.tagImg} />
              <div />
              <div className={styles.blue} onClick={this.goToReport.bind(this, data)}>
                <i className={'iconfont icon-file'} style={{ marginRight: '5px' }} />
                {formatMessage({ id: 'app.text.xq', defaultMessage: '详情' })}
              </div>
            </div>
          );
        case 3: //上传失败
          if (type === 'result') {
            return (
              <div className={styles.footer}>
                <img src={corner_fail_icon} className={styles.tagImg} />
                <div />
                <div className={styles.blue} onClick={this.goToReport.bind(this, data)}>
                  <i className={'iconfont icon-file'} style={{ marginRight: '5px' }} />
                  {formatMessage({ id: 'app.text.xq', defaultMessage: '详情' })}
                </div>
              </div>
            );
          } else {
            return (
              <div className={styles.footer}>
                <img src={corner_fail_icon} className={styles.tagImg} />
                <div
                  className={styles.normal_btn}
                  onClick={() => {
                    this.uploadPaper(data);
                  }}
                >
                  <i className={'iconfont icon-reset'} />
                  {formatMessage({ id: 'app.text.cxjj', defaultMessage: '重新交卷' })}
                </div>

                <div className={styles.normal_btn2}>
                  <Tooltip title="导出">
                    <i
                      className={'iconfont icon-box-up'}
                      style={{ marginRight: '10px' }}
                      onClick={() => {
                        SecretKeyModal({
                          dataSource: instructions,
                          item: data,
                          callback: tag => {
                            message.success('导出成功！');
                            // this.exportBack(tag);
                          },
                        });
                      }}
                    />
                  </Tooltip>
                  <Tooltip title={formatMessage({ id: 'app.text.xq', defaultMessage: '详情' })}>
                    <i
                      className={'iconfont icon-file'}
                      onClick={this.goToReport.bind(this, data)}
                    />
                  </Tooltip>
                </div>
              </div>
            );
          }
      }
    }
  }

  render() {
    const { item } = this.state;
    // return  <div className={styles.card} >
    //           <div className={styles.left}>
    //             <div className={styles.card_title}>{item.name}</div>
    //             <div className={styles.main}>
    //                 <span className={styles.normal}>用时</span>
    //                 <span className={styles.black}>&nbsp;{this.formatSeconds(item.finishTime)}</span>
    //             </div>
    //             {this.renderFooter(item)}
    //           </div>
    //           <div className={styles.blue} onClick={this.goToReport.bind(this,item)}>{"查看报告"}</div>
    //       </div>;
    return (
      <div className={styles.newcard + ' cardStyle'}>
        <div className={styles.card_title2}>{item.name}</div>
        <div className={styles.main}>
          <div>
            <span className={styles.bold}>
              {(item.answersData &&
                item.answersData.totalScore &&
                DoWithNum(item.answersData.totalScore)) ||
                0}
            </span>
            {formatMessage({ id: 'app.examination.inspect.paper.mark', defaultMessage: '分' })}/
            {item.fullMark || 100}
            {formatMessage({ id: 'app.examination.inspect.paper.mark', defaultMessage: '分' })}
          </div>
          <span className={styles.black} />
        </div>
        <div className={styles.main}>
          <span className={styles.normal}>
            {formatMessage({ id: 'app.text.yongshi', defaultMessage: '用时' })}
          </span>
          <span className={styles.black}>&nbsp;{countDown(item.finishTime)}</span>
        </div>
        <div className={styles.main}>
          <span className={styles.normal}>
            {formatMessage({ id: 'app.text.yizuo', defaultMessage: '已做' })}
          </span>
          <span className={styles.black}>
            {item.answeredNum || 0}/{item.questionPointCount || 0}{' '}
            {formatMessage({ id: 'app.text.subquestion', defaultMessage: '小题' })}
          </span>
        </div>

        {this.renderNewFooter(item)}
      </div>
    );
  }
}
