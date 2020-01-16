/**
 * 线上平台的，考试模式主入口
 * 1、获取url中的taskId值
 * 2、保证任务的唯一入口
 */
import React, { PureComponent } from "react";
import { connect } from "dva";
import { formatMessage } from 'umi/locale';
import Aside from "./Aside";
import styles from "./index.less";
import logoTopBar from "../assets/logo_center_box_page@2x.png";
import { countDown } from "@/utils/timeHandle";


@connect(({examBlock})=>{
  const { taskType, process, paperList, snapshotId } = examBlock;
  const { timing } = paperList.find(item=>item.snapshotId===snapshotId) || {};

  return {
    showCountDown : process==="inTask" && taskType === "practice",        // 是否显示倒计时
    timing                                                                // 计时器
  }
})
class Layout extends PureComponent{

  // 将计时数字显示为 mm:ss 的格式
  momentTime = ()=>{
    const { timing } = this.props;
    return countDown(timing);
  }

  render(){
    const { children, hasAside, showCountDown } = this.props;
    return (
      <div className={styles.body}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.logo} style={{ backgroundImage: `url(${logoTopBar})` }} />
            { showCountDown && <div className={styles['count-down']}>{formatMessage({id:"app.exam.totalTime",defaultMessage:"总用时"})}<span className={styles['count-time']}>{this.momentTime()}</span></div> }
          </div>
          <div className={styles.main}>
            {
              hasAside ? (
                <>
                  <div className={styles.left}><Aside /></div>
                  <div className={styles.right}>{children}</div>
                </>
              ):children
            }
          </div>
        </div>
      </div>
    );
  }

};

export default Layout;
