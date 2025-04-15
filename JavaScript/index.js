// DOM Elements
const showSetMaxBtn = document.getElementById('showSetMax');
const clearDataBtn = document.getElementById('clearData');
const setMaxForm = document.getElementById('setMax');
const combinedView = document.getElementById('combinedView');
const addDataForm = document.getElementById('addData');
const formMessage = document.getElementById('formMessage');
const maxValueMessage = document.getElementById('maxValueMessage');

// Toggle buttons
const toggleTopBtn = document.getElementById('toggleTop');
const toggleDownBtn = document.getElementById('toggleDown');
const toggle3Btn = document.getElementById('toggle3');
const toggle2Btn = document.getElementById('toggle2');

// Table elements
const dataTable3digits = document.getElementById('dataTable3digits');
const dataTable2digits = document.getElementById('dataTable2digits');
const tableBody3digits = document.getElementById('tableBody3digits');
const tableBody2digits = document.getElementById('tableBody2digits');
const searchInput3 = document.getElementById('searchInput3');
const searchInput2 = document.getElementById('searchInput2');
const prevPage3 = document.getElementById('prevPage3');
const nextPage3 = document.getElementById('nextPage3');
const pageInfo3 = document.getElementById('pageInfo3');
const prevPage2 = document.getElementById('prevPage2');
const nextPage2 = document.getElementById('nextPage2');
const pageInfo2 = document.getElementById('pageInfo2');
const exportAllDataBtn = document.getElementById('exportAllData');

// Summary tables
const numberSummaryBody = document.getElementById('numberSummaryBody');
const summaryBody = document.getElementById('summaryBody');

// Form inputs
const lotteryNumberInput = document.getElementById('lotteryNumber');
const customerNameInput = document.getElementById('customerName');
const buyTypeTextInput = document.getElementById('buyTypeText');
const directValueInput = document.getElementById('directValue');
const indirectValueInput = document.getElementById('indirectValue');
const submitBtn = addDataForm.querySelector('.submit-button');

// Max value inputs
const top3DirectInput = document.getElementById('top3Direct');
const top3IndirectInput = document.getElementById('top3Indirect');
const top2DirectInput = document.getElementById('top2Direct');
const down3DirectInput = document.getElementById('down3Direct');
const down2DirectInput = document.getElementById('down2Direct');

// Display max values
const currentTop3DirectIndirectValues = document.getElementById('currentTop3DirectIndirectValues');
const currentTop2DirectValues = document.getElementById('currentTop2DirectValues');
const currentDown3DirectValues = document.getElementById('currentDown3DirectValues');
const currentDown2DirectValues = document.getElementById('currentDown2DirectValues');

// Data storage
let lotteryData = {
    top3: [],
    top2: [],
    down3: [],
    down2: []
};

let currentMaxValues = {
    top3Direct: 0,
    top3Indirect: 0,
    top2Direct: 0,
    down3Direct: 0,
    down2Direct: 0
};

// Pagination
const itemsPerPage = 10;
let currentPage3 = 1;
let currentPage2 = 1;
let filteredData3 = [];
let filteredData2 = [];

// Initialize the app
function init() {
    loadData();
    loadMaxValues();
    updateUI();
    setupEventListeners();
}

// Load saved data from localStorage
function loadData() {
    const savedData = localStorage.getItem('lotteryData');
    if (savedData) {
        lotteryData = JSON.parse(savedData);
    }
}

// Load max values from localStorage
function loadMaxValues() {
    const savedMaxValues = localStorage.getItem('lotteryMaxValues');
    if (savedMaxValues) {
        currentMaxValues = JSON.parse(savedMaxValues);
        updateMaxValueDisplays();
        updateMaxValueInputs();
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('lotteryData', JSON.stringify(lotteryData));
}

// Save max values to localStorage
function saveMaxValues() {
    localStorage.setItem('lotteryMaxValues', JSON.stringify(currentMaxValues));
    updateMaxValueDisplays();
}

// Update max value displays
function updateMaxValueDisplays() {
    currentTop3DirectIndirectValues.textContent = `${currentMaxValues.top3Direct} x ${currentMaxValues.top3Indirect}`;
    currentTop2DirectValues.textContent = currentMaxValues.top2Direct;
    currentDown3DirectValues.textContent = currentMaxValues.down3Direct;
    currentDown2DirectValues.textContent = currentMaxValues.down2Direct;
}

// Update max value inputs
function updateMaxValueInputs() {
    top3DirectInput.value = currentMaxValues.top3Direct;
    top3IndirectInput.value = currentMaxValues.top3Indirect;
    top2DirectInput.value = currentMaxValues.top2Direct;
    down3DirectInput.value = currentMaxValues.down3Direct;
    down2DirectInput.value = currentMaxValues.down2Direct;
}

// Setup event listeners
function setupEventListeners() {
    // Show/hide set max form
    showSetMaxBtn.addEventListener('click', () => {
        setMaxForm.classList.toggle('hidden');
    });

    // Clear all data
    clearDataBtn.addEventListener('click', () => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถยกเลิกได้')) {
            lotteryData = {
                top3: [],
                top2: [],
                down3: [],
                down2: []
            };
            saveData();
            updateUI();
            showMessage('ลบข้อมูลทั้งหมดเรียบร้อยแล้ว', 'success');
        }
    });

    // Form submission for adding data
    addDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (addLotteryData()) {
            // ไม่ต้อง reset ทั้งฟอร์ม แต่เคลียร์เฉพาะช่องที่ต้องการ
            submitBtn.disabled = true;
            submitBtn.classList.add('disabled-button');
        }
    });

    // Input validation for lottery number
    lotteryNumberInput.addEventListener('input', (e) => {
        const is3Digits = toggle3Btn.classList.contains('active');
        const maxLength = is3Digits ? 3 : 2;
        
        // จำกัดจำนวนตัวเลขตามที่เลือก
        e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, maxLength);
        validateForm();
    });

    // Input validation for customer name
    customerNameInput.addEventListener('input', (e) => {
        // อนุญาตให้มีตัวเลขและช่องว่างได้ แต่ต้องมีตัวอักษรอย่างน้อย 1 ตัว
        e.target.value = e.target.value.replace(/[^ก-๙a-zA-Z0-9\s]/g, '');
        validateForm();
    });

    // Direct/indirect value inputs
    directValueInput.addEventListener('input', validateForm);
    indirectValueInput.addEventListener('input', validateForm);

    // Toggle buttons
    toggleTopBtn.addEventListener('click', () => {
        toggleTopBtn.classList.add('active');
        toggleDownBtn.classList.remove('active');
        buyTypeTextInput.value = 'ตัวบน';
        validateForm();
        updateUI();
    });

    toggleDownBtn.addEventListener('click', () => {
        toggleDownBtn.classList.add('active');
        toggleTopBtn.classList.remove('active');
        buyTypeTextInput.value = 'ตัวล่าง';
        validateForm();
        updateUI();
    });

    toggle3Btn.addEventListener('click', () => {
        toggle3Btn.classList.add('active');
        toggle2Btn.classList.remove('active');
        validateForm();
        updateUI();
    });

    toggle2Btn.addEventListener('click', () => {
        toggle2Btn.classList.add('active');
        toggle3Btn.classList.remove('active');
        validateForm();
        updateUI();
    });

    // Search functionality
    searchInput3.addEventListener('input', () => {
        currentPage3 = 1;
        filterAndDisplayData();
    });

    searchInput2.addEventListener('input', () => {
        currentPage2 = 1;
        filterAndDisplayData();
    });

    // Pagination
    prevPage3.addEventListener('click', () => {
        if (currentPage3 > 1) {
            currentPage3--;
            filterAndDisplayData();
        }
    });

    nextPage3.addEventListener('click', () => {
        const maxPage = Math.ceil(filteredData3.length / itemsPerPage);
        if (currentPage3 < maxPage) {
            currentPage3++;
            filterAndDisplayData();
        }
    });

    prevPage2.addEventListener('click', () => {
        if (currentPage2 > 1) {
            currentPage2--;
            filterAndDisplayData();
        }
    });

    nextPage2.addEventListener('click', () => {
        const maxPage = Math.ceil(filteredData2.length / itemsPerPage);
        if (currentPage2 < maxPage) {
            currentPage2++;
            filterAndDisplayData();
        }
    });

    // Export data
    exportAllDataBtn.addEventListener('click', exportAllData);

    // Confirm buttons for max values
    const confirmButtons = document.querySelectorAll('.confirm-btn');
    confirmButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            confirmMaxValue(type);
        });
    });
}

// Validate form inputs
function validateForm() {
    const isTop = toggleTopBtn.classList.contains('active');
    const is3Digits = toggle3Btn.classList.contains('active');
    
    // ตรวจสอบความยาวเลขหวยตามที่เลือก
    const requiredLength = is3Digits ? 3 : 2;
    const numberValid = lotteryNumberInput.value.length === requiredLength;
    
    // ตรวจสอบชื่อลูกค้า (ต้องไม่ว่างเปล่าและต้องมีตัวอักษรอย่างน้อย 1 ตัว)
    const nameValue = customerNameInput.value.trim();
    const nameValid = nameValue.length > 0 && /[ก-๙a-zA-Z]/.test(nameValue);
    
    // Validate direct value (required)
    const directValue = parseInt(directValueInput.value) || 0;
    const directValid = !isNaN(directValue) && directValue >= 0;
    
    // Validate indirect value (required for top3 only)
    let indirectValid = true;
    const indirectValue = parseInt(indirectValueInput.value) || 0;
    
    if (isTop && is3Digits) {
        indirectValid = !isNaN(indirectValue) && indirectValue >= 0;
        
        // สำหรับ 3 ตัวบน ต้องกรอกค่าตรงหรือโต๊ดอย่างน้อยหนึ่งค่า
        if (directValue === 0 && indirectValue === 0) {
            showMessage('กรุณากรอกค่าตรงหรือโต๊ดอย่างน้อยหนึ่งค่า', 'error');
            return false;
        }
    }
    
    // Enable/disable submit button
    if (numberValid && nameValid && directValid && indirectValid) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled-button');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled-button');
    }
    
    return numberValid && nameValid && directValid && indirectValid;
}

// Add new lottery data
function addLotteryData() {
    if (!validateForm()) return false;

    const isTop = toggleTopBtn.classList.contains('active');
    const is3Digits = toggle3Btn.classList.contains('active');
    
    const newEntry = {
        number: lotteryNumberInput.value,
        name: customerNameInput.value.trim(),
        type: isTop ? 'ตัวบน' : 'ตัวล่าง',
        direct: parseInt(directValueInput.value) || 0,
        indirect: (isTop && is3Digits) ? (parseInt(indirectValueInput.value) || 0) : 0,
        timestamp: new Date().getTime()
    };

    // ตรวจสอบอีกครั้งว่าค่าเป็น 0 ทั้งคู่หรือไม่ (สำหรับกรณีที่ bypass validation)
    if (isTop && is3Digits && newEntry.direct === 0 && newEntry.indirect === 0) {
        showMessage('กรุณากรอกค่าตรงหรือโต๊ดอย่างน้อยหนึ่งค่า', 'error');
        return false;
    }

    // Determine which array to add to
    let targetArray;
    if (isTop) {
        targetArray = is3Digits ? lotteryData.top3 : lotteryData.top2;
    } else {
        targetArray = is3Digits ? lotteryData.down3 : lotteryData.down2;
    }

    // Add to array and save
    targetArray.push(newEntry);
    saveData();
    
    // Update UI and show success message
    updateUI();
    showMessage('เพิ่มข้อมูลเรียบร้อยแล้ว', 'success');
    
    // เคลียร์เฉพาะช่องเลขหวยและจำนวนเงิน (ไม่เคลียร์ชื่อลูกค้าและประเภท)
    lotteryNumberInput.value = '';
    directValueInput.value = '';
    indirectValueInput.value = '';
    
    // โฟกัสไปที่ช่องเลขหวยเพื่อเตรียมกรอกข้อมูลถัดไป
    lotteryNumberInput.focus();
    
    return true;
}

// Confirm max value changes
function confirmMaxValue(type) {
    let isValid = true;
    
    switch (type) {
        case 'top3':
            const top3Direct = parseInt(top3DirectInput.value) || 0;
            const top3Indirect = parseInt(top3IndirectInput.value) || 0;
            
            if (top3Direct < 0 || top3Indirect < 0) {
                showMessage('ค่าต้องมากกว่าหรือเท่ากับ 0', 'error', maxValueMessage);
                isValid = false;
            } else {
                currentMaxValues.top3Direct = top3Direct;
                currentMaxValues.top3Indirect = top3Indirect;
                
                // เคลียร์เฉพาะช่อง 3 ตัวบน
                top3DirectInput.value = '';
                top3IndirectInput.value = '';
            }
            break;
            
        case 'top2':
            const top2Direct = parseInt(top2DirectInput.value) || 0;
            
            if (top2Direct < 0) {
                showMessage('ค่าต้องมากกว่าหรือเท่ากับ 0', 'error', maxValueMessage);
                isValid = false;
            } else {
                currentMaxValues.top2Direct = top2Direct;
                
                // เคลียร์เฉพาะช่อง 2 ตัวบน
                top2DirectInput.value = '';
            }
            break;
            
        case 'down3':
            const down3Direct = parseInt(down3DirectInput.value) || 0;
            
            if (down3Direct < 0) {
                showMessage('ค่าต้องมากกว่าหรือเท่ากับ 0', 'error', maxValueMessage);
                isValid = false;
            } else {
                currentMaxValues.down3Direct = down3Direct;
                
                // เคลียร์เฉพาะช่อง 3 ตัวล่าง
                down3DirectInput.value = '';
            }
            break;
            
        case 'down2':
            const down2Direct = parseInt(down2DirectInput.value) || 0;
            
            if (down2Direct < 0) {
                showMessage('ค่าต้องมากกว่าหรือเท่ากับ 0', 'error', maxValueMessage);
                isValid = false;
            } else {
                currentMaxValues.down2Direct = down2Direct;
                
                // เคลียร์เฉพาะช่อง 2 ตัวล่าง
                down2DirectInput.value = '';
            }
            break;
    }
    
    if (isValid) {
        saveMaxValues();
        showMessage('บันทึกค่าสูงสุดเรียบร้อยแล้ว', 'success', maxValueMessage);
        updateUI();
        
        // ไม่ต้อง reset ทั้งฟอร์ม แต่เคลียร์แค่ช่องที่ยืนยันแล้ว (ด้านบน)
        // setMaxForm.classList.add('hidden'); // ถ้าต้องการซ่อนฟอร์มหลังยืนยัน
    }
}

// Filter and display data based on search and current view
function filterAndDisplayData() {
    const isTop = toggleTopBtn.classList.contains('active');
    const is3Digits = toggle3Btn.classList.contains('active');
    const searchTerm = (is3Digits ? searchInput3 : searchInput2).value.toLowerCase();
    
    // Determine which data to display
    let dataToDisplay;
    if (isTop) {
        dataToDisplay = is3Digits ? [...lotteryData.top3] : [...lotteryData.top2];
    } else {
        dataToDisplay = is3Digits ? [...lotteryData.down3] : [...lotteryData.down2];
    }
    
    // Filter data based on search term
    if (is3Digits) {
        filteredData3 = dataToDisplay.filter(item => 
            item.number.includes(searchTerm) || 
            item.name.toLowerCase().includes(searchTerm)
        );
        displayData(filteredData3, tableBody3digits, currentPage3, pageInfo3, is3Digits);
    } else {
        filteredData2 = dataToDisplay.filter(item => 
            item.number.includes(searchTerm) || 
            item.name.toLowerCase().includes(searchTerm)
        );
        displayData(filteredData2, tableBody2digits, currentPage2, pageInfo2, is3Digits);
    }
    
    // Update summary tables
    updateSummaryTables();
}

// Display data in table with pagination
function displayData(data, tableBody, currentPage, pageInfo, is3Digits) {
    tableBody.innerHTML = '';
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, data.length);
    const paginatedData = data.slice(startIndex, endIndex);
    
    // สร้างอ็อบเจ็กต์เพื่อเก็บข้อมูลยอดรวมของแต่ละเลข
    const numberTotals = {};
    
    // คำนวณยอดรวมทั้งหมดก่อน
    data.forEach(item => {
        const key = `${item.number}-${item.type}-${is3Digits ? '3ตัว' : '2ตัว'}`;
        if (!numberTotals[key]) {
            numberTotals[key] = { direct: 0, indirect: 0 };
        }
        numberTotals[key].direct += item.direct;
        numberTotals[key].indirect += item.indirect || 0;
    });
    
    // ตรวจสอบรายการล่าสุดที่ทำให้เกิน
    const exceededEntries = {};
    data.forEach(item => {
        const key = `${item.number}-${item.type}-${is3Digits ? '3ตัว' : '2ตัว'}`;
        const totals = numberTotals[key];
        const digitType = is3Digits ? '3ตัว' : '2ตัว';
        
        let maxDirect = 0;
        let maxIndirect = 0;
        
        if (digitType === '3ตัว' && item.type === 'ตัวบน') {
            maxDirect = currentMaxValues.top3Direct;
            maxIndirect = currentMaxValues.top3Indirect;
        }
        else if (digitType === '2ตัว' && item.type === 'ตัวบน') {
            maxDirect = currentMaxValues.top2Direct;
        }
        else if (digitType === '3ตัว' && item.type === 'ตัวล่าง') {
            maxDirect = currentMaxValues.down3Direct;
        }
        else if (digitType === '2ตัว' && item.type === 'ตัวล่าง') {
            maxDirect = currentMaxValues.down2Direct;
        }
        
        if (totals.direct > maxDirect || totals.indirect > maxIndirect) {
            exceededEntries[key] = item.timestamp; // เก็บ timestamp ของรายการล่าสุด
        }
    });
    
    // แสดงข้อมูลในตาราง
    paginatedData.forEach((item, index) => {
        const row = document.createElement('tr');
        const key = `${item.number}-${item.type}-${is3Digits ? '3ตัว' : '2ตัว'}`;
        const isLatestExceeded = exceededEntries[key] === item.timestamp;
        
        let note = '';
        let isExceeded = false;
        
        if (isLatestExceeded) {
            const totals = numberTotals[key];
            const digitType = is3Digits ? '3ตัว' : '2ตัว';
            
            if (digitType === '3ตัว' && item.type === 'ตัวบน') {
                if (totals.direct > currentMaxValues.top3Direct) {
                    note = 'เกินค่าสูงสุด (ตรง)';
                    isExceeded = true;
                }
                if (totals.indirect > currentMaxValues.top3Indirect) {
                    note = note ? note + ', เกินค่าสูงสุด (โต๊ด)' : 'เกินค่าสูงสุด (โต๊ด)';
                    isExceeded = true;
                }
            }
            else if (digitType === '2ตัว' && item.type === 'ตัวบน') {
                if (totals.direct > currentMaxValues.top2Direct) {
                    note = 'เกินค่าสูงสุด';
                    isExceeded = true;
                }
            }
            else if (digitType === '3ตัว' && item.type === 'ตัวล่าง') {
                if (totals.direct > currentMaxValues.down3Direct) {
                    note = 'เกินค่าสูงสุด';
                    isExceeded = true;
                }
            }
            else if (digitType === '2ตัว' && item.type === 'ตัวล่าง') {
                if (totals.direct > currentMaxValues.down2Direct) {
                    note = 'เกินค่าสูงสุด';
                    isExceeded = true;
                }
            }
        }
        
        // Add cells to row
        row.innerHTML = `
            <td>${item.number}</td>
            <td>${item.type}</td>
            <td>${item.name}</td>
            <td>${item.direct}</td>
            <td>${is3Digits ? item.indirect : '-'}</td>
            <td class="${isExceeded ? 'exceed-limit' : ''}">${note}</td>
            <td>
                <button class="edit-btn action-btn" data-id="${item.timestamp}">แก้ไข</button>
                <button class="delete-btn action-btn" data-id="${item.timestamp}">ลบ</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update pagination info
    const totalPages = Math.ceil(data.length / itemsPerPage);
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    // Enable/disable pagination buttons
    if (is3Digits) {
        prevPage3.disabled = currentPage === 1;
        nextPage3.disabled = currentPage === totalPages || totalPages === 0;
    } else {
        prevPage2.disabled = currentPage === 1;
        nextPage2.disabled = currentPage === totalPages || totalPages === 0;
    }
    
    // Add event listeners to edit/delete buttons
    addEditDeleteListeners();
}

// Update summary tables
function updateSummaryTables() {
    // Number summary table
    updateNumberSummaryTable();
    
    // Customer summary table
    updateCustomerSummaryTable();
}

// Update number summary table
function updateNumberSummaryTable() {
    numberSummaryBody.innerHTML = '';
    
    // Combine all data
    const allData = [
        ...lotteryData.top3.map(item => ({ ...item, digitType: '3ตัวบน' })),
        ...lotteryData.top2.map(item => ({ ...item, digitType: '2ตัวบน' })),
        ...lotteryData.down3.map(item => ({ ...item, digitType: '3ตัวล่าง' })),
        ...lotteryData.down2.map(item => ({ ...item, digitType: '2ตัวล่าง' }))
    ];
    
    // Group by number and type
    const numberGroups = {};
    
    allData.forEach(item => {
        const key = `${item.number}-${item.type}-${item.digitType}`;
        if (!numberGroups[key]) {
            numberGroups[key] = {
                number: item.number,
                type: item.type,
                digitType: item.digitType,
                names: new Set(), // ใช้ Set เพื่อเก็บชื่อที่ไม่ซ้ำ
                directTotal: 0,
                indirectTotal: 0
            };
        }
        
        // เพิ่มชื่อเข้า Set (จะไม่เพิ่มถ้าซ้ำ)
        numberGroups[key].names.add(item.name);
        
        numberGroups[key].directTotal += item.direct;
        numberGroups[key].indirectTotal += item.indirect || 0;
    });
    
    // Convert to array and sort
    const summaryArray = Object.values(numberGroups).sort((a, b) => {
        if (a.digitType !== b.digitType) {
            return a.digitType.localeCompare(b.digitType);
        }
        return a.number.localeCompare(b.number);
    });
    
    // Add rows to table
    summaryArray.forEach(item => {
        const row = document.createElement('tr');
        
        // แปลง Set เป็น Array และรวมเป็น string
        const uniqueNames = Array.from(item.names).join(', ');
        
        row.innerHTML = `
            <td>${item.number}</td>
            <td>${item.digitType} ${item.type}</td>
            <td>${uniqueNames}</td>
            <td>${item.directTotal}</td>
            <td>${item.indirectTotal}</td>
            <td>${item.directTotal + item.indirectTotal}</td>
        `;
        numberSummaryBody.appendChild(row);
    });
}

// Update customer summary table
function updateCustomerSummaryTable() {
    summaryBody.innerHTML = '';
    
    // Combine all data and group by customer name
    const allData = [
        ...lotteryData.top3.map(item => ({ ...item, digitType: '3ตัวบน' })),
        ...lotteryData.top2.map(item => ({ ...item, digitType: '2ตัวบน' })),
        ...lotteryData.down3.map(item => ({ ...item, digitType: '3ตัวล่าง' })),
        ...lotteryData.down2.map(item => ({ ...item, digitType: '2ตัวล่าง' }))
    ];
    
    const customerGroups = {};
    
    allData.forEach(item => {
        if (!customerGroups[item.name]) {
            customerGroups[item.name] = {
                name: item.name,
                numbers: [],
                topDirect: 0,
                topIndirect: 0,
                downDirect: 0,
                downIndirect: 0
            };
        }
        
        // Add number to list (avoid duplicates)
        if (!customerGroups[item.name].numbers.includes(item.number)) {
            customerGroups[item.name].numbers.push(item.number);
        }
        
        // Add to appropriate total
        if (item.type === 'ตัวบน') {
            customerGroups[item.name].topDirect += item.direct;
            customerGroups[item.name].topIndirect += item.indirect;
        } else {
            customerGroups[item.name].downDirect += item.direct;
            customerGroups[item.name].downIndirect += item.indirect;
        }
    });
    
    // Convert to array and sort
    const summaryArray = Object.values(customerGroups).sort((a, b) => a.name.localeCompare(b.name));
    
    // Add rows to table
    summaryArray.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.numbers.join(', ')}</td>
            <td>${item.topDirect}</td>
            <td>${item.topIndirect}</td>
            <td>${item.downDirect + item.downIndirect}</td>
            <td>${item.topDirect + item.topIndirect + item.downDirect + item.downIndirect}</td>
        `;
        summaryBody.appendChild(row);
    });
}

// Add event listeners to edit and delete buttons
function addEditDeleteListeners() {
    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const timestamp = parseInt(e.target.dataset.id);
            editEntry(timestamp);
        });
    });
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const timestamp = parseInt(e.target.dataset.id);
            deleteEntry(timestamp);
        });
    });
}

// Edit an entry
function editEntry(timestamp) {
    // Find the entry in the data
    let entry = null;
    let dataType = null;
    
    if (lotteryData.top3.some(item => item.timestamp === timestamp)) {
        entry = lotteryData.top3.find(item => item.timestamp === timestamp);
        dataType = 'top3';
    } else if (lotteryData.top2.some(item => item.timestamp === timestamp)) {
        entry = lotteryData.top2.find(item => item.timestamp === timestamp);
        dataType = 'top2';
    } else if (lotteryData.down3.some(item => item.timestamp === timestamp)) {
        entry = lotteryData.down3.find(item => item.timestamp === timestamp);
        dataType = 'down3';
    } else if (lotteryData.down2.some(item => item.timestamp === timestamp)) {
        entry = lotteryData.down2.find(item => item.timestamp === timestamp);
        dataType = 'down2';
    }
    
    if (!entry) return;
    
    // Set form values based on entry
    lotteryNumberInput.value = entry.number;
    customerNameInput.value = entry.name;
    
    // Set toggle buttons
    if (entry.type === 'ตัวบน') {
        toggleTopBtn.click();
    } else {
        toggleDownBtn.click();
    }
    
    if (dataType === 'top3' || dataType === 'down3') {
        toggle3Btn.click();
    } else {
        toggle2Btn.click();
    }
    
    directValueInput.value = entry.direct;
    if (dataType === 'top3') {
        indirectValueInput.value = entry.indirect;
    } else {
        indirectValueInput.value = '';
    }
    
    // Remove the entry from data
    if (dataType === 'top3') {
        lotteryData.top3 = lotteryData.top3.filter(item => item.timestamp !== timestamp);
    } else if (dataType === 'top2') {
        lotteryData.top2 = lotteryData.top2.filter(item => item.timestamp !== timestamp);
    } else if (dataType === 'down3') {
        lotteryData.down3 = lotteryData.down3.filter(item => item.timestamp !== timestamp);
    } else if (dataType === 'down2') {
        lotteryData.down2 = lotteryData.down2.filter(item => item.timestamp !== timestamp);
    }
    
    saveData();
    validateForm();
    showMessage('นำข้อมูลออกเพื่อแก้ไข กรุณายืนยันอีกครั้งหลังจากแก้ไข', 'success');
}

// Delete an entry
function deleteEntry(timestamp) {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
        let found = false;
        
        if (lotteryData.top3.some(item => item.timestamp === timestamp)) {
            lotteryData.top3 = lotteryData.top3.filter(item => item.timestamp !== timestamp);
            found = true;
        } else if (lotteryData.top2.some(item => item.timestamp === timestamp)) {
            lotteryData.top2 = lotteryData.top2.filter(item => item.timestamp !== timestamp);
            found = true;
        } else if (lotteryData.down3.some(item => item.timestamp === timestamp)) {
            lotteryData.down3 = lotteryData.down3.filter(item => item.timestamp !== timestamp);
            found = true;
        } else if (lotteryData.down2.some(item => item.timestamp === timestamp)) {
            lotteryData.down2 = lotteryData.down2.filter(item => item.timestamp !== timestamp);
            found = true;
        }
        
        if (found) {
            saveData();
            updateUI();
            showMessage('ลบรายการเรียบร้อยแล้ว', 'success');
        }
    }
}

// Export all data to CSV
function exportAllData() {
    // Combine all data
    const allData = [
        ...lotteryData.top3.map(item => ({ ...item, digitType: '3ตัวบน' })),
        ...lotteryData.top2.map(item => ({ ...item, digitType: '2ตัวบน' })),
        ...lotteryData.down3.map(item => ({ ...item, digitType: '3ตัวล่าง' })),
        ...lotteryData.down2.map(item => ({ ...item, digitType: '2ตัวล่าง' }))
    ];
    
    // Sort by timestamp (oldest first)
    allData.sort((a, b) => a.timestamp - b.timestamp);
    
    // Convert to CSV
    let csv = 'เลขหวย,ประเภท,ชื่อลูกค้า,ตรง,โต๊ด,เวลาที่บันทึก\n';
    
    allData.forEach(item => {
        const date = new Date(item.timestamp);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        csv += `"${item.number}","${item.digitType} ${item.type}","${item.name}",${item.direct},${item.indirect},"${dateStr}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `lottery_data_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Show message
function showMessage(message, type, element = formMessage) {
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
        element.classList.add('hidden');
    }, 3000);
}

// Update UI based on current view
function updateUI() {
    const isTop = toggleTopBtn.classList.contains('active');
    const is3Digits = toggle3Btn.classList.contains('active');
    
    // Show/hide appropriate tables
    dataTable3digits.style.display = is3Digits ? 'block' : 'none';
    dataTable2digits.style.display = is3Digits ? 'none' : 'block';
    
    // Update buy type text
    buyTypeTextInput.value = isTop ? 'ตัวบน' : 'ตัวล่าง';
    
    // Show/hide indirect value input
    indirectValueInput.style.display = (isTop && is3Digits) ? 'block' : 'none';
    document.querySelectorAll('.x-label').forEach(label => {
        label.style.display = (isTop && is3Digits) ? 'flex' : 'none';
    });
    
    // Filter and display data
    filterAndDisplayData();
    
    // Validate form
    validateForm();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// เพิ่มฟังก์ชันตรวจสอบยอดรวม
function checkTotalExceedsMax(number, type, digitType, direct, indirect) {
    // คำนวณยอดรวมปัจจุบันของเลขนี้
    let totalDirect = 0;
    let totalIndirect = 0;
    
    // ตรวจสอบข้อมูลทั้งหมดที่ตรงกับเลขและประเภทนี้
    const allData = [
        ...lotteryData.top3.map(item => ({ ...item, digitType: '3ตัวบน'})),
        ...lotteryData.top2.map(item => ({ ...item, digitType: '2ตัวบน'})),
        ...lotteryData.down3.map(item => ({ ...item, digitType: '3ตัวล่าง'})),
        ...lotteryData.down2.map(item => ({ ...item, digitType: '2ตัวล่าง'})) 
    ];
    
    const matchingNumbers = allData.filter(item => 
        item.number === number && 
        item.type === type &&
        item.digitType === digitType
    );
    
    matchingNumbers.forEach(item => {
        totalDirect += item.direct;
        totalIndirect += item.indirect || 0;
    });
    
    // เพิ่มค่าที่กำลังจะบันทึก
    totalDirect += direct;
    totalIndirect += indirect || 0;
    
    // ตรวจสอบกับค่าสูงสุด
    let exceeds = false;
    let note = '';
    
    if (digitType === '3ตัวบน' && type === 'ตัวบน') {
        if (totalDirect > currentMaxValues.top3Direct) {
            exceeds = true;
            note = 'เกินค่าสูงสุด (ตรง)';
        }
        if (totalIndirect > currentMaxValues.top3Indirect) {
            exceeds = true;
            note = note ? note + ', เกินค่าสูงสุด (โต๊ด)' : 'เกินค่าสูงสุด (โต๊ด)';
        }
    } 
    else if (digitType === '2ตัวบน' && type === 'ตัวบน') {
        if (totalDirect > currentMaxValues.top2Direct) {
            exceeds = true;
            note = 'เกินค่าสูงสุด';
        }
    }
    else if (digitType === '3ตัวล่าง' && type === 'ตัวล่าง') {
        if (totalDirect > currentMaxValues.down3Direct) {
            exceeds = true;
            note = 'เกินค่าสูงสุด';
        }
    }
    else if (digitType === '2ตัวล่าง' && type === 'ตัวล่าง') {
        if (totalDirect > currentMaxValues.down2Direct) {
            exceeds = true;
            note = 'เกินค่าสูงสุด';
        }
    }
    
    return { exceeds, note };
}