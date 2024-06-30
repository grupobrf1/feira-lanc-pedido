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
  usernameField.classList.remove("is-invalid");
  passwordField.classList.remove("is-invalid");

  const username = usernameField.value;
  const password = passwordField.value;

  if (!username || !password) {
    loginErrorAlert.classList.remove("d-none");
    if (!username) usernameField.classList.add("is-invalid");
    if (!password) passwordField.classList.add("is-invalid");
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
      throw new Error(
        "Usuário ou senha inválidos. Por favor, tente novamente."
      );
    }
  } catch (err) {
    // Mostrar o alerta de erro de login
    loginErrorAlert.textContent =
      "Usuário ou senha inválidos. Por favor, tente novamente.";
    loginErrorAlert.classList.remove("d-none");
    usernameField.classList.add("is-invalid");
    passwordField.classList.add("is-invalid");
  }
});

// Alternar visibilidade da senha
togglePassword.addEventListener("click", function () {
  const type =
    passwordField.getAttribute("type") === "password" ? "text" : "password";
  passwordField.setAttribute("type", type);
  togglePassword.src =
    type === "password" ? "/src/icons/eye.svg" : "/src/icons/eye-off.svg";
});

passwordField.addEventListener("input", () => {
  togglePassword.style.display =
    passwordField.value.length > 0 ? "block" : "none";
});
