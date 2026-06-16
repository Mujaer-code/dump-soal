window.isReviewMode = true; 
window.userAnswers = [];
let questionCount = 0;
let questionOrder = [];

const gridResult = document.getElementById('grid-result');

let userAnswers = new Array(questions.length).fill(null);


window.isReviewMode = true;

// Fungsi utama untuk merender data yang ditarik dari Firebase
window.renderHasilUjian = function(dataFirebase) {
    // Ambil data dari auth.js
    const { jawabanUser, benar, totalSoal, skorTotal, namaKategori, scoreKategori, benarKategori, totalKategori  } = dataFirebase;

    // PASTIKAN window.questions SUDAH ADA
    if (!window.questions || window.questions.length === 0) {
        console.error("EROR: Data soal (questions) tidak ditemukan di window!");
        return;
    }

    questionOrder = window.questions.map((_, i) => i);

    // Mengembalikan jawawabn index ke string
    window.userAnswers = jawabanUser.map((idx, i) => {
        if (idx === -1 || idx === undefined || !window.questions[i]) return null;
        return window.questions[i].options[idx];
    });

    // Update Skor 
    if (document.getElementById('score-text')) document.getElementById('score-text').innerText = skorTotal;
    if (document.getElementById('correct-stat')) document.getElementById('correct-stat').innerText = benar;
    if (document.getElementById('total-stat')) document.getElementById('total-stat').innerText = totalSoal;

    setProgress(skorTotal);

    // Update Detail Kategori
const detailContainer = document.querySelector('.category-detail');

if (detailContainer && namaKategori) {
    detailContainer.innerHTML = namaKategori.map((cat, i) => {
        const benar = benarKategori[i];
        const total = totalKategori[i];
        const persen = Math.round((benar / total) * 100);
        const warna = persen >= 50 ? '#58cc02' : '#E24B4A';

        return `
            <div class="category-item">
                <div class = "category-title">
                    <span>${cat}</span>
                    <span>${benar} / ${total} — ${persen}%</span>
                </div>
                <div class="category-progress">
                    <div style="width: ${persen}%; background: ${warna};"></div>
                </div>
            </div>`;
    }).join('');
}

    
    initGridResult();
    showQuestions(0, true);
};


  
 function updateGridResultStatus() {
    const allQuestions = window.questions;
    
    document.querySelectorAll('.grid-item-result').forEach(el => el.classList.remove('active'));
    const currentNav = document.getElementById(`nav-${questionCount}`);
    if(currentNav) currentNav.classList.add('active');

    allQuestions.forEach((_, idx) => {
        const nav = document.getElementById(`nav-${idx}`);
        if(!nav) return;

        nav.classList.remove('correct-nav', 'wrong-nav', 'unanswered-nav');

        const userAns = window.userAnswers[idx];
        const correctAns = allQuestions[idx].answer;

        if (userAns === null || userAns === undefined) {
            nav.classList.add('unanswered-nav');
        } else if (userAns === correctAns) {
            nav.classList.add('correct-nav');
        } else {
            nav.classList.add('wrong-nav');
        }
    });
}

function initGridResult() {
    if (!gridResult) return;
    gridResult.innerHTML = '';
    
    window.questions.forEach((_, index) => {
        const btn = document.createElement('div'); 
        btn.className = 'grid-item-result'; 
        btn.innerText = index + 1;
        btn.id = `nav-${index}`; 
        
        btn.onclick = () => { 
            questionCount = index; 
            showQuestions(index, true);
            updateGridResultStatus(); 
        };
        gridResult.appendChild(btn); 
    });
    updateGridResultStatus();
}

function showQuestions(index, isResultPage = false) {
    if (!window.questions[index]) return;
    
    const currentQuestion = window.questions[index];
    const currentNumbers = document.querySelectorAll('.current-number');
    currentNumbers.forEach(el => { el.innerText = `Soal ${index + 1}`; });
    
    const questionText = document.querySelector('.question-text-result');
    const optionList = document.querySelector('.option-list-result');

    if(!questionText || !optionList) return; 

    // Tampilkan Pertanyaan
    questionText.innerHTML = `<p>${currentQuestion.question}</p>` + 
        (currentQuestion.img ? `<div class="question-image-container"><img src="assets/${currentQuestion.img}" style="max-width: 100%;"></div>` : '');

    // Tampilkan Opsi dengan Warna
    let optionTag = '';

    currentQuestion.options.forEach((opt, i) => {
        let statusClass = '';
        const isCorrect = (opt === currentQuestion.answer);
        const isUserChoice = (window.userAnswers[index] === opt);

        if (isCorrect)  statusClass = 'correct-opt';

        else if (isUserChoice && !isCorrect) statusClass = 'wrong-opt';

        optionTag += `
            <div class="option ${statusClass}">
                <span class="circle"><div></div></span>
                <span>${opt}</span>
            </div>`;
    });
    optionList.innerHTML = optionTag;

    // Update Pembahasan
    const explaText = document.querySelector('.explanation-text');
    if (explaText) {
        const text = currentQuestion.explanation || "Tidak ada penjelasan.";
        const expaImg = currentQuestion.expImg 
            ? `<div class="explanation-img"><img src="assets/${currentQuestion.expImg}"></div>` 
            : '';

        explaText.innerHTML = text + expaImg;
    }
        //fungsi memunculkan Correct Mark di ujung question
        const correctMark = document.querySelector('.correct-mark');
        if (window.userAnswers[index] === currentQuestion.answer) {
           correctMark.style.display = 'block';}
        else {
            correctMark.style.display = 'none'
        }
       
}

//Fungsi keyboard next/previous arrow
document.addEventListener('keydown', (event) => {
    
    if (event.key === "ArrowRight") {
         if(questionCount < questions.length - 1) {
            questionCount++;
            showQuestions(questionCount);
            updateGridResultStatus();
    }
        
        // console.log("Right arrow key pressed!");
    }

    else if (event.key === "ArrowLeft"){
        if (questionCount > 0) {
            questionCount--;
            showQuestions(questionCount);
            updateGridResultStatus();
        }

        // console.log("Left arrow key pressed!"); 
    }
});



function setProgress(score) {
    const circle = document.querySelector('.meter');
    const text = document.getElementById('score-text');
    
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    circle.style.strokeDashoffset = offset;
    text.innerText = score;
}

const nextBtn = document.querySelector('.next');
const prevBtn = document.querySelector('.previous');


function scrollToFeatures() {
    const element = document.querySelector(".quiz-result");
    const offset = 80; 
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    
    window.scrollTo({ top: top, behavior: "smooth" });
}

// Next Button
nextBtn.onclick = () => {
  if(questionCount < questions.length - 1) {
    questionCount++;
    showQuestions(questionCount);
    updateGridResultStatus();
    scrollToFeatures();
  }
}

prevBtn.onclick = () => {
  if (questionCount > 0) {
    questionCount--;
    showQuestions(questionCount);
    updateGridResultStatus();
    scrollToFeatures();
  }
};

function handleSearch() {
    let input = document.querySelector('.searchInput').value;
    let resultList = document.getElementById('results');
    let count = 0;

    resultList.innerHTML = "";
    if (input.trim() === "") return;

    const keywords = input.toLowerCase().split(" ").filter(w => w.length > 0);

    // highlight kata yang dicari
    function highlightText(text, keywords) {
        let result = text;
        keywords.forEach(word => {
            const regex = new RegExp(`(${word})`, 'gi');
            result = result.replace(regex, '<mark>$1</mark>');
        });
        return result;
    }

    // strip HTML tag untuk matching, tapi tetap tampilkan versi highlight
    function stripHTML(html) {
        return html.replace(/<[^>]*>/g, '');
    }

    questions.forEach((item, originalIndex) => {
        if (count >= 5) return; //agar maksimal yang ditampilkan 5

        const plainText = stripHTML(item.question).toLowerCase();
        const isMatch = keywords.every(word => plainText.includes(word));

        if (isMatch) {
            count++;

            const highlighted = highlightText(stripHTML(item.question), keywords);

            const div = document.createElement('div');
            div.className = 'result-item';
            div.innerHTML = `
                <div class="result-top">
                    <span class="result-num">Soal ${originalIndex + 1}</span>
                    <span class="result-cat">${item.category || ''}</span>
                </div>
                <p class="result-text">${highlighted}</p>
            `;

            div.onclick = () => {
                questionCount = originalIndex;
                showQuestions(originalIndex, true);
                updateGridResultStatus();
                resultList.innerHTML = "";
                document.querySelector('.searchInput').value = "";
            };

            resultList.appendChild(div);
        }
    });

    if (count === 0) {
        resultList.innerHTML = `<div class="empty">Soal tidak ditemukan</div>`;
    }
}

function clearSearch() {
    let input = document.querySelector('.searchInput');
    let resultList = document.getElementById('results');
    resultList.innerHTML = "";
    input.value = "";
}


    window.handleSearch = handleSearch;
    window.clearSearch = clearSearch;
    window.showQuestions = showQuestions;
    window.initGridResult = initGridResult;
    window.updateGridResultStatus = updateGridResultStatus;
    window.setProgress = setProgress;
