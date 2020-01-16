
/**
 * @name ImageCode
 * @desc 滑动拼图验证
 * @author tina.zhang
 *
 * @param {String} imageUrl 图片的路径
 * @param {Number} imageWidth 展示图片的宽带
 * @param {Number} imageHeight 展示图片的高带
 * @param {Number} fragmentSize 滑动图片的尺寸
 * @param {Function} onReload 当点击'重新验证'时执行的函数
 * @param {Function} onMath 匹配成功时执行的函数
 * @param {Function} onError 匹配失败时执行的函数
 */
 
import React, { Component } from 'react';
import { formatMessage, defineMessages } from 'umi/locale';
import styles from './index.less';
import icoSuccess from '@/assets/qus_right_icon.png';
import icoError from '@/assets/qus_wrong_icon.png';
import icoReload from '@/assets/none_task_pic.png';
import icoSlider from '@/assets/imageCode/code_pic_hander.png';

import ImageBG1 from '@/assets/imageCode/1.png';
import ImageBG2 from '@/assets/imageCode/2.png';
import ImageBG3 from '@/assets/imageCode/3.png';
import ImageBG4 from '@/assets/imageCode/4.png';
import ImageBG5 from '@/assets/imageCode/5.png';


const messages = defineMessages({
    sliderBtnTit:{id:'app.component.image.code.slider.btn.title',defaultMessage:'向右拖动滑块拼图，获取验证码'},
    successTip:{id:'app.component.image.code.match.success.tip',defaultMessage:'匹配成功'},
    failTip:{id:'app.component.image.code.match.fail.tip',defaultMessage:'匹配失败'},
  })
 
const STATUS_LOADING = 0 // 还没有图片
const STATUS_READY = 1 // 图片渲染完成,可以开始滑动
const STATUS_MATCH = 2 // 图片位置匹配成功
const STATUS_ERROR = 3 // 图片位置匹配失败
 

// 图片数组
const imageBGArr = [ImageBG1,ImageBG2,ImageBG3,ImageBG4,ImageBG5];
let lastIdx;
// 随机取图片，和上一张不同
function randomImg() {
  let b = Math.random()*(imageBGArr.length);
  b = Math.floor(b)%(imageBGArr.length);
  while(b === lastIdx) {
    b = Math.random()*(imageBGArr.length);
    b = Math.floor(b)%(imageBGArr.length);
  }
  const img = imageBGArr[b];
  lastIdx = b;
  return img
}
 
// 生成裁剪路径
function createClipPath(ctx, size = 100, styleIndex = 0) {
    const pathStyle = [
        [0, 0, 0, 0],
        [0, 0, 0, 1],
        [0, 0, 1, 0],
        [0, 0, 1, 1],
        [0, 1, 0, 0],
        [0, 1, 0, 1],
        [0, 1, 1, 0],
        [0, 1, 1, 1],
        [1, 0, 0, 0],
        [1, 0, 0, 1],
        [1, 0, 1, 0],
        [1, 0, 1, 1],
        [1, 1, 0, 0],
        [1, 1, 0, 1],
        [1, 1, 1, 0],
        [1, 1, 1, 1]
    ]
    const style = pathStyle[styleIndex]
 
    const r = 0.1 * size
    ctx.save()
    ctx.beginPath()
    // left
    ctx.moveTo(r, r)
    ctx.lineTo(r, 0.5 * size - r)
    ctx.arc(r, 0.5 * size, r, 1.5 * Math.PI, 0.5 * Math.PI, style[0])
    ctx.lineTo(r, size - r)
    // bottom
    ctx.lineTo(0.5 * size - r, size - r)
    ctx.arc(0.5 * size, size - r, r, Math.PI, 0, style[1])
    ctx.lineTo(size - r, size - r)
    // right
    ctx.lineTo(size - r, 0.5 * size + r)
    ctx.arc(size - r, 0.5 * size, r, 0.5 * Math.PI, 1.5 * Math.PI, style[2])
    ctx.lineTo(size - r, r)
    // top
    ctx.lineTo(0.5 * size + r, r)
    ctx.arc(0.5 * size, r, r, 0, Math.PI, style[3])
    ctx.lineTo(r, r)
 
    ctx.clip()
    ctx.closePath()
}
 
class ImageCode extends Component {
    static defaultProps = {
        imageUrl: randomImg(),
        imageWidth: 330,
        imageHeight: 85,
        fragmentSize: 40,
        onReload: () => {},
        onMatch: () => {},
        onError: () => {}
    }
 
    state = {
        isMovable: false,
        offsetX: 0, // 图片截取的x
        offsetY: 0, // 图片截取的y
        startX: 0, // 开始滑动的 x
        oldX: 0,
        currX: 0, // 滑块当前 x,
        status: STATUS_LOADING,
        showTips: false,
        tipsIndex: 0,
        imageUrl:randomImg(), // 验证图片
        arrTips:[
            { ico: icoSuccess, text: formatMessage(messages.successTip) }, 
            { ico: icoError, text: formatMessage(messages.failTip) }
        ]
    }

    componentDidMount() {
        this.renderImage();
    }
 

    // componentDidUpdate(prevProps) {
    //     // 当父组件传入新的图片后，开始渲染
    //     const {imageUrl} = this.props;
    //     if (!!imageUrl && prevProps.imageUrl !== imageUrl) {
    //         this.renderImage()
    //     }
    // }

 
    // 渲染两个canvans
    renderImage = () => {
        // 初始化状态
        this.setState({ status: STATUS_LOADING })
 
        // 创建一个图片对象，主要用于canvas.context.drawImage()
        const objImage = new Image()
 
        objImage.addEventListener("load", () => {
            const { imageWidth, imageHeight, fragmentSize } = this.props
 
            // 先获取两个ctx
            const {refs} = this;
            const {shadowCanvas,fragmentCanvas} = refs;
            const ctxShadow = shadowCanvas.getContext("2d")
            const ctxFragment = fragmentCanvas.getContext("2d")
 
            // 让两个ctx拥有同样的裁剪路径(可滑动小块的轮廓)
            const styleIndex = Math.floor(Math.random() * 16)
            createClipPath(ctxShadow, fragmentSize, styleIndex)
            createClipPath(ctxFragment, fragmentSize, styleIndex)
 
            // 随机生成裁剪图片的开始坐标
            const clipX = Math.floor(fragmentSize + (imageWidth - 2 * fragmentSize) * Math.random())
            const clipY = Math.floor((imageHeight - fragmentSize) * Math.random())
 
            // 让小块绘制出被裁剪的部分
            ctxFragment.drawImage(objImage, clipX, clipY, fragmentSize, fragmentSize, 0, 0, fragmentSize, fragmentSize)
 
            // 让阴影canvas带上阴影效果
            ctxShadow.fillStyle = "rgba(255, 255, 255)"
            ctxShadow.fill()

            ctxFragment.fillStyle = "rgba(255, 255, 255, 0.2)"
            ctxFragment.fill()
 
            // 恢复画布状态
            ctxShadow.restore()
            ctxFragment.restore()
 
            // 设置裁剪小块的位置
            this.setState({ offsetX: clipX, offsetY: clipY })
 
            // 修改状态
            this.setState({ status: STATUS_READY })
        })
 
        // const { imageUrl } = this.props;
        const { imageUrl } = this.state;
        objImage.src = imageUrl;
    }
 
    // 开始滑动
    onMoveStart = e => {
        const { status } = this.state;
        if (status !== STATUS_READY) {
            return
        }
 
        // 记录滑动开始时的绝对坐标x
        this.setState({ isMovable: true, startX: e.clientX })
    }
 
    // 滑动中
    onMoving = e => {
        const { status,isMovable,startX,oldX,imageWidth } = this.state;
        const { fragmentSize } = this.props;
        if (status !== STATUS_READY || !isMovable) {
            return
        }
        const distance = e.clientX - startX
        let currX = oldX + distance
 
        const minX = 0
        const maxX = imageWidth - fragmentSize
        const currX1 = currX > maxX ? maxX : currX
        currX = currX < minX ? 0 : currX1
 
        this.setState({ currX })
    }
 
    // 滑动结束
    onMoveEnd = () => {
        const {status,isMovable,currX,offsetX} = this.state;
        const {onMatch,onError} = this.props;

        if (status !== STATUS_READY || !isMovable) {
            return
        }
        // 将旧的固定坐标x更新
        this.setState(pre => ({ isMovable: false, oldX: pre.currX }))
 
        const isMatch = Math.abs(currX - offsetX) < 5
        if (isMatch) {
            this.setState(pre => ({ status: STATUS_MATCH, currX: pre.offsetX }), this.onShowTips)
            onMatch()
        } else {
            this.setState({ status: STATUS_ERROR }, () => {
                this.onReset()
                this.onShowTips()
            })
            onError()
        }
    }

    // 重置
    onReset = () => {
        const timer = setTimeout(() => {
            this.setState({ oldX: 0, currX: 0, status: STATUS_READY })
            clearTimeout(timer)
        }, 1000)
    }
 
    // 刷新图片
    onReload = () => {
        const {status} = this.state;
        const {fragmentSize,onReload} = this.props;
        if (status !== STATUS_READY && status !== STATUS_MATCH) {
            return
        }
        const {refs} = this;
        const ctxShadow = refs.shadowCanvas.getContext("2d")
        const ctxFragment = refs.fragmentCanvas.getContext("2d")
 
        // 清空画布
        ctxShadow.clearRect(0, 0, fragmentSize, fragmentSize)
        ctxFragment.clearRect(0, 0, fragmentSize, fragmentSize)
 
        this.setState(
            {
                isMovable: false,
                offsetX: 0, // 图片截取的x
                offsetY: 0, // 图片截取的y
                startX: 0, // 开始滑动的 x
                oldX: 0,
                currX: 0, // 滑块当前 x,
                status: STATUS_LOADING
            },
            onReload()
        )
    }
 
    onShowTips = () => {
        if (this.state.showTips) {
            return
        }
 
        const tipsIndex = this.state.status === STATUS_MATCH ? 0 : 1
        this.setState({ showTips: true, tipsIndex })
        const timer = setTimeout(() => {
            this.setState({ showTips: false })
            clearTimeout(timer)
        }, 2000)
    }
 
    render() {
        const { imageWidth, imageHeight, fragmentSize,styleObj } = this.props
        const { imageUrl, offsetX, offsetY, currX, showTips, tipsIndex,arrTips } = this.state
        const tips = arrTips[tipsIndex]
 
        return (
          <div className={styles.imageCode} style={{...styleObj, width: imageWidth }}>
            <div className={styles.imageContainer} style={{ height: imageHeight, backgroundImage: `url("${imageUrl}")` }}>
              <canvas
                ref="shadowCanvas"
                className={styles.canvas}
                width={fragmentSize}
                height={fragmentSize}
                style={{ left: `${offsetX}px`, top: `${offsetY}px`}}
              />
              <canvas
                ref="fragmentCanvas"
                className={styles.canvas}
                width={fragmentSize}
                height={fragmentSize}
                style={{ top: `${offsetY}px`, left: `${currX}px`}}
              />
 
              <div className={showTips ? styles.tipsContainerActive : styles.tipsContainer}>
                <i className={styles.tipsIco} style={{ backgroundImage: `url("${tips.ico}")` }} />
                <span className={styles.tipsText}>{tips.text}</span>
              </div>
            </div>
 
            {/* <div className={styles.reloadContainer}>
              <div className={styles.reloadWrapper} onClick={this.onReload}>
                <i className={styles.reloadIco} style={{ backgroundImage: `url("${icoReload}")` }} />
                <span className={styles.reloadTips}>刷新验证</span>
              </div>
            </div> */}
 
            <div className={styles.sliderWarpper} onMouseMove={(e)=>this.onMoving(e)} onMouseLeave={()=>this.onMoveEnd()}>
              <div className={styles.sliderBar}>{formatMessage(messages.sliderBtnTit)}</div>
              <div
                className={styles.sliderButton}
                onMouseDown={(e)=>this.onMoveStart(e)}
                onMouseUp={(e)=>this.onMoveEnd(e)}
                style={{ left: `${currX}px`, backgroundImage: `url("${icoSlider}")` }}
              />
            </div>
          </div>
        )
    }
}
 
export default ImageCode