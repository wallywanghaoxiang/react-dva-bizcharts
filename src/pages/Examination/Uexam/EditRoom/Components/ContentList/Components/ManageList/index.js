
import React, { PureComponent, Fragment } from 'react';
import { Button, Divider,Tooltip, Select,Checkbox,Input,Table,Pagination ,Popover} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import styles from './index.less';
import cs from 'classnames';
import { connect } from 'dva';
import{lessWords} from '@/frontlib/utils/utils'

/**
 * 考编管理，截止前和截止后的表格展示
 * @author tina.zhang.xu
 * @date   2019-8-16
 */

@connect(({ editroom, loading }) => ({
  studentList: editroom.studentList,
}))


class ManageList extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
          tableData:[], //学生列表
        }
        this.columns = [
          {
            title: formatMessage({id:"app.text.kh",defaultMessage:"考号"}),
            dataIndex: 'examNo',
            width:"22%",
            render: data => (<div className={styles.info}>{`${data}`}</div>)
          },
          {
            title: formatMessage({id:"app.text.bj",defaultMessage:"班级"}),
            dataIndex: 'className',
            width:"10%",
            render: data => (<div className={styles.info}>{`${data}`}</div>)
          },
          {
            title: formatMessage({id:"app.text.xm",defaultMessage:"姓名"}),
            dataIndex: 'studentName',
            width:"9%",
            render: data => (<div className={styles.info}>
              <Tooltip title={data}>
              {`${lessWords(data)}`}
            </Tooltip></div>)
          },
          {
            title: formatMessage({id:"app.text.kd",defaultMessage:"考点"}),
            dataIndex: 'examPlaceName',
            width:"23%",
            render: data => (<div className={styles.info}>
              {data?<Tooltip title={data}>
              {`${lessWords(data)}`}
            </Tooltip>:"--"}</div>)
          },
          {
            title: formatMessage({id:"app.text.kc",defaultMessage:"考场"}),
            dataIndex: 'examRoomName',
            width:"9%",
            render: data => (<div className={styles.info}>{`${data?data:"--"}`}</div>)
          },
          {
            title: formatMessage({id:"app.text.pc",defaultMessage:"批次"}),
            dataIndex: 'examBatchName',
            width:"9%",
            render: data => (<div className={styles.info}>{`${data?data:"--"}`}</div>)
          },
          {
            title: formatMessage({id:"app.text.ksrq",defaultMessage:"考试日期"}),
            dataIndex: 'examDate',
            width:"18%",
            render: data => (<div className={styles.info}>{`${data?data:"--"}`}</div>)
          },
        ];
      }
    componentDidMount() {

    }

    initData=data=>{
      let a=data.records
      let list=[];
      if(a){
        a.map((Item,index)=>{
          list.push({
            key:index,
            examNo:Item.examNo,
            className:Item.className,
            studentName:Item.studentName, 
            examPlaceName:Item.examPlaceName,
            examRoomName:Item.examRoomName,
            examBatchName:Item.examBatchName,
            examDate:Item.dateFormat,
          })
        })
      }
      this.setState({
        tableData:list
      })
    }


    componentWillReceiveProps(nextProps){
      this.initData(nextProps.studentList)

    }


render() {
  const { tableData} = this.state;
  const pagination={
    position:"bottom",
    defaultPageSize:12,
}
  return (
    <div className={styles.manageList}>
       <Table 
            columns={this.columns} 
            dataSource={tableData} 
           // rowSelection={rowSelection}
            pagination={pagination}
            size={"small"}
            style={{height:480}}
            />
    </div>
  )
}
}

export default ManageList