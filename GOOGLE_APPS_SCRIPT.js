// ============================================================
// TECHVISION — Google Apps Script (Commandes)
//
// COLONNES GOOGLE SHEETS :
// A=Date | B=Article | C=Nom & Prenom | D=Téléphone
// E=Whatsapp | F=Ville | G=Adresse | H=Quantité | I=Prix
//
// DÉPLOIEMENT :
// 1. Google Sheet → Extensions → Apps Script
// 2. Coller ce code (remplacer tout)
// 3. Déployer → Nouveau déploiement → Application Web
//    Exécuter en tant que : Moi
//    Qui a accès : Tout le monde
// 4. Autoriser → Copier l'URL → Envoyer à Claude
// ============================================================

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Commandes') || ss.getActiveSheet();
    var data  = JSON.parse(e.postData.contents);

    // Auto-create headers on first run
    if (sheet.getLastRow() === 0) {
      var headers = ['Date','Article','Nom & Prenom','Téléphone','Whatsapp','Ville','Adresse','Quantité','Prix'];
      sheet.appendRow(headers);
      var hr = sheet.getRange(1, 1, 1, headers.length);
      hr.setFontWeight('bold');
      hr.setBackground('#0D2B6B');
      hr.setFontColor('#FFFFFF');
      hr.setFontSize(11);
      sheet.setFrozenRows(1);
    }

    // A  B        C           D            E             F       G        H          I
    sheet.appendRow([
      data.date        || new Date().toLocaleString('fr-MA'),  // A Date
      data.article     || '',   // B Article
      data.nom_prenom  || '',   // C Nom & Prenom
      data.telephone   || '',   // D Téléphone
      data.whatsapp    || '',   // E Whatsapp
      data.ville       || '',   // F Ville
      data.adresse     || '',   // G Adresse
      data.quantite    || '1',  // H Quantité
      data.prix        || ''    // I Prix
    ]);

    sheet.autoResizeColumns(1, 9);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput('TECHVISION Orders API — OK')
    .setMimeType(ContentService.MimeType.TEXT);
}
