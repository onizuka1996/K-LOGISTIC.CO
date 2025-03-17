document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })

    // Image preview for career form
    const photoInput = document.getElementById('photo');
    const imagePreview = document.getElementById('imagePreview');

    if (photoInput && imagePreview) {
        photoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    imagePreview.src = e.target.result;
                    imagePreview.style.display = 'block';
                }
                
                reader.readAsDataURL(file);
            }
        });
    }

    // Career form submission
    const careerForm = document.getElementById('careerForm');
    
    if (careerForm) {
        careerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formDataObj = {};
            
            formData.forEach((value, key) => {
                if (key !== 'photo') {
                    formDataObj[key] = value;
                }
            });
            
            // Get photo as base64 if exists
            const photoFile = photoInput.files[0];
            if (photoFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    formDataObj.photoBase64 = e.target.result;
                    sendToTelegram(formDataObj);
                };
                reader.readAsDataURL(photoFile);
            } else {
                sendToTelegram(formDataObj);
            }
        });
    }

    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formDataObj = {};
            
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });
            
            sendToTelegram(formDataObj);
        });
    }

    // Function to send data to Telegram
    function sendToTelegram(data) {
        // Replace with your Telegram Bot API token and chat ID
        const botToken = '7992354555:AAFm96-DSMUK9ayG7f92xwCIfxMcmnAF_hE';
        // Using group chat ID (must start with '-' for groups)
        const chatId = '-1002242123066';
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        // Format message
        let message = '';
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'photoBase64') {
                message += `${key}: ${value}\n`;
            }
        }
        
        // Send text message
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        })
        .then(response => response.json())
        .then(result => {
            // If there's a photo, send it as a separate message
            if (data.photoBase64) {
                sendPhotoToTelegram(data.photoBase64);
            } else {
                showSuccessMessage();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage();
        });
    }

    // Function to send photo to Telegram
    function sendPhotoToTelegram(photoBase64) {
        const botToken = '7992354555:AAFm96-DSMUK9ayG7f92xwCIfxMcmnAF_hE';
        // Using group chat ID (must start with '-' for groups)
        const chatId = '-1002242123066';
        const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        
        // Convert base64 to blob
        const byteString = atob(photoBase64.split(',')[1]);
        const mimeString = photoBase64.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        
        const blob = new Blob([ab], {type: mimeString});
        
        // Create FormData and append the photo
        const formData = new FormData();
        formData.append('chat_id', chatId);
        formData.append('photo', blob, 'photo.jpg');
        formData.append('caption', 'รูปถ่ายผู้สมัคร');
        
        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            showSuccessMessage();
        })
        .catch(error => {
            console.error('Error:', error);
            showErrorMessage();
        });
    }

    // Show success message
    function showSuccessMessage() {
        alert('ส่งข้อมูลเรียบร้อยแล้ว ขอบคุณที่สนใจร่วมงานกับเรา');
        // Reset form
        if (careerForm) careerForm.reset();
        if (contactForm) contactForm.reset();
        if (imagePreview) imagePreview.style.display = 'none';
    }

    // Show error message
    function showErrorMessage() {
        alert('เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง');
    }
});