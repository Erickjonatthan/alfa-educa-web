import { API_URL } from "./const.js";

document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const userData = {
        nome: nome,
        email: email,
        senha: senha,
    };

    const loading = document.getElementById('loading');
    loading.style.display = 'flex'; // Mostrar o loading

    try {
        const response = await fetch(`${API_URL}cadastro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }

        // Realizar login automaticamente
        const loginData = {
            login: email,
            senha: senha,
        };

        const loginResponse = await fetch(`${API_URL}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        if (!loginResponse.ok) {
            throw new Error('Erro no login: ' + loginResponse.statusText);
        }

        const loginResult = await loginResponse.json();
        const { dadosToken } = loginResult;
        localStorage.setItem('token', dadosToken.token);
        localStorage.setItem('contaId', dadosToken.contaId);
        window.location.href = 'pagina-inicial.html';

    } catch (error) {
        console.log('Erro ao cadastrar ou logar usuário: ' + error.message);
        alert('Erro: ' + error.message);
    } finally {
        loading.style.display = 'none'; // Esconder o loading
    }
});