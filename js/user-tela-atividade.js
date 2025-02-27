function checkTokenAndRedirect() {
  const token = localStorage.getItem("token");
  const atividadeId = localStorage.getItem("atividadeId");
  if (!token || !atividadeId) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}

checkTokenAndRedirect();

let tentativas = 0;

function mostrarLoading() {
  document.getElementById("loading").style.display = "flex";
}

function esconderLoading() {
  document.getElementById("loading").style.display = "none";
}

async function criarResposta(token, resposta, atividadeId, usuarioId) {
  try {
    console.log("Iniciando a criação da resposta...");
    console.log("Token:", token);
    console.log("Resposta:", resposta);
    console.log("Atividade ID:", atividadeId);
    console.log("Usuário ID:", usuarioId);

    const response = await fetch(
      "https://alfa-educa-server.onrender.com/resposta",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ resposta, atividadeId, usuarioId }),
      }
    );

    console.log("Resposta do servidor recebida:", response);

    if (!response.ok) {
      let errorMessage = "Erro ao criar resposta";
      if (response.status === 400) {
        const errorResponse = await response.json();
        errorMessage = `Erro na requisição: ${errorResponse.message}`;
        console.error(
          "Erro na resposta do servidor:",
          response.status,
          response.statusText,
          errorResponse
        );
      } else if (response.status === 401) {
        errorMessage = "Não autorizado. Verifique suas credenciais.";
      } else if (response.status === 500) {
        errorMessage = "Erro no servidor. Tente novamente mais tarde.";
      } else {
        console.error(
          "Erro na resposta do servidor:",
          response.status,
          response.statusText
        );
      }
      throw new Error(errorMessage);
    }

    const respostaCriada = await response.json();
    console.log("Resposta criada com sucesso:", respostaCriada);
    return respostaCriada;
  } catch (error) {
    console.error("Erro ao criar resposta:", error);
    throw error;
  }
}

async function enviarResposta() {
  const resposta = document.querySelector(".resposta").value;
  if (!resposta.trim()) {
    alert("Por favor, escreva sua resposta antes de enviar.");
    return;
  }

  const token = localStorage.getItem("token");
  const atividadeId = localStorage.getItem("atividadeId");
  const usuarioId = localStorage.getItem("contaId");
  console.log("atividadeId:", atividadeId);
  console.log("usuarioId:", usuarioId);

  mostrarLoading();

  try {
    const respostaCriada = await criarResposta(
      token,
      resposta,
      atividadeId,
      usuarioId
    );
    if (respostaCriada.finalizada) {
      alert("Resposta correta!");
      localStorage.removeItem("atividadeId"); // Remove o atividadeId ao concluir
      //volta para a página de atividades
      window.location.href = "atividade.html";
    } else {
      alert("Resposta incorreta. Tente novamente.");
      tentativas++;
      document.getElementById("tentativas").innerText = tentativas;

      if (tentativas >= 3) {
        alert(
          "Você está com dificuldades para Responder? volte para página de atividades e veja a resposta correta"
        );
        voltar();
      }
    }
  } catch (error) {
    alert(error.message);
  } finally {
    esconderLoading();
  }
}

function voltar() {
  localStorage.removeItem("atividadeId"); // Remove o atividadeId ao voltar
  window.history.back();
}

async function fetchAtividade() {
  const atividadeId = localStorage.getItem("atividadeId");
  const token = localStorage.getItem("token");
  console.log("atividadeId:", atividadeId);
  console.log("token:", token);

  if (!atividadeId || !token) {
    console.error("Atividade ID ou token não encontrado no localStorage");
    return;
  }

  mostrarLoading();

  try {
    const response = await fetch(
      `https://alfa-educa-server.onrender.com/atividade/${atividadeId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro na requisição: " + response.statusText);
    }

    const atividade = await response.json();
    document.querySelector(".titulo").textContent = atividade.titulo;
    document.querySelector(".descricao").textContent = atividade.subtitulo;
    document.querySelector(".exemplo").textContent = atividade.descricao;
  } catch (error) {
    console.error("Erro ao buscar dados da atividade:", error.message);
  } finally {
    esconderLoading();
  }
}

document.addEventListener("DOMContentLoaded", fetchAtividade);
