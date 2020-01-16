/* eslint-disable jsx-a11y/media-has-caption */
import React, { Component } from 'react';
import { Carousel, Modal } from 'antd';
import classNames from 'classnames';
import logoWhite from '@/assets/logo_student_white.png';
import logoblack from '@/assets/logo_student_black.png';
import arrowDown from '@/assets/index_page_arrow_down.png';
import videoAssets from '@/assets/video/1080p.mp4';
import LoginComponent from './index';
import ProductCenter1 from './productCenter';
import ProductCenter2 from './productCenter2';
import ProductCenter3 from './productCenter3';
import ProductCenter4 from './productCenter4';
import ProductCenter5 from './productCenter5';
import styles from './home.less';

class home extends Component {
  constructor(props) {
    super(props);
    this.menus = ['首页', '产品中心', '服务案例', '专家团队'];
    this.state = {
      current: 0, // 当前面板索引
      currentMenu: 0, // 顶部右侧索引
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
      if (this.promotionalVideo) {
        this.promotionalVideo.pause();
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
      if (this.promotionalVideo) {
        this.promotionalVideo.pause();
      }
      this.setState({
        videoHidden: true,
      });
    }
  };

  handleScroll = e => {
    const { current } = this.state;

    if (e.nativeEvent.deltaY <= 0) {
      // scrolling up
      if (current > 0) {
        this.carousel.goTo(current - 1, false);
      }
    } else {
      // scrolling down
      // eslint-disable-next-line no-lonely-if
      if (current <= 5) {
        this.carousel.goTo(current + 1, false);
      }
    }
  };

  // 切换面板后的回调
  handleAfterChange = current => {
    let menuActiveIndex = 0;
    switch (current) {
      case 0:
        menuActiveIndex = 0;
        break;
      case 1:
      case 2:
      case 3:
        menuActiveIndex = 1;
        break;
      case 4:
        menuActiveIndex = 2;
        break;
      case 5:
        menuActiveIndex = 3;
        break;
      default:
        break;
    }

    this.setState({
      current,
      currentMenu: menuActiveIndex,
    });
  };

  // 切换面板前的回调
  //   handleBeforeChange = (from, to) => {};

  // 首页arrowdown手动切换面板
  jumpNext = () => {
    this.carousel.goTo(1, false);
  };

  // 顶部右侧menu变化
  handleMenuChange = idx => {
    switch (idx) {
      case 0:
        this.carousel.goTo(0, false);
        break;
      case 1:
        this.carousel.goTo(1, false);
        break;
      case 2:
        this.carousel.goTo(4, false);
        break;
      case 3:
        this.carousel.goTo(5, false);
        break;
      default:
        break;
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
    //       if (this.promotionalVideo) {
    //         this.promotionalVideo.play();
    //       }
    //       this.openFullscreen(this.promotionalVideo);
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

  // 退出全屏方法
  // exitFullScreen = () => {
  //   if (document.exitFullscreen) {
  //     document.exitFullscreen();
  //   } else if (document.mozCancelFullScreen) {
  //     document.mozCancelFullScreen();
  //   } else if (document.msExitFullscreen) {
  //     document.msExiFullscreen();
  //   } else if (document.webkitCancelFullScreen) {
  //     document.webkitCancelFullScreen();
  //   } else if (document.webkitExitFullscreen) {
  //     document.webkitExitFullscreen();
  //   }
  // };

  handleBackTop = () => {
    this.carousel.goTo(0, false);
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

  render() {
    const { current, currentMenu, videoHidden, visible } = this.state;

    const menuActiveClass =
      current === 0 || current === 4 ? styles.menuWhiteActive : styles.menuBlackActive;
    return (
      <div className={styles.mainContainer} onWheel={this.handleScroll}>
        {/* logo */}
        <div className={styles.logoContainer}>
          <img src={current === 0 || current === 4 ? logoWhite : logoblack} alt="logo" />
        </div>

        {/* 顶部右侧快速按钮 */}
        <div className={styles.topMenuContainer}>
          <div className={styles.menusBox}>
            {this.menus.map((tag, idx) => {
              return (
                <div
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${idx}`}
                  className={classNames(
                    current === 0 || current === 4 ? styles.menuItemWhite : styles.menuItemBlack,
                    currentMenu === idx ? menuActiveClass : ''
                  )}
                  onClick={() => this.handleMenuChange(idx)}
                >
                  {tag}
                </div>
              );
            })}
          </div>
        </div>

        {/* 跑马灯 */}
        <div
          className={current === 0 || current === 4 ? styles.carouselWhite : styles.carouselBlack}
        >
          <Carousel
            ref={carousel => {
              this.carousel = carousel;
            }}
            infinite={false}
            dotPosition="right"
            afterChange={this.handleAfterChange}
            beforeChange={this.handleBeforeChange}
          >
            <div>
              <LoginComponent />
            </div>
            <div>
              <ProductCenter1 enter={current === 1} />
            </div>
            <div>
              <ProductCenter2 enter={current === 2} />
            </div>
            <div>
              <ProductCenter3 enter={current === 3} />
            </div>
            <div>
              <ProductCenter4 enter={current === 4} />
            </div>
            <div>
              <ProductCenter5 enter={current === 5} />
            </div>
          </Carousel>
        </div>

        {/* 页码 */}
        <div className={styles.pageContainer}>
          <div
            className={styles.vline}
            style={{ background: current === 0 || current === 4 ? '#fff' : '#333' }}
          />
          <span className={current === 0 || current === 4 ? styles.indexWhite : styles.indexBlack}>
            0{current + 1}
          </span>
          <span className={current === 0 || current === 4 ? styles.totalWhite : styles.totalBlack}>
            /06
          </span>
        </div>

        {/* 视频播放器关闭按钮 */}
        {/* <div className={styles.closeBtn}>关闭</div> */}

        {/* 最底部闪烁按钮 */}
        {current === 0 && (
          <div className={styles.arrowDownContainer} onClick={this.jumpNext}>
            <img src={arrowDown} alt="arrowDown" />
          </div>
        )}

        {/* 播放视频按钮 */}
        {current === 0 && (
          <div className={styles.playBtnContainer}>
            <div className={styles.circle} onClick={this.playVideo}>
              <div className={styles.triangle} />
            </div>
            <span>高耘宣传视频</span>

            <div
              className={styles.videoControlContainer}
              style={{ display: videoHidden ? 'none' : 'block' }}
            >
              <video
                className={styles.videoControl}
                hidden={videoHidden}
                controls
                ref={video => {
                  this.promotionalVideo = video;
                }}
                src={videoAssets}
                controlsList="nodownload"
              >
                {/* <track kind="captions" src="" srcLang="en" label="English" /> */}
                your browser does not support the video tag
              </video>
              {/* <i className="iconfont icon-close">关闭</i> */}
            </div>
          </div>
        )}

        {/* 箭头按钮 */}
        {current !== 0 && (
          <div className={styles.arrowUpContainer} onClick={this.handleBackTop}>
            <i className="iconfont icon-qus-up" />
          </div>
        )}
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

export default home;
