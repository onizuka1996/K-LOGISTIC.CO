document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap components
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    })
    
    // Attachment preview for issue form
    const attachmentInput = document.getElementById('attachment');
    const attachmentPreview = document.getElementById('attachmentPreview');

    if (attachmentInput && attachmentPreview) {
        attachmentInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                // Only show preview for images
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        attachmentPreview.src = e.target.result;
                        attachmentPreview.style.display = 'block';
                    }
                    
                    reader.readAsDataURL(file);
                } else {
                    // For non-image files (like PDF)
                    attachmentPreview.style.display = 'none';
                }
            }
        });
    }

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
            
            // Add form type identifier
            formDataObj.formType = 'ใบสมัครงาน';
            
            // Get photo as base64 if exists
            const photoFile = photoInput.files[0];
            if (photoFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    formDataObj.photoBase64 = e.target.result;
                    sendToTelegram(formDataObj, 'ใบสมัครงาน');
                };
                reader.readAsDataURL(photoFile);
            } else {
                sendToTelegram(formDataObj, 'ใบสมัครงาน');
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
            
            sendToTelegram(formDataObj, 'ติดต่อสอบถาม');
        });
    }
    
    // Issue report form submission
    const issueForm = document.getElementById('issueForm');
    
    if (issueForm) {
        issueForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const formDataObj = {};
            
            formData.forEach((value, key) => {
                if (key !== 'attachment') {
                    formDataObj[key] = value;
                }
            });
            
            // Get attachment as base64 if exists
            const attachmentFile = document.getElementById('attachment').files[0];
            if (attachmentFile) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    formDataObj.attachmentBase64 = e.target.result;
                    formDataObj.attachmentType = attachmentFile.type;
                    formDataObj.attachmentName = attachmentFile.name;
                    sendToTelegram(formDataObj, 'แจ้งปัญหา');
                };
                reader.readAsDataURL(attachmentFile);
            } else {
                sendToTelegram(formDataObj, 'แจ้งปัญหา');
            }
        });
    }

    // Function to send data to Telegram
    function sendToTelegram(data, formType = '') {
        // Replace with your Telegram Bot API token and chat ID
        const botToken = '7992354555:AAFm96-DSMUK9ayG7f92xwCIfxMcmnAF_hE';
        // Using chat ID for the bot
        const chatId = '7992354555';
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        // Format message
        let message = formType ? `📝 ${formType}\n\n` : '';
        for (const [key, value] of Object.entries(data)) {
            if (key !== 'photoBase64' && key !== 'attachmentBase64' && key !== 'attachmentType' && key !== 'attachmentName' && key !== 'formType') {
                message += `${key}: ${value}\n`;
            }
        }
        
        console.log('Sending message to Telegram:', message);
        
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
        .then(response => {
            console.log('Message response status:', response.status);
            return response.json();
        })
        .then(result => {
            console.log('Message sent successfully:', result);
            // If there's a photo or attachment, send it as a separate message
            if (data.photoBase64) {
                sendPhotoToTelegram(data.photoBase64, formType === 'ใบสมัครงาน' ? 'รูปถ่ายผู้สมัคร' : 'รูปภาพ');
            } else if (data.attachmentBase64) {
                if (data.attachmentType.startsWith('image/')) {
                    sendPhotoToTelegram(data.attachmentBase64, 'ไฟล์แนบ: ' + data.attachmentName);
                } else {
                    // For non-image files like PDF, we can only send the message without the file
                    // since we're using a simple approach with Telegram
                    showSuccessMessage();
                }
            } else {
                showSuccessMessage();
            }
        })
        .catch(error => {
            console.error('Error sending message:', error);
            showErrorMessage();
        });
    }

    // Function to send photo to Telegram
    function sendPhotoToTelegram(photoBase64, caption = 'รูปถ่ายผู้สมัคร') {
        const botToken = '7992354555:AAFm96-DSMUK9ayG7f92xwCIfxMcmnAF_hE';
        // Using chat ID for the bot
        const chatId = '7992354555';
        const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
        
        console.log('Sending photo to Telegram with caption:', caption);
        
        try {
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
            formData.append('caption', caption);
            
            fetch(url, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                console.log('Photo response status:', response.status);
                return response.json();
            })
            .then(data => {
                console.log('Photo sent successfully:', data);
                showSuccessMessage();
            })
            .catch(error => {
                console.error('Error sending photo:', error);
                showErrorMessage();
            });
        } catch (error) {
            console.error('Error processing photo:', error);
            showErrorMessage();
        }
    }

    // Show success message
    function showSuccessMessage() {
        // Check which form was submitted to show appropriate message
        if (document.getElementById('issueForm') && document.getElementById('issueForm').contains(document.activeElement)) {
            alert('\u0e2a\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22\u0e41\u0e25\u0e49\u0e27 \u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e17\u0e35\u0e48\u0e41\u0e08\u0e49\u0e07\u0e1b\u0e31\u0e0d\u0e2b\u0e32\u0e01\u0e31\u0e1a\u0e40\u0e23\u0e32 \u0e40\u0e23\u0e32\u0e08\u0e30\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d\u0e01\u0e25\u0e31\u0e1a\u0e42\u0e14\u0e22\u0e40\u0e23\u0e47\u0e27\u0e17\u0e35\u0e48\u0e2a\u0e38\u0e14');
        } else if (document.getElementById('careerForm') && document.getElementById('careerForm').contains(document.activeElement)) {
            alert('\u0e2a\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22\u0e41\u0e25\u0e49\u0e27 \u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e17\u0e35\u0e48\u0e2a\u0e19\u0e43\u0e08\u0e23\u0e48\u0e27\u0e21\u0e07\u0e32\u0e19\u0e01\u0e31\u0e1a\u0e40\u0e23\u0e32');
        } else {
            alert('\u0e2a\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e40\u0e23\u0e35\u0e22\u0e1a\u0e23\u0e49\u0e2d\u0e22\u0e41\u0e25\u0e49\u0e27 \u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e17\u0e35\u0e48\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d\u0e40\u0e23\u0e32');
        }
        
        // Reset forms
        if (careerForm) careerForm.reset();
        if (contactForm) contactForm.reset();
        if (document.getElementById('issueForm')) document.getElementById('issueForm').reset();
        
        // Reset previews
        if (imagePreview) imagePreview.style.display = 'none';
        if (document.getElementById('attachmentPreview')) document.getElementById('attachmentPreview').style.display = 'none';
    }

    // Show error message
    function showErrorMessage() {
        alert('\u0e40\u0e01\u0e34\u0e14\u0e02\u0e49\u0e2d\u0e1c\u0e34\u0e14\u0e1e\u0e25\u0e32\u0e14\u0e43\u0e19\u0e01\u0e32\u0e23\u0e2a\u0e48\u0e07\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 \u0e01\u0e23\u0e38\u0e13\u0e32\u0e25\u0e2d\u0e07\u0e43\u0e2b\u0e21\u0e48\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07');
    }
});