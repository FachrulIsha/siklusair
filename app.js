(function () {
    'use strict';

    // ==========================================
    // STATE & STORAGE
    // ==========================================
    var STORAGE_KEY = 'aquaquest_v3';
    var state = {
        materiDone: false, game1Done: false, game2Done: false, quizDone: false, kalkulatorDone: false,
        quizScore: 0, leakScore: 0, cbScore: 0, userXP: 0, userName: ''
    };

    function loadState() {
        try {
            var s = localStorage.getItem(STORAGE_KEY);
            if (s) { var p = JSON.parse(s); for (var k in p) { if (state.hasOwnProperty(k)) state[k] = p[k]; } }
        } catch (e) {}
    }
    function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

    function addXP(amount) {
        state.userXP += amount;
        saveState();
        updateXPBar();
        showToast('+' + amount + ' XP!', 'success');
    }

    function updateXPBar() {
        var xpVal = document.getElementById('xp-value');
        var xpFill = document.getElementById('xp-fill');
        var xpLevel = document.getElementById('xp-level');
        if (xpVal) xpVal.textContent = state.userXP + ' XP';
        var level = Math.floor(state.userXP / 50) + 1;
        if (xpLevel) xpLevel.textContent = 'Lv ' + level;
        var pctInLevel = ((state.userXP % 50) / 50) * 100;
        if (xpFill) xpFill.style.width = pctInLevel + '%';
    }

    function getProgressPercent() {
        var total = 0;
        if (state.materiDone) total += 20;
        if (state.game1Done) total += 20;
        if (state.game2Done) total += 20;
        if (state.quizDone) total += 20;
        if (state.kalkulatorDone) total += 20;
        return total;
    }

    function updateProgressBar() {
        var pct = getProgressPercent();
        var fill = document.getElementById('progress-fill');
        var text = document.getElementById('progress-percent');
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = pct + '%';
    }

    loadState();

    // ==========================================
    // SCREEN ROUTING
    // ==========================================
    var allScreens = document.querySelectorAll('.screen');

    function showScreen(id) {
        for (var i = 0; i < allScreens.length; i++) allScreens[i].classList.remove('active');
        var t = document.getElementById(id);
        if (t) { t.classList.add('active'); window.scrollTo(0, 0); }
        if (id === 'screen-dashboard') updateProgressBar();
    }

    // ==========================================
    // FEEDBACK TOAST
    // ==========================================
    var toast = document.getElementById('feedback-toast');
    var toastText = document.getElementById('feedback-text');
    var toastTimer = null;

    function showToast(msg, type) {
        if (!toast || !toastText) return;
        toastText.textContent = msg;
        toast.className = 'feedback-toast show';
        if (type) toast.classList.add(type);
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
    }

    // ==========================================
    // PARALLAX on Dashboard
    // ==========================================
    var dashWrap = document.getElementById('dashboard-wrapper');
    if (dashWrap) {
        dashWrap.addEventListener('mousemove', function (e) {
            var rect = dashWrap.getBoundingClientRect();
            var x = (e.clientX - rect.left) / rect.width - 0.5;
            var y = (e.clientY - rect.top) / rect.height - 0.5;

            var sky = document.getElementById('plx-sky');
            var clouds = document.getElementById('plx-clouds');
            var mountains = document.getElementById('plx-mountains');

            if (sky) sky.style.transform = 'translate(' + (x * -4) + 'px,' + (y * -3) + 'px)';
            if (clouds) clouds.style.transform = 'translate(' + (x * -12) + 'px,' + (y * -8) + 'px)';
            if (mountains) mountains.style.transform = 'translate(' + (x * -6) + 'px,' + (y * -4) + 'px)';
        });

        dashWrap.addEventListener('mouseleave', function () {
            var sky = document.getElementById('plx-sky');
            var clouds = document.getElementById('plx-clouds');
            var mountains = document.getElementById('plx-mountains');
            if (sky) sky.style.transform = '';
            if (clouds) clouds.style.transform = '';
            if (mountains) mountains.style.transform = '';
        });
    }

    // ==========================================
    // DASHBOARD NAVIGATION
    // ==========================================
    document.getElementById('btn-belajar').addEventListener('click', function () {
        showScreen('screen-materi');
        if (!state.materiDone) { state.materiDone = true; saveState(); addXP(10); }
    });

    document.getElementById('btn-kalkulator').addEventListener('click', function () {
        showScreen('screen-kalkulator');
    });

    var gameMenuModal = document.getElementById('game-menu-modal');
    document.getElementById('btn-game-menu').addEventListener('click', function () { gameMenuModal.classList.add('show'); });
    document.getElementById('game-menu-close').addEventListener('click', function () { gameMenuModal.classList.remove('show'); });
    document.getElementById('btn-game1-go').addEventListener('click', function () { gameMenuModal.classList.remove('show'); showScreen('screen-game1'); });
    document.getElementById('btn-game2-go').addEventListener('click', function () { gameMenuModal.classList.remove('show'); showScreen('screen-game2'); resetLeakGame(); });
    document.getElementById('btn-quiz-go').addEventListener('click', function () { showScreen('screen-quiz'); resetQuiz(); });

    // Back buttons
    ['back-materi', 'back-kalkulator', 'back-game1', 'back-game2', 'back-quiz', 'back-cert'].forEach(function (id) {
        var btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', function () { showScreen('screen-dashboard'); });
    });

    // ==========================================
    // MATERI TABS
    // ==========================================
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
            document.querySelectorAll('.tab-content').forEach(function (c) { c.classList.remove('active'); });
            btn.classList.add('active');
            var el = document.getElementById(target);
            if (el) el.classList.add('active');
        });
    });

    // ==========================================
    // MIKROSKOP DIGITAL
    // ==========================================
    var samples = document.querySelectorAll('.glass-sample');
    var mikroInfo = document.getElementById('mikroskop-info');

    samples.forEach(function (sample) {
        sample.addEventListener('click', function () {
            // Close all other lenses
            document.querySelectorAll('.lens-overlay').forEach(function (l) { l.classList.remove('show'); });
            // Toggle this lens
            var lens = sample.querySelector('.lens-overlay');
            if (lens) lens.classList.add('show');

            var name = sample.getAttribute('data-name');
            var content = sample.getAttribute('data-content');
            var safe = sample.getAttribute('data-safe');

            if (mikroInfo) {
                mikroInfo.textContent = name + ': ' + content;
                mikroInfo.style.color = safe === 'true' ? '#2D6A4F' : safe === 'false' ? '#E63946' : '#F4A261';
            }
        });
    });

    // Close lenses when clicking outside
    document.addEventListener('click', function (e) {
        if (!e.target.closest('.glass-sample')) {
            document.querySelectorAll('.lens-overlay').forEach(function (l) { l.classList.remove('show'); });
            if (mikroInfo) { mikroInfo.textContent = 'Klik salah satu gelas untuk memeriksanya!'; mikroInfo.style.color = ''; }
        }
    });

    // ==========================================
    // KALKULATOR JEJAK AIR
    // ==========================================
    var waterRates = { mandi: 15, gigi: 2, cuci: 1 };
    var kalkulatorVals = { mandi: 1, gigi: 2, cuci: 5 };

    document.querySelectorAll('.kalku-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var targetId = btn.getAttribute('data-target');
            var key = targetId.replace('val-', '');
            if (key === 'gigi') key = 'gigi';
            var valEl = document.getElementById(targetId);
            if (!valEl) return;

            var mappedKey = targetId === 'val-mandi' ? 'mandi' : targetId === 'val-gigi' ? 'gigi' : 'cuci';
            var current = kalkulatorVals[mappedKey];

            if (btn.classList.contains('plus')) {
                current++;
            } else {
                current = Math.max(0, current - 1);
            }

            kalkulatorVals[mappedKey] = current;
            valEl.textContent = current;
        });
    });

    document.getElementById('btn-hitung').addEventListener('click', function () {
        var total = (kalkulatorVals.mandi * waterRates.mandi) +
                    (kalkulatorVals.gigi * waterRates.gigi) +
                    (kalkulatorVals.cuci * waterRates.cuci);

        var resultEl = document.getElementById('kalku-result');
        var litersEl = document.getElementById('result-liters');
        var feedbackEl = document.getElementById('kalku-feedback');

        if (resultEl) resultEl.style.display = 'block';
        if (litersEl) litersEl.textContent = total;

        var feedback = '';
        if (total <= 20) {
            feedback = 'Hebat! Kamu sangat hemat air! Terus jaga kebiasaan baikmu!';
            showToast('Hebat, Kamu Hemat!', 'success');
        } else if (total <= 40) {
            feedback = 'Lumayan baik! Tapi masih bisa lebih hemat lagi. Coba kurangi waktu mandi!';
            showToast('Lumayan Hemat!', 'success');
        } else {
            feedback = 'Waduh, kamu boros air! Coba matikan keran saat gosok gigi dan mandi lebih cepat.';
            showToast('Waduh, Boros Air!', 'error');
        }
        if (feedbackEl) feedbackEl.textContent = feedback;

        if (!state.kalkulatorDone) {
            state.kalkulatorDone = true;
            saveState();
            addXP(10);
        }
    });

    // ==========================================
    // CLOUD BUILDER (Drag & Drop)
    // ==========================================
    var cbLabels = document.querySelectorAll('.cb-label');
    var cbDropzones = document.querySelectorAll('.cb-dropzone');
    var cbResult = document.getElementById('cb-result');
    var cbCorrectCount = 0;
    var cbTotalZones = 3;
    var draggedLabel = null;

    cbLabels.forEach(function (label) {
        label.addEventListener('dragstart', function (e) {
            draggedLabel = label;
            e.dataTransfer.setData('text/plain', label.getAttribute('data-type'));
            setTimeout(function () { label.style.opacity = '0.5'; }, 0);
        });
        label.addEventListener('dragend', function () { label.style.opacity = '1'; draggedLabel = null; });

        // Touch support
        var clone = null;
        label.addEventListener('touchstart', function (e) {
            draggedLabel = label;
            clone = label.cloneNode(true);
            clone.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;opacity:0.85;width:' + label.offsetWidth + 'px;transform:scale(1.1)';
            document.body.appendChild(clone);
            posClone(e.touches[0]);
        }, { passive: false });
        label.addEventListener('touchmove', function (e) {
            e.preventDefault();
            if (!clone) return;
            posClone(e.touches[0]);
            cbDropzones.forEach(function (dz) {
                var r = dz.getBoundingClientRect();
                var t = e.touches[0];
                dz.classList.toggle('drag-over', t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom);
            });
        }, { passive: false });
        label.addEventListener('touchend', function (e) {
            if (clone) { document.body.removeChild(clone); clone = null; }
            var t = e.changedTouches[0];
            cbDropzones.forEach(function (dz) {
                dz.classList.remove('drag-over');
                var r = dz.getBoundingClientRect();
                if (t.clientX >= r.left && t.clientX <= r.right && t.clientY >= r.top && t.clientY <= r.bottom) {
                    handleCBDrop(dz, label.getAttribute('data-type'), label);
                }
            });
            draggedLabel = null;
        });
        function posClone(touch) { if (clone) { clone.style.left = (touch.clientX - clone.offsetWidth / 2) + 'px'; clone.style.top = (touch.clientY - 20) + 'px'; } }
    });

    cbDropzones.forEach(function (dz) {
        dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('drag-over'); });
        dz.addEventListener('dragleave', function () { dz.classList.remove('drag-over'); });
        dz.addEventListener('drop', function (e) { e.preventDefault(); dz.classList.remove('drag-over'); handleCBDrop(dz, e.dataTransfer.getData('text/plain'), draggedLabel); });
    });

    function handleCBDrop(dz, type, labelEl) {
        if (type === dz.getAttribute('data-expect')) {
            dz.classList.add('correct');
            if (labelEl) labelEl.classList.add('placed');
            cbCorrectCount++;
            showToast('Benar! Hebat!', 'success');
            addXP(5);
            if (type === 'evaporasi') { animSVG('cb-evap', 1, 800); animSVG('cb-sun', null, null, function (el) { el.setAttribute('opacity', '0.95'); }); animSVG('cb-sun-rays', null, null, function (el) { el.setAttribute('opacity', '0.5'); }); }
            else if (type === 'kondensasi') { animSVG('cb-cloud', 1, 800); }
            else if (type === 'presipitasi') { animSVG('cb-cloud', 1, 400); setTimeout(function () { animSVG('cb-rain', 1, 600); }, 300); }

            if (cbCorrectCount >= cbTotalZones) {
                setTimeout(function () {
                    if (cbResult) cbResult.textContent = 'Luar biasa! Siklus air lengkap!';
                    state.game1Done = true; state.cbScore = 100; saveState(); addXP(15);
                }, 800);
            }
        } else {
            showToast('Ayo Coba Lagi! Itu bukan tempatnya.', 'error');
            dz.classList.add('shake'); setTimeout(function () { dz.classList.remove('shake'); }, 500);
        }
    }

    function animSVG(id, tOp, dur, fn) {
        var el = document.getElementById(id); if (!el) return;
        if (fn) { fn(el); return; } if (tOp == null) return;
        var cur = parseFloat(el.getAttribute('opacity')) || 0;
        var diff = tOp - cur; var d = dur || 500; var start = null;
        function step(ts) {
            if (!start) start = ts;
            var p = Math.min((ts - start) / d, 1);
            el.setAttribute('opacity', cur + diff * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // ==========================================
    // STOP THE LEAK
    // ==========================================
    var leakSpots = document.querySelectorAll('.leak-spot');
    var leakTimerEl = document.getElementById('leak-timer');
    var leakScoreEl = document.getElementById('leak-score');
    var btnStartLeak = document.getElementById('btn-start-leak');
    var leakResultEl = document.getElementById('leak-result');
    var leakInterval = null, leakTime = 30, leakFixed = 0, leakTotal = 6, leakActive = false;

    function resetLeakGame() {
        clearInterval(leakInterval);
        leakTime = 30; leakFixed = 0; leakActive = false;
        if (leakTimerEl) leakTimerEl.textContent = '30';
        if (leakScoreEl) leakScoreEl.textContent = '0';
        if (leakResultEl) leakResultEl.textContent = '';
        if (btnStartLeak) { btnStartLeak.style.display = 'inline-flex'; btnStartLeak.textContent = 'Mulai Misi!'; }
        leakSpots.forEach(function (s) { s.classList.remove('fixed'); s.setAttribute('data-fixed', 'false'); });
    }

    if (btnStartLeak) {
        btnStartLeak.addEventListener('click', function () {
            if (leakActive) return;
            leakActive = true;
            btnStartLeak.style.display = 'none';
            showToast('Misi dimulai! Klik kebocorannya!', 'success');
            leakInterval = setInterval(function () {
                leakTime--;
                if (leakTimerEl) leakTimerEl.textContent = leakTime;
                if (leakTime <= 0) { clearInterval(leakInterval); leakActive = false; endLeakGame(); }
            }, 1000);
        });
    }

    leakSpots.forEach(function (spot) {
        spot.addEventListener('click', function () {
            if (!leakActive || spot.getAttribute('data-fixed') === 'true') return;
            spot.setAttribute('data-fixed', 'true');
            spot.classList.add('fixed');
            leakFixed++;
            if (leakScoreEl) leakScoreEl.textContent = leakFixed * 8;
            showToast('Diperbaiki! +8 Liter', 'success');
            addXP(3);
            if (leakFixed >= leakTotal) { clearInterval(leakInterval); leakActive = false; endLeakGame(); }
        });
    });

    function endLeakGame() {
        var liters = leakFixed * 8;
        var msg = leakFixed >= leakTotal ?
            'Luar biasa! Semua diperbaiki! ' + liters + ' Liter terselamatkan!' :
            'Waktu habis! ' + leakFixed + '/' + leakTotal + ' diperbaiki. ' + liters + ' Liter terselamatkan.';
        if (leakResultEl) leakResultEl.textContent = msg;
        state.game2Done = true; state.leakScore = liters; saveState();
        if (leakFixed >= leakTotal) addXP(20);
        else addXP(5);
    }

    // ==========================================
    // QUIZ (10 Questions - Basic + HOTS)
    // ==========================================
    var quizQuestions = [
        { q: 'Apa nama proses air laut berubah menjadi uap?', options: ['Evaporasi', 'Infiltrasi'], answer: 0 },
        { q: 'Ke mana air sungai akhirnya pergi?', options: ['Ke atas gunung', 'Ke laut'], answer: 1 },
        { q: 'Awan yang berat dan gelap akan menyebabkan...', options: ['Pelangi', 'Presipitasi / Hujan'], answer: 1 },
        { q: 'Mengapa kita harus mematikan keran saat gosok gigi?', options: ['Biar tidak berisik', 'Menghemat air bersih'], answer: 1 },
        { q: 'Air yang meresap ke dalam tanah disebut...', options: ['Infiltrasi', 'Kondensasi'], answer: 0 },
        // HOTS
        { q: 'Mengapa daerah resapan air (hutan) sangat penting bagi siklus air?', options: ['Karena hutan itu indah', 'Karena hutan membantu proses infiltrasi agar air meresap ke tanah'], answer: 1 },
        { q: 'Jika semua air laut menguap, apakah air hujan akan terasa asin?', options: ['Ya, karena berasal dari laut', 'Tidak, karena hanya air murni yang menguap saat evaporasi'], answer: 1 },
        { q: 'Apa perbedaan evaporasi dan transpirasi?', options: ['Evaporasi dari air, transpirasi dari tumbuhan', 'Keduanya sama saja'], answer: 0 },
        { q: 'Apa yang terjadi jika hujan turun di tanah yang tertutup beton/aspal?', options: ['Air meresap dengan cepat', 'Air tidak bisa meresap, menyebabkan banjir'], answer: 1 },
        { q: 'Manakah yang merupakan syarat air bersih yang layak diminum?', options: ['Berasa manis dan berwarna biru', 'Tidak berasa, tidak berbau, tidak berwarna'], answer: 1 }
    ];

    var quizCurrent = 0, quizLives = 3, quizCorrect = 0, quizAnswered = false;
    var quizQuestion = document.getElementById('quiz-question');
    var quizOptions = document.getElementById('quiz-options');
    var quizProgressText = document.getElementById('quiz-progress-text');
    var quizHeartsEl = document.getElementById('quiz-hearts');
    var quizFeedbackArea = document.getElementById('quiz-feedback-area');
    var quizGameover = document.getElementById('quiz-gameover');
    var quizCard = document.getElementById('quiz-card');

    function resetQuiz() {
        quizCurrent = 0; quizLives = 3; quizCorrect = 0; quizAnswered = false;
        if (quizGameover) quizGameover.classList.remove('show');
        if (quizCard) quizCard.style.display = 'block';
        if (quizFeedbackArea) quizFeedbackArea.textContent = '';
        if (quizHeartsEl) quizHeartsEl.querySelectorAll('.heart-icon').forEach(function (h) { h.classList.remove('lost', 'shake-heart'); });
        renderQuizQ();
    }

    function renderQuizQ() {
        if (quizCurrent >= quizQuestions.length) { endQuiz(); return; }
        quizAnswered = false;
        var q = quizQuestions[quizCurrent];
        if (quizProgressText) quizProgressText.textContent = 'Soal ' + (quizCurrent + 1) + ' / ' + quizQuestions.length;
        if (quizQuestion) quizQuestion.textContent = q.q;
        if (quizFeedbackArea) quizFeedbackArea.textContent = '';
        if (quizOptions) {
            quizOptions.innerHTML = '';
            ['A', 'B'].forEach(function (letter, idx) {
                var btn = document.createElement('button');
                btn.className = 'quiz-option'; btn.type = 'button';
                btn.innerHTML = '<span class="opt-letter">' + letter + '</span><span>' + q.options[idx] + '</span>';
                btn.addEventListener('click', function () { handleQuizA(idx, btn); });
                quizOptions.appendChild(btn);
            });
        }
    }

    function handleQuizA(sel, btnEl) {
        if (quizAnswered) return;
        quizAnswered = true;
        var q = quizQuestions[quizCurrent];
        var allBtns = quizOptions.querySelectorAll('.quiz-option');
        allBtns.forEach(function (b) { b.classList.add('disabled'); });

        if (sel === q.answer) {
            btnEl.classList.add('correct');
            quizCorrect++;
            showToast('Benar! Hebat!', 'success');
            if (quizFeedbackArea) quizFeedbackArea.textContent = 'Jawaban benar! Keren!';
            addXP(5);
        } else {
            btnEl.classList.add('wrong');
            allBtns[q.answer].classList.add('correct');
            quizLives--;
            showToast('Salah! Coba lebih teliti!', 'error');
            if (quizFeedbackArea) quizFeedbackArea.textContent = 'Jawabannya: ' + q.options[q.answer];
            if (quizHeartsEl) {
                var hearts = quizHeartsEl.querySelectorAll('.heart-icon');
                if (hearts[quizLives]) hearts[quizLives].classList.add('lost', 'shake-heart');
            }
            if (quizLives <= 0) {
                setTimeout(function () {
                    if (quizCard) quizCard.style.display = 'none';
                    if (quizGameover) quizGameover.classList.add('show');
                }, 1200);
                return;
            }
        }
        setTimeout(function () { quizCurrent++; renderQuizQ(); }, 1800);
    }

    function endQuiz() {
        if (quizCard) quizCard.style.display = 'none';
        if (quizFeedbackArea) quizFeedbackArea.textContent = 'Kuis selesai! Skor: ' + quizCorrect + '/' + quizQuestions.length;
        state.quizDone = true; state.quizScore = quizCorrect; saveState();
        addXP(20);
        setTimeout(function () {
            if (quizFeedbackArea) {
                var btn = document.createElement('button');
                btn.className = 'btn-primary'; btn.type = 'button'; btn.textContent = 'Lihat Sertifikat'; btn.style.marginTop = '14px';
                btn.addEventListener('click', function () { showScreen('screen-cert'); populateCert(); });
                quizFeedbackArea.appendChild(document.createElement('br'));
                quizFeedbackArea.appendChild(btn);
            }
        }, 500);
    }

    document.getElementById('btn-retry-quiz').addEventListener('click', function () { resetQuiz(); });
    renderQuizQ();

    // ==========================================
    // CERTIFICATE
    // ==========================================
    var inputNama = document.getElementById('input-nama');
    var certNamaDisplay = document.getElementById('cert-nama-display');

    if (inputNama) {
        inputNama.addEventListener('input', function () {
            var name = inputNama.value.trim() || 'Sang Penjaga Mata Air';
            if (certNamaDisplay) certNamaDisplay.textContent = name;
            state.userName = inputNama.value.trim();
            saveState();
        });
        if (state.userName) inputNama.value = state.userName;
    }

    function populateCert() {
        loadState();
        document.getElementById('cert-xp').textContent = state.userXP;
        document.getElementById('cert-quiz-score').textContent = state.quizScore + ' / ' + quizQuestions.length;
        document.getElementById('cert-leak-score').textContent = state.leakScore + ' Liter';
        if (certNamaDisplay) certNamaDisplay.textContent = state.userName || 'Sang Penjaga Mata Air';
        if (inputNama && state.userName) inputNama.value = state.userName;
        var certDate = document.getElementById('cert-date');
        if (certDate) {
            var n = new Date();
            var m = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
            certDate.textContent = n.getDate() + ' ' + m[n.getMonth()] + ' ' + n.getFullYear();
        }
    }

    document.getElementById('btn-cetak').addEventListener('click', function () { window.print(); });

    // ==========================================
    // INIT
    // ==========================================
    updateXPBar();
    updateProgressBar();

})();
