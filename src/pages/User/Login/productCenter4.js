import React, { Component } from 'react';
import { Icon, Divider } from 'antd';
import styles from './productCenter4.less';

/**
 * 服务案例 第4屏
 * @param {boolean} enter - 进入页面
 */
class ProductCenter4 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      containerWidth: 0,
      locations: [
        { name: '北京', top: '39%', left: '68.8%' },
        { name: '上海', top: '61.4%', left: '77.8%' },
        { name: '广东', top: '83.4%', left: '67%' },
        { name: '湖北', top: '63%', left: '65%' },
        { name: '重庆', top: '65%', left: '57.6%' },
        { name: '陕西', top: '53%', left: '59%' },
        { name: '天津', top: '36.5%', left: '70%' },
        { name: '江苏', top: '52%', left: '75%' },
        { name: '辽宁', top: '27%', left: '76.5%' },
        { name: '山东', top: '40.5%', left: '73.5%' },
      ],
    };
  }

  componentDidMount() {
    this.calcWH();
    window.addEventListener('resize', this.calcWH);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.calcWH);
  }

  // 计算宽高
  calcWH = () => {
    const { clientWidth, clientHeight } = document.body;
    const height = (1000 / 1566) * clientWidth;
    if (height >= clientHeight) {
      // 通过高度计算宽度
      const width = clientHeight / (1000 / 1566);
      this.setState({
        containerWidth: width,
      });
    }
  };

  render() {
    const { enter } = this.props;
    const { locations, containerWidth } = this.state;
    return (
      <div id={enter ? styles.enterName : ''} className={styles.productCenter4Container}>
        <div
          className={styles.mapContainer}
          style={{ width: containerWidth > 0 ? containerWidth : '90%' }}
        >
          <div className={styles.content}>
            <div className={styles.textbox}>
              <p>
                苏州智慧数析信息科技有限公司帮助多所学校搭建了高耘英语听说模拟训练考试软件系统，改善了英语听说教学质量，提升了学生的英语听力口语能力，得到了老师和学生们的一致好评，并入选了《校园好方案》优秀应用案例。
              </p>
              <Divider type="horizontal" />
              <Icon type="environment" />
              &nbsp;&nbsp;北京&nbsp;&nbsp;上海&nbsp;&nbsp;广东&nbsp;&nbsp;湖北&nbsp;&nbsp;重庆&nbsp;&nbsp;陕西&nbsp;&nbsp;天津&nbsp;&nbsp;江苏&nbsp;&nbsp;辽宁&nbsp;&nbsp;山东
            </div>
            {locations.map(v => {
              return (
                <div key={v.name} className={styles.locate} style={{ top: v.top, left: v.left }} />
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default ProductCenter4;
