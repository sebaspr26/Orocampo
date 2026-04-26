import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/ventas_provider.dart';
import '../../providers/pagos_provider.dart';
import '../../providers/ruta_provider.dart';
import '../../providers/sync_provider.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

class DashboardTab extends StatelessWidget {
  const DashboardTab({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final ventas = context.watch<VentasProvider>();
    final pagos = context.watch<PagosProvider>();
    final ruta = context.watch<RutaProvider>();
    final sync = context.watch<SyncProvider>();

    final nombre = auth.user?.name?.split(' ').first ?? 'Domiciliario';
    final hoy = DateFormat('EEEE d \'de\' MMMM', 'es').format(DateTime.now());

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppColors.primaryDark, Color(0xFF8B7300)]),
              borderRadius: BorderRadius.circular(22),
            ),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                // Logo cortado en la esquina derecha
                Positioned(
                  right: 30,
                  bottom: 0,
                  child: Opacity(
                    opacity: 0.15,
                    child: Image.asset('assets/images/logo_transparent.png', width: 100, height: 100, fit: BoxFit.contain),
                  ),
                ),
                // Contenido
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Hola, $nombre', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: Colors.white)),
                    const SizedBox(height: 4),
                    Text(hoy, style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.8))),
                    if (ruta.ruta != null) ...[
                      const SizedBox(height: 4),
                      Row(children: [
                        Icon(Icons.route_rounded, size: 14, color: Colors.white.withOpacity(0.8)),
                        const SizedBox(width: 4),
                        Text(ruta.ruta!.nombre, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white.withOpacity(0.9))),
                      ]),
                    ],
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Stats
          Row(
            children: [
              Expanded(child: _StatCard(icon: Icons.receipt_long_rounded, label: 'Ventas', value: '${ventas.ventasHoy.length}', sub: _fmt.format(ventas.totalVentasHoy), color: AppColors.primaryDark)),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(icon: Icons.payments_rounded, label: 'Cobros', value: '${pagos.pagosHoy.length}', sub: _fmt.format(pagos.totalCobradoHoy), color: AppColors.success)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(child: _StatCard(icon: Icons.local_shipping_rounded, label: 'Entregas', value: '${ruta.entregadosCount}/${ruta.totalClientes}', sub: 'clientes', color: AppColors.blue)),
              const SizedBox(width: 12),
              Expanded(child: _StatCard(icon: Icons.sync_rounded, label: 'Pendientes', value: '${sync.pendingCount}', sub: sync.isSyncing ? 'Sincronizando...' : 'por sincronizar', color: sync.pendingCount > 0 ? AppColors.offlineText : AppColors.muted)),
            ],
          ),
          const SizedBox(height: 24),

          // Últimas ventas
          if (ventas.ventasHoy.isNotEmpty) ...[
            const Text('Últimas ventas', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark)),
            const SizedBox(height: 12),
            ...ventas.ventasHoy.take(3).map((v) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
              child: Row(children: [
                Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.receipt_long_rounded, color: AppColors.primaryDark, size: 18),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(v.clienteNombre ?? 'Cliente', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark)),
                  Text('${v.items.length} producto${v.items.length > 1 ? 's' : ''} · ${v.metodoPago}', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                ])),
                Text(_fmt.format(v.total), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
              ]),
            )),
          ],
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label, value, sub;
  final Color color;
  const _StatCard({required this.icon, required this.label, required this.value, required this.sub, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12, offset: const Offset(0, 4))]),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 10),
          Text(value, style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: color)),
          Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.muted)),
          Text(sub, style: TextStyle(fontSize: 10, color: color.withOpacity(0.7))),
        ],
      ),
    );
  }
}
