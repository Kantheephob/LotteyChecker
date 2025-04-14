// Database Keys
const DB_KEYS = {
    CUSTOMERS: 'lottery_customers',
    SETTINGS: 'lottery_settings'
};

// Store current state
let currentPage = 1;
const rowsPerPage = 10;
let directValue = 0;
let indirectValue = 0;
let currentSelectedType = 'top';
let currentSelectedValueType = 'direct';
let currentSelectedMode = 'top';
let currentBetType = 'both';

// DOM elements
const currentValuesElement = document.getElementById('currentValues');
const directInput = document.getElementById('directInput');
const indirectInput = document.getElementById('indirectInput');
const lotteryNumberInput = document.getElementById('lotteryNumber');
const customerNameInput = document.getElementById('customerName');
const directValueInput = document.getElementById('directValue');
const indirectValueInput = document.getElementById('indirectValue');
const buyTypeSelect = document.getElementById('buyType');
const tableBody = document.getElementById('tableBody');
const searchInput = document.getElementById('searchInput');
const valueInput = document.getElementById('valueInput');

// Initialize the app
function init() {
    loadSettings();
    setupEventListeners();
    updateCurrentValuesDisplay();
    renderDataTable();
    renderSummaryTable();
    
    // ตั้งค่าเริ่มต้นเป็นโหมด "ทั้งตรงและโต๊ด"
    setActiveBetType('both');
    setActiveMode('top'); // ตั้งค่าเริ่มต้นเป็นโหมดตัวบน
    
    // ซ่อนช่องกรอกค่าตามค่าเริ่มต้น
    updateFormFields();
}

// Load settings from database
function loadSettings() {
    const settings = getFromDB(DB_KEYS.SETTINGS) || {};
    directValue = settings.directValue || 0;
    indirectValue = settings.indirectValue || 0;
    
    // ไม่ต้องแสดงค่า 0 ในช่อง input
    if (directInput) directInput.value = directValue > 0 ? directValue : '';
    if (indirectInput) indirectInput.value = indirectValue > 0 ? indirectValue : '';
}

// Save settings to database
function saveSettings() {
    const settings = {
        directValue,
        indirectValue
    };
    saveToDB(DB_KEYS.SETTINGS, settings);
}

// Database functions
function saveToDB(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getFromDB(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}

// เพิ่มฟังก์ชัน setActiveMode
function setActiveMode(mode) {
    currentSelectedMode = mode;
    currentSelectedType = mode === 'down' ? 'down' : 'top';
    
    // อัพเดตปุ่ม toggle
    document.getElementById('toggleTop').classList.toggle('active', mode === 'top');
    document.getElementById('toggleDown').classList.toggle('active', mode === 'down');
    
    // ตั้งค่า select ตามโหมด
    const buyTypeSelect = document.getElementById('buyType');
    buyTypeSelect.value = mode === 'down' ? 'down' : 'top';
    
    // ซ่อนหรือแสดงแถบเลือกประเภทการซื้อ
    const betTypeToggle = document.querySelector('.bet-type-toggle');
    if (mode === 'top') {
        betTypeToggle.classList.remove('hidden');
    } else {
        betTypeToggle.classList.add('hidden');
        // เมื่อเปลี่ยนเป็นโหมดตัวล่าง ให้ใช้โหมด "ตรงเท่านั้น"
        setActiveBetType('direct');
    }
    
    // อัพเดตฟิลด์กรอกข้อมูล
    updateFormFields();
}


// แก้ไขฟังก์ชัน setActiveValueType
function setActiveValueType(type) {
    if (currentSelectedMode === 'down') return; // ไม่ทำอะไรถ้าเป็นโหมดตัวล่าง
    
    currentSelectedValueType = type;
    
    // Update toggle buttons
    document.getElementById('toggleDirect').classList.toggle('active', type === 'direct');
    document.getElementById('toggleIndirect').classList.toggle('active', type === 'indirect');
    
    // แก้ไขส่วนนี้: ไม่ต้องอัพเดต placeholder ในโหมดตัวบน
    // (เราได้ตั้งค่า placeholder เป็น "จำนวน" ใน setActiveMode แล้ว)
}

function updateFormFields() {
    const directInput = document.getElementById('directValue');
    const indirectInput = document.getElementById('indirectValue');
    
    if (currentSelectedMode === 'top') {
        // โหมดตัวบน
        directInput.disabled = currentBetType === 'indirect';
        indirectInput.disabled = currentBetType === 'direct';
        
        // ตั้งค่า placeholder
        if (currentBetType === 'direct') {
            directInput.placeholder = "ตรง";
            indirectInput.placeholder = "";
        } else if (currentBetType === 'indirect') {
            directInput.placeholder = "";
            indirectInput.placeholder = "โต๊ด";
        } else {
            directInput.placeholder = "ตรง";
            indirectInput.placeholder = "โต๊ด";
        }
    } else {
        // โหมดตัวล่าง
        directInput.placeholder = "ตรง";
        directInput.disabled = false;
        indirectInput.placeholder = "";
        indirectInput.disabled = true;
        indirectInput.value = "";
    }
    
    // ตรวจสอบความถูกต้องของฟอร์มใหม่
    checkFormValidity();
}

// Update the display of current direct/indirect values
function updateCurrentValuesDisplay() {
    currentValuesElement.textContent = `${directValue} x ${indirectValue}`;
}

// Set up all event listeners
function setupEventListeners() {
    // Button click handlers
    document.getElementById('showSetMax').addEventListener('click', function() {
        toggleElement('setMax', this);
    });

    document.getElementById('clearData').addEventListener('click', clearAllData);
    customerNameInput.addEventListener('input', validateCustomerName);

    // Form submission handlers
    document.getElementById('setMax').addEventListener('submit', function(e) {
        e.preventDefault();
        setMaxValues();
    });

    document.getElementById('addData').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateCustomerForm()) {
            addCustomerData();
        }
    });

    document.getElementById('toggleTop').addEventListener('click', function() {
        setActiveMode('top');
    });

    document.getElementById('toggleDown').addEventListener('click', function() {
        setActiveMode('down');
    });

    document.getElementById('toggleDirectOnly').addEventListener('click', function() {
        setActiveBetType('direct');
    });
    
    document.getElementById('toggleIndirectOnly').addEventListener('click', function() {
        setActiveBetType('indirect');
    });
    
    document.getElementById('toggleBoth').addEventListener('click', function() {
        setActiveBetType('both');
    });

    // Buy type select change
    document.getElementById('buyType').addEventListener('change', function() {
        updateFormFields();
    });

    // Lottery number validation
    lotteryNumberInput.addEventListener('input', function() {
        validateLotteryNumber();
    });

    // Table controls
    searchInput.addEventListener('input', function() {
        currentPage = 1;
        renderDataTable();
        renderSummaryTable();
    });

    document.getElementById('exportData').addEventListener('click', exportToCSV);

    // Pagination
    document.getElementById('prevPage').addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            renderDataTable();
            renderSummaryTable();
        }
    });

    document.getElementById('nextPage').addEventListener('click', function() {
        const totalPages = Math.ceil(getFilteredCustomers().length / rowsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderDataTable();
            renderSummaryTable();
        }
    });

    // Type toggle buttons
    document.getElementById('toggleTop').addEventListener('click', function() {
        setActiveBetType('top');
    });

    document.getElementById('toggleDown').addEventListener('click', function() {
        setActiveMode('down');
    });

    // Buy type select change
    buyTypeSelect.addEventListener('change', function() {
        setActiveBetType(this.value);
    });

    // เพิ่ม Event Listener สำหรับฟอร์ม
    document.getElementById('addData').addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' && e.key === 'Enter') {
            handleEnterKey(e);
        }
    });

    lotteryNumberInput.addEventListener('input', function() {
        validateLotteryNumber();
        validateCustomerForm();
    });

    customerNameInput.addEventListener('input', function() {
        validateCustomerName();
        validateCustomerForm();
    });

    directValueInput.addEventListener('input', function() {
        validateCustomerForm();
    });

    indirectValueInput.addEventListener('input', function() {
        validateCustomerForm();
    });

    // Real-time validation
    lotteryNumberInput.addEventListener('input', function() {
        validateLotteryNumber();
        checkFormValidity();
    });

    customerNameInput.addEventListener('input', function() {
        validateCustomerName();
        checkFormValidity();
    });

    directValueInput.addEventListener('input', function() {
        checkFormValidity();
    });

    indirectValueInput.addEventListener('input', function() {
        checkFormValidity();
    });

    // เพิ่ม Event Listener สำหรับการเปลี่ยนประเภทการซื้อ
    document.getElementById('toggleDirectOnly').addEventListener('click', function() {
        setTimeout(checkFormValidity, 0);
    });
    document.getElementById('toggleIndirectOnly').addEventListener('click', function() {
        setTimeout(checkFormValidity, 0);
    });
    document.getElementById('toggleBoth').addEventListener('click', function() {
        setTimeout(checkFormValidity, 0);
    });

    document.getElementById('setMax').addEventListener('submit', function(e) {
        e.preventDefault();
        setMaxValues();
    });

    directInput.addEventListener('input', validateMaxValues);
    indirectInput.addEventListener('input', validateMaxValues);

    document.getElementById('setMax').addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' && e.key === 'Enter') {
            e.preventDefault();
            const form = e.currentTarget;
            const inputs = Array.from(form.querySelectorAll('input, button[type="submit"]'));
            const currentIndex = inputs.indexOf(e.target);
            
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus();
            } else {
                // ถ้าเป็นช่องสุดท้ายให้ส่งฟอร์มอัตโนมัติ
                if (!form.querySelector('button[type="submit"]').disabled) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        }
    });

    // เพิ่ม Event Listener สำหรับ realtime validation ในฟอร์ม setMax
    directInput.addEventListener('input', validateMaxValues);
    indirectInput.addEventListener('input', validateMaxValues);
}

function validateMaxValues() {
    const directVal = parseInt(directInput.value);
    const indirectVal = parseInt(indirectInput.value);
    const submitButton = document.querySelector('#setMax button[type="submit"]');

    // เคลียร์ error ก่อนตรวจสอบใหม่
    directInput.classList.remove('input-error');
    indirectInput.classList.remove('input-error');

    let isValid = true;

    // ตรวจสอบค่า direct
    if (isNaN(directVal)) {
        directInput.classList.add('input-error');
        isValid = false;
    }

    // ตรวจสอบค่า indirect
    if (isNaN(indirectVal)) {
        indirectInput.classList.add('input-error');
        isValid = false;
    }

    // อัพเดตสถานะปุ่ม submit
    submitButton.disabled = !isValid;
    submitButton.classList.toggle('disabled-button', !isValid);
    
    return isValid;
}

function validateLotteryNumber() {
    const value = lotteryNumberInput.value.trim();
    const isValid = /^\d{2,3}$/.test(value);
    
    if (!isValid && value !== '') {
        showError(lotteryNumberInput, 'กรุณากรอกเลขหวย 2-3 ตัว (ตัวเลขเท่านั้น)');
        return false;
    } else {
        clearError(lotteryNumberInput);
        return true;
    }
}
function validateCustomerName() {
    const value = customerNameInput.value.trim();
    const isValid = /^[ก-๙a-zA-Z\s]+$/.test(value);
    
    if (!isValid && value !== '') {
        showError(customerNameInput, 'กรุณากรอกเฉพาะตัวอักษร (ไม่มีตัวเลขหรืออักขระพิเศษ)');
        return false;
    } else {
        clearError(customerNameInput);
        return true;
    }
}

// แก้ไขฟังก์ชัน validateCustomerForm
function validateCustomerForm() {
    // ตรวจสอบฟิลด์พื้นฐาน
    if (lotteryNumberInput.value.trim() === '' || !validateLotteryNumber()) {
        updateSubmitButton(false);
        return false;
    }
    
    if (customerNameInput.value.trim() === '' || !validateCustomerName()) {
        updateSubmitButton(false);
        return false;
    }
    
    // ตรวจสอบค่าตามโหมดการซื้อ
    const directVal = parseInt(directValueInput.value) || 0;
    const indirectVal = parseInt(indirectValueInput.value) || 0;
    
    if (currentSelectedMode === 'top') {
        if (currentBetType === 'direct' && directVal === 0) {
            showError(directValueInput, 'กรุณากรอกจำนวนตรง');
            updateSubmitButton(false);
            return false;
        } else if (currentBetType === 'indirect' && indirectVal === 0) {
            showError(indirectValueInput, 'กรุณากรอกจำนวนโต๊ด');
            updateSubmitButton(false);
            return false;
        } else if (currentBetType === 'both' && directVal === 0 && indirectVal === 0) {
            showError(directValueInput, 'กรุณากรอกจำนวนตรงหรือโต๊ดอย่างน้อยหนึ่งช่อง');
            showError(indirectValueInput, 'กรุณากรอกจำนวนตรงหรือโต๊ดอย่างน้อยหนึ่งช่อง');
            updateSubmitButton(false);
            return false;
        }
    } else {
        // โหมดตัวล่าง
        if (directVal === 0) {
            showError(directValueInput, 'กรุณากรอกจำนวน');
            updateSubmitButton(false);
            return false;
        }
    }
    
    // เคลียร์ข้อความ error ถ้าผ่านการตรวจสอบทั้งหมด
    clearError(directValueInput);
    clearError(indirectValueInput);
    updateSubmitButton(true);
    return true;
}

function updateSubmitButton(isValid) {
    const submitButton = document.querySelector('#addData button[type="submit"]');
    if (isValid) {
        submitButton.disabled = false;
        submitButton.classList.remove('disabled-button');
    } else {
        submitButton.disabled = true;
        submitButton.classList.add('disabled-button');
    }
}

// Show error message for a field
function showError(field, message) {
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-text')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-text';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    field.classList.add('input-error');
    
    // เพิ่มการ scroll เพื่อแสดง error message บน mobile
    if (window.innerWidth < 768) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Clear error message for a field
function clearError(field) {
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-text')) {
        errorElement.style.display = 'none';
    }
    field.classList.remove('input-error');
}

// Toggle element visibility
function toggleElement(elementId, button) {
    const element = document.getElementById(elementId);
    const isHidden = element.classList.toggle('hidden');
    
    if (button) {
        button.classList.toggle('active', !isHidden);
    }
}

// Get filtered customers based on search input
function getFilteredCustomers() {
    const searchTerm = searchInput.value.toLowerCase();
    const customers = getFromDB(DB_KEYS.CUSTOMERS) || [];
    
    if (!searchTerm) return customers;
    
    return customers.filter(customer => 
        customer.lotteryNumber.toLowerCase().includes(searchTerm) ||
        customer.customerName.toLowerCase().includes(searchTerm)
    );
}

// Calculate totals for each lottery number (separate top/down)
function calculateTotals() {
    const customers = getFromDB(DB_KEYS.CUSTOMERS) || [];
    const totals = {};
    
    customers.forEach(customer => {
        const key = `${customer.lotteryNumber}_${customer.buyType}`;
        
        if (!totals[key]) {
            totals[key] = {
                lotteryNumber: customer.lotteryNumber,
                buyType: customer.buyType,
                direct: 0,
                indirect: 0,
                customers: []
            };
        }
        
        totals[key].direct += customer.direct;
        totals[key].indirect += customer.indirect;
        totals[key].customers.push(customer);
    });
    
    return totals;
}

// Calculate customer purchase summaries
function calculateCustomerSummaries() {
    const customers = getFromDB(DB_KEYS.CUSTOMERS) || [];
    const summaries = {};
    
    customers.forEach(customer => {
        if (!summaries[customer.customerName]) {
            summaries[customer.customerName] = {
                topDirect: 0,
                topIndirect: 0,
                downTotal: 0,
                grandTotal: 0
            };
        }
        
        if (customer.buyType === 'top') {
            summaries[customer.customerName].topDirect += customer.direct;
            summaries[customer.customerName].topIndirect += customer.indirect;
        } else {
            summaries[customer.customerName].downTotal += customer.direct; // รวมล่างมีเฉพาะตรง
        }
        
        // คำนวณยอดรวมทั้งหมด
        summaries[customer.customerName].grandTotal = 
            summaries[customer.customerName].topDirect + 
            summaries[customer.customerName].topIndirect + 
            summaries[customer.customerName].downTotal;
    });
    
    return summaries;
}

// Set maximum direct/indirect values
function setMaxValues() {
    if (!validateMaxValues()) return;
    
    const newDirectValue = parseInt(directInput.value);
    const newIndirectValue = parseInt(indirectInput.value);

    // อัปเดตค่าสูงสุด
    directValue = newDirectValue;
    indirectValue = newIndirectValue;
    
    // บันทึกการตั้งค่า
    saveSettings();
    
    // อัปเดตการแสดงผล
    updateCurrentValuesDisplay();
    
    // แสดงข้อความสำเร็จ
    showSuccessMessage(`อัปเดตค่าสูงสุดเป็น ${directValue} x ${indirectValue} เรียบร้อยแล้ว!`);
    
    // รีเซ็ตฟอร์มและซ่อน
    document.getElementById('setMax').reset();
    toggleElement('setMax', document.getElementById('showSetMax'));
    
    // รีเรนเดอร์ตารางข้อมูลและสรุป
    renderDataTable();
    renderSummaryTable();
}

// เพิ่มฟังก์ชันจัดการการเลือกประเภทการซื้อ
function setActiveBetType(type) {
    currentBetType = type;
    
    // อัพเดตปุ่ม toggle
    document.querySelectorAll('.bet-type-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`toggle${type === 'direct' ? 'DirectOnly' : type === 'indirect' ? 'IndirectOnly' : 'Both'}`).classList.add('active');
    
    // อัพเดตฟิลด์กรอกข้อมูล
    const directInput = document.getElementById('directValue');
    const indirectInput = document.getElementById('indirectValue');
    
    if (type === 'direct') {
        directInput.placeholder = "ตรง";
        directInput.required = true;
        directInput.disabled = false;
        indirectInput.placeholder = "";
        indirectInput.required = false;
        indirectInput.disabled = true; // ปิดการใช้งานช่องโต๊ด
        indirectInput.value = ""; // เคลียร์ค่า
    } else if (type === 'indirect') {
        directInput.placeholder = "";
        directInput.required = false;
        directInput.disabled = true; // ปิดการใช้งานช่องตรง
        directInput.value = ""; // เคลียร์ค่า
        indirectInput.placeholder = "โต๊ด";
        indirectInput.required = true;
        indirectInput.disabled = false;
    } else { // both
        directInput.placeholder = "ตรง";
        directInput.required = false; // ไม่บังคับ required แต่ต้องกรอกอย่างน้อย 1 ช่อง
        directInput.disabled = false;
        indirectInput.placeholder = "โต๊ด";
        indirectInput.required = false; // ไม่บังคับ required แต่ต้องกรอกอย่างน้อย 1 ช่อง
        indirectInput.disabled = false;
    }
    
    // แสดง label x เฉพาะเมื่อเปิดใช้งานทั้งสองช่อง
    document.querySelector('.x-label').style.display = type === 'both' ? 'inline-block' : 'none';
    
    // เคลียร์ข้อความ error เมื่อเปลี่ยนโหมด
    clearError(directInput);
    clearError(indirectInput);
    setTimeout(checkFormValidity, 0);
}

// Render data table with pagination
function renderDataTable() {
    const filteredCustomers = getFilteredCustomers();
    const startIdx = (currentPage - 1) * rowsPerPage;
    const paginatedCustomers = filteredCustomers.slice(startIdx, startIdx + rowsPerPage);
    const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);
    const totals = calculateTotals();
    
    // เรียงลำดับข้อมูลจากเก่าไปใหม่ (ตามเวลา createdAt)
    paginatedCustomers.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    // Update table body
    tableBody.innerHTML = '';
    
    if (paginatedCustomers.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center;">ไม่พบข้อมูลลูกค้า</td>`;
        tableBody.appendChild(row);
    } else {
        // คำนวณข้อมูลที่เกิน limit สำหรับแต่ละเลขหวย
        const exceededInfo = {};
        
        // เก็บข้อมูลรวมของแต่ละเลขหวย
        const lotteryTotals = {};
        filteredCustomers.forEach(customer => {
            const key = `${customer.lotteryNumber}_${customer.buyType}`;
            if (!lotteryTotals[key]) {
                lotteryTotals[key] = { direct: 0, indirect: 0, count: 0 };
            }
            lotteryTotals[key].direct += customer.direct;
            lotteryTotals[key].indirect += customer.indirect;
            lotteryTotals[key].count++;
        });
        
        // ตรวจสอบว่าเลขหวยใดเกิน limit
        Object.keys(lotteryTotals).forEach(key => {
            const [lotteryNumber, buyType] = key.split('_');
            const total = lotteryTotals[key];
            
            if (total.direct > directValue || total.indirect > indirectValue) {
                exceededInfo[key] = {
                    directExceed: total.direct > directValue ? total.direct - directValue : 0,
                    indirectExceed: total.indirect > indirectValue ? total.indirect - indirectValue : 0,
                    totalDirect: total.direct,
                    totalIndirect: total.indirect,
                    buyType: buyType
                };
            }
        });
        
        // เรนเดอร์ข้อมูล
        paginatedCustomers.forEach(customer => {
            const row = document.createElement('tr');
            const key = `${customer.lotteryNumber}_${customer.buyType}`;
            const isExceeded = exceededInfo[key];
            
            // ตรวจสอบว่ารายการนี้เป็นรายการล่าสุดของเลขหวยนี้หรือไม่
            const isLatestForThisNumber = filteredCustomers
                .filter(c => c.lotteryNumber === customer.lotteryNumber && c.buyType === customer.buyType)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].id === customer.id;
            
            row.innerHTML = `
                <td>${customer.lotteryNumber}</td>
                <td>${customer.buyType === 'top' ? 'บน' : 'ล่าง'}</td>
                <td>${customer.customerName}</td>
                <td class="${isExceeded && isLatestForThisNumber && customer.direct > 0 ? 'exceed-limit' : ''}">${customer.direct}</td>
                <td class="${isExceeded && isLatestForThisNumber && customer.indirect > 0 ? 'exceed-limit' : ''}">${customer.indirect}</td>
                <td class="${isExceeded && isLatestForThisNumber ? 'exceed-limit' : ''}">
                    ${isExceeded && isLatestForThisNumber ? getExceedNote(exceededInfo[key]) : '-'}
                </td>
                <td>
                    <button class="action-btn edit-btn" data-id="${customer.id}">แก้ไข</button>
                    <button class="action-btn delete-btn" data-id="${customer.id}">ลบ</button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // อัพเดต pagination controls
    document.getElementById('pageInfo').textContent = `หน้า ${currentPage} จาก ${totalPages || 1}`;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages || totalPages === 0;
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            editCustomer(this.dataset.id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteCustomer(this.dataset.id);
        });
    });
}

function addCustomerData() {
    const lotteryNumber = lotteryNumberInput.value.trim();
    const customerName = customerNameInput.value.trim();
    const buyType = currentSelectedMode === 'down' ? 'down' : 'top';
    
    // รับค่าตามโหมดการซื้อ
    let direct = 0;
    let indirect = 0;
    
    if (currentSelectedMode === 'top') {
        direct = parseInt(directValueInput.value) || 0;
        indirect = parseInt(indirectValueInput.value) || 0;
        
        // สำหรับโหมดเฉพาะตรงหรือโต๊ด ให้ตั้งค่าที่ไม่ได้กรอกเป็น 0
        if (currentBetType === 'direct') {
            indirect = 0;
        } else if (currentBetType === 'indirect') {
            direct = 0;
        }
    } else {
        // โหมดตัวล่าง
        direct = parseInt(directValueInput.value) || 0;
        indirect = 0;
    }
    
    // สร้างข้อมูลลูกค้า
    const customer = {
        id: Date.now().toString(),
        lotteryNumber,
        customerName,
        buyType,
        direct,
        indirect,
        createdAt: new Date().toISOString()
    };
    
    // บันทึกลงฐานข้อมูล
    const customers = getFromDB(DB_KEYS.CUSTOMERS) || [];
    customers.push(customer);
    saveToDB(DB_KEYS.CUSTOMERS, customers);
    
    // แสดงข้อความสำเร็จ
    showSuccessMessage('เพิ่มข้อมูลลูกค้าเรียบร้อยแล้ว!');
    
    // รีเซ็ตฟอร์ม
    resetForm();
    
    // รีเซ็ตค่า currentPage กลับไปหน้าแรก
    currentPage = 1;
    
    // รีเรนเดอร์ตารางทันที
    renderDataTable();
    renderSummaryTable();
    
    // โฟกัสไปที่ช่องกรอกเลขหวยเพื่อเตรียมกรอกข้อมูลใหม่
    lotteryNumberInput.focus();
}

function resetForm() {
    document.getElementById('addData').reset();
    lotteryNumberInput.focus();
    checkFormValidity();
}

// Render summary table
function renderSummaryTable() {
    const summaries = calculateCustomerSummaries();
    const summaryBody = document.getElementById('summaryBody');
    summaryBody.innerHTML = '';
    
    let totalTopDirect = 0;
    let totalTopIndirect = 0;
    let totalDown = 0;
    let totalAll = 0;
    
    // Add customer rows
    Object.entries(summaries).forEach(([customerName, summary]) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${customerName}</td>
            <td>${summary.topDirect}</td>
            <td>${summary.topIndirect}</td>
            <td>${summary.downTotal}</td>
            <td>${summary.grandTotal}</td>
        `;
        
        summaryBody.appendChild(row);
        
        // Add to totals
        totalTopDirect += summary.topDirect;
        totalTopIndirect += summary.topIndirect;
        totalDown += summary.downTotal;
        totalAll += summary.grandTotal;
    });
    
    // Add total row
    if (Object.keys(summaries).length > 0) {
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        
        totalRow.innerHTML = `
            <td>รวมทั้งหมด</td>
            <td>${totalTopDirect}</td>
            <td>${totalTopIndirect}</td>
            <td>${totalDown}</td>
            <td>${totalAll}</td>
        `;
        
        summaryBody.appendChild(totalRow);
    } else {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="5" style="text-align: center;">ไม่มีข้อมูลสรุป</td>`;
        summaryBody.appendChild(emptyRow);
    }
}

// แก้ไขฟังก์ชัน editCustomer
function editCustomer(id) {
    const customers = getFromDB(DB_KEYS.CUSTOMERS) || [];
    const customer = customers.find(c => c.id === id);
    
    if (!customer) return;
    
    lotteryNumberInput.value = customer.lotteryNumber;
    customerNameInput.value = customer.customerName;
    buyTypeSelect.value = customer.buyType;
    
    // Set active type and fill values
    setActiveType(customer.buyType);
    if (customer.buyType === 'top') {
        directValueInput.value = customer.direct;
        indirectValueInput.value = customer.indirect;
    } else {
        downValueInput.value = customer.direct;
    }
    
    const updatedCustomers = customers.filter(c => c.id !== id);
    saveToDB(DB_KEYS.CUSTOMERS, updatedCustomers);
}

// Delete customer
function deleteCustomer(id) {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลลูกค้านี้?')) return;
    
    const customers = getFromDB(DB_KEYS.CUSTOMERS) || [];
    const updatedCustomers = customers.filter(c => c.id !== id);
    saveToDB(DB_KEYS.CUSTOMERS, updatedCustomers);
    
    showSuccessMessage('ลบข้อมูลลูกค้าเรียบร้อยแล้ว!');
    renderDataTable();
    renderSummaryTable();
}

// Clear all data
function clearAllData() {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด? การกระทำนี้ไม่สามารถยกเลิกได้')) return;
    
    localStorage.removeItem(DB_KEYS.CUSTOMERS);
    localStorage.removeItem(DB_KEYS.SETTINGS);
    
    // Reset all values
    directValue = 0;
    indirectValue = 0;
    directInput.value = '';
    indirectInput.value = '';
    
    saveSettings();
    updateCurrentValuesDisplay();
    
    showSuccessMessage('ลบข้อมูลทั้งหมดเรียบร้อยแล้ว!');
    renderDataTable();
    renderSummaryTable();
}

function checkFormValidity() {
    const isValid = validateCustomerForm();
    updateSubmitButton(isValid);
    return isValid;
}

// Export to CSV
function exportToCSV() {
    const customers = getFromDB(DB_KEYS.CUSTOMERS) || [];
    const totals = calculateTotals();
    
    if (customers.length === 0) {
        showSuccessMessage('ไม่มีข้อมูลที่จะส่งออก!', true);
        return;
    }
    
    // CSV header
    let csv = 'เลขหวย,ประเภท,คนซื้อ,ตรง,โต๊ด,หมายเหตุ\n';
    
    // Add each customer
    customers.forEach(customer => {
        const lotteryTotals = totals[customer.lotteryNumber] || { direct: 0, indirect: 0 };
        const note = getNote(customer, lotteryTotals);
        csv += `"${customer.lotteryNumber}","${customer.buyType === 'top' ? 'บน' : 'ล่าง'}","${customer.customerName}",${customer.direct},${customer.indirect},"${note}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lottery_data_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Get note for the table
function getNote(customer, totals, isLatestExceeded = false) {
    if (!isLatestExceeded) return '-';
    
    const notes = [];
    const lotteryTotals = totals || { direct: 0, indirect: 0 };
    
    // Check total limits
    if (lotteryTotals.direct > directValue) {
        notes.push(`รวมตรงเกิน ${lotteryTotals.direct - directValue}`);
    }
    
    if (lotteryTotals.indirect > indirectValue) {
        notes.push(`รวมโต๊ดเกิน ${lotteryTotals.indirect - indirectValue}`);
    }
    
    return notes.join(', ') || '-';
}

function getExceedNote(exceedInfo) {
    const notes = [];
    const typeText = exceedInfo.buyType === 'top' ? 'บน' : 'ล่าง';
    
    if (exceedInfo.directExceed > 0) {
        notes.push(`${typeText}ตรงเกิน ${exceedInfo.directExceed}`);
    }
    
    if (exceedInfo.indirectExceed > 0) {
        notes.push(`${typeText}โต๊ดเกิน ${exceedInfo.indirectExceed}`);
    }
    
    return notes.join(', ');
}


// Show success/error message
function showSuccessMessage(message, isError = false) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = isError ? 'form-message error' : 'form-message success';
    
    // ลบข้อความหลังจาก 3 วินาที
    setTimeout(() => {
        formMessage.textContent = '';
        formMessage.className = 'form-message';
    }, 3000);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);

// เพิ่มฟังก์ชันจัดการการกด Enter
function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const form = event.currentTarget;
        const inputs = Array.from(form.querySelectorAll('input, select, button[type="submit"]'));
        const currentIndex = inputs.indexOf(event.target);
        
        if (currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus();
        } else {
            // ถ้าเป็นช่องสุดท้ายให้ส่งฟอร์มอัตโนมัติ
            form.dispatchEvent(new Event('submit'));
        }
    }
}