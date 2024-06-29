let isSubmitting = false; // Variável para evitar reenvios múltiplos

// Função para adicionar máscara de CNPJ
function mascaraCNPJ(value) {
  return value
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2")
    .slice(0, 18); // Limitar a 18 caracteres incluindo a máscara
}

// Função para remover máscara de CNPJ
function removerMascaraCNPJ(value) {
  return value.replace(/\D/g, "");
}

// Função para formatar valor como moeda real
function formatarMoeda(value) {
  value = value.replace(/\D/g, "");
  value = (value / 100).toFixed(2) + "";
  value = value.replace(".", ",");
  value = value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return value;
}

// Função para remover formatação de moeda
function removerFormatacaoMoeda(value) {
  return value.replace(/[^\d,]/g, "").replace(",", ".");
}

// Função para mostrar animação de carregamento
function mostrarCarregamento() {
  const cliente = document.getElementById("cliente");
  const cidade = document.getElementById("cidade");
  const uf = document.getElementById("uf");

  if (cliente && cidade && uf) {
    cliente.value = "Carregando...";
    cidade.value = "Carregando...";
    uf.value = "Carregando...";

    cliente.classList.add("loading");
    cidade.classList.add("loading");
    uf.classList.add("loading");
  }
}

// Função para ocultar animação de carregamento
function ocultarCarregamento() {
  const cliente = document.getElementById("cliente");
  const cidade = document.getElementById("cidade");
  const uf = document.getElementById("uf");

  if (cliente && cidade && uf) {
    cliente.value = "";
    cidade.value = "";
    uf.value = "";

    cliente.classList.remove("loading");
    cidade.classList.remove("loading");
    uf.classList.remove("loading");
  }
}

// Verificar se o token está presente e redirecionar para a página de login se não estiver
const accessToken = localStorage.getItem("accessToken");
if (!accessToken) {
  window.location.href = "/login_vendedor";
}

// Recuperar o nome do usuário e atualizar o título
const userName = localStorage.getItem("userName");
if (userName) {
  document.getElementById(
    "tituloBemVindo"
  ).textContent = `Bem-vindo, ${userName}`;
}

// Lógica para logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userName");
  window.location.href = "/login_vendedor";
});

document.getElementById("cnpj").addEventListener("input", function () {
  this.value = mascaraCNPJ(this.value);
  const cnpjSemMascara = removerMascaraCNPJ(this.value);

  if (cnpjSemMascara.length !== 14) {
    // Limpar os campos se o CNPJ não tiver 14 dígitos
    document.getElementById("cliente").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("uf").value = "";
    document.getElementById("cliente").readOnly = true;
    document.getElementById("cidade").readOnly = true;
    document.getElementById("uf").readOnly = true;
  }
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
        ocultarCarregamento();
        if (Array.isArray(data) && data.length > 0) {
          const resultado = data[0];
          document.getElementById("cliente").value = resultado.cliente || "";
          document.getElementById("cidade").value = resultado.cidade || "";
          document.getElementById("uf").value = resultado.uf || "";
          const cnpjErrorAlert = document.getElementById("cnpjErrorAlert");
          if (cnpjErrorAlert) {
            cnpjErrorAlert.classList.add("d-none");
          }
        } else {
          mostrarAlertaErro("CNPJ não encontrado. Tente novamente.");
        }
        // Habilitar os campos preenchidos
        document.getElementById("cliente").readOnly = true;
        document.getElementById("cidade").readOnly = true;
        document.getElementById("uf").readOnly = true;
      })
      .catch((error) => {
        console.error("Erro ao buscar dados:", error);
        mostrarAlertaErro("CNPJ não encontrado. Tente novamente.");
        ocultarCarregamento();
      });
  } else {
    ocultarCarregamento();
  }
});

document.getElementById("valorped").addEventListener("input", function () {
  this.value = formatarMoeda(this.value);
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
    document.getElementById("confirmaCnpj").textContent = mascaraCNPJ(
      formData.get("cnpj")
    );
    document.getElementById("confirmaCliente").textContent =
      document.getElementById("cliente").value;
    document.getElementById("confirmaCidade").textContent =
      document.getElementById("cidade").value;
    document.getElementById("confirmaUf").textContent =
      document.getElementById("uf").value;
    document.getElementById("confirmaValorPedido").textContent = formatarMoeda(
      formData.get("valorped")
    );
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
  if (alertElement) {
    alertElement.textContent = mensagem;
    alertElement.classList.remove("d-none");
    setTimeout(() => {
      alertElement.classList.add("d-none");
    }, 3000); // Ocultar o alerta após 3 segundos
  }
}

function mostrarAlertaSucesso(mensagem) {
  const alertElement = document.getElementById("pedidoSuccessAlert");
  if (alertElement) {
    alertElement.textContent = mensagem;
    alertElement.classList.remove("d-none");
  }
}
