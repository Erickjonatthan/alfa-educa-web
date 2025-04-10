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

document.addEventListener('click', function(event) {
    const userMenu = document.getElementById('user-menu');
    const userPhoto = document.querySelector('.user-photo');
    if (!userPhoto.contains(event.target) && !userMenu.contains(event.target)) {
        userMenu.classList.add('hidden');
    }
});

async function fetchUserData() {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex'; // Mostrar o loading

    const accountId = localStorage.getItem('contaId');
    const token = localStorage.getItem('token');
    console.log('Token:', token);

    if (!accountId || !token) {
        console.error('Account ID ou token não encontrado no localStorage');
        return;
    }

    try {
        const response = await fetch(`http://69.62.97.224:8081/cadastro/${accountId}`, {
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
        const userPhotoElement = document.querySelector('.user-photo img');
        if (userNameElement && userPhotoElement) {
            userNameElement.textContent = userData.nome;
            if (userData.imgPerfil) {
                userPhotoElement.src = `data:image/jpeg;base64,${userData.imgPerfil}`;
            }
            // Esconder o loading
            loading.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error.message);
    }
}

fetchUserData();

document.querySelector('.logout').addEventListener('click', function() {
    localStorage.clear();
    window.location.href = 'login.html';
});