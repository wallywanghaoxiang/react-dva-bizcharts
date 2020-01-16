/* eslint-disable react/no-array-index-key */
import React, { Component } from 'react';
import Slider from 'react-slick';
import ProductTitle from './productTitle';
import pic1 from '@/assets/specialists/index_page_5_pic_1.png';
import pic2 from '@/assets/specialists/index_page_5_pic_2.png';
import pic3 from '@/assets/specialists/index_page_5_pic_3.png';
import pic4 from '@/assets/specialists/index_page_5_pic_4.png';
import pic5 from '@/assets/specialists/index_page_5_pic_5.png';
import styles from './productCenter5.less';

/**
 * 全场景介绍 第2屏
 * @param {boolean} enter - 进入页面
 */
class ProductCenter5 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: '0', // 当前活动的项
    };
    this.specialists = [
      {
        name: '张武保',
        protitle: '名誉院长/教授',
        photo: pic1,
        desc:
          '原广东外语外贸大学商务英语学院院长|MBA、商务英语硕士生导师|美国教授协会会员中国国际商务英语研究会副秘书长',
      },
      {
        name: '曾用强',
        protitle: '教授',
        photo: pic2,
        desc:
          '广东外语艺术职业学院院长|广东省政协委员|教育部大学英语教学指导委员会委员|中国英语教育研究会副会长|《中国英语能力等级量表》起草人之一',
      },
      {
        name: '曹国玲',
        protitle: '执行院长/导师',
        photo: pic3,
        desc:
          '现任广州高分说教育研究院执行院长|原广州市教育研究院中学英语教研员|广州市基础教育系统项目导师|曾主要负责了广州市的中小学英语课程改革、教材编制、课程实验、课堂教学评价',
      },
      {
        name: '龚亚夫',
        protitle: '中国教育科学研究院研究员',
        photo: pic4,
        desc:
          '中国教育学会外语教学专业委员会理事长|研究领域包括：<br />英语课程设计、英语教学评价等|曾参与教育部《九年义务初中英语教学大纲》，《高中英语教学大纲》以及现行《英语课程标准》的制定工作',
      },
      {
        name: '温宾利',
        protitle: '教授',
        photo: pic5,
        desc:
          '广东外语外贸大学教授、博士生导师|研究方向包括：<br />理论语言学，特别是语言共性、英汉句法对比等领域的研究|曾参与国家“九五”重点社科规划项目',
      },
    ];
  }

  componentDidMount() {
    const { activeIndex } = this.state;
    this.handleSliderChanged(null, activeIndex);
  }

  // 渲染滚动项
  renderSliderItems = () => {
    return this.specialists.map((s, idx) => {
      const descs = s.desc.split('|');
      return (
        <div key={`${idx}`} className={styles.sliderItem}>
          <div className={styles.photo}>
            <img src={s.photo} alt={s.name} />
          </div>
          <div className={styles.content}>
            <div className={styles.title}>
              <span className={styles.name}>{s.name}</span>
              <span className={styles.protitle}>{s.protitle}</span>
              {descs.map((desc, index) => {
                return <p key={`${index}`} dangerouslySetInnerHTML={{ __html: desc }} />;
              })}
            </div>
          </div>
          <div className="mask" />
        </div>
      );
    });
  };

  handleSliderChanged = (prevIndex, nextIndex) => {
    this.setState({
      activeIndex: nextIndex,
    });

    const sliderContainer = document.getElementById('sliderContainer');
    // 移除左二、右二class
    const left2Exists = sliderContainer.getElementsByClassName('left2');
    if (left2Exists && left2Exists.length > 0) {
      left2Exists[0].className = left2Exists[0].className.replace(' left2', '');
    }
    const right2Exists = sliderContainer.getElementsByClassName('right2');
    if (right2Exists && right2Exists.length > 0) {
      right2Exists[0].className = right2Exists[0].className.replace(' right2', '');
    }
    // next 项
    const current = sliderContainer.querySelector(`div[data-index='${nextIndex}']`);
    const left2 = current.previousElementSibling.previousElementSibling;
    const right2 = current.nextElementSibling.nextElementSibling;
    left2.className += ' left2';
    right2.className += ' right2';
  };

  render() {
    const { activeIndex } = this.state;
    const { enter } = this.props;
    return (
      <div className={styles.productCenter5Container}>
        <ProductTitle enter={enter} title="专家团队" subTitle="助力海量题库建设" />
        <div id="sliderContainer" className={styles.sliderContainer}>
          <Slider
            className={
              window.screen.height <= 768 ? styles.miniSpecialistsSlider : styles.specialistsSlider
            }
            centerMode
            infinite
            centerPadding="60px"
            slidesToShow={3}
            speed={200}
            draggable={false}
            currentSlide={activeIndex}
            afterChange={index => this.handleSliderChanged(0, index)}
          >
            {this.renderSliderItems()}
          </Slider>
        </div>
        <div className={styles.bottom}>
          Copyright © 2018 GaoCloud.com All Rights Reserved.
          <a
            target="_blank"
            href=" http://www.beian.miit.gov.cn/state/outPortal/loginPortal.action"
          >
            苏ICP备18063047号-1
          </a>
        </div>
      </div>
    );
  }
}

export default ProductCenter5;
