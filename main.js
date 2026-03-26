const BASE_PATH = window.location.hostname.includes('github.io') 
    ? 'leandroinsua.github.io/Quiz-Website/'   // Change only this if your repo name ever changes
    : '/';               // Local development

/* Layers */
const layers = {
    home: document.getElementById("home"),
    kanji: document.getElementById("kanji-level"),
    vocab: document.getElementById("vocab-level"),
    kanjiSteps: document.getElementById('kanji-steps')
};
const highScores = JSON.parse(localStorage.getItem("highScores"))

const stepsContainer = document.getElementById("steps-container");
let kanjiData = []; //hold the current game kanji
let kanjiCache = {};

/* Layers and steps buttons */
let JLPTButtons = document.querySelectorAll("[data-jlpt]")
const registerBtn = document.getElementById('register-btn')
const modal = document.getElementById('modal')


/* Buttons in Home layer */
let kanjiBtn = document.getElementById("kanji-btn");
let vocabularyBtn = document.getElementById("vocabulary-btn");
let highScore = document.getElementById("highScores-btn");

/* Back btn */
const backBtns = document.querySelectorAll(".back-btn");

/* HIDE / SHOW */
function showOnly(layerKey) {
    //pass layers array
    Object.values(layers).forEach(layer => {
        if (layer) layer.style.display = "none";
    });

    if (layers[layerKey]) {
        layers[layerKey].style.display = "flex";
    }
}


/* CREATE BUTTONS */
async function loadKanji(jlpt) {
    if (!kanjiCache[jlpt]) {
         try {
            const response = await fetch(`${BASE_PATH}data/kanji_data_N${jlpt}.json`);
            if (!response.ok) {
                throw new Error("Failed to fetch Kanji data");
            }
            kanjiCache[jlpt] = await response.json();
         }catch (error) {
        console.error(error);
        return null;
    }
}

    const data = kanjiCache[jlpt];
    const levels = Object.keys(data.levels);
    stepsContainer.innerHTML = "";

    levels.forEach((level, i) => {
        const step = document.createElement("a");
        const bar = document.createElement("div");
        step.className = "btn";
        step.dataset.step = i + 1;
        step.textContent = `Step ${i + 1}`;
        bar.className = "progress-bar";
        bar.dataset.step = i + 1;
        bar.style.width = "5rem";

        stepsContainer.appendChild(step);
        step.appendChild(bar);
    });
}

stepsContainer.addEventListener("click", (e) => {
    if (!e.target.matches("[data-step]")) return;
    const step = e.target.dataset.step;
    localStorage.setItem("step", step);
    window.location.href = "./kanjiGame.html";
});


kanjiBtn.addEventListener("click", () => showOnly("kanji"));
vocabularyBtn?.addEventListener("click", () => showOnly("vocab"));

JLPTButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const jlpt = btn.dataset.jlpt;
        document.getElementById("steps-title").textContent = `Choose N${jlpt} sublevel`;
        localStorage.setItem("JLPT", jlpt);
        loadKanji(jlpt);
        showOnly("kanjiSteps");
    });
});


backBtns.forEach(btn =>
    btn.addEventListener("click", () => showOnly("home"))
);



