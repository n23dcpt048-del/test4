// script/mxh.js - GIỮ NGUYÊN GIAO DIỆN, CHỈ GỌI API THẬT
const API_URL = '/api/social-medias'; // Đúng route backend

document.addEventListener('DOMContentLoaded', async function () {
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const createOrgForm = document.getElementById('createOrgForm');

  const editModalOverlay = document.getElementById('editModalOverlay');
  const closeEditBtn = document.getElementById('closeEditBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const editOrgForm = document.getElementById('editOrgForm');

  const confirmModalOverlay = document.getElementById('confirmModalOverlay');
  const closeConfirmBtn = document.querySelector('.close-confirm-btn');
  const cancelConfirmBtn = document.querySelector('.cancel-confirm-btn');
  const confirmBtn = document.querySelector('.confirm-btn');
  const confirmMessage = document.getElementById('confirmMessage');

  let currentCard = null;

  // ==================== THÔNG BÁO ====================
  function createNotificationElement() {
    {
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; background-color: #2cbe67ff;
      color: white; padding: 15px 25px; border-radius: 5px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000; opacity: 0; transform: translateX(100px); transition: all 0.3s;
      max-width: 300px; font-family: Arial, sans-serif; font-size: 14px; cursor: pointer;
    `;
    document.body.appendChild(notification);
    return notification;
  }

  const notification = createNotificationElement();

  function showNotification(message, type = 'success') {
    const colors = { success: '#4CAF50', error: '#f44336', warning: '#ff9800' };
    notification.textContent = message;
    notification.style.backgroundColor = colors[type] || colors.success;
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    setTimeout(hideNotification, 3000);
  }

  function hideNotification() {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
  }
  notification.addEventListener('click', hideNotification);

  // ==================== LOAD DỮ LIỆU TỪ DB ====================
  async function loadFromAPI() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Lỗi server');
      const list = await res.json();

      const container = document.querySelector('.cards');
      container.innerHTML = ''; // xóa card mẫu

      list.forEach(item => createCard(item));
    } catch (err) {
      showNotification('Không tải được dữ liệu mạng xã hội!', 'error');
    }
  }

  // ==================== TẠO CARD TỪ DATA DB ====================
  function createCard(data) {
    const container = document.querySelector('.cards');
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${data.name}</h3>
      <a class="web" href="${data.link}" target="_blank">${data.link}</a>
      <div class="actions">
        <button class="edit"
          data-id="${data.id}"
          data-org-name="${data.name}"
          data-org-link="${data.link.replace('https://', '').replace('http://', '')}">Sửa</button>
        <button class="delete" data-id="${data.id}">Xóa</button>
      </div>
    `;
    container.appendChild(card);
    attachEvents(card);
  }

  // ==================== GẮN SỰ KIỆN CHO CARD ====================
  function attachEvents(card) {
    // SỬA
    card.querySelector('.edit').addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      const name = this.getAttribute('data-org-name');
      const link = this.getAttribute('data-org-link');

      document.getElementById('editOrgId').value = id;
      document.getElementById('editOrgName').value = name;
      document.getElementById('editOrgLink').value = link;

      editModalOverlay.classList.add('active');
    });

    // XÓA
    card.querySelector('.delete').addEventListener('click', function () {
      currentCard = card;
      const name = card.querySelector('h3').textContent;
      showConfirmModal(`Bạn có chắc chắn muốn xóa "${name}" không?`);
    });
  }

  // ==================== MODAL TẠO MỚI ====================
  openModalBtn.addEventListener('click', () => modalOverlay.classList.add('active'));

  function closeModal() {
    modalOverlay.classList.remove('active');
    createOrgForm.reset();
  }
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

  // Submit tạo mới → gọi API
  createOrgForm.addEventListener('submit', async e => {
    e.preventDefault();
    const name = document.getElementById('orgName').value.trim();
    const linkInput = document.getElementById('orgLink').value.trim();
    if (!name || !linkInput) return showNotification('Vui lòng nhập đầy đủ!', 'error');

    const link = linkInput.startsWith('http') ? linkInput : `https://${linkInput}`;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, link })
      });

      if (res.ok) {
        const newItem = await res.json();
        createCard(newItem);
        showNotification(`Đã thêm "${name}"`, 'success');
        closeModal();
      } else {
        throw new Error('Lỗi server');
      }
    } catch (err) {
      showNotification('Lỗi khi thêm!', 'error');
    }
  });

  // ==================== MODAL SỬA ====================
  function closeEditModal() {
    editModalOverlay.classList.remove('active');
    editOrgForm.reset();
  }
  closeEditBtn.addEventListener('click', closeEditModal);
  cancelEditBtn.addEventListener('click', closeEditModal);
  editModalOverlay.addEventListener('click', e => { if (e.target === editModalOverlay) closeEditModal(); });

  editOrgForm.addEventListener('submit', async e => {
    e.preventDefault();
    const id = document.getElementById('editOrgId').value;
    const name = document.getElementById('editOrgName').value.trim();
    const linkInput = document.getElementById('editOrgLink').value.trim();
    const link = linkInput.startsWith('http') ? linkInput : `https://${linkInput}`;

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, link })
      });

      if (res.ok) {
        const updated = await res.json();
        const card = document.querySelector(`.edit[data-id="${id}"]`).closest('.card');
        card.querySelector('h3').textContent = updated.name;
        card.querySelector('.web').textContent = updated.link;
        card.querySelector('.web').href = updated.link;
        card.querySelector('.edit').setAttribute('data-org-name', updated.name);
        card.querySelector('.edit').setAttribute('data-org-link', updated.link.replace('https://', '').replace('http://', ''));
        showNotification('Cập nhật thành công!', 'success');
        closeEditModal();
      }
    } catch (err) {
      showNotification('Lỗi khi cập nhật!', 'error');
    }
  });

  // ==================== MODAL XÁC NHẬN XÓA ====================
  function showConfirmModal(msg) {
    confirmMessage.textContent = msg;
    confirmModalOverlay.classList.add('active');
  }

  closeConfirmBtn.addEventListener('click', () => confirmModalOverlay.classList.remove('active'));
  cancelConfirmBtn.addEventListener('click', () => confirmModalOverlay.classList.remove('active'));

  confirmBtn.addEventListener('click', async () => {
    if (!currentCard) return;
    const id = currentCard.querySelector('.delete').getAttribute('data-id');
    const name = currentCard.querySelector('h3').textContent;

    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      currentCard.remove();
      showNotification(`Đã xóa "${name}"`, 'success');
    } catch (err) {
      showNotification('Lỗi khi xóa!', 'error');
    }
    confirmModalOverlay.classList.remove('active');
    currentCard = null;
  });

  confirmModalOverlay.addEventListener('click', e => {
    if (e.target === confirmModalOverlay) confirmModalOverlay.classList.remove('active');
  });

  // ==================== PHÍM ESC & CLICK ẨN NOTI ====================
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeEditModal();
      confirmModalOverlay.classList.remove('active');
      hideNotification();
    }
  });

  // ==================== KHỞI TẠO ====================
  loadFromAPI(); // Tải dữ liệu thật khi mở trang
});

// LOGOUT
document.querySelector('.logout-btn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});
