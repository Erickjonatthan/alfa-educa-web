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
        const userPhotoElement = document.querySelector('.user-photo img');
        if (userPhotoElement) {
            if (userData.imgPerfil) {
                userPhotoElement.src = `data:image/jpeg;base64,${userData.imgPerfil}`;
            } else {
                userPhotoElement.src = './imagem/user-logo.jpg'; // Define a imagem padrão
            }
        }
        // Esconder o loading
        loading.style.display = 'none';
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error.message);
        loading.style.display = 'none'; // Esconde o loading mesmo em caso de erro
    }
}

fetchUserData();

document.querySelector('.logout').addEventListener('click', function() {
    localStorage.clear();
    location.replace('login.html');
});

async function listarResposta(token) {
    try {
        const response = await fetch("http://69.62.97.224:8081/resposta/usuario/respostas", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            let errorMessage = "Erro ao listar resposta";
            if (response.status === 401) {
                errorMessage = "Não autorizado. Verifique suas credenciais.";
            } else if (response.status === 500) {
                errorMessage = "Erro no servidor. Tente novamente mais tarde.";
            }
            throw new Error(errorMessage);
        }
        const respostas = await response.json();
        return respostas;
    } catch (error) {
        console.error("Erro ao listar resposta:", error);
        throw error;
    }
}

async function listarAtividades(token) {
    try {
        const response = await fetch("http://69.62.97.224:8081/atividade", {
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
        const respostas = await listarResposta(token);
        console.log('Atividades:', atividades);
        console.log('Respostas:', respostas);
        const activitiesList = document.getElementById('activities-list');
        activitiesList.innerHTML = '';

        atividades
            .filter(atividade => atividade.tipo !== 'CALIGRAFIA') // Filtra atividades do tipo CALIGRAFIA
            .forEach(atividade => {
                const respostasAtividade = respostas.filter(r => r.atividadeId === atividade.id);
                console.log('Respostas da Atividade:', respostasAtividade);
                const finalizada = respostasAtividade.some(r => r.finalizada);
                console.log('Finalizada:', finalizada);

                const activityButton = document.createElement('button');
                activityButton.className = 'activity-button';
                activityButton.textContent = atividade.titulo;
                activityButton.onclick = () => openActivityContainer(atividade, finalizada);

                if (finalizada) {
                    activityButton.style.borderColor = 'green';
                }

                activitiesList.appendChild(activityButton);
            });
    } catch (error) {
        console.error('Erro ao renderizar atividades:', error);
    }
}

function openActivityContainer(atividade, finalizada) {
    const container = document.getElementById('activity-container');
    container.querySelector('h2').textContent = atividade.titulo;
    container.querySelector('p:nth-of-type(1)').textContent = atividade.subtitulo;
    container.querySelector('p:nth-of-type(2)').textContent = `Nível: ${atividade.nivel}`;
    container.querySelector('p:nth-of-type(3)').textContent = `Pontos: ${atividade.pontos}`;
    
    const resposta = atividade.respostaCorreta; // Supondo que a resposta esteja no objeto atividade
    const responseElement = container.querySelector('#activity-response');
    if (resposta) {
        responseElement.textContent = `Resposta Correta: ${resposta}`;
        responseElement.classList.remove('hidden');
    } else {
        responseElement.classList.add('hidden');
    }

    container.classList.remove('hidden');

    const startButton = document.getElementById('start-button');
    if (finalizada) {
        startButton.textContent = 'Finalizada';
        startButton.disabled = true;
    } else {
        startButton.textContent = 'Iniciar';
        startButton.disabled = false;
        startButton.onclick = () => {
            localStorage.setItem('atividadeId', atividade.id); // Armazena o ID da atividade no localStorage
            window.location.href = 'tela-da-atividade.html';
        };
    }

    document.getElementById('close-button').onclick = () => {
        container.classList.add('hidden');
    };
}
renderizarAtividades();