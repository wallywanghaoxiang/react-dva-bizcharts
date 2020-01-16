import React from 'react';
import ReactDom from 'react-dom';
import EarMicVolumeView from './index';

// 添加试卷
export default function showEarMicVolumeView({ dataSource, callback }) {

  let clickFn = "";
  let func = "";

  func=()=>{
    const element = document.getElementById('earMicVolumeView');
    if (element) element.parentNode.removeChild(element);
    document.removeEventListener("click",clickFn);
  };

  clickFn = (e)=>{
    // 判断是否有id为earMicVolumeView的元素
    const { path = [] } = e;
    const inEar = path.some(item=>item.id === 'earMicVolumeView');
    if( inEar ){
      return;
    }
    func();
  }

  // 判断当前弹框是否已经存在了
  if( document.getElementById("earMicVolumeView") ) return;

  const div = document.createElement('div');
  div.id = 'earMicVolumeView';
  document.getElementById('examRoot').appendChild(div);

  document.addEventListener("click", clickFn);

  ReactDom.render(
    <EarMicVolumeView dataSource={dataSource} callback={callback} onClose={func} />,
    document.getElementById('earMicVolumeView')
  );
}
