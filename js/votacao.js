let currentCandidate = { nome: '', numero: '' };

function selectCard(card) {
  document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('card-selected'));
  card.classList.add('card-selected');
}

function openVoteModal(nome, numero) {
  currentCandidate = { nome, numero };
  document.getElementById('modal-candidate-name').textContent = nome + ' ' + numero;
  document.getElementById('vote-nome').value  = '';
  document.getElementById('vote-email').value = '';
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
  const nome  = document.getElementById('vote-nome').value.trim();
  const email = document.getElementById('vote-email').value.trim();
  if (!nome || !email) {
    alert('Por favor, preencha seu nome e e-mail para votar.');
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
        emailVotante:    email,
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

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('vote-modal').addEventListener('click', function(e) {
    if (e.target === this) closeVoteModal();
  });
});
