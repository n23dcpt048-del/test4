// ==================== KẾT NỐI BACKEND ====================
const API_BASE = 'https://test4-7cop.onrender.com';
let organizations = [];

// Load danh sách tổ chức từ backend
async function loadOrganizations() {
    try {
        const res = await fetch(`${API_BASE}/api/organizations`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        organizations = await res.json();

        const selects = [
            document.getElementById('eventOrganization'),
            document.getElementById('editEventOrganization')
        ];
        selects.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">-----</option>';
                organizations.forEach(org => {
                    const opt = document.createElement('option');
                    opt.value = org.id;
                    opt.textContent = org.name;
                    select.appendChild(opt);
                });
            }
        });
    } catch (err) {
        console.error('Lỗi load tổ chức:', err);
        alert('Không thể tải danh sách tổ chức. Kiểm tra console (F12).');
    }
}

// Load tất cả sự kiện từ backend và render
async function loadEvents() {
    try {
        const res = await fetch(`${API_BASE}/api/events`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const events = await res.json();

        // Xóa hết card cũ
        document.querySelectorAll('.event-card').forEach(wrapper => wrapper.innerHTML = '');

        events.forEach(event => {
            let tabId = '';
            if (event.status === 'created') tabId = 'created-content';
            else if (event.status === 'pending') tabId = 'waitapproved-content';
            else if (event.status === 'approved') tabId = 'approved-content';

            if (tabId) renderEventCard(event, tabId);
        });

        updateTabBadges();
        updateEventStatusBadges();
        checkEmptyTab();
    } catch (err) {
        console.error('Lỗi load events:', err);
        alert('Không kết nối được backend. Mở Console (F12) để xem lỗi chi tiết.');
    }
}

// Render một card sự kiện
function renderEventCard(event, tabId) {
    const wrapper = document.querySelector(`#${tabId} .event-card`);
    if (!wrapper) return;

    const card = document.createElement('div');
    card.className = 'content-card';
    card.dataset.id = event.id;

    const formatDate = (iso) => {
        if (!iso) return 'Chưa xác định';
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${hh}:${mm} ${dd}/${MM}/${yyyy}`;
    };

    const orgName = event.Organization ? event.Organization.name : '-----';

    const channelsHtml = event.channels && event.channels.length > 0
        ? `<div class="displaymxh">
            ${event.channels.includes('web') ? '<div class="mxh"><div class="mxh-web">Web</div></div>' : ''}
            ${event.channels.includes('facebook') ? '<div class="fb"><div class="fb-content">Facebook</div></div>' : ''}
            ${event.channels.includes('zalo') ? '<div class="zalo"><div class="zalo-content">Zalo</div></div>' : ''}
           </div>`
        : '<div class="mxh"><div class="mxh-web">Web</div></div>';

    let buttonsHtml = '';
    if (event.status === 'created') {
        buttonsHtml = `
            <div class="button-container">
                <button class="approve-btn edit-event-btn" data-id="${event.id}">Sửa</button>
                <button class="delete-btn" data-id="${event.id}">Xóa</button>
            </div>`;
    } else if (event.status === 'pending') {
        buttonsHtml = `<div class="button-container"><button class="see-btn" data-id="${event.id}">Xem</button></div>`;
    } else if (event.status === 'approved') {
        buttonsHtml = `<div class="button-container"><button class="delete-btn" data-id="${event.id}">Xóa</button></div>`;
    }

    card.innerHTML = `
        <div class="content-image">
            <img src="${event.image || 'https://via.placeholder.com/400x250/f0f0f0/999?text=No+Image'}" alt="${event.name}">
        </div>
        <div class="content-info">
            <div class="date">
                <p>${event.name}</p>
                <div class="status-badge approved">Còn hạn</div>
            </div>
            <div class="event-info">
                <p>${event.description || 'Chưa có mô tả'}</p>
                <p>⏰ Thời gian: ${formatDate(event.startTime)} - ${formatDate(event.endTime)}</p>
                <p>📅 Hạn đăng ký: ${formatDate(event.registrationDeadline)}</p>
                <p>📍 Địa điểm: ${event.location}</p>
                <p>🏢 Tổ chức: ${orgName}</p>
            </div>
            ${channelsHtml}
            <a class="dki" href="${event.registrationLink}" target="_blank">Link đăng ký →</a>
            ${buttonsHtml}
        </div>
    `;

    wrapper.appendChild(card);
}

// ==================== HÀM BACKEND ====================
async function createEvent() {
    const requiredFields = ['eventName', 'eventStartTime', 'eventEndTime', 'registrationDeadline', 'eventLocation', 'registrationLink'];
    for (const id of requiredFields) {
        if (!document.getElementById(id).value.trim()) {
            alert('Vui lòng điền đầy đủ các trường bắt buộc!');
            return;
        }
    }

    const formData = new FormData();
    formData.append('name', document.getElementById('eventName').value.trim());
    formData.append('description', document.getElementById('eventDescription').value.trim());
    formData.append('startTime', document.getElementById('eventStartTime').value);
    formData.append('endTime', document.getElementById('eventEndTime').value);
    formData.append('registrationDeadline', document.getElementById('registrationDeadline').value);
    formData.append('location', document.getElementById('eventLocation').value.trim());
    formData.append('registrationLink', document.getElementById('registrationLink').value.trim());
    formData.append('organizationId', document.getElementById('eventOrganization').value);

    const channels = Array.from(document.querySelectorAll('input[name="socialChannels"]:checked')).map(cb => cb.value);
    formData.append('channels', JSON.stringify(channels));

    const file = document.getElementById('eventImage').files[0];
    if (file) formData.append('image', file);

    try {
        const res = await fetch(`${API_BASE}/api/events`, { method: 'POST', body: formData });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text || 'Lỗi server');
        }
        alert('Tạo sự kiện thành công!');
        closeCreateModal();
        await loadEvents();
    } catch (err) {
        alert('Lỗi tạo sự kiện: ' + err.message);
    }
}

async function updateEvent(id) {
    const formData = new FormData();
    formData.append('name', document.getElementById('editEventName').value.trim());
    formData.append('description', document.getElementById('editEventDescription').value.trim());
    formData.append('startTime', document.getElementById('editEventStartTime').value);
    formData.append('endTime', document.getElementById('editEventEndTime').value);
    formData.append('registrationDeadline', document.getElementById('editRegistrationDeadline').value);
    formData.append('location', document.getElementById('editEventLocation').value.trim());
    formData.append('registrationLink', document.getElementById('editRegistrationLink').value.trim());
    formData.append('organizationId', document.getElementById('editEventOrganization').value);

    const file = document.getElementById('editEventImage').files[0];
    if (file) formData.append('image', file);

    try {
        const res = await fetch(`${API_BASE}/api/events/${id}`, { method: 'PUT', body: formData });
        if (!res.ok) throw new Error(await res.text());
        alert('Cập nhật thành công!');
        closeEditModal();
        await loadEvents();
    } catch (err) {
        alert('Lỗi cập nhật: ' + err.message);
    }
}

async function deleteEvent(id) {
    if (!confirm('Bạn chắc chắn muốn xóa sự kiện này?')) return;
    try {
        const res = await fetch(`${API_BASE}/api/events/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('Xóa thành công!');
        await loadEvents();
    } catch (err) {
        alert('Lỗi xóa: ' + err.message);
    }
}

async function approveEvent(id) {
    try {
        const res = await fetch(`${API_BASE}/api/events/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'approved' })
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Duyệt thành công!');
        closeViewModal();
        await loadEvents();
    } catch (err) {
        alert('Lỗi duyệt: ' + err.message);
    }
}

async function rejectEvent(id) {
    if (!confirm('Từ chối và xóa sự kiện này?')) return;
    await deleteEvent(id);
    closeViewModal();
}

async function openEditModal(id) {
    try {
        const res = await fetch(`${API_BASE}/api/events`);
        if (!res.ok) throw new Error('Server lỗi');
        const events = await res.json();
        const event = events.find(e => e.id == id);
        if (!event) throw new Error('Không tìm thấy sự kiện');

        document.getElementById('editEventId').value = event.id;
        document.getElementById('editEventName').value = event.name;
        document.getElementById('editEventDescription').value = event.description || '';
        document.getElementById('editEventStartTime').value = event.startTime.slice(0, 16);
        document.getElementById('editEventEndTime').value = event.endTime.slice(0, 16);
        document.getElementById('editRegistrationDeadline').value = event.registrationDeadline.slice(0, 16);
        document.getElementById('editEventLocation').value = event.location;
        document.getElementById('editRegistrationLink').value = event.registrationLink;
        document.getElementById('editEventOrganization').value = event.organizationId || '';

        document.getElementById('editFileName').textContent = event.image ? 'Ảnh hiện tại đã có' : 'Chưa có ảnh nào được chọn';

        document.getElementById('editModalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (err) {
        alert('Không load được dữ liệu để sửa!');
    }
}

async function openViewModal(id) {
    try {
        const res = await fetch(`${API_BASE}/api/events`);
        if (!res.ok) throw new Error('Server lỗi');
        const events = await res.json();
        const event = events.find(e => e.id == id);
        if (!event) throw new Error('Không tìm thấy');

        document.getElementById('viewEventImage').src = event.image || 'https://via.placeholder.com/400x250';
        document.getElementById('viewEventName').textContent = event.name;
        document.getElementById('viewEventDescription').textContent = event.description || 'Chưa có mô tả';
        document.getElementById('viewEventStartTime').textContent = new Date(event.startTime).toLocaleString('vi-VN');
        document.getElementById('viewEventEndTime').textContent = new Date(event.endTime).toLocaleString('vi-VN');
        document.getElementById('viewRegistrationDeadline').textContent = new Date(event.registrationDeadline).toLocaleString('vi-VN');
        document.getElementById('viewEventLocation').textContent = event.location;
        document.getElementById('viewEventOrganization').textContent = event.Organization?.name || '-----';
        document.getElementById('viewRegistrationLink').href = event.registrationLink;
        document.getElementById('viewRegistrationLink').textContent = event.registrationLink;

        const channelsDiv = document.getElementById('viewSocialChannels');
        channelsDiv.innerHTML = '';
        (event.channels || ['web']).forEach(ch => {
            const span = document.createElement('span');
            span.className = 'channel-tag';
            span.textContent = ch.charAt(0).toUpperCase() + ch.slice(1);
            channelsDiv.appendChild(span);
        });

        document.getElementById('approveEventBtn').onclick = () => approveEvent(event.id);
        document.getElementById('rejectEventBtn').onclick = () => rejectEvent(event.id);

        document.getElementById('viewModalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (err) {
        alert('Không load được chi tiết sự kiện!');
    }
}

// Close modal functions
function closeCreateModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('createEventForm').reset();
    document.getElementById('fileName').textContent = 'Chưa có ảnh nào được chọn';
}

function closeEditModal() {
    document.getElementById('editModalOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeViewModal() {
    document.getElementById('viewModalOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ==================== UI & EVENTS ====================
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrganizations();
    await loadEvents();

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.dataset.tab + '-content';
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Modal tạo sự kiện
    document.getElementById('openModalBtn').addEventListener('click', () => {
        document.getElementById('modalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        document.getElementById('step1').classList.add('active');
        document.getElementById('step2').classList.remove('active');
    });

    document.getElementById('closeModalBtn').addEventListener('click', closeCreateModal);
    document.getElementById('cancelBtn').addEventListener('click', closeCreateModal);
    document.getElementById('modalOverlay').addEventListener('click', e => {
        if (e.target === document.getElementById('modalOverlay')) closeCreateModal();
    });

    // Upload ảnh tạo
    document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('eventImage').click());
    document.getElementById('eventImage').addEventListener('change', () => {
        const fileName = document.getElementById('eventImage').files[0]?.name || 'Chưa có ảnh nào được chọn';
        document.getElementById('fileName').textContent = fileName;
    });

    // Chuyển bước
    document.getElementById('nextToSocial').addEventListener('click', () => {
        if (!document.getElementById('eventName').value.trim()) {
            alert('Vui lòng nhập tên sự kiện!');
            return;
        }
        document.getElementById('step1').classList.remove('active');
        document.getElementById('step2').classList.add('active');
    });

    document.getElementById('backToStep1').addEventListener('click', () => {
        document.getElementById('step2').classList.remove('active');
        document.getElementById('step1').classList.add('active');
    });

    document.getElementById('createEvent').addEventListener('click', createEvent);

    // Modal sửa
    document.getElementById('closeEditModalBtn').addEventListener('click', closeEditModal);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
    document.getElementById('editModalOverlay').addEventListener('click', e => {
        if (e.target === document.getElementById('editModalOverlay')) closeEditModal();
    });

    document.getElementById('editUploadBtn').addEventListener('click', () => document.getElementById('editEventImage').click());
    document.getElementById('editEventImage').addEventListener('change', () => {
        const fileName = document.getElementById('editEventImage').files[0]?.name || 'Chưa có ảnh nào được chọn';
        document.getElementById('editFileName').textContent = fileName;
    });

    document.getElementById('editEventForm').addEventListener('submit', e => {
        e.preventDefault();
        updateEvent(document.getElementById('editEventId').value);
    });

    // Modal xem
    document.getElementById('closeViewModalBtn').addEventListener('click', closeViewModal);
    document.getElementById('closeViewBtn').addEventListener('click', closeViewModal);
    document.getElementById('viewModalOverlay').addEventListener('click', e => {
        if (e.target === document.getElementById('viewModalOverlay')) closeViewModal();
    });

    // Delegate các nút động
    document.body.addEventListener('click', e => {
        const editBtn = e.target.closest('.edit-event-btn');
        if (editBtn) openEditModal(editBtn.dataset.id);

        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) deleteEvent(deleteBtn.dataset.id);

        const seeBtn = e.target.closest('.see-btn');
        if (seeBtn) openViewModal(seeBtn.dataset.id);
    });

    // Cập nhật badge và status
    updateTabBadges();
    updateEventStatusBadges();
    setInterval(updateEventStatusBadges, 60000);
});

// Cập nhật số lượng trên tab
function updateTabBadges() {
    const counts = {
        created: document.querySelectorAll('#created-content .content-card').length,
        waitapproved: document.querySelectorAll('#waitapproved-content .content-card').length,
        approved: document.querySelectorAll('#approved-content .content-card').length
    };

    ['created', 'waitapproved', 'approved'].forEach(tab => {
        const badge = document.querySelector(`.tab-btn[data-tab="${tab}"] .badge`);
        if (badge) badge.textContent = `(${counts[tab]})`;
    });
}

// Cập nhật Còn hạn / Hết hạn
function updateEventStatusBadges() {
    const now = new Date();
    document.querySelectorAll('.content-card').forEach(card => {
        const deadlineP = Array.from(card.querySelectorAll('.event-info p')).find(p => p.textContent.includes('📅 Hạn đăng ký:'));
        if (!deadlineP) return;
        const match = deadlineP.textContent.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (!match) return;
        const [_, dd, mm, yyyy] = match;
        const deadline = new Date(`${yyyy}-${mm}-${dd}T23:59:59`);
        const badge = card.querySelector('.status-badge');
        if (deadline >= now) {
            badge.textContent = 'Còn hạn';
            badge.className = 'status-badge approved';
        } else {
            badge.textContent = 'Hết hạn';
            badge.className = 'status-badge disapproved';
        }
    });
}

// Kiểm tra tab trống (tùy chọn thêm thông báo)
function checkEmptyTab() {
    // Bạn có thể thêm thông báo "Không có sự kiện" nếu muốn
}
