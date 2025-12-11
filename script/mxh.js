// script/mxh.js - ĐÃ HOÀN CHỈNH, GỌI API THẬT
const API_URL = '/api/social-medias';

document.addEventListener('DOMContentLoaded', async () => {
  const cardsContainer = document.querySelector('.cards');

  // Load dữ liệu từ DB khi mở trang
  async function loadSocialMedias() {
    try {
      const res = await fetch(API_URL);
      const medias = await res.json();
      cardsContainer.innerHTML = ''; // Xóa card giả

      medias.forEach(media => {
        createCard(media.id, media.name, media.link);
      });
    } catch (err) {
      showNotification('Lỗi tải dữ liệu mạng xã hội!', 'error');
    }
  }

  // Tạo card từ dữ liệu DB
  function createCard(id, name, link) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${name}</h3>
      <a class="web" href="${link}" target="_blank">${link}</a>
      <div class="actions">
        <button class="edit" data-id="${id}" data-name="${name}" data-link="${link}">Sửa</button>
        <button class="delete" data-id="${id}">Xóa</button>
      </div>
    `;
    cardsContainer.appendChild(card);
    attachCardEvents(card);
  }

  // Gắn sự kiện cho card
  function attachCardEvents(card) {
    card.querySelector('.edit').addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const name = this.getAttribute('data-name');
      const link = this.getAttribute('data-link').replace('https://', '');

      document.getElementById('editOrgId').value = id;
      document.getElementById('editOrgName').value = name;
      document.getElementById('editOrgLink').value = link;
      document.getElementById('editModalOverlay').classList.add('active');
    });

    card.querySelector('.delete').addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      const name = card.querySelector('h3').textContent;
      showConfirmModal(`Xóa "${name}" khỏi danh sách?`, async () => {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        card.remove();
        showNotification(`Đã xóa "${name}"`, 'success');
      });
    });
  }

  // Tạo mới
  document.getElementById('createOrgForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('orgName').value.trim();
    const link = document.getElementById('orgLink').value.trim();
    if (!name || !link) return showNotification('Nhập đầy đủ!', 'error');

    const fullLink = link.startsWith('http') ? link : `https://${link}`;

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, link: fullLink })
    });

    if (res.ok) {
      const media = await res.json();
      createCard(media.id, media.name, media.link);
      showNotification(`Đã thêm "${name}"`, 'success');
      document.getElementById('modalOverlay').classList.remove('active');
      createOrgForm.reset();
    }
  });

  // Sửa
  document.getElementById('editOrgForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editOrgId').value;
    const name = document.getElementById('editOrgName').value.trim();
    const link = document.getElementById('editOrgLink').value.trim();
    const fullLink = link.startsWith('http') ? link : `https://${link}`;

    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, link: fullLink })
    });

    if (res.ok) {
      const media = await res.json();
      const card = document.querySelector(`.edit[data-id="${id}"]`).closest('.card');
      card.querySelector('h3').textContent = name;
      card.querySelector('.web').textContent = fullLink;
      card.querySelector('.web').href = fullLink;
      card.querySelector('.edit').setAttribute('data-name', name);
      card.querySelector('.edit').setAttribute('data-link', fullLink);
      showNotification('Cập nhật thành công!', 'success');
      document.getElementById('editModalOverlay').classList.remove('active');
    }
  });

  // Xác nhận xóa
  function showConfirmModal(msg, callback) {
    document.getElementById('confirmMessage').textContent = msg;
    window.confirmCallback = callback;
    document.getElementById('confirmModalOverlay').classList.add('active');
  }

  document.querySelector('.confirm-btn').onclick = () => {
    if (window.confirmCallback) window.confirmCallback();
    document.getElementById('confirmModalOverlay').classList.remove('active');
  };

  document.querySelectorAll('.cancel-confirm-btn, .close-confirm-btn').forEach(btn => {
    btn.onclick = () => document.getElementById('confirmModalOverlay').classList.remove('active');
  });

  // Load dữ liệu khi mở trang
  loadSocialMedias();
});
