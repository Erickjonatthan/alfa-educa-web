class ApiUrlLoader {

    static getConfig() {
        // Para uso em navegador, retorna configurações baseadas no ambiente
        const isDev = window.location.hostname.startsWith('127.0.0.1')
        
        if (isDev) {
            // Configurações de desenvolvimento
            return {
                API_URL: 'http://localhost:8081/'
            };
        } else {
            // Configurações de produção
            return {
                API_URL: 'http://host.docker.internal:8081/'
            };
        }
    }
}

export default ApiUrlLoader;
