/* eslint-disable import/no-unresolved */

import React, { PureComponent } from 'react';
import Dimensions from 'react-dimensions';
import { formatMessage, defineMessages } from 'umi/locale';
import { connect } from 'dva';
import { Tabs, BackTop } from 'antd';
import router from 'umi/router';
import cs from 'classnames';
import styles from './index.less';
import SelectPaper from './SelectPaper';
import MyPaper from './MyPaper';
import IconPro from '@/assets/icon_pro.png';
import Permission from '@/pages/Permission';

const { TabPane } = Tabs;

const messages = defineMessages({
  schoolpaper: { id: 'app.menu.papermanage.schoolpaper', defaultMessage: '校本资源' },
  paperManage: { id: 'app.menu.papermanage.paperManage', defaultMessage: '试卷管理' },
});

@connect(({ permission }) => ({
  defaultPermissionList: permission,
}))
class PaperManage extends PureComponent {
  state = {
    activeKey: '1',
    backTopRightStyle: null, // 返回顶部按钮style
    hoverBacktop: false, // 返回顶部 hover 状态
  };

  getBacktopTarget = () => {
    const backTopTarget = window;
    return backTopTarget;
  };

  // backtop hover 事件
  handleMouseHover = hover => {
    this.setState({
      hoverBacktop: hover,
    });
  };

  render() {
    const { activeKey, backTopRightStyle, hoverBacktop } = this.state;
    const { defaultPermissionList } = this.props;
    return (
      <div className={cs(styles['teacher-manager'], styles['teacher-examination'])}>
        <h1 className={styles.stylesName}>
          <span>{formatMessage(messages.schoolpaper)}&nbsp;/&nbsp;</span>
          {formatMessage({ id: 'app.teacher.home.paper.title', defaultMessage: '试卷库' })}
        </h1>
        <div className={styles.tabs}>
          <Tabs
            activeKey={activeKey}
            onChange={e => {
              if (defaultPermissionList && !defaultPermissionList.V_CUSTOM_PAPER) {
                // console.log('弹窗');
                Permission.open('V_CUSTOM_PAPER');
              } else {
                this.setState({ activeKey: e });
              }
            }}
          >
            <TabPane
              tab={formatMessage({ id: 'app.text.hearingThatDie', defaultMessage: '听说模考' })}
              key="1"
            />
            <TabPane
              tab={
                <span className={styles.proVersion}>
                  {defaultPermissionList && !defaultPermissionList.V_CUSTOM_PAPER && (
                    <img src={IconPro} alt="" />
                  )}
                  {formatMessage({ id: 'app.text.myGroup', defaultMessage: '我的组卷' })}
                </span>
              }
              key="2"
            />
          </Tabs>

          <span
            className={styles.right_text}
            onClick={() => {
              router.push({ pathname: `/papermanage/schoolpaperbag` });
            }}
          >
            {'查看试卷包 '}
            {' >'}
          </span>
        </div>
        {activeKey === '1' ? (
          <SelectPaper
            successCallback={() => {
              this.setState({ activeKey: '2' });
            }}
          />
        ) : (
          <MyPaper
            goSelectPaper={() => {
              this.setState({ activeKey: '1' });
            }}
          />
        )}

        {activeKey === '1' && (
          <BackTop
            style={backTopRightStyle}
            visibilityHeight={50}
            target={() => this.getBacktopTarget()}
          >
            <div
              className="backtop"
              onMouseEnter={() => this.handleMouseHover(true)}
              onMouseLeave={() => this.handleMouseHover(false)}
            >
              {!hoverBacktop && <i className="iconfont icon-top" />}
              {hoverBacktop && (
                <span className="text">
                  {formatMessage({ id: 'app.text.report.backtop', defaultMessage: '顶部' })}
                </span>
              )}
            </div>
          </BackTop>
        )}
      </div>
    );
  }
}

export default Dimensions({
  getHeight: () => {
    return window.innerHeight;
  },
  getWidth: () => {
    return window.innerWidth;
  },
})(PaperManage);
