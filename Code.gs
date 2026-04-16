// ============================================================
// MOONWALK STAGE — Google Apps Script
//
// INSTRUÇÕES DE USO:
// 1. Acesse script.google.com e crie um novo projeto
// 2. Cole TODO este código no editor
// 3. Execute a função setup() uma vez (Menu Executar > setup)
//    — isso criará as abas e inserirá as perguntas do quiz
// 4. Publique: Publicar > Implantar como aplicativo da web
//    — Executar como: Eu
//    — Quem tem acesso: Qualquer pessoa (incluindo anônimos)
// 5. Copie a URL gerada e substitua 'SUA_URL_AQUI' em cada
//    arquivo HTML (busque por APPS_SCRIPT_URL)
// ============================================================

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  setupQuizSheet(ss);
  setupInscricoesSheet(ss);
  setupVotacaoSheet(ss);
  setupResultadosSheet(ss);
  SpreadsheetApp.getUi().alert(
    'Setup concluído!\n\nAbas criadas:\n• Perguntas (10 questões pré-carregadas)\n• Inscrições\n• Votação\n• Resultados Quiz'
  );
}

// ── ABA: Perguntas ──────────────────────────────────────────
function setupQuizSheet(ss) {
  let sheet = ss.getSheetByName('Perguntas');
  if (!sheet) sheet = ss.insertSheet('Perguntas');
  else sheet.clearContents();

  const headers = [['ID', 'Pergunta', 'Opção A', 'Opção B', 'Opção C', 'Opção D', 'Resposta Correta']];
  sheet.getRange(1, 1, 1, 7).setValues(headers)
    .setFontWeight('bold').setBackground('#d4af37').setFontColor('#000000');

  const perguntas = [
    [1,  'Qual era o apelido mais famoso de Michael Jackson?',                          'Rei do Rock',                              'Rei do Pop',                     'Príncipe do Soul',                           'Mestre da Dança',  'B'],
    [2,  'Em que grupo Michael Jackson começou a fazer sucesso quando criança?',        'The Beatles',                              'Jackson 5',                      'Bee Gees',                                   'Backstreet Boys',  'B'],
    [3,  'Qual destas músicas é um grande sucesso de Michael Jackson?',                 'Shape of You',                             'Thriller',                       'Viva La Vida',                               'Hello',            'B'],
    [4,  'Qual dança ficou muito associada a Michael Jackson?',                         'Samba no pé',                              'Moonwalk',                       'Tango',                                      'Break latino',     'B'],
    [5,  'Qual álbum de Michael Jackson é um dos mais vendidos da história?',           'Thriller',                                 'Bad',                            'Dangerous',                                  'Off the Wall',     'A'],
    [6,  'Michael Jackson nasceu em qual país?',                                        'Canadá',                                   'Inglaterra',                     'Estados Unidos',                             'Austrália',        'C'],
    [7,  'Qual destas músicas também é de Michael Jackson?',                            'Billie Jean',                              'Rolling in the Deep',            'Wonderwall',                                 'Halo',             'A'],
    [8,  'Como se chamava a propriedade famosa onde Michael Jackson morava?',           'Graceland',                                'Neverland',                      'Wonderland',                                 'Dreamland',        'B'],
    [9,  'Qual instrumento Michael Jackson tocava com mais destaque em shows?',         'Violino',                                  'Bateria',                        'Ele era mais conhecido por cantar e dançar', 'Saxofone',         'C'],
    [10, 'Em que ano Michael Jackson morreu?',                                          '2005',                                     '2007',                           '2009',                                       '2011',             'C']
  ];

  sheet.getRange(2, 1, perguntas.length, 7).setValues(perguntas);
  sheet.autoResizeColumns(1, 7);
  sheet.setFrozenRows(1);
}

// ── ABA: Inscrições ─────────────────────────────────────────
function setupInscricoesSheet(ss) {
  let sheet = ss.getSheetByName('Inscrições');
  if (!sheet) sheet = ss.insertSheet('Inscrições');
  else sheet.clearContents();

  const headers = [['Timestamp', 'Nome Completo', 'Nome Artístico', 'Idade', 'Cidade', 'WhatsApp', 'Email', 'Tipo de Performance', 'Música Escolhida', 'Duração', 'Link Vídeo']];
  sheet.getRange(1, 1, 1, 11).setValues(headers)
    .setFontWeight('bold').setBackground('#d4af37').setFontColor('#000000');
  sheet.autoResizeColumns(1, 11);
  sheet.setFrozenRows(1);
}

// ── ABA: Votação ─────────────────────────────────────────────
function setupVotacaoSheet(ss) {
  let sheet = ss.getSheetByName('Votação');
  if (!sheet) sheet = ss.insertSheet('Votação');
  else sheet.clearContents();

  const headers = [['Timestamp', 'Nome', 'Email do Votante', 'Candidato Votado', 'Número do Candidato']];
  sheet.getRange(1, 1, 1, 5).setValues(headers)
    .setFontWeight('bold').setBackground('#d4af37').setFontColor('#000000');
  sheet.autoResizeColumns(1, 5);
  sheet.setFrozenRows(1);
}

// ── ABA: Resultados Quiz ─────────────────────────────────────
function setupResultadosSheet(ss) {
  let sheet = ss.getSheetByName('Resultados Quiz');
  if (!sheet) sheet = ss.insertSheet('Resultados Quiz');
  else sheet.clearContents();

  const headers = [['Timestamp', 'Nome', 'Email', 'Pontuação', 'Total de Perguntas', 'Percentual', 'Respostas (JSON)']];
  sheet.getRange(1, 1, 1, 7).setValues(headers)
    .setFontWeight('bold').setBackground('#d4af37').setFontColor('#000000');
  sheet.autoResizeColumns(1, 7);
  sheet.setFrozenRows(1);
}

// ── doGet — leitura de dados ─────────────────────────────────
function doGet(e) {
  const callback = e.parameter.callback;
  let result;

  if (e.parameter.action === 'getQuestions') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Perguntas');
    const rows = sheet.getDataRange().getValues();
    const questions = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (r[0]) {
        questions.push({
          id: r[0], pergunta: r[1],
          opcaoA: r[2], opcaoB: r[3], opcaoC: r[4], opcaoD: r[5],
          respostaCorreta: r[6]
        });
      }
    }
    result = { success: true, data: questions };

  } else if (e.parameter.action === 'getCandidates') {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('candidatos');
    if (!sheet) {
      result = { success: false, error: 'Aba candidatos não encontrada' };
    } else {
      const rows = sheet.getDataRange().getValues();
      const candidates = [];
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (r[0] || r[1]) {
          candidates.push({ id: r[0], candidato: r[1] });
        }
      }
      result = { success: true, data: candidates };
    }

  } else {
    result = { error: 'Ação não reconhecida' };
  }

  const json = JSON.stringify(result);
  // Suporte a JSONP para evitar CORS em alguns ambientes
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ── doPost — escrita de dados ────────────────────────────────
function doPost(e) {
  let result;
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.action === 'submitInscricao') {
      const sheet = ss.getSheetByName('Inscrições');
      sheet.appendRow([
        new Date(), data.nomeCompleto, data.nomeArtistico, data.idade,
        data.cidade, data.whatsapp, data.email, data.tipoPerformance,
        data.musicaEscolhida, data.duracao, data.linkVideo
      ]);
      result = { success: true, message: 'Inscrição realizada com sucesso!' };

    } else if (data.action === 'submitVoto') {
      const sheet = ss.getSheetByName('Votação');
      sheet.appendRow([
        new Date(), data.nomeVotante, data.emailVotante,
        data.candidatoVotado, data.numeroCandidato
      ]);
      result = { success: true, message: 'Voto registrado com sucesso!' };

    } else if (data.action === 'submitQuizResult') {
      const sheet = ss.getSheetByName('Resultados Quiz');
      const pct = ((data.pontuacao / data.totalPerguntas) * 100).toFixed(1) + '%';
      sheet.appendRow([
        new Date(), data.nome, data.email,
        data.pontuacao, data.totalPerguntas, pct,
        JSON.stringify(data.respostas)
      ]);
      result = { success: true, message: 'Resultado salvo!' };

    } else {
      result = { error: 'Ação não reconhecida' };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
