import React, { PureComponent } from 'react';
import { message } from 'antd';
//! TODO 动态引入组件方式 IE10 兼容性异常，暂时放弃 <https://github.com/umijs/umi/issues/3563>
// import UExamReport from '@/frontlib/register/UExamReport';
import UExamReport from '@/frontlib/components/UExamReport';
import constant from '@/frontlib/components/UExamReport/constant';

// const keys
const { SYS_TYPE } = constant;

/**
 * 统考报告入口
 * @author tina.zhang
 * @date   2019-9-2 11:00:53
 */
class UEReport extends PureComponent {
  constructor(props) {
    super(props);

    // TODO 根据当前教师角色区分报告类型
    //! 学科管理员  type = SYS_TYPE.CAMPUS
    //! 教师       type = SYS_TYPE.CLASS
    // // if (localStorage.isSubjectAdmin === 'true' || localStorage.isAdmin === 'true') {
    // //   this.reportType = SYS_TYPE.CAMPUS;
    // // } else {
    // //   this.reportType = SYS_TYPE.CLASS;
    // // }
    const { match } = this.props;
    const prams = localStorage.getItem('redirect_to_report_params');
    if (!prams) {
      message.error('参数异常 [redirect_to_report_params]');
      return;
    }
    const { taskId, type } = JSON.parse(localStorage.getItem('redirect_to_report_params'));
    if (match.params.taskId !== taskId) {
      message.error('参数异常 [redirect_to_report_params]');
      return;
    }
    switch (type) {
      case SYS_TYPE.CAMPUS:
        this.reportType = SYS_TYPE.CAMPUS;
        break;
      case SYS_TYPE.CLASS:
        this.reportType = SYS_TYPE.CLASS;
        break;
      default:
        // TODO 参数异常
        this.reportType = false;
        message.error('参数异常 [redirect_to_report_params]');
        break;
    }
  }

  // componentWillUnmount() {
  //   // 组件卸载，移除 localStorage 参数
  //   localStorage.removeItem('redirect_to_report_params');
  // }

  render() {
    const { match } = this.props;
    return (
      <>{this.reportType && <UExamReport taskId={match.params.taskId} type={this.reportType} />}</>
    );
  }
}
export default UEReport;
