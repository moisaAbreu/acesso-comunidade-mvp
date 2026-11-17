// Lógica de Inscrição (index.html)
const formInscricao = document.getElementById('form-inscricao');
if (formInscricao) {
  formInscricao.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const restricao = document.getElementById('restricao').value;

    const res = await fetch('/api/inscrever', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone, restricao })
    });

    const data = await res.json();
    if (data.sucesso) {
      document.getElementById('form-container').classList.add('d-none');
      document.getElementById('qr-container').classList.remove('d-none');
      document.getElementById('token-texto').innerText = data.dados.qr_code_token;
      
      new QRCode(document.getElementById("qrcode"), {
        text: data.dados.qr_code_token,
        width: 180,
        height: 180
      });
    } else {
      alert('Erro ao realizar inscrição.');
    }
  });
}

// Lógica da Portaria / QR Code Scanner (portaria.html)
const readerElem = document.getElementById('reader');
if (readerElem) {
  let html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });

  async function onScanSuccess(decodedText) {
    html5QrcodeScanner.pause();

    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: decodedText })
      });

      const data = await res.json();
      const modalBg = document.getElementById('modal-content-bg');
      const modalIcone = document.getElementById('modal-icone');
      const modalStatus = document.getElementById('modal-status');
      const modalNome = document.getElementById('modal-nome');
      const modalRestricao = document.getElementById('modal-restricao');

      if (res.ok && data.valido) {
        modalBg.className = "modal-content text-white text-center p-4 bg-success";
        modalIcone.innerHTML = "✔️";
        modalStatus.innerText = "ENTRADA LIBERADA";
        modalNome.innerText = data.nome;
        modalRestricao.innerText = "Restrição Alimentar: " + data.restricao;
      } else {
        modalBg.className = "modal-content text-white text-center p-4 bg-danger";
        modalIcone.innerHTML = "❌";
        modalStatus.innerText = data.mensagem || "CREDENCIAL INVÁLIDA";
        modalNome.innerText = data.nome || "";
        modalRestricao.innerText = "";
      }

      const modal = new bootstrap.Modal(document.getElementById('modalResultado'));
      modal.show();

      document.getElementById('btn-proxima').onclick = () => {
        html5QrcodeScanner.resume();
      };

    } catch (err) {
      alert('Erro ao validar ingresso.');
      html5QrcodeScanner.resume();
    }
  }

  html5QrcodeScanner.render(onScanSuccess);
}