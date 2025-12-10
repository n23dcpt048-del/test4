// script/qlnd.js - FIX CUỐI CÙNG: DEBUG CHI TIẾT + FALLBACK (KẾT NỐI API THẬT)
const API_BASE = 'https://test4-7cop.onrender.com/api/ugc'; // URL đúng của bạn

// Notification (giữ nguyên)
function createNotificationElement() {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #2cbe67ff;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateX(-100px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        max-width: 300px;
        font-family: Arial, sans-serif;
        font-size: 14px;
        cursor: pointer;
    `;
    document.body.appendChild(notification);
    return notification;
}
const notification = createNotificationElement();
function showNotification(message, type = 'success') {
    const colors = { 'success': '#2cbe67ff', 'error': '#f44336', 'warning': '#ff9800' };
    notification.textContent = message;
    notification.style.backgroundColor = colors[type] || colors['success'];
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    setTimeout(() => hideNotification(), 3000);
}
function hideNotification() {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(-100px)';
}
notification.addEventListener('click', hideNotification);

// Render card từ data API (giữ nguyên, thêm log)
function renderContentCard(content) {
  console.log('Rendering card:', content); // Debug
  const card = document.createElement('div');
  card.className = `content-card ${content.status === 'approved' ? 'approved' : ''}`;
  card.dataset.id = content.id;
  card.innerHTML = `
    <div class="content-image">
      <img src="${content.imageUrl}" alt="${content.title}">
      ${content.status === 'approved' ? '<div class="status-badge approved">Đã duyệt</div>' : ''}
    </div>
    <div class="content-info">
      <h3>${content.title}</h3>
      <div class="author">Bởi ${content.author}</div>
      <div class="timestamp">${content.timestamp}</div>
      <div class="actions">
        ${content.status === 'pending' ? `
          <button class="approve-btn">Duyệt</button>
          <button class="reject-btn">Từ chối</button>
        ` : `
          <button class="archive-btn">Xóa</button>
        `}
      </div>
    </div>
  `;
  // Gắn event
  if (content.status === 'pending') {
    card.querySelector('.approve-btn').addEventListener('click', () => handleAction(content.id, 'approve'));
    card.querySelector('.reject-btn').addEventListener('click', () => handleAction(content.id, 'reject'));
  } else {
    card.querySelector('.archive-btn').addEventListener('click', () => handleAction(content.id, 'archive'));
  }
  return card;
}

// Load tab từ API (FIX: Debug từng bước, fallback nếu lỗi)
async function loadTab(tab) {
  try {
    console.log(`🔄 Bắt đầu load ${tab} từ ${API_BASE}/${tab}`);
    const response = await fetch(`${API_BASE}/${tab}`);
    console.log(`📡 Response status: ${response.status} ${response.statusText}`);
    console.log('📡 Response headers:', [...response.headers.entries()]); // Check CORS
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const text = await response.text(); // Đọc text trước để debug
    console.log(`📄 Raw response text: ${text.substring(0, 200)}...`); // Log raw JSON
    
    const contents = JSON.parse(text); // Parse JSON
    console.log(`✅ Parsed ${contents.length} items:`, contents);
    
    const grid = document.querySelector(`#${tab}-content .content-grid`);
    console.log('🎯 Found grid element:', grid); // Check DOM
    if (!grid) throw new Error('Không tìm thấy #${tab}-content .content-grid');
    
    grid.innerHTML = '';
    contents.forEach(content => grid.appendChild(renderContentCard(content)));
    
    // Cập nhật badge
    const badge = document.querySelector(`[data-tab="${tab}"] .badge`);
    if (badge) {
      badge.textContent = `(${contents.length})`;
      badge.style.display = contents.length > 0 ? 'inline' : 'none';
      console.log(`📊 Badge updated: (${contents.length}) for ${tab}`);
    }
    
    showNotification(`Tải ${contents.length} bài ${tab} thành công!`, 'success');
  } catch (err) {
    console.error('❌ Load error chi tiết:', err);
    showNotification(`Lỗi tải ${tab}: ${err.message}. Xem Console (F12) để debug.`, 'error');
    
    // FALLBACK: Tải dữ liệu mẫu tạm nếu API lỗi (xóa nếu không cần)
    loadTabFallback(tab);
  }
}

// FALLBACK: Dữ liệu mẫu nếu API fail (giống HTML gốc)
function loadTabFallback(tab) {
  console.log(`🔄 Fallback: Load mẫu cho ${tab}`);
  const sample = tab === 'pending' ? [
    { id: 1, title: 'RECAP CSV 2025', author: 'Nguyễn Văn Dương', timestamp: '20:00:00 16/12/2025', imageUrl: 'picture/recapcsv.jpg', status: 'pending' },
    { id: 2, title: 'RECAP HCMPTIT ICPC 2025', author: 'Chu Văn Phong', timestamp: '21:34:54 9/12/2025', imageUrl: 'picture/recapitmc.jpg', status: 'pending' },
    { id: 3, title: 'RECAP ASTEES COLLECTION REVEAL 2025', author: 'Vương Sơn Hà', timestamp: '22:30:00 17/12/2025', imageUrl: 'picture/recapazone.jpg', status: 'pending' }
  ] : [
    { id: 4, title: 'RECAP CASTING THE ASTRO - THE INFINITY GEN', author: 'Dương Minh Thoại', timestamp: '20:34:54 5/12/2025', imageUrl: 'picture/recapcmc.jpg', status: 'approved' },
    { id: 5, title: 'RECAP - HCM PTIT MULTIMEDIA 2025', author: 'Lê Nhất Duy', timestamp: '23:34:54 7/12/2025', imageUrl: 'picture/recaplcd.jpg', status: 'approved' }
  ];
  
  const grid = document.querySelector(`#${tab}-content .content-grid`);
  if (grid) {
    grid.innerHTML = '';
    sample.forEach(content => grid.appendChild(renderContentCard(content)));
    const badge = document.querySelector(`[data-tab="${tab}"] .badge`);
    if (badge) badge.textContent = `(${sample.length})`;
    console.log(`✅ Fallback loaded ${sample.length} items for ${tab}`);
  }
}

// Xử lý action (FIX: Dùng route POST /update/:id để khớp controller gốc)
async function handleAction(id, action) {
  let message = '', newStatus = '';
  if (action === 'approve') { message = 'Bạn có chắc chắn muốn duyệt nội dung này?'; newStatus = 'approved'; }
  if (action === 'reject') { message = 'Bạn có chắc chắn muốn từ chối nội dung này?'; newStatus = 'rejected'; }
  if (action === 'archive') { message = 'Bạn có chắc chắn muốn xóa nội dung này?'; newStatus = 'archived'; }
  
  showModal(message, async () => {
    try {
      console.log(`🔄 Updating ${id} to ${newStatus}`);
      const response = await fetch(`${API_BASE}/update/${id}`, {  // FIX: Route /update/:id
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      console.log(`📡 Update response: ${response.status}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      await Promise.all([loadTab('pending'), loadTab('approved')]);
      showNotification(`Đã ${action === 'reject' ? 'từ chối' : action === 'archive' ? 'xóa' : 'duyệt'} thành công!`, action === 'reject' ? 'warning' : 'success');
    } catch (err) {
      console.error('❌ Action error:', err);
      showNotification(`Lỗi ${action}: ${err.message}`, 'error');
    }
  });
}

// Modal (giữ nguyên)
const modalOverlay = document.getElementById('modalOverlay');
let currentCallback = null;
function showModal(message, callback) {
  const modalMessage = document.getElementById('modalMessage');
  if (modalMessage) modalMessage.textContent = message;
  currentCallback = callback;
  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function hideModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = 'auto';
  currentCallback = null;
}
if (modalOverlay) {
  document.querySelector('.close-btn')?.addEventListener('click', hideModal);
  document.querySelector('.cancel-btn')?.addEventListener('click', hideModal);
  document.querySelector('.confirm-btn')?.addEventListener('click', () => {
    if (currentCallback) currentCallback();
    hideModal();
  });
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) hideModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hideModal(); });
}

// Tab (giữ nguyên, load khi click)
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
tabBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const tabId = btn.getAttribute('data-tab');
    tabBtns.forEach(b => b.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`${tabId}-content`).classList.add('active');
    await loadTab(tabId);
  });
});

// Init: Load khi trang mở
async function init() {
  console.log('🚀 Init UGC page...');
  await Promise.all([loadTab('pending'), loadTab('approved')]);
  if (tabBtns[0]) tabBtns[0].click(); // Mở tab pending
}
init();

// Logout (giữ nguyên)
document.querySelector('.logout-btn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});
