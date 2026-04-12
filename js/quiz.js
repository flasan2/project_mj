const LOCAL_QUESTIONS = [
  { id:1,  pergunta:'Qual era o apelido mais famoso de Michael Jackson?',                    opcaoA:'Rei do Rock',   opcaoB:'Rei do Pop',                              opcaoC:'Príncipe do Soul',  opcaoD:'Mestre da Dança',  respostaCorreta:'B' },
  { id:2,  pergunta:'Em que grupo Michael Jackson começou a fazer sucesso quando criança?',  opcaoA:'The Beatles',   opcaoB:'Jackson 5',                               opcaoC:'Bee Gees',          opcaoD:'Backstreet Boys',  respostaCorreta:'B' },
  { id:3,  pergunta:'Qual destas músicas é um grande sucesso de Michael Jackson?',           opcaoA:'Shape of You',  opcaoB:'Thriller',                                opcaoC:'Viva La Vida',      opcaoD:'Hello',            respostaCorreta:'B' },
  { id:4,  pergunta:'Qual dança ficou muito associada a Michael Jackson?',                   opcaoA:'Samba no pé',   opcaoB:'Moonwalk',                                opcaoC:'Tango',             opcaoD:'Break latino',     respostaCorreta:'B' },
  { id:5,  pergunta:'Qual álbum de Michael Jackson é um dos mais vendidos da história?',    opcaoA:'Thriller',      opcaoB:'Bad',                                     opcaoC:'Dangerous',         opcaoD:'Off the Wall',     respostaCorreta:'A' },
  { id:6,  pergunta:'Michael Jackson nasceu em qual país?',                                  opcaoA:'Canadá',        opcaoB:'Inglaterra',                              opcaoC:'Estados Unidos',    opcaoD:'Austrália',        respostaCorreta:'C' },
  { id:7,  pergunta:'Qual destas músicas também é de Michael Jackson?',                      opcaoA:'Billie Jean',   opcaoB:'Rolling in the Deep',                     opcaoC:'Wonderwall',        opcaoD:'Halo',             respostaCorreta:'A' },
  { id:8,  pergunta:'Como se chamava a propriedade famosa onde Michael Jackson morava?',    opcaoA:'Graceland',     opcaoB:'Neverland',                               opcaoC:'Wonderland',        opcaoD:'Dreamland',        respostaCorreta:'B' },
  { id:9,  pergunta:'Qual instrumento Michael Jackson tocava com mais destaque em shows?',  opcaoA:'Violino',       opcaoB:'Bateria',                                 opcaoC:'Ele era mais conhecido por cantar e dançar', opcaoD:'Saxofone', respostaCorreta:'C' },
  { id:10, pergunta:'Em que ano Michael Jackson morreu?',                                    opcaoA:'2005',          opcaoB:'2007',                                    opcaoC:'2009',              opcaoD:'2011',             respostaCorreta:'C' },
];

let questions = [];
let currentIndex = 0;
let userAnswers = [];
let selectedAnswer = null;
let answered = false;

async function init() {
  try {
    const res = await fetch('/api/script?action=getQuestions');
    const data = await res.json();
    questions = (data.success && data.data && data.data.length) ? data.data : LOCAL_QUESTIONS;
  } catch (e) {
    questions = LOCAL_QUESTIONS;
  }
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('quiz-content').classList.remove('hidden');
  document.getElementById('quiz-content').classList.add('flex', 'flex-col', 'items-center');
  renderQuestion();
}

function renderQuestion() {
  const q = questions[currentIndex];
  const num = currentIndex + 1;
  const total = questions.length;
  const pct = Math.round((num / total) * 100);

  document.getElementById('progress-text').innerHTML =
    `Pergunta ${num} <span class="text-white/40 font-normal ml-1">de ${total}</span>`;
  document.getElementById('progress-pct').textContent = `${pct}%`;
  document.getElementById('progress-bar').style.width = `${pct}%`;
  document.getElementById('progress-moon').style.left = `${pct}%`;
  document.getElementById('question-number').textContent = String(num).padStart(2, '0');
  document.getElementById('question-text').textContent = q.pergunta;

  document.getElementById('opt-a-text').textContent = q.opcaoA;
  document.getElementById('opt-b-text').textContent = q.opcaoB;
  document.getElementById('opt-c-text').textContent = q.opcaoC;
  document.getElementById('opt-d-text').textContent = q.opcaoD;

  const nextBtn = document.getElementById('next-btn');
  nextBtn.textContent = currentIndex === questions.length - 1 ? 'Ver Resultado' : 'Próxima Pergunta';
  nextBtn.disabled = false;

  selectedAnswer = null;
  answered = false;
  ['A','B','C','D'].forEach(opt => {
    const btn = document.getElementById(`btn-${opt}`);
    btn.classList.remove('selected','correct','wrong');
    btn.disabled = false;
  });
  document.getElementById('warning-msg').classList.add('opacity-0');
}

function selectAnswer(option) {
  if (answered) return;
  selectedAnswer = option;
  ['A','B','C','D'].forEach(opt => {
    document.getElementById(`btn-${opt}`).classList.remove('selected');
  });
  document.getElementById(`btn-${option}`).classList.add('selected');
  document.getElementById('warning-msg').classList.add('opacity-0');
}

function nextQuestion() {
  if (!selectedAnswer) {
    document.getElementById('warning-msg').classList.remove('opacity-0');
    return;
  }
  const correct = questions[currentIndex].respostaCorreta;
  answered = true;
  ['A','B','C','D'].forEach(opt => {
    const btn = document.getElementById(`btn-${opt}`);
    btn.disabled = true;
    if (opt === correct) btn.classList.add('correct');
    else if (opt === selectedAnswer && opt !== correct) btn.classList.add('wrong');
  });
  userAnswers.push({ questionId: questions[currentIndex].id, selected: selectedAnswer, correct });
  const nextBtn = document.getElementById('next-btn');
  nextBtn.disabled = true;
  setTimeout(() => {
    currentIndex++;
    if (currentIndex >= questions.length) showResults();
    else renderQuestion();
  }, 900);
}

function showResults() {
  document.getElementById('quiz-screen').classList.add('hidden');
  const rs = document.getElementById('result-screen');
  rs.classList.remove('hidden');
  rs.classList.add('flex');
  const score = userAnswers.filter(a => a.selected === a.correct).length;
  const total = questions.length;
  const pct = Math.round((score / total) * 100);
  document.getElementById('result-score').textContent = score;
  document.getElementById('result-total').textContent = `/ ${total}`;
  document.getElementById('result-pct').textContent = `${pct}% de acertos`;
  let msg = '';
  if (pct === 100)    msg = 'Perfeito! Você é o verdadeiro Rei do Pop! 👑';
  else if (pct >= 80) msg = 'Excelente! Grande fã do Michael Jackson! 🌟';
  else if (pct >= 60) msg = 'Muito bem! Você conhece bem o Rei do Pop.';
  else if (pct >= 40) msg = 'Razoável. Vale a pena aprender mais sobre o legado!';
  else                msg = 'Continue explorando o incrível universo do Michael Jackson!';
  document.getElementById('result-message').textContent = msg;
}

async function submitResult() {
  const nome  = document.getElementById('result-nome').value.trim();
  const email = document.getElementById('result-email').value.trim();
  if (!nome || !email) {
    alert('Por favor, preencha seu nome e e-mail para salvar o resultado.');
    return;
  }
  const score = userAnswers.filter(a => a.selected === a.correct).length;
  const btn   = document.getElementById('submit-result-btn');
  btn.disabled = true;
  btn.textContent = 'Salvando...';
  try {
    await fetch('/api/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submitQuizResult', nome, email, pontuacao: score, totalPerguntas: questions.length, respostas: userAnswers })
    });
    btn.textContent = '✓ Resultado Salvo no Ranking!';
    btn.classList.add('opacity-70');
  } catch (e) {
    btn.disabled = false;
    btn.textContent = 'Tentar Novamente';
  }
}

function restartQuiz() {
  currentIndex   = 0;
  userAnswers    = [];
  selectedAnswer = null;
  answered       = false;
  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('flex');
  document.getElementById('quiz-screen').classList.remove('hidden');
  document.getElementById('loading-state').classList.add('hidden');
  document.getElementById('quiz-content').classList.remove('hidden');
  document.getElementById('quiz-content').classList.add('flex','flex-col','items-center');
  document.getElementById('result-nome').value  = '';
  document.getElementById('result-email').value = '';
  const btn = document.getElementById('submit-result-btn');
  btn.disabled = false;
  btn.textContent = 'Salvar no Ranking';
  btn.classList.remove('opacity-70');
  renderQuestion();
}

window.addEventListener('DOMContentLoaded', init);
