import React, { PureComponent } from 'react';
import { Progress } from 'antd';
import styles from './index.less';
import logo from '@/frontlib/assets/logo_center_box_page@2x.png';
import logo2 from '@/frontlib/assets/logo_inside@2x.png';

/**
 * 制作试卷头部
 */

export default class SiderMenu extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        const { coverRate } = this.props;
        return (
            <div className="logo" key="logo" style={window.ExampaperStatus === "EXAM" ? {} :{background: "#f5f5f5"}}>
        <div>
          <img src={window.ExampaperStatus === "EXAM" ? "http://res.gaocloud.local/logos/logo_top_bar@2x.png":logo2} alt="logo" style={window.ExampaperStatus === "EXAM" ? {width:310,height:26}:{width:166,height:44}}/>
        </div>
        <div>
          {/* <div className="flex">
            <div className="text">完成度</div>
            <Progress percent={coverRate} showInfo={false} />
            <div className="coverRate">{Math.floor(coverRate) + '%'}</div>
          </div>*/}
        </div>
      </div>
        );
    }
}