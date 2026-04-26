import 'package:flutter/material.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

class SecretariaProductos extends StatefulWidget {
  const SecretariaProductos({super.key});
  @override
  State<SecretariaProductos> createState() => _SecretariaProductosState();
}

class _SecretariaProductosState extends State<SecretariaProductos> {
  List<dynamic> _productos = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.instance.get('/product-types');
      setState(() { _productos = (res.data['productTypes'] as List?) ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    if (_productos.isEmpty) return Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
      Icon(Icons.category_outlined, size: 64, color: AppColors.muted.withOpacity(0.3)),
      const SizedBox(height: 16),
      const Text('Sin productos', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.muted)),
    ]));

    return OroRefreshIndicator(
      onRefresh: _load,
      child: ListView.builder(
        padding: const EdgeInsets.all(20),
        itemCount: _productos.length,
        itemBuilder: (_, i) {
          final p = _productos[i];
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
            child: Row(children: [
              Container(
                width: 44, height: 44,
                decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.category_rounded, color: AppColors.primaryDark, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(p['name'] ?? '', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.dark)),
                if (p['description'] != null && (p['description'] as String).isNotEmpty)
                  Text(p['description'], style: const TextStyle(fontSize: 12, color: AppColors.muted)),
              ])),
              if (p['minStockKg'] != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: AppColors.inputBg, borderRadius: BorderRadius.circular(10)),
                  child: Text('Mín: ${p['minStockKg']} kg', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.muted)),
                ),
            ]),
          );
        },
      ),
    );
  }
}
