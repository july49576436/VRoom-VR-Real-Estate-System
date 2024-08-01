//靜態的房屋數據
const data = [
    { title: '市府微風松菸美寓', description: '台北市信義區永吉路' },
    { title: '國際名蝦柏有豪華戶', description: '中山區/住宅/3房/2廳/102坪' },
    { title: '高檔裝潢景觀美別墅', description: '中山區/住宅/3房/2廳/102坪' }
];

function search(query) {
    const lowerCaseQuery = query.toLowerCase();
    return data.filter(item => 
        item.title.toLowerCase().includes(lowerCaseQuery) || 
        item.description.toLowerCase().includes(lowerCaseQuery)
    );
}

module.exports = search;
