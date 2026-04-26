import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);
final _dateFmt = DateFormat('dd/MM · hh:mm a', 'es');

class AdminPagos extends StatefulWidget {
  const AdminPagos({super.key});
  @override
  State<AdminPagos> createState() => _AdminPagosState();
}

class _AdminPagosState extends State<AdminPagos> {
  List<dynamic> _pagos = [];
  double _totalHoy = 0;
  double _efectivo = 0;
  double _transferencia = 0;
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final [pagosRes, resumenRes] = await Future.wait([
        ApiService.instance.get('/pagos'),
        ApiService.instance.get('/pagos/resumen'),
      ]);
      setState(() {
        _pagos = (pagosRes.data['pagos'] as List?) ?? [];
        _totalHoy = (resumenRes.data['totalHoy'] as num?)?.toDouble() ?? 0;
        _efectivo = (resumenRes.data['efectivo'] as num?)?.toDouble() ?? 0;
        _transferencia = (resumenRes.data['transferencia'] as num?)?.toDouble() ?? 0;
        _loading = false;
      });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    return OroRefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // Resumen
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: AppColors.success.withOpacity(0.08), borderRadius: BorderRadius.circular(18)),
            child: Column(children: [
              Text(_fmt.format(_totalHoy), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.success)),
              const Text('Recaudado hoy', style: TextStyle(fontSize: 12, color: AppColors.success)),
              const SizedBox(height: 8),
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                Text('Efectivo: ${_fmt.format(_efectivo)}', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                const SizedBox(width: 16),
                Text('Transfer: ${_fmt.format(_transferencia)}', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
              ]),
            ]),
          ),
          const SizedBox(height: 20),
          // Lista
          ..._pagos.map((p) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
            child: Row(children: [
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(p['cliente']?['nombre'] ?? 'Cliente', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark)),
                Text('${p['metodoPago']} · ${_dateFmt.format(DateTime.parse(p['fecha']))}', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
              ])),
              Text(_fmt.format((p['monto'] as num?)?.toDouble() ?? 0), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.success)),
            ]),
          )),
        ],
      ),
    );
  }
}
