// 全域變數
let questions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let startTime = null;
let timer = null;
let userAnswers = []; // 新增：儲存使用者答案

// DOM 元素
const settingsSection = document.getElementById("settings");
const quizSection = document.getElementById("quiz");
const resultSection = document.getElementById("result");
const weightListSection = document.getElementById("weightList");
const progressText = document.getElementById("progress");
const timerText = document.getElementById("timer");

// 直接定義題目資料
const questionData = {
    questions: [
        {
            id: 1,
            type: "single",
            question: "以下哪個是用於網頁的樣式表語言？",
            options: ["HTML", "CSS", "JavaScript", "Python"],
            answer: [2],
            weight: 2,
            image: null,
            explanation:
                "HTML（HyperText Markup Language）是用來建立網頁的結構。\nCSS（Cascading Style Sheets）是用來設計和設定網頁的樣式，例如顏色、字型、佈局等。\nJavaScript 是一種用於為網頁添加互動功能的程式語言。\nPython 是一種通用程式語言，通常不直接用於前端網頁樣式設計。\n因此，用於網頁樣式的是 CSS。",
        },
        {
            id: 2,
            type: "multi",
            question: "以下哪些是常見的 CSS 選擇器？",
            options: ["ID 選擇器 (#id)", "Class 選擇器 (.class)", "標籤選擇器 (tag)", "屬性選擇器 ([attribute])"],
            answer: [1, 2, 3, 4],
            weight: 3,
            image: null,
            explanation:
                "CSS 提供多種選擇器來選擇 HTML 元素：\n1. ID 選擇器使用 # 符號\n2. Class 選擇器使用 . 符號\n3. 標籤選擇器直接使用 HTML 標籤名稱\n4. 屬性選擇器使用 [] 包含屬性\n這些都是常用的 CSS 選擇器。",
        },
        {
            id: 3,
            type: "single",
            question: "在 RWD 設計中，以下哪個 CSS 屬性用於定義斷點？",
            options: ["@media", "@import", "@keyframes", "@font-face"],
            answer: [1],
            weight: 2,
            image: null,
            explanation:
                "@media 查詢是 RWD（響應式網頁設計）中用於定義不同螢幕尺寸下的樣式規則。\n其他選項的用途：\n@import 用於導入其他樣式表\n@keyframes 用於定義動畫\n@font-face 用於定義自訂字型",
        },
        {
            id: 4,
            type: "multi",
            question: "以下哪些是有效的 CSS 定位方式？",
            options: ["static", "relative", "absolute", "fixed", "sticky"],
            answer: [1, 2, 3, 4, 5],
            weight: 1,
            image: null,
            explanation:
                "CSS 提供以下定位方式：\nstatic：預設值，按照正常文件流定位\nrelative：相對定位，相對於原本的位置\nabsolute：絕對定位，相對於最近的定位父元素\nfixed：固定定位，相對於瀏覽器視窗\nsticky：粘性定位，在特定條件下變成固定定位",
        },
        {
            id: 5,
            type: "single",
            question: "下列哪個 HTML5 標籤用於定義導覽列？",
            options: ["&lt;header&gt;", "&lt;nav&gt;", "&lt;main&gt;", "&lt;section&gt;"],
            answer: [2],
            weight: 2,
            image: null,
            explanation:
                "&lt;nav&gt; 元素用於定義導覽列區域，通常包含主要的導覽連結。\n其他標籤的用途：\n&lt;header&gt;：用於定義頁首區域\n&lt;main&gt;：用於定義主要內容區域\n&lt;section&gt;：用於定義一個獨立的章節",
        },
    ],
};

// 初始化
async function init() {
    try {
        questions = questionData.questions;
        console.log("載入題目:", questions);
        showWeightedQuestions();
    } catch (error) {
        console.error("載入題目時發生錯誤:", error);
        alert("載入題目時發生錯誤");
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
    userAnswers = []; // 重置使用者答案

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

    // 儲存使用者答案
    userAnswers[currentQuestionIndex] = selectedAnswers;

    // 判斷答案是否正確
    const isCorrect = arraysEqual(selectedAnswers.sort(), question.answer.sort());

    // 建立正確答案顯示
    const correctAnswerText = question.answer
        .map((answerIndex) => `${answerIndex}. ${question.options[answerIndex - 1]}`)
        .join("；");

    // 建立使用者答案顯示
    const userAnswerText =
        selectedAnswers.length > 0
            ? selectedAnswers.map((answerIndex) => `${answerIndex}. ${question.options[answerIndex - 1]}`).join("；")
            : "未選擇";

    // 顯示結果
    const questionContainer = document.getElementById("question");
    questionContainer.insertAdjacentHTML(
        "beforeend",
        `
        <div style="margin-top: 20px; padding: 15px; border-radius: 4px; background: ${
            isCorrect ? "#d4edda" : "#f8d7da"
        }">
            <div style="color: ${isCorrect ? "#155724" : "#721c24"}; font-size: 16px; margin-bottom: 10px">
                ${isCorrect ? "✅ 答對了！" : "❌ 答錯了！"}
            </div>
            <div style="margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #007bff;">
                <strong>您的答案：</strong><span style="color: ${
                    isCorrect ? "#28a745" : "#dc3545"
                };">${userAnswerText}</span><br>
                <strong>正確答案：</strong><span style="color: #28a745;">${correctAnswerText}</span>
            </div>
            <div style="margin-top: 10px; padding: 10px; background: #f8f9fa; border-radius: 4px; border-left: 4px solid #28a745;">
                <strong>解析：</strong><br>
                ${question.explanation.replace(/\n/g, "<br>")}
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
    let correctCount = 0;
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index] || [];
        if (arraysEqual(userAnswer.sort(), question.answer.sort())) {
            correctCount++;
        }
    });

    const score = Math.round((correctCount / currentQuestions.length) * 100);
    const totalTime = timerText.textContent;

    // 建立詳細結果列表
    const detailedResults = currentQuestions
        .map((question, index) => {
            const userAnswer = userAnswers[index] || [];
            const isCorrect = arraysEqual(userAnswer.sort(), question.answer.sort());

            const userAnswerText =
                userAnswer.length > 0
                    ? userAnswer.map((answerIndex) => `${answerIndex}. ${question.options[answerIndex - 1]}`).join("；")
                    : "未選擇";

            const correctAnswerText = question.answer
                .map((answerIndex) => `${answerIndex}. ${question.options[answerIndex - 1]}`)
                .join("；");

            return `
            <div style="margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: ${
                isCorrect ? "#f8fff8" : "#fff8f8"
            }">
                <div style="font-weight: bold; margin-bottom: 8px;">
                    ${isCorrect ? "✅" : "❌"} 第 ${index + 1} 題：${question.question}
                </div>
                <div style="margin: 5px 0;">
                    <strong>您的答案：</strong><span style="color: ${
                        isCorrect ? "#28a745" : "#dc3545"
                    };">${userAnswerText}</span>
                </div>
                <div style="margin: 5px 0;">
                    <strong>正確答案：</strong><span style="color: #28a745;">${correctAnswerText}</span>
                </div>
            </div>
        `;
        })
        .join("");

    // 顯示結果
    resultSection.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <div style="font-size: 2em; margin-bottom: 20px; color: ${score >= 60 ? "#28a745" : "#dc3545"}">
                得分：${score}分
            </div>
            <div style="font-size: 1.2em; margin-bottom: 10px;">
                答對 ${correctCount} 題，共 ${currentQuestions.length} 題
            </div>
            <div style="margin-bottom: 20px; font-size: 1.1em;">
                總用時：${totalTime}
            </div>
            <canvas id="scoreChart" style="width: 200px; height: 200px; margin: 0 auto 30px"></canvas>
        </div>
        
        <div style="max-height: 400px; overflow-y: auto; margin: 20px 0;">
            <h3 style="text-align: center; margin-bottom: 20px;">詳細結果</h3>
            ${detailedResults}
        </div>
        
        <div style="text-align: center;">
            <button onclick="location.reload()" 
                    style="padding: 12px 24px; 
                           background: #007bff; 
                           color: white; 
                           border: none; 
                           border-radius: 6px; 
                           cursor: pointer;
                           font-size: 16px;
                           margin-right: 10px;">
                再測驗一次
            </button>
            <button onclick="downloadResults()" 
                    style="padding: 12px 24px; 
                           background: #28a745; 
                           color: white; 
                           border: none; 
                           border-radius: 6px; 
                           cursor: pointer;
                           font-size: 16px;">
                下載結果
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
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return context.parsed + "%";
                        },
                    },
                },
            },
        },
    });
}

// 下載結果
function downloadResults() {
    const score = Math.round(
        (userAnswers.filter((answer, index) =>
            arraysEqual((answer || []).sort(), currentQuestions[index].answer.sort())
        ).length /
            currentQuestions.length) *
            100
    );

    const resultData = {
        score: score,
        totalTime: timerText.textContent,
        questions: currentQuestions.map((question, index) => ({
            id: question.id,
            question: question.question,
            userAnswer: userAnswers[index] || [],
            correctAnswer: question.answer,
            isCorrect: arraysEqual((userAnswers[index] || []).sort(), question.answer.sort()),
        })),
    };

    const jsonStr = JSON.stringify(resultData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quiz_result_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
