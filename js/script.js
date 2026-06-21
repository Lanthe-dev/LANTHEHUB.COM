// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', function() {
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeSlider = document.getElementById('volumeSlider');
    
    // Only set up music player if elements exist
    if (playPauseBtn && volumeSlider) {
        // Create an audio element
        const audio = new Audio();
        audio.loop = true;
        audio.volume = 0.3;
        
        // Determine the correct path based on current page location
        const isInPagesFolder = window.location.pathname.includes('/pages/');
        audio.src = isInPagesFolder ? '../assets/lofi-295209.mp3' : 'assets/lofi-295209.mp3';
        
        let isPlaying = false;
        
        audio.play().then(() => {
            isPlaying = true;
            playPauseBtn.textContent = '🔊 Music On';
        }).catch((error) => {
            console.log('Auto-play blocked. User must click to start.');
            playPauseBtn.textContent = '🔇 Click to Play';
        });
        
        playPauseBtn.addEventListener('click', function() {
            if (isPlaying) {
                audio.pause();
                playPauseBtn.textContent = '🔇 Music Off';
                isPlaying = false;
            } else {
                audio.play();
                playPauseBtn.textContent = '🔊 Music On';
                isPlaying = true;
            }
        });
        
        volumeSlider.addEventListener('input', function() {
            audio.volume = this.value / 100;
        });
    }
});

// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Show loading state
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            fetch('/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(response => {
                // Check if response is OK
                if (!response.ok) {
                    // For local development, show a friendly message
                    if (response.status === 405 || response.status === 404) {
                        throw new Error('This form requires Cloudflare Pages deployment. Please deploy to Cloudflare Pages to test the contact form.');
                    }
                    throw new Error(`Server error: ${response.status}`);
                }
                
                // Only parse JSON if we have content
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    return response.json();
                } else {
                    throw new Error('Invalid response from server');
                }
            })
            .then(data => {
                if (data.success) {
                    // Show success message
                    formStatus.className = 'form-status success';
                    formStatus.textContent = '✓ ' + data.message;
                    formStatus.style.display = 'block';
                    
                    // Reset form
                    contactForm.reset();
                } else {
                    // Show error message
                    formStatus.className = 'form-status error';
                    formStatus.textContent = '✗ ' + data.message;
                    formStatus.style.display = 'block';
                }
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            })
            .catch(error => {
                // Show error message
                formStatus.className = 'form-status error';
                formStatus.textContent = '✗ ' + error.message;
                formStatus.style.display = 'block';
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
                console.error('Form submission error:', error);
                
                // Hide message after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                }, 5000);
            });
        });
    }
});

// Cursor trail effect - always connected to cursor
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '9997';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

const points = [];
let mouseX = 0;
let mouseY = 0;
let lastX = 0;
let lastY = 0;
let hasMovedMouse = false;

document.addEventListener('mousemove', (e) => {
    if (!hasMovedMouse) {
        hasMovedMouse = true;
        lastX = e.clientX;
        lastY = e.clientY;
        mouseX = e.clientX;
        mouseY = e.clientY;
        return; // Skip first movement to avoid trail from center
    }
    
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Add interpolated points between last position and current position
    const dx = mouseX - lastX;
    const dy = mouseY - lastY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.max(1, Math.floor(distance / 5)); // Add point every 5 pixels
    
    for (let i = 1; i <= steps; i++) {
        points.push({
            x: lastX + (dx * i / steps),
            y: lastY + (dy * i / steps),
            time: Date.now()
        });
    }
    
    lastX = mouseX;
    lastY = mouseY;
});

function drawTrail() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Only add points if mouse has moved
    if (hasMovedMouse) {
        points.push({ 
            x: mouseX, 
            y: mouseY,
            time: Date.now()
        });
    }
    
    // Remove old points
    const now = Date.now();
    while (points.length > 0 && now - points[0].time > 300) {
        points.shift();
    }
    
    // Only draw if we have enough points AND mouse has moved
    if (points.length > 1 && hasMovedMouse) {
        // Draw glow first (behind)
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = 'rgba(107, 91, 149, 0.2)';
        ctx.lineWidth = 15;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        // Draw main trail
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        
        const gradient = ctx.createLinearGradient(
            points[0].x, points[0].y,
            points[points.length - 1].x, points[points.length - 1].y
        );
        gradient.addColorStop(0, 'rgba(107, 91, 149, 0)');
        gradient.addColorStop(0.5, 'rgba(107, 91, 149, 0.5)');
        gradient.addColorStop(1, 'rgba(107, 91, 149, 0.9)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6;
        ctx.stroke();
    }
    
    requestAnimationFrame(drawTrail);
}

drawTrail();
