import React, { PureComponent } from 'react';
import Link from 'umi/link';
import { Icon, Popover, List } from 'antd';
import emitter from '@/utils/ev';
import Debounce from 'lodash-decorators/debounce';
import styles from './index.less';
import RightContent from './RightContent';


export default class GlobalHeader extends PureComponent {
  constructor(props) {
    super(props);
    const defaultCampusName = localStorage.getItem('campusName');
    this.state = {
      campusName: defaultCampusName,
      campusListViewOpen: false,
    };
  }

  componentDidMount() {

    // 站内信，非本小区信息，切换校区广播监听
    this.eventEmitter = emitter.on('switchCampusByNotice', this.listenerSwitchCampusByNotice);

  }

  componentWillReceiveProps(nextProps) {
    const { campusID } = nextProps;
    const { props } = this;
    if (campusID !== props.campusID) {
      // console.log('校区发生了变化')
      this.setState({
        campusName: localStorage.getItem('campusName')
      })
    }
  }

  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
    emitter.removeListener('switchCampusByNotice', this.listenerSwitchCampusByNotice);
  }

  // 站内信，非本小区信息，切换校区广播监听
  listenerSwitchCampusByNotice = () => {
    this.setState({
      campusName: localStorage.getItem('campusName')
    })
  }

  /* eslint-disable*/
  @Debounce(600)
  triggerResizeEvent() {
    // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
    this.triggerResizeEvent();
  };

  // 校区切换
  handleCampusChange = (value, campusId, userName, tenantId, isAdmin, isSubjectAdmin) => {
    const { props } = this;
    props.onChangeCampus(value, campusId, userName, tenantId, isAdmin, isSubjectAdmin);
  };

  clickItem = (item) => {
    this.handleCampusChange(item.teacherId, item.campusId, item.name, item.tenantId, item.isAdmin, item.isSubjectAdmin);
    this.setState({
      campusName: item.campusName,
    });
    localStorage.setItem('campusName', item.campusName);
  }

  render() {
    const { collapsed, isMobile, logo, campusList, dispatch } = this.props;
    const { campusName, campusListViewOpen } = this.state;
    // console.log(campusList)
    if (campusList.length > 0) {

      const campusId = localStorage.getItem('campusId');
      const { campusList } = this.props;
      const hasCampus = campusList.filter(vo => vo.campusId === campusId)
      // console.log(hasCampus)
      if (hasCampus.length === 0) {
        this.handleCampusChange(campusList[0].teacherId, campusList[0].campusId, campusList[0].name, campusList[0].tenantId || '', campusList[0].isAdmin, campusList[0].isSubjectAdmin);
        this.setState({
          campusName: campusList[0].campusName,
        });
        localStorage.setItem('campusName', campusList[0].campusName);
      }
    }
    const text = (<div className="campusList-view">
      <List
        dataSource={campusList}
        renderItem={item => (<List.Item onClick={() => this.clickItem(item)} key={item.teacherId}>{item.campusName}</List.Item>)}
      />

    </div>)
    return (
      <div className={styles.header}>
        {isMobile && (
          <Link to="/" className={styles.logo} key="logo">
            <img src={logo} alt="logo" width="32" />
          </Link>
        )}
        <span className="iconfont icon-nav trigger" onClick={this.toggle}>
          {/* <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} /> */}
        </span>
        {campusList && campusList.length > 0 ? (
          <Popover placement="bottom" content={text}
            overlayClassName={styles.schoolList} className={styles.campus}
          >
            <span className={styles.campusName}>{campusName}</span>
            <Icon type="down" />
          </Popover >
        ) : null}
        <RightContent {...this.props} />
      </div>
    );
  }
}
