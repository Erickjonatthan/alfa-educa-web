function checkTokenAndRedirect() {
    const token = localStorage.getItem('token');
    if (!token) {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

checkTokenAndRedirect();

// Função para buscar dados do usuário
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
        const userPhotoElement = document.querySelector('.profile-picture img');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const userLevelElement = document.getElementById('user-level');
        const xpProgressElement = document.getElementById('xp-progress');
        const xpTextElement = document.getElementById('xp-text');

        if (userNameElement && userPhotoElement && usernameInput && emailInput && userLevelElement && xpProgressElement && xpTextElement) {
            userNameElement.textContent = userData.nome;
            userPhotoElement.src = userData.imgPerfil ? `data:image/jpeg;base64,${userData.imgPerfil}` : './imagem/user-logo.jpg';
            usernameInput.value = userData.nome;
            emailInput.value = userData.email;

            const { level, xp, nextLevelXp } = calculateLevel(userData.pontos);
            userLevelElement.textContent = level;
            xpProgressElement.style.width = `${(xp / nextLevelXp) * 100}%`;
            xpTextElement.textContent = `XP: ${xp}/${nextLevelXp}`;

            loading.style.display = 'none'; // Esconder o loading
        }
    } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error.message);
        loading.style.display = 'none'; // Esconder o loading em caso de erro
    }
}

// Função para calcular o nível do usuário com base nos pontos
function calculateLevel(xp) {
    const level = Math.floor(xp / 100);
    const currentLevelXp = xp % 100;
    const nextLevelXp = 100;
    return { level, xp: currentLevelXp, nextLevelXp };
}

// Chamar a função para buscar dados do usuário ao carregar a página
fetchUserData();

// Habilitar o botão de salvar quando houver mudanças no formulário
document.getElementById('edit-form').addEventListener('input', function() {
    const saveButton = document.getElementById('save-button');
    saveButton.disabled = false;
});

// Função para editar os dados do usuário
document.getElementById('edit-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const loading = document.getElementById('loading');
    loading.style.display = 'flex'; // Mostrar o loading

    const token = localStorage.getItem('token');
    const accountId = localStorage.getItem('contaId');
    const user = {
        id: accountId,
        nome: document.getElementById('username').value,
        email: document.getElementById('email').value,
    };

    const password = document.getElementById('password').value;
    if (password) {
        user.senha = password;
    }

    const profilePictureFile = document.getElementById('profile-picture').files[0];
    if (profilePictureFile) {
        user.imgPerfil = await toBase64(profilePictureFile);
    }

    console.log('Dados do usuário a serem enviados:', user);

    try {
        const response = await editarConta(token, user);
        if (response && response.ok) {
            fetchUserData(); // Atualizar os dados exibidos
        } else {
            alert('Erro ao atualizar os dados.');
        }
    } catch (error) {
        console.error('Erro ao editar conta:', error);
    } finally {
        loading.style.display = 'none'; // Esconder o loading após a operação
    }
});

// Função auxiliar para converter arquivo para base64
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); // Remove o prefixo "data:image/jpeg;base64,"
        reader.onerror = error => reject(error);
    });
}

// Função auxiliar para editar a conta do usuário
async function editarConta(token, user) {
    try {
        const response = await fetch(`http://69.62.97.224:8081/cadastro`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            throw new Error('Erro ao editar conta');
        }

        return response;
    } catch (error) {
        console.error('Erro ao editar conta:', error);
        throw error;
    }
}

// Função para excluir a conta do usuário
document.getElementById('delete-account-button').addEventListener('click', async function() {
    const confirmation = confirm('Você tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.');
    if (confirmation) {
        const accountId = localStorage.getItem('contaId');
        const token = localStorage.getItem('token');
        try {
            const response = await deletarConta(accountId, token);
            if (response.ok) {
                window.location.href = 'pagina-inicial.html';
            } else {
                alert('Erro ao excluir a conta.');
            }
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            alert('Erro ao excluir a conta.');
        }
    }
});

// Função auxiliar para deletar a conta do usuário
async function deletarConta(id, token) {
    try {
        const response = await fetch(`http://69.62.97.224:8081/cadastro/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            let errorMessage = 'Erro ao deletar conta';
            if (response.status === 401) {
                errorMessage = 'Não autorizado. Verifique suas credenciais.';
            } else if (response.status === 404) {
                errorMessage = 'Usuário não encontrado.';
            } else if (response.status === 500) {
                errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
            }
            throw new Error(errorMessage);
        }

        return response;
    } catch (error) {
        console.error('Erro ao deletar conta:', error);
        throw error;
    }
}