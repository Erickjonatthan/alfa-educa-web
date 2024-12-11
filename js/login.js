document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const login = document.getElementById('email-login').value;
    const senha = document.getElementById('senha-login').value;

    const userData = {
        login: login,
        senha: senha,
    };

    try {
        const response = await fetch('http://localhost:8080/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error('Erro na requisição: ' + response.statusText);
        }

        const result = await response.json();
        
        localStorage.setItem('token', result.token);
        localStorage.setItem('contaId', result.contaId);

        window.location.href = 'pagina-inicial.html';
    } catch (error) {
        console.log('Erro ao logar usuário: ' + error.message);
    }
});