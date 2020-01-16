import React, { Component } from 'react';
import { Modal, Table, message,Tooltip } from 'antd';
import styles from './index.less';
import { formatMessage, FormattedMessage, defineMessages } from 'umi/locale';
import right_icon from '@/frontlib/assets/qus_right_icon.png';
import AutoPlay from '@/frontlib/components/ExampaperProduct/Components/AutoPlay';
import managerIcon from '@/frontlib/assets/MissionReport/manager.png';

/**
 * 学生列表
 */
class AddTableListModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible:true,
      oralVisible: false,
      studentData: [],
      columns:[],
      leftindex:0,
      upindex:0,
      tokenId:"",
    };
  }



  componentDidMount() {
    const {dataSource,type}=this.props;
    //选择题
    this.setState({
      oralVisible:false
    })
    if(dataSource){
      switch(type){
        case "CHOICE":
            this.getChoiceGap(formatMessage({id:"app.text.xx",defaultMessage:"选项"}));
            break;
        case "GAP_FILLING":
            this.getChoiceGap(formatMessage({id:"app.text.xsda",defaultMessage:"学生答案"}));
            break;
        case "CLOSED_ORAL":
        case "OPEN_ORAL":
        case "HALF_OPEN_ORAL":{
          this.setState({
            oralVisible:true
          })
        }
        break;
      }
    }
  }


  scoreMatch =(list)=>{
    //将"[0.80,0.90)"转换成 data=["[",0.80,0.90,")"]
    if(list.length>0){
      const  result= list.map((temp)=>{
      let item=temp.answer;
      let answerFit='';
      item=item.slice(0, 1) + "," + item.slice(1);
      item=item.slice(0, -1) + "," + item.slice(-1);
      let data=item.split(",");
      if(data[0]=="["){
        if(data[3]=="]"){
          if(Number(data[1])===Number(data[2])){
            answerFit =`${formatMessage({id:"app.text.df",defaultMessage:"得分"})}=${Number(data[1])}`;
          }
          if(Number(data[1])<Number(data[2])){
            answerFit =`${Number(data[2])}≥${formatMessage({id:"app.text.df",defaultMessage:"得分"})}≥${Number(data[1])}`;
          }
        }else if(data[3]==")"){
          if(Number(data[1])<Number(data[2])){
            answerFit =`${Number(data[2])}>${formatMessage({id:"app.text.df",defaultMessage:"得分"})}≥${Number(data[1])}`;
          }
        }
      }else if(data[0]=="("){
        if(data[3]=="]"){
          if(Number(data[1])<Number(data[2])){
            answerFit =`${Number(data[2])}≥${formatMessage({id:"app.text.df",defaultMessage:"得分"})}>${Number(data[1])}`;
          }
        }else if(data[3]==")"){
          if(Number(data[1])<Number(data[2])){
            answerFit =`${Number(data[2])}>${formatMessage({id:"app.text.df",defaultMessage:"得分"})}>${Number(data[1])}`;
          }
        }
      }
      return {
        ...temp,
        answerFit,
      };

      })
     return result;
    }
    return [];
    
  }

  onHandleCancel = () => {
    this.setState({
      visible: false,
    });
    this.props.onClose();
  };
  onHandleOK = () => {
    this.setState({
      visible: false,
    });

    this.props.onClose();
  };


//选择题和填空题
getChoiceGap(text){
    const {dataSource, choiceList:num, rightChoice}=this.props;
    let a=[];
    let list = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let newDataSource = dataSource;
    for(let j= 0;j<num; j++) {
      let is = false;
      for(let k = 0; k< newDataSource.length; k++) {
          if(newDataSource[k].answer === list[j]) {
            is = true;
          }
      }
      if(!is) {
        newDataSource.push({
          answer: list[j],
          answerType: "CHOICE",
          count: 0,
          isRight: list[j] === rightChoice? 'Y': 'N',
          studentIdList: '',
          studentList: [],
        })
      }
    } 
    
    newDataSource.map((Item,index)=>{
        a.push(
          {
            key: index,
            Item: {
              answer:Item.answer=="server.wzd"?formatMessage({id:"app.text.wzd",defaultMessage:"未作答"}):Item.answer,
              isRight:Item.isRight
            },
            Number: Item.count,
            Name: Item.studentList.map((i,j)=>{
              return   <div className="student_list">
              <Tooltip title={i.className+' '+i.studentClassCode}>
                <span className="name">{i.studentName+(j==(Item.studentList.length-1)?"":",")}</span>
              </Tooltip>     
            </div>
            }),
          }
        )
      })

    this.setState({
      studentData:text==formatMessage({id:"app.text.xx",defaultMessage:"选项"})?this.inABC(a):this.initGap(a),
      columns:[
        {
          title: text,
          dataIndex: 'Item',
          width: '15%',
          render: Item => {
            return (
              <div>
                {Item.answer+" "}
                {Item.isRight == "Y" && <img src={right_icon} />}
              </div>
            );
          },
        },
        {
          title: formatMessage({id:"app.text.rs",defaultMessage:"人数"}),
          dataIndex: 'Number',
          width: '15%',
        },
        {
          title: formatMessage({id:"app.text.xm",defaultMessage:"姓名"}),
          dataIndex: 'Name',
          width: '70%',
        },
      ]
    })
  }
  
  //填空题格式化，正确的置顶，未作答置底，中间从高到低显示
  initGap(data) {
    let arrA = []//保存正确,和最后汇总
    let arr = []//保存其他错误数据
    let id = -1//保存未作答的index
    let i = 0;
    let j = 0;
    let tempExchangVal;
    if (data.length > 0) {
      data.map((i, index) => {
        if (i.Item.answer == formatMessage({id:"app.text.wzd",defaultMessage:"未作答"})) {
          id = index;
        } else if (i.Item.isRight == "Y") {
          arrA.push(i);
        } else {
          arr.push(i);
        }
      })
    }
    i = arr.length
    while (i > 0) {
      for (j = 0; j < i - 1; j++) {
        if (arr[j].Number < arr[j + 1].Number) {
          tempExchangVal = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = tempExchangVal;
        }
      }
      i--;

    }
    arr.map(item => {
      arrA.push(item)
    })

    if (id > -1) {
      arrA.push(data[id])
    }
    arrA.map((Item, index) => {
      Item.Key = index;
    })
    return arrA;

  }


//选择题按ABC排序
inABC(data){
  let dataSource=[];
  let temp=[]
  let num={
    A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,
  }
  data.map((i)=>{
    if(i.Item&&i.Item.answer&&num[i.Item.answer]!=undefined){
      temp[num[i.Item.answer]]=i;
    }else{
      temp[11]=i;
    }
  })
  temp.map((i)=>{
    if(i){
      dataSource.push(i);
    }
  })
 // console.log(dataSource);
  return dataSource
}


//口语题左侧维度
getOralLeft(index){
  const {dataSource}=this.props;
  let show=[0,formatMessage({id:"app.text.c",defaultMessage:"差"}),formatMessage({id:"app.text.z",defaultMessage:"中"}),formatMessage({id:"app.text.l",defaultMessage:"良"}),formatMessage({id:"app.text.y",defaultMessage:"优"})]
  let left=[]
  // console.log(dataSource);
  if(dataSource[index].type === 'ANSWER') {
    this.scoreMatch(dataSource[index].detailsList).map((item,i)=>{
      left[i]=(   
        <div className={this.state.leftindex==i?"left-tag active":"left-tag"} onClick={()=>this.onLeftClick(Number(i))}>
        {item.answerFit+"("+(item.count || 0) +formatMessage({id:"app.text.r",defaultMessage:"人"})+")"}
        </div>
        )
    })
  }else {
    dataSource[index].detailsList.map((Item,index)=>{
      left[4-Number(Item.answer)]=(   
        <div className={this.state.leftindex==index?"left-tag active":"left-tag"} onClick={()=>this.onLeftClick(Number(index))}>
        {show[Number(Item.answer)]?show[Number(Item.answer)]+"("+Item.count+formatMessage({id:"app.text.r",defaultMessage:"人"})+")":Item.answer+"("+Item.count+formatMessage({id:"app.text.r",defaultMessage:"人"})+")"}
        </div>
        )
    })
  }
    
    return left;
}  

//口语题顶层页签
getOralUp(){
  const {dataSource}=this.props;
  let element={
    ANSWER:formatMessage({id:"app.text.df",defaultMessage:"得分"}),
    PRONUNCIATION:formatMessage({id:"app.text.fy",defaultMessage:"发音"}),
    INTEGRITY:formatMessage({id:"app.text.wanzd",defaultMessage:"完整度"}),
    FLUENCY:formatMessage({id:"app.text.lld",defaultMessage:"流利度"}),
    rhythm:formatMessage({id:"app.text.yld",defaultMessage:"韵律度"}),
  }
  let up=[]
    dataSource.map((Item,index)=>{
      //后台是按1234的得分顺序，前端变成4321的显示
      up[index]=(
        <div className={this.state.upindex==index?"tag active":"tag"} onClick={()=>this.onUpClick(index)}>{element[Item.type]}</div>
        )
    })
    return up;
}  
playingId = (Id) => {
  this.setState({tokenId:Id})
}
getStudent = (upindex,leftindex) => {
  const {dataSource}=this.props;
  let html = [];
  if(dataSource[upindex]&&dataSource[upindex].detailsList[leftindex]&&dataSource[upindex].detailsList[leftindex].studentList){
    dataSource[upindex].detailsList[leftindex].studentList.map((Item, index) => {
      html.push(
        <div className="one">
        <Tooltip title={Item.className+' '+Item.studentClassCode}>
          <span className="name">{Item.studentName}</span>
        </Tooltip>  
        <AutoPlay 
          token_id={Item.tokenId}
          hiddenRecordAnswer={"online"}
          key={Item.tokenId}
          focusId={this.state.tokenId}
          callback={this.playingId} 
          focus={true}/>   
        </div>
      );
    });
  }else{
    html.push(
    <div className="icon">
    <img src={managerIcon} alt="manager" />
    <div>{formatMessage({id:"app.text.gfdzwxs",defaultMessage:"该分段暂无学生"})}</div>
    </div>)
  }

  return html;
};

onLeftClick=(e)=>{
  this.setState({
    leftindex:e
  })
}

onUpClick=(e)=>{
  this.setState({
    upindex:e,
    leftindex:e===0? 0:3,
  })
}
  render() {
    const { dataSource } = this.props;
    const { upLoadSuccess, name, audioUrl, isPlay } = this.state;
    return(
      <Modal
        width={800}
        visible={this.state.visible}
        centered={true}
        title={formatMessage({id:"app.text.xslb",defaultMessage:"学生列表"})}
        closable={true}
        onCancel={this.onHandleCancel}
        maskClosable={false}
        className={styles.PaperModal}
        destroyOnClose={true}
        footer={null}
        >
        <div className="addTableListModal">
          {!this.state.oralVisible? <Table pagination={false}  columns={this.state.columns} dataSource={this.state.studentData} size="middle" />
          :<div className="bigTable">
            <div className="up">
              {this.getOralUp()}
            </div>
            <div className="myTable">
              <div className="leftInfo">
                {this.getOralLeft(this.state.upindex)}
              </div> 
              <div className="content">
                {this.getStudent(this.state.upindex,this.state.leftindex)}
              </div>
            </div>
          </div>}
        </div>
    </Modal>
    )
  }
}

export default AddTableListModal;
