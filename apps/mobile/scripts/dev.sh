#!/bin/bash
# Script para desarrollo con Waydroid - una sola terminal
# Uso: ./scripts/dev.sh

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$(id -u)/bus"

cleanup() {
    echo ""
    echo "Cerrando todo..."
    kill $FLUTTER_PID $WATCH_PID $WAYDROID_PID 2>/dev/null
    waydroid session stop 2>/dev/null
    exit 0
}
trap cleanup EXIT INT TERM

# 1. Iniciar waydroid container si no esta corriendo
if ! systemctl is-active --quiet waydroid-container; then
    echo "Iniciando waydroid-container..."
    sudo systemctl start waydroid-container
fi

# 1.5. Habilitar ip_forward y configurar NAT
sudo sysctl -w net.ipv4.ip_forward=1 > /dev/null

NET_IFACE=$(ip route | grep default | awk '{print $5}' | head -1)
echo "Configurando red para Waydroid (interfaz: $NET_IFACE)..."
sudo iptables -t nat -C POSTROUTING -s 192.168.240.0/24 -o "$NET_IFACE" -j MASQUERADE 2>/dev/null || \
    sudo iptables -t nat -A POSTROUTING -s 192.168.240.0/24 -o "$NET_IFACE" -j MASQUERADE
sudo iptables -C FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT 2>/dev/null || \
    sudo iptables -A FORWARD -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
sudo iptables -C FORWARD -i waydroid0 -o "$NET_IFACE" -j ACCEPT 2>/dev/null || \
    sudo iptables -A FORWARD -i waydroid0 -o "$NET_IFACE" -j ACCEPT

# 2. Iniciar sesion + UI en background
echo "Iniciando Waydroid..."
waydroid show-full-ui &
WAYDROID_PID=$!

# Esperar a que Android este listo
echo "Esperando a que Android inicie..."
while ! waydroid status 2>/dev/null | grep -q "RUNNING"; do
    sleep 2
done
echo "Android listo."

# Esperar a que la interfaz waydroid0 este lista
echo "Esperando interfaz de red waydroid0..."
for i in $(seq 1 20); do
    if ip addr show waydroid0 2>/dev/null | grep -q "inet "; then
        echo "waydroid0 activa."
        break
    fi
    sleep 2
done
sleep 3

# 3. Conectar ADB - reintentar hasta que conecte
echo "Conectando ADB..."
adb disconnect 192.168.240.112:5555 2>/dev/null
sleep 2
for i in $(seq 1 15); do
    RESULT=$(adb connect 192.168.240.112:5555 2>&1)
    DEVICES=$(adb devices 2>/dev/null)
    echo "  [$i] $RESULT"
    if echo "$DEVICES" | grep -q "192.168.240.112.*device$"; then
        echo "ADB conectado."
        break
    fi
    sleep 3
done

# Verificar conexion
if ! adb devices | grep -q "192.168.240.112.*device$"; then
    echo "ERROR: No se pudo conectar a Waydroid via ADB"
    echo "Dispositivos:"
    adb devices
    exit 1
fi

# 3.5. Verificar internet en Waydroid
echo "Verificando internet en Waydroid..."
for i in $(seq 1 10); do
    if adb shell ping -c 1 -W 2 8.8.8.8 2>/dev/null | grep -q "1 received"; then
        echo "Waydroid tiene internet."
        break
    fi
    echo "  [$i] Sin internet, reintentando..."
    adb shell setprop net.dns1 8.8.8.8 2>/dev/null
    adb shell setprop net.dns2 8.8.4.4 2>/dev/null
    sleep 3
done

if ! adb shell ping -c 1 -W 2 8.8.8.8 2>/dev/null | grep -q "1 received"; then
    echo "WARN: Waydroid sin internet. Reiniciando sesion..."
    waydroid session stop 2>/dev/null
    sleep 3
    waydroid show-full-ui &
    WAYDROID_PID=$!
    sleep 8
    adb connect 192.168.240.112:5555 2>/dev/null
    sleep 2
fi

# 4. Verificar que flutter lo detecta
echo "Verificando dispositivo Flutter..."
for i in $(seq 1 5); do
    if flutter devices 2>/dev/null | grep -qi "waydroid\|192.168.240"; then
        echo "Flutter detecta Waydroid."
        break
    fi
    sleep 2
done

echo "Iniciando Flutter run..."

# 5. Correr flutter run en background
cd "$PROJECT_DIR"
flutter run --pid-file=/tmp/flutter.pid &
FLUTTER_PID=$!

# Esperar a que flutter compile y lance la app
while [ ! -f /tmp/flutter.pid ]; do
    sleep 2
done
sleep 5

# 6. Auto hot-restart al detectar cambios en lib/
echo ""
echo "====================================="
echo " Watcher activo: guardas -> recarga"
echo " Ctrl+C para cerrar todo"
echo "====================================="
echo ""

while true; do
    inotifywait -r -q -e modify,create,delete "$PROJECT_DIR/lib/"
    if [ -f /tmp/flutter.pid ]; then
        kill -USR2 $(cat /tmp/flutter.pid) 2>/dev/null
    fi
    sleep 1
done &
WATCH_PID=$!

# Esperar a que flutter termine
wait $FLUTTER_PID
