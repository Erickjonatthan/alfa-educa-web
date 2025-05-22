import { API_URL } from "./const.js";
function checkTokenAndRedirect() {
  const token = localStorage.getItem('token');
  if (!token) {
      localStorage.clear();
      window.location.href = 'login.html';
  }
}

checkTokenAndRedirect();

function toggleUserMenu() {
  const userMenu = document.getElementById('user-menu');
  userMenu.classList.toggle('hidden');
}

window.toggleUserMenu = toggleUserMenu;

document.querySelector('.logout').addEventListener('click', function() {
  localStorage.clear();
  location.replace('login.html');
});

async function fetchUserData() {
  const loading = document.getElementById('loading');
  loading.style.display = 'flex'; // Mostrar o loading

  const accountId = localStorage.getItem('contaId');
  const token = localStorage.getItem('token');
  console.log('Token:', token);

  if (!accountId || !token) {
      console.error('Account ID ou token não encontrado no localStorage');
      loading.style.display = 'none'; // Esconder o loading em caso de erro
      return;
  }

  try {
      const response = await fetch(`${API_URL}cadastro/${accountId}`, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          }
      });

      if (!response.ok) {
          throw new Error('Erro na requisição: ' + response.statusText);
      }

      const userData = await response.json();
      console.log('Dados do usuário:', userData);

      localStorage.setItem('userData', JSON.stringify(userData));

      const userPhotoElement = document.querySelector('.user-photo img');
      if (userPhotoElement) {
          userPhotoElement.src = userData.imgPerfil ? `data:image/jpeg;base64,${userData.imgPerfil}` : './imagem/user-logo.jpg';
      } else {
          console.error('Elementos de nome ou foto do usuário não encontrados');
      }
  } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error.message);
  } finally {
      loading.style.display = 'none'; // Esconder o loading após a tentativa de fetch
  }
}

fetchUserData();

async function listarConquistaUsuario(token, userId) {
  try {
    const response = await fetch(
      `${API_URL}conquista/listar/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      let errorMessage = "Erro ao listar conquistas do usuário";
      if (response.status === 401) {
        errorMessage = "Não autorizado. Verifique suas credenciais.";
      } else if (response.status === 500) {
        errorMessage = "Erro no servidor. Tente novamente mais tarde.";
      }
      throw new Error(errorMessage);
    }

    const conquistas = await response.json();
    return conquistas;
  } catch (error) {
    console.error("Erro ao listar conquistas do usuário:", error);
    throw error;
  }
}

async function desbloquearConquistas(token, userId) {
  try {
    const response = await fetch(`${API_URL}conquista/desbloquear/${userId}`, { // Corrigido o endpoint
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Erro ao desbloquear conquistas:', response.statusText);
    } else {
      console.log('Conquistas desbloqueadas com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao desbloquear conquistas:', error);
  }
}

async function renderizarConquistas() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("contaId");
  if (!token || !userId) {
    console.error("Token ou ID do usuário não encontrado no localStorage");
    return;
  }

  try {
    // Desbloquear conquistas do usuário ao acessar a tela
    await desbloquearConquistas(token, userId);

    const conquistas = await listarConquistaUsuario(token, userId);
    console.log("Conquistas do usuário:", conquistas);

    const conquistaContainer = document.querySelector(".conquista-container");
    conquistaContainer.innerHTML = "";

    conquistas.forEach((conquista) => {
      console.log("Conquista:", conquista);

      const conquistaElement = document.createElement("div");
      conquistaElement.className = "conquista-item";

      // Adicionando imagem padrão caso `imgConquista` seja null
      const imgSrc = conquista.imgConquista
        ? `data:image/jpeg;base64,${conquista.imgConquista}`
        : "./imagem/trofeu-padrao.png";

      conquistaElement.innerHTML = `
        <div class="conquista-card">
          <img src="${imgSrc}" alt="Troféu" class="conquista-imagem">
          <div class="conquista-detalhes">
            <h2>${conquista.titulo}</h2>
            <p>${conquista.descricao}</p>
            <ul>
              ${conquista.nivelRequerido ? `<li>Nível Requerido: ${conquista.nivelRequerido}</li>` : ""}
              ${conquista.pontosRequeridos ? `<li>Pontos Requeridos: ${conquista.pontosRequeridos}</li>` : ""}
              ${conquista.atividadesRequeridas ? `<li>Atividades Requeridas: ${conquista.atividadesRequeridas}</li>` : ""}
              ${conquista.primeiraRespostaCorreta ? `<li>Primeira Resposta Correta: ${conquista.primeiraRespostaCorreta}</li>` : ""}
              ${conquista.diasConsecutivosRequeridos ? `<li>Dias Consecutivos Requeridos: ${conquista.diasConsecutivosRequeridos}</li>` : ""}
            </ul>
          </div>
        </div>
      `;
      conquistaContainer.appendChild(conquistaElement);
    });
  } catch (error) {
    console.error("Erro ao renderizar conquistas:", error);
  }
}

document.addEventListener("DOMContentLoaded", renderizarConquistas);