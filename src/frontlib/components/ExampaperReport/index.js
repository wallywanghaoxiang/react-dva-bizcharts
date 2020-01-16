import React, { PureComponent } from 'react';
import { Modal } from 'antd';
import Dimensions from 'react-dimensions';
import { formatMessage,defineMessages} from 'umi/locale';
import ExampaperReport from './ExampaperReport';


const messages = defineMessages({
  paperreportPageTitle:{id:'app.trial.report.page.title',defaultMessage:'整卷试做报告'},
  exercisePageTitle:{id:'app.trial.exercise.page.title',defaultMessage:'练习报告'}
});
/**
 *整卷试做报告
 *
 * @author tina.zhang
 * @date 2018-12-18
 * @export
 * @class Exampaper
 * @extends {PureComponent}
 * isFinish=="no" 表示练习中打开报告
 */

class ExamReport extends PureComponent {
    constructor(props) {
        super(props);
        this.stTime=[];
        this.spTime=[];
        this.st="";
        this.sp="";
        this.state={
            paperData:"",
            showData:"",
            getData:false,
            show:true,
            allTime:0,
            eaxmTime:0
        }
    }

    componentDidMount() {
        if (this.props.dataSource) {
            this.setState({
                paperData:this.props.dataSource.paperData,
                showData:this.props.dataSource.showData,
                getData:true,
            })
          }
          this.getTime()

    }
    onClose=()=>{
        this.setState({
            show:false,
        })
        this.props.onClose();
        this.props.callback();
    }

    //计算试做时间
  getTime(){
    let time=0;
    if (this.props.dataSource) {
        if(this.props.dataSource.allTime){
            this.setState({
                eaxmTime:this.props.dataSource.allTime
            })
        }else{
            this.sp=this.props.dataSource.stopTime;
            this.st=this.props.dataSource.startTime;
            this.stTime.push(this.st[0]);
            this.findFirstSpSmall(this.st[0]);
            for(let i in this.stTime){
                time=time+this.spTime[i]-this.stTime[i];
            }
            this.setState({
                allTime:time/1000
            })
        }
        // console.log("time------2222------");
        // console.log(this.stTime);
        // console.log(this.spTime);
      }
  }


  findFirstSpSmall(value){
      for(let index=0;index<this.sp.length;index++){
          if(value<this.sp[index]){
              this.spTime.push(this.sp[index])
              this.findFirstStSmall(this.sp[index])
              return;
          }
      }
  }
  findFirstStSmall(value){
    for(let index=0;index<this.st.length;index++){
        if(value<this.st[index]){
            this.stTime.push(this.st[index])
            this.findFirstSpSmall(this.st[index])
            return;
        }
    }
}


    render() {
        const{paperData,showData,getData,allTime,eaxmTime} = this.state;
        const { containerHeight,modalTitle } = this.props;
        console.log("containerHeight", containerHeight-54-76-40)
        // console.log("-----------------------------");
        // console.log(paperData);
        // console.log(showData);
          return (
            <Modal
            visible={this.state.show}
            centered={true}
            title={modalTitle||(window.ExampaperStatus ==="EXAM"? formatMessage(messages.exercisePageTitle) : formatMessage(messages.paperreportPageTitle))}
            width={""}
            maskClosable={false}
            className={"report"}
            bodyStyle={{ height:containerHeight-54-76-40 , overflow:"auto"}}
            destroyOnClose={true}
            onCancel={this.onClose}
            okText=""
            footer={
            <button type="button" class="ant-btn ant-btn-primary" onClick={this.onClose}>
                <span>关 闭</span>
            </button>
            }
            >
            <div style={{"justifyContent":"center","display":"flex"}} >
                  <div style={{position:"absolute"}}><div id="recorder_swf" ></div></div>
                    <div>
                        {getData&&<ExampaperReport
                        showData={showData}
                        paperData={paperData}
                        allTime={allTime}
                        eaxmTime={eaxmTime}
                        isFinish={this.props.isFinish}
                        />}
                    </div>
             </div>
            </Modal>
          )
    }
}



export default Dimensions({
    getHeight: function() {
      //element
      return window.innerHeight;
    },
    getWidth: function() {
      //element
      return window.innerWidth;
    },
  })(
    ExamReport
  );
