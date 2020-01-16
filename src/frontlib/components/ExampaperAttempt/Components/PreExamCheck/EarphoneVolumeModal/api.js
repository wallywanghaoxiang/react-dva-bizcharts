import React from 'react';
import ReactDom from 'react-dom';
import EarphoneVolumeModal from './index';

//添加试卷
export default function showEarphoneVolumeModal({ dataSource, callback }) {
  let func = () => {
    let element = document.getElementById('earphoneVolume');
    if (element) element.parentNode.removeChild(element);
  };

  let div = document.createElement('div');
  div.id = 'earphoneVolume';
  document.getElementById('root').appendChild(div);

  ReactDom.render(
    <EarphoneVolumeModal dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('earphoneVolume')
  );
}
