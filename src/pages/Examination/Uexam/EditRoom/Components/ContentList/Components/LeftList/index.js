import React, { PureComponent, Fragment } from 'react';
import { Button, Divider, Input,Table ,Icon,AutoComplete} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './index.less';
import cs from 'classnames';
import { connect } from 'dva';
import CampusList from '../CampusList/index'
import { thisExpression } from '@babel/types';


/**
 * 考生编排/编排管理，左边学校选择栏
 * @author tina.zhang.xu
 * @date   2019-8-14
 * type true 编排管理，false 考试编排
 */

@connect(({ editroom, loading }) => ({
  examCampus: editroom.examCampus,
}))
class LeftList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
          activeCampusId:"",
          index:1,
          examCampusList:[],
          title:"",
        }
        this.list=[];

      }
    componentDidMount() {
      const {dispatch,examCampus,type,doing} = this.props;
      if(type){
        this.setState({
          title:doing?formatMessage({id:"app.text.jhz",defaultMessage:"进行中"}):formatMessage({id:"app.text.wwc",defaultMessage:"未完成"})
        })
      }

       this.init(examCampus);
    }
    componentWillReceiveProps(nextProps){
      if(nextProps.type){
        this.setState({
          title:nextProps.doing?formatMessage({id:"app.text.jhz",defaultMessage:"进行中"}):formatMessage({id:"app.text.wwc",defaultMessage:"未完成"})
        })
      }
      this.init(nextProps.examCampus);
    }

    componentWillUnmount(){
      const {dispatch,} = this.props;
      dispatch({
        type: 'editroom/clearAll',
        payload: {data:""}
      })
    }
    init=(examCampus)=>{
      this.list=examCampus;
      this.list.map((Item)=>{
        if(Item.finishNum==Item.studentNum){
          Item.finish="Y"
        }else{
          Item.finish="N"
        }
      })
      this.setState({
        examCampusList: this.list
      })
      if(this.state.activeCampusId===""){//默认打开选中第一个学校
        if(this.list&&this.list.length>0){
          this.selcetSchool(this.list[0].campusId)
        }
      }

    }
    // 选择后筛选学校，1全部 2未完成/进行中 3已完成
    select=(e)=>{
    let data=this.list;
    if(e!=1){
      data=this.list.filter(Item=>{
        return Item.finish==(e==3?"Y":"N");
      })
    }
     this.setState({
       index:e,
       examCampusList: data
     })
    }

    handleSearch=()=>{

    }


    selcetSchool=(campusId)=>{
      const { dispatch, match } = this.props;
      let data=this.list.find((Item)=>{
        return Item.campusId===campusId;
      })
      dispatch({
        type: 'editroom/updateCampusInfo',
        payload: {data:data}
      })
      this.setState({
        activeCampusId:campusId
      })
      this.getStudentList(campusId);
    }


  //109 学生列表
  getStudentList = (campusId) => {
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'editroom/getStudentList',
      payload: { 
        taskId:taskId,
        campusId:campusId,
        }
    })
  }

  //重新编排
  reEdit=id=>{
    const { dispatch, taskId } = this.props;
    dispatch({
      type: 'editroom/examArrangeRedo',
      payload: { 
        taskId:taskId,
        campusId:id,
        }
    })
    
  }

render() {
  const {activeCampusId,index,examCampusList,title}=this.state;
  return (
    <div className={styles.leftList}>
      <CampusList type={this.props.type} 
                  reEdit={this.reEdit}  
                  select={this.select} 
                  index={index} 
                  titleName={title}
                  campusList={examCampusList} 
                  activeCampusId={activeCampusId}  
                  onCampusSelect={this.selcetSchool} />
    </div>
  )
}
}

export default LeftList