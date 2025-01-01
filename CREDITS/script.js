// Your existing code remains the same at the top
function goBack() {
    window.open("/index.html","_self");
}
function parthgithub() {
    window.open("https://github.com/Parthsadaria", "_blank");
}
function heetgithub() {
    window.open("https://github.com/HEETKUMBHARANA2369", "_blank");
}
function claudeai() {
    window.open("https://claude.ai/new", "_blank");
}
function chatgpt() {
    window.open("https://chatgpt.com", "_blank");
}
function jiosaavn() {
    window.open("https://saavn.dev/", "_blank");
}
function icons8(){
    window.open("https://icons8.com/","_blank");
}
// Modified DOMContentLoaded event handler
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.credit-card');
    const logo = document.querySelector('.logo');
    const button = document.querySelector('.back-button');

    // Add mouse move handler for glow effect
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    // Animate cards with Apple-style spring animation
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.98)';
        setTimeout(() => {
            card.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 500 * (index + 1));
    });

    // Animate logo
    if (logo) {
        logo.style.opacity = '0';
        logo.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            logo.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            logo.style.opacity = '1';
            logo.style.transform = 'translateY(0)';
        }, 300);
    }

    // Animate button
    if (button) {
        button.style.opacity = '0';
        setTimeout(() => {
            button.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            button.style.opacity = '1';
        }, 1200);
    }
});

// Show the button when the user scrolls halfway down the page
window.onscroll = function() {
    if (document.documentElement.scrollTop > document.documentElement.scrollHeight / 4) {
        document.getElementById("back-to-top").style.display = "block"; // Show the button
    } else {
        document.getElementById("back-to-top").style.display = "none"; // Hide the button
    }
};

// Function to scroll to the top
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

//GAME LOGIKKKK
const trigger = document.querySelector('.hidden-trigger');
const modal = document.querySelector('.game-modal');
const overlay = document.querySelector('.overlay');
const slots = document.querySelectorAll('.slot');
const spinBtn = document.querySelector('.spin-btn');
const betInput = document.querySelector('.bet-input');
const balanceDisplay = document.getElementById('balance');

let balance = 10;
const symbols = ['🍒', '🍊', '🍇', '💎', '7️⃣'];
let isSpinning = false;

function showAchievement() {
    const achievement = document.createElement('div');
    achievement.className = 'achievement';
    achievement.innerHTML = `
        <span style="font-size: 2rem">🏆</span>
        <div>
            <h4 style="margin: 0">Easter Egg Found!</h4>
            <p style="margin: 0">You've discovered the Lucky Slots game!</p>
        </div>
    `;
    document.body.appendChild(achievement);
    setTimeout(() => achievement.remove(), 3000);
}

trigger.addEventListener('click', () => {
    modal.style.display = 'block';
    overlay.style.display = 'block';
    showAchievement();
});

overlay.addEventListener('click', () => {
    modal.style.display = 'none';
    overlay.style.display = 'none';
});

function updateBalance(amount) {
    balance = amount;
    balanceDisplay.textContent = balance;
}

function spin() {
    if (isSpinning) return;
    
    const bet = parseInt(betInput.value);
    if (bet > balance || bet < 1) {
        alert('Invalid bet amount!');
        return;
    }

    isSpinning = true;
    updateBalance(balance - bet);
    spinBtn.disabled = true;

    // Add spinning class to all slots
    slots.forEach(slot => {
        slot.classList.add('spinning');
    });

    // Generate the first two random symbols
    const firstTwoSymbols = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
    ];

    // If the first two are the same, make the third one the same as them
    const finalSymbols = firstTwoSymbols[0] === firstTwoSymbols[1]
        ? [firstTwoSymbols[0], firstTwoSymbols[1], firstTwoSymbols[0]]  // If two are the same, third is also the same
        : [
            firstTwoSymbols[0],
            firstTwoSymbols[1],
            symbols[Math.floor(Math.random() * symbols.length)] // Random symbol for the third one
        ];
    
    // Stop spinning after random delays for each slot
    slots.forEach((slot, index) => {
        setTimeout(() => {
            slot.classList.remove('spinning');
            slot.textContent = finalSymbols[index];
            
            // If this is the last slot
            if (index === slots.length - 1) {
                // Check for win
                if (finalSymbols.every(symbol => symbol === finalSymbols[0])) {
                    const winAmount = bet * 3;
                    updateBalance(balance + winAmount);
                    
                    // Add win animation
                    slots.forEach(slot => {
                        slot.classList.add('win-flash');
                        setTimeout(() => slot.classList.remove('win-flash'), 1500);
                    });
                    
                    setTimeout(() => alert(`🎉 You won ₹${winAmount}!`), 1600);
                }
                
                isSpinning = false;
                spinBtn.disabled = false;
            }
        }, 1000 + (index * 500)); // Staggered stop times
    });
}

spinBtn.addEventListener('click', spin);
