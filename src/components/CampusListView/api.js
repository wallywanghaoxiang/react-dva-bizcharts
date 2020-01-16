import React from 'react';
import ReactDom from 'react-dom';
import CampusListView from './index';

//添加试卷
export default function showCampusListView({ dataSource, callback }) {
  let func = () => {
    let element = document.getElementById('campusListView');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'campusListView';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <CampusListView dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('campusListView')
  );
}
