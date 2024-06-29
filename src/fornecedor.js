const accessToken = getCookie("accessToken");

// Função para adicionar máscara de CNPJ
function mascaraCNPJ(value) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

// Função para remover máscara de CNPJ
function removerMascaraCNPJ(value) {
  return value.replace(/\D/g, "");
}

// Função para formatar valor como moeda real
function formatarMoeda(value) {
  return value
    .replace(/\D/g, "")
    .replace(/(\d)(\d{2})$/, "$1,$2")
    .replace(/(?=(\d{3})+(\D))\B/g, ".");
}

// Função para remover formatação de moeda
function removerFormatacaoMoeda(value) {
  return value.replace(/\D/g, "");
}

// Função para mostrar animação de carregamento
function mostrarCarregamento() {
  const cliente = document.getElementById("cliente");
  const cidade = document.getElementById("cidade");
  const uf = document.getElementById("uf");

  cliente.value = "Carregando...";
  cidade.value = "Carregando...";
  uf.value = "Carregando...";

  cliente.classList.add("loading");
  cidade.classList.add("loading");
  uf.classList.add("loading");
}

// Função para ocultar animação de carregamento
function ocultarCarregamento() {
  const cliente = document.getElementById("cliente");
  const cidade = document.getElementById("cidade");
  const uf = document.getElementById("uf");

  cliente.value = "";
  cidade.value = "";
  uf.value = "";

  cliente.classList.remove("loading");
  cidade.classList.remove("loading");
  uf.classList.remove("loading");
}

document.getElementById("cnpj").addEventListener("input", function () {
  this.value = mascaraCNPJ(this.value);
});

document.getElementById("cnpj").addEventListener("blur", function () {
  const cnpjSemMascara = removerMascaraCNPJ(this.value);

  if (cnpjSemMascara.length === 14) {
    mostrarCarregamento();
    fetch(
      `https://api-feira.azurewebsites.net/consultarclienteporcnpj?cnpj=${cnpjSemMascara}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const resultado = data[0];
          document.getElementById("cliente").value = resultado.cliente || "";
          document.getElementById("cidade").value = resultado.cidade || "";
          document.getElementById("uf").value = resultado.uf || "";
        } else {
          ocultarCarregamento();
        }
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
        ocultarCarregamento();
      });
  } else {
    ocultarCarregamento();
  }
});

document.getElementById("valorped").addEventListener("input", function () {
  const valor = formatarMoeda(this.value);
  this.value = valor;
});

document
  .getElementById("meuFormulario")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);

    // Verifique se os dados estão carregados
    if (
      document.getElementById("cliente").value === "Carregando..." ||
      document.getElementById("cidade").value === "Carregando..." ||
      document.getElementById("uf").value === "Carregando..."
    ) {
      alert("Aguarde o carregamento dos dados antes de enviar o formulário.");
      return;
    }

    // Remove máscara do CNPJ e formatação de valor antes de enviar
    const cnpjSemMascara = removerMascaraCNPJ(formData.get("cnpj"));
    const valorSemFormatacao = removerFormatacaoMoeda(formData.get("valorped"));

    formData.set("cnpj", cnpjSemMascara);
    formData.set("valorped", valorSemFormatacao);

    // Logs para depuração
    console.log("FormData antes de enviar:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const dadosFormulario = {};
    for (const [key, value] of formData.entries()) {
      dadosFormulario[key] = value;
    }

    // Desabilitar o botão de enviar para evitar múltiplos envios
    const submitButton = document.querySelector("button[type='submit']");
    submitButton.disabled = true;

    fetch("https://api-feira.azurewebsites.net/lancarpedido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(dadosFormulario),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Erro na resposta da API");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Resposta da API:", data);
        if (data.detail) {
          alert(data.detail);
        } else if (data.mensagem) {
          alert(data.mensagem);
        } else {
          alert('Resposta da API não contém a chave "detail".');
        }
        // Limpar os campos do formulário
        document.getElementById("meuFormulario").reset();
        // Habilitar o botão de enviar
        submitButton.disabled = false;
      })
      .catch((error) => {
        console.error("Erro ao enviar dados:", error);

        // Mostrar o alerta de erro
        document.getElementById("pedidoErrorAlert").classList.remove("d-none");

        // Mostrar o modal de erro
        const errorModal = new bootstrap.Modal(
          document.getElementById("pedidoErrorModal")
        );
        errorModal.show();

        // Habilitar o botão de enviar em caso de erro
        submitButton.disabled = false;
      });
  });

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
