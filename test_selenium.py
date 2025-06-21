import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# Configurações do Selenium para rodar sem interface gráfica (headless)
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1200,900')
chrome_options.add_argument('--disable-gpu')
chrome_options.add_argument('--remote-debugging-port=9222')
chrome_options.binary_location = '/usr/bin/chromium'

# Usa a URL do serviço site no docker-compose
FRONTEND_URL = 'http://localhost:8082'

# Dados de teste
NOME = "Teste Selenium"
EMAIL = f"selenium_{int(time.time())}@teste.com"
SENHA = "Senha123!"

driver = webdriver.Chrome(options=chrome_options)
driver.set_window_size(1200, 900)
try:
    print("INICIANDO CADASTRO (login.html)")
    driver.get(f"{FRONTEND_URL}/login.html")
    wait = WebDriverWait(driver, 10)
    time.sleep(1)
    # Clica no botão 'Criar' para exibir o formulário de cadastro
    btn_cadastrar = wait.until(EC.element_to_be_clickable((By.ID, "cadastrar")))
    btn_cadastrar.click()
    time.sleep(1)
    # Espera o formulário de cadastro ficar visível
    wait.until(EC.visibility_of_element_located((By.ID, "registrationForm")))
    # Agora preenche o cadastro
    driver.find_element(By.ID, "nome").send_keys(NOME)
    driver.find_element(By.ID, "email").send_keys(EMAIL)
    driver.find_element(By.ID, "senha").send_keys(SENHA)
    wait.until(EC.invisibility_of_element_located((By.ID, "loading")))
    btn_cadastro = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "#registrationForm button[type='submit'], #registrationForm .btn.btn-second")))
    btn_cadastro.click()
    time.sleep(2)
    print(f"CADASTRO FINALIZADO. URL ATUAL: {driver.current_url}")

    # Aguarda redirecionamento para pagina-inicial.html após cadastro
    wait.until(lambda d: "pagina-inicial.html" in d.current_url)
    print(f"REDIRECIONADO PARA: {driver.current_url}")

    print("APAGANDO CONTA (usuario.html)")
    driver.get(f"{FRONTEND_URL}/usuario.html")
    wait.until(EC.invisibility_of_element_located((By.ID, "loading")))
    print(f"URL ATUAL: {driver.current_url}")
    if not "usuario.html" in driver.current_url:
        print(f"NÃO ESTÁ NA PÁGINA DE USUÁRIO! URL ATUAL: {driver.current_url}")
        print("HTML ATUAL DA PÁGINA:")
        print(driver.page_source)
        raise Exception("Não está na página de usuário após login/cadastro.")
    try:
        btn_delete = wait.until(lambda d: d.find_element(By.ID, "delete-account-button") and d.find_element(By.ID, "delete-account-button").is_enabled() and d.find_element(By.ID, "delete-account-button"))
        btn_delete.click()
    except Exception:
        print("NÃO FOI POSSÍVEL ENCONTRAR OU CLICAR NO BOTÃO DE EXCLUIR CONTA!")
        print("HTML ATUAL DA PÁGINA:")
        print(driver.page_source)
        raise
    time.sleep(1)
    alert = driver.switch_to.alert
    alert.accept()
    time.sleep(2)
    print(f"CONTA APAGADA. URL ATUAL: {driver.current_url}")

    # Aguarda redirecionamento após exclusão
    wait.until(lambda d: "login.html" in d.current_url or "pagina-inicial.html" in d.current_url)
    print(f"CONTA APAGADA. URL ATUAL: {driver.current_url}")

    # Verifica se foi redirecionado para o login ou página inicial (exclusão bem-sucedida)
    assert "login.html" in driver.current_url or "pagina-inicial.html" in driver.current_url, "Não foi possível excluir a conta."
    print("TESTE OK")
except Exception as e:
    # Captura alertas abertos
    try:
        alert = driver.switch_to.alert
        print(f"ALERTA NA TELA: {alert.text}")
    except Exception:
        pass
    import traceback
    print("TRACEBACK:")
    traceback.print_exc()
    print(f"ERRO NO TESTE: {e}")
    exit(1)
finally:
    driver.quit()
