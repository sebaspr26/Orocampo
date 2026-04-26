import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);
final _dateFmt = DateFormat('dd/MM/yy', 'es');

class AdminCaja extends StatefulWidget {
  const AdminCaja({super.key});
  @override
  State<AdminCaja> createState() => _AdminCajaState();
}

class _AdminCajaState extends State<AdminCaja> {
  List<dynamic> _cierres = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.instance.get('/caja');
      setState(() { _cierres = (res.data['cierres'] as List?) ?? []; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  void _showCierre() async {
    showDialog(context: context, barrierDismissible: false, builder: (_) => const Center(child: OroLoading()));
    try {
      final res = await ApiService.instance.get('/caja/preview');
      if (mounted) Navigator.pop(context);
      final data = res.data;
      if (mounted) showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: Colors.white,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
        builder: (_) => _CierreForm(preview: data, onSaved: _load),
      );
    } catch (_) { if (mounted) Navigator.pop(context); }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    return Column(children: [
      Padding(
        padding: const EdgeInsets.all(20),
        child: SizedBox(width: double.infinity, height: 50, child: ElevatedButton.icon(
          onPressed: _showCierre,
          icon: const Icon(Icons.point_of_sale_rounded),
          label: const Text('Nuevo cierre de caja'),
        )),
      ),
      Expanded(
        child: OroRefreshIndicator(
          onRefresh: _load,
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            itemCount: _cierres.length,
            itemBuilder: (_, i) {
              final c = _cierres[i];
              final descuadre = ((c['descuadre'] as num?)?.toDouble() ?? 0).abs();
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)]),
                child: Row(children: [
                  Container(width: 40, height: 40, decoration: BoxDecoration(
                    color: descuadre > 0 ? AppColors.error.withOpacity(0.1) : AppColors.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ), child: Icon(Icons.point_of_sale_rounded, color: descuadre > 0 ? AppColors.error : AppColors.success, size: 20)),
                  const SizedBox(width: 12),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(_dateFmt.format(DateTime.parse(c['fecha'])), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark)),
                    Text('Efectivo: ${_fmt.format((c['totalEfectivo'] as num?)?.toDouble() ?? 0)}', style: const TextStyle(fontSize: 11, color: AppColors.muted)),
                  ])),
                  Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                    Text(_fmt.format((c['montoDeclarado'] as num?)?.toDouble() ?? 0), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
                    if (descuadre > 0) Text('Desc: ${_fmt.format(descuadre)}', style: const TextStyle(fontSize: 10, color: AppColors.error, fontWeight: FontWeight.w600)),
                  ]),
                ]),
              );
            },
          ),
        ),
      ),
    ]);
  }
}

class _CierreForm extends StatefulWidget {
  final Map<String, dynamic> preview;
  final VoidCallback onSaved;
  const _CierreForm({required this.preview, required this.onSaved});
  @override
  State<_CierreForm> createState() => _CierreFormState();
}

class _CierreFormState extends State<_CierreForm> {
  double _montoDeclarado = 0;
  bool _saving = false;

  @override
  Widget build(BuildContext context) {
    final totalEfectivo = (widget.preview['totalEfectivo'] as num?)?.toDouble() ?? 0;
    final totalTransferencia = (widget.preview['totalTransferencia'] as num?)?.toDouble() ?? 0;

    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Cierre de Caja', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark)),
        const SizedBox(height: 20),
        _Row('Efectivo registrado', _fmt.format(totalEfectivo)),
        _Row('Transferencias', _fmt.format(totalTransferencia)),
        _Row('Total del día', _fmt.format(totalEfectivo + totalTransferencia), bold: true),
        const SizedBox(height: 16),
        TextField(
          decoration: const InputDecoration(labelText: 'Monto declarado (efectivo en caja)'),
          keyboardType: TextInputType.number,
          onChanged: (v) => setState(() => _montoDeclarado = double.tryParse(v) ?? 0),
        ),
        if (_montoDeclarado > 0) ...[
          const SizedBox(height: 8),
          _Row('Descuadre', _fmt.format((_montoDeclarado - totalEfectivo).abs()),
            color: (_montoDeclarado - totalEfectivo).abs() > 0 ? AppColors.error : AppColors.success),
        ],
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, height: 50, child: ElevatedButton(
          onPressed: _saving || _montoDeclarado <= 0 ? null : () async {
            setState(() => _saving = true);
            try {
              await ApiService.instance.post('/caja', data: {'montoDeclarado': _montoDeclarado});
              widget.onSaved();
              if (mounted) Navigator.pop(context);
            } catch (_) { setState(() => _saving = false); }
          },
          child: _saving ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Registrar Cierre'),
        )),
      ]),
    );
  }
}

class _Row extends StatelessWidget {
  final String label, value;
  final bool bold;
  final Color? color;
  const _Row(this.label, this.value, {this.bold = false, this.color});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 4),
    child: Row(children: [
      Expanded(child: Text(label, style: TextStyle(fontSize: 13, color: AppColors.muted, fontWeight: bold ? FontWeight.w700 : FontWeight.w400))),
      Text(value, style: TextStyle(fontSize: 14, fontWeight: bold ? FontWeight.w800 : FontWeight.w600, color: color ?? AppColors.dark)),
    ]),
  );
}
