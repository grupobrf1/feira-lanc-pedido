AWS.config.region = "us-east-1"; // Ex: 'us-east-1'
const poolData = {
  UserPoolId: "us-east-1_8CR2ds1no",
  ClientId: "1bsafs36p04f81rqq4sb9v2oei",
};

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
  apiVersion: "2016-04-18",
});

const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = form.username.value;
  const password = form.password.value;

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
      document.cookie = `accessToken=${accessToken}; path=/;`;
      window.location.href = "/fornecedor.html";
    } else {
      throw new Error("Autenticação falhou. Verifique suas credenciais.");
    }
  } catch (err) {
    alert(err.message || JSON.stringify(err));
    console.log(err.message);
  }
});
