/**
 * 考试流程( 考试流程组合页 ：  包括 检测页、下载页、考试页、练习页、上传答案页、任务结束页   )
 * process: 任务注流程 deviceCheck:硬件检测状态，download:下载试卷 ，inTask: 任务中，upload: 上传答案包  endTask : 任务结束
 *
 *
 * props;
 *
 *
 */

import React, { Component } from 'react';
import { connect }   from "dva";
// import PropTypes     from 'prop-types';
import Layout        from "./Layout";
import tool          from "@/frontlib/utils/instructions";
import DeviceCheck   from "./DeviceCheck";
import Download      from "./Download";
import InTask        from "./InTask";
import Upload        from "./Upload";
import EndTask       from "./EndTask";

@connect(({examBlock})=>{
  const { process, taskType, envState } = examBlock;
  const { player, recorder } = envState;
  return {
    process,                 // 当前考试进度
    taskType,                 // 考试还是练习
    player,
    recorder
  }
})
class ExamBlock extends Component{

  // // props 验证过程 （ 重构的时候，依次来进行，任务过程的改写  ）
  // static propTypes={
  //   taskId      : PropTypes.string.isRequired,   // 任务ID
  //   process     : PropTypes.string.isRequired,   // 当前任务处于的状态
  //   taskType    : PropTypes.string,              // 任务的执行模式（ exam:考试模式，practice: 练习模式 ）
  //   paperList   : PropTypes.array,               // 试卷的数组列表
  //   onChange    : PropTypes.func,                // 状态发生改变的时候的回掉（下载、答题、上传的状态改变）
  //   className   : PropTypes.string,              // 考试组件主体样式

  // //  头部响应的内容
  // headerProps : PropTypes.share({
  //   icon      : PropTypes.node,      // 图标（可以是图片，也可以是react元素）
  //   titile    : PropTypes.string,    // 提示语（考试成功，考试失败等，自定义）
  //   exect     : PropTypes.node,      // 顶部右侧相关信息
  //   className : PropTypes.string,    // 自定义类
  //   replace   : PropTypes.element,   // 头部自定义替换组件
  // }),

  // // 右侧响应模块
  // asideProps : PropTypes.share({
  //   /**
  //    * 右侧显示的模式
  //    * card      : 学生卡片模式，需要info
  //    * directory : 题目目录模式
  //    * recall    : 回溯模式
  //    * custom    : 自定义
  //    */
  //   type : PropTypes.oneOf(['card','directory','recall','custom']),  // 右侧显示的模式
  //   cardInfo : PropTypes.share({
  //     title  : PropTypes.string,     // 卡片名称
  //     avatar : PropTypes.string,     // 头像
  //     infos  : PropTypes.arrayOf(PropTypes.share({
  //       key   : PropTypes.string,
  //       value : PropTypes.value,
  //     })),
  //   }),
  //   directory : PropTypes.share({
  //     onlyRead : PropTypes.bool,     // 只能显示，不能切题
  //   }),
  //   replace   : PropTypes.element,   // 右侧自定义替换组件
  // }),


  //   // 设备检测阶段的相关配置
  //   deviceCheckProps : PropTypes.shape({
  //     taskType   : PropTypes.string,              // 检测的模式(考试，还是练习)，同主对象中的taskType，未设置则取主对象的type
  //     onChange   : PropTypes.func,                // 设备检测的回掉 回调参数 running, success, failed
  //     checkItems : PropTypes.array,               // 如果 taskType === priactice, 显示要检测的内容['computerAi','microphone'，'earphone']
  //   }),

  //   // 试卷下载页面的相关配置
  //   downloadProps : PropTypes.shape({
  //     type : PropTypes.oneOf(['single','multiple','auto']), // 试卷下载页面的模式 single: 单试卷模式，（考中-考试模式，线上-课后训练）
  //        // 一般进入此页面，则主动下载。 multiple：多试卷下载页（考中-练习模式） auto: 自定义页面模式
  //     onChange   : PropTypes.func,                    // 下载状态的回掉 running, success, failed
  //     downloadFn : PropTypes.oneOfType([              // 试卷下载的方法
  //       // 字符串模式： 直接提供 models 的 effect 方法 例如："task/download"
  //       PropTypes.string,
  //       /**
  //       *  方法模式： 最好 提供promise 方法 如 dispatch
  //       *  例如 ：
  //       *  download=()=>{
  //       *     *
  //       *     return dispatch({type: "task/download", payload: params})
  //       *  }
  //       */
  //       PropTypes.func,
  //     ]).isRequired,
  //   }),

  //   // 在测试中的页面
  //   inTaskProps : PropTypes.shape({
  //     state      : PropTypes.oneOf(['play','pause','stop']),  // 答题的状态
  //     paperId    : PropTypes.string,                          // 试卷的id
  //     paperData  : PropTypes.object.isRequired,               // 试卷数据
  //     showData   : PropTypes.object.isRequired,               // 展示数据
  //     answerInfo : PropTypes.shape({                          // 当前的答题状态(时间、主进度、步骤、步骤时间)
  //       time     : PropTypes.number,                          // 记录时长
  //       step     : PropTypes.string,                          // 第几大题，第几中题，第几小题，已逗号分割
  //       stage    : PropTypes.oneOf(['read','listen','']),     // 答题阶段
  //       stageNumber : PropTypes.number,                       // 阶段的次数，如听录音的次数
  //       stageTime   : PropTypes.number,                       // 当前阶段的时间
  //     }),
  //     onProgress     : PropTypes.func,    // 题目答题的进度
  //     onAnswerChange : PropTypes.func,    // 每个小题答题完成的时候进行回调
  //     onStateChange  : PropTypes.func,    // 监听答题状态变更 play : 进行中； pause : 暂停； stop: 停止（ 如考中耳机掉落，进度暂停，手动结束 ）
  //     onComplete     : PropTypes.func     // 练习完成
  //   }),

  //   // 打包上传记得
  //   uploadProps : PropTypes.shape({
  //     onChange  : PropTypes.func,         // 上传状态的回调 running, success, failed
  //     uploadFn  : PropTypes.oneOfType([   // 试卷下载的方法
  //     /**
  //       * 字符串模式： 直接提供 models 的 effect 方法 例如："task/upload"
  //       *  方法模式： 最好 提供promise 方法 如 dispatch
  //       *  例如 ：
  //       *  upload=()=>{
  //       *     *
  //       *     return dispatch({type: "task/upload", payload: params})
  //       *  }
  //       */
  //       PropTypes.string,
  //       PropTypes.func,
  //     ]).isRequired,
  //   }),

  //   // 结束页面
  //   endTaskProps : PropTypes.shape({
  //     icon    : PropTypes.node,      // 图标（可以是图片，也可以是react元素）
  //     titile  : PropTypes.string,    // 提示语（考试成功，考试失败等，自定义）
  //     replace : PropTypes.element,   // 结束页面的替代页（可以自定义结束页）
  //   })

  // }

  // // 设置默认的值
  // static defaultProps={
  //   taskType     : "exam",
  //   studentInfo  : {},
  //   paperList    : [],
  //   deviceCheckProps : {},
  //   onChange     : ()=>{},
  //   downloadProps : {
  //     type : "single"
  //   },
  //   inTaskProps  : {},
  //   uploadProps  : {},
  //   endTaskProps : {}
  // }

  constructor(props){
    super(props);
    const { onLoad } = this.props;
    // 初始化 工具类
    tool.bind();
    // 由于公共组件是懒加载执行，故提供onLoad事件，进行回调
    if( typeof(onLoad) === "function" ){
      onLoad();
    }
  }

  componentDidMount(){
    // 监听耳机掉落事件
    tool.on("deviceStateChanged",this.deviceStateChanged);
  }

  shouldComponentUpdate( nextProps){
    // 当前页面 只有当 process 在修改
    const { process : newProcess } = nextProps;
    const { process : currProcess } = this.props;
    return  newProcess !== currProcess;
  }

  componentWillUnmount(){
    // 取消监听
    tool.remove("deviceStateChanged",this.deviceStateChanged);
    // 清除数据
    const { dispatch } = this.props;
    dispatch({ type : "examBlock/resetState" });
  }


  // 变更耳机变量
  deviceStateChanged= async ( obj, type )=>{
    const { dispatch } = this.props;
    const { recorder, player, recorderStatus } = obj;

    // 设备不在的时候停止录音
    if( !player || !recorder ){
      dispatch({ type : "examBlock/loseDevices" });
    }

    console.log("当前设备状态",obj);

    // 1、type ==== "auto" 如果，耳机变更事件是  由设备插拔发起的默认先将耳机，麦克风重置
    if( type === "auto" ){
      // 如果 recoder，player 都是true，先设置成false，在设备为true，目的是让设备检测捕获到 状态变更
      await dispatch({
        type : "examBlock/updateEnvStateState",
        payload : { recorder : false, player : false}
      });
      // 重新绑定工具类
      tool.bind();
      return;
    }

    // 2、type === "bind" 启用麦克风权限，引起的耳机状态变更( 可能成功，可能失败 )
    if( type === "bind" ){
      await dispatch({
        type : "examBlock/updateEnvStateState",
        payload : { recorder, player }
      });
      return;
    }

    // 3、 手动的强制去启用 耳机变更事件， 如 firefox，如果只授权一次，则拔掉耳机在插件没有任何回调事件，需手动点击重新检测后的相关操作
    if( type === "manual" ){
      if( player && recorderStatus === "noPower" ){
        // 如果没有录制权限，则重置。
        tool.bind();
      }
    }

  }

  /**
   * 选中要显示的步骤
   */
  switchProcess=()=>{
    const {
      process,
      taskType,
      downloadPaperProps={},
      deviceCheckProps={},
      inTaskProps={},
      uploadPaperProps={}
    } = this.props;

    console.log("当前页面：",process);

    const params = {
      hasAside : false,
      content  : null
    };

    // 根据不同的流程，选择不同的页面
    switch( process ){
      // 硬件检测页面
      case "deviceCheck" :
        params.hasAside = ( deviceCheckProps.taskType || taskType ) === "exam";
        params.content = <DeviceCheck taskType={taskType} {...deviceCheckProps} />;
        break;
      // 下载试卷页面
      case "download" :
        params.hasAside = taskType === "exam";
        params.content = <Download {...downloadPaperProps} />;
        break;
      // 任务主流程
      case "inTask" :
        params.hasAside = false;
        params.content = <InTask {...inTaskProps} />;
        break;
      // 上传试卷页面
      case "upload" :
        params.hasAside = taskType === "exam";
        params.content = <Upload {...uploadPaperProps} />;
        break;
      // 任务结束也
      case "endTask" :
        params.hasAside = taskType === "exam";
        params.content = <EndTask />;
        break;
      default :
        params.hasAside = false;
        params.content = null;
        break;
    }
    return params;
  }


  render(){
    // 流程页面
    const { hasAside, content } = this.switchProcess();
    return (
      <Layout hasAside={hasAside}>{content}</Layout>
    )
  }

}

export default ExamBlock;

