class ApiUrlLoader {

    static getConfig() {
        // Para uso em navegador, retorna configurações baseadas no ambiente
        const hostname = window.location.hostname;
        const isDev = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('127.0.0.1');
        
        if (isDev) {
            // Configurações de desenvolvimento - para quando rodando localmente
            return {
                API_URL: 'http://localhost:8081/'
            };
        } else {
            // Configurações de produção - para quando rodando em containers ou produção
            return {
                API_URL: 'http://host.docker.internal:8081/'
            };
        }
    }
}

export default ApiUrlLoader;
