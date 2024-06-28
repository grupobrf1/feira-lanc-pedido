const accessToken = getCookie("accessToken");

document.getElementById("cnpj").addEventListener("blur", function () {
  const cnpj = this.value;

  fetch(
    `https://api-feira.azurewebsites.net/consultarclienteporcnpj?cnpj=${cnpj}`,
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
        document.getElementById("cliente").value = "";
        document.getElementById("cidade").value = "";
        document.getElementById("uf").value = "";
      }
    })
    .catch((error) => console.error("Erro ao buscar dados:", error));
});

document
  .getElementById("meuFormulario")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);

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
      .then((response) => response.json())
      .then((data) => {
        console.log("Resposta da API:", data);
        if (data.detail) {
          alert(data.detail);
        } else {
          alert('Resposta da API não contém a chave "detail".');
        }
      })
      .catch((error) => console.error("Erro ao enviar dados:", error));
  });

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}
