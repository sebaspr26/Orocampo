import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

class AdminClientes extends StatefulWidget {
  const AdminClientes({super.key});
  @override
  State<AdminClientes> createState() => _AdminClientesState();
}

class _AdminClientesState extends State<AdminClientes> {
  List<dynamic> _clientes = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.instance.get('/clientes');
      setState(() { _clientes = (res.data['clientes'] as List?) ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  List<dynamic> get _filtered => _search.isEmpty ? _clientes : _clientes.where((c) => (c['nombre'] as String).toLowerCase().contains(_search.toLowerCase())).toList();

  void _showEstadoCuenta(String clienteId, String nombre) async {
    showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: OroLoading()));
    try {
      final res = await ApiService.instance.get('/clientes/$clienteId/estado-cuenta');
      if (mounted) Navigator.pop(context);
      final data = res.data;
      if (mounted) showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: Colors.white,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        builder: (_) => Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(nombre, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark)),
            const SizedBox(height: 20),
            _InfoRow('Total vendido', _fmt.format((data['totalVendido'] as num?)?.toDouble() ?? 0)),
            _InfoRow('Total pagado', _fmt.format((data['totalPagado'] as num?)?.toDouble() ?? 0)),
            _InfoRow('Saldo pendiente', _fmt.format((data['saldoPendiente'] as num?)?.toDouble() ?? 0), color: ((data['saldoPendiente'] as num?)?.toDouble() ?? 0) > 0 ? AppColors.error : AppColors.success),
            const SizedBox(height: 8),
            _InfoRow('Ventas', '${data['totalVentas'] ?? 0}'),
            _InfoRow('Pagos', '${data['totalPagos'] ?? 0}'),
            const SizedBox(height: 24),
          ]),
        ),
      );
    } catch (_) { if (mounted) Navigator.pop(context); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
        child: TextField(
          onChanged: (v) => setState(() => _search = v),
          decoration: InputDecoration(
            hintText: 'Buscar cliente...', prefixIcon: const Icon(Icons.search, color: AppColors.muted),
            filled: true, fillColor: AppColors.inputBg,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(vertical: 12),
          ),
        ),
      ),
      Expanded(
        child: OroRefreshIndicator(
          onRefresh: _load,
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
            itemCount: _filtered.length,
            itemBuilder: (_, i) {
              final c = _filtered[i];
              final active = c['isActive'] == true;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: active ? Colors.white : Colors.white.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)],
                ),
                child: Row(children: [
                  Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                    child: Icon(Icons.person_rounded, color: active ? AppColors.primaryDark : AppColors.muted, size: 20)),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(c['nombre'] ?? '', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: active ? AppColors.dark : AppColors.muted)),
                    if (c['telefono'] != null) Text(c['telefono'], style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                  ])),
                  IconButton(icon: const Icon(Icons.account_balance_wallet_outlined, size: 20, color: AppColors.primaryDark), onPressed: () => _showEstadoCuenta(c['id'], c['nombre'])),
                ]),
              );
            },
          ),
        ),
      ),
    ]);
  }
}

class _InfoRow extends StatelessWidget {
  final String label, value;
  final Color? color;
  const _InfoRow(this.label, this.value, {this.color});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 6),
    child: Row(children: [
      Expanded(child: Text(label, style: const TextStyle(fontSize: 13, color: AppColors.muted))),
      Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: color ?? AppColors.dark)),
    ]),
  );
}
