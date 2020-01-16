import React, { PureComponent } from 'react';
import { Anchor } from 'antd';
import styles from './index.less';
import side_cut_page_pic from '@/frontlib/assets/ExampaperAttempt/side_cut_page_pic.png';
import side_cut_page_pic_active from '@/frontlib/assets/ExampaperAttempt/side_cut_page_pic_active.png';
import side_back_tag_pic_active from '@/frontlib/assets/ExampaperAttempt/side_back_tag_pic_active.png';
import side_back_tag_pic from '@/frontlib/assets/ExampaperAttempt/side_back_tag_pic.png';


/*
    制作试卷左侧图标

 */


export default class DotTag extends PureComponent {
  constructor(props) {
    super(props);

  }

  componentDidUpdate(nextProps) {
  }


  checktype(item) {
    const { status, data, focusIndex, mainIndex, questionType, isPlugin } = this.props;


    let isChoose = false;

    let dataType = data.type;
    if (dataType == "NORMAL" || dataType == "INTRODUCTION") {
      if (focusIndex.mainIndex == mainIndex && focusIndex.questionIndex == data.index && focusIndex.subIndex == undefined) {
        isChoose = true
      }
    } else if (dataType == "TWO_LEVEL") {
      if (focusIndex.mainIndex == mainIndex && (focusIndex.subIndex == item || isPlugin) && focusIndex.questionIndex == data.index) {
        isChoose = true
      }
      if (data.allowMultiAnswerMode == "Y") {
        if (focusIndex.mainIndex == mainIndex && focusIndex.questionIndex == data.index) {
          isChoose = true
        }
      }
    } else if (dataType == "COMPLEX") {

    } else if (dataType == "SPLITTER" || questionType == "RECALL") {
      if (focusIndex.mainIndex == mainIndex && focusIndex.questionIndex == data.index) {
        isChoose = true
      }
    }

    if (isChoose) {
      return "orange-dot"
    } else {
      switch (status) {
        case 0:
          return "normal-dot";
        case 100:
          return "green-dot";
        case 200: //●有回复
          return "blue-dot";
        case 300: //●有误
          return "red-dot"
      }
    }
  }


  background(status) {
    switch (status) {
      case 0:
        return "DotTag-orange ";
      case 100:
        return "DotTag-green ";
      case 200: //●有回复
        return "DotTag-blue ";
      case 300: //●有误
        return "DotTag-red "
    }
  }


  render() {
    const { href, title, onClick, className, status, style, arr, data, focusIndex, mainIndex, questionType } = this.props;
    let width = arr.length * 24
    let wrap = null;
    if (width > 220) {
      wrap = { flexWrap: "wrap" };
    }

    if (questionType == "SPLITTER") {
      return <div className={styles.flex}
        onClick={() => {
          this.props.index.onClick("i", mainIndex, data.index, data.type)
        }}>
        {this.checktype("i") != "orange-dot" ? <img src={side_cut_page_pic} /> : <img src={side_cut_page_pic_active} />}

      </div>
    }else if (questionType == "RECALL") {
      return <div className={styles.flex}
        onClick={() => {
          this.props.index.onClick("i", mainIndex, data.index, data.type)
        }}>
        {this.checktype("i") != "orange-dot" ? <img src={side_back_tag_pic} /> : <img src={side_back_tag_pic_active} />}

      </div>
    } else {
      if(href){//线上平台查看报告页
        if(arr.length>3){
          width = arr.length * 25.5
        }else{
          width = arr.length * 26.5
        }
        if(arr.length>1){
          return <div className={"report_online "+this.background(status)+className} onClick={onClick} style={style} style={{width:width,...wrap}}>
          {arr.map((item,index)=>{
            return  <div key={"dot_"+index} style={{"float":"left"}}  className={(this.props.setRate>=this.props.rate[index])?"Fred link":"link"}>
                    <div className={(this.props.setRate>=this.props.rate[index])?"dot2 "+this.checktype(item): "dot "+this.checktype(item)} 
                    onClick={()=>{
                      this.props.index.onClick(Number(item),mainIndex,data.index,data.type,String(mainIndex)+"-"+String(data.index)+"-"+Number(item)+"-"+data.type)
                    }}>
                      {item == " " ? <div className={styles.dot}></div> : <span>{item}</span>}
                    </div>
                  </div>
            })}
          </div>
        }else{
          return <div className={(this.props.setRate>=this.props.rate[0])?"report_online_white report_online " +this.background(status)+className:"report_online "+this.background(status)+className} onClick={onClick} style={style} style={{width:width,...wrap}}>
               <div key={"dot_"+0} style={{"float":"left"}}  className={(this.props.setRate>=this.props.rate[0])?"Fred link":"link"}>
                    <div className={(this.props.setRate>=this.props.rate[0])?"dot2 "+this.checktype(arr[0]): "dot "+this.checktype(arr[0])} 
                    onClick={()=>{
                      this.props.index.onClick(Number(arr[0]),mainIndex,data.index,data.type,String(mainIndex)+"-"+String(data.index)+"-"+Number(arr[0])+"-"+data.type)
                    }}>
                      {arr[0] == " " ? <div className={styles.dot}></div> : <span>{arr[0]}</span>}
                    </div>
                  </div>
          </div>
        }
      }else{
        return <div  className={this.background(status)+className} onClick={onClick} style={style} style={{width:width+"px",...wrap}}>
        {arr.map((item,index)=>{
          return  <div className={"dot "+this.checktype(item)} 
                  key={"dot_"+index}  
                  onClick={()=>{
                    this.props.index.onClick(Number(item),mainIndex,data.index,data.type)
                  }}>
                       {(item+"").trim() == "" ? <div className={styles.dot}></div> : <span>{item}</span>}
                  </div>
        })}
    </div>
      }
    }
  }
}
