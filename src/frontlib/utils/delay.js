/**
 * 添加延迟
 */
const delay=(time,fn)=>{
  return new Promise((resolve)=>{
    if(typeof(fn)==="function"){
      fn();
    }

    setTimeout(()=>{
      resolve();
    },time);
  })
}

export default delay;

