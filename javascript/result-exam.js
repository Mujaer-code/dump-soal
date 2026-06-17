window.userAnswers = [];
let questionCount = 0;
let questionOrder = [];

let userAnswers = new Array(questions.length).fill(null);


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
