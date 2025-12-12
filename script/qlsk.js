// ==================== KẾT NỐI BACKEND ====================
const API_BASE = 'https://test4-7cop.onrender.com'; // Backend của bạn
let organizations = [];

// Load tổ chức từ backend để điền dropdown
async function loadOrganizations() {
    try {
        const res = await fetch(`${API_BASE}/api/organizations`);
        if (!res.ok) throw new Error('Không thể kết nối server');
        organizations = await res.json();

        const selects = [
            document.getElementById('eventOrganization'),
            document.getElementById('editEventOrganization')
        ];
        selects.forEach(select => {
            if (!select) return;
            select.innerHTML = '<option value="">-----</option>';
            organizations.forEach(org => {
                const opt = document.createElement('option');
                opt.value = org.id;
                opt.textContent = org.name;
                select.appendChild(opt);
            });
        });
    } catch (err) {
        console.error(err);
        alert('Không load được danh sách tổ chức!');
    }
}

// Load tất cả events từ backend và render vào 3 tab
async function loadEvents() {
    try {
        const res = await fetch(`${API_BASE}/api/events`);
        if (!res.ok) throw new Error('Server lỗi');
        const events = await res.json();

        // Xóa hết card cũ
        document.querySelectorAll('.event-card').forEach(wrapper => wrapper.innerHTML = '');

        events.forEach(event => {
            let tabId;
            if (event.status === 'created') tabId = 'created-content';
            else if (event.status === 'pending') tabId = 'waitapproved-content';
            else if (event.status === 'approved') tabId = 'approved-content';
            else return;

            renderEventCard(event, tabId);
        });

        updateTabBadges();
        updateEventStatusBadges();
        checkEmptyTab();
    } catch (err) {
        console.error(err);
        alert('Không load được sự kiện!');
    }
}

// Render 1 card sự kiện từ data backend
function renderEventCard(event, tabId) {
    const wrapper = document.querySelector(`#${tabId} .event-card`);
    if (!wrapper) return;

    const card = document.createElement('div');
    card.className = 'content-card';
    card.dataset.id = event.id;

    const formatDate = (iso) => {
        if (!iso) return 'Chưa xác định';
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2,'0');
        const mm = String(d.getMinutes()).padStart(2,'0');
        const dd = String(d.getDate()).padStart(2,'0');
        const MM = String(d.getMonth()+1).padStart(2,'0');
        const yyyy = d.getFullYear();
        return `${hh}:${mm} ${dd}/${MM}/${yyyy}`;
    };

    const orgName = event.Organization?.name || '-----';

    const channelsHtml = event.channels?.length > 0
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
            <div class="date"><p>${event.name}</p><div class="status-badge approved">Còn hạn</div></div>
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

// Tạo sự kiện mới
async function createEvent() {
    const formData = new FormData();
    formData.append('name', document.getElementById('eventName').value.trim());
    formData.append('description', document.getElementById('eventDescription').value.trim());
    formData.append('startTime', document.getElementById('eventStartTime').value);
    formData.append('endTime', document.getElementById('eventEndTime').value);
    formData.append('registrationDeadline', document.getElementById('registrationDeadline').value);
    formData.append('location', document.getElementById('eventLocation').value.trim());
    formData.append('registrationLink', document.getElementById('registrationLink').value.trim());
    formData.append('organizationId', document.getElementById('eventOrganization').value);

    const channels = Array.from(document.querySelectorAll('#step2 input[name="socialChannels"]:checked'))
        .map(cb => cb.value);
    formData.append('channels', JSON.stringify(channels));

    const file = document.getElementById('eventImage').files[0];
    if (file) formData.append('image', file);

    try {
        const res = await fetch(`${API_BASE}/api/events`, { method: 'POST', body: formData });
        if (!res.ok) throw new Error(await res.text());
        alert('Tạo sự kiện thành công!');
        closeModal(); // hàm close modal cũ của bạn
        document.getElementById('createEventForm').reset();
        document.getElementById('fileName').textContent = 'Chưa có ảnh nào được chọn';
        await loadEvents();
    } catch (err) {
        alert('Lỗi tạo sự kiện: ' + err.message);
    }
}

// Sửa sự kiện
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
        document.getElementById('editModalOverlay').classList.remove('active');
        await loadEvents();
    } catch (err) {
        alert('Lỗi cập nhật: ' + err.message);
    }
}

// Xóa sự kiện
async function deleteEvent(id) {
    if (!confirm('Xóa sự kiện này?')) return;
    try {
        const res = await fetch(`${API_BASE}/api/events/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error(await res.text());
        alert('Xóa thành công!');
        await loadEvents();
    } catch (err) {
        alert('Lỗi xóa: ' + err.message);
    }
}

// Duyệt / Từ chối (pending → approved hoặc xóa)
async function approveEvent(id) {
    try {
        const res = await fetch(`${API_BASE}/api/events/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'approved' })
        });
        if (!res.ok) throw new Error(await res.text());
        alert('Duyệt thành công!');
        document.getElementById('viewModalOverlay').classList.remove('active');
        await loadEvents();
    } catch (err) {
        alert('Lỗi duyệt: ' + err.message);
    }
}

async function rejectEvent(id) {
    if (!confirm('Từ chối và xóa sự kiện này?')) return;
    await deleteEvent(id);
    document.getElementById('viewModalOverlay').classList.remove('active');
}

// Mở modal sửa → load data thật
async function openEditModal(id) {
    try {
        const res = await fetch(`${API_BASE}/api/events`);
        const events = await res.json();
        const event = events.find(e => e.id == id);
        if (!event) throw new Error('Không tìm thấy');

        document.getElementById('editEventId').value = event.id;
        document.getElementById('editEventName').value = event.name;
        document.getElementById('editEventDescription').value = event.description || '';
        document.getElementById('editEventStartTime').value = event.startTime.slice(0,16);
        document.getElementById('editEventEndTime').value = event.endTime.slice(0,16);
        document.getElementById('editRegistrationDeadline').value = event.registrationDeadline.slice(0,16);
        document.getElementById('editEventLocation').value = event.location;
        document.getElementById('editRegistrationLink').value = event.registrationLink;
        document.getElementById('editEventOrganization').value = event.organizationId;

        document.getElementById('editModalOverlay').classList.add('active');
    } catch (err) {
        alert('Lỗi load dữ liệu sửa: ' + err.message);
    }
}

// Mở modal xem chi tiết (cho pending)
async function openViewModal(id) {
    try {
        const res = await fetch(`${API_BASE}/api/events`);
        const events = await res.json();
        const event = events.find(e => e.id == id);
        if (!event) throw new Error('Không tìm thấy');

        document.getElementById('viewEventImage').src = event.image || '';
        document.getElementById('viewEventName').textContent = event.name;
        document.getElementById('viewEventDescription').textContent = event.description || 'Chưa có mô tả';
        document.getElementById('viewEventStartTime').textContent = new Date(event.startTime).toLocaleString('vi-VN');
        document.getElementById('viewEventEndTime').textContent = new Date(event.endTime).toLocaleString('vi-VN');
        document.getElementById('viewRegistrationDeadline').textContent = new Date(event.registrationDeadline).toLocaleString('vi-VN');
        document.getElementById('viewEventLocation').textContent = event.location;
        document.getElementById('viewEventOrganization').textContent = event.Organization?.name || '-----';
        document.getElementById('viewRegistrationLink').href = event.registrationLink;
        document.getElementById('viewRegistrationLink').textContent = event.registrationLink;

        // Kênh
        const channelsDiv = document.getElementById('viewSocialChannels');
        channelsDiv.innerHTML = '';
        (event.channels || []).forEach(ch => {
            const span = document.createElement('span');
            span.className = 'channel-tag';
            span.textContent = ch.charAt(0).toUpperCase() + ch.slice(1);
            channelsDiv.appendChild(span);
        });

        // Gắn ID cho nút duyệt/từ chối
        document.getElementById('approveEventBtn').onclick = () => approveEvent(event.id);
        document.getElementById('rejectEventBtn').onclick = () => rejectEvent(event.id);

        document.getElementById('viewModalOverlay').classList.add('active');
    } catch (err) {
        alert('Lỗi load chi tiết: ' + err.message);
    }
}

// ==================== KHỞI ĐỘNG ====================
document.addEventListener('DOMContentLoaded', async () => {
    await loadOrganizations();
    await loadEvents();

    // Nút tạo sự kiện
    document.getElementById('createEvent').addEventListener('click', createEvent);

    // Nút sửa (delegate)
    document.body.addEventListener('click', e => {
        if (e.target.matches('.edit-event-btn') || e.target.closest('.edit-event-btn')) {
            const btn = e.target.matches('.edit-event-btn') ? e.target : e.target.closest('.edit-event-btn');
            openEditModal(btn.dataset.id);
        }
    });

    // Nút xóa (delegate)
    document.body.addEventListener('click', e => {
        if (e.target.matches('.delete-btn') || e.target.closest('.delete-btn')) {
            const btn = e.target.matches('.delete-btn') ? e.target : e.target.closest('.delete-btn');
            deleteEvent(btn.dataset.id);
        }
    });

    // Nút xem (pending)
    document.body.addEventListener('click', e => {
        if (e.target.matches('.see-btn') || e.target.closest('.see-btn')) {
            const btn = e.target.matches('.see-btn') ? e.target : e.target.closest('.see-btn');
            openViewModal(btn.dataset.id);
        }
    });

    // Submit form sửa
    document.getElementById('editEventForm').addEventListener('submit', e => {
        e.preventDefault();
        const id = document.getElementById('editEventId').value;
        updateEvent(id);
    });

    // Giữ lại các hàm cũ của bạn: tab, search, badge, status "Còn hạn/Hết hạn", v.v.
    // (copy paste phần code cũ từ updateTabBadges(), updateEventStatusBadges(), searchEvents(), ... vào đây nếu cần)
    updateTabBadges();
    updateEventStatusBadges();
});
