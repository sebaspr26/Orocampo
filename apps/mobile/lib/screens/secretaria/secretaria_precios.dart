import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

class SecretariaPrecios extends StatefulWidget {
  const SecretariaPrecios({super.key});
  @override
  State<SecretariaPrecios> createState() => _SecretariaPreciosState();
}

class _SecretariaPreciosState extends State<SecretariaPrecios> {
  List<dynamic> _tipos = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.instance.get('/tipos-cliente');
      setState(() { _tipos = (res.data['tipos'] as List?) ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    if (_tipos.isEmpty) return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      Icon(Icons.sell_outlined, size: 64, color: AppColors.muted.withOpacity(0.3)),
      const SizedBox(height: 16),
      const Text('Sin tipos de cliente', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.muted)),
    ]));

    return OroRefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _tipos.length,
        itemBuilder: (_, i) {
          final tipo = _tipos[i];
          final precios = (tipo['precios'] as List?) ?? [];
          return Container(
            margin: const EdgeInsets.only(bottom: 14),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 10)]),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.sell_rounded, color: AppColors.primaryDark, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(tipo['nombre'] ?? '', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.dark)),
                  if (tipo['descripcion'] != null)
                    Text(tipo['descripcion'], style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                ])),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: AppColors.inputBg, borderRadius: BorderRadius.circular(8)),
                  child: Text('${tipo['_count']?['clientes'] ?? 0} clientes', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.muted)),
                ),
              ]),
              if (precios.isNotEmpty) ...[
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 10),
                ...precios.map((p) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(children: [
                    Expanded(child: Text(p['productType']?['name'] ?? '', style: const TextStyle(fontSize: 13, color: AppColors.dark))),
                    Text(_fmt.format((p['precio'] as num?)?.toDouble() ?? 0), style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
                    const Text(' /kg', style: TextStyle(fontSize: 10, color: AppColors.muted)),
                  ]),
                )),
              ],
            ]),
          );
        },
      ),
    );
  }
}
