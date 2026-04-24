import 'package:flutter/material.dart';

class DashboardTab extends StatelessWidget {
  const DashboardTab({super.key});

  static const _gold = Color(0xFFD4AF37);
  static const _darkGold = Color(0xFF735C00);
  static const _dark = Color(0xFF1C1B1B);
  static const _muted = Color(0xFF7F7663);

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Greeting banner ────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF735C00), Color(0xFFD4AF37)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(22),
              boxShadow: [
                BoxShadow(
                  color: _gold.withOpacity(0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Hola, Domiciliario',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Martes 22 de abril · Ruta activa',
                        style: TextStyle(
                          color: Colors.white.withOpacity(0.8),
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.15),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.delivery_dining_rounded, color: Colors.white, size: 28),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Stats row ──────────────────────────────────────
          const Text(
            'RESUMEN DEL DÍA',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _muted, letterSpacing: 2),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _StatCard(icon: Icons.receipt_long_rounded, label: 'Ventas hoy', value: '—', color: _darkGold)),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(icon: Icons.payments_rounded, label: 'Cobros pend.', value: '—', color: const Color(0xFF1B6B4C))),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(icon: Icons.route_rounded, label: 'Entregas', value: '—', color: const Color(0xFF5B4FCF))),
            ],
          ),
          const SizedBox(height: 28),

          // ── Quick actions ──────────────────────────────────
          const Text(
            'ACCIONES RÁPIDAS',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _muted, letterSpacing: 2),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _ActionCard(
                  icon: Icons.add_circle_outline_rounded,
                  label: 'Nueva venta',
                  color: _gold,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _ActionCard(
                  icon: Icons.attach_money_rounded,
                  label: 'Registrar pago',
                  color: const Color(0xFF1B6B4C),
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),

          // ── Locked modules ─────────────────────────────────
          const Text(
            'MÓDULOS DEL SISTEMA',
            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _muted, letterSpacing: 2),
          ),
          const SizedBox(height: 12),
          _LockedModuleCard(
            icon: Icons.inventory_2_outlined,
            label: 'Inventario',
            description: 'Gestión de productos y stock',
            locked: true,
          ),
          const SizedBox(height: 8),
          _LockedModuleCard(
            icon: Icons.group_outlined,
            label: 'Clientes',
            description: 'Base de datos de clientes',
            locked: true,
          ),
          const SizedBox(height: 8),
          _LockedModuleCard(
            icon: Icons.analytics_outlined,
            label: 'Reportes',
            description: 'Análisis y estadísticas',
            locked: true,
          ),
          const SizedBox(height: 100),
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color, size: 18),
          ),
          const SizedBox(height: 10),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 10, color: Color(0xFF7F7663), fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _ActionCard({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 18),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              label,
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: color),
            ),
          ),
        ],
      ),
    );
  }
}

class _LockedModuleCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String description;
  final bool locked;

  const _LockedModuleCard({
    required this.icon,
    required this.label,
    required this.description,
    required this.locked,
  });

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: locked ? 0.45 : 1.0,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF6F3F2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 20, color: const Color(0xFF7F7663)),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF1C1B1B))),
                  Text(description, style: const TextStyle(fontSize: 12, color: Color(0xFF7F7663))),
                ],
              ),
            ),
            if (locked)
              const Icon(Icons.lock_outline_rounded, size: 16, color: Color(0xFF7F7663)),
          ],
        ),
      ),
    );
  }
}
