---
name: waydroid-dev
description: Ejecutar y depurar la app Flutter mobile usando Waydroid como emulador Android en Linux
trigger: /waydroid
---

# Waydroid Dev Environment

Script de desarrollo que automatiza el flujo completo para correr la app Flutter en Waydroid.

## Ubicacion

`apps/mobile/scripts/dev.sh`

## Que hace

1. Inicia el servicio `waydroid-container`
2. Habilita `ip_forward` y configura NAT (iptables) para dar internet a Waydroid
3. Lanza `waydroid show-full-ui` y espera que Android este RUNNING
4. Conecta ADB a `192.168.240.112:5555` con reintentos
5. Verifica conectividad (ping 8.8.8.8) y configura DNS si falta
6. Verifica que Flutter detecte el dispositivo
7. Ejecuta `flutter run` desde `apps/mobile/`
8. Activa watcher con `inotifywait` para hot-restart automatico al guardar

## Uso

```bash
cd apps/mobile
chmod +x scripts/dev.sh
./scripts/dev.sh
```

## Requisitos

- waydroid instalado y configurado
- adb (Android Debug Bridge)
- inotifywait (`inotify-tools`)
- Flutter SDK en PATH

## Troubleshooting

- **Sin internet en Waydroid**: El script reintenta y reinicia la sesion automaticamente. Si persiste, verificar que la interfaz de red detectada es correcta.
- **ADB no conecta**: Asegurar que waydroid tiene ADB habilitado (`waydroid prop set persist.waydroid.adb 1`).
- **Flutter no detecta dispositivo**: Ejecutar `adb devices` manualmente y verificar que aparece como `device` (no `offline`).
