/*
 * @Author: tina
 * @Date: 2019-02-26 09:13:40
 * @LastEditors: tina
 * @LastEditTime: 2019-02-26 19:44:37
 * @Description: 学生机--练习试卷下载
 * 根据试卷列表选择不同的试卷
 * 练习 ：practice
 */
import React, { PureComponent } from "react";
import { List, Card, Modal, message } from 'antd';
import styles from "./index.less";
// import { download, sendMS } from '@/utils/instructions';
import PaperCard from "./Card";

let paperData = {};


export default class ResultPaper extends PureComponent {
  state = {
    currentPage: 1, // /当前页
    visible: false,
  };


  //下一页
  nextPage = (count) => {
    const { currentPage } = this.state;
    console.log(count)
    if (currentPage < count + 1 && count !== 1) {
      let current = currentPage + 1
      this.setState({
        currentPage: current
      })
    }
  }
  //上一页
  prePage = () => {
    const { currentPage } = this.state;
    if (currentPage > 1) {
      let current = currentPage - 1
      this.setState({
        currentPage: current
      })
    }
  }

  render() {
    const paperList = this.props.paperList
    
    const { currentPage } = this.state;
    const arr = []
   
    

    // let newPaperList = [];

    // for (let i in paperList) {
    //   if (paperList[i].packageResult) {
    //     newPaperList.push(paperList[i]);
    //   }
    // }

    let snapshotId = localStorage.getItem("snapshotId");

    const newPaperList = Object.keys(paperList).reduce((current,item)=>{
      const data = paperList[item];
      if( data.packageResult){
        current.push(data);
      }else if(snapshotId === data.snapshotId){
        current.unshift(data);
      }
      return current;
    },[]);
    const pageWidth = Math.ceil(newPaperList.length)
    const pageCount = Math.ceil(newPaperList.length / 3)
    for (let i = 1; i < pageCount + 1; i++) {
      arr.push(i)
    }
    const pageStyle = {
      width: pageWidth < 3 ? "820px" : pageWidth * 264 + "px",
      left: "-" + (currentPage - 1) * 800 + "px",
      transition: "left 0.5s ease 0.1s"
    };

    return  <div className="paperList exampaperList">
                <div className="iconfont icon-link-arrow-left" style={currentPage===1?{color:"#dcdcdc"}:{color:"#333"}} onClick={this.prePage} />
                <div className="iconfont icon-link-arrow" style={pageCount!=="1"&&currentPage===pageCount?{color:"#dcdcdc"}:{color:"#333"}} onClick={()=>{
                  if(arr.length <= currentPage){
                    return
                  }
                  this.nextPage(pageCount)
                }} />
                <div className="pageNumbers">
                  <List
                    dataSource={newPaperList}
                    style={pageStyle}
                    
                    renderItem={item => (
                      <List.Item className="ant-list-item-content">
                          <PaperCard item={item} index={this} type={"result"} instructions={this.props.instructions}/>
                      </List.Item>
                      )}
                  />
                </div>
                <div className="dots">
                    {
                        arr.map((item)=>{
                            if(item === currentPage) {
                                return (<span className="checking-process" key={item}></span>)
                            } else {
                                return( <span key={item}></span>)
                            }
                        })
                    } 
                </div>
            </div>;
  }
}
