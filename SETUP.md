# ReadMark — Instrucciones de instalación

## 1. Instalar dependencias

```bash
cd readmark
npm install
```

## 2. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus valores reales:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Genera con `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` en desarrollo |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth en [console.cloud.google.com](https://console.cloud.google.com) |
| `STORAGE_*` | Credenciales de Cloudflare R2 o AWS S3 |

## 3. Configurar la base de datos

```bash
# Aplicar el schema y generar el cliente Prisma
npm run db:push

# O usar migraciones (recomendado para producción)
npm run db:migrate
```

## 4. Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Configurar Cloudflare R2 (recomendado)

1. Crea un bucket en el dashboard de Cloudflare R2
2. Activa el **acceso público** o configura un dominio personalizado para `STORAGE_PUBLIC_URL`
3. Crea un API token con permisos de lectura/escritura
4. Habilita CORS en el bucket:

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://tu-dominio.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-Type"],
    "MaxAgeSeconds": 3600
  }
]
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/         → NextAuth + registro
│   │   ├── pdfs/         → CRUD de PDFs
│   │   ├── highlights/   → Resaltados
│   │   ├── comments/     → Comentarios
│   │   └── color-slots/  → Colores personalizados
│   ├── auth/             → Signin / Signup pages
│   ├── dashboard/        → Lista de PDFs
│   └── reader/[pdfId]/   → Lector principal
├── components/
│   ├── reader/           → PdfReader, Sidebar, paneles
│   └── dashboard/        → Cards, UploadModal
├── hooks/                → useHighlights, useComments, useDictionary
├── store/                → Zustand (readerStore)
├── lib/                  → prisma, auth, s3, utils
└── types/                → Tipos TypeScript compartidos
```

## Shortcuts de teclado

| Shortcut | Acción |
|---|---|
| `1` / `2` / `3` | Activar slot de color |
| `Ctrl+F` | Abrir buscador |
| `Esc` | Cerrar modal / limpiar búsqueda |
| `Ctrl+Enter` | Guardar comentario |
| `Enter` / `Shift+Enter` | Siguiente / anterior resultado de búsqueda |
