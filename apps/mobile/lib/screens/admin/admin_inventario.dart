import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

class AdminInventario extends StatefulWidget {
  const AdminInventario({super.key});
  @override
  State<AdminInventario> createState() => _AdminInventarioState();
}

class _AdminInventarioState extends State<AdminInventario> with SingleTickerProviderStateMixin {
  late TabController _tab;
  List<dynamic> _summary = [];
  List<dynamic> _alerts = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _tab = TabController(length: 2, vsync: this); _load(); }

  @override
  void dispose() { _tab.dispose(); super.dispose(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final [sumRes, alertRes] = await Future.wait([
        ApiService.instance.get('/inventory/summary'),
        ApiService.instance.get('/inventory/alerts'),
      ]);
      setState(() {
        _summary = (sumRes.data['summary'] as List?) ?? [];
        _alerts = [...(alertRes.data['lowStock'] as List? ?? []), ...(alertRes.data['expiringSoon'] as List? ?? [])];
        _loading = false;
      });
    } catch (_) { setState(() => _loading = false); }
  }

  void _showEntradaForm() {
    showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _EntradaForm(productos: _summary, onSaved: _load),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    return Column(children: [
      TabBar(controller: _tab, labelColor: AppColors.primaryDark, unselectedLabelColor: AppColors.muted, indicatorColor: AppColors.primary, tabs: const [
        Tab(text: 'Stock'),
        Tab(text: 'Alertas'),
      ]),
      Expanded(child: TabBarView(controller: _tab, children: [
        // Stock
        OroRefreshIndicator(
          onRefresh: _load,
          child: ListView(padding: const EdgeInsets.all(20), children: [
            ..._summary.map((s) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
              child: Row(children: [
                Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.inventory_2_rounded, color: AppColors.primaryDark, size: 20)),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(s['productType']?['name'] ?? s['name'] ?? '', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark)),
                  Text('Min: ${s['minStockKg'] ?? 0} kg', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                ])),
                Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                  Text('${(s['totalKg'] as num?)?.toStringAsFixed(1) ?? '0'} kg', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
                  Text('${s['entries'] ?? s['batches'] ?? 0} lotes', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                ]),
              ]),
            )),
          ]),
        ),
        // Alertas
        _alerts.isEmpty
          ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
              Icon(Icons.check_circle_outline, size: 64, color: AppColors.success.withOpacity(0.3)),
              const SizedBox(height: 16),
              const Text('Sin alertas', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.muted)),
            ]))
          : ListView(padding: const EdgeInsets.all(20), children: _alerts.map((a) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(color: AppColors.offlineBg, borderRadius: BorderRadius.circular(14)),
              child: Row(children: [
                const Icon(Icons.warning_amber_rounded, color: AppColors.offlineText, size: 22),
                const SizedBox(width: 12),
                Expanded(child: Text(a['productType']?['name'] ?? a['name'] ?? 'Alerta', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.offlineText))),
              ]),
            )).toList()),
      ])),
      Padding(
        padding: const EdgeInsets.all(20),
        child: SizedBox(width: double.infinity, height: 50, child: ElevatedButton.icon(
          onPressed: _showEntradaForm,
          icon: const Icon(Icons.add_rounded),
          label: const Text('Registrar entrada'),
        )),
      ),
    ]);
  }
}

class _EntradaForm extends StatefulWidget {
  final List<dynamic> productos;
  final VoidCallback onSaved;
  const _EntradaForm({required this.productos, required this.onSaved});
  @override
  State<_EntradaForm> createState() => _EntradaFormState();
}

class _EntradaFormState extends State<_EntradaForm> {
  String? _productTypeId;
  final _loteCtrl = TextEditingController();
  final _kgCtrl = TextEditingController();
  final _precioCtrl = TextEditingController();
  DateTime _expiry = DateTime.now().add(const Duration(days: 30));
  bool _saving = false;

  @override
  void dispose() { _loteCtrl.dispose(); _kgCtrl.dispose(); _precioCtrl.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (_productTypeId == null || _kgCtrl.text.isEmpty) return;
    setState(() => _saving = true);
    try {
      await ApiService.instance.post('/inventory/entries', data: {
        'productTypeId': _productTypeId,
        'lote': _loteCtrl.text,
        'cantidadKg': double.tryParse(_kgCtrl.text) ?? 0,
        'precioCompra': double.tryParse(_precioCtrl.text) ?? 0,
        'fechaExpiracion': _expiry.toIso8601String(),
      });
      widget.onSaved();
      if (mounted) Navigator.pop(context);
    } catch (_) {
      setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Nueva Entrada', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark)),
        const SizedBox(height: 20),
        DropdownButtonFormField<String>(
          decoration: const InputDecoration(labelText: 'Producto'),
          items: widget.productos.map((p) => DropdownMenuItem(value: (p['productType']?['id'] ?? p['id']) as String, child: Text(p['productType']?['name'] ?? p['name'] ?? ''))).toList(),
          onChanged: (v) => _productTypeId = v,
        ),
        const SizedBox(height: 16),
        TextField(controller: _loteCtrl, decoration: const InputDecoration(labelText: 'Número de lote')),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(child: TextField(controller: _kgCtrl, decoration: const InputDecoration(labelText: 'Cantidad (kg)'), keyboardType: TextInputType.number)),
          const SizedBox(width: 12),
          Expanded(child: TextField(controller: _precioCtrl, decoration: const InputDecoration(labelText: 'Precio compra'), keyboardType: TextInputType.number)),
        ]),
        const SizedBox(height: 16),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Fecha expiración', style: TextStyle(fontSize: 12, color: AppColors.muted)),
          subtitle: Text(DateFormat('dd/MM/yyyy').format(_expiry), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.dark)),
          trailing: const Icon(Icons.calendar_today, color: AppColors.primaryDark),
          onTap: () async {
            final d = await showDatePicker(context: context, initialDate: _expiry, firstDate: DateTime.now(), lastDate: DateTime.now().add(const Duration(days: 730)));
            if (d != null) setState(() => _expiry = d);
          },
        ),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, height: 50, child: ElevatedButton(
          onPressed: _saving ? null : _save,
          child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Registrar Entrada'),
        )),
      ])),
    );
  }
}
