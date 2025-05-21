FROM nginx:alpine

# Copia os arquivos estáticos para o NGINX
COPY ./public /usr/share/nginx/html

# Configuração customizada do NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
