import React, { Component } from 'react';
import { List } from 'antd';
import './index.less';

class CampusListView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      earValue:props.dataSource.earVolume,
      micValue:props.dataSource.micVolume
    };
  };

// 关闭view
closeView = () => {
    this.props.onClose();
}

clickItem = (item) => {
  console.log(item.teacherId)
  this.props.callback(item.teacherId,item.campusName,item.campusId,item.name);
  this.closeView();
}
  render() {
    const { dataSource } = this.props;
    const campusList = dataSource.campusList;
    return (
      <div className="campusList-view">
        <List
        dataSource={campusList}
        renderItem={item => (<List.Item onClick={()=>this.clickItem(item)} key={item.teacherId}>{item.campusName}</List.Item>)}
        />
        
      </div>
    );
  }
}

export default CampusListView;
