const site = require('./site.json');

// Existing price-page answers, shared by visible copy and structured data.
module.exports = {
  items: [
    {
      question: '報價需要提供哪些資訊？',
      answer: '請提供活動日期與時段、活動地點、活動類型（開幕、尾牙、廟會等）與預計流程，我們就能快速評估並回覆報價。'
    },
    {
      question: '哪些因素會影響舞獅表演價格？',
      answer: '主要包含演出項目與長度、獅數與人員編制、是否加購戰鼓或電音三太子等節目、場地樓層與動線，以及日期時段（如農曆春節、尾牙季等旺季檔期）。'
    },
    {
      question: '如何最快取得報價？',
      answer: `直接加 LINE（ID：${site.lineId}）並附上活動日期、地點與活動類型，是最快的詢價方式。`
    }
  ]
};
