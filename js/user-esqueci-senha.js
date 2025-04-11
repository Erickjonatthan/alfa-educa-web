import { API_URL } from "./const.js";
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('forgot-password-form');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        await handleForgotPassword(email);
    });
});

const handleForgotPassword = async (email) => {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex'; // Mostrar o loading
    if (!email) {
        alert('Erro: O campo de email é obrigatório!');
        loading.style.display = 'none'; // Esconder o loading
        return;
    }

    try {
        const response = await fetch(`${API_URL}login/recuperar-senha`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email }),
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (response.ok) {
            loading.style.display = 'none'; // Esconder o loading
            alert('Sucesso: Um email com instruções para redefinir sua senha foi enviado.');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 500);

        } else {
            console.log('Falha ao enviar email:', response.status);
            switch (response.status) {
                case 400:
                    alert('Erro: Requisição inválida. Verifique os dados e tente novamente.');
                    break;
                case 404:
                    alert('Erro: Email não encontrado. Verifique o email e tente novamente.');
                    break;
                case 500:
                    alert('Erro: Erro no servidor. Tente novamente mais tarde.');
                    break;
                default:
                    alert('Erro: Ocorreu um erro. Tente novamente.');
                    break;
            }
            loading.style.display = 'none'; // Esconder o loading
            console.log('Falha ao enviar email:', data.message || data);
        }
    } catch (error) {
        loading.style.display = 'none'; // Esconder o loading
        console.log('Erro durante o envio do email:', error);
        alert('Erro: Ocorreu um erro ao enviar o email. Tente novamente.');
    }
};