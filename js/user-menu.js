function toggleUserMenu() {
    const userMenu = document.getElementById('user-menu');
    userMenu.classList.toggle('hidden');
}

document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('user-menu');
    const userPhoto = document.querySelector('.user-photo');
    if (!userPhoto.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.classList.add('hidden');
    }
});

async function fetchUserData() {
    const accountId = localStorage.getItem('contaId');
    const token = localStorage.getItem('token');

    if (!accountId || !token) {
        console.error('Account ID ou token não encontrado no localStorage');
        return;
    }

    try {
        const response = await fetch(`https://alfa-educa-server.onrender.com/cadastro/${accountId}`, {
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

        const userNameElement = document.getElementById('user-name');
        const userEmailElement = document.getElementById('user-email');
        if (userNameElement && userEmailElement) {
            userNameElement.textContent = userData.nome;
            userEmailElement.textContent = userData.email;
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error.message);
    }
}

fetchUserData();

document.querySelector('.logout').addEventListener('click', function() {

    localStorage.clear();

    window.location.href = 'index.html';
});