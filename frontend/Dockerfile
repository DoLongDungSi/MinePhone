FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Expose port Vite default
EXPOSE 5173
# Chạy dev server host 0.0.0.0 để Docker map được
CMD ["npm", "run", "dev", "--", "--host"]