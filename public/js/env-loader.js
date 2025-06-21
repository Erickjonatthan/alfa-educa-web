// Script para carregar variáveis de ambiente
// Este script pode ser usado para diferentes ambientes (dev, prod, etc.)

class EnvLoader {
    static async loadEnv() {
        try {
            // Em um ambiente real, você pode carregar de diferentes fontes
            // Por exemplo, de um arquivo .env via fetch ou de variáveis de ambiente do servidor
            
            // Para desenvolvimento local, retorna as configurações padrão
            return {
                API_URL: process.env.API_URL || 'http://localhost:8081/'
            };
        } catch (error) {
            console.warn('Não foi possível carregar as variáveis de ambiente, usando valores padrão');
            return {
                API_URL: 'http://localhost:8081/'
            };
        }
    }

    static getConfig() {
        // Para uso em navegador, retorna configurações baseadas no ambiente
        const isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1';
        
        if (isProduction) {
            // Configurações de produção
            return {
                API_URL: 'https://sua-api-producao.com/'
            };
        } else {
            // Configurações de desenvolvimento
            return {
                API_URL: 'http://host.docker.internal:8081/'
            };
        }
    }
}

export default EnvLoader;
