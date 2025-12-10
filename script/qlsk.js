// script/qlsk.js - GỌI API THẬT CHO SỰ KIỆN (giữ nguyên logic cũ)
const API_BASE = 'https://test4-7cop.onrender.com/api/events';

// Notification (giữ nguyên)
function createNotificationElement() {
  const notification = document.createElement('div');
  notification.id = 'notification';
  notification.style.cssText = `
    position: fixed; top: 20px; right: 20px; background-color: #2cbe67ff; color: white;
    padding: 15px 25px; border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000; opacity: 0; transform: translateX(-100px); transition: opacity 0.3s ease, transform 0.3s ease;
    max-width: 300px; font-family: Arial, sans-serif; font-size: 14px; cursor: pointer;
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
  setTimeout(hideNotification, 3000);
}
function hideNotification() {
  notification.style.opacity = '0';
  notification.style.transform = 'translateX(-100px)';
}
notification.addEventListener('click', hideNotification);

// Render card từ API (giữ nguyên logic cũ, thêm imageUrl nếu có)
function renderEventCard(event) {
  const card = document.createElement('div');
  card.className = `event-card ${event.status === 'approved' ? 'approved' : ''}`;
  card.dataset.id = event.id;
  card.innerHTML = `
    <div class="event-image">
      ${event.imageUrl ? `<img src="${event.imageUrl}" alt="${event.title}">` : '<div class="no-image">No Image</div>'}
      ${event.status === 'approved' ? '<div class="status-badge approved">Đã duyệt</div>' : ''}
    </div>
    <div class="event-info">
      <h3>${event.title}</h3>
      <div class="date">${event.date}</div>
      <div class="location">${event.location}</div>
      <p class="description">${event.description}</p>
      <div class="actions">
        ${event.status === 'pending' ? `
          <button class="approve-btn">Duyệt</button>
          <button class="reject-btn">Từ chối</button>
        ` : `
          <button class="archive-btn">Xóa</button>
        `}
      </div>
    </div>
  `;
  if (event.status === 'pending') {
    card.querySelector('.approve-btn').addEventListener('click', () => handleAction(event.id, 'approve'));
    card.querySelector('.reject-btn').addEventListener('click', () => handleAction(event.id, 'reject'));
  } else {
    card.querySelector('.archive-btn').addEventListener('click', () => handleAction(event.id, 'archive'));
  }
  return card;
}

// Load tab từ API (sửa từ static sang fetch)
async function loadTab(tab) {
  try {
    const response = await fetch(`${API_BASE}/${tab}`);
    if (!response.ok) throw new Error('Lỗi tải dữ liệu');
    const events = await response.json();
    const grid = document.querySelector(`#${tab}-content .event-grid`);
    grid.innerHTML = '';
    events.forEach(event => grid.appendChild(renderEventCard(event)));
    const badge = document.querySelector(`[data-tab="${tab}"] .badge`);
    badge.textContent = `(${events.length})`;
    badge.style.display = events.length > 0 ? 'inline' : 'none';
  } catch (err) {
    showNotification('Lỗi tải sự kiện: ' + err.message, 'error');
  }
}

// Handle action (sửa từ local sang POST API)
async function handleAction(id, action) {
  let message = '', newStatus = '';
  if (action === 'approve') { message = 'Duyệt sự kiện này?'; newStatus = 'approved'; }
  if (action === 'reject') { message = 'Từ chối sự kiện này?'; newStatus = 'rejected'; }
  if (action === 'archive') { message = 'Xóa sự kiện này?'; newStatus = 'archived'; }
  
  showModal(message, async () => {
    try {
      const response = await fetch(`${API_BASE}/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Lỗi cập nhật');
      await Promise.all([loadTab('pending'), loadTab('approved')]);
      showNotification(`Đã ${action === 'reject' ? 'từ chối' : action === 'archive' ? 'xóa' : 'duyệt'} thành công!`, action === 'reject' ? 'warning' : 'success');
    } catch (err) {
      showNotification('Lỗi: ' + err.message, 'error');
    }
  });
}

// Modal, tab, init (giữ nguyên hoàn toàn, chỉ thêm loadTab)
const modalOverlay = document.getElementById('modalOverlay');
let currentCallback = null;
function showModal(message, callback) {
  document.getElementById('modalMessage').textContent = message;
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

// Init
async function init() {
  await Promise.all([loadTab('pending'), loadTab('approved')]);
  tabBtns[0]?.click();
}
init();

// Logout (giữ nguyên)
document.querySelector('.logout-btn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});
