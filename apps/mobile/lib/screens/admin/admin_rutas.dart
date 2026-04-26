import 'package:flutter/material.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

class AdminRutas extends StatefulWidget {
  const AdminRutas({super.key});
  @override
  State<AdminRutas> createState() => _AdminRutasState();
}

class _AdminRutasState extends State<AdminRutas> {
  List<dynamic> _rutas = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.instance.get('/rutas');
      setState(() { _rutas = (res.data['rutas'] as List?) ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    if (_rutas.isEmpty) return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      Icon(Icons.route_outlined, size: 64, color: AppColors.muted.withOpacity(0.3)),
      const SizedBox(height: 16),
      const Text('Sin rutas', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.muted)),
    ]));

    return OroRefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _rutas.length,
        itemBuilder: (_, i) {
          final r = _rutas[i];
          final clientes = (r['clientes'] as List?) ?? [];
          final domiciliario = r['domiciliario'];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.route_rounded, color: AppColors.primaryDark, size: 20)),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(r['nombre'] ?? '', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.dark)),
                  if (domiciliario != null)
                    Text(domiciliario['name'] ?? '', style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                ])),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: Text('${clientes.length} clientes', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.primaryDark)),
                ),
              ]),
              if (clientes.isNotEmpty) ...[
                const SizedBox(height: 12),
                Wrap(spacing: 6, runSpacing: 6, children: clientes.take(5).map<Widget>((c) => Chip(
                  label: Text(c['nombre'] ?? '', style: const TextStyle(fontSize: 10)),
                  backgroundColor: AppColors.inputBg,
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                )).toList()),
                if (clientes.length > 5) Text('+${clientes.length - 5} más', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
              ],
            ]),
          );
        },
      ),
    );
  }
}
