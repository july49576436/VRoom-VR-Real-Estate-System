document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.sidebar a[data-section]');

    const state = {
        house: { selectedId: null },
        image: { selectedId: null, houseID: 1 },
        price: { selectedId: null, houseID: 1 },
        community: { selectedId: null, houseID: 1 },
        latest: { selectedId: null, houseID: 1 },
        facility: { selectedId: null, houseID: 1 },
        filter: { selectedId: null },
    };

    const jsonHeaders = { 'Content-Type': 'application/json' };

    function showSection(sectionId) {
        sections.forEach((section) => section.classList.toggle('active', section.id === sectionId));
        navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('data-section') === sectionId));
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            showSection(link.getAttribute('data-section'));
        });
    });

    async function requestJson(url, options = {}) {
        const response = await fetch(url, {
            headers: {
                ...jsonHeaders,
                ...(options.headers || {}),
            },
            ...options,
        });

        let data = null;
        try {
            data = await response.json();
        } catch (error) {
            data = null;
        }

        if (!response.ok) {
            throw new Error(data?.message || `Request failed: ${response.status}`);
        }

        return data;
    }

    function serializeForm(form) {
        return Object.fromEntries(new FormData(form).entries());
    }

    function clearSelection(tbody) {
        tbody.querySelectorAll('tr').forEach((row) => row.classList.remove('selected-row'));
    }

    function selectedRow(tbody, id) {
        clearSelection(tbody);
        const row = tbody.querySelector(`tr[data-id="${CSS.escape(String(id))}"]`);
        if (row) row.classList.add('selected-row');
    }

    function fillForm(form, data) {
        Array.from(form.elements).forEach((element) => {
            if (!element.name) return;
            element.value = data[element.name] ?? '';
        });
    }

    function buildActions(primaryClass, secondaryClass) {
        return `
            <div class="row-actions">
                <button type="button" class="ghost-button ${primaryClass}">載入</button>
                <button type="button" class="danger ${secondaryClass}">刪除</button>
            </div>
        `;
    }

    // House
    const houseForm = document.getElementById('houseForm');
    const houseTableBody = document.getElementById('houseTableBody');
    const refreshHouses = document.getElementById('refreshHouses');
    const clearHouseForm = document.getElementById('clearHouseForm');
    const updateHouseBtn = document.getElementById('updateHouseBtn');
    const deleteHouseBtn = document.getElementById('deleteHouseBtn');

    async function loadHouses() {
        const rows = await requestJson('/api/admin/houses');
        houseTableBody.innerHTML = rows.map((house) => `
            <tr data-id="${house.houseID}">
                <td>${house.houseID}</td>
                <td>${house.Name || ''}</td>
                <td>${house.Address || ''}</td>
                <td>${house.PricePerUnit || ''}</td>
                <td>${house.TotalPrice || ''}</td>
                <td>${buildActions('load-house-btn', 'delete-house-btn')}</td>
            </tr>
        `).join('');
    }

    houseTableBody.addEventListener('click', async (event) => {
        const row = event.target.closest('tr');
        if (!row) return;
        const houseID = row.getAttribute('data-id');
        selectedRow(houseTableBody, houseID);
        const rows = await requestJson('/api/admin/houses');
        const house = rows.find((item) => String(item.houseID) === String(houseID));
        if (!house) return;
        if (event.target.classList.contains('load-house-btn')) {
            fillForm(houseForm, house);
            state.house.selectedId = house.houseID;
        }
        if (event.target.classList.contains('delete-house-btn')) {
            if (!confirm(`確定刪除建案 ${house.Name} 嗎？`)) return;
            await requestJson(`/api/admin/houses/${houseID}`, { method: 'DELETE' });
            await loadHouses();
            houseForm.reset();
            state.house.selectedId = null;
        }
    });

    houseForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = serializeForm(houseForm);
        delete payload.houseID;
        const result = await requestJson('/api/admin/houses', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        if (result.insertedId) {
            houseForm.houseID.value = result.insertedId;
            state.house.selectedId = result.insertedId;
        }
        await loadHouses();
        alert('建案已新增');
    });

    updateHouseBtn.addEventListener('click', async () => {
        const payload = serializeForm(houseForm);
        const id = payload.houseID || state.house.selectedId;
        if (!id) return alert('請先選擇建案');
        delete payload.houseID;
        await requestJson(`/api/admin/houses/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        await loadHouses();
        alert('建案已更新');
    });

    deleteHouseBtn.addEventListener('click', async () => {
        const payload = serializeForm(houseForm);
        const id = payload.houseID || state.house.selectedId;
        if (!id) return alert('請先選擇建案');
        if (!confirm(`確定刪除建案 ID ${id} 嗎？`)) return;
        await requestJson(`/api/admin/houses/${id}`, { method: 'DELETE' });
        houseForm.reset();
        state.house.selectedId = null;
        await loadHouses();
        alert('建案已刪除');
    });

    clearHouseForm.addEventListener('click', () => {
        houseForm.reset();
        state.house.selectedId = null;
        clearSelection(houseTableBody);
    });

    refreshHouses.addEventListener('click', loadHouses);

    // Search Filters
    const filterForm = document.getElementById('filterForm');
    const filterTableBody = document.getElementById('filterTableBody');
    const refreshFilters = document.getElementById('refreshFilters');
    const clearFilterForm = document.getElementById('clearFilterForm');
    const updateFilterBtn = document.getElementById('updateFilterBtn');
    const deleteFilterBtn = document.getElementById('deleteFilterBtn');

    async function loadFilters() {
        const rows = await requestJson('/api/admin/search-filters');
        filterTableBody.innerHTML = rows.map((filter) => `
            <tr data-id="${filter.filterID}">
                <td>${filter.filterID}</td>
                <td>${filter.city || ''}</td>
                <td>${filter.district || ''}</td>
                <td>${filter.PriceRange || ''}</td>
                <td>${filter.houseType || ''}</td>
                <td>${filter.houseID ?? ''}</td>
                <td>${buildActions('load-filter-btn', 'delete-filter-btn')}</td>
            </tr>
        `).join('');
    }

    filterTableBody.addEventListener('click', async (event) => {
        const row = event.target.closest('tr');
        if (!row) return;
        const filterID = row.getAttribute('data-id');
        selectedRow(filterTableBody, filterID);
        const rows = await requestJson('/api/admin/search-filters');
        const filter = rows.find((item) => String(item.filterID) === String(filterID));
        if (!filter) return;
        if (event.target.classList.contains('load-filter-btn')) {
            fillForm(filterForm, filter);
            state.filter.selectedId = filter.filterID;
        }
        if (event.target.classList.contains('delete-filter-btn')) {
            if (!confirm(`確定刪除搜尋條件 ID ${filterID} 嗎？`)) return;
            await requestJson(`/api/admin/search-filters/${filterID}`, { method: 'DELETE' });
            await loadFilters();
            filterForm.reset();
            state.filter.selectedId = null;
        }
    });

    filterForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = serializeForm(filterForm);
        delete payload.filterID;
        const result = await requestJson('/api/admin/search-filters', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        if (result.insertedId) {
            filterForm.filterID.value = result.insertedId;
            state.filter.selectedId = result.insertedId;
        }
        await loadFilters();
        alert('搜尋條件已新增');
    });

    updateFilterBtn.addEventListener('click', async () => {
        const payload = serializeForm(filterForm);
        const id = payload.filterID || state.filter.selectedId;
        if (!id) return alert('請先選擇搜尋條件');
        delete payload.filterID;
        await requestJson(`/api/admin/search-filters/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
        await loadFilters();
        alert('搜尋條件已更新');
    });

    deleteFilterBtn.addEventListener('click', async () => {
        const payload = serializeForm(filterForm);
        const id = payload.filterID || state.filter.selectedId;
        if (!id) return alert('請先選擇搜尋條件');
        if (!confirm(`確定刪除搜尋條件 ID ${id} 嗎？`)) return;
        await requestJson(`/api/admin/search-filters/${id}`, { method: 'DELETE' });
        filterForm.reset();
        state.filter.selectedId = null;
        await loadFilters();
        alert('搜尋條件已刪除');
    });

    clearFilterForm.addEventListener('click', () => {
        filterForm.reset();
        state.filter.selectedId = null;
        clearSelection(filterTableBody);
    });

    refreshFilters.addEventListener('click', loadFilters);

    // Generic entity helpers for house-linked CRUD
    function createLinkedModule(config) {
        const form = document.getElementById(config.formId);
        const tbody = document.getElementById(config.tableBodyId);
        const refreshBtn = document.getElementById(config.refreshBtnId);
        const clearBtn = document.getElementById(config.clearBtnId);
        const updateBtn = document.getElementById(config.updateBtnId);
        const deleteBtn = document.getElementById(config.deleteBtnId);
        const loadHouseBtn = document.getElementById(config.loadHouseBtnId);
        const linkedHouseInput = document.getElementById(config.houseInputId);
        const houseInput = form.querySelector(`[name="houseID"]`);
        const stateEntry = state[config.stateKey];

        function syncHouseID() {
            const sourceValue = linkedHouseInput ? linkedHouseInput.value : '';
            if (sourceValue) {
                houseInput.value = sourceValue;
            } else if (!houseInput.value) {
                houseInput.value = String(stateEntry.houseID || 1);
            }
        }

        async function loadList() {
            syncHouseID();
            const houseID = Number(houseInput.value || stateEntry.houseID || 1);
            stateEntry.houseID = houseID;
            const rows = await requestJson(`${config.listUrl(houseID)}`);
            tbody.innerHTML = rows.map((row) => config.rowTemplate(row)).join('');
        }

        tbody.addEventListener('click', async (event) => {
            const row = event.target.closest('tr');
            if (!row) return;
            const id = row.getAttribute('data-id');
            selectedRow(tbody, id);
            syncHouseID();
            const houseID = Number(houseInput.value || stateEntry.houseID || 1);
            const rows = await requestJson(config.listUrl(houseID));
            const item = rows.find((entry) => String(entry[config.idField]) === String(id));
            if (!item) return;
            if (event.target.classList.contains(config.loadBtnClass)) {
                fillForm(form, item);
                stateEntry.selectedId = item[config.idField];
                stateEntry.houseID = Number(item.houseID || houseID);
            }
            if (event.target.classList.contains(config.deleteBtnClass)) {
                if (!confirm(`確定刪除 ID ${id} 嗎？`)) return;
                await requestJson(config.deleteUrl(id), { method: 'DELETE' });
                await loadList();
                form.reset();
                stateEntry.selectedId = null;
            }
        });

        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const payload = serializeForm(form);
            delete payload[config.idField];
            const houseID = Number(payload.houseID || stateEntry.houseID || 1);
            stateEntry.houseID = houseID;
            const result = await requestJson(config.createUrl(houseID), {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            if (result.insertedId) {
                form[config.idField].value = result.insertedId;
                stateEntry.selectedId = result.insertedId;
            }
            await loadList();
            alert(config.createdMessage);
        });

        updateBtn.addEventListener('click', async () => {
            syncHouseID();
            const payload = serializeForm(form);
            const id = payload[config.idField] || stateEntry.selectedId;
            if (!id) return alert(config.selectMessage);
            delete payload[config.idField];
            await requestJson(config.updateUrl(id), { method: 'PUT', body: JSON.stringify(payload) });
            await loadList();
            alert(config.updatedMessage);
        });

        deleteBtn.addEventListener('click', async () => {
            syncHouseID();
            const payload = serializeForm(form);
            const id = payload[config.idField] || stateEntry.selectedId;
            if (!id) return alert(config.selectMessage);
            if (!confirm(`確定刪除 ID ${id} 嗎？`)) return;
            await requestJson(config.deleteUrl(id), { method: 'DELETE' });
            form.reset();
            stateEntry.selectedId = null;
            await loadList();
            alert(config.deletedMessage);
        });

        clearBtn.addEventListener('click', () => {
            form.reset();
            stateEntry.selectedId = null;
            clearSelection(tbody);
        });

        loadHouseBtn.addEventListener('click', () => {
            syncHouseID();
            loadList();
        });
        refreshBtn.addEventListener('click', loadList);

        return { loadList };
    }

    const imageModule = createLinkedModule({
        stateKey: 'image',
        formId: 'imageForm',
        tableBodyId: 'imageTableBody',
        refreshBtnId: 'refreshImages',
        clearBtnId: 'clearImageForm',
        updateBtnId: 'updateImageBtn',
        deleteBtnId: 'deleteImageBtn',
        loadHouseBtnId: 'loadImageHouseBtn',
        houseInputId: 'imageHouseID',
        idField: 'ImageID',
        loadBtnClass: 'load-image-btn',
        deleteBtnClass: 'delete-image-btn',
        listUrl: (houseID) => `/api/admin/houses/${houseID}/images`,
        createUrl: (houseID) => `/api/admin/houses/${houseID}/images`,
        updateUrl: (id) => `/api/admin/images/${id}`,
        deleteUrl: (id) => `/api/admin/images/${id}`,
        rowTemplate: (row) => `
            <tr data-id="${row.ImageID}">
                <td>${row.ImageID}</td>
                <td>${row.houseID}</td>
                <td>${row.Img || ''}</td>
                <td>${row.Img_description || ''}</td>
                <td>${buildActions('load-image-btn', 'delete-image-btn')}</td>
            </tr>
        `,
        createdMessage: '房屋圖片已新增',
        updatedMessage: '房屋圖片已更新',
        deletedMessage: '房屋圖片已刪除',
        selectMessage: '請先選擇圖片',
    });

    const priceModule = createLinkedModule({
        stateKey: 'price',
        formId: 'priceForm',
        tableBodyId: 'priceTableBody',
        refreshBtnId: 'refreshPrices',
        clearBtnId: 'clearPriceForm',
        updateBtnId: 'updatePriceBtn',
        deleteBtnId: 'deletePriceBtn',
        loadHouseBtnId: 'loadPriceHouseBtn',
        houseInputId: 'priceHouseID',
        idField: 'PriceID',
        loadBtnClass: 'load-price-btn',
        deleteBtnClass: 'delete-price-btn',
        listUrl: (houseID) => `/api/admin/houses/${houseID}/prices`,
        createUrl: (houseID) => `/api/admin/houses/${houseID}/prices`,
        updateUrl: (id) => `/api/admin/prices/${id}`,
        deleteUrl: (id) => `/api/admin/prices/${id}`,
        rowTemplate: (row) => `
            <tr data-id="${row.PriceID}">
                <td>${row.PriceID}</td>
                <td>${row.houseID}</td>
                <td>${row.TransactionDate || ''}</td>
                <td>${row.Floor || ''}</td>
                <td>${row.PricePerUnit || ''}</td>
                <td>${row.TotalPrice || ''}</td>
                <td>${buildActions('load-price-btn', 'delete-price-btn')}</td>
            </tr>
        `,
        createdMessage: '價格紀錄已新增',
        updatedMessage: '價格紀錄已更新',
        deletedMessage: '價格紀錄已刪除',
        selectMessage: '請先選擇價格紀錄',
    });

    const communityModule = createLinkedModule({
        stateKey: 'community',
        formId: 'communityForm',
        tableBodyId: 'communityTableBody',
        refreshBtnId: 'refreshCommunity',
        clearBtnId: 'clearCommunityForm',
        updateBtnId: 'updateCommunityBtn',
        deleteBtnId: 'deleteCommunityBtn',
        loadHouseBtnId: 'loadCommunityHouseBtn',
        houseInputId: 'communityHouseID',
        idField: 'community_ID',
        loadBtnClass: 'load-community-btn',
        deleteBtnClass: 'delete-community-btn',
        listUrl: (houseID) => `/api/admin/houses/${houseID}/community-planning`,
        createUrl: (houseID) => `/api/admin/houses/${houseID}/community-planning`,
        updateUrl: (id) => `/api/admin/community-planning/${id}`,
        deleteUrl: (id) => `/api/admin/community-planning/${id}`,
        rowTemplate: (row) => `
            <tr data-id="${row.community_ID}">
                <td>${row.community_ID}</td>
                <td>${row.houseID}</td>
                <td>${row.BuildingInfo || ''}</td>
                <td>${row.ParkingType || ''}</td>
                <td>${row.ManagementFee || ''}</td>
                <td>${buildActions('load-community-btn', 'delete-community-btn')}</td>
            </tr>
        `,
        createdMessage: '社區規劃已新增',
        updatedMessage: '社區規劃已更新',
        deletedMessage: '社區規劃已刪除',
        selectMessage: '請先選擇社區規劃',
    });

    const latestModule = createLinkedModule({
        stateKey: 'latest',
        formId: 'latestForm',
        tableBodyId: 'latestTableBody',
        refreshBtnId: 'refreshLatest',
        clearBtnId: 'clearLatestForm',
        updateBtnId: 'updateLatestBtn',
        deleteBtnId: 'deleteLatestBtn',
        loadHouseBtnId: 'loadLatestHouseBtn',
        houseInputId: 'latestHouseID',
        idField: 'newsID',
        loadBtnClass: 'load-latest-btn',
        deleteBtnClass: 'delete-latest-btn',
        listUrl: (houseID) => `/api/admin/houses/${houseID}/latest-news`,
        createUrl: (houseID) => `/api/admin/houses/${houseID}/latest-news`,
        updateUrl: (id) => `/api/admin/latest-news/${id}`,
        deleteUrl: (id) => `/api/admin/latest-news/${id}`,
        rowTemplate: (row) => `
            <tr data-id="${row.newsID}">
                <td>${row.newsID}</td>
                <td>${row.houseID}</td>
                <td>${row.con_date || ''}</td>
                <td>${row.house_state || ''}</td>
                <td>${row.content_describe || ''}</td>
                <td>${buildActions('load-latest-btn', 'delete-latest-btn')}</td>
            </tr>
        `,
        createdMessage: '最新消息已新增',
        updatedMessage: '最新消息已更新',
        deletedMessage: '最新消息已刪除',
        selectMessage: '請先選擇最新消息',
    });

    const facilityModule = createLinkedModule({
        stateKey: 'facility',
        formId: 'facilityForm',
        tableBodyId: 'facilityTableBody',
        refreshBtnId: 'refreshFacilities',
        clearBtnId: 'clearFacilityForm',
        updateBtnId: 'updateFacilityBtn',
        deleteBtnId: 'deleteFacilityBtn',
        loadHouseBtnId: 'loadFacilityHouseBtn',
        houseInputId: 'facilityHouseID',
        idField: 'facilityID',
        loadBtnClass: 'load-facility-btn',
        deleteBtnClass: 'delete-facility-btn',
        listUrl: (houseID) => `/api/admin/houses/${houseID}/surrounding-facilities`,
        createUrl: (houseID) => `/api/admin/houses/${houseID}/surrounding-facilities`,
        updateUrl: (id) => `/api/admin/surrounding-facilities/${id}`,
        deleteUrl: (id) => `/api/admin/surrounding-facilities/${id}`,
        rowTemplate: (row) => `
            <tr data-id="${row.facilityID}">
                <td>${row.facilityID}</td>
                <td>${row.houseID}</td>
                <td>${row.mapURL || ''}</td>
                <td>${buildActions('load-facility-btn', 'delete-facility-btn')}</td>
            </tr>
        `,
        createdMessage: '周邊設施已新增',
        updatedMessage: '周邊設施已更新',
        deletedMessage: '周邊設施已刪除',
        selectMessage: '請先選擇周邊設施',
    });

    // Fill houseID defaults into linked modules and load them once.
    imageModule.loadList().catch(() => {});
    priceModule.loadList().catch(() => {});
    communityModule.loadList().catch(() => {});
    latestModule.loadList().catch(() => {});
    facilityModule.loadList().catch(() => {});

    loadHouses().catch((error) => console.error(error));
    loadFilters().catch((error) => console.error(error));
    showSection('house-crud');
});
