import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);
final _dateFmt = DateFormat('dd/MM · hh:mm a', 'es');

class AdminVentas extends StatefulWidget {
  const AdminVentas({super.key});
  @override
  State<AdminVentas> createState() => _AdminVentasState();
}

class _AdminVentasState extends State<AdminVentas> {
  List<dynamic> _ventas = [];
  bool _loading = true;
  String _filtro = 'TODAS';

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.instance.get('/ventas');
      setState(() { _ventas = (res.data['ventas'] as List?) ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  List<dynamic> get _filtered => _filtro == 'TODAS' ? _ventas : _ventas.where((v) => v['estado'] == _filtro).toList();

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    return Column(children: [
      Padding(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
        child: SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(children: ['TODAS', 'PENDIENTE', 'PAGADA', 'ANULADA'].map((f) => Padding(
            padding: const EdgeInsets.only(right: 8),
            child: FilterChip(
              label: Text(f, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _filtro == f ? Colors.white : AppColors.muted)),
              selected: _filtro == f,
              onSelected: (_) => setState(() => _filtro = f),
              selectedColor: AppColors.primaryDark,
              backgroundColor: AppColors.inputBg,
              showCheckmark: false,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            ),
          )).toList()),
        ),
      ),
      Expanded(
        child: OroRefreshIndicator(
          onRefresh: _load,
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
            itemCount: _filtered.length,
            itemBuilder: (_, i) {
              final v = _filtered[i];
              final estado = v['estado'] as String? ?? '';
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
                child: Row(children: [
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(v['cliente']?['nombre'] ?? 'Cliente', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark)),
                    const SizedBox(height: 2),
                    Row(children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: estado == 'PAGADA' ? AppColors.successBg : estado == 'ANULADA' ? AppColors.errorBg : AppColors.offlineBg,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(estado, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: estado == 'PAGADA' ? AppColors.success : estado == 'ANULADA' ? AppColors.error : AppColors.offlineText)),
                      ),
                      const SizedBox(width: 8),
                      Text(_dateFmt.format(DateTime.parse(v['fecha'])), style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                    ]),
                  ])),
                  Text(_fmt.format((v['total'] as num?)?.toDouble() ?? 0), style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
                ]),
              );
            },
          ),
        ),
      ),
    ]);
  }
}
