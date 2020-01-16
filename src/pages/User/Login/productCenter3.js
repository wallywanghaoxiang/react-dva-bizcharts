import React, { Component } from 'react';
import { Divider } from 'antd';
import classNames from 'classnames';
import leftIcon from '@/assets/index_title_icon_left.png';
import rightIcon from '@/assets/index_title_icon_right.png';
import logo from '@/assets/productCenter/index_page_4_pic.png';
import styles from './productCenter3.less';

class ProductCenter3 extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { enter } = this.props;
    return (
      <div id={enter ? styles.enterName : ''} className={styles.productCenter3Container}>
        {/* 顶部信息  */}
        <div className={styles.top}>
          <img className={styles.leftIcon} src={leftIcon} alt="leftIcon" />
          <img className={styles.rightIcon} src={rightIcon} alt="rightIcon" />
          <span className={styles.title}>八大功能特色</span>
          <Divider type="vertical" />
          <span className={styles.subTitle}>助力教学智慧化管理</span>
        </div>
        <div className={styles.content}>
          <div className={classNames(styles.circularItem, styles.train)}>
            <div className={styles.function}>
              模考
              <br />
              训练
            </div>
            <div className={styles.description}>
              <div className={styles.descriptionTitle}>支持机房外的模考训练</div>
              <div className={styles.descriptionContent}>
                学生可以随时随地登录线上平台，查询考
                <br />
                试成绩和学情分析报告，还可以进行英语
                <br />
                听说模考训练。
              </div>
            </div>
          </div>
          <div className={classNames(styles.circularItem, styles.rectify)}>
            <div className={styles.function}>
              人工
              <br />
              纠偏
            </div>
            <div className={styles.description}>
              <div className={styles.descriptionTitle}>支持人工纠偏合理评分</div>
              <div className={styles.descriptionContent}>
                保障考试的评分更加满足考试组织方的
                <br />
                评分需求。
              </div>
            </div>
          </div>
          <div className={classNames(styles.circularItem, styles.paperGenerate)}>
            <div className={styles.function}>
              智能
              <br />
              组卷
            </div>
            <div className={styles.description}>
              <div className={styles.descriptionTitle}>支持智能灵活制卷组卷</div>
              <div className={styles.descriptionContent}>
                系统包含海量题库，老师 、教育主管机构
                <br />
                可自由选题，进行灵活组卷。
              </div>
            </div>
          </div>

          <div className={classNames(styles.circularItem, styles.classSystem)}>
            <div className={styles.function}>
              支持
              <br />
              走班制
            </div>
            <div className={styles.description}>
              <div className={styles.descriptionTitle}>支持走班制教学改革</div>
              <div className={styles.descriptionContent}>
                支持国家推行的走班制教学改革，灵活
                <br />
                配置行政班、教学班、学习组等信息。
              </div>
            </div>
          </div>
          <div className={classNames(styles.circularItem, styles.oneKeyTest)}>
            <div className={styles.function}>
              一键
              <br />
              检测
            </div>
            <div className={styles.description}>
              <div className={styles.descriptionTitle}>支持机房设备一键检测</div>
              <div className={styles.descriptionContent}>
                机房软、硬件一键检测，减少机房老师工
                <br />
                作量。
              </div>
            </div>
          </div>

          <div className={classNames(styles.circularItem, styles.comment)}>
            <div className={styles.function}>
              互动
              <br />
              讲评
            </div>
            <div className={styles.description}>
              <div className={styles.descriptionTitle}>支持现场互动讲评模式</div>
              <div className={styles.descriptionContent}>
                老师可以在机房内对试题进行分屏讲解，
                <br />
                课堂上可以及时讲解，边讲边练，提高
                <br />
                上课效率。
              </div>
            </div>
          </div>
          <div className={classNames(styles.circularItem, styles.instantUse)}>
            <div className={styles.function}>
              即建
              <br />
              即用
            </div>
            <div className={styles.description}>
              <div className={styles.descriptionTitle}>支持老师即建即用模式</div>
              <div className={styles.descriptionContent}>
                老师可在线上平台或教师机客户端创建
                <br />
                考试、练习任务，更加灵活便捷，适用
                <br />
                多种应用场景。
              </div>
            </div>
          </div>
          <div className={classNames(styles.circularItem, styles.score)}>
            <div className={styles.function}>
              实时
              <br />
              评分
            </div>
            <div className={styles.description}>
              <div className={styles.descriptionTitle}>支持实时评分模式</div>
              <div className={styles.descriptionContent}>
                学生练习过程中各类题型均可实时评分，
                <br />
                练习后可提供实时学情分析。
              </div>
            </div>
          </div>
        </div>
        {/* 底部logo */}
        <div className={styles.bottom}>
          <img src={logo} alt="" />
        </div>
      </div>
    );
  }
}

export default ProductCenter3;
