let currentCandidate = { nome: '', numero: '' };
let allCandidates = [];
let currentPage = 0;
const PER_PAGE = 5;

// ── Seleção de card ──────────────────────────────────────────
function selectCard(card) {
  document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('card-selected'));
  card.classList.add('card-selected');
}

// ── Modal de voto ────────────────────────────────────────────
function openVoteModal(nome, numero) {
  currentCandidate = { nome, numero };
  document.getElementById('modal-candidate-name').textContent = nome + ' ' + numero;
  document.getElementById('vote-nome').value = '';
  document.getElementById('vote-success').classList.add('hidden');
  document.getElementById('vote-error').classList.add('hidden');
  const btn = document.getElementById('vote-submit-btn');
  btn.disabled = false;
  btn.textContent = 'Confirmar Voto';
  btn.classList.remove('opacity-70');
  document.getElementById('vote-modal').classList.remove('hidden');
  document.getElementById('vote-modal').classList.add('flex');
}

function closeVoteModal() {
  document.getElementById('vote-modal').classList.add('hidden');
  document.getElementById('vote-modal').classList.remove('flex');
}

async function confirmVote() {
  const nome = document.getElementById('vote-nome').value.trim();
  if (!nome) {
    alert('Por favor, preencha seu nome para votar.');
    return;
  }
  const btn = document.getElementById('vote-submit-btn');
  btn.disabled = true;
  btn.textContent = 'Registrando...';
  try {
    await fetch('/api/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submitVoto',
        nomeVotante:     nome,
        candidatoVotado: currentCandidate.nome,
        numeroCandidato: currentCandidate.numero
      })
    });
    btn.textContent = '✓ Voto Confirmado!';
    btn.classList.add('opacity-70');
    document.getElementById('vote-success').classList.remove('hidden');
    document.getElementById('vote-error').classList.add('hidden');
    setTimeout(closeVoteModal, 2500);
  } catch (err) {
    btn.disabled = false;
    btn.textContent = 'Tentar Novamente';
    document.getElementById('vote-error').classList.remove('hidden');
  }
}

// ── Paginação ────────────────────────────────────────────────
function renderPage(page) {
  const cards = document.querySelectorAll('.candidate-card');
  const start = page * PER_PAGE;
  const pageCandidates = allCandidates.slice(start, start + PER_PAGE);

  cards.forEach((card, i) => {
    const c = pageCandidates[i];
    const globalIndex = start + i;
    const numero = '#' + String(globalIndex + 1).padStart(2, '0');

    const h3 = card.querySelector('h3.card-title');
    const btn = card.querySelector('button.vote-btn');
    const badge = card.querySelector('.card-badge span');

    if (c) {
      const nome = c.candidato || ('Candidato ' + (globalIndex + 1));
      if (h3) h3.textContent = nome;
      if (badge) badge.textContent = numero;
      if (btn) {
        btn.disabled = false;
        btn.setAttribute('onclick',
          `event.stopPropagation(); openVoteModal('${nome.replace(/'/g, "\\'")}', '${numero}')`
        );
      }
      card.style.visibility = 'visible';
    } else {
      // página tem menos de 5 candidatos nesta página
      card.style.visibility = 'hidden';
    }
  });

  // dots de paginação
  const totalPages = Math.ceil(allCandidates.length / PER_PAGE);
  const dotsEl = document.getElementById('pagination-dots');
  if (dotsEl) {
    dotsEl.innerHTML = '';
    for (let p = 0; p < totalPages; p++) {
      const dot = document.createElement('span');
      dot.className = 'w-2 h-2 rounded-full cursor-pointer transition-colors ' +
        (p === page ? 'bg-primary' : 'bg-surface-container-highest hover:bg-outline');
      dot.onclick = () => goToPage(p);
      dotsEl.appendChild(dot);
    }
  }

  // botões prev/next
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  if (btnPrev) btnPrev.disabled = page === 0;
  if (btnNext) btnNext.disabled = page >= totalPages - 1;

  currentPage = page;
}

function changePage(dir) {
  const totalPages = Math.ceil(allCandidates.length / PER_PAGE);
  const next = currentPage + dir;
  if (next >= 0 && next < totalPages) renderPage(next);
}

function goToPage(page) {
  renderPage(page);
}

// ── Estado de carregando ─────────────────────────────────────
function setLoadingState() {
  document.querySelectorAll('.candidate-card').forEach((card, i) => {
    const h3 = card.querySelector('h3.card-title');
    const btn = card.querySelector('button.vote-btn');
    if (h3) h3.textContent = 'Carregando candidatos...';
    if (btn) btn.disabled = true;
  });
}

// ── Buscar candidatos do Sheets ──────────────────────────────
async function loadCandidates() {
  setLoadingState();
  try {
    const url = (window.APPS_SCRIPT_URL || '/api/script') + '?action=getCandidates';
    const res = await fetch(url);
    const json = await res.json();
    if (!json.success || !json.data || json.data.length === 0) {
      // fallback: restaura nomes padrão
      document.querySelectorAll('.candidate-card').forEach((card, i) => {
        const h3 = card.querySelector('h3.card-title');
        const btn = card.querySelector('button.vote-btn');
        const numero = '#' + String(i + 1).padStart(2, '0');
        const nome = 'Candidato ' + (i + 1);
        if (h3) h3.textContent = nome;
        if (btn) {
          btn.disabled = false;
          btn.setAttribute('onclick',
            `event.stopPropagation(); openVoteModal('${nome}', '${numero}')`
          );
        }
      });
      return;
    }
    allCandidates = json.data;
    renderPage(0);
  } catch (err) {
    // fallback silencioso
    document.querySelectorAll('.candidate-card').forEach((card, i) => {
      const h3 = card.querySelector('h3.card-title');
      const btn = card.querySelector('button.vote-btn');
      const numero = '#' + String(i + 1).padStart(2, '0');
      const nome = 'Candidato ' + (i + 1);
      if (h3) h3.textContent = nome;
      if (btn) {
        btn.disabled = false;
        btn.setAttribute('onclick',
          `event.stopPropagation(); openVoteModal('${nome}', '${numero}')`
        );
      }
    });
  }
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('vote-modal').addEventListener('click', function(e) {
    if (e.target === this) closeVoteModal();
  });
  loadCandidates();
});
