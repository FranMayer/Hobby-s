# HobbyCount

Colecciones de Ayelen (vinilos, cámaras) y Franco (autos F1 a escala, monedas).

App: https://hobby-s.vercel.app

## Stack

- React + Vite, desplegado en Vercel (cada push a `main` publica)
- Supabase: una tabla por colección, login con email y contraseña, RLS solo para usuarios logueados
- GitHub Actions: `supabase-keepalive.yml` consulta la base a diario para que el plan gratis no se pause

## Desarrollo

```bash
npm install
npm run dev
```

Crear `.env.local` con:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Base de datos

`supabase-setup.sql` crea las tablas y las políticas. Correrlo en Supabase → SQL Editor.

## Usuarios

Los registros desde la app están cerrados. Para agregar a alguien:
Supabase → Authentication → Users → Add user → Create new user (marcar *Auto Confirm User*).

Para cambiar una contraseña olvidada: borrar el usuario y crearlo de nuevo con el mismo email (los datos no dependen del usuario).

## Backups

El plan gratis de Supabase no guarda copias. Desde el Dashboard:

- **Exportar Todo** descarga un `.json` con las 4 colecciones.
- **Restaurar** vuelve a cargarlo (actualiza por id, no duplica).

Si la app aparece vacía o con error de conexión: revisar primero que el proyecto de Supabase no esté pausado y que el workflow de keep-alive siga activo en la pestaña Actions.
