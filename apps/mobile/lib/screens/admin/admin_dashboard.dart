import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});
  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  bool _loading = true;
  double _recaudadoHoy = 0;
  int _ventasHoy = 0;
  double _cartera = 0;
  int _alertasStock = 0;
  List<dynamic> _ultimasVentas = [];
  List<dynamic> _alertas = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final [resumen, ventas, alertas] = await Future.wait([
        ApiService.instance.get('/pagos/resumen'),
        ApiService.instance.get('/ventas'),
        ApiService.instance.get('/inventory/alerts'),
      ]);

      final hoy = DateTime.now().toIso8601String().substring(0, 10);
      final ventasList = (ventas.data['ventas'] as List?) ?? [];
      final ventasHoy = ventasList.where((v) => (v['fecha'] as String).startsWith(hoy)).toList();
      final cartera = ventasList.where((v) => v['estado'] == 'PENDIENTE').fold<double>(0, (s, v) => s + ((v['total'] as num?)?.toDouble() ?? 0));

      final alertasList = (alertas.data['lowStock'] as List?)?.length ?? 0;
      final expiryCount = (alertas.data['expiringSoon'] as List?)?.length ?? 0;

      setState(() {
        _recaudadoHoy = (resumen.data['totalHoy'] as num?)?.toDouble() ?? 0;
        _ventasHoy = ventasHoy.length;
        _cartera = cartera;
        _alertasStock = alertasList + expiryCount;
        _ultimasVentas = ventasHoy.take(5).toList();
        _alertas = [...(alertas.data['lowStock'] as List? ?? []), ...(alertas.data['expiringSoon'] as List? ?? [])];
        _loading = false;
      });
    } catch (e) {
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());
    if (_error != null) return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      const Icon(Icons.error_outline, size: 48, color: AppColors.error),
      const SizedBox(height: 12),
      Text('Error al cargar datos', style: const TextStyle(color: AppColors.muted)),
      const SizedBox(height: 8),
      ElevatedButton(onPressed: _load, child: const Text('Reintentar')),
    ]));

    return OroRefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Row(children: [
            Expanded(child: _StatCard(icon: Icons.payments_rounded, label: 'Recaudado', value: _fmt.format(_recaudadoHoy), color: AppColors.success)),
            const SizedBox(width: 12),
            Expanded(child: _StatCard(icon: Icons.receipt_long_rounded, label: 'Ventas hoy', value: '$_ventasHoy', color: AppColors.primaryDark)),
          ]),
          const SizedBox(height: 12),
          Row(children: [
            Expanded(child: _StatCard(icon: Icons.account_balance_wallet_rounded, label: 'Cartera', value: _fmt.format(_cartera), color: AppColors.error)),
            const SizedBox(width: 12),
            Expanded(child: _StatCard(icon: Icons.warning_amber_rounded, label: 'Alertas', value: '$_alertasStock', color: _alertasStock > 0 ? AppColors.offlineText : AppColors.muted)),
          ]),
          if (_alertas.isNotEmpty) ...[
            const SizedBox(height: 24),
            const Text('Alertas', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark)),
            const SizedBox(height: 8),
            ...(_alertas.take(5).map((a) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.offlineBg, borderRadius: BorderRadius.circular(12)),
              child: Row(children: [
                const Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.offlineText),
                const SizedBox(width: 8),
                Expanded(child: Text(
                  a['productType']?['name'] ?? a['name'] ?? 'Alerta',
                  style: const TextStyle(fontSize: 13, color: AppColors.offlineText, fontWeight: FontWeight.w600),
                )),
              ]),
            ))),
          ],
          if (_ultimasVentas.isNotEmpty) ...[
            const SizedBox(height: 24),
            const Text('Últimas ventas', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.dark)),
            const SizedBox(height: 8),
            ...(_ultimasVentas.map((v) => Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
              child: Row(children: [
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(v['cliente']?['nombre'] ?? 'Cliente', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark)),
                  Text(v['estado'] ?? '', style: TextStyle(fontSize: 11, color: v['estado'] == 'PAGADA' ? AppColors.success : AppColors.offlineText)),
                ])),
                Text(_fmt.format((v['total'] as num?)?.toDouble() ?? 0), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
              ]),
            ))),
          ],
        ],
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color color;
  const _StatCard({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12, offset: const Offset(0, 4))]),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(icon, color: color, size: 24),
        const SizedBox(height: 10),
        Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.muted)),
      ]),
    );
  }
}
