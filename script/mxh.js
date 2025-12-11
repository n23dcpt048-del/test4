// script/mxh.js - ĐÃ SỬA XÓA HOÀN HẢO, TEST THÀNH CÔNG LÚC 00:25
const API_URL = 'https://test4-7cop.onrender.com/api/social-medias';

document.addEventListener('DOMContentLoaded', async function () {
  const openModalBtn = document.getElementById('openModalBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const createOrgForm = document.getElementById('createOrgForm');
  const editModalOverlay = document.getElementById('editModalOverlay');
  const editOrgForm = document.getElementById('editOrgForm');
  const confirmModalOverlay = document.getElementById('confirmModalOverlay');
  const confirmMessage = document.getElementById('confirmMessage');

  // QUAN TRỌNG: Đặt confirmBtn ở đây, trước khi dùng
  const confirmBtn = document.querySelector('.confirm-btn');
  const cancelConfirmBtn = document.querySelector('.cancel-confirm-btn');
  const closeConfirmBtn = document.querySelector('.close-confirm-btn');

  let currentCardToDelete = null;

  // ==================== NOTIFICATION ====================
  const notification = document.createElement('div');
  notification.id = 'notification';
  Object.assign(notification.style, {
    position: 'fixed', top: '20px', right: '20px', padding: '15px 25px',
    backgroundColor: '#4CAF50', color: 'white', borderRadius: '8px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)', zIndex: '99999',
    opacity: '0', transform: 'translateY(-20px)', transition: 'all 0.4s',
    fontFamily: 'Arial, sans-serif', fontSize: '15px', borderRadius: '8px'
  });
  document.body.appendChild(notification);

  function showNotification(msg, type = 'success') {
    const colors = { success: '#4CAF50', error: '#f44336', warning: '#ff9800' };
    notification.textContent = msg;
    notification.style.backgroundColor = colors[type] || '#4CAF50';
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-20px)';
    }, 3000);
  }

  // ==================== TRẠNG THÁI TRỐNG ====================
  function checkEmptyState() {
    const container = document.querySelector('.cards');
    const existing = container.querySelector('.empty-message');
    if (existing) existing.remove();

    if (container.querySelectorAll('.card').length === 0) {
      const msg = document.createElement('div');
      msg.className = 'empty-message';
      msg.innerHTML = `
        <div style="font-size:80px;margin-bottom:20px;opacity:0.6;">Link</div>
        <h3 style="margin:0 0 12px 0;font-size:24px;color:#333;">Chưa có mạng xã hội nào</h3>
        <p style="margin:0;font-size:16px;color:#666;">Nhấn nút "+ Thêm mới" để bắt đầu</p>
      `;
      Object.assign(msg.style, {
        textAlign: 'center', padding: '80px 20px', gridColumn: '1/-1', color: '#888'
      });
      container.appendChild(msg);
    }
  }

  // ==================== LOAD DỮ LIỆU ====================
  async function loadSocialMedias() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list = await res.json();
      document.querySelector('.cards').innerHTML = '';
      list.forEach(item => createCard(item));
      checkEmptyState();
    } catch (err) {
      showNotification('Lỗi kết nối server!', 'error');
      console.error(err);
    }
  }

  // ==================== TẠO CARD ====================
  function createCard(data) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${data.name}</h3>
      <a class="web" href="${data.link}" target="_blank" rel="noopener">${data.link}</a>
      <div class="actions">
        <button class="edit" data-id="${data.id}">Sửa</button>
        <button class="delete" data-id="${data.id}">Xóa</button>
      </div>
    `;

    // Gắn sự kiện SỬA
    card.querySelector('.edit').onclick = () => {
      document.getElementById('editOrgId').value = data.id;
      document.getElementById('editOrgName').value = data.name;
      document.getElementById('editOrgLink').value = data.link.replace(/^https?:\/\//, '');
      editModalOverlay.classList.add('active');
    };

    // Gắn sự kiện XÓA
    card.querySelector('.delete').onclick = () => {
      currentCardToDelete = card;
      confirmMessage.textContent = `Xóa "${data.name}" khỏi danh sách?`;
      confirmModalOverlay.classList.add('active');
    };

    document.querySelector('.cards').appendChild(card);
  }

  // ==================== THÊM MỚI ====================
  createOrgForm.onsubmit = async e => {
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
        const item = await res.json();
        createCard(item);
        checkEmptyState();
        showNotification(`Đã thêm "${name}"`, 'success');
        modalOverlay.classList.remove('active');
        createOrgForm.reset();
      }
    } catch {
      showNotification('Lỗi khi thêm!', 'error');
    }
  };

  // ==================== SỬA ====================
  editOrgForm.onsubmit = async e => {
    e.preventDefault();
    const id = document.getElementById('editOrgId').value;
    const name = document.getElementById('editOrgName').value.trim();
    const linkInput = document.getElementById('editOrgLink').value.trim();
    const link = linkInput.startsWith('http') ? linkInput : `https://${linkInput}`;

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, link })
    });

    if (res.ok) {
      loadSocialMedias();
      showNotification('Cập nhật thành công!', 'success');
      editModalOverlay.classList.remove('active');
    } else {
      showNotification('Lỗi khi cập nhật!', 'error');
    }
  };

  // ==================== XÓA – HOẠT ĐỘNG 100% ====================
  confirmBtn.onclick = async () => {
    if (!currentCardToDelete) return;

    const id = currentCardToDelete.querySelector('.delete').dataset.id;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        currentCardToDelete.remove();
        checkEmptyState();
        showNotification('Đã xóa thành công!', 'success');
      } else {
        showNotification('Lỗi server khi xóa!', 'error');
      }
    } catch (err) {
      showNotification('Lỗi kết nối khi xóa!', 'error');
      console.error(err);
    }

    confirmModalOverlay.classList.remove('active');
    currentCardToDelete = null;
  };

  // ==================== ĐÓNG MODAL ====================
  [closeConfirmBtn, cancelConfirmBtn].forEach(btn => {
    if (btn) btn.onclick = () => {
      confirmModalOverlay.classList.remove('active');
      currentCardToDelete = null;
    };
  });

  document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
    btn.onclick = () => {
      modalOverlay.classList.remove('active');
      editModalOverlay.classList.remove('active');
    };
  });

  [modalOverlay, editModalOverlay, confirmModalOverlay].forEach(overlay => {
    overlay.onclick = e => {
      if (e.target === overlay) overlay.classList.remove('active');
    };
  });

  openModalBtn.onclick = () => modalOverlay.classList.add('active');

  // ==================== KHỞI ĐỘNG ====================
  loadSocialMedias();
});

// LOGOUT
document.querySelector('.logout-btn')?.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});
