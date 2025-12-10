// ==================== KẾT NỐI BACKEND ====================
const API_BASE = 'https://test4-7cop.onrender.com'; // Backend Render của bạn
let organizations = []; // Lưu danh sách tổ chức từ server

// Load tổ chức thật từ backend để điền vào dropdown
async function loadOrganizations() {
    try {
        const res = await fetch(`${API_BASE}/api/organizations`);
        if (!res.ok) throw new Error('Server lỗi');
        organizations = await res.json();

        // Điền vào cả 2 dropdown: tạo và sửa sự kiện
        const selects = [
            document.getElementById('eventOrganization'),
            document.getElementById('editEventOrganization')
        ];

        selects.forEach(select => {
            if (!select) return;
            // Xóa hết option cũ (trừ dòng đầu)
            select.innerHTML = '<option value="-----">-----</option>';
            organizations.forEach(org => {
                const option = document.createElement('option');
                option.value = org.id;
                option.textContent = org.name;
                select.appendChild(option);
            });
        });
    } catch (err) {
        console.error('Không load được danh sách tổ chức:', err);
        alert('Không kết nối được server để lấy danh sách tổ chức!');
    }
}

// ==================== CODE CŨ CỦA BẠN GIỮ NGUYÊN 100% TỪ ĐÂY TRỞ XUỐNG ====================
document.addEventListener('DOMContentLoaded', function() {

    // GỌI HÀM LOAD TỔ CHỨC THẬT NGAY KHI MỞ TRANG
    loadOrganizations();

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
           
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
           
            // Add active class to current tab and content
            btn.classList.add('active');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    // Tạo sự kiện
    const openModalBtn = document.getElementById('openModalBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const createForm = document.getElementById('createEventForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('eventImage');
    const fileName = document.getElementById('fileName');
    // bước tiếp theo
    const nextToSocial = document.getElementById('nextToSocial');
    const backToStep1 = document.getElementById('backToStep1');
    const createEventBtn = document.getElementById('createEvent');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    // Sửa sự kiện
    const closeEditModalBtn = document.getElementById('closeEditModalBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const editModalOverlay = document.getElementById('editModalOverlay');
    const editEventForm = document.getElementById('editEventForm');
    const editButtons = document.querySelectorAll('.edit-event-btn');
    const editUploadBtn = document.getElementById('editUploadBtn');
    const editFileInput = document.getElementById('editEventImage');
    const editFileName = document.getElementById('editFileName');
    // Mở modal tạo sự kiện
    openModalBtn.addEventListener('click', function() {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Reset về step 1 khi mở modal
        if (step1 && step2) {
            step1.classList.add('active');
            step2.classList.remove('active');
        }
    });
    // Đóng modal tạo sự kiện
    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    // Đóng khi click ra ngoài modal tạo
modalOverlay.addEventListener('click', function(event) {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });
    // Xử lý upload file cho modal tạo
    uploadBtn.addEventListener('click', function() {
        fileInput.click();
    });
    fileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            fileName.textContent = this.files[0].name;
        } else {
            fileName.textContent = 'Chưa có ảnh nào được chọn';
        }
    });
    // Step navigation - Chuyển đến bước 2
    if (nextToSocial) {
        nextToSocial.addEventListener('click', function() {
            // Kiểm tra form trước khi chuyển
            const eventName = document.getElementById('eventName').value;
            if (!eventName) {
                alert('Vui lòng nhập tên sự kiện');
                return;
            }
           
            step1.classList.remove('active');
            step2.classList.add('active');
        });
    }
    // Step navigation - Quay lại bước 1
    if (backToStep1) {
        backToStep1.addEventListener('click', function() {
            step2.classList.remove('active');
            step1.classList.add('active');
        });
    }
        // TẠO SỰ KIỆN MỚI
    if (createEventBtn) {
        createEventBtn.addEventListener('click', function() {
            // Kiểm tra bắt buộc
            const required = ['eventName','eventStartTime','eventEndTime','registrationDeadline','eventLocation','registrationLink'];
            let valid = true;
            required.forEach(id => {
                if (!document.getElementById(id).value.trim()) {
                    valid = false;
                }
            });
            if (!valid) {
                alert('Vui lòng điền đầy đủ các trường bắt buộc!');
                return;
            }
            const data = {
                name: document.getElementById('eventName').value.trim(),
                description: document.getElementById('eventDescription').value.trim() || 'Chưa có mô tả',
                startTime: document.getElementById('eventStartTime').value,
                endTime: document.getElementById('eventEndTime').value,
                deadline: document.getElementById('registrationDeadline').value,
                organization: document.getElementById('eventOrganization').value || '-----',
                location: document.getElementById('eventLocation').value.trim(),
                link: document.getElementById('registrationLink').value.trim(),
                image: fileInput.files[0] || null,
                channels: []
            };
            document.querySelectorAll('input[name="socialChannels"]:checked').forEach(cb => {
                data.channels.push(cb.value);
            });
const newId = 'created-' + Date.now();
            addEventCardToTab(data, newId); // ← Hàm này phải tồn tại!
            alert('Tạo sự kiện thành công!');
            closeModal();
            createForm.reset();
            fileName.textContent = 'Chưa có ảnh nào được chọn';
        });
    }
    // Xử lý submit form tạo sự kiện (cho trường hợp không có step navigation)
    if (createForm && !nextToSocial) {
        createForm.addEventListener('submit', function(e) {
            e.preventDefault();
           
            // Lấy dữ liệu từ form
            const formData = {
                name: document.getElementById('eventName').value,
                description: document.getElementById('eventDescription').value,
                startTime: document.getElementById('eventStartTime').value,
                endTime: document.getElementById('eventEndTime').value,
                deadline: document.getElementById('registrationDeadline').value,
                organization: document.getElementById('eventOrganization').value,
                location: document.getElementById('eventLocation').value,
                link: document.getElementById('registrationLink').value,
                image: fileInput.files[0] ? fileInput.files[0].name : null
            };
           
            // Xử lý dữ liệu
            console.log('Dữ liệu sự kiện:', formData);
           
            // Hiển thị thông báo
            alert('Tạo sự kiện thành công!');
           
            // Đóng modal
            closeModal();
           
            // Reset form
            createForm.reset();
            fileName.textContent = 'Chưa có ảnh nào được chọn';
        });
    }
    // Mở modal chỉnh sửa sự kiện - LẤY DỮ LIỆU THẬT TỪ HTML
  // ==================== FIX: SỬA ĐƯỢC SỰ KIỆN MỚI TẠO ====================
// Thay toàn bộ phần cũ xử lý editButtons bằng đoạn này:
document.addEventListener('click', function(e) {
    if (e.target.matches('.edit-event-btn') || e.target.closest('.edit-event-btn')) {
        const button = e.target.matches('.edit-event-btn') ? e.target : e.target.closest('.edit-event-btn');
        const eventCard = button.closest('.content-card');
        const eventId = button.getAttribute('data-event-id');
        // Gán ID tạm để tìm lại card khi lưu
        document.getElementById('editEventId').value = eventId;
        // Lấy dữ liệu từ card (giống như trước, nhưng tối ưu hơn)
        const eventName = eventCard.querySelector('.date p').textContent.trim();
        const eventDescription = eventCard.querySelector('.event-info p:first-child').textContent.trim();
        // Thời gian bắt đầu & kết thúc
        const timeText = eventCard.querySelector('.event-info p:nth-child(2)')?.textContent || '';
        const timeMatch = timeText.match(/Thời gian:\s*(.+)\s*-\s*(.+)/) || timeText.match(/⏰ Thời gian:\s*(.+)/);
        const startTimeRaw = timeMatch ? timeMatch[1].trim() : '';
        const endTimeRaw = timeMatch && timeMatch[2] ? timeMatch[2].trim() : startTimeRaw;
        // Hạn đăng ký
        const deadlineText = eventCard.querySelector('.event-info p:nth-child(3)')?.textContent || '';
        const deadlineRaw = deadlineText.replace('📅 Hạn đăng ký:', '').trim();
        // Địa điểm & tổ chức
        const location = eventCard.querySelector('.event-info p:nth-child(4)')?.textContent.replace('📍 Địa điểm:', '').trim() || '';
        const organization = eventCard.querySelector('.event-info p:nth-child(5)')?.textContent.replace('🏢 Tổ chức:', '').trim() || '';
        // Link đăng ký
        const linkEl = eventCard.querySelector('.dki');
        const link = linkEl ? linkEl.href : '';
        // Ảnh hiện tại
        const imgEl = eventCard.querySelector('.content-image img');
        const currentImage = imgEl ? imgEl.src : '';
        // Điền vào form sửa
        document.getElementById('editEventName').value = eventName;
        document.getElementById('editEventDescription').value = eventDescription;
        document.getElementById('editEventStartTime').value = convertToDateTimeLocal(startTimeRaw);
        document.getElementById('editEventEndTime').value = convertToDateTimeLocal(endTimeRaw);
        document.getElementById('editRegistrationDeadline').value = convertToDateTimeLocal(deadlineRaw);
        document.getElementById('editEventLocation').value = location;
        // FIX: Giữ lại tổ chức cũ khi sửa
const currentOrgObj = organizations.find(org => org.name === organization);
document.getElementById('editEventOrganization').value = currentOrgObj ? currentOrgObj.id : '-----';
        document.getElementById('editRegistrationLink').value = link;
        // Hiển thị ảnh hiện tại
        if (currentImage && !currentImage.includes('placeholder')) {
            document.getElementById('editFileName').textContent = 'Ảnh hiện tại: ' + currentImage.split('/').pop();
        } else {
            document.getElementById('editFileName').textContent = 'Chưa có ảnh nào được chọn';
        }
        // Mở modal
        editModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
});
    // Đóng modal chỉnh sửa
    function closeEditModal() {
        editModalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
        editEventForm.reset();
        editFileName.textContent = 'Chưa có ảnh nào được chọn';
    }
    closeEditModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    // Đóng modal chỉnh sửa khi click bên ngoài
    editModalOverlay.addEventListener('click', function(event) {
        if (event.target === editModalOverlay) {
            closeEditModal();
        }
    });
    // Xử lý upload file cho modal chỉnh sửa
    editUploadBtn.addEventListener('click', function() {
        editFileInput.click();
    });
    editFileInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            editFileName.textContent = this.files[0].name;
        } else {
            editFileName.textContent = 'Chưa có ảnh nào được chọn';
        }
    });
    // Xử lý submit form chỉnh sửa
// XỬ LÝ SUBMIT FORM CHỈNH SỬA – FIX HIỆN TÊN TỔ CHỨC THẬT
editEventForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const eventId = document.getElementById('editEventId').value;
    let eventCard = null;
    
    // Tìm card chính xác
    document.querySelectorAll(`.edit-event-btn[data-event-id="${eventId}"]`).forEach(btn => {
        const card = btn.closest('.content-card');
        if (card && !eventCard) eventCard = card;
    });
    
    if (!eventCard) {
        alert('Đã lưu thành công nhưng không tìm thấy card để cập nhật giao diện!');
        closeEditModal();
        return;
    }

    // Lấy dữ liệu mới từ form
    const newName = document.getElementById('editEventName').value;
    const newDesc = document.getElementById('editEventDescription').value;
    const newStart = document.getElementById('editEventStartTime').value;
    const newEnd = document.getElementById('editEventEndTime').value;
    const newDeadline = document.getElementById('editRegistrationDeadline').value;
    const newLocation = document.getElementById('editEventLocation').value;
    const newLink = document.getElementById('editRegistrationLink').value;
    const newOrgId = document.getElementById('editEventOrganization').value;

    // FIX: LẤY TÊN TỔ CHỨC TỪ DANH SÁCH ĐÃ LOAD
    const newOrgName = newOrgId && !isNaN(newOrgId) 
        ? (organizations.find(o => o.id == newOrgId)?.name || '-----')
        : newOrgId || '-----';

    // Cập nhật giao diện
    eventCard.querySelector('.date p').textContent = newName;
    eventCard.querySelector('.event-info p:first-child').textContent = newDesc;

    const format = (iso) => {
        if (!iso) return 'Chưa xác định';
        const d = new Date(iso);
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const DD = String(d.getDate()).padStart(2, '0');
        const MM = String(d.getMonth() + 1).padStart(2, '0');
        const YYYY = d.getFullYear();
        return `${hh}:${mm} ${DD}/${MM}/${YYYY}`;
    };

    const timeP = eventCard.querySelector('.event-info p:nth-child(2)');
    if (timeP) timeP.textContent = `⏰ Thời gian: ${format(newStart)} - ${format(newEnd)}`;

    const deadlineP = eventCard.querySelector('.event-info p:nth-child(3)');
    if (deadlineP) deadlineP.textContent = `📅 Hạn đăng ký: ${format(newDeadline)}`;

    const ps = eventCard.querySelectorAll('.event-info p');
    if (ps[3]) ps[3].textContent = `📍 Địa điểm: ${newLocation}`;
    if (ps[4]) ps[4].textContent = `🏢 Tổ chức: ${newOrgName}`;

    const linkEl = eventCard.querySelector('.dki');
    if (linkEl) linkEl.href = newLink;

    // Cập nhật ảnh nếu có chọn mới
    if (editFileInput.files[0]) {
        const img = eventCard.querySelector('.content-image img');
        if (img) img.src = URL.createObjectURL(editFileInput.files[0]);
    }

    // Cập nhật badge Còn hạn/Hết hạn
    updateEventStatusBadges();

    alert('Cập nhật sự kiện thành công!');
    closeEditModal();
});
    // Đóng bằng phím ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (modalOverlay.classList.contains('active')) {
                closeModal();
            }
            if (editModalOverlay.classList.contains('active')) {
                closeEditModal();
            }
        }
    });
    // Hàm chuyển đổi định dạng thời gian từ text sang datetime-local
    function convertToDateTimeLocal(timeString) {
        if (!timeString) return '';
       
        console.log('Converting time:', timeString); // Debug
       
        // Loại bỏ khoảng trắng thừa
        timeString = timeString.trim();
       
        // 1. Định dạng: "17h00 ngày 25/11/2025"
        let match = timeString.match(/(\d{1,2})h(\d{2})\s+ngày\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
            const [_, hour, minute, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}`;
        }
       
        // 2. Định dạng: "18h00 – ngày 08/11/2025"
        match = timeString.match(/(\d{1,2})h(\d{2})\s*–\s*ngày\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
            const [_, hour, minute, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}`;
        }
       
        // 3. Định dạng: "7:30 22/11/2026 - 15:00 22/11/2026" (chỉ lấy phần đầu)
        match = timeString.match(/(\d{1,2}):(\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
            const [_, hour, minute, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}`;
        }
       
        // 4. Định dạng: "17h30 Ngày 15/11/2025"
        match = timeString.match(/(\d{1,2})h(\d{2})\s+Ngày\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
            const [_, hour, minute, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}`;
        }
       
// 5. Định dạng: "17h30, ngày 25/10/2025"
        match = timeString.match(/(\d{1,2})h(\d{2}),\s+ngày\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match) {
            const [_, hour, minute, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute}`;
        }
       
        // 6. Định dạng hạn đăng ký: "22/11/2025 đến hết ngày 24/11/2025" (lấy phần đầu)
        match = timeString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (match && timeString.includes('đến hết')) {
            const [_, day, month, year] = match;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59`;
        }
       
        // 7. Định dạng hạn đăng ký: "25/10 đến 23h59' ngày 1/11" (cần năm - giả sử năm hiện tại)
        match = timeString.match(/(\d{1,2})\/(\d{1,2})\s+đến\s+23h59'/);
        if (match) {
            const currentYear = new Date().getFullYear();
            const [_, day, month] = match;
            return `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59`;
        }
       
        // 8. Định dạng ISO (nếu đã đúng format)
        if (timeString.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
            return timeString;
        }
       
        console.log('No time format matched for:', timeString);
        return '';
    }
});
// Modal xem thông tin
const viewModalOverlay = document.getElementById('viewModalOverlay');
const closeViewModalBtn = document.getElementById('closeViewModalBtn');
const closeViewBtn = document.getElementById('closeViewBtn');
const approveEventBtn = document.getElementById('approveEventBtn');
const rejectEventBtn = document.getElementById('rejectEventBtn');
const seeButtons = document.querySelectorAll('.see-btn');
// Mở modal xem thông tin
seeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const eventCard = this.closest('.content-card');
       
        // Lấy dữ liệu thật từ HTML
        const eventName = eventCard.querySelector('.date p').textContent;
        const eventDescription = eventCard.querySelector('.event-info p:first-child').textContent;
       
        // Lấy thông tin chi tiết từ các dòng trong event-info
        const eventDetails = eventCard.querySelectorAll('.event-info p');
        let startTime = '', endTime = '', deadline = '', location = '', organization = '', link = '';
       
        eventDetails.forEach(p => {
            const text = p.textContent;
           
            if (text.includes('⏰ Thời gian:')) {
                const timeMatch = text.match(/⏰ Thời gian:\s*(.+)/);
                if (timeMatch) {
                    const timeText = timeMatch[1].trim();
                    if (timeText.includes(' - ')) {
const timeParts = timeText.split(' - ');
                        startTime = timeParts[0] ? timeParts[0].trim() : '';
                        endTime = timeParts[1] ? timeParts[1].trim() : '';
                    } else if (timeText.includes('–')) {
                        const timeParts = timeText.split('–');
                        startTime = timeParts[0] ? timeParts[0].trim() : '';
                        endTime = timeParts[1] ? timeParts[1].trim() : '';
                    } else {
                        startTime = timeText;
                    }
                }
            } else if (text.includes('📅 Hạn đăng ký:')) {
                const deadlineMatch = text.match(/📅 Hạn đăng ký:\s*(.+)/);
                if (deadlineMatch) deadline = deadlineMatch[1].trim();
            } else if (text.includes('📍 Địa điểm:')) {
                const locationMatch = text.match(/📍 Địa điểm:\s*(.+)/);
                if (locationMatch) location = locationMatch[1].trim();
            } else if (text.includes('🏢 Tổ chức:')) {
                const orgMatch = text.match(/🏢 Tổ chức:\s*(.+)/);
                if (orgMatch) organization = orgMatch[1].trim();
            }
        });
       
        // Lấy link đăng ký
        const linkElement = eventCard.querySelector('.dki');
        if (linkElement) {
            link = linkElement.getAttribute('href') || linkElement.textContent.replace('→', '').trim();
        }
       
        // Lấy ảnh
        const imageElement = eventCard.querySelector('.content-image img');
        const imageSrc = imageElement ? imageElement.src : '';
       
        // Lấy trạng thái
        const statusBadge = eventCard.querySelector('.status-badge');
        const status = statusBadge ? statusBadge.textContent : '';
        const statusClass = statusBadge ? statusBadge.className : '';
       
        // Lấy kênh mạng xã hội
        const mxhElements = eventCard.querySelectorAll('.mxh div, .displaymxh div');
        const channels = [];
        mxhElements.forEach(el => {
            if (el.textContent.includes('Web')) channels.push('Web');
            if (el.textContent.includes('Facebook')) channels.push('Facebook');
            if (el.textContent.includes('Zalo')) channels.push('Zalo');
        });
       
        // Điền dữ liệu vào modal xem
        document.getElementById('viewEventName').textContent = eventName;
        document.getElementById('viewEventDescription').textContent = eventDescription;
        document.getElementById('viewEventStartTime').textContent = startTime;
        document.getElementById('viewEventEndTime').textContent = endTime;
        document.getElementById('viewRegistrationDeadline').textContent = deadline;
        document.getElementById('viewEventOrganization').textContent = organization;
document.getElementById('viewEventLocation').textContent = location;
       
        const viewLink = document.getElementById('viewRegistrationLink');
        viewLink.href = link;
        viewLink.textContent = link;
       
        if (imageSrc) {
            document.getElementById('viewEventImage').src = imageSrc;
        }
       
        // Hiển thị trạng thái
        const statusElement = document.getElementById('viewEventStatus');
        statusElement.textContent = status;
        statusElement.className = 'status-badge ' + statusClass;
       
        // Hiển thị kênh mạng xã hội
        const channelsContainer = document.getElementById('viewSocialChannels');
        channelsContainer.innerHTML = '';
        channels.forEach(channel => {
            const channelTag = document.createElement('span');
            channelTag.className = 'channel-tag';
            channelTag.textContent = channel;
            channelsContainer.appendChild(channelTag);
        });
       
        // Lưu event ID cho các hành động
        const eventId = this.getAttribute('data-event-id');
        approveEventBtn.setAttribute('data-event-id', eventId);
        rejectEventBtn.setAttribute('data-event-id', eventId);
       
        viewModalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
});
// Đóng modal xem thông tin
function closeViewModal() {
    viewModalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}
closeViewModalBtn.addEventListener('click', closeViewModal);
closeViewBtn.addEventListener('click', closeViewModal);
// Đóng khi click ra ngoài modal xem
viewModalOverlay.addEventListener('click', function(event) {
    if (event.target === viewModalOverlay) {
        closeViewModal();
    }
});
// Thêm xử lý phím ESC cho modal xem
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (viewModalOverlay.classList.contains('active')) {
            closeViewModal();
        }
    }
});
// Tìm kiếm sự kiện
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        searchEvents(searchTerm);
    });
}
// Hàm tìm kiếm sự kiện
// HÀM TÌM KIẾM HOÀN HẢO – ĐÃ FIX LỖI NÚT KHÔNG BẤM ĐƯỢC
// HÀM TÌM KIẾM SIÊU NHANH – CHỈ TÌM THEO TÊN SỰ KIỆN + TỔ CHỨC
// HÀM TÌM KIẾM MỚI – KẾT QUẢ ĐẨY LÊN ĐẦU + ẨN MƯỢT (2025 VERSION)
function searchEvents(searchTerm) {
    const containers = document.querySelectorAll('#created-content > .event-card, #waitapproved-content > .event-card, #approved-content > .event-card');
    let foundAny = false;
    searchTerm = searchTerm.toLowerCase().trim();
    containers.forEach(container => {
        const cards = Array.from(container.querySelectorAll('.content-card'));
        // Reset tất cả card về trạng thái bình thường
        cards.forEach(card => {
            card.classList.remove('hidden-search');
            card.style.order = '';
        });
        // Nếu không có từ khóa → trở về thứ tự ban đầu
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
        // Đẩy kết quả tìm được lên đầu
        matched.forEach((card, i) => card.style.order = i);
        unmatched.forEach((card, i) => card.style.order = matched.length + i);
        // Ẩn mượt các card không khớp
        unmatched.forEach(card => card.classList.add('hidden-search'));
    });
             // Xóa thông báo cũ
    document.querySelectorAll('.no-results-message').forEach(el => el.remove());
    // THÔNG BÁO SIÊU TỐI GIẢN – CHỈ CHỮ, KHÔNG NỀN, KHÔNG BOX, KHÔNG BLUR
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
        // Đảm bảo tab có position để absolute hoạt động
        if (getComputedStyle(activeTab).position === 'static') {
            activeTab.style.position = 'relative';
        }
        activeTab.appendChild(overlay);
   
    }
}
// Hàm hiển thị thông báo không có kết quả
function showNoResultsMessage(foundEvents, searchTerm) {
    // Xóa thông báo cũ nếu có
    const oldMessage = document.querySelector('.no-results-message');
    if (oldMessage) {
        oldMessage.remove();
    }
    // Nếu có từ khóa tìm kiếm và không tìm thấy sự kiện nào
    if (searchTerm && !foundEvents) {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.style.cssText = `
            text-align: center;
            padding: 40px;
            color: #666;
            font-size: 16px;
            grid-column: 1 / -1;
        `;
        noResultsMessage.innerHTML = `
<p>Không tìm thấy sự kiện nào phù hợp với từ khóa "<strong>${searchTerm}</strong>"</p>
            <p style="margin-top: 10px; font-size: 14px; color: #888;">Hãy thử tìm kiếm với từ khóa khác</p>
        `;
        // Thêm thông báo vào container của các tab
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            activeTab.appendChild(noResultsMessage);
        }
    }
}
// Hàm thêm event listener cho các nút xóa
function addDeleteEventListeners() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
   
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
           
            const eventCard = this.closest('.content-card');
            if (eventCard) {
                deleteEvent(eventCard);
            }
        });
    });
}
// Hàm xóa sự kiện
function deleteEvent(eventCard) {
    // Lấy thông tin sự kiện để hiển thị trong confirm
    const eventName = eventCard.querySelector('.date p').textContent;
    const eventOrganization = eventCard.querySelector('.event-info p:last-child').textContent.replace('🏢 Tổ chức: ', '');
   
    // Hiển thị confirm dialog
    if (confirm(`Bạn có chắc chắn muốn xóa sự kiện "${eventName}" của ${eventOrganization}?`)) {
        // Thêm hiệu ứng xóa
        eventCard.style.transition = 'all 0.3s ease';
        eventCard.style.opacity = '0';
        eventCard.style.transform = 'translateX(-100px)';
       
        setTimeout(() => {
            // Xóa khỏi DOM
            eventCard.remove();
           
            // Hiển thị thông báo
            showDeleteNotification(`Đã xóa sự kiện "${eventName}" thành công!`);
           
            // Kiểm tra nếu không còn sự kiện nào trong tab
            checkEmptyTab();
           
        }, 300);
    }
}
// Hàm hiển thị thông báo xóa thành công
function showDeleteNotification(message) {
    // Xóa thông báo cũ nếu có
    const oldNotification = document.querySelector('.delete-notification');
    if (oldNotification) {
        oldNotification.remove();
    }
   
    // Tạo thông báo mới
    const notification = document.createElement('div');
    notification.className = 'delete-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2cbe67ff;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
max-width: 400px;
        font-size: 14px;
    `;
    notification.textContent = message;
   
    document.body.appendChild(notification);
   
    // Tự động xóa thông báo sau 3 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}
// Hàm kiểm tra tab trống và hiển thị thông báo
function checkEmptyTab() {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const visibleEvents = activeTab.querySelectorAll('.content-card:not([style*="display: none"])');
       
        if (visibleEvents.length === 0) {
            showEmptyTabMessage(activeTab);
        } else {
            removeEmptyTabMessage(activeTab);
        }
    }
}
// Hàm hiển thị thông báo tab trống
function showEmptyTabMessage(tab) {
    // Kiểm tra xem đã có thông báo chưa
    if (tab.querySelector('.empty-tab-message')) {
        return;
    }
   
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-tab-message';
    emptyMessage.style.cssText = `
        text-align: center;
        padding: 60px 20px;
        color: #666;
        grid-column: 1 / -1;
    `;
    emptyMessage.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 16px;">📭</div>
        <h3 style="margin-bottom: 8px; color: #333;">Không có sự kiện nào</h3>
        <p style="margin-bottom: 0; opacity: 0.7;">Tất cả sự kiện đã được xóa hoặc không có sự kiện nào trong danh sách này</p>
    `;
   
    tab.appendChild(emptyMessage);
}
// Hàm xóa thông báo tab trống
function removeEmptyTabMessage(tab) {
    const emptyMessage = tab.querySelector('.empty-tab-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
}
document.querySelector('.logout-btn').addEventListener('click', function() {
    localStorage.clear();
    window.location.href = 'index.html';
});
// ==================== TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI "Còn hạn" / "Hết hạn" ====================
function updateEventStatusBadges() {
    const now = new Date(); // Thời gian hiện tại
    document.querySelectorAll('.content-card').forEach(card => {
        // Tìm dòng chứa "Hạn đăng ký"
        const deadlineTextElement = Array.from(card.querySelectorAll('.event-info p'))
            .find(p => p.textContent.includes('📅 Hạn đăng ký:'));
        if (!deadlineTextElement) return;
        const deadlineText = deadlineTextElement.textContent;
        const badge = card.querySelector('.status-badge');
        if (!badge) return;
        // Trích xuất ngày hạn đăng ký từ chuỗi
        let deadlineDate = extractDeadlineDate(deadlineText);
        if (!deadlineDate) {
            badge.textContent = 'Không xác định';
            badge.className = 'status-badge unknown';
            return;
        }
// So sánh với thời gian hiện tại
        if (deadlineDate >= now) {
            badge.textContent = 'Còn hạn';
            badge.className = 'status-badge approved'; // xanh
        } else {
            badge.textContent = 'Hết hạn';
            badge.className = 'status-badge disapproved'; // đỏ
        }
    });
}
// Hàm trích xuất ngày giờ từ chuỗi "Hạn đăng ký"
function extractDeadlineDate(text) {
    // Các định dạng phổ biến trong dữ liệu của bạn:
    // "22/11/2025 đến hết ngày 24/11/2025" → lấy 24/11/2025
    // "25/10 đến 23h59' ngày 1/11"
    // "10/11-14/11"
    // "23:00 23/10/2025"
    let dateStr = '';
    // Case 1: "đến hết ngày XX/XX/XXXX" → lấy ngày cuối
    const fullMatch = text.match(/đến hết ngày (\d{1,2}\/\d{1,2}\/\d{4})/);
    if (fullMatch) {
        dateStr = fullMatch[1];
    }
    // Case 2: "XX/XX đến XX/XX" hoặc "XX/XX-XXXX"
    else if (text.includes('đến') || text.includes('-')) {
        const parts = text.split(/đến|-/).pop().trim();
        const dayMonth = parts.match(/(\d{1,2}\/\d{1,2})/);
        if (dayMonth) {
            const currentYear = new Date().getFullYear();
            dateStr = dayMonth[1] + '/' + currentYear;
        }
    }
    // Case 3: chỉ có 1 ngày "23/10/2025"
    else {
        const single = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
        if (single) dateStr = single[1];
    }
    if (!dateStr) return null;
    // Chuyển thành Date object (định dạng DD/MM/YYYY → MM/DD/YYYY để Date.parse hiểu)
    const [day, month, year] = dateStr.split('/');
    const isoStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59:59`;
    const deadline = new Date(isoStr);
    return isNaN(deadline.getTime()) ? null : deadline;
}
// Gọi hàm khi trang tải xong
document.addEventListener('DOMContentLoaded', function () {
    updateEventStatusBadges();
    // Cập nhật lại mỗi 1 phút (để tự động chuyển sang "Hết hạn" khi hết ngày)
    setInterval(updateEventStatusBadges, 60000);
    // Cũng gọi lại sau khi tạo/sửa sự kiện (nếu bạn có hàm reload hoặc thêm card động)
});
// Nếu bạn thêm/sửa sự kiện động (không reload trang), hãy gọi:
// updateEventStatusBadges();
// sau khi thêm card mới vào DOM
               // HÀM THÊM CARD MỚI – PHIÊN BẢN CUỐI CÙNG, HOÀN HẢO 100%
// HÀM THÊM CARD MỚI – HIỆN TÊN TỔ CHỨC THẬT 100%
function addEventCardToTab(data, newId) {
    const wrapper = document.querySelector('#created-content > .event-card');
    if (!wrapper) return;
    let imgSrc = 'https://via.placeholder.com/400x250/f0f0f0/999?text=No+Image';
    if (data.image && data.image instanceof File) {
        imgSrc = URL.createObjectURL(data.image);
    }
    const socialHtml = renderSocialTags(data.channels);
    const f = iso => !iso ? 'Chưa xác định' : new Date(iso).toLocaleString('vi-VN', {
        hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'
    }).replace(',', '');

    // FIX: LẤY TÊN TỔ CHỨC TỪ DANH SÁCH ĐÃ LOAD (organizations)
    let orgName = '-----';
    if (data.organization) {
        if (!isNaN(data.organization)) {
            // Nếu là ID (số)
            const org = organizations.find(o => o.id == data.organization);
            orgName = org ? org.name : '-----';
        } else {
            // Nếu là tên (chuỗi)
            orgName = data.organization;
        }
    }

    const card = document.createElement('div');
    card.className = 'content-card';
    card.dataset.id = newId;
    card.innerHTML = `
        <div class="content-image"><img src="${imgSrc}" alt="${data.name}"></div>
        <div class="content-info">
            <div class="date"><p>${data.name}</p><div class="status-badge approved">Còn hạn</div></div>
            <div class="event-info">
                <p>${data.description}</p>
                <p>⏰ Thời gian: ${f(data.startTime)} - ${f(data.endTime)}</p>
                <p>📅 Hạn đăng ký: ${f(data.deadline)}</p>
                <p>📍 Địa điểm: ${data.location}</p>
                <p>🏢 Tổ chức: ${orgName}</p>
            </div>
            ${socialHtml}
            <a class="dki" href="${data.link}" target="_blank">Link đăng ký →</a>
            <div class="button-container">
                <button class="approve-btn edit-event-btn" data-event-id="${newId}">Sửa</button>
                <button class="delete-btn">Xóa</button>
            </div>
        </div>
    `;
    wrapper.insertBefore(card, wrapper.firstChild);
    card.querySelector('.delete-btn').addEventListener('click', () => deleteEvent(card));
    updateTabBadges();
    updateEventStatusBadges();
    checkEmptyTab();
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        searchEvents(searchInput.value.trim().toLowerCase());
    }
}
// ==================== TỰ ĐỘNG CẬP NHẬT SỐ LƯỢNG TAB + DUYỆT/TỪ CHỐI HOÀN HẢO 100% ====================
function updateTabBadges() {
    const createdCount = document.querySelectorAll('#created-content .content-card').length;
    const waitingCount = document.querySelectorAll('#waitapproved-content .content-card').length;
    const approvedCount = document.querySelectorAll('#approved-content .content-card').length;
    const badgeCreated = document.querySelector('.tab-btn[data-tab="created"] .badge');
    const badgeWaiting = document.querySelector('.tab-btn[data-tab="waitapproved"] .badge');
    const badgeApproved = document.querySelector('.tab-btn[data-tab="approved"] .badge');
    if (badgeCreated) badgeCreated.textContent = `(${createdCount})`;
    if (badgeWaiting) badgeWaiting.textContent = `(${waitingCount})`;
    if (badgeApproved) badgeApproved.textContent = `(${approvedCount})`;
}
// DUYỆT SỰ KIỆN (từ tab "Chờ duyệt" → "Đã duyệt")
approveEventBtn.addEventListener('click', function () {
const eventId = this.getAttribute('data-event-id');
    if (!confirm('Bạn chắc chắn muốn DUYỆT sự kiện này?')) return;
    const card = document.querySelector(`.see-btn[data-event-id="${eventId}"]`)?.closest('.content-card');
    if (!card) return alert('Lỗi: Không tìm thấy sự kiện!');
    // Chuyển card sang tab Đã duyệt
    const approvedWrapper = document.querySelector('#approved-content .event-card');
    approvedWrapper.appendChild(card);
    // Đổi nút thành chỉ còn nút Xóa
    const btnContainer = card.querySelector('.button-container');
    btnContainer.innerHTML = '<button class="delete-btn">Xóa</button>';
    btnContainer.querySelector('.delete-btn').addEventListener('click', () => deleteEvent(card));
    alert('Đã duyệt sự kiện thành công!');
    closeViewModal();
    updateTabBadges(); // Cập nhật số lượng sau khi duyệt
    updateEventStatusBadges();
    checkEmptyTab();
});
// TỪ CHỐI SỰ KIỆN (xóa khỏi tab Chờ duyệt)
rejectEventBtn.addEventListener('click', function () {
    const eventId = this.getAttribute('data-event-id');
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason?.trim()) return alert('Bạn phải nhập lý do từ chối!');
    const card = document.querySelector(`.see-btn[data-event-id="${eventId}"]`)?.closest('.content-card');
    if (!card) return alert('Lỗi: Không tìm thấy sự kiện!');
    if (confirm('Từ chối và xóa sự kiện này khỏi danh sách?')) {
        card.remove();
        alert('Đã từ chối sự kiện!');
        closeViewModal();
        updateTabBadges(); // Cập nhật số lượng sau khi từ chối
        checkEmptyTab();
    }
});
// XÓA SỰ KIỆN (từ bất kỳ tab nào)
function deleteEvent(eventCard) {
    const eventName = eventCard.querySelector('.date p')?.textContent || 'sự kiện này';
    if (confirm(`Xóa sự kiện "${eventName}"?`)) {
        eventCard.style.transition = 'all 0.3s ease';
        eventCard.style.opacity = '0';
        eventCard.style.transform = 'translateX(-100px)';
        setTimeout(() => {
            eventCard.remove();
            showDeleteNotification(`Đã xóa "${eventName}" thành công!`);
            updateTabBadges(); // Cập nhật số lượng sau khi xóa
            updateEventStatusBadges();
            checkEmptyTab();
        }, 300);
    }
}
// CẬP NHẬT SỐ LƯỢNG NGAY KHI LOAD TRANG
document.addEventListener('DOMContentLoaded', () => {
    updateTabBadges();
    addDeleteEventListeners(); // Đảm bảo các nút Xóa đã có event listener
});
// THÊM EVENT LISTENER CHO CÁC NÚT XÓA
function addDeleteEventListeners() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const eventCard = btn.closest('.content-card');
if (eventCard) deleteEvent(eventCard);
        });
    });
}
// === FIX TAG MXH ĐẸP Y HỆT CÁC CARD CŨ ===
// === FIX TAG MXH HIỂN THỊ ĐÚNG DÙ VALUE GÌ CŨNG ĐƯỢC ===
function renderSocialTags(channels) {
    if (!channels || channels.length === 0) {
        return '<div class="displaymxh"><small style="color:#999">Chưa chọn</small></div>';
    }
    let html = '<div class="displaymxh">';
    // Chuẩn hóa về lowercase và trim để chống lỗi viết hoa/khoảng trắng
    const normalized = channels.map(ch => ch.toString().trim().toLowerCase());
    if (normalized.includes('website') || normalized.includes('web')) {
        html += '<div class="mxh"><span class="mxh-web">Website</span></div>';
    }
    if (normalized.includes('facebook') || normalized.includes('fb')) {
        html += '<div class="fb"><span class="fb-content">Facebook</span></div>';
    }
    if (normalized.includes('zalo') || normalized.includes('za')) {
        html += '<div class="zalo"><span class="zalo-content">Zalo</span></div>';
    }
    html += '</div>';
    return html;
}
// Thêm phần này vào JavaScript của bạn, sau khi định nghĩa các biến
// Tìm hoặc tạo nút quay lại ở bước 2
const backToStep1Btn = document.getElementById('backToStep1');
// Nếu chưa có nút quay lại trong HTML, tạo nút mới
if (!backToStep1Btn) {
    // Tìm container của các nút ở bước 2
    const step2Actions = document.querySelector('#step2 .form-actions');
    if (step2Actions) {
        // Tạo nút quay lại
        const backBtn = document.createElement('button');
        backBtn.type = 'button';
        backBtn.className = 'cancel-btn';
        backBtn.id = 'backToStep1';
        backBtn.textContent = 'Quay lại';
       
        // Chèn vào trước nút Đăng
        const createEventBtn = document.getElementById('createEvent');
        if (createEventBtn) {
            step2Actions.insertBefore(backBtn, createEventBtn);
           
            // Thêm sự kiện cho nút quay lại
            backBtn.addEventListener('click', function() {
                step2.classList.remove('active');
                step1.classList.add('active');
            });
        }
    }
} else {
    // Nếu đã có nút quay lại trong HTML, thêm sự kiện
    backToStep1Btn.addEventListener('click', function() {
        step2.classList.remove('active');
        step1.classList.add('active');
    });
}
