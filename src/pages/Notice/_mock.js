// import { delay } from 'roadhog-api-doc';

// 响应数据 interface
function IResp(data) {
  this.data = data;
  this.responseCode = '200';
}

function getNoticeList(req, res) {
  const { pageIndex: current, readStatus, isRecommended } = req.query;
  const data = {
    "current": current,
    "pages": 2,
    "records": [],
    "size": 10,
    "total": 20
  };
  const records = [];
  [...Array(10)].map((v, i) => {
    records.push({
      "id": `${i + 2}`,
      "messageId": `${i + 2}`,
      "receiverId": `12`,
      "tenantId": `${i % 2 === 0 ? '12' : '9'}`,
      "receiverContact": `${i + 2}`,
      "sendTime": `${1561438918000 + i}`,
      "channelId": "",
      "title": `MOCK-${i + 1}-Page(${current})-ReadStatus(${readStatus === 'N' ? 'N' : 'ALL'})-IsRecommended(${isRecommended === 'Y' ? 'Y' : 'ALL'})-有50名学生加入初一(1)班！`,
      "content": "有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！",
      "dealUri": `${i % 3 === 0 ? "https://www.baidu.com" : ''}`,
      "parameters": "",
      "receiverParameters": "",
      "status": "",
      "statusFeedback": "",
      "feedbackTime": "",
      "readStatus": `${i % 2 === 0 ? 'Y' : 'N'}`,
      "readTime": "",
      "messageTypeId": "",
      "messageTypeName": "",
      "tenantName": `${i % 2 === 0 ? "新建四中" : "新建一中"}`,
      "isRecommended": `${i % 2 === 0 ? 'Y' : 'N'}`,
      "recommendScope": "",
      "recommendStatus": ""
    })
  });
  data.records = [...records];
  res.send(new IResp(data));
}

// 查询站内信未读数量
function getNoticeUnreadInfo(req, res) {
  const data = {
    "unreadCount": 9,
    "recommendUnreadCount": 4
  };
  res.status(500)
  res.send(null);
  // res.send({ ...(new IResp(data)), responseCode: 500 });
  // res.send(new IResp(data));
}

// 消息收件箱状态更新
function updateNoticeState(req, res) {
  const data = {};
  res.send(new IResp(data));
}

function getNoticeInfo(req, res) {
  const { messageSendId } = req.params;
  const data = {
    "id": `${messageSendId}`,
    "messageId": `${messageSendId}`,
    "receiverId": `${messageSendId}`,
    "tenantId": `12`,
    "receiverContact": `${messageSendId}`,
    "sendTime": `${1561438918000}`,
    "channelId": "",
    "title": `MOCK-有50名学生加入初一(1)班！`,
    "content": `有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！
    有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！
    有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！
    有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！
    有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！
    有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！
    有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！
    有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！有50名学生加入初一(1)班！`,
    "dealUri": "",
    "parameters": "",
    "receiverParameters": "",
    "status": "",
    "statusFeedback": "",
    "feedbackTime": "",
    "readStatus": `N`,
    "readTime": "",
    "messageTypeId": "",
    "messageTypeName": "",
    "tenantName": "新建四中",
    "isRecommended": `N`,
    "recommendScope": "",
    "recommendStatus": ""
  };
  res.send(new IResp(data));
}

const apiMap = {
  // ?accountId=48739668979613866&readStatus=&isRecommended=&pageIndex=1&pageSize=10
  'GET /api/notification/message': getNoticeList,
  'GET /api/notification/message/unread-count/:accountId': getNoticeUnreadInfo,
  'PUT /api/notification/message': updateNoticeState,
  'GET /api/notification/message/info/:messageSendId': getNoticeInfo,

}
export default apiMap;
// export default delay(apiMap, 1000);
