import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _dateFmt = DateFormat('dd/MM/yy', 'es');

class AdminDevoluciones extends StatefulWidget {
  const AdminDevoluciones({super.key});
  @override
  State<AdminDevoluciones> createState() => _AdminDevolucionesState();
}

class _AdminDevolucionesState extends State<AdminDevoluciones> {
  List<dynamic> _devoluciones = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.instance.get('/devoluciones');
      setState(() { _devoluciones = (res.data['devoluciones'] as List?) ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    if (_devoluciones.isEmpty) return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      Icon(Icons.assignment_return_outlined, size: 64, color: AppColors.muted.withOpacity(0.3)),
      const SizedBox(height: 16),
      const Text('Sin devoluciones', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.muted)),
    ]));

    return OroRefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _devoluciones.length,
        itemBuilder: (_, i) {
          final d = _devoluciones[i];
          final items = (d['items'] as List?) ?? [];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                Expanded(child: Text(d['cliente']?['nombre'] ?? 'Cliente', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark))),
                Text(_dateFmt.format(DateTime.parse(d['createdAt'])), style: const TextStyle(fontSize: 11, color: AppColors.muted)),
              ]),
              const SizedBox(height: 4),
              Text(d['motivo'] ?? '', style: const TextStyle(fontSize: 12, color: AppColors.muted)),
              if (items.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(spacing: 6, children: items.map<Widget>((item) => Chip(
                  label: Text('${item['productType']?['name'] ?? ''} · ${item['cantidadKg']}kg', style: const TextStyle(fontSize: 10)),
                  backgroundColor: AppColors.inputBg,
                  visualDensity: VisualDensity.compact,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                )).toList()),
              ],
            ]),
          );
        },
      ),
    );
  }
}
