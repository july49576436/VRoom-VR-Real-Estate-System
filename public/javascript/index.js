// 監聽 Enter 鍵並開啟登入對話框
document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        openLoginModal();
    }
});

// 開啟登入對話框
function openLoginModal() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.style.display = 'block';
}

// 關閉登入對話框
document.getElementById('closeModal').addEventListener('click', function() {
    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.style.display = 'none';
});

// 處理登入表單提交
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        alert('請輸入帳號和密碼');
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            throw new Error('伺服器回應失敗: ' + response.status);
        }

        const result = await response.json();
        if (result.success) {
            window.location.href = "add_house2.html";
        } else {
            alert(result.message || '帳號或密碼錯誤');
        }
    } catch (error) {
        console.error('前端錯誤:', error);
        alert('無法連接伺服器，請稍後再試');
    }
});



$(document).ready(() => {  // 等待DOM完全載入後執行
    // 獲取推薦房屋
    $.ajax({
        url: '/api/recommendations',  // 向伺服器發送GET請求以獲取推薦房屋數據
        method: 'GET',  // 請求方法是GET
        success: (data) => {  // 如果請求成功，執行此函數
            const container = $('#recommendations-container');  // 獲取推薦房屋容器
            data.forEach(house => {  // 對每個房屋數據執行以下操作
                container.append(`  // 將房屋數據添加到容器中
                    <div class="property">
                        <a href="house/${house.id}">
                            <img src="${house.main_image}" alt="${house.name}">
                            <div class="property-details">
                                <h3>${house.name}</h3>
                        </a>
                                <p>${house.unit_price}萬/坪</p>
                                <p>${house.district}/${house.type}/${house.layout}/${house.size}坪</p>
                            </div>
                        </div>
                    </div>
                `);
            });
        },
        error: (err) => {  // 如果請求失敗，執行此函數
            console.error('Error fetching recommendations:', err);  // 在控制台顯示錯誤訊息
        }
    });

    // 獲取新上架房屋
    $.ajax({
        url: '/api/new-arrivals',  // 向伺服器發送GET請求以獲取新上架房屋數據
        method: 'GET',  // 請求方法是GET
        success: (data) => {  // 如果請求成功，執行此函數
            const container = $('#new-arrivals-container');  // 獲取新上架房屋容器
            data.forEach(house => {  // 對每個房屋數據執行以下操作
                container.append(`  // 將房屋數據添加到容器中
                    <div class="property">
                        <a href="house/${house.id}">
                            <img src="${house.main_image}" alt="${house.name}">
                            <div class="property-details">
                                <h3>${house.name}</h3>
                        </a>
                                <p>${house.unit_price}萬/坪</p>
                                <p>${house.district}/${house.type}/${house.layout}/${house.size}坪</p>
                            </div>
                        </div>
                    </div>
                `);
            });
        },
        error: (err) => {  // 如果請求失敗，執行此函數
            console.error('Error fetching new arrivals:', err);  // 在控制台顯示錯誤訊息
        }
    });

    // 獲取降價中古屋
    $.ajax({
        url: '/api/price-drop',  // 向伺服器發送GET請求以獲取降價中古屋數據
        method: 'GET',  // 請求方法是GET
        success: (data) => {  // 如果請求成功，執行此函數
            const container = $('#price-drop-container');  // 獲取降價中古屋容器
            data.forEach(house => {  // 對每個房屋數據執行以下操作
                container.append(`  // 將房屋數據添加到容器中
                    <div class="property">
                        <a href="house/${house.id}">
                            <img src="${house.main_image}" alt="${house.name}">
                            <div class="property-details">
                                <h3>${house.name}</h3>
                        </a>
                                <p>${house.unit_price}萬/坪</p>
                                <p>${house.district}/${house.type}/${house.layout}/${house.size}坪</p>
                            </div>
                        </div>
                    </div>
                `);
            });
        },
        error: (err) => {  // 如果請求失敗，執行此函數
            console.error('Error fetching price drop houses:', err);  // 在控制台顯示錯誤訊息
        }
    });
});

const districtsData = {
    taipei_city: [
        "全區",
        "大安區",
        "信義區",
        "文山區",
        "中正區",
        "中山區",
        "松山區",
        "南港區",
        "士林區",
        "北投區"
    ],
    new_taipei_city: [
        "全區",
        "板橋區",
        "新店區",
        "土城區",
        "三峽區",
        "鶯歌區",
        "樹林區",
        "三芝區",
        "淡水區",
        "八里區",
        "林口區",
        "五股區",
        "泰山區",
        "新莊區",
        "瑞芳區"
    ],
    keelung_city: [
        "全區",
        "仁愛區",
        "中正區",
        "中山區",
        "安樂區",
        "信義區",
        "七堵區"
    ],
    taichung_city: [
        "全區",
        "北屯區",
        "南屯區",
        "西屯區",
        "東區",
        "南區",
        "西區",
        "北區"
    ],
    tainan_city: [
        "全區",
        "安平區",
        "永康區",
        "南化區",
        "中西區",
        "北區",
        "東區",
        "南區",
        "西區",
        "歸仁區",
        "關廟區",
        "新化區",
        "新營區",
        "麻豆區",
        "善化區"
    ],
    kaohsiung_city: [
        "全區",
        "新興區",
        "前鎮區",
        "鳳山區",
        "鼓山區",
        "三民區",
        "左營區",
        "鹽埕區",
        "橋頭區",
        "楠梓區",
        "小港區",
        "仁武區",
        "大寮區",
        "大樹區",
        "岡山區"
    ],
    taoyuan_city: [
        "全區",
        "平鎮區",
        "大溪區",
        "桃園區",
        "中壢區",
        "蘆竹區",
        "龜山區",
        "八德區",
        "楊梅區",
        "觀音區",
        "龍潭區",
        "大園區",
        "新屋區",
        "復興區"
    ],
    hsinchu_city: [
        "全區",
        "東區",
        "西區",
        "北區",
        "香山區"
    ],
    chiayi_city: [
        "全區",
        "東區",
        "西區"
    ],
    yilan_county: [
        "全區",
        "宜蘭市",
        "羅東鎮",
        "蘇澳鎮",
        "冬山鄉",
        "五結鄉",
        "員山鄉",
        "大同鄉",
        "南澳鄉",
        "頭城鎮",
        "礁溪鄉"
    ],
    hsinchu_county: [
        "全區",
        "竹北市",
        "竹東鎮",
        "新埔鎮",
        "關西鎮",
        "湖口鄉",
        "芎林鄉",
        "橫山鄉",
        "北埔鄉",
        "寶山鄉",
        "尖石鄉",
        "五峰鄉"
    ],
    miaoli_county: [
        "全區",
        "苗栗市",
        "苑裡鎮",
        "通霄鎮",
        "竹南鎮",
        "後龍鎮",
        "造橋鄉",
        "頭份市",
        "三義鄉",
        "西湖鄉",
        "銅鑼鄉",
        "南庄鄉",
        "大湖鄉",
        "泰安鄉",
        "公館鄉"
    ],
    changhua_county: [
        "全區",
        "彰化市",
        "員林市",
        "溪湖鎮",
        "田中鎮",
        "二林鎮",
        "大村鄉",
        "大城鄉",
        "社頭鄉",
        "埔鹽鄉",
        "和美鎮",
        "鹿港鎮",
        "彰化縣"
    ],
    nantou_county: [
        "全區",
        "南投市",
        "埔里鎮",
        "草屯鎮",
        "竹山鎮",
        "集集鎮",
        "水里鄉",
        "名間鄉",
        "中寮鄉",
        "仁愛鄉",
        "魚池鄉",
        "鹿谷鄉"
    ],
    yunlin_county: [
        "全區",
        "斗六市",
        "斗南鎮",
        "虎尾鎮",
        "西螺鎮",
        "土庫鎮",
        "褒忠鄉",
        "大埤鄉",
        "莿桐鄉",
        "林內鄉",
        "二崙鄉",
        "四湖鄉",
        "元長鄉"
    ],
    chiayi_county: [
        "全區",
        "太保市",
        "嘉義市",
        "布袋鎮",
        "阿里山鄉",
        "中埔鄉",
        "大埔鄉",
        "梅山鄉",
        "竹崎鄉",
        "東石鄉",
        "溪口鄉",
        "中埔鄉",
        "新港鄉",
        "六腳鄉"
    ],
    pingtung_county: [
        "全區",
        "屏東市",
        "潮州鎮",
        "恆春鎮",
        "萬丹鄉",
        "東港鎮",
        "三地門鄉",
        "霧台鄉",
        "里港鄉",
        "高樹鄉",
        "九如鄉",
        "長治鄉",
        "鹽埔鄉",
        "來義鄉",
        "內埔鄉"
    ],
    taitung_county: [
        "全區",
        "台東市",
        "關山鎮",
        "卑南鄉",
        "大武鄉",
        "達仁鄉",
        "長濱鄉",
        "東河鄉",
        "太麻里鄉",
        "綠島鄉",
        "蘭嶼鄉"
    ],
    hualien_county: [
        "全區",
        "花蓮市",
        "吉安鄉",
        "壽豐鄉",
        "鳳林鎮",
        "光復鄉",
        "豐濱鄉",
        "瑞穗鄉",
        "萬榮鄉",
        "秀林鄉",
        "吉安鄉",
        "卓溪鄉"
    ],
    penghu_county: [
        "全區",
        "馬公市",
        "西嶼鄉",
        "望安鄉",
        "七美鄉",
        "白沙鄉",
        "湖西鄉"
    ],
    kinmen_county: [
        "全區",
        "金城鎮",
        "金湖鎮",
        "金寧鄉",
        "金門縣",
        "烈嶼鄉"
    ],
    lienchiang_county: [
        "全區",
        "南竿鄉",
        "北竿鄉",
        "東引鄉",
        "莒光鄉"
    ]
};

function showDistricts() {
    const city = document.getElementById('cities').value;
    const districtsSelect = document.getElementById('district');
    const districtsContainer = document.getElementById('districts');

    if (city && districtsData[city]) {
        const districts = districtsData[city];
        districtsSelect.innerHTML = '<option value="">-- 請選擇區域 --</option>';
        districts.forEach(district => {
            districtsSelect.innerHTML += `<option value="${district}">${district}</option>`;
        });
        districtsContainer.style.display = 'block';
    } else {
        districtsSelect.innerHTML = '<option value="">-- 請選擇區域 --</option>';
        districtsContainer.style.display = 'none';
    }
}

function applyPriceFilter() {
    // Implement price filter logic here
}

function applyTypeFilter() {
    // Implement type filter logic here
}

document.getElementById('search-btn').addEventListener('click', function() {
    const query = document.getElementById('search').value;
    console.log('Search query:', query);
    // Add your search logic here
});
//回到頂端按鈕 start
//<![CDATA[
(function () {
    $("body").append("<img id='goTopButton' title='回到頂端'/>");
    var img = "http://1.bp.blogspot.com/-zMfrIkyhlVs/Uh7FePoKU8I/AAAAAAAAHnA/WA0H_vbWAWc/s1600/go-top.png",
    locatioin = 4/5, // 按鈕出現在螢幕的高度
    right = 10, // 距離右邊 px 值
    opacity = 1, // 透明度
    speed = 500, // 捲動速度
    $button = $("#goTopButton"),
    $body = $(document),
    $win = $(window);
    $button.attr("src", img);
    $button.on({
    mouseover: function() {
        $button.css("opacity", 1);
    },
    mouseout: function() {
        $button.css("opacity", opacity);
    },
    click: function() {
        $("html, body").animate({scrollTop: 0}, speed);
    }
    });
    window.goTopMove = function () {
        var scrollH = $body.scrollTop(),
        winH = $win.height(),
        css = {"top": winH * locatioin + "px", "position": "fixed", "right": right, "opacity": opacity};
        if(scrollH > 20) {
        $button.css(css);
        $button.fadeIn("slow");
        } else {
        $button.fadeOut("slow");
        }
    };
    $win.on({
        scroll: () => goTopMove(),
        resize: () => goTopMove()
    });
} )();