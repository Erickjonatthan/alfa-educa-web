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
        const userPhotoElement = document.querySelector('.user-photo img');
        if (userPhotoElement) {
           userPhotoElement.src = `data:image/jpeg;base64,${userData.imgPerfil}`;
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

function openActivityContainer() {
    const container = document.getElementById('activity-container');
    container.classList.remove('hidden');
}

async function listarAtividades(token) {
    try {
        const response = await fetch("https://alfa-educa-server.onrender.com/atividade", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            let errorMessage = "Erro ao listar atividades";
            if (response.status === 401) {
                errorMessage = "Não autorizado. Verifique suas credenciais.";
            } else if (response.status === 500) {
                errorMessage = "Erro no servidor. Tente novamente mais tarde.";
            }
            throw new Error(errorMessage);
        }
        const atividades = await response.json();
        return atividades;
    } catch (error) {
        console.error("Erro ao listar atividades:", error);
        throw error;
    }
}

async function renderizarAtividades() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('Token não encontrado no localStorage');
        return;
    }

    try {
        const atividades = await listarAtividades(token);
        const activitiesList = document.getElementById('activities-list');
        activitiesList.innerHTML = '';

        atividades
            .filter(atividade => atividade.tipo !== 'CALIGRAFIA') // Filtra atividades do tipo CALIGRAFIA
            .forEach(atividade => {
                const activityButton = document.createElement('button');
                activityButton.className = 'activity-button';
                activityButton.textContent = atividade.titulo;
                activityButton.onclick = () => openActivityContainer(atividade);

                activitiesList.appendChild(activityButton);
            });
    } catch (error) {
        console.error('Erro ao renderizar atividades:', error);
    }
}

function openActivityContainer(atividade) {
    const container = document.getElementById('activity-container');
    container.querySelector('h2').textContent = atividade.titulo;
    container.querySelector('p:nth-of-type(1)').textContent = atividade.subtitulo;
    container.querySelector('p:nth-of-type(2)').textContent = `Nível: ${atividade.nivel}`;
    container.querySelector('p:nth-of-type(3)').textContent = `Pontos: ${atividade.pontos}`;
    container.classList.remove('hidden');

    document.getElementById('start-button').onclick = () => {
        localStorage.setItem('atividadeId', atividade.id); // Armazena o ID da atividade no localStorage
        window.location.href = 'tela-da-atividade.html';
    };

    document.getElementById('close-button').onclick = () => {
        container.classList.add('hidden');
    };
}

renderizarAtividades();