let consentTypes = [
  {
    key: "thu_thap_thong_tin_ca_nhan",
    name: "Thu thập thông tin cá nhân",
    desc: "Cho phép hệ thống thu thập họ tên, email và số điện thoại",
    active: true,
    createdAt: "01/12/2025",
    agreedCount: 12
  },
  {
    key: "su_dung_hinh_anh_su_kien",
    name: "Sử dụng hình ảnh sự kiện",
    desc: "Cho phép sử dụng hình ảnh tham gia sự kiện cho mục đích truyền thông",
    active: true,
    createdAt: "05/12/2025",
    agreedCount: 9
  },
  {
    key: "nhan_email_thong_bao",
    name: "Nhận email thông báo",
    desc: "Cho phép gửi email thông báo về các sự kiện sắp diễn ra",
    active: true,
    createdAt: "05/12/2025",
    agreedCount: 5
  },
  {
    key: "chia_se_thong_tin_voi_doi_tac",
    name: "Chia sẻ thông tin với đối tác",
    desc: "Cho phép chia sẻ thông tin với đơn vị đồng tổ chức sự kiện",
    active: false,
    createdAt: "12/12/2025",
    agreedCount: 3
  }
];

/***********************
 * GLOBAL DATA & INITIALIZATION
 ***********************/
let policyVersion = 1.2;
let adminName = "ABC";

// Dữ liệu mẫu
const consentData = [
  {
    email: "lethiphuongthao@gmail.com",
    consent: "Sử dụng hình ảnh sự kiện",
    status: "success",
    statusText: "Đã đồng ý",
    time: "12/12/2025 14:20",
    device: "192.168.1.20 / Chrome"
  },
  {
    email: "tranminhduc@gmail.com",
    consent: "Thu thập thông tin cá nhân",
    status: "success",
    statusText: "Đã đồng ý",
    time: "13/12/2025 09:45",
    device: "192.168.1.25 / Chrome"
  },
  {
    email: "lehuongiang@gmail.com",
    consent: "Chia sẻ thông tin với đối tác",
    status: "warning",
    statusText: "Từ chối",
    time: "14/12/2025 10:30",
    device: "192.168.1.30 / Chrome"
  },
  {
    email: "phamthithao@gmail.com",
    consent: "Nhận email thông báo",
    status: "success",
    statusText: "Đã đồng ý",
    time: "14/12/2025 11:15",
    device: "192.168.1.35 / Chrome"
  },
  {
    email: "nguyenvanan@gmail.com",
    consent: "Thu thập thông tin cá nhân",
    status: "success",
    statusText: "Đã đồng ý",
    time: "15/12/2025 08:30",
    device: "192.168.1.40 / Firefox"
  },
  {
    email: "tranthubinh@gmail.com",
    consent: "Sử dụng hình ảnh sự kiện",
    status: "warning",
    statusText: "Từ chối",
    time: "15/12/2025 10:15",
    device: "192.168.1.45 / Safari"
  },
  {
    email: "phamngocthao@gmail.com",
    consent: "Nhận email thông báo",
    status: "success",
    statusText: "Đã đồng ý",
    time: "16/12/2025 13:45",
    device: "192.168.1.50 / Chrome"
  },
  {
    email: "hoangthidung@gmail.com",
    consent: "Chia sẻ thông tin với đối tác",
    status: "success",
    statusText: "Đã đồng ý",
    time: "16/12/2025 15:20",
    device: "192.168.1.55 / Edge"
  },
  {
    email: "nguyenngoclinh@gmail.com",
    consent: "Thu thập thông tin cá nhân",
    status: "warning",
    statusText: "Từ chối",
    time: "17/12/2025 09:00",
    device: "192.168.1.60 / Chrome"
  },
  {
    email: "tranthithao@gmail.com",
    consent: "Sử dụng hình ảnh sự kiện",
    status: "success",
    statusText: "Đã đồng ý",
    time: "17/12/2025 11:30",
    device: "192.168.1.65 / Firefox"
  },
];

const logsData = [
  {
    time: "15/12/2025 09:12",
    user: "Nguyễn Văn Duy",
    action: "Cập nhật Policy",
    actionType: "update",
    target: "Privacy Policy v1.2",
    ip: "192.168.1.10"
  },
  {
    time: "14/12/2025 21:40",
    user: "Nguyễn Ngọc Hương",
    action: "Xem danh sách Consent",
    actionType: "view",
    target: "User Consent Report",
    ip: "192.168.1.5"
  },
  {
    time: "14/12/2025 15:22",
    user: "Lê Thiện Quân",
    action: "Tạo Consent mới",
    actionType: "create",
    target: 'Consent "Chia sẻ thông tin với đối tác"',
    ip: "192.168.1.8"
  },
  {
    time: "13/12/2025 11:05",
    user: "Dương Văn Minh",
    action: "Vô hiệu hóa Consent",
    actionType: "delete",
    target: 'Consent "Chia sẻ thông tin với đối tác"',
    ip: "192.168.1.15"
  },
  {
    time: "13/12/2025 09:30",
    user: "Lê Thị Phương Thảo",
    action: "Đăng nhập hệ thống",
    actionType: "login",
    target: "Admin Dashboard",
    ip: "192.168.1.20"
  },
  {
    time: "12/12/2025 16:45",
    user: "Trần Văn Nam",
    action: "Xuất báo cáo",
    actionType: "view",
    target: "Compliance Report",
    ip: "192.168.1.25"
  },
  {
    time: "12/12/2025 14:30",
    user: "Phạm Thị Hoa",
    action: "Chỉnh sửa Consent",
    actionType: "update",
    target: 'Consent "Thu thập thông tin cá nhân"',
    ip: "192.168.1.30"
  },
  {
    time: "11/12/2025 11:20",
    user: "Hoàng Văn Tùng",
    action: "Xóa người dùng",
    actionType: "delete",
    target: "User: nguyenvana@gmail.com",
    ip: "192.168.1.35"
  },
  {
    time: "11/12/2025 09:15",
    user: "Đỗ Thị Lan",
    action: "Đăng xuất hệ thống",
    actionType: "login",
    target: "Admin Dashboard",
    ip: "192.168.1.40"
  },
  {
    time: "10/12/2025 17:30",
    user: "Vũ Văn Hải",
    action: "Tạo Policy mới",
    actionType: "create",
    target: "Privacy Policy v1.1",
    ip: "192.168.1.45"
  },
  {
    time: "10/12/2025 13:45",
    user: "Bùi Thị Mai",
    action: "Cập nhật thống kê",
    actionType: "update",
    target: "Dashboard Statistics",
    ip: "192.168.1.50"
  },
  {
    time: "09/12/2025 10:20",
    user: "Lý Văn Hùng",
    action: "Xem log hệ thống",
    actionType: "view",
    target: "System Logs",
    ip: "192.168.1.55"
  },
  {
    time: "09/12/2025 08:45",
    user: "Đinh Thị Thu",
    action: "Kích hoạt Consent",
    actionType: "update",
    target: 'Consent "Sử dụng hình ảnh"',
    ip: "192.168.1.60"
  },
  {
    time: "08/12/2025 16:15",
    user: "Mai Văn Sơn",
    action: "Đăng nhập thất bại",
    actionType: "login",
    target: "Admin Dashboard",
    ip: "192.168.1.65"
  },
  {
    time: "08/12/2025 14:00",
    user: "Trần Văn Bình",
    action: "Sao lưu dữ liệu",
    actionType: "create",
    target: "System Backup",
    ip: "192.168.1.70"
  }
];

// Biến quản lý phân trang
let consentCurrentPage = 1;
let logsCurrentPage = 1;
const consentRowsPerPage = 4;
const logsRowsPerPage = 5;

/***********************
 * KHỞI TẠO TRANG
 ***********************/
document.addEventListener("DOMContentLoaded", function() {
  console.log("Trang đang khởi tạo...");
  
  // 1️⃣ Load dữ liệu đã lưu (nếu có)
  loadFromLocalStorage();
  
  // 2️⃣ Render danh sách consent types
  renderConsentTypes();
  
  // 3️⃣ Khởi tạo phân trang cho consent
  initConsentPagination();
  renderConsentPage();
  
  // 4️⃣ Khởi tạo phân trang cho logs
  initLogsPagination();
  renderLogsPage();
  
  // 5️⃣ Cập nhật thống kê
  updateStats();
});

/***********************
 * POLICY MANAGEMENT
 ***********************/
function savePolicy() {
  const content = document.getElementById("privacyPolicy").value;
  if (!content.trim()) {
    alert("Nội dung chính sách không được để trống!");
    return;
  }

  policyVersion = parseFloat((policyVersion + 0.1).toFixed(1));

  // Update version history
  const tbody = document.querySelector(".version-history tbody");

  // Set old active to inactive
  const activeRows = tbody.querySelectorAll("tr");
  activeRows.forEach(row => {
    const badge = row.querySelector(".status-badge.active");
    if (badge) {
      badge.classList.remove("active");
      badge.classList.add("inactive");
      badge.innerText = "Cũ";
    }
  });

  const now = new Date();
  const time = now.toLocaleString("vi-VN");

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><span class="version-badge">v${policyVersion}</span></td>
    <td><div class="user-cell"><span>${adminName}</span></div></td>
    <td>${time}</td>
    <td>Cập nhật nội dung chính sách</td>
    <td><span class="status-badge active">Hiện hành</span></td>
  `;
  tbody.prepend(row);

  // Cập nhật thống kê
  updateStats();
  
  // Thêm log
  addLog("Cập nhật Policy", `Privacy Policy v${policyVersion}`);
  
  saveToLocalStorage();
  alert("Lưu chính sách thành công!");
}

function previewPolicy() {
  const content = document.getElementById("privacyPolicy").value;

  const modal = document.createElement("div");
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
  `;

  modal.innerHTML = `
    <div style="background: #fff; width: 90%; max-width: 800px; max-height: 90%; overflow: auto; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #2c3e50;">Xem trước Chính sách quyền riêng tư</h2>
        <button onclick="this.closest('div').parentNode.remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
      </div>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6;">
        <pre style="white-space: pre-wrap; font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; margin: 0; font-size: 15px;">${content}</pre>
      </div>
      <div style="margin-top: 20px; text-align: right;">
        <button onclick="this.closest('div').parentNode.remove()" class="btn btn-primary">Đóng</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/***********************
 * CONSENT MANAGEMENT
 ***********************/
function saveConsent() {
  const name = document.getElementById("consentName").value.trim();
  const desc = document.getElementById("consentDescription").value.trim();
  const status = document.getElementById("consentStatus").value;

  if (!name || !desc) {
    alert("Vui lòng nhập đầy đủ thông tin Consent!");
    return;
  }

  const key = generateConsentKey(name);
  const date = new Date().toLocaleDateString("vi-VN");
  const isActive = status === "active";

  // 1. Thêm vào mảng dữ liệu gốc
  const newConsent = {
    key: key,
    name: name,
    desc: desc,
    active: isActive,
    createdAt: date,
    agreedCount: 0
  };
  
  consentTypes.push(newConsent);

  // 2. Render lại toàn bộ table (để đảm bảo đồng bộ)
  renderConsentTypes();

  // 3. Lưu vào localStorage
  localStorage.setItem(key, isActive ? "active" : "inactive");
  saveToLocalStorage();

  // 4. Thêm log
  addLog("Tạo Consent mới", `Consent "${name}"`);

  // 5. Xóa form
  clearConsentForm();

  alert("Lưu Consent thành công!");
}

function generateConsentKey(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
}

function clearConsentForm() {
  document.getElementById("consentName").value = "";
  document.getElementById("consentDescription").value = "";
  document.getElementById("consentStatus").value = "active";
}

/***********************
 * RENDER CONSENT TYPES
 ***********************/
function renderConsentTypes() {
  const tbody = document.querySelector(".consent-list tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  consentTypes.forEach(consent => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${consent.name}</strong></td>
      <td>${consent.desc}</td>
      <td>${consent.createdAt}</td>
      <td>${consent.agreedCount}</td>
      <td>
        <span class="status-badge ${consent.active ? "active" : "inactive"}"
              id="badge-${consent.key}">
          ${consent.active ? "Kích hoạt" : "Tạm dừng"}
        </span>
      </td>
      <td>
        <label class="toggle-switch">
          <input type="checkbox"
                 ${consent.active ? "checked" : ""}
                 data-key="${consent.key}"
                 onchange="toggleConsentSwitch(this)">
          <span class="toggle-slider"></span>
        </label>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/***********************
 * TOGGLE CONSENT SWITCH
 ***********************/
function toggleConsentSwitch(checkbox) {
  const key = checkbox.dataset.key;
  const badge = document.getElementById(`badge-${key}`);
  const isActive = checkbox.checked;

  // Cập nhật DOM
  badge.textContent = isActive ? "Kích hoạt" : "Tạm dừng";
  badge.className = `status-badge ${isActive ? "active" : "inactive"}`;

  // Cập nhật mảng consentTypes
  const consentIndex = consentTypes.findIndex(consent => consent.key === key);
  if (consentIndex !== -1) {
    consentTypes[consentIndex].active = isActive;
  }

  // Lưu trạng thái
  localStorage.setItem(key, isActive ? "active" : "inactive");
  
  // Lưu toàn bộ dữ liệu
  saveToLocalStorage();

  // Log
  const consentName = consentTypes[consentIndex]?.name || key.replace(/_/g, " ");
  addLog(
    isActive ? "Kích hoạt Consent" : "Tạm dừng Consent",
    `Consent "${consentName}"`
  );
}

/***********************
 * CONSENT PAGINATION
 ***********************/
function initConsentPagination() {
  const totalConsentPages = Math.ceil(consentData.length / consentRowsPerPage);
  const consentPagination = document.querySelector(".user-consent-list .pagination");
  
  if (!consentPagination) return;
  
  // Xóa nội dung cũ
  consentPagination.innerHTML = '';
  
  // Tạo nút Previous
  const prevBtn = document.createElement("button");
  prevBtn.className = "btn btn-outline prev-btn";
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.onclick = () => {
    if (consentCurrentPage > 1) {
      consentCurrentPage--;
      renderConsentPage();
      updateConsentPaginationUI();
    }
  };
  consentPagination.appendChild(prevBtn);
  
  // Tạo các nút số trang
  const pageNumbers = document.createElement("div");
  pageNumbers.className = "page-numbers";
  
  for (let i = 1; i <= totalConsentPages; i++) {
    const pageBtn = document.createElement("span");
    pageBtn.className = `page-number ${i === 1 ? "active" : ""}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      consentCurrentPage = i;
      renderConsentPage();
      updateConsentPaginationUI();
    };
    pageNumbers.appendChild(pageBtn);
  }
  consentPagination.appendChild(pageNumbers);
  
  // Tạo nút Next
  const nextBtn = document.createElement("button");
  nextBtn.className = "btn btn-outline next-btn";
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.onclick = () => {
    if (consentCurrentPage < totalConsentPages) {
      consentCurrentPage++;
      renderConsentPage();
      updateConsentPaginationUI();
    }
  };
  consentPagination.appendChild(nextBtn);
  
  // Tạo thông tin trang
  const pageInfo = document.createElement("span");
  pageInfo.className = "page-info";
  consentPagination.appendChild(pageInfo);
}

function renderConsentPage() {
  const tbody = document.querySelector(".user-consent-list tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  const startIndex = (consentCurrentPage - 1) * consentRowsPerPage;
  const endIndex = Math.min(startIndex + consentRowsPerPage, consentData.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    const user = consentData[i];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="user-cell">
          <i class="fas fa-user-circle"></i>
          <span>${user.email}</span>
        </div>
      </td>
      <td>${user.consent}</td>
      <td><span class="status-badge ${user.status}">${user.statusText}</span></td>
      <td>${user.time}</td>
      <td>${user.device}</td>
    `;
    tbody.appendChild(row);
  }
  
  updateConsentPaginationUI();
}

function updateConsentPaginationUI() {
  const totalPages = Math.ceil(consentData.length / consentRowsPerPage);
  const pageInfo = document.querySelector(".user-consent-list .page-info");
  const pageNumbers = document.querySelectorAll(".user-consent-list .page-number");
  const prevBtn = document.querySelector(".user-consent-list .prev-btn");
  const nextBtn = document.querySelector(".user-consent-list .next-btn");
  
  // Cập nhật trạng thái nút
  if (prevBtn) prevBtn.disabled = consentCurrentPage === 1;
  if (nextBtn) nextBtn.disabled = consentCurrentPage === totalPages;
  
  // Cập nhật số trang active
  pageNumbers.forEach((btn, index) => {
    if (index + 1 === consentCurrentPage) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  // Cập nhật thông tin trang
  if (pageInfo) {
    const start = (consentCurrentPage - 1) * consentRowsPerPage + 1;
    const end = Math.min(consentCurrentPage * consentRowsPerPage, consentData.length);
    pageInfo.textContent = `Hiển thị ${start}-${end} của ${consentData.length} bản ghi`;
  }
}

/***********************
 * LOGS PAGINATION
 ***********************/
function initLogsPagination() {
  const totalLogsPages = Math.ceil(logsData.length / logsRowsPerPage);
  const logsPagination = document.querySelector(".logs-list .pagination");
  
  if (!logsPagination) return;
  
  // Xóa nội dung cũ
  logsPagination.innerHTML = '';
  
  // Tạo nút Previous
  const prevBtn = document.createElement("button");
  prevBtn.className = "btn btn-outline prev-btn";
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.onclick = () => {
    if (logsCurrentPage > 1) {
      logsCurrentPage--;
      renderLogsPage();
      updateLogsPaginationUI();
    }
  };
  logsPagination.appendChild(prevBtn);
  
  // Tạo các nút số trang (hiển thị tối đa 5 nút)
  const pageNumbers = document.createElement("div");
  pageNumbers.className = "page-numbers";
  
  // Logic hiển thị trang thông minh (1 2 ... 5)
  const maxVisiblePages = 5;
  let startPage = Math.max(1, logsCurrentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalLogsPages, startPage + maxVisiblePages - 1);
  
  // Điều chỉnh nếu không đủ trang
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // Nút trang đầu
  if (startPage > 1) {
    const firstPageBtn = document.createElement("span");
    firstPageBtn.className = "page-number";
    firstPageBtn.textContent = "1";
    firstPageBtn.onclick = () => {
      logsCurrentPage = 1;
      renderLogsPage();
      updateLogsPaginationUI();
    };
    pageNumbers.appendChild(firstPageBtn);
    
    // Dấu "..."
    if (startPage > 2) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "page-ellipsis";
      ellipsis.textContent = "...";
      pageNumbers.appendChild(ellipsis);
    }
  }
  
  // Các nút trang giữa
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("span");
    pageBtn.className = `page-number ${i === 1 ? "active" : ""}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      logsCurrentPage = i;
      renderLogsPage();
      updateLogsPaginationUI();
    };
    pageNumbers.appendChild(pageBtn);
  }
  
  // Nút trang cuối
  if (endPage < totalLogsPages) {
    // Dấu "..."
    if (endPage < totalLogsPages - 1) {
      const ellipsis = document.createElement("span");
      ellipsis.className = "page-ellipsis";
      ellipsis.textContent = "...";
      pageNumbers.appendChild(ellipsis);
    }
    
    const lastPageBtn = document.createElement("span");
    lastPageBtn.className = "page-number";
    lastPageBtn.textContent = totalLogsPages;
    lastPageBtn.onclick = () => {
      logsCurrentPage = totalLogsPages;
      renderLogsPage();
      updateLogsPaginationUI();
    };
    pageNumbers.appendChild(lastPageBtn);
  }
  
  logsPagination.appendChild(pageNumbers);
  
  // Tạo nút Next
  const nextBtn = document.createElement("button");
  nextBtn.className = "btn btn-outline next-btn";
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.onclick = () => {
    if (logsCurrentPage < totalLogsPages) {
      logsCurrentPage++;
      renderLogsPage();
      updateLogsPaginationUI();
    }
  };
  logsPagination.appendChild(nextBtn);
  
  // Tạo thông tin trang
  const pageInfo = document.createElement("span");
  pageInfo.className = "page-info";
  logsPagination.appendChild(pageInfo);
}

function renderLogsPage() {
  const tbody = document.querySelector(".logs-list tbody");
  if (!tbody) return;
  
  tbody.innerHTML = "";
  
  const startIndex = (logsCurrentPage - 1) * logsRowsPerPage;
  const endIndex = Math.min(startIndex + logsRowsPerPage, logsData.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    const log = logsData[i];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${log.time}</td>
      <td><div class="user-cell"><span>${log.user}</span></div></td>
      <td><span class="log-action ${log.actionType}">${log.action}</span></td>
      <td>${log.target}</td>
      <td>${log.ip}</td>
    `;
    tbody.appendChild(row);
  }
  
  updateLogsPaginationUI();
}

function updateLogsPaginationUI() {
  const totalPages = Math.ceil(logsData.length / logsRowsPerPage);
  const pageInfo = document.querySelector(".logs-list .page-info");
  const pageNumbers = document.querySelectorAll(".logs-list .page-number");
  const prevBtn = document.querySelector(".logs-list .prev-btn");
  const nextBtn = document.querySelector(".logs-list .next-btn");
  
  // Cập nhật trạng thái nút
  if (prevBtn) prevBtn.disabled = logsCurrentPage === 1;
  if (nextBtn) nextBtn.disabled = logsCurrentPage === totalPages;
  
  // Cập nhật số trang active
  pageNumbers.forEach(btn => {
    if (parseInt(btn.textContent) === logsCurrentPage) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
  
  // Cập nhật thông tin trang
  if (pageInfo) {
    const start = (logsCurrentPage - 1) * logsRowsPerPage + 1;
    const end = Math.min(logsCurrentPage * logsRowsPerPage, logsData.length);
    pageInfo.textContent = `Hiển thị ${start}-${end} của ${logsData.length} bản ghi`;
  }
  
  // Re-init pagination để cập nhật dấu "..."
  if (totalPages > 5) {
    initLogsPagination();
  }
}

/***********************
 * LOGS FUNCTION
 ***********************/
function addLog(action, target) {
  const now = new Date();
  const time = now.toLocaleString("vi-VN");
  
  // Xác định loại action
  let actionType = "update";
  if (action.includes("Tạo")) actionType = "create";
  else if (action.includes("Xem")) actionType = "view";
  else if (action.includes("Vô hiệu") || action.includes("Xóa")) actionType = "delete";
  else if (action.includes("Đăng nhập")) actionType = "login";
  
  // Thêm log mới vào đầu mảng
  logsData.unshift({
    time: time,
    user: adminName,
    action: action,
    actionType: actionType,
    target: target,
    ip: "192.168.1.10"
  });
  
  // Cập nhật giao diện logs
  renderLogsPage();
  
  // Reset về trang 1
  logsCurrentPage = 1;
  updateLogsPaginationUI();

  saveToLocalStorage();
}

/***********************
 * STATS FUNCTION
 ***********************/
function updateStats() {
  // Cập nhật phiên bản chính sách
  const policyVersionElement = document.querySelectorAll(".card .value-small")[1];
  if (policyVersionElement) {
    policyVersionElement.textContent = `v${policyVersion}`;
  }
  
  // Cập nhật số người đã đồng ý
  const agreedUsers = consentData.filter(user => user.status === "success").length;
  const userCountElement = document.querySelectorAll(".card .value-small")[0];
  if (userCountElement) {
    userCountElement.textContent = agreedUsers;
  }
  
  // Cập nhật tỷ lệ tuân thủ (tính toán thực tế)
  const totalConsents = consentData.length;
  const complianceRate = totalConsents > 0 ? Math.round((agreedUsers / totalConsents) * 100) : 0;
  const rateElement = document.querySelectorAll(".card .value-small")[2];
  if (rateElement) {
    rateElement.textContent = `${complianceRate}%`;
  }
}

/***********************
 * LOCALSTORAGE
 ***********************/
function saveToLocalStorage() {
  try {
    localStorage.setItem("privacyPolicy_version", policyVersion.toString());
    localStorage.setItem("consentTypes", JSON.stringify(consentTypes));
    localStorage.setItem("consentData", JSON.stringify(consentData));
    localStorage.setItem("logsData", JSON.stringify(logsData));
  } catch (error) {
    console.error("Lỗi khi lưu vào localStorage:", error);
  }
}

function loadFromLocalStorage() {
  try {
    // Load version
    const savedVersion = localStorage.getItem("privacyPolicy_version");
    if (savedVersion) {
      policyVersion = parseFloat(savedVersion);
    }

    // Load consent types
    const savedConsentTypes = localStorage.getItem("consentTypes");
    if (savedConsentTypes) {
      const parsedTypes = JSON.parse(savedConsentTypes);
      consentTypes.length = 0; // Xóa mảng cũ
      consentTypes.push(...parsedTypes); // Thêm dữ liệu đã lưu
    }

    // Load consent data
    const savedConsents = localStorage.getItem("consentData");
    if (savedConsents) {
      const parsedConsents = JSON.parse(savedConsents);
      consentData.length = 0;
      consentData.push(...parsedConsents);
    }

    // Load logs
    const savedLogs = localStorage.getItem("logsData");
    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs);
      logsData.length = 0;
      logsData.push(...parsedLogs);
    }

    console.log("Đã load dữ liệu từ localStorage");
  } catch (error) {
    console.error("Lỗi khi load localStorage:", error);
  }
}