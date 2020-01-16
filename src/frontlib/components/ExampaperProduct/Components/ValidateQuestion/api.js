import React from 'react';
import ReactDom from 'react-dom';
import AddValidateQuestion from './index';

//校对
export default function showValidateQuestion({ dataSource, callback }) {
  let func = () => {
    let element = document.getElementById('addValidateQuestion');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'addValidateQuestion';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <AddValidateQuestion dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('addValidateQuestion')
  );
}
