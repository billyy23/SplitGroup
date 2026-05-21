# SplitGroup

Aplicación para gestionar gastos compartidos entre grupos. Desarrollada con Angular 21, AngularFire 21 y Firebase (Auth + Firestore).

---

## Requisitos previos

Instala lo siguiente antes de continuar:

- **Node.js LTS** → https://nodejs.org (versión LTS recomendada)
- **Angular CLI** → se instala con el comando:
  ```bash
  npm install -g @angular/cli
  ```

---

## Instalación

### Opción fácil (Windows)

Haz doble clic en el archivo `instalar.bat`.

### Opción manual

Abre una terminal en la carpeta del proyecto y ejecuta los pasos en orden:

```bash
# 1. Instalar dependencias (--legacy-peer-deps es necesario por conflictos de versiones entre @angular/fire RC y rxfire)
npm install --legacy-peer-deps

# 2. Arrancar la aplicación
ng serve -o
```

Luego abre el navegador en: http://localhost:4200

---

## Notas sobre dependencias

Este proyecto usa `@angular/fire@21.0.0-rc.0` junto con `firebase@12`, que actualmente tienen un conflicto de peer dependencies declarado con `rxfire`. Por eso es **obligatorio** usar `--legacy-peer-deps` al instalar. Sin ese flag, `npm install` fallará.

No uses `npm audit fix` sin `--legacy-peer-deps` o romperá la resolución de paquetes.

---

## Si npm no funciona en PowerShell

Abre PowerShell como administrador y ejecuta:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Luego cierra y vuelve a abrir la terminal.

---

## Stack técnico

- **Angular 21**
- **AngularFire 21.0.0-rc.0**
- **Firebase 12** (Auth + Firestore)
- **Bootstrap 5**