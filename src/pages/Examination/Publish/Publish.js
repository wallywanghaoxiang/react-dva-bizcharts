import { Carousel } from 'antd';
import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage, defineMessages } from 'umi/locale';
import Dimensions from 'react-dimensions';
import cs from 'classnames';
import styles from './index.less';
import PublishCard from './components/PublishCard';
import taskIcon1hover from '@/assets/examination/task_icon_1_hover.png';
import taskIcon1 from '@/assets/examination/task_icon_1.png';
import taskIcon2hover from '@/assets/examination/task_icon_2_hover.png';
import taskIcon2 from '@/assets/examination/task_icon_2.png';
import taskIcon3hover from '@/assets/examination/task_icon_3_hover.png';
import taskIcon3 from '@/assets/examination/task_icon_3.png';
import taskIcon4Hover from '@/assets/examination/task_icon_4_hover.png';
import taskIcon4 from '@/assets/examination/task_icon_4.png';
import taskIcon5Hover from '@/assets/examination/task_icon_5_hover.png';
import taskIcon5 from '@/assets/examination/task_icon_5.png';
import taskTypeTitleBgLeft from '@/assets/examination/task_type_title_bg_left.png';
import taskTypeTitleBgRight from '@/assets/examination/task_type_title_bg_right.png';

const messages = defineMessages({
  choosetype: {
    id: 'app.examination.publish.choosetype',
    defaultMessage: '选择您要发布的考试或练习类型',
  },
});

@connect(({ dict }) => dict)
class inspect extends Component {
  state = {
    dataSource: [
      {
        title: formatMessage({ id: 'app.title.exam.publish.type1', defaultMessage: '本班考试' }),
        tip: formatMessage({
          id: 'app.text.exam.publish.type1.tip',
          defaultMessage: '组织我任教班级的考试',
        }),
        code: 'TT_1',
        isuse: true,
        img: taskIcon1,
        imghover: taskIcon1hover,
        content: [
          formatMessage({
            id: 'app.text.exam.publish.type1.content1',
            defaultMessage: '一场考试用三步操作完成',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type1.content2',
            defaultMessage: '支持口语开放性题型评测',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type1.content3',
            defaultMessage: '详尽的考后学情分析报告',
          }),
        ],
        permissionCode: 'V_SINGLE_CLASS_EXAM',
      },
      {
        title: formatMessage({ id: 'app.text.exam.publish.type2', defaultMessage: '多班联考' }),
        tip: formatMessage({
          id: 'app.text.app.text.exam.publish.type2.tip',
          defaultMessage: '协调非任教班级的考试',
        }),
        code: 'TT_3',
        isuse: true,
        img: taskIcon2,
        imghover: taskIcon2hover,
        content: [
          formatMessage({
            id: 'app.text.app.text.exam.publish.type2.content1',
            defaultMessage: '简化组织小型校内联考难度',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type2.content2',
            defaultMessage: '支持传统行政班制和走班制',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type2.content3',
            defaultMessage: '人工纠偏和趋势分析更细腻',
          }),
        ],
        permissionCode: 'V_MULTI_CLASS_EXAM',
      },
      {
        title: formatMessage({ id: 'app.title.exam.publish.type3', defaultMessage: '课堂练习' }),
        tip: formatMessage({
          id: 'app.text.exam.publish.type3.tip',
          defaultMessage: '组织我任教班级的训练',
        }),
        code: 'TT_2',
        isuse: true,
        img: taskIcon3,
        imghover: taskIcon3hover,
        content: [
          formatMessage({
            id: 'app.text.exam.publish.type3.content1',
            defaultMessage: '学生自由掌控训练过程',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type3.content2',
            defaultMessage: '实时的评测和结果分析',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type3.content3',
            defaultMessage: '课堂上可进行互动讲评',
          }),
        ],
        permissionCode: 'V_CLASSROOM_EXERCISES',
      },
      {
        title: formatMessage({ id: 'app.title.exam.publish.type4', defaultMessage: '课后训练' }),
        tip: formatMessage({
          id: 'app.text.exam.publish.type4.tip',
          defaultMessage: '组织我任教班级的训练',
        }),
        code: 'TT_5',
        isuse: true,
        img: taskIcon5,
        imghover: taskIcon5Hover,
        content: [
          formatMessage({
            id: 'app.text.exam.publish.type4.content1',
            defaultMessage: '支持两种模考训练方式',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type4.content2',
            defaultMessage: '实时的评测和结果分析',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type4.content3',
            defaultMessage: '支持智能口头布置模式',
          }),
        ],
        permissionCode: 'V_CLASS_AFTER_TRAINING',
      },
      {
        title: formatMessage({ id: 'app.title.exam.publish.type5', defaultMessage: '专项练习' }),
        tip: formatMessage({
          id: 'app.text.exam.publish.type5.tip',
          defaultMessage: '组织我任教班级的训练',
        }),
        isuse: false,
        img: taskIcon4,
        imghover: taskIcon4Hover,
        content: [
          formatMessage({
            id: 'app.text.exam.publish.type5.content1',
            defaultMessage: '针对薄弱知识的专项训练',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type5.content2',
            defaultMessage: '大数据驱动学科能力分析',
          }),
          formatMessage({
            id: 'app.text.exam.publish.type5.content3',
            defaultMessage: '不同学情学生的策略推荐',
          }),
        ],
        permissionCode: 'V_SPECIAL_TRAINING',
      },
    ],
    next: 0,
    settings: {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 5,
      slidesToScroll: 5,
      initialSlide: 0,
      beforeChange: (current, next) => {
        this.setState({ next });
      },
      responsive: [
        {
          breakpoint: 1600,
          settings: {
            slidesToShow: 4.5,
            slidesToScroll: 0.5,
          },
        },
        {
          breakpoint: 1500,
          settings: {
            slidesToShow: 3.5,
            slidesToScroll: 0.5,
          },
        },
        {
          breakpoint: 1400,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 1300,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
      ],
    },
  };

  componentWillMount() {
    localStorage.removeItem('publishReload');
    const { dispatch } = this.props;
    const { dataSource } = this.state;
    dispatch({
      type: 'dict/getDictionariesData',
      payload: { type: 'TASK_TYPE' },
    }).then((e = []) => {
      const arr = dataSource.map(item => {
        const { value } = e.find(params => params.code === item.code) || {};
        return {
          ...item,
          title: value,
        };
      });
      this.setState({ dataSource: arr });
    });
  }

  next = () => {
    this.slider.next();
  };

  previous = () => {
    this.slider.prev();
  };

  render() {
    const { dataSource, settings, next } = this.state;
    const { containerWidth } = this.props;
    // console.log("渲染",containerWidth);
    let divWidth = '1300px';
    let leftarrow = true;
    let rightarrow = true;

    const opacityArr = new Array(5);

    console.log(containerWidth);
    if (containerWidth >= 1500) {
      // 1600
      divWidth = '1300px';
      leftarrow = false;
      rightarrow = false;
    } else if (containerWidth >= 1500 && containerWidth < 1600) {
      divWidth = '1178px';
      // leftarrow = false;
      // rightarrow = false;
      if (next === 0.5) {
        rightarrow = false;
        opacityArr[0] = true;
      } else {
        leftarrow = false;
        opacityArr[4] = true;
      }
    } else if (containerWidth >= 1400 && containerWidth < 1500) {
      divWidth = '914px';
      // leftarrow = false;
      // rightarrow = false;
      // if(next === 1.5){
      if (next === 0.5) {
        rightarrow = false;
        opacityArr[0] = true;
      } else {
        leftarrow = false;
        opacityArr[3] = true;
      }
    } else if (containerWidth >= 1300 && containerWidth < 1400) {
      divWidth = '772px';
      // leftarrow = false;
      // rightarrow = false;
      // if(next === 2){
      if (next === 1) {
        rightarrow = false;
      } else {
        leftarrow = false;
      }
    } else if (containerWidth >= 900 && containerWidth < 1300) {
      divWidth = '508px';
      // if(next === 4){
      if (next === 2) {
        rightarrow = false;
      } else if (next === 0) {
        leftarrow = false;
      }
    } else if (containerWidth < 900) {
      divWidth = '244px';
      // if(next === 4){
      if (next === 3) {
        rightarrow = false;
      } else if (next === 0) {
        leftarrow = false;
      }
    }

    return (
      <div className={styles.layout}>
        <div className={styles.topflex}>
          <img src={taskTypeTitleBgLeft} alt="campusLogo" />
          <div className={styles.toptitle}>{formatMessage(messages.choosetype)}</div>
          <img src={taskTypeTitleBgRight} alt="campusLogo" />
        </div>
        <div
          className="divCarousel"
          id="divCarousel"
          style={{ position: 'relative', padding: '0px 40px', textAlign: 'center' }}
        >
          <div style={{ width: divWidth, margin: 'auto' }}>
            <Carousel
              {...settings}
              ref={slider => {
                this.slider = slider;
              }}
              key={containerWidth}
            >
              <PublishCard data={dataSource[0]} opacity={opacityArr[0]} />
              <PublishCard data={dataSource[1]} opacity={opacityArr[1]} />
              <PublishCard data={dataSource[2]} opacity={opacityArr[2]} />
              <PublishCard data={dataSource[3]} opacity={opacityArr[3]} />
              {/* <PublishCard data={dataSource[4]} opacity={opacityArr[4]}/> */}
            </Carousel>
          </div>
          <div style={{ textAlign: 'center' }}>
            {leftarrow && (
              <div onClick={this.previous} className={styles.left}>
                <i className={cs('iconfont', 'icon-previous')} style={{ fontSize: '20px' }} />
              </div>
            )}
            {rightarrow && (
              <div onClick={this.next} className={styles.right}>
                <i className={cs('iconfont', 'icon-next')} style={{ fontSize: '20px' }} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default Dimensions({
  getHeight: () => window.innerHeight,
  getWidth: () => window.innerWidth,
})(inspect);
