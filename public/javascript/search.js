function searchHouses(city, district, priceRange, houseType) {
    const params = new URLSearchParams({
        city: city || '',
        district: district || '',
        priceRange: priceRange || '',
        houseType: houseType || ''
    });

    fetch(`/search?${params.toString()}`)
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
        resultsContainer.innerHTML = '<div class="search-empty">沒有符合條件的建案。</div>';
        return;
    }

    const cardsWrapper = document.createElement('div');
    cardsWrapper.className = 'survey search-results-grid';

    data.forEach(house => {
        const houseElement = document.createElement('a');
        houseElement.className = 'property search-property';
        houseElement.href = `house.html?houseID=${house.id}`;
        houseElement.innerHTML = `
            <img src="image/NTU.jpg" alt="${house.name || 'House'}">
            <div class="property-details">
                <h3>${house.name || '未命名建案'}</h3>
                <p>總價：${formatTotalPrice(house.totalprice_wan || house.totalprice)}</p>
                <p>格局：${house.roomlayout || ''} / 坪數：${house.area || ''}</p>
                <p>地址：${house.address || ''}</p>
            </div>
        `;
        cardsWrapper.appendChild(houseElement);
    });

    resultsContainer.appendChild(cardsWrapper);
}

document.getElementById('search-btn').addEventListener('click', function() {
    const city = document.getElementById('cities').value;
    const district = document.getElementById('district').value;
    const priceRange = document.getElementById('price-filter').value;
    const houseType = document.getElementById('type-filter').value;
    searchHouses(city, district, priceRange, houseType);
});
