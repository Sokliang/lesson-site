// JavaScript
    let mainTimerInterval;
    let pageTimerInterval;
    let appliedMultiplier = 1; // Store the multiplier result

    // --- Initialization ---
    window.onload = function () {
      const twentyFiveMinutes = 60 * 25;
      const mainTimerDisplay = document.querySelector('#main-timer');
      if (mainTimerDisplay) startMainTimer(twentyFiveMinutes, mainTimerDisplay);
      showPage('page1'); // Start at page 1

      // Add event listener for terms checkbox
      const termsCheckbox = document.getElementById('termsCheckbox');
      const termsButton = document.getElementById('termsButton');
      if(termsCheckbox && termsButton){
          termsCheckbox.addEventListener('change', function() {
              termsButton.disabled = !this.checked;
          });
      }
    };

    // --- Navigation and Control ---
    function showPage(pageId) {
      clearInterval(pageTimerInterval);
      document.querySelectorAll('.container').forEach(div => div.style.display = 'none');
      const targetPage = document.getElementById(pageId);
      if (targetPage) {
        targetPage.style.display = 'block';
        window.scrollTo(0, 0); // Scroll to top of new page

        // Start page timer if applicable
        if (pageId === 'chapter1') startPageTimer(60, 'timer-chapter1', 'button-chapter1'); // 1:00
        else if (pageId === 'chapter2') startPageTimer(75, 'timer-chapter2', 'button-chapter2'); // 1:15
        else if (pageId === 'chapter3') startPageTimer(90, 'timer-chapter3', 'button-chapter3'); // 1:30

        // Update review page if showing page 9
        if (pageId === 'page9') {
            document.getElementById('reviewMultiplier').textContent = appliedMultiplier + 'x';
            document.getElementById('reviewFinalAmount').textContent = '$' + (100 * appliedMultiplier);
        }

      } else {
        console.error("Target page not found:", pageId);
      }
    }

    function showLoading(nextPageId, delay) {
       clearInterval(pageTimerInterval);
       showPage('loading');
       const loadingHeader = document.getElementById('loading-header');
       const loadingMessage = document.getElementById('loading-message');
       const statusEl = document.getElementById('loading-status');

       // Customize loading messages based on context
       let header = "Processing...";
       let msg = "Please wait.";
       let effectiveDelay = delay; // Use the provided delay by default

       if (nextPageId === 'chapter1') { header="Verifying Security..."; msg="Checking CAPTCHA results."; }
       else if (nextPageId === 'chapter2') { header="Saving Assessment..."; msg="Updating user profile data."; }
       else if (nextPageId === 'chapter3') { header="Calculating Bonus..."; msg="Applying multiplier results."; }
       else if (nextPageId === 'triggerWarning') {
           header="FINALIZING CLAIM...";
           msg="Submitting request to payment gateway... DO NOT CLOSE!";
           effectiveDelay = 45000; // Force LONG delay ONLY before the final trigger
       }

       loadingHeader.textContent = header;
       loadingMessage.textContent = msg;

       // Status updates
      const statuses = ["Connecting...", "Validating session...", "Checking parameters...", "Syncing data...", "Applying rules...", "Almost done..."];
      let statusInterval;
      if (statusEl) {
        statusEl.textContent = "Status: " + statuses[0];
        let statusCounter = 0;
        statusInterval = setInterval(() => {
             statusCounter = (statusCounter + 1) % statuses.length;
             statusEl.textContent = "Status: " + statuses[statusCounter];
        }, Math.max(1000, effectiveDelay / 10)); // Adjust frequency based on delay
        setTimeout(() => clearInterval(statusInterval), effectiveDelay - 300);
      }

      // Proceed after delay
      setTimeout(() => {
        clearInterval(statusInterval);
        if (nextPageId === 'triggerWarning') {
          triggerWarning();
        } else {
          showPage(nextPageId);
        }
      }, effectiveDelay); // Use the determined delay
    }

    // --- Timers ---
    function startMainTimer(duration, display) {
      let timer = duration, minutes, seconds;
      clearInterval(mainTimerInterval);
      mainTimerInterval = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        display.textContent = "Offer Expires In: " + minutes + ":" + seconds;
        if (--timer < 0) {
          clearInterval(mainTimerInterval);
          display.textContent = "OFFER EXPIRED!";
           const firstButton = document.querySelector('#page1 .fake-button');
           if(firstButton) { firstButton.disabled = true; firstButton.style.backgroundColor = '#ccc'; firstButton.textContent = 'Expired - Too Late!'; }
        }
      }, 1000);
    }

    function startPageTimer(duration, timerElementId, buttonElementId) {
        let timer = duration, minutes, seconds;
        const display = document.getElementById(timerElementId);
        const button = document.getElementById(buttonElementId);
        if (!display || !button) return;
        button.disabled = true;
        clearInterval(pageTimerInterval);
        pageTimerInterval = setInterval(function () {
            minutes = parseInt(timer / 60, 10); seconds = parseInt(timer % 60, 10);
            minutes = minutes < 10 ? "0" + minutes : minutes; seconds = seconds < 10 ? "0" + seconds : seconds;
            display.textContent = `Review Time Remaining: ${minutes}:${seconds}`;
            if (--timer < 0) {
                clearInterval(pageTimerInterval);
                display.textContent = "Review complete. You may proceed.";
                button.disabled = false;
            }
        }, 1000);
    }

    // --- New Step Logic ---
    function verifyCaptcha() {
        const correctCode = document.getElementById('captchaCode').textContent;
        const userInput = document.getElementById('captchaInput').value;
        const errorMsg = document.getElementById('captchaError');
        if (userInput === correctCode) {
            errorMsg.style.display = 'none';
            showLoading('chapter1', 2000); // Proceed if correct
        } else {
            errorMsg.style.display = 'block'; // Show error if incorrect
             // Optional: Regenerate captcha code on failure
             // document.getElementById('captchaCode').textContent = Math.random().toString(36).substring(2, 8).toUpperCase();
             document.getElementById('captchaInput').value = ''; // Clear input
        }
    }

    function spinMultiplier() {
        const spinButton = document.getElementById('spinButton');
        const resultDisplay = document.getElementById('multiplierResult');
        const continueButton = document.getElementById('bonusContinueButton');

        spinButton.disabled = true;
        spinButton.textContent = 'Spinning...';
        resultDisplay.style.display = 'none';
        continueButton.disabled = true; // Disable continue until spin finishes

        setTimeout(() => {
            // Always give a "good" result for the prank
            const multipliers = [1.5, 2, 2.5, 3]; // Added more options
            appliedMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];
            resultDisplay.textContent = `Multiplier Applied: ${appliedMultiplier}x! Your bonus is now $${(100 * appliedMultiplier).toFixed(2)}!`; // Use toFixed for currency
            resultDisplay.style.display = 'block';
            spinButton.textContent = 'SPIN AGAIN? (Nah)'; // Change text after spin
            // Keep spin button disabled after one use
            continueButton.disabled = false; // Enable continue button
        }, 1500); // Simulate spin time
    }

     function verifyFinalCode() {
        const correctCode = 'FINALIZE';
        const userInput = document.getElementById('humanCheck').value;
        const errorMsg = document.getElementById('finalCodeError');
        if (userInput === correctCode) {
            errorMsg.style.display = 'none';
            showLoading('triggerWarning', 5000); // Proceed to final loading -> prank (NOTE: showLoading forces 45s delay here)
        } else {
            errorMsg.style.display = 'block'; // Show error if incorrect
            document.getElementById('humanCheck').value = ''; // Clear input
        }
    }


    // --- Prank Warning Screen ---
    function triggerWarning() {
        clearInterval(mainTimerInterval);
        clearInterval(pageTimerInterval);
        document.querySelectorAll('.container').forEach(div => div.style.display = 'none');
        document.body.style.backgroundColor = '#000';

        const warning = document.getElementById('warning');
        warning.innerHTML = '';
        warning.style.display = 'block';

        let messages = [
             // --- User Provided Scary Messages ---
            { text: '[SYSTEM BREACH DETECTED]', speed: 100, class: 'warning-highlight flash' },
            { text: 'Initiating data extraction protocol...', speed: 150 },
            { text: 'IP Address Logged: 192.168.0.***', speed: 100, class: 'warning-dim' },
            { text: 'Telegram credentials intercepted...', speed: 120, class: 'warning-highlight' },
            { text: 'Downloading private messages...', speed: 200 },
            { text: 'Camera access granted...', speed: 100, class: 'warning-highlight' },
            { text: 'Capturing screenshot...', speed: 150 },
            { text: 'Uploading files to server [ ████████████ ] 100%', speed: 300, class: 'warning-dim' },
            { text: 'Stealing session cookies...', speed: 100 },
            { text: 'Encrypting device storage... INITIATED', speed: 150, class: 'warning-highlight' },
            { text: '...', speed: 500 },
            { text: '█▓▒░0x4A5C3B1D░▒▓█ █▓▒░0x7D3F2A9C░▒▓█ █▓▒░0x9E6D4F8A░▒▓█', speed: 200 },
            { text: 'WARNING: Unusual activity detected on your device.', speed: 100, class: 'warning-highlight' },
            { text: 'Your contacts list scraped... preparing notification.', speed: 180, class: 'warning-dim' },
            { text: 'Crypto wallet access in progress...', speed: 130, class: 'warning-highlight flash' },
            { text: 'ALL DATA COMPROMISED.', speed: 200, class: 'warning-highlight' },
            { text: '█ SYSTEM FAILURE █', speed: 250, class: 'warning-highlight' },
            { text: '█ YOU HAVE BEEN HACKED █', speed: 300, class: 'warning-highlight flash' },
            { text: ' ', speed: 500 }, // Add a small pause/space

            // --- Existing Reflective/Analytical Messages ---
            { text: 'Analyzing system response to simulated breach...', speed: 300},
            { text: 'Connection Anomaly Detected: X-Powered-By: PRANKSTER/2.0-Expanded', speed: 100, class: 'warning-highlight' },
            { text: 'Re-routing connection through multi-layer analysis proxy...', speed: 200 },
            { text: 'Proxy Response: 418 I\'m a teapot (RFC 2324) / Policy: Excessive Time Wasted', speed: 150, class: 'warning-dim' }, // Combined response
            { text: 'WARNING: Automated system flagged session for unusual duration & persistence!', speed: 50, class: 'warning-highlight' },
            { text: 'Initiating counter-protocol: WASTE_AUDIT v3.1...', speed: 150 },
            { text: 'Calculating time spent navigating non-essential steps...', speed: 300 },
            { text: '[+] Audit Results: Significant time invested in 9+ simulated tasks.', speed: 100, class: 'warning-dim' },
            { text: 'Cross-referencing engagement patterns with known scammer profiles...', speed: 250 },
            { text: 'Pattern Match: High probability match based on persistence and interaction with bait.', speed: 100 },
            { text: '[!] Activating Enhanced Reflection Module based on extended interaction...', speed: 150, class: 'warning-highlight flash' },
            { text: 'Running deep self-assessment script: /usr/bin/really_think_about_it.pl', speed: 200 },
            { text: 'Script Output:', speed: 100 },
            { text: '...', speed: 500 },
            { text: '>$ Total steps completed: 9 + Final Confirmation.', speed: 100, class: 'warning-dim' },
            { text: '>$ Mandatory wait time imposed: ~4 minutes (excluding loading/interaction).', speed: 100, class: 'warning-dim' },
            { text: '>$ Potential earnings from legitimate work during this *entire* session: ???', speed: 100, class: 'warning-dim' },
            { text: '>$ Lesson reinforced: Your time has value. Don\'t waste it chasing shadows or tricking others.', speed: 100, class: 'warning-highlight' },
            { text: 'Injecting reminder payload: life_choices.txt', speed: 150 },
            { text: 'Payload Content: "Seriously, go learn coding or something productive. Way better ROI. 😉"', speed: 100 },
            { text: 'Scrubbing session logs (no actual data was ever collected).', speed: 150 },
            { text: 'Closing connection gracefully.', speed: 150 },
            { text: `
        ██╗   ██╗ ██████╗ ██╗   ██╗      ██╗  ██╗ ███████╗ ███████╗ ██╗  ██╗
        ██║   ██║██╔════╝ ██║   ██║      ██║  ██║ ██╔════╝ ██╔════╝ ██║ ██╔╝
        ██║   ██║██║  ███╗██║   ██║      ███████║ ███████╗ ███████╗ █████╔╝
        ██║   ██║██║   ██║██║   ██║      ██╔══██║ ╚════██║ ╚════██║ ██╔═██╗
        ╚██████╔╝╚██████╔╝╚██████╔╝      ██║  ██║ ███████║ ███████║ ██║  ██╗
         ╚═════╝  ╚═════╝  ╚═════╝       ╚═╝  ╚═╝ ╚══════╝ ╚══════╝ ╚═╝  ╚═╝
           `, speed: 300 },
            { text: 'End of the line. Hope the extended tutorial was... illuminating.', speed: 150},
            { text: 'No bonus, no hack, just a lot of clicks and maybe some thinking.', speed: 150},
            { text: 'Be safe, be smart, be better.', speed: 500 },
            { text: '[Host Terminated Session - Reason: Educational Purposes]', speed: 200 }
        ];

        let totalDelay = 0;
        messages.forEach((msgData) => {
            setTimeout(() => {
            const div = document.createElement('div');
            // Handle potential multi-line strings from ASCII art correctly
            div.textContent = msgData.text;
            div.className = 'warning-line';
            if (msgData.class) div.classList.add(...msgData.class.split(' '));
            warning.appendChild(div);
            warning.scrollTop = warning.scrollHeight; // Auto-scroll to bottom
            }, totalDelay);
            totalDelay += msgData.speed;
        });
    }
