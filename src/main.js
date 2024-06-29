AWS.config.region = "us-east-1"; // Ex: 'us-east-1'
const poolData = {
  UserPoolId: "us-east-1_8CR2ds1no",
  ClientId: "1bsafs36p04f81rqq4sb9v2oei",
};

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
});

const form = document.querySelector("form");
const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const userErrorAlert = document.getElementById("userErrorAlert");
const passwordErrorAlert = document.getElementById("passwordErrorAlert");
const loginErrorAlert = document.getElementById("loginErrorAlert");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Resetar alertas e classes de erro
  userErrorAlert.classList.add("d-none");
  passwordErrorAlert.classList.add("d-none");
  loginErrorAlert.classList.add("d-none");
  usernameField.classList.remove("is-invalid");
  passwordField.classList.remove("is-invalid");

  const username = usernameField.value;
  const password = passwordField.value;

  let isValid = true;

  if (!username) {
    userErrorAlert.classList.remove("d-none");
    usernameField.classList.add("is-invalid");
    isValid = false;
  }

  if (!password) {
    passwordErrorAlert.classList.remove("d-none");
    passwordField.classList.add("is-invalid");
    isValid = false;
  }

  if (!isValid) {
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

      window.location.href = "/fornecedor.html";
    } else {
      throw new Error("Autenticação falhou. Verifique suas credenciais.");
    }
  } catch (err) {
    // Mostrar o alerta de erro de login
    loginErrorAlert.classList.remove("d-none");

    // Mostrar o modal de erro
    const errorModal = new bootstrap.Modal(
      document.getElementById("errorModal")
    );
    errorModal.show();

    console.log(err.message);
  }
});

// Alternar visibilidade da senha
togglePassword.addEventListener("click", () => {
  const type =
    passwordField.getAttribute("type") === "password" ? "text" : "password";
  passwordField.setAttribute("type", type);

  // Alternar o ícone
  togglePassword.classList.toggle("fa-eye");
  togglePassword.classList.toggle("fa-eye-slash");
});

// Mostrar o ícone de olho quando o usuário começar a digitar a senha
passwordField.addEventListener("input", () => {
  if (passwordField.value.length > 0) {
    togglePassword.style.display = "block";
  } else {
    togglePassword.style.display = "none";
  }
});
