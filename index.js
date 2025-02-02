let questions = [];
let currentQuestionIndex = 0;
let score = 0;

async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    questions = shuffleArray(await response.json());
    loadQuestion();
  } catch (error) {
    console.error("Fel vid hämtning av frågor:", error);
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function loadQuestion() {
  if (currentQuestionIndex >= questions.length) {
    document.getElementById("quiz-container").innerHTML = `
            <h2>Quizet är klart!</h2>
            <p>Du fick ${score} av ${questions.length} rätt.</p>
            <button onclick="restartQuiz()">Spela igen</button>
        `;
    return;
  }

  const questionData = questions[currentQuestionIndex];
  document.getElementById("question").textContent = questionData.question;
  document.getElementById("options").innerHTML = "";
  document.getElementById("feedback").textContent = "";
  document.getElementById("full-answer").textContent = "";
  document.getElementById("full-answer").style.display = "none";
  document.getElementById("next").style.display = "none";

  let shuffledOptions = shuffleArray([...questionData.options]);

  shuffledOptions.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-btn");
    button.onclick = function () {
      checkAnswer(option, questionData);
    };
    document.getElementById("options").appendChild(button);
  });
}

function checkAnswer(selected, questionData) {
  const buttons = document.querySelectorAll(".option-btn");

  if (selected === questionData.answer) {
    document.getElementById("feedback").textContent = "🎉Wohoo, Rätt svar!";
    document.getElementById("full-answer").textContent =
      questionData.fullAnswer;
    document.getElementById("full-answer").style.display = "block";
    score++;
    playSound();
    showConfetti();

    // Inaktivera alla knappar efter rätt svar
    buttons.forEach((button) => (button.disabled = true));
    document.getElementById("next").style.display = "block";
  } else {
    document.getElementById("feedback").textContent =
      "❌ Fel svar! Försök igen.";

    // Inaktivera endast den felaktiga knappen
    buttons.forEach((button) => {
      if (button.textContent === selected) {
        button.disabled = true;
      }
    });
  }
}

function nextQuestion() {
  currentQuestionIndex++;
  loadQuestion();
}

function restartQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  loadQuestions();
}

function playSound() {
  let audio = new Audio("correct.mp3");
  audio.play();
}

function showConfetti() {
  const confettiCanvas = document.createElement("canvas");
  confettiCanvas.id = "confettiCanvas";
  confettiCanvas.style.position = "fixed";
  confettiCanvas.style.top = "0";
  confettiCanvas.style.left = "0";
  confettiCanvas.style.width = "100vw";
  confettiCanvas.style.height = "100vh";
  confettiCanvas.style.pointerEvents = "none";
  document.body.appendChild(confettiCanvas);

  const ctx = confettiCanvas.getContext("2d");
  const confettiParticles = [];

  for (let i = 0; i < 100; i++) {
    confettiParticles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight - window.innerHeight,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      size: Math.random() * 5 + 5,
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 2 - 1,
    });
  }

  function updateConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(updateConfetti);
  }

  updateConfetti();

  setTimeout(() => document.body.removeChild(confettiCanvas), 3000);
}

document.getElementById("next").addEventListener("click", nextQuestion);

loadQuestions();
