document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const chooseFileBtn = document.getElementById('choose-file');
    const startCameraBtn = document.getElementById('start-camera');
    const imageUrlInput = document.getElementById('image-url');
    const loadUrlBtn = document.getElementById('load-url');
    const dropArea = document.getElementById('drop-area');
    const previewImage = document.getElementById('preview-image');
    const errorMessage = document.getElementById('error-message');
    const detectFishBtn = document.getElementById('detect-fish');
    const fishCountSpan = document.getElementById('fish-count');
    const navBtns = document.querySelectorAll('.nav-btn');
    const contentDivs = document.querySelectorAll('.content');
    const historyList = document.getElementById('history-list');

    let detectionHistory = [];
    let stream = null;

    console.log({fileInput, chooseFileBtn, startCameraBtn, imageUrlInput, loadUrlBtn, dropArea, previewImage, errorMessage, detectFishBtn, fishCountSpan, navBtns, contentDivs, historyList});

    // Navigation handling
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            contentDivs.forEach(div => {
                div.style.display = div.id === target ? 'flex' : 'none';
            });
            navBtns.forEach(navBtn => navBtn.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // File input handling
    chooseFileBtn.addEventListener('click', () => {
        console.log('Choose file button clicked');
        fileInput.click();
    });
    fileInput.addEventListener('change', handleFileSelect);

    // Camera handling
    startCameraBtn.addEventListener('click', toggleCamera);

    // Drag and drop handling (disabled for mobile)
    if (!isMobile()) {
        dropArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropArea.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
        });

        dropArea.addEventListener('dragleave', () => {
            dropArea.style.backgroundColor = 'transparent';
        });

        dropArea.addEventListener('drop', handleFileDrop);
    }

    // URL input handling
    loadUrlBtn.addEventListener('click', handleUrlLoad);

    // Fish detection
    detectFishBtn.addEventListener('click', detectFish);

    function handleFileSelect(e) {
        console.log('File selected:', e.target.files[0]);
        const file = e.target.files[0];
        if (file) {
            displayImage(URL.createObjectURL(file));
        }
    }

    function handleFileDrop(e) {
        e.preventDefault();
        console.log('File dropped');
        dropArea.style.backgroundColor = 'transparent';
        const file = e.dataTransfer.files[0];
        if (file) {
            displayImage(URL.createObjectURL(file));
        }
    }

    function displayImage(src) {
        console.log('Displaying image:', src);
        previewImage.src = src;
        previewImage.style.display = 'block';
        dropArea.querySelector('p').style.display = 'none';
        animateImage();
    }

    function handleUrlLoad() {
        console.log('Loading URL:', imageUrlInput.value);
        const url = imageUrlInput.value.trim();
        if (url) {
            fetch(url)
                .then(response => response.blob())
                .then(blob => {
                    const objectURL = URL.createObjectURL(blob);
                    displayImage(objectURL);
                    errorMessage.textContent = '';
                })
                .catch(error => {
                    console.error('Error loading image:', error);
                    errorMessage.textContent = 'Không thể tải hình ảnh. Vui lòng kiểm tra URL và thử lại.';
                    shakeElement(imageUrlInput);
                });
        } else {
            errorMessage.textContent = 'Vui lòng nhập URL hình ảnh hợp lệ';
            shakeElement(imageUrlInput);
        }
    }

    async function toggleCamera() {
        console.log('Toggling camera');
        if (stream) {
            stopCamera();
        } else {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                const video = document.createElement('video');
                video.srcObject = stream;
                video.play();
                video.onloadedmetadata = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const context = canvas.getContext('2d');
                    const drawAndCapture = () => {
                        if (stream) {
                            context.drawImage(video, 0, 0, canvas.width, canvas.height);
                            displayImage(canvas.toDataURL('image/jpeg'));
                            requestAnimationFrame(drawAndCapture);
                        }
                    };
                    drawAndCapture();
                };
                startCameraBtn.textContent = 'Dừng Camera';
            } catch (err) {
                console.error('Không thể khởi động camera:', err);
                errorMessage.textContent = 'Không thể khởi động camera. Vui lòng kiểm tra quyền truy cập.';
            }
        }
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            startCameraBtn.textContent = 'Bật Camera';
        }
    }

    function detectFish() {
        console.log('Detecting fish');
        detectFishBtn.disabled = true;
        detectFishBtn.textContent = 'Đang đếm...';
        
        setTimeout(() => {
            const fishCount = Math.floor(Math.random() * 10);
            fishCountSpan.textContent = fishCount;
            detectFishBtn.disabled = false;
            detectFishBtn.textContent = 'Đếm cá';
            
            animateCount(fishCount);
            addToHistory(fishCount);
        }, 2000);
    }

    function animateImage() {
        previewImage.style.opacity = '0';
        previewImage.style.transform = 'scale(0.8)';
        setTimeout(() => {
            previewImage.style.transition = 'all 0.5s ease';
            previewImage.style.opacity = '1';
            previewImage.style.transform = 'scale(1)';
        }, 50);
    }

    function animateCount(count) {
        let current = 0;
        const interval = setInterval(() => {
            if (current <= count) {
                fishCountSpan.textContent = current;
                current++;
            } else {
                clearInterval(interval);
            }
        }, 100);
    }

    function shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
    }

    function addToHistory(count) {
        const now = new Date();
        const historyItem = {
            date: now.toLocaleString(),
            count: count
        };
        detectionHistory.unshift(historyItem);
        updateHistoryList();
    }

    function updateHistoryList() {
        historyList.innerHTML = '';
        detectionHistory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.date}: ${item.count} cá`;
            historyList.appendChild(li);
        });
    }

    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
});

async function fetchData() {
    let url = "https://jsonplaceholder.typicode.com/posts"; //new
    let response = await fetch(url);
    let json = await response.json();

    let idList = document.getElementById("history-list");
    let html = "";
    for (let i = 0; i < json.length; i++) {
        html += `<li>${json[i].title}</li>`;
    }

    idList.innerHTML = html;

    console.log(json);
}