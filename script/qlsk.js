// ==================== KẾT NỐI BACKEND ====================
const API_BASE = 'https://test4-7cop.onrender.com';
let organizations = [];
let allEvents = []; // Cache toàn bộ events để mở modal sửa/xem nhanh

// Load tổ chức thật từ backend
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
    }
}

// Load events + cache
async function loadEvents() {
    try {
        const res = await fetch(`${API_BASE}/api/events`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allEvents = await res.json();
        // Xóa card cũ
        document.querySelectorAll('.event-card').forEach(wrapper => wrapper.innerHTML = '');
        allEvents.forEach(event => {
            let tabId = '';
            if (event.status === 'created') tabId = 'created-content';
            else if (event.status === 'pending') tabId = 'waitapproved-content';
            else if (event.status === 'approved') tabId = 'approved-content';
            if (tabId) renderEventCard(event, tabId);
        });
        updateTabBadges();
        updateEventStatusBadges();
    } catch (err) {
        console.error('Lỗi load events:', err);
    }
}

// Render card sự kiện
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

    const orgName = event.organizationName || event.Organization?.name || '-----';

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

// ==================== HÀM THAO TÁC BACKEND ====================
async function createEvent() {
    const required = ['eventName', 'eventStartTime', 'eventEndTime', 'registrationDeadline', 'eventLocation', 'registrationLink'];
    let valid = true;
    required.forEach(id => {
        if (!document.getElementById(id).value.trim()) valid = false;
    });
    if (!valid) {
        alert('Vui lòng điền đầy đủ các trường bắt buộc!');
        return;
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

    const fileInput = document.getElementById('eventImage');
    if (fileInput.files[0]) formData.append('image', fileInput.files[0]);

    try {
        const res = await fetch(`${API_BASE}/api/events`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(await res.text());
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

    const fileInput = document.getElementById('editEventImage');
    if (fileInput.files[0]) formData.append('image', fileInput.files[0]);

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

// Modal functions
function openEditModal(id) {
    const event = allEvents.find(e => e.id == id);
    if (!event) {
        alert('Không tìm thấy sự kiện để sửa! Thử refresh trang.');
        return;
    }
    document.getElementById('editEventId').value = event.id;
    document.getElementById('editEventName').value = event.name || '';
    document.getElementById('editEventDescription').value = event.description || '';
    document.getElementById('editEventStartTime').value = event.startTime ? event.startTime.slice(0,16) : '';
    document.getElementById('editEventEndTime').value = event.endTime ? event.endTime.slice(0,16) : '';
    document.getElementById('editRegistrationDeadline').value = event.registrationDeadline ? event.registrationDeadline.slice(0,16) : '';
    document.getElementById('editEventLocation').value = event.location || '';
    document.getElementById('editRegistrationLink').value = event.registrationLink || '';
    document.getElementById('editEventOrganization').value = event.organizationId || '';
    document.getElementById('editFileName').textContent = event.image ? 'Ảnh hiện tại đã có' : 'Chưa có ảnh nào được chọn';
    document.getElementById('editModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openViewModal(id) {
    const event = allEvents.find(e => e.id == id);
    if (!event) {
        alert('Không tìm thấy sự kiện để xem! Thử refresh trang.');
        return;
    }
    document.getElementById('viewEventImage').src = event.image || 'https://via.placeholder.com/400x250';
    document.getElementById('viewEventName').textContent = event.name || 'Chưa có tên';
    document.getElementById('viewEventDescription').textContent = event.description || 'Chưa có mô tả';
    document.getElementById('viewEventStartTime').textContent = event.startTime ? new Date(event.startTime).toLocaleString('vi-VN') : 'Chưa xác định';
    document.getElementById('viewEventEndTime').textContent = event.endTime ? new Date(event.endTime).toLocaleString('vi-VN') : 'Chưa xác định';
    document.getElementById('viewRegistrationDeadline').textContent = event.registrationDeadline ? new Date(event.registrationDeadline).toLocaleString('vi-VN') : 'Chưa xác định';
    document.getElementById('viewEventLocation').textContent = event.location || 'Chưa xác định';
    document.getElementById('viewEventOrganization').textContent = event.Organization?.name || '-----';
    document.getElementById('viewRegistrationLink').href = event.registrationLink || '#';
    document.getElementById('viewRegistrationLink').textContent = event.registrationLink || 'Chưa có link';

    const channelsContainer = document.getElementById('viewSocialChannels');
    channelsContainer.innerHTML = '';
    (event.channels || ['web']).forEach(ch => {
        const tag = document.createElement('span');
        tag.className = 'channel-tag';
        tag.textContent = ch.charAt(0).toUpperCase() + ch.slice(1);
        channelsContainer.appendChild(tag);
    });

    document.getElementById('approveEventBtn').onclick = () => approveEvent(event.id);
    document.getElementById('rejectEventBtn').onclick = () => rejectEvent(event.id);
    document.getElementById('viewModalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

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

// Badge updates
function updateTabBadges() {
    ['created', 'waitapproved', 'approved'].forEach(tab => {
        const count = document.querySelectorAll(`#${tab}-content .content-card`).length;
        const badge = document.querySelector(`.tab-btn[data-tab="${tab}"] .badge`);
        if (badge) badge.textContent = `(${count})`;
    });
}

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

// ==================== TÌM KIẾM SỰ KIỆN (HOÀN CHỈNH) ====================
function searchEvents(searchTerm) {
    const containers = document.querySelectorAll('#created-content > .event-card, #waitapproved-content > .event-card, #approved-content > .event-card');
    let foundAny = false;
    searchTerm = searchTerm.toLowerCase().trim();

    // Xóa thông báo cũ
    document.querySelectorAll('.no-results-message').forEach(el => el.remove());

    containers.forEach(container => {
        const cards = Array.from(container.querySelectorAll('.content-card'));
        
        // Reset tất cả card
        cards.forEach(card => {
            card.classList.remove('hidden-search');
            card.style.order = '';
        });

        if (searchTerm === '') {
            cards.forEach((card, index) => card.style.order = index);
            return;
        }

        const matched = [];
        const unmatched = [];
        cards.forEach(card => {
            const name = (card.querySelector('.date p')?.textContent || '').toLowerCase();
            const org = (card.querySelector('.event-info p:nth-child(5)')?.textContent || '')
                        .toLowerCase()
                        .replace(/🏢\s*tổ chức:\s*/g, '')
                        .trim();
            if (name.includes(searchTerm) || org.includes(searchTerm)) {
                matched.push(card);
                foundAny = true;
            } else {
                unmatched.push(card);
            }
        });

        // Sắp xếp: matched lên đầu
        matched.forEach((card, i) => card.style.order = i);
        unmatched.forEach((card, i) => card.style.order = matched.length + i);

        // Ẩn mượt các card không khớp
        unmatched.forEach(card => card.classList.add('hidden-search'));
    });

    // Thông báo không tìm thấy
    if (searchTerm && !foundAny) {
        const activeTab = document.querySelector('.tab-content.active');
        if (!activeTab) return;

        const overlay = document.createElement('div');
        overlay.className = 'no-results-message';
        overlay.style.cssText = `
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10;
            pointer-events: none;
            text-align: center;
            color: #555;
        `;
        overlay.innerHTML = `
            <div style="font-size: 28px; font-weight: 600; margin-bottom: 10px;">
                Không tìm thấy sự kiện nào
            </div>
            <div style="font-size: 18px;">
                có chứa từ khóa: <strong>"${searchTerm}"</strong>
            </div>
            <div style="margin-top: 18px; font-size: 15px; color: #888;">
                Thử tìm từ khóa khác xem sao nhé
            </div>
        `;
        if (getComputedStyle(activeTab).position === 'static') {
            activeTab.style.position = 'relative';
        }
        activeTab.appendChild(overlay);
    }
}

// ==================== DOM LOADED ====================
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrganizations();
    await loadEvents();

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab + '-content').classList.add('active');
            // Khi chuyển tab → chạy lại tìm kiếm để giữ kết quả
            const currentTerm = document.getElementById('searchInput')?.value.trim() || '';
            searchEvents(currentTerm);
        });
    });

    // ==================== TÌM KIẾM ====================
    const searchInput = document.getElementById('searchInput'); // Đảm bảo HTML có <input id="searchInput">
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const term = e.target.value.trim();
            searchTimeout = setTimeout(() => {
                searchEvents(term);
            }, 300); // Debounce 300ms
        });

        // Xóa tìm kiếm khi nhấn ESC
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchInput.value = '';
                searchEvents('');
            }
        });
    }

    // Các event modal khác (giữ nguyên)
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

    document.getElementById('uploadBtn').addEventListener('click', () => document.getElementById('eventImage').click());
    document.getElementById('eventImage').addEventListener('change', () => {
        document.getElementById('fileName').textContent = document.getElementById('eventImage').files[0]?.name || 'Chưa có ảnh nào được chọn';
    });

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

    // Edit modal
    document.getElementById('closeEditModalBtn').addEventListener('click', closeEditModal);
    document.getElementById('cancelEditBtn').addEventListener('click', closeEditModal);
    document.getElementById('editModalOverlay').addEventListener('click', e => {
        if (e.target === document.getElementById('editModalOverlay')) closeEditModal();
    });
    document.getElementById('editUploadBtn').addEventListener('click', () => document.getElementById('editEventImage').click());
    document.getElementById('editEventImage').addEventListener('change', () => {
        document.getElementById('editFileName').textContent = document.getElementById('editEventImage').files[0]?.name || 'Chưa có ảnh nào được chọn';
    });
    document.getElementById('editEventForm').addEventListener('submit', e => {
        e.preventDefault();
        updateEvent(document.getElementById('editEventId').value);
    });

    // View modal
    document.getElementById('closeViewModalBtn').addEventListener('click', closeViewModal);
    document.getElementById('closeViewBtn').addEventListener('click', closeViewModal);
    document.getElementById('viewModalOverlay').addEventListener('click', e => {
        if (e.target === document.getElementById('viewModalOverlay')) closeViewModal();
    });

    // Delegate buttons
    document.body.addEventListener('click', e => {
        const editBtn = e.target.closest('.edit-event-btn');
        if (editBtn) openEditModal(editBtn.dataset.id);
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn) deleteEvent(deleteBtn.dataset.id);
        const seeBtn = e.target.closest('.see-btn');
        if (seeBtn) openViewModal(seeBtn.dataset.id);
    });

    updateTabBadges();
    updateEventStatusBadges();
    setInterval(updateEventStatusBadges, 60000);
});
