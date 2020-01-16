/**
 * 线上平台的，考试模式主入口
 * 1、获取url中的taskId值
 * 2、保证任务的唯一入口
 */
import React, { PureComponent } from "react";
import { Spin } from "antd";
import router from 'umi/router';
import pathToRegexp from 'path-to-regexp';
import { connect } from "dva";
import DocumentTitle from 'react-document-title';
import getPageTitle from '@/utils/getPageTitle';
import styles from "./index.less";
import logoTopBar from "./assets/logo_center_box_page@2x.png";

@connect(({loading,task,menu})=>{
  const { paperList=[], currentPaperId, } = task;
  const { examStatus } = paperList.find(item=>item.paperId===currentPaperId) || {};
  return {
    initTask : loading.effects["task/initTask"],  // 获取任务详情loading
    examStatus,                                    // 学生答题状态
    breadcrumbNameMap: menu.breadcrumbNameMap
  }
})
class Task extends PureComponent{

  state = {
    hasLoad : false   // 是否已经初始化
  }

  componentDidMount(){

    // 第一次进入页面，（非/task）默认重定向到 /task/${taskid} 页面
    const { location : { pathname }, match: { params : { taskId } } , dispatch } = this.props;
    if( !pathToRegexp("/task/:taskId").test(pathname) ){
      router.push(`/task/${taskId}`);
    }

    // 初始化
    dispatch({
      type    : "task/initTask",
      payload : taskId
    }).then(()=>{
      this.setState({hasLoad:true});
      const { examStatus } = this.props;
      if( ["ES_3","ES_4"].includes(examStatus) ){
        // 如果考试完成--跳转到结果页
        router.push(`/task/${taskId}/result`);
      }
    });

  }

  componentWillUnmount(){
    // 离开页面，对任务进行欢迎
    const { dispatch } = this.props;
    dispatch({ type    : "task/resetState" })
  }



  render(){
    const { hasLoad } = this.state;
    const { children, initTask, location : { pathname }, breadcrumbNameMap } = this.props;
    let tpl = null;

    if( !hasLoad ){
      tpl = null;
    }else if( pathToRegexp("/task/:taskId/progress").test(pathname) ){
      // 如果匹配的考中流程中，则直接显示children
      tpl = children;
    }else{
      // 主体内容
      tpl = (
        <div className={styles.body}>
          <div className={styles.content}>
            <div className={styles.header}>
              <div className={styles.logo} style={{ backgroundImage: `url(${logoTopBar})` }} />
            </div>
            <Spin spinning={initTask} wrapperClassName={styles.main}>
              { children}
            </Spin>
          </div>
        </div>
      );
    }

    // 否则显示内容
    return <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>{tpl}</DocumentTitle>
  }

}

export default Task;
