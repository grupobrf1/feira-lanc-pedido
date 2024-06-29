let isSubmitting = false; // Variável para evitar reenvios múltiplos

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

// Verificar se o token está presente e redirecionar para a página de login se não estiver
const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  window.location.href = "/index";
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
      .then((response) => {
        if (!response.ok) {
          throw new Error("Não autorizado");
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const resultado = data[0];
          document.getElementById("cliente").value = resultado.cliente || "";
          document.getElementById("cidade").value = resultado.cidade || "";
          document.getElementById("uf").value = resultado.uf || "";
        } else {
          ocultarCarregamento();
        }
        // Habilitar os campos preenchidos
        document.getElementById("cliente").readOnly = false;
        document.getElementById("cidade").readOnly = false;
        document.getElementById("uf").readOnly = false;
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
        mostrarAlertaErro("Erro ao buscar dados. Por favor, tente novamente.");
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

    if (isSubmitting) {
      return; // Evitar reenvio se já estiver enviando
    }
    isSubmitting = true;

    // Resetar alertas e classes de erro
    document.getElementById("pedidoErrorAlert").classList.add("d-none");
    document.getElementById("pedidoSuccessAlert").classList.add("d-none");
    document.querySelectorAll(".form-control").forEach((input) => {
      input.classList.remove("is-invalid");
    });

    const formData = new FormData(this);

    // Verifique se os dados estão carregados
    if (
      document.getElementById("cliente").value === "Carregando..." ||
      document.getElementById("cidade").value === "Carregando..." ||
      document.getElementById("uf").value === "Carregando..."
    ) {
      mostrarAlertaErro(
        "Aguarde o carregamento dos dados antes de enviar o formulário."
      );
      isSubmitting = false;
      return;
    }

    // Remove máscara do CNPJ e formatação de valor antes de enviar
    const cnpjSemMascara = removerMascaraCNPJ(formData.get("cnpj"));
    const valorSemFormatacao = removerFormatacaoMoeda(formData.get("valorped"));

    formData.set("cnpj", cnpjSemMascara);
    formData.set("valorped", valorSemFormatacao);

    // Exibir modal de confirmação com os dados preenchidos
    document.getElementById("confirmaCnpj").textContent = formData.get("cnpj");
    document.getElementById("confirmaCliente").textContent =
      document.getElementById("cliente").value;
    document.getElementById("confirmaCidade").textContent =
      document.getElementById("cidade").value;
    document.getElementById("confirmaUf").textContent =
      document.getElementById("uf").value;
    document.getElementById("confirmaValorPedido").textContent =
      formData.get("valorped");
    document.getElementById("confirmaQtMoedas").textContent =
      formData.get("qtmoedas");
    document.getElementById("confirmaFornecedor").textContent =
      formData.get("fornecedor");
    document.getElementById("confirmaFilial").textContent =
      formData.get("filial");

    const confirmacaoModal = new bootstrap.Modal(
      document.getElementById("confirmacaoModal")
    );
    confirmacaoModal.show();

    // Adicionar evento ao botão de confirmar no modal
    document.getElementById("confirmarPedidoBtn").onclick = function () {
      confirmacaoModal.hide();

      const dadosFormulario = {};
      for (const [key, value] of formData.entries()) {
        dadosFormulario[key] = value;
      }

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
            mostrarAlertaErro(data.detail);
          } else if (data.mensagem) {
            mostrarAlertaSucesso(data.mensagem);
          } else {
            mostrarAlertaSucesso("Pedido lançado com sucesso!");
          }
          // Limpar os campos do formulário
          document.getElementById("meuFormulario").reset();
          isSubmitting = false;
        })
        .catch((error) => {
          console.error("Erro ao enviar dados:", error);
          mostrarAlertaErro(
            "Erro ao enviar dados. Por favor, tente novamente."
          );

          // Mostrar o modal de erro
          const errorModal = new bootstrap.Modal(
            document.getElementById("pedidoErrorModal")
          );
          errorModal.show();

          isSubmitting = false;
        });
    };

    // Adicionar evento ao botão de cancelar no modal
    document.getElementById("cancelarPedidoBtn").onclick = function () {
      isSubmitting = false;
    };
  });

function mostrarAlertaErro(mensagem) {
  const alertElement = document.getElementById("pedidoErrorAlert");
  alertElement.textContent = mensagem;
  alertElement.classList.remove("d-none");
}

function mostrarAlertaSucesso(mensagem) {
  const alertElement = document.getElementById("pedidoSuccessAlert");
  alertElement.textContent = mensagem;
  alertElement.classList.remove("d-none");
}
