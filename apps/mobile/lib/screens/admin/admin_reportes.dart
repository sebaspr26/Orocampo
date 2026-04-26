import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../services/api_service.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

class AdminReportes extends StatefulWidget {
  const AdminReportes({super.key});
  @override
  State<AdminReportes> createState() => _AdminReportesState();
}

class _AdminReportesState extends State<AdminReportes> {
  String _tipo = 'ventas-periodo';
  DateTime _desde = DateTime.now().subtract(const Duration(days: 30));
  DateTime _hasta = DateTime.now();
  Map<String, dynamic>? _data;
  bool _loading = false;

  Future<void> _load() async {
    setState(() { _loading = true; _data = null; });
    try {
      final desdeStr = _desde.toIso8601String().substring(0, 10);
      final hastaStr = _hasta.toIso8601String().substring(0, 10);
      final res = await ApiService.instance.get('/reportes/$_tipo?desde=$desdeStr&hasta=$hastaStr');
      setState(() { _data = res.data; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Tipo de reporte
        DropdownButtonFormField<String>(
          decoration: const InputDecoration(labelText: 'Tipo de reporte'),
          value: _tipo,
          items: const [
            DropdownMenuItem(value: 'ventas-periodo', child: Text('Ventas por período')),
            DropdownMenuItem(value: 'ventas-producto', child: Text('Ventas por producto')),
            DropdownMenuItem(value: 'ventas-cliente', child: Text('Ventas por cliente')),
            DropdownMenuItem(value: 'cartera', child: Text('Cartera')),
          ],
          onChanged: (v) => setState(() => _tipo = v ?? 'ventas-periodo'),
        ),
        const SizedBox(height: 16),

        // Fechas
        Row(children: [
          Expanded(child: _DateField(label: 'Desde', date: _desde, onChanged: (d) => setState(() => _desde = d))),
          const SizedBox(width: 12),
          Expanded(child: _DateField(label: 'Hasta', date: _hasta, onChanged: (d) => setState(() => _hasta = d))),
        ]),
        const SizedBox(height: 16),

        SizedBox(width: double.infinity, height: 48, child: ElevatedButton(
          onPressed: _loading ? null : _load,
          child: _loading ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Generar reporte'),
        )),
        const SizedBox(height: 24),

        // Resultados
        if (_data != null) _buildResults(),
      ],
    );
  }

  Widget _buildResults() {
    if (_tipo == 'ventas-periodo') return _buildVentasPeriodo();
    if (_tipo == 'ventas-producto') return _buildVentasProducto();
    if (_tipo == 'ventas-cliente') return _buildVentasCliente();
    if (_tipo == 'cartera') return _buildCartera();
    return const SizedBox.shrink();
  }

  Widget _buildVentasPeriodo() {
    final rows = (_data?['rows'] as List?) ?? [];
    final totales = _data?['totales'] as Map<String, dynamic>? ?? {};
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.08), borderRadius: BorderRadius.circular(14)),
        child: Row(mainAxisAlignment: MainAxisAlignment.spaceAround, children: [
          _Metric('Total', _fmt.format((totales['total'] as num?)?.toDouble() ?? 0)),
          _Metric('Pagado', _fmt.format((totales['pagado'] as num?)?.toDouble() ?? 0)),
          _Metric('Pendiente', _fmt.format((totales['pendiente'] as num?)?.toDouble() ?? 0)),
        ]),
      ),
      const SizedBox(height: 16),
      ...rows.map((r) => _ResultRow(r['periodo'] ?? '', _fmt.format((r['total'] as num?)?.toDouble() ?? 0))),
    ]);
  }

  Widget _buildVentasProducto() {
    final rows = (_data?['rows'] as List?) ?? [];
    return Column(children: rows.map((r) => _ResultRow(
      r['producto'] ?? r['productType']?['name'] ?? '',
      '${((r['totalKg'] as num?)?.toStringAsFixed(1) ?? '0')} kg · ${_fmt.format((r['ingresos'] as num?)?.toDouble() ?? 0)}',
    )).toList());
  }

  Widget _buildVentasCliente() {
    final rows = (_data?['rows'] as List?) ?? [];
    return Column(children: rows.map((r) => _ResultRow(
      r['nombre'] ?? '',
      'Vendido: ${_fmt.format((r['totalVendido'] as num?)?.toDouble() ?? 0)} · Pend: ${_fmt.format((r['saldoPendiente'] as num?)?.toDouble() ?? 0)}',
    )).toList());
  }

  Widget _buildCartera() {
    final rows = (_data?['rows'] as List?) ?? [];
    return Column(children: rows.map((r) => _ResultRow(
      r['nombre'] ?? '',
      'Deuda: ${_fmt.format((r['totalPendiente'] as num?)?.toDouble() ?? 0)} · ${r['diasVencida'] ?? 0} días',
    )).toList());
  }
}

class _DateField extends StatelessWidget {
  final String label;
  final DateTime date;
  final ValueChanged<DateTime> onChanged;
  const _DateField({required this.label, required this.date, required this.onChanged});

  @override
  Widget build(BuildContext context) => GestureDetector(
    onTap: () async {
      final d = await showDatePicker(context: context, initialDate: date, firstDate: DateTime(2024), lastDate: DateTime.now());
      if (d != null) onChanged(d);
    },
    child: InputDecorator(
      decoration: InputDecoration(labelText: label, suffixIcon: const Icon(Icons.calendar_today, size: 18)),
      child: Text(DateFormat('dd/MM/yy').format(date), style: const TextStyle(fontSize: 14)),
    ),
  );
}

class _Metric extends StatelessWidget {
  final String label, value;
  const _Metric(this.label, this.value);
  @override
  Widget build(BuildContext context) => Column(children: [
    Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
    Text(label, style: const TextStyle(fontSize: 10, color: AppColors.muted)),
  ]);
}

class _ResultRow extends StatelessWidget {
  final String title, subtitle;
  const _ResultRow(this.title, this.subtitle);
  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 8),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 6)]),
    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.dark)),
      Text(subtitle, style: const TextStyle(fontSize: 11, color: AppColors.muted)),
    ]),
  );
}
