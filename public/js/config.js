import EnvLoader from './env-loader.js';

// Configuração do ambiente
// Este arquivo carrega as configurações baseadas no ambiente
class Config {
    constructor() {
        const envConfig = EnvLoader.getConfig();
        this.API_URL = envConfig.API_URL;
    }
}

// Instância global da configuração
const config = new Config();

// Exportar como módulo ES6
export default config;
export const API_URL = config.API_URL;
