import React, { Component } from 'react';
import { Table,Tooltip,Spin  } from 'antd';
import { connect } from "dva";
import { formatMessage, defineMessages } from 'umi/locale';
import cs from 'classnames';
import styles from './index.less';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import Pagination from '@/components/Pagination/index';
import { MatchUnitType } from '@/frontlib/utils/utils';
import StepBottom from '../components/StepBottom'
import router from 'umi/router';
import TeacherAvatar from '../components/TeacherAvatar';
import { showTime } from "@/utils/timeHandle";


const messages = defineMessages({
    backBtnTit:{id:'app.examination.inspect.task.detail.back.btn.title',defaultMessage:'返回'},
    setting:{id:'app.examination.inspect.task.detail.exam.setting.title',defaultMessage:'考试设置'},
    teacher:{id:'app.examination.inspect.task.detail.exam.teacher.title',defaultMessage:'代课教师'},
    examClass:{id:'app.examination.inspect.task.detail.exam.class.title',defaultMessage:'考试班级'},
    examPaper:{id:'app.examination.inspect.task.detail.exam.paper.title',defaultMessage:'考试试卷'},
    distModeTit:{id:'app.examination.inspect.task.detail.dist.mode.title',defaultMessage:'分发试卷方式：'},
    examStrategy:{id:'app.examination.inspect.task.detail.exam.strategy.title',defaultMessage:'考试策略：'},
    manualRectification:{id:'app.examination.inspect.task.detail.manual.rectification.title',defaultMessage:'人工纠偏：'},
    checkBtnTit:{id:'app.examination.inspect.task.detail.check.btn.title',defaultMessage:"查看参加考试学生"},
    checkBtnTit1:{id:'app.examination.inspect.task.detail.check.btn.title1',defaultMessage:"收起"},
    grade:{id:'app.grade',defaultMessage:"适用范围"},
    time:{id:'app.examination.inspect.task.detail.time',defaultMessage:"时长"},
    fullmark:{id:'app.examination.inspect.task.detail.full.mark',defaultMessage:"总分"},
    paperTemplate:{id:'app.examination.inspect.task.detail.paper.template',defaultMessage:"试卷结构"},
    studentCode:{id:'app.examination.inspect.task.detail.student.code',defaultMessage:"考号"},
    classNum:{id:'app.examination.inspect.task.detail.class.number',defaultMessage:"班序"},
    classInCode:{id:'app.examination.inspect.task.detail.class.in.code',defaultMessage:"班内学号"},
    name:{id:'app.examination.inspect.task.detail.student.name',defaultMessage:"姓名"},
    gender:{id:'app.examination.inspect.task.detail.student.gender',defaultMessage:"性别"},
    className:{id:'app.examination.inspect.task.detail.class.name',defaultMessage:"班级"},
    borrowing:{id:'app.examination.inspect.task.detail.student.borrowing',defaultMessage:"是否借读"},
    examPersonNum:{id:'app.examination.inspect.task.detail.student.exam.number',defaultMessage:'应考人数'},
    preview:{id:'app.examination.inspect.task.detail.preview',defaultMessage:"预览"},
    minute:{id:'app.examination.inspect.paper.minute',defaultMessage:"分钟"},
    mark:{id:'app.examination.inspect.paper.mark',defaultMessage:"分"},
})



@connect(({ release,loading }) => ({
  data :release.publishSaveData ,
  rectify:release.rectify,
  distribution:release.distribution,
  strategy:release.strategy,
  taskType:release.taskType,
  publishSaveData:release.publishSaveData,
  classList:release.classList,
  choosedNum:release.choosedNum,
  fetchSaveTasking:loading.effects['release/fetchSaveTask']||false,
}))
/**
 *  type: public(发布)、inspect(检查)
 *
 * @author tina.zhang
 * @date 2019-04-18
 * @class ExamTaskDetail
 * @extends {Component}
 */
class ExamTaskDetail extends Component {
  columns = [
    {
      title: (<span className={styles.studentCode}>{formatMessage(messages.studentCode)}<Tooltip title={`${formatMessage(messages.classNum)}+${formatMessage(messages.classInCode)}`}><i className="iconfont icon-info" /></Tooltip></span>),
      dataIndex: 'examNo',
      key: 'examNo',
      width:'17%'
    },
    {
      title: formatMessage(messages.name),
      dataIndex: 'studentName',
      key: 'studentName',
      width:'17%',
      render:(item)=>{
        return <div title={item.length>4 && item} className={styles.studentName}>{item}</div>
      }
    },
    {
      title: formatMessage(messages.gender),
      dataIndex: 'gender',
      key: 'gender',
      width:'17%',
      render:(item)=>{
        return <div>{item === "MALE" ? formatMessage({id:"app.text.classManage.sex.male",defaultMessage:"男"}):formatMessage({id:"app.text.classManage.sex.female",defaultMessage:"女"}) }</div>
      }
    },
    {
      title: formatMessage(messages.className),
      dataIndex: 'className',
      key: 'className',
      width:'17%',
      render:(item)=>{
        return <div title={item.length>7 && item} className={styles.studentName}>{item}</div>
      }
    },
    {
      title: formatMessage(messages.borrowing),
      dataIndex: 'isTransient',
      key: 'isTransient',
      width:'17%',
      render:(item)=>{
        return <div>{item === "Y" ? formatMessage({id:"app.menu.learngroup.jiedu",defaultMessage:"借读"}):"" }</div>
      }
    },
    {
      title: '',
      dataIndex: 'status',
      key: 'status',
      width:'15%',
      render:(item)=>{
        return <div>{item === "Y" ? formatMessage({id:"app.examination.inspect.student.join.exam",defaultMessage:"参加"}):formatMessage({id:"app.examination.inspect.student.no.join.exam",defaultMessage:"不参加"}) }</div>
      }
    },
  ];

    state = {
      collapse:true,
      total:0,
      pageIndex:1,
      studentsList:[], // 参考学生
      examStudents:[],
    };

    componentDidMount() {
        const{data,classList} = this.props;
        if(classList.length == 0){
          router.push(`/examination/publish/step`);
        }else{
          let studentsList = [];
          if(data.classList){
            for(let i in data.classList){
              for(let n in data.classList[i].studentList){
                data.classList[i].studentList[n].className = data.classList[i].className
              }
              studentsList = studentsList.concat(data.classList[i].studentList)
            }
          }

          this.setState({
            examStudents:studentsList,
            studentsList:studentsList.slice(0,20),
          });
        }
    }

    clickBack = () => {
        const {parentProps} = this.props;
        const { history } = parentProps;
        history.goBack();
    }

    // 查看学生
    checkStudent = () => {
      const { collapse } = this.state;

      this.setState({
        collapse: !collapse
      })
    }

    onPageChange = (e) => {
      const { examStudents } = this.state;
      const endIdx = e * 20;
      const startIdx = (e -1) * 20;
      const list = examStudents.slice(startIdx,endIdx);
      this.setState({
        pageIndex: e,
        studentsList:list
      })
    }

    switchType(value = "",data){
        let alltypes = value.split(",");
        let alltypesValue = [];

        for(let n in data){
          for(let i in alltypes){
              if(data[n].code === alltypes[i]){
                alltypesValue.push(data[n].value)
              }
          }
        }

        return alltypesValue.join("|")
    }

    render() {
        const { collapse,studentsList,pageIndex,total,examStudents } = this.state;
        const { columns } = this;
        const { type,data = {},strategy,rectify,distribution,taskType ,fetchSaveTasking,choosedNum} = this.props;
        let subTeacher = {};
        if(data.teacher){
          for(let i in data.teacher){
            if(data.teacher[i].type === "SUB"){
              subTeacher = data.teacher[i];
            }
          }
        }
        return (
          <PageHeaderWrapper wrapperClassName="wrapperMain">
            <Spin delay={500} spinning={fetchSaveTasking}>
            <div className={styles.detailCont}>
              {/* 标题 */}
              <div className={styles.title}>
                {data.name}
              </div>
              {/* 考试设置 练习模式下不显示 */}
              {data.type !== 'TT_2' &&
              <div className={styles.item}>
                <div className={styles.itemTit}>{formatMessage(messages.setting)}</div>
                <div className={cs(styles.itemContent,styles.examSetting)}>
                  <div className={styles.settingItem}>
                    <span className={styles.setTit}>{formatMessage(messages.distModeTit)}</span>
                    <span className={styles.setCont}>{(this.switchType(data.distributeType,distribution))}</span>
                  </div>
                  <div className={styles.settingItem}>
                    <span className={styles.setTit}>{formatMessage(messages.examStrategy)}</span>
                    <span className={styles.setCont}>{(this.switchType(data.examType,strategy)) || "无"}</span>
                  </div>
                  <div className={styles.settingItem}>
                    <span className={styles.setTit}>{formatMessage(messages.manualRectification)}</span>
                    <span className={styles.setCont}>{(this.switchType(data.rectifyType,rectify)) }</span>
                  </div>
                </div>
              </div>
              }

              {/* 代课老师 */}
              {subTeacher && subTeacher.teacherName && subTeacher.type === "SUB"&&
                <div className={styles.item}>
                  <div className={styles.itemTit}>{formatMessage(messages.teacher)}</div>
                  <div className={cs(styles.itemContent,styles.examSetting)}>
                    <div className="teacherAvatar">
                      <TeacherAvatar
                        selectedTeacher={subTeacher}
                        noclosed = {true}
                        onDel = {(e)=>{
                          dispatch({
                            type: 'release/saveTeacherInfo',
                            payload: {}
                          })
                        }}
                      />
                    </div>
                  </div>
                </div>
              }

              {/* 考试班级 */}
              <div className={styles.item}>
                <div className={styles.itemTit}>{data.type !== 'TT_2' ? formatMessage(messages.examClass) : formatMessage({id:"app.title.theTrainingClass",defaultMessage:"训练班级"})}</div>
                <div className={cs(styles.itemClass,styles.examClass)}>
                  <div className={styles.classList}>
                    {data.classList && data.classList.map(it => {
                      return <span style={{paddingRight:'20px'}} key={it.classId}>{it.className || it.name}</span>
                     })
                    }
                  </div>
                  <div className={styles.checkStudent}>
                    <div className={styles.checkBtn} onClick={this.checkStudent}>{collapse?formatMessage(messages.checkBtnTit):formatMessage(messages.checkBtnTit1)}</div>
                  </div>
                </div>
              </div>
              {/* 考试学生 */}
              {collapse?null:<div className={styles.studentTable}>
                <Table columns={columns} dataSource={studentsList} bordered pagination={false} />
                <div className={styles.bottom}>
                  <div>
                    <span className={styles.setTit}>{formatMessage(messages.examPersonNum)}：</span>
                    <span className={styles.setCont}>{choosedNum}</span>
                  </div>
                  <div>
                    <Pagination
                      current={pageIndex}
                      pageSize={20}
                      total={examStudents.length}
                      onChange={this.onPageChange}
                    />
                  </div>
                </div>
              </div>}

              {/* 考试试卷 */}
              <div className={styles.item}>
                <div className={styles.itemTit} style={{color:"#333"}}>{data.type !== 'TT_2' ? formatMessage(messages.examPaper) : formatMessage({id:"app.text.excrisepaper",defaultMessage:"训练试卷"})}</div>
                <div className={styles.itemContent} style={{height:"auto"}}>
                  {
                      data.paperList && data.paperList.map(item => {
                          return <div className={styles.paper}>
                            <div className={cs(styles.left,styles.setTit)}>
                              {item.name}
                              {type === 'inspect' &&
                              <span className={styles.preview}>
                                <i className="iconfont icon-eye" />
                                <span style={{paddingLeft:'6px'}}>{formatMessage(messages.preview)}</span>
                              </span>
                              }

                            </div>
                            <div className={styles.right}>

                              <div className={styles.rightItem}>
                                <span className={styles.setTit}>{formatMessage(messages.fullmark)}：</span>
                                <span className={styles.setCont}>{`${item.fullMark}${formatMessage(messages.mark)}`}</span>
                              </div>
                              <div className={styles.rightItem}>
                                <span className={styles.setTit}>{formatMessage(messages.time)}：</span>
                                <span className={styles.setCont}>{showTime(item.paperTime,"s")}</span>
                              </div>
                              <div className={styles.rightItem}>
                                <span className={styles.setTit}>{formatMessage(messages.grade)}：</span>
                                <span className={styles.setCont}>{MatchUnitType(item)}</span>
                              </div>
                              <div>
                                <span className={styles.setTit}>{formatMessage(messages.paperTemplate)}：</span>
                                <span className={styles.setCont}>{item.templateName}</span>
                              </div>
                            </div>
                          </div>
                      })
                  }

                </div>
              </div>


            </div>
            <div className="releaseStep" style={{minHeight:"60px"}}>
              <StepBottom
                prevText = {formatMessage({id:"app.button.exam.publis.last.step",defaultMessage:"上一步"})}
                nextText ={formatMessage({id:"app.button.exam.publish.task.title",defaultMessage:"发布任务"})}
                prev = {()=>{ router.push(`/examination/publish/selectpaper/`+taskType); }}
                disabled = {fetchSaveTasking}
                next = {() => {
                  const{dispatch,publishSaveData} = this.props;

                  dispatch({
                    type: 'release/fetchSaveTask',
                    payload: publishSaveData,
                  }).then((e)=>{
                    const { responseCode, data } = e;
                    if( responseCode !== "200"|| data==null){
                      return
                    } else{
                      router.push(`/examination/inspect`);
                    }
                  });
                }}
              />
            </div>
            </Spin>
          </PageHeaderWrapper>
        )
    }
}

export default ExamTaskDetail
