// 活動案例分類（順序同頁首選單），供 /gallery/ 總覽與各相簿頁「其他活動案例」共用。
// cover：/images/ 下不含 -720／-1440 的照片路徑；plan：相簿頁推薦的演出方案頁（可為 null）。
// 標題與照片張數一律取自 src/_data/galleries/*.json，這裡不重複。
const items = [
  {
    "key": "opening",
    "cover": "%E9%96%8B%E5%B9%95%E9%96%8B%E5%B7%A5/%E9%96%8B%E5%B9%95%E7%86%B1%E5%A0%B4",
    "coverWidth": 720,
    "coverHeight": 540,
    "summary": "品牌開幕、店面剪綵、企業活動與商場慶典",
    "plan": {
      "href": "/landing/opening-lion-dance",
      "label": "開幕舞獅表演"
    }
  },
  {
    "key": "banquet",
    "cover": "%E6%98%A5%E9%85%92%E5%B0%BE%E7%89%99/%E5%B0%BE%E7%89%998%E9%9A%BB%E7%8D%85%E8%B7%B3%E6%A8%81%E6%BC%94%E5%87%BA",
    "coverWidth": 720,
    "coverHeight": 502,
    "summary": "企業春酒、尾牙晚會、年度聚會與舞台演出",
    "plan": {
      "href": "/landing/year-end-party-lion-dance",
      "label": "尾牙春酒舞獅表演"
    }
  },
  {
    "key": "tourism",
    "cover": "%E8%A7%80%E5%85%89%E8%A1%A8%E6%BC%94/%E5%90%89%E9%A6%96%E5%9C%8B%E9%9A%9B%E9%BC%93%E6%96%87%E5%8C%96%E7%AF%80",
    "coverWidth": 720,
    "coverHeight": 540,
    "summary": "文化推廣、觀光活動、國際交流與城市節慶",
    "plan": {
      "href": "/landing/dragon-lion-dance-performance",
      "label": "舞龍舞獅表演"
    }
  },
  {
    "key": "funeral",
    "cover": "%E8%BF%BD%E6%80%9D%E5%84%80%E5%BC%8F/%E9%9D%88%E7%8D%854",
    "coverWidth": 405,
    "coverHeight": 720,
    "summary": "追思儀式與靈獅演出",
    "plan": null
  },
  {
    "key": "groundbreaking",
    "cover": "%E5%8B%95%E5%9C%9F%E4%B8%8A%E6%A8%91/%E5%8B%95%E5%9C%9F%E9%96%8B%E5%A0%B4%E6%88%B0%E9%BC%93",
    "coverWidth": 720,
    "coverHeight": 406,
    "summary": "動土典禮、上樑儀式與開場戰鼓",
    "plan": {
      "href": "/landing/opening-lion-dance",
      "label": "開幕舞獅表演"
    }
  },
  {
    "key": "festival-retail",
    "cover": "%E7%99%BE%E8%B2%A8%E6%98%A5%E7%AF%80%E5%91%A8%E5%B9%B4%E6%85%B6/%E7%99%BE%E8%B2%A8%E5%B0%88%E6%AB%83%E5%91%A8%E5%B9%B4%E6%85%B62",
    "coverWidth": 614,
    "coverHeight": 720,
    "summary": "百貨春節、週年慶與祥獅跳高樁",
    "plan": {
      "href": "/landing/company-event-lion-dance",
      "label": "企業活動舞獅表演"
    }
  },
  {
    "key": "temple",
    "cover": "%E5%BB%9F%E6%9C%83%E7%B9%9E%E5%A2%83%E7%A5%9D%E5%A3%BD/%E6%88%B0%E9%BC%932",
    "coverWidth": 720,
    "coverHeight": 405,
    "summary": "宮廟慶典、神明聖誕、進香遶境與地方節慶",
    "plan": {
      "href": "/pages/temple-festival-planning",
      "label": "廟會策劃活動"
    }
  },
  {
    "key": "school",
    "cover": "%E5%AD%B8%E6%A0%A1%E7%A4%BE%E5%9C%98%E4%BC%81%E6%A5%AD%E6%95%99%E5%AD%B8/2026%E9%A6%99%E6%B8%AF%E9%BE%8D%E7%8D%85%E7%AF%80",
    "coverWidth": 720,
    "coverHeight": 502,
    "summary": "學校社團、文化體驗、企業活動與傳統技藝教學",
    "plan": null
  },
  {
    "key": "performance",
    "cover": "%E5%B1%95%E6%BC%94%E6%9C%8D%E5%8B%99/%E6%B3%B0%E5%B1%B1%E7%8D%85%E7%8E%8B%E6%96%87%E5%8C%96%E7%A5%AD",
    "coverWidth": 720,
    "coverHeight": 480,
    "summary": "舞台展演、活動造勢、演唱會與影像拍攝",
    "plan": {
      "href": "/landing/dragon-lion-dance-performance",
      "label": "舞龍舞獅表演"
    }
  }
];

module.exports = {
  items,
  byKey: Object.fromEntries(items.map((item) => [item.key, item]))
};
