function searchHouses(city, district, priceRange, houseType) {
    fetch(`/search?city=${city}&district=${district}&priceRange=${priceRange}&houseType=${houseType}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayResults(data);
        })
        .catch(error => console.error('Error:', error));
}

function formatTotalPrice(totalPrice) {
    const raw = String(totalPrice || '').trim();
    if (!raw) return '總價未提供';

    if (raw.includes('萬')) {
        const number = raw.replace(/[^0-9]/g, '');
        return number ? `${Number(number).toLocaleString('zh-TW')}萬` : raw;
    }

    const digits = raw.replace(/[^0-9]/g, '');
    if (!digits) return raw;
    const inWan = Math.round(Number(digits) / 10000);
    return `${inWan.toLocaleString('zh-TW')}萬`;
}

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';

    if (!data.length) {
        resultsContainer.innerHTML = '<div>沒有符合條件的建案。</div>';
        return;
    }

    data.forEach(house => {
        const houseElement = document.createElement('div');
        houseElement.className = 'house-result';
        houseElement.innerHTML = `
            <h3>${house.name}</h3>
            <p>地址：${house.address || ''}</p>
            <p>總價：${formatTotalPrice(house.totalprice)}</p>
            <p>格局：${house.roomlayout || ''}　坪數：${house.area || ''}</p>
        `;
        resultsContainer.appendChild(houseElement);
    });
}

document.getElementById('search-btn').addEventListener('click', function() {
    const city = document.getElementById('cities').value;
    const district = document.getElementById('district').value;
    const priceRange = document.getElementById('price-filter').value;
    const houseType = document.getElementById('type-filter').value;
    searchHouses(city, district, priceRange, houseType);
});
