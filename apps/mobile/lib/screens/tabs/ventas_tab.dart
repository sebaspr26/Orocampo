import 'package:flutter/material.dart';

class VentasTab extends StatelessWidget {
  const VentasTab({super.key});

  static const _gold = Color(0xFFD4AF37);
  static const _darkGold = Color(0xFF735C00);
  static const _muted = Color(0xFF7F7663);
  static const _dark = Color(0xFF1C1B1B);

  static const _mockVentas = [
    {'cliente': 'María López', 'producto': 'Queso Campesino x3', 'total': '\$45.000', 'estado': 'pendiente', 'hora': '08:30'},
    {'cliente': 'Carlos Ruiz', 'producto': 'Queso Doble Crema x2', 'total': '\$38.000', 'estado': 'entregado', 'hora': '09:15'},
    {'cliente': 'Ana Torres', 'producto': 'Queso Mozzarella x1', 'total': '\$22.000', 'estado': 'pendiente', 'hora': '10:00'},
    {'cliente': 'Pedro Gómez', 'producto': 'Cuajada x4', 'total': '\$28.000', 'estado': 'entregado', 'hora': '11:30'},
    {'cliente': 'Lucía Mora', 'producto': 'Queso Campesino x5', 'total': '\$75.000', 'estado': 'pendiente', 'hora': '14:00'},
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Header
        Container(
          padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Ventas del día',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: _dark),
              ),
              const SizedBox(height: 4),
              Text(
                '${_mockVentas.length} pedidos asignados a tu ruta',
                style: const TextStyle(fontSize: 13, color: _muted),
              ),
              const SizedBox(height: 16),
              // Search bar
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 2)),
                  ],
                ),
                child: TextField(
                  style: const TextStyle(fontSize: 14),
                  decoration: InputDecoration(
                    hintText: 'Buscar cliente o producto...',
                    hintStyle: const TextStyle(color: Color(0xFFD0C5AF), fontSize: 14),
                    prefixIcon: const Icon(Icons.search_rounded, color: _muted, size: 20),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                      borderSide: BorderSide.none,
                    ),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Filter chips
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _FilterChip(label: 'Todos', selected: true),
                    const SizedBox(width: 8),
                    _FilterChip(label: 'Pendientes', selected: false),
                    const SizedBox(width: 8),
                    _FilterChip(label: 'Entregados', selected: false),
                  ],
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),

        // List
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            itemCount: _mockVentas.length,
            itemBuilder: (context, i) {
              final v = _mockVentas[i];
              final isPending = v['estado'] == 'pendiente';
              return _VentaCard(
                cliente: v['cliente']!,
                producto: v['producto']!,
                total: v['total']!,
                estado: v['estado']!,
                hora: v['hora']!,
                isPending: isPending,
              );
            },
          ),
        ),
      ],
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;

  const _FilterChip({required this.label, required this.selected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: selected ? const Color(0xFF735C00) : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: selected ? const Color(0xFF735C00) : const Color(0xFFE5E2E1),
        ),
        boxShadow: selected
            ? [BoxShadow(color: const Color(0xFF735C00).withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 2))]
            : [],
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: selected ? Colors.white : const Color(0xFF7F7663),
        ),
      ),
    );
  }
}

class _VentaCard extends StatelessWidget {
  final String cliente;
  final String producto;
  final String total;
  final String estado;
  final String hora;
  final bool isPending;

  const _VentaCard({
    required this.cliente,
    required this.producto,
    required this.total,
    required this.estado,
    required this.hora,
    required this.isPending,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: isPending
            ? Border.all(color: const Color(0xFFD4AF37).withOpacity(0.4))
            : Border.all(color: const Color(0xFFE5E2E1)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          // Avatar
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
              isPending ? Icons.pending_outlined : Icons.check_circle_outline_rounded,
              color: isPending ? const Color(0xFF735C00) : const Color(0xFF1B6B4C),
              size: 22,
            ),
          ),
          const SizedBox(width: 12),

          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(cliente, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Color(0xFF1C1B1B))),
                const SizedBox(height: 2),
                Text(producto, style: const TextStyle(fontSize: 12, color: Color(0xFF7F7663))),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.access_time_rounded, size: 12, color: Color(0xFF7F7663)),
                    const SizedBox(width: 3),
                    Text(hora, style: const TextStyle(fontSize: 11, color: Color(0xFF7F7663))),
                  ],
                ),
              ],
            ),
          ),

          // Right side
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(total, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: Color(0xFF735C00))),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isPending
                      ? const Color(0xFFD4AF37).withOpacity(0.12)
                      : const Color(0xFF1B6B4C).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  isPending ? 'Pendiente' : 'Entregado',
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                    color: isPending ? const Color(0xFF735C00) : const Color(0xFF1B6B4C),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
