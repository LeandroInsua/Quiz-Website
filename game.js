const BASE_PATH = window.location.hostname.includes('github.io') 
    ? 'leandroinsua.github.io/Quiz-Website/'   // Change only this if your repo name ever changes
    : '/';               // Local development

/* QUIZ OPTIONS */
const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text"));
const nextQuestion = document.getElementById('next-question-btn')
const hiddenBtns = document.querySelectorAll(".hidden-btn");
const correctAudio = new Audio("./Audio/correct.wav");

/* kANJI */
let kanjiData = []; //hold the current game kanji
let currentKanji = null;
let kanjiChoices = [];
let acceptingAnswers = false;
let questionCounter = 0;
const translation = document.getElementById("translation");

/* CHOOSE LEVEL */
const jlptLevel = localStorage.getItem("JLPT");
const step = Number(localStorage.getItem("step"));

/* COUNTER & ACCURACY*/
let questionCounterDisplay = document.getElementById("question-Counter");
let accuracyDisplay = document.getElementById("accuracy")
let accuracy = 0;
let progressBarFill = document.getElementById("progress-bar-fill");

//LOAD DATA, THEN START
async function loadKanji() {
    const response = await fetch(`${BASE_PATH}data/kanji_data_N${jlptLevel}.json`); // document containing kanji
    if (!response.ok) throw new Error("Failed to load json");
    const data = await response.json();

    // Get kanji array
    kanjiData = data.levels[`Level ${step}`];
    questionCounter = 0;
    startGame();
}


/* GAME */
startGame = ()=> {
    progressBarFill.style.width = 0;
    questionCounter = 0;
    translation.style.color = "rgb(206, 202, 202)";
    showKanji();
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function showKanji() {
    //DISABLE & HIDE
    translation.innerHTML = "__";
    translation.style.color = "rgb(206, 202, 202)"
    nextQuestion.disabled = true;

    // Pick one kanji sublevel
    const questionIndex = Math.floor(Math.random() * kanjiData.length);
    currentKanji = kanjiData[questionIndex];
    question.innerText = currentKanji.kanji;
    if (kanjiChoices.length === 0) {
        kanjiChoices = [...kanjiData];
    }

    //QUESTION COUNTER & PROGRESS BAR
    questionCounter++;
    progressBarFill.style.width = `${(questionCounter / kanjiChoices.length) * 100}%`;
    questionCounterDisplay.innerText = `Question: ${questionCounter}/${kanjiChoices.length}`;

    // --- BUILD ANSWERS ---
    const answers = new Set();

    // CORRECT READING
    const correctReading = currentKanji.kunyomi.join("・") + "\n" + currentKanji.onyomi.join("・");
    answers.add(correctReading);
    
    // WRONG READINGS
    while (answers.size < choices.length) {
        const randomKanji = kanjiChoices[Math.floor(Math.random() * kanjiChoices.length)];
        const wrongReading = randomKanji.kunyomi.join("・") + "\n" + randomKanji.onyomi.join("・");
        answers.add(wrongReading); // Set prevents duplicates
    }

    // SHUFFLE
    const shuffledAnswers = shuffle([...answers]); //... puts each item of answers into a new array

    // SHOW
    choices.forEach((choice, index) => {
        choice.innerText = shuffledAnswers[index];
        //assign to each choice.dataset.correct a true/false value depending on it matching correctReading
        choice.dataset.correct = shuffledAnswers[index] === correctReading;
    });

    // Remove used kanji
    kanjiData.splice(questionIndex, 1);
    acceptingAnswers = true;
}

//KEYBOARD TO CLICK
document.addEventListener("keydown", e => {

    if (!acceptingAnswers) return;

    const key = Number(e.key);

    if (key >= 1 && key <= choices.length) {
        choices[key - 1].click();
    }

});

document.addEventListener("keydown", e => {

    if ((e.key === "Enter" || e.key ===" ") && !nextQuestion.disabled) {
        nextQuestion.click();
    }

});

//CLICKING A CHOICE
choices.forEach(choice => {
    choice.addEventListener("click", () => {
        if (!acceptingAnswers) return;
        acceptingAnswers = false;
        translation.innerHTML = currentKanji.translation.join(", ");
        translation.style.color = "black";
        const isCorrect = choice.dataset.correct === "true";
        const classToApply = isCorrect ? "correct" : "incorrect";
        if(isCorrect) {correctAudio.play()};
        
        choice.parentElement.classList.add(classToApply);
        
        //Always highlight the correct one
        choices.forEach(choice => {
            if (choice.dataset.correct === "true") {
                choice.parentElement.classList.add("correct");
            }
        });
        
        //SHOW BTNS
        hiddenBtns.forEach(btn => btn.style.display = "flex");
        nextQuestion.disabled = false;

        //ACCURACY
        if (isCorrect) {accuracy++};
        accuracyDisplay.innerHTML = "Accuracy: " + (accuracy / questionCounter * 100).toFixed(2) + "%";
    });
});


/* POPUP BTNS */
const popUpBtns = document.querySelectorAll("[data-modal]");
const closeModals = document.querySelectorAll('.close-modal');
const overlay = document.getElementById("overlay")

popUpBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        const modal = document.getElementById(btn.dataset.modal);
        modal.classList.add("open");
        overlay.classList.add("open");
        loadExampleSentences();
        radicals.innerHTML = currentKanji.radicals;
    });
});

closeModals.forEach(btn => {
    btn.addEventListener("click", () => {
        btn.closest(".modal").classList.remove("open");
        overlay.classList.remove("open");
    });
});

/* Add info to Popups */
const exampleText = document.getElementById("example-txt");
const radicals = document.getElementById("radicals-txt");

function loadExampleSentences() {

    let html = "";

    Object.values(currentKanji.example_sentences).forEach(group => {
        group.forEach(example => {
            html += `
                <p>${example.sentence}</p>
                <p class="translation">${example.translation}</p>
            `;
        });
    });
    exampleText.innerHTML = html;
}

/* NEXT QUESTION */
nextQuestion.addEventListener("click", () => {
    hiddenBtns.forEach(btn => btn.style.display = "none");
    choices.forEach(choice => {
        choice.parentElement.classList.remove("correct");
        choice.parentElement.classList.remove("incorrect");
        });
    const fullScore = {
        score: (accuracy / questionCounter * 100).toFixed(2),
        jlpt: jlptLevel,
        step: step
    };
    
    //END GAME
    if(questionCounter >= kanjiChoices.length){
        localStorage.setItem("mostRecentScore", JSON.stringify(fullScore));
        //go to the end page
        return window.location.assign("./end.html");
    }
    showKanji()
})


loadKanji();

