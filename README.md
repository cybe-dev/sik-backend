# Sistem Informasi Keuangan (Backend)

ini adalah backend dari Sistem Informasi Keuangan berbasis web yang dibangun menggunakan nodejs.

## Requirement

1. Nodejs
2. NPM
3. MySQL Database
4. Nodemon (optional)

## Quick Start

**Instalasi**
Silahkan melakukan configurasi database pada config/config.json, dengan mengisikan sesuai data autentikasi pada database anda.

Ubah nama file .env-example menjadi .env dan lakukan penyesuaian pada JWT_SECRET_KEY dan COMPANY_NAME

Lakukan setup dengan menjalankan perintah berikut pada terminal anda

```
npm run setup
```

Setlah proses migrasi database selesai, anda bisa menjalankan perintah

```
npm start
```

atau jika anda belum menginstall nodemon, maka jalankan perintah berikut

```
node app.js
```

Server akan berjalan pada http://localhost:8080
