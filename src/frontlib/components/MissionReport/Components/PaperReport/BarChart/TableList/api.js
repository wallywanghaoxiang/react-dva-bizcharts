import React from 'react';
import ReactDom from 'react-dom';
import AddTableListModal from './index';

//学生列表
//export default function showAddTableListModal({ dataSource,masterData, callback }) {
export default function showAddTableListModal(dataSource,type, subId) {
  let subref;
  let ref=(a)=>{
    subref=a;
  }
  let func = () => {
    let element = document.getElementById('addTableList');
    if (element) element.parentNode.removeChild(element); 
  };

  let div = document.createElement('div');
  div.id = 'addTableList';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    //<AddTableListModal dataSource={dataSource} callback={callback} masterData={masterData} onClose={func} />,
    <AddTableListModal dataSource={dataSource} onClose={func} type={type} ref={ref} {...subId}/>,
    document.getElementById('addTableList')
  );
  return subref.onHandleCancel;
}
