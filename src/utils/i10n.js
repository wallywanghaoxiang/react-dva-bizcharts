/**
 * 将 defineMessages 生成的对象，通过 new Proxy的方式输出
 */
import { formatMessage } from 'umi/locale';


/**
 * 处理通过 defaultMessage 的简写
 * @param {*} messages
 * 例：声明
 * const messages = i10nProxy(defineMessages({
    examTitle     : {id:'app.title.exam.title',       defaultMessage:'本次为全真模拟考试'},
    handleTime    : {id:'app.text.task.handle.time',  defaultMessage:'{minutes}分{second}秒'},
  }));

 * 使用方法一(无参数方式)：
 *  <div>{messages.examTitle}<div>
 *  <div>本次为全真模拟考试<div>
 *
 * 使用方式二（有参数方式）：
 *  <div>{messages.parse("handleTime",{minutes:10,second:20})}<div>
 *  <div>10分20秒<div>
 */
export default function i10nProxy( messages={} ){
  const result = {};
  Object.keys(messages).forEach(item=>{
    result[item] = formatMessage(messages[item]);
  });

  result.parse = (key,params={})=>{
    return formatMessage(messages[key],{...params})
  };

  return result;
  // return new Proxy(messages,{
  //   get(target, key) {
  //     if( key === "parse" ){
  //       return (index,params={})=>formatMessage(target[index],{...params})
  //     }
  //     if( key in target ){
  //       return formatMessage(target[key]);
  //     }
  //     console.error("未申明国际化key值");
  //     return key;
  //   }
  // })

}
