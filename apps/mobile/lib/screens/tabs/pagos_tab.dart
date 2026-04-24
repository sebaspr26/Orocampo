import 'package:flutter/material.dart';

class PagosTab extends StatelessWidget {
  const PagosTab({super.key});

  static const _muted = Color(0xFF7F7663);
  static const _dark = Color(0xFF1C1B1B);
  static const _darkGold = Color(0xFF735C00);
  static const _gold = Color(0xFFD4AF37);

  static const _mockPagos = [
    {'cliente': 'María López', 'monto': '\$45.000', 'metodo': 'Efectivo', 'estado': 'pendiente', 'fecha': 'Hoy'},
    {'cliente': 'Ana Torres', 'monto': '\$22.000', 'metodo': 'Efectivo', 'estado': 'pendiente', 'fecha': 'Hoy'},
    {'cliente': 'Lucía Mora', 'monto': '\$75.000', 'metodo': 'Transferencia', 'estado': 'pendiente', 'fecha': 'Hoy'},
    {'cliente': 'Carlos Ruiz', 'monto': '\$38.000', 'metodo': 'Efectivo', 'estado': 'cobrado', 'fecha': 'Hoy'},
    {'cliente': 'Pedro Gómez', 'monto': '\$28.000', 'metodo': 'Efectivo', 'estado': 'cobrado', 'fecha': 'Hoy'},
  ];

  @override
  Widget build(BuildContext context) {
    final pendientes = _mockPagos.where((p) => p['estado'] == 'pendiente').toList();
    final cobrados = _mockPagos.where((p) => p['estado'] == 'cobrado').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          const Text(
            'Pagos',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: _dark),
          ),
          const SizedBox(height: 4),
          const Text(
            'Gestiona los cobros de tu ruta',
            style: TextStyle(fontSize: 13, color: _muted),
          ),
          const SizedBox(height: 20),

          // Summary cards
          Row(
            children: [
              Expanded(
                child: _SummaryCard(
                  label: 'Por cobrar',
                  value: '\$142.000',
                  count: '${pendientes.length} pagos',
                  color: const Color(0xFFD4AF37),
                  icon: Icons.pending_actions_rounded,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _SummaryCard(
                  label: 'Cobrado hoy',
                  value: '\$66.000',
                  count: '${cobrados.length} pagos',
                  color: const Color(0xFF1B6B4C),
                  icon: Icons.check_circle_outline_rounded,
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),

          // Pendientes
          Row(
            children: [
              const Icon(Icons.radio_button_on_rounded, size: 10, color: Color(0xFFD4AF37)),
              const SizedBox(width: 6),
              const Text(
                'POR COBRAR',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _muted, letterSpacing: 2),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...pendientes.map((p) => _PagoCard(
                cliente: p['cliente']!,
                monto: p['monto']!,
                metodo: p['metodo']!,
                estado: p['estado']!,
                fecha: p['fecha']!,
              )),
          const SizedBox(height: 20),

          // Cobrados
          Row(
            children: [
              const Icon(Icons.radio_button_on_rounded, size: 10, color: Color(0xFF1B6B4C)),
              const SizedBox(width: 6),
              const Text(
                'COBRADOS',
                style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _muted, letterSpacing: 2),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ...cobrados.map((p) => _PagoCard(
                cliente: p['cliente']!,
                monto: p['monto']!,
                metodo: p['metodo']!,
                estado: p['estado']!,
                fecha: p['fecha']!,
              )),
          const SizedBox(height: 100),
        ],
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final String count;
  final Color color;
  final IconData icon;

  const _SummaryCard({
    required this.label,
    required this.value,
    required this.count,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 10),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF7F7663))),
          Text(count, style: TextStyle(fontSize: 11, color: color.withOpacity(0.7))),
        ],
      ),
    );
  }
}

class _PagoCard extends StatelessWidget {
  final String cliente;
  final String monto;
  final String metodo;
  final String estado;
  final String fecha;

  const _PagoCard({
    required this.cliente,
    required this.monto,
    required this.metodo,
    required this.estado,
    required this.fecha,
  });

  @override
  Widget build(BuildContext context) {
    final isPending = estado == 'pendiente';

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: isPending
                  ? const Color(0xFFD4AF37).withOpacity(0.12)
                  : const Color(0xFF1B6B4C).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              metodo == 'Efectivo' ? Icons.money_rounded : Icons.account_balance_rounded,
              color: isPending ? const Color(0xFF735C00) : const Color(0xFF1B6B4C),
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(cliente, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF1C1B1B))),
                const SizedBox(height: 2),
                Row(
                  children: [
                    const Icon(Icons.circle, size: 6, color: Color(0xFF7F7663)),
                    const SizedBox(width: 4),
                    Text(metodo, style: const TextStyle(fontSize: 12, color: Color(0xFF7F7663))),
                    const SizedBox(width: 8),
                    const Icon(Icons.circle, size: 6, color: Color(0xFF7F7663)),
                    const SizedBox(width: 4),
                    Text(fecha, style: const TextStyle(fontSize: 12, color: Color(0xFF7F7663))),
                  ],
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(monto, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: Color(0xFF735C00))),
              const SizedBox(height: 6),
              if (isPending)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF735C00),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Text(
                    'Cobrar',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                )
              else
                const Icon(Icons.check_circle_rounded, color: Color(0xFF1B6B4C), size: 20),
            ],
          ),
        ],
      ),
    );
  }
}
