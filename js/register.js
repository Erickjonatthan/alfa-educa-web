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

    try {
        const response = await fetch('https://alfa-educa-server.onrender.com/cadastro', {
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

        // Exibir mensagem de sucesso
    alert('Usuário cadastrado com sucesso!');
    } catch (error) {
        console.log('Erro ao cadastrar usuário: ' + error.message);
    }
});