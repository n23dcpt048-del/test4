// script/mxh.js - CHỈ SỬA 1 DÒNG API_URL LÀ CHẠY NGON NGAY
const API_URL = 'https://test4-7cop.onrender.com/api/social-medias';

document.addEventListener('DOMContentLoaded', async function () {
  const openModalBtn = document.getElementById('openModalBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const createOrgForm = document.getElementById('createOrgForm');
  const editModalOverlay = document.getElementById('editModalOverlay');
  const editOrgForm = document.getElementById('editOrgForm');
  const confirmModalOverlay = document.getElementById('confirmModalOverlay');
  const confirmMessage = document.getElementById('confirmMessage');
  const confirmBtn = document.querySelector('.confirm-btn');

  let currentCardToDelete = null;

  // ==================== NOTIFICATION ====================
  const notification = document.createElement('div');
  notification.id = 'notification';
  Object.assign(notification.style, {
    position: 'fixed', top: '20px', right: '20px', padding: '15px 25px',
    backgroundColor: '#4CAF50', color: 'white', borderRadius: '5px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: '10000',
    opacity: '0', transform: 'translateX(100px)', transition: 'all 0.3s',
    fontFamily: 'Arial, sans-serif', fontSize: '14px', cursor: 'pointer'
  });
  document.body.appendChild(notification);

  function showNotification(msg, type = 'success') {
    const colors = { success: '#4CAF50', error: '#f44336', warning: '#ff9800' };
    notification.textContent = msg;
    notification.style.backgroundColor = colors[type] || colors.success;
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
    }, 3000);
  }
  notification.onclick = () => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100px)';
  };

  // ==================== LOAD TỪ DATABASE ====================
  async function loadSocialMedias() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Lỗi server');
      const list = await res.json();
      const container = document.querySelector('.cards');
      container.innerHTML = '';
      list.forEach(item => createCard(item));
      if (list.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666; grid-column:1/-1;">Chưa có mạng xã hội nào. Hãy thêm mới!</p>';
      }
    } catch (err) {
      showNotification('Không tải được dữ liệu! Kiểm tra console (F12)', 'error');
      console.error(err);
    }
  }

  // ==================== TẠO CARD ====================
  function createCard(data) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${data.name}</h3>
      <a class="web" href="${data.link}" target="_blank">${data.link}</a>
      <div class="actions">
        <button class="edit"
          data-id="${data.id}"
          data-name="${data.name}"
          data-link="${data.link.replace(/^https?:\/\//, '')}">Sửa</button>
        <button class="delete" data-id="${data.id}">Xóa</button>
      </div>
    `;
    document.querySelector('.cards').appendChild(card);

    card.querySelector('.edit').onclick = () => openEditModal(data);
    card.querySelector('.delete').onclick = () => {
      currentCardToDelete = card;
      confirmMessage.textContent = `Xóa "${data.name}" khỏi danh sách?`;
      confirmModalOverlay.classList.add('active');
    };
  }

  function openEditModal(data) {
    document.getElementById('editOrgId').value = data.id;
    document.getElementById('editOrgName').value = data.name;
    document.getElementById('editOrgLink').value = data.link.replace(/^https?:\/\//, '');
    editModalOverlay.classList.add('active');
  }

  // ==================== THÊM MỚI ====================
  createOrgForm.onsubmit = async e => {
    e.preventDefault();
    const name = document.getElementById('orgName').value.trim();
    const linkInput = document.getElementById('orgLink').value.trim();
    if (!name || !linkInput) return showNotification('Nhập đầy đủ thông tin!', 'error');

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
        modalOverlay.classList.remove('active');
        createOrgForm.reset();
      } else {
        throw new Error('Lỗi server');
      }
    } catch (err) {
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

    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, link })
    })
    .then(res => {
      if (res.ok) return res.json();
      throw new Error();
    })
    .then(() => {
      loadSocialMedias();
      showNotification('Cập nhật thành công!', 'success');
      editModalOverlay.classList.remove('active');
    })
    .catch(() => showNotification('Lỗi khi sửa!', 'error'));
  };

  // ==================== XÓA ====================
  confirmBtn.onclick = async () => {
    if (!currentCardToDelete) return;
    const id = currentCardToDelete.querySelector('.delete').dataset.id;

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        currentCardToDelete.remove();
        showNotification('Đã xóa thành công!', 'success');
      }
    } catch {
      showNotification('Lỗi khi xóa!', 'error');
    }
    confirmModalOverlay.classList.remove('active');
    currentCardToDelete = null;
  };

  // ==================== ĐÓNG MODAL ====================
  document.querySelectorAll('.close-btn, .cancel-btn, .cancel-confirm-btn, .close-confirm-btn')
    .forEach(btn => btn.onclick = () => {
      modalOverlay.classList.remove('active');
      editModalOverlay.classList.remove('active');
      confirmModalOverlay.classList.remove('active');
    });

  [modalOverlay, editModalOverlay, confirmModalOverlay].forEach(overlay => {
    overlay.onclick = e => { if (e.target === overlay) overlay.classList.remove('active'); };
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
