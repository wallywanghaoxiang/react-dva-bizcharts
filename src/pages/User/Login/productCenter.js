/* eslint-disable jsx-a11y/media-has-caption */
import React, { Component } from 'react';
import { Divider, Modal } from 'antd';
import classNames from 'classnames';
import function1Icon from '@/assets/productCenter/icon_function1.png';
import function2Icon from '@/assets/productCenter/icon_function2.png';
import function3Icon from '@/assets/productCenter/icon_function3.png';
import function4Icon from '@/assets/productCenter/icon_function4.png';
import function5Icon from '@/assets/productCenter/icon_function5.png';
import function6Icon from '@/assets/productCenter/icon_function6.png';
import videoAssets from '@/assets/video/1080p.mp4';

import styles from './productCenter.less';

class ProductCenter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      videoHidden: true,
      visible: false,
    };
  }

  componentDidMount() {
    document.addEventListener('fullscreenchange', this.exitFullOperation);
    // FireFox
    document.addEventListener('mozfullscreenchange', this.exitFullOperation);
    // Opera
    document.addEventListener('webkitfullscreenchange', this.exitFullOperation);
    // IE/Edge
    document.addEventListener('MSFullscreenChange', this.exitFullOperationIE);
  }

  componentWillUnmount() {
    document.removeEventListener('fullscreenchange', this.exitFullOperation);
    // FireFox
    document.removeEventListener('mozfullscreenchange', this.exitFullOperation);
    // Opera
    document.removeEventListener('webkitfullscreenchange', this.exitFullOperation);
    // IE/Edge
    document.removeEventListener('MSFullscreenChange', this.exitFullOperationIE);
  }

  // 退出全屏停止播放方法
  exitFullOperation = () => {
    if (!document.fullscreenElement) {
      // 退出全屏
      if (this.video) {
        this.video.pause();
      }
      this.setState({
        videoHidden: true,
      });
    }
  };

  // IE浏览器下退出全屏停止播放方法
  exitFullOperationIE = () => {
    if (!document.msFullscreenElement) {
      // 退出全屏
      if (this.video) {
        this.video.pause();
      }
      this.setState({
        videoHidden: true,
      });
    }
  };

  // 播放视频
  playVideo = () => {
    this.setState(
      {
        visible: true,
      },
      () => {
        if (this.modalVideo) {
          this.modalVideo.play();
        }
      }
    );

    // const fullscreenEnabled =
    //   document.fullscreenEnabled ||
    //   document.mozFullScreenEnabled ||
    //   document.webkitFullscreenEnabled ||
    //   document.msFullscreenEnabled;
    // if (fullscreenEnabled) {
    //   this.setState(
    //     {
    //       videoHidden: false,
    //     },
    //     () => {
    //       if (this.video) {
    //         this.video.play();
    //       }
    //       this.openFullscreen(this.video);
    //     }
    //   );
    // } else {
    //   this.setState(
    //     {
    //       visible: true,
    //     },
    //     () => {
    //       if (this.modalVideo) {
    //         this.modalVideo.play();
    //       }
    //     }
    //   );
    // }
  };

  // 打开全屏方法
  openFullscreen = element => {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullScreen();
    }
  };

  // 弹窗关闭
  handleCancel = () => {
    this.setState(
      {
        visible: false,
      },
      () => {
        if (this.modalVideo) {
          this.modalVideo.pause();
        }
      }
    );
  };

  // 退出全屏方法
  //   exitFullScreen = () => {
  //     if (document.exitFullscreen) {
  //       document.exitFullscreen();
  //     } else if (document.mozCancelFullScreen) {
  //       document.mozCancelFullScreen();
  //     } else if (document.msExitFullscreen) {
  //       document.msExiFullscreen();
  //     } else if (document.webkitCancelFullScreen) {
  //       document.webkitCancelFullScreen();
  //     } else if (document.webkitExitFullscreen) {
  //       document.webkitExitFullscreen();
  //     }
  //   };

  render() {
    const { videoHidden, visible } = this.state;
    const { enter } = this.props;
    return (
      <div className={styles.productCenterContainer} id={enter ? styles.enterName : ''}>
        {/* 左侧 */}
        <div className={styles.left}>
          <div className={classNames(styles.leftItem, styles.itemTitle)}>
            {/* <img className={styles.leftIcon} src={leftIcon} alt="leftIcon" />
            <img className={styles.rightIcon} src={rightIcon} alt="rightIcon" /> */}
            <span className={styles.title}>高耘</span>
            <Divider type="vertical" />
            <span className={styles.subTitle}>让每个孩子轻松提高学习效率</span>
          </div>
          <div className={classNames(styles.leftItem, styles.function1)}>
            <img src={function1Icon} alt="function1Icon" />
            <span className={styles.contentText}>口语评测评价细腻，支持省市标准</span>
          </div>
          <div className={classNames(styles.leftItem, styles.function2)}>
            <img src={function2Icon} alt="function2Icon" />
            <span className={styles.contentText}>快速适配各地中高考的题型和流程</span>
          </div>
          <div className={classNames(styles.leftItem, styles.function3)}>
            <img src={function3Icon} alt="function3Icon" />
            <span className={styles.contentText}>海量自研题库，同步教材匹配考点</span>
          </div>
          <div className={classNames(styles.leftItem, styles.function4)}>
            <img src={function4Icon} alt="function4Icon" />
            <span className={styles.contentText}>多维度保障线上平台稳定高可用</span>
          </div>
          <div className={classNames(styles.leftItem, styles.function5)}>
            <img src={function5Icon} alt="function5Icon" />
            <span className={styles.contentText}>多角色多维度认知诊断学情分析</span>
          </div>
          <div className={classNames(styles.leftItem, styles.function6)}>
            <img src={function6Icon} alt="function6Icon" />
            <span className={styles.contentText}>零接触式升级方案让运维更便捷</span>
          </div>
        </div>
        {/* 右侧 */}
        <div className={styles.right}>
          <div className={styles.playVideo}>
            <div className={styles.circle} onClick={this.playVideo}>
              <div className={styles.triangle} />
            </div>
          </div>
          <div className={styles.tip}>观看视频，快速了解高耘听说模考系统</div>
        </div>
        {/* video */}
        <div
          className={styles.videoControlContainer}
          style={{ display: videoHidden ? 'none' : 'block' }}
        >
          <video
            className={styles.videoControl}
            hidden={videoHidden}
            controls
            ref={video => {
              this.video = video;
            }}
            src={videoAssets}
            controlsList="nodownload"
          >
            {/* <track kind="captions" src="" srcLang="en" label="English" /> */}
            your browser does not support the video tag
          </video>
          {/* <i className="iconfont icon-close">关闭</i> */}
        </div>

        <Modal
          title=""
          wrapClassName={styles.videoModal}
          visible={visible}
          footer={null}
          onCancel={this.handleCancel}
        >
          <video
            style={{ width: '100%', height: '100vh', objectFit: 'fill' }}
            controls
            ref={video => {
              this.modalVideo = video;
            }}
            autoPlay
            src={videoAssets}
            controlsList="nodownload"
          >
            {/* <track kind="captions" src="" srcLang="en" label="English" /> */}
            your browser does not support the video tag
          </video>
        </Modal>
      </div>
    );
  }
}

export default ProductCenter;
