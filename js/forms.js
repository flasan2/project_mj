async function submitInscricao(e) {
  e.preventDefault();
  const termos = document.getElementById('f-termos');
  if (!termos.checked) {
    alert('Por favor, aceite os termos e condições para continuar.');
    return;
  }
  const tipoChecked = document.querySelector('[name="perf_type"]:checked');
  const tipoLabel = tipoChecked
    ? tipoChecked.closest('label').querySelector('div').textContent.trim()
    : 'Não informado';
  const payload = {
    action: 'submitInscricao',
    nomeCompleto:    document.getElementById('f-nome-completo').value.trim(),
    nomeArtistico:   document.getElementById('f-nome-artistico').value.trim(),
    idade:           document.getElementById('f-idade').value,
    cidade:          document.getElementById('f-cidade').value.trim(),
    whatsapp:        document.getElementById('f-whatsapp').value.trim(),
    email:           document.getElementById('f-email').value.trim(),
    tipoPerformance: tipoLabel,
    musicaEscolhida: document.getElementById('f-musica').value.trim(),
    duracao:         document.getElementById('f-duracao').value
  };
  const btn = document.getElementById('submit-btn');
  btn.disabled = true;
  btn.innerHTML = '<span>Enviando...</span>';
  try {
    await fetch('/api/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    btn.innerHTML = '✓ Inscrição Enviada! <span class="material-symbols-outlined">check_circle</span>';
    btn.classList.remove('from-primary','to-primary-container');
    btn.classList.add('bg-green-700');
    document.getElementById('form-success').classList.remove('hidden');
    document.getElementById('form-error').classList.add('hidden');
  } catch (err) {
    btn.disabled = false;
    btn.innerHTML = 'Tentar Novamente <span class="material-symbols-outlined">auto_awesome</span>';
    document.getElementById('form-error').classList.remove('hidden');
  }
}
