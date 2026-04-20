function searchHouses(city, district, priceRange, houseType) {
    fetch(`/search?city=${city}&district=${district}&priceRange=${priceRange}&houseType=${houseType}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayResults(data);
        })
        .catch(error => console.error('Error:', error));
}

function displayResults(data) {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '';
    data.forEach(house => {
        const houseElement = document.createElement('div');
        houseElement.className = 'house-result';
        houseElement.innerHTML = `
            <h3>${house.name}</h3>
            <p>地址: ${house.address}</p>
            <p>每坪單價: ${house.priceperunit}</p>
            <p>總價: ${house.totalprice}</p>
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
