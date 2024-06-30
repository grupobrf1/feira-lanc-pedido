AWS.config.region = "us-east-1"; // Ex: 'us-east-1'
const poolData = {
  UserPoolId: "us-east-1_8CR2ds1no",
  ClientId: "1bsafs36p04f81rqq4sb9v2oei",
};

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
});

const form = document.querySelector("#loginForm");
const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");
const togglePassword = document.getElementById("togglePasswordIcon");
const loginErrorAlert = document.getElementById("loginErrorAlert");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Resetar alertas e classes de erro
  loginErrorAlert.classList.add("d-none");
  if (usernameField) usernameField.classList.remove("is-invalid");
  if (passwordField) passwordField.classList.remove("is-invalid");

  const username = usernameField ? usernameField.value : "";
  const password = passwordField ? passwordField.value : "";

  let isValid = true;

  if (!username) {
    isValid = false;
  }

  if (!password) {
    isValid = false;
  }

  if (!isValid) {
    loginErrorAlert.classList.remove("d-none");
    if (usernameField) usernameField.classList.add("is-invalid");
    if (passwordField) passwordField.classList.add("is-invalid");
    return;
  }

  const params = {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: poolData.ClientId,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
  };

  try {
    const authResponse = await cognitoIdentityServiceProvider
      .initiateAuth(params)
      .promise();

    if (authResponse.AuthenticationResult) {
      const accessToken = authResponse.AuthenticationResult.AccessToken;
      localStorage.setItem("accessToken", accessToken); // Armazenar no localStorage
      localStorage.setItem("userName", username); // Armazenar nome do usuário no localStorage

      window.location.href = "/lanc_pedido";
    } else {
      throw new Error("Autenticação falhou. Verifique suas credenciais.");
    }
  } catch (err) {
    // Mostrar o alerta de erro de login
    loginErrorAlert.classList.remove("d-none");
    if (usernameField) usernameField.classList.add("is-invalid");
    if (passwordField) passwordField.classList.add("is-invalid");
  }
});

// Alternar visibilidade da senha
if (togglePassword) {
  togglePassword.addEventListener("click", function () {
    const input = passwordField;
    const type =
      input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", type);

    // Alterar o ícone
    if (type === "password") {
      togglePassword.src = "/src/icons/eye.svg";
    } else {
      togglePassword.src = "/src/icons/eye-off.svg";
    }
  });
}

// Mostrar o ícone de olho quando o campo de senha tiver valor
if (passwordField) {
  if (passwordField.value.length > 0) {
    togglePassword.style.display = "block";
  } else {
    togglePassword.style.display = "none";
  }
}
