
export default {
  namespace: 'examProduct',
  state: {
    exerciseList:[]
  },

  effects: {
      /**
     * @description: 保存老师发来的练习试卷列表
     * @param {type}
     * @return:
     */
    *setpaperData({ payload }, { put }){
      yield put({
        type : "savePaperList",
        exerciseList:payload
      })
    },

  },

  reducers: {

    /**
     * @description: 更新modealnamespace为 student 的总体数据
     * @param {type}
     * @return:
     */
    savePaperList(state, {exerciseList}){
      return {
        ...state,
        exerciseList
      }
    },
  },


};
