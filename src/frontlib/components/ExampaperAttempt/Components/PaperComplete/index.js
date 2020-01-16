import React, { PureComponent } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import compete_icon from '@/frontlib/assets/compete_icon.png';
import SecretKeyModal from '../SecretKeyModal/api';
import loading from '@/frontlib/assets/loading.gif';
import upload from '@/frontlib/assets/upload.gif';
import tast_done_icon from '@/frontlib/assets/tast_done_icon.png';
import failed from '@/frontlib/assets/failed.png';

/**
 * 答题完成
 * status  试卷完成后的状态
 * isConnect 是否连接网络
 */

export default class PaperComplete extends PureComponent {
  state = {
    hasExportLM: false, // 是否已经导出答题包
  };

  exportBack = () => {
    this.setState({ hasExportLM: true });
  };

  render() {
    const { instructions, respondentsObject } = this.props;
    const { hasExportLM } = this.state;
    switch (this.props.status) {
      // 正常答题完成

      case 'normal':
        return (
          <div className={styles.loading}>
            <div>
              <div style={{ textAlign: 'center' }}>
                <img src={compete_icon} alt="logo" />
                <div className={styles.completeText}>
                  {formatMessage({ id: 'app.text.answerfinished', defaultMessage: '答题完成' })}
                </div>
                <div className={styles.loadingText}>
                  {formatMessage({
                    id: 'app.text.answerbeforetip',
                    defaultMessage: '请保持安静，等待考试结束指令',
                  })}
                </div>
              </div>
              {/* 异常答题完成 */}
              {!this.props.isConnect && (
                <div className={styles.abnormal}>
                  <div className={styles.warn_text}>
                    <i className="iconfont icon-warning" />
                    <div>
                      &nbsp;&nbsp;
                      {hasExportLM
                        ? formatMessage({
                            id: 'app.text.successexport',
                            defaultMessage: '答案包已成功导出',
                          })
                        : formatMessage({
                            id: 'app.text.failexport',
                            defaultMessage: '答案包上传失败，请等待老师处理',
                          })}
                    </div>
                  </div>
                  <div
                    className={styles.warn_btn}
                    onClick={() => {
                      SecretKeyModal({
                        dataSource: instructions,
                        respondentsObject: JSON.stringify(respondentsObject.respondentsObject),
                        callback: tag => {
                          this.exportBack(tag);
                        },
                      });
                    }}
                  >
                    {formatMessage({ id: 'app.text.exportanswer', defaultMessage: '导出答卷包' })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      case 'upLoad':
        return (
          <div className={styles.loading}>
            <div style={{ textAlign: 'center' }}>
              <img src={upload} alt="logo" />
              <div className={styles.tipsText}>
                {formatMessage({
                  id: 'app.text.exporting',
                  defaultMessage: '正在上传答案包...请耐心等待',
                })}
              </div>
            </div>
          </div>
        );
      // 上传答卷包失败

      case 'upLoadFailed':
        return (
          <div className={styles.loading}>
            <div style={{ textAlign: 'center' }}>
              <div className={styles.upLoadFailed}>
                <div className={styles.warn_text}>
                  <i className="iconfont icon-warning" />
                  <div>
                    &nbsp;&nbsp;
                    {hasExportLM
                      ? formatMessage({
                          id: 'app.text.successexport',
                          defaultMessage: '答案包已成功导出',
                        })
                      : formatMessage({
                          id: 'app.text.failexport',
                          defaultMessage: '答案包上传失败，请等待老师处理',
                        })}
                  </div>
                </div>

                <div
                  className={styles.warn_btn}
                  onClick={() => {
                    console.log(respondentsObject);
                    SecretKeyModal({
                      dataSource: instructions,
                      respondentsObject: JSON.stringify(respondentsObject.respondentsObject),
                      callback: tag => {
                        this.exportBack(tag);
                      },
                    });
                  }}
                >
                  {formatMessage({ id: 'app.text.exportanswer', defaultMessage: '导出答卷包' })}
                </div>
              </div>
            </div>
          </div>
        );
      // 答案打包失败
      case 'archiveFailed':
        return (
          <div className={styles.loading}>
            <div style={{ textAlign: 'center' }}>
              <div className={styles.archiveFailed}>
                <div className={styles.warn_text}>
                  <i className="iconfont icon-warning" />
                  <div>
                    &nbsp;&nbsp;
                    {formatMessage({
                      id: 'app.text.failexport',
                      defaultMessage: '答案包上传失败，请等待老师处理',
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // 上传答卷包成功
      case 'upLoadSucess':
        return (
          <div className={styles.loading}>
            <div style={{ textAlign: 'center' }}>
              <img src={loading} alt="logo" />
              <div className={styles.tipsText}>
                {formatMessage({
                  id: 'app.text.successwait',
                  defaultMessage: '答案包上传成功...5秒后自动跳转',
                })}
              </div>
            </div>
          </div>
        );
      // 考试完成

      case 'normalCompete':
        return (
          <div className={styles.loading}>
            <div style={{ textAlign: 'center' }}>
              <img src={tast_done_icon} alt="logo" />
              <div className={styles.completeText}>
                {formatMessage({ id: 'app.text.examfinished', defaultMessage: '考试完成' })}
              </div>
              <div className={styles.loadingText}>
                {formatMessage({
                  id: 'app.text.leavebefore',
                  defaultMessage: '请保持安静，等待离开指令',
                })}
              </div>
            </div>
          </div>
        );
      // 考试失败
      case 'examFail':
        return (
          <div className={styles.loading}>
            <div style={{ textAlign: 'center' }}>
              <img src={failed} alt="logo" />
              <div className={styles.completeText}>
                {formatMessage({ id: 'app.text.examstop', defaultMessage: '考试终止' })}
              </div>
              <div className={styles.loadingText}>
                {formatMessage({
                  id: 'app.text.leavebefore',
                  defaultMessage: '请保持安静，等待离开指令',
                })}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }
}
