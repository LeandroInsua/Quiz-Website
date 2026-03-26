const username = document.getElementById('username');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const finalScore = document.getElementById('final-score');
const mostRecentScore = JSON.parse(localStorage.getItem("mostRecentScore"));

console.log(mostRecentScore);

finalScore.innerHTML = "Accuracy: " + mostRecentScore.score + "%";

const MAX_HIGH_SCORES = 100;

const highScores = JSON.parse(localStorage.getItem("highScores")) || [];

username.addEventListener("keyup", () => {
    saveScoreBtn.disabled = !username.value;
})

console.log(highScores);

saveHighScore = e => {
    e.preventDefault();

    const saveScore = {
        score: Number(mostRecentScore.score),
        name: username.value,
        jlpt: mostRecentScore.jlpt,
        step: mostRecentScore.step
    };
    highScores.push(saveScore);
    //SORT
    highScores.sort( (a, b) => b.score - a.score);
    highScores.splice(MAX_HIGH_SCORES);
    localStorage.setItem("highScores", JSON.stringify(highScores));
    window.location.assign("/");
}