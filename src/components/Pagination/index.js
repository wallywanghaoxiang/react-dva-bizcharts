import { Pagination } from 'antd';
import React, { Component } from 'react';
import './index.less';


/**
 * 分页器
 *
 * @author tina.zhang
 */
class OwnPagination extends Component {

 constructor(props) {
   super(props);
 }
 
 render() {
	return (
		<Pagination {...this.props} />
	);
 }
}

export default OwnPagination;

