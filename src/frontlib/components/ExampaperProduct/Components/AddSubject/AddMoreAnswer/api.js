import React from 'react';
import ReactDom from 'react-dom';
import AddMoreAnswer from './index';

//批量设置答案答案
export default function showAddMoreAnswer({ dataSource, callback }) {
  let func = () => {
    let element = document.getElementById('AddMoreAnswer');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'AddMoreAnswer';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <AddMoreAnswer dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('AddMoreAnswer')
  );
}
