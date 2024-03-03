document.addEventListener('DOMContentLoaded', () => {
    const newQrForm = document.getElementById('newQrForm');
    const recentQrCodes = document.getElementById('recentQrCodes');
    const qrContentInput = document.getElementById('qrContent');

    newQrForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = qrContentInput.value;

        fetch('/qr/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token')
            },
            body: JSON.stringify({ content: content })
        })
            .then(response => response.json())
            .then(data => {
                // Append new QR code to the recentQrCodes div
                const qrImage = document.createElement('img');
                qrImage.src = data.imagePath;
                qrImage.alt = 'QR Code';
                recentQrCodes.appendChild(qrImage);

                qrContentInput.value = '';
            })
            .catch(error => {
                console.error('Error:', error);
                alert("An error occurred while generating the QR code.");
            });
    });

    fetch('/qr/recent', {
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        }
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(qr => {
                const qrImage = document.createElement('img');
                qrImage.src = qr.imagePath;
                qrImage.alt = 'QR Code';
                recentQrCodes.appendChild(qrImage);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert("An error occurred while loading recent QR codes.");
        });
});
