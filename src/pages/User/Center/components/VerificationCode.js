
/**
 * @name VerificationCode
 * @desc 验证
 * @author tina.zhang
 * @version 2019-03-26
 *

 */

import React from "react"


import styles from './index.less';

class VerificationCode extends React.Component {
  constructor() {
    super();
    this.state = { success: false };
  }

  querySelected = query => {
    return document.getElementsByClassName(query)[0];
  };

  // 二、给滑块注册鼠标按下事件
  btnDown = e => {
    // 按下时验证手机号是否正确
    this.props.validateMobile()
    if(this.props.errorInfo!==''||this.props.mobile==='') {
      return
    }
     
    const that = this;
    var box = this.querySelected('drag'), //容器
      bg = this.querySelected('bg'), //背景
      text = this.querySelected('text'), //文字
      btn = this.querySelected('btn'), //滑块
      success = false, //是否通过验证的标志
      distance = box.offsetWidth - btn.offsetWidth; //滑动成功的宽度（距离）
    console.log(box);
    // 1.鼠标按下之前必须清除掉后面设置的过渡属性
    btn.style.transition = '';
    bg.style.transition = '';
    // 说明：clientX 事件属性会返回当事件被触发时，鼠标指针向对于浏览器页面(或客户区)的水平坐标。
    // 2.当滑块位于初始位置时，得到鼠标按下时的水平位置
    var e = e || window.event;
    var downX = e.clientX;
    // 三、给文档注册鼠标移动事件
    document.onmousemove = ()=> {
      var e = e || window.event;
      // 1.获取鼠标移动后的水平位置
      const moveX = e.clientX;
      // 2.得到鼠标水平位置的偏移量（鼠标移动时的位置 - 鼠标按下时的位置）
      let offsetX = moveX - downX;
      // 3.在这里判断一下：鼠标水平移动的距离 与 滑动成功的距离 之间的关系
      if (offsetX > distance) {
        offsetX = distance; // 如果滑过了终点，就将它停留在终点位置
      } else if (offsetX < 0) {
        offsetX = 0; // 如果滑到了起点的左侧，就将它重置为起点位置
      }

      // 4.根据鼠标移动的距离来动态设置滑块的偏移量和背景颜色的宽度
      btn.style.left = offsetX + 'px';
      bg.style.width = offsetX + 'px';

      // 如果鼠标的水平移动距离 = 滑动成功的宽度
      if (offsetX === distance) {
        // 1.设置滑动成功后的样式
        text.innerHTML = '验证通过';
        text.style.color = '#fff';
        btn.innerHTML = '&radic;';
        btn.style.color = 'green';
        bg.style.backgroundColor = 'lightgreen';

        // 2.设置滑动成功后的状态
        success = true;
        // 成功后，清除掉鼠标按下事件和移动事件（因为移动时并不会涉及到鼠标松开事件）
        document.onmousemove = null;
        // 3.成功解锁后的回调函数
        setTimeout(()=> {
           that.props.onMatch();
        }, 500);
        setTimeout(()=> {
          // 1.设置滑动成功后还原的样式
          text.innerHTML = '向右拖动滑块，获取验证码';
          text.style.color = '#666';
          btn.innerHTML = '<i className="iconfont icon-next"/>';
          btn.style.color = '#666';
          bg.style.backgroundColor = '';
          btn.style.left = 0;
          bg.style.width = 0;
        }, 2000);
      }
    };
    this.setState({
      success,
    });
  };

  // 四、给文档注册鼠标松开事件

  btnUp = () => {
    const bg = this.querySelected('bg');// 背景
    const btn = this.querySelected('btn'); // 滑块
    // 如果鼠标松开时，滑到了终点，则验证通过
    const {success} = this.state;
    if (success) {
      this.props.onMatch()
      return;
    } 
      // 反之，则将滑块复位（设置了1s的属性过渡效果）
      btn.style.left = 0;
      bg.style.width = 0;
      btn.style.transition = 'left 1s ease';
      bg.style.transition = 'width 1s ease';
    
    // 只要鼠标松开了，说明此时不需要拖动滑块了，那么就清除鼠标移动和松开事件。
    document.onmousemove = null;
  };

  render() {
    return (
      <div className="drag">
        <div className="bg" />
        <div className="text">向右拖动滑块拼图，获取验证码</div>
        <div className="btn" onMouseDown={e => this.btnDown(e)} onMouseUp={e => this.btnUp(e)}>
         <i className="iconfont icon-next" />
        </div>
      </div>
    );
  }
}
export default VerificationCode;
