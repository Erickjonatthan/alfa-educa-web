import { API_URL } from "./const.js";

// Tentar login automático ao carregar a página
async function tentarLoginComToken() {
    const token = localStorage.getItem("token");
    const contaId = localStorage.getItem("contaId");

    if (!token || !contaId) {
        console.log("Nenhum token ou contaId encontrado no localStorage.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}cadastro/${contaId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            console.log("Login automático bem-sucedido!");
            window.location.href = "pagina-inicial.html";
        } else {
            console.log("Token inválido ou expirado. Continuando para a página de login.");
            localStorage.removeItem("token");
            localStorage.removeItem("contaId");
        }
    } catch (error) {
        console.error("Erro ao tentar login com token:", error);
    }
}

document.addEventListener("DOMContentLoaded", tentarLoginComToken);

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const login = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;

    const userData = {
        login: login,
        senha: senha,
    };

    const loading = document.getElementById('loading');
    loading.style.display = 'flex'; // Mostrar o loading

    try {
        const response = await fetch(`${API_URL}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (response.ok) {
            const { dadosToken } = data;
            localStorage.setItem('token', dadosToken.token);
            localStorage.setItem('contaId', dadosToken.contaId);
            window.location.href = 'pagina-inicial.html';
        } else {
            console.log('Falha no login:', response.status);
            switch (response.status) {
                case 400:
                    alert('Erro: Requisição inválida. Verifique os dados e tente novamente.');
                    break;
                case 401:
                    alert('Erro: Email ou senha inválido. Tente novamente.');
                    break;
                case 500:
                    alert('Erro: Erro no servidor. Tente novamente mais tarde.');
                    break;
                default:
                    alert('Erro: Ocorreu um erro. Tente novamente.');
                    break;
            }
            console.log('Falha no login:', data.message || data);
        }
    } catch (error) {
        console.log('Erro durante o login:', error);
        alert('Erro: Ocorreu um erro durante o login. Tente novamente.');
    } finally {
        loading.style.display = 'none'; // Esconder o loading
    }
});

