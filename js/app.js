// 全域變數
let questions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let startTime = null;
let timer = null;

// DOM 元素
const settingsSection = document.getElementById("settings");
const quizSection = document.getElementById("quiz");
const resultSection = document.getElementById("result");
const weightListSection = document.getElementById("weightList");
const progressText = document.getElementById("progress");
const timerText = document.getElementById("timer");

// 初始化
async function init() {
    try {
        const response = await fetch("data/questions.json");
        const data = await response.json();
        questions = data.questions;
        console.log("載入題目:", questions);
        showWeightedQuestions();
    } catch (error) {
        console.error("載入題目時發生錯誤:", error);
        alert("載入題目時發生錯誤，請確認 data/questions.json 檔案存在且格式正確");
    }
}

// 顯示高權重題目
function showWeightedQuestions() {
    const weightedQuestions = questions.filter((q) => q.weight > 1).sort((a, b) => b.weight - a.weight);

    if (weightedQuestions.length > 0) {
        const list = weightedQuestions
            .map(
                (q) => `
                <div class="weight-item">
                    <strong>題號 ${q.id}</strong> (權重: ${q.weight})
                    <div>${q.question}</div>
                </div>
            `
            )
            .join("");
        weightListSection.innerHTML = `<h3>高權重題目列表</h3>${list}`;
    }
}

// 開始測驗
function startQuiz() {
    const numQuestions = parseInt(document.getElementById("numQuestions").value);
    const maxId = parseInt(document.getElementById("maxId").value);

    // 根據範圍篩選題目
    let availableQuestions = maxId === 0 ? questions : questions.filter((q) => q.id <= maxId);

    // 隨機抽取題目
    currentQuestions = [];
    while (currentQuestions.length < numQuestions && availableQuestions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableQuestions.length);
        const selectedQuestion = availableQuestions[randomIndex];

        if (!currentQuestions.find((q) => q.id === selectedQuestion.id)) {
            currentQuestions.push(selectedQuestion);
        }

        availableQuestions.splice(randomIndex, 1);
    }

    // 初始化測驗
    currentQuestionIndex = 0;
    startTime = new Date();
    timer = setInterval(updateTimer, 1000);

    // 隱藏設定和權重列表
    settingsSection.style.display = "none";
    weightListSection.style.display = "none";
    quizSection.style.display = "block";
    resultSection.style.display = "none";

    showQuestion();
}

// 顯示題目
function showQuestion() {
    const question = currentQuestions[currentQuestionIndex];
    const questionContainer = document.getElementById("question");

    // 更新進度
    updateProgress();

    // 建立題目和選項的HTML
    const html = `
        <div style="margin-bottom: 30px">
            <div style="font-size: 18px; margin-bottom: 10px; font-weight: bold">
                第 ${currentQuestionIndex + 1}/${currentQuestions.length} 題
            </div>
            <div style="font-size: 16px; margin-bottom: 20px">
                ${question.question}
            </div>
            <div style="margin: 20px 0">
                ${question.options
                    .map(
                        (option, index) => `
                    <div style="margin: 15px 0">
                        <label style="display: flex; align-items: center; cursor: pointer">
                            <input type="${question.type === "single" ? "radio" : "checkbox"}"
                                   name="answer"
                                   value="${index + 1}"
                                   style="margin-right: 10px; transform: scale(1.2)">
                            <span style="font-size: 16px">${option}</span>
                        </label>
                    </div>
                `
                    )
                    .join("")}
            </div>
            <button onclick="submitAnswer()" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px">
                提交答案
            </button>
        </div>
    `;

    questionContainer.innerHTML = html;
}

// 更新進度
function updateProgress() {
    const progress = `${currentQuestionIndex + 1}/${currentQuestions.length} (${Math.round(
        ((currentQuestionIndex + 1) / currentQuestions.length) * 100
    )}%)`;
    progressText.textContent = progress;
}

// 更新計時器
function updateTimer() {
    const now = new Date();
    const diff = Math.floor((now - startTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    timerText.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

// 提交答案
function submitAnswer() {
    const question = currentQuestions[currentQuestionIndex];
    const selectedInputs = document.querySelectorAll('input[name="answer"]:checked');
    const selectedAnswers = Array.from(selectedInputs).map((input) => parseInt(input.value));

    // 判斷答案是否正確
    const isCorrect = arraysEqual(selectedAnswers.sort(), question.answer.sort());

    // 顯示結果
    const questionContainer = document.getElementById("question");
    questionContainer.insertAdjacentHTML(
        "beforeend",
        `
        <div style="margin-top: 20px; padding: 15px; border-radius: 4px; background: ${
            isCorrect ? "#d4edda" : "#f8d7da"
        }">
            <div style="color: ${isCorrect ? "#155724" : "#721c24"}; font-size: 16px; margin-bottom: 10px">
                ${isCorrect ? "答對了！" : "答錯了！"}
            </div>
            <div style="margin-top: 10px; padding: 10px; background: white; border-radius: 4px">
                ${question.explanation}
            </div>
            <button onclick="nextQuestion()" 
                    style="margin-top: 15px;
                           padding: 8px 16px; 
                           background: #007bff; 
                           color: white; 
                           border: none; 
                           border-radius: 4px; 
                           cursor: pointer;
                           font-size: 16px">
                繼續
            </button>
        </div>
    `
    );

    // 禁用所有選項和提交按鈕
    document.querySelectorAll('input[name="answer"]').forEach((input) => (input.disabled = true));
    document.querySelector('button[onclick="submitAnswer()"]').style.display = "none";
}

// 下一題
function nextQuestion() {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    } else {
        showResult();
    }
}

// 顯示結果
function showResult() {
    clearInterval(timer);

    quizSection.style.display = "none";
    resultSection.style.display = "block";

    // 計算答對題數
    const correctAnswers = currentQuestions.filter((q, i) => {
        const selectedInputs = document.querySelectorAll(`input[name="answer"]:checked`);
        const selectedValues = Array.from(selectedInputs).map((input) => parseInt(input.value));
        return arraysEqual(selectedValues.sort(), q.answer.sort());
    }).length;

    const score = Math.round((correctAnswers / currentQuestions.length) * 100);

    // 顯示結果
    resultSection.innerHTML = `
        <div style="text-align: center">
            <div style="font-size: 2em; margin-bottom: 20px">得分：${score}分</div>
            <div style="margin-bottom: 20px">總用時：${timerText.textContent}</div>
            <canvas id="scoreChart" style="width: 200px; height: 200px; margin: 0 auto 30px"></canvas>
            <button onclick="location.reload()" 
                    style="padding: 8px 16px; 
                           background: #007bff; 
                           color: white; 
                           border: none; 
                           border-radius: 4px; 
                           cursor: pointer;
                           font-size: 16px">
                再測驗一次
            </button>
        </div>
    `;

    // 繪製圓餅圖
    drawScoreChart(score);
}

// 繪製圓餅圖
function drawScoreChart(score) {
    const ctx = document.getElementById("scoreChart").getContext("2d");
    new Chart(ctx, {
        type: "doughnut",
        data: {
            datasets: [
                {
                    data: [score, 100 - score],
                    backgroundColor: ["#28a745", "#dc3545"],
                },
            ],
        },
        options: {
            cutout: "70%",
            plugins: {
                legend: {
                    display: false,
                },
            },
        },
    });
}

// 下載題庫
function downloadQuestions() {
    const jsonStr = JSON.stringify({ questions }, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "questions.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 輔助函數：比較兩個陣列是否相等
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((val, index) => val === b[index]);
}

// 頁面載入時初始化
document.addEventListener("DOMContentLoaded", init);
