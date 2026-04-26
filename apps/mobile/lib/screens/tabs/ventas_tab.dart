import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../models/venta.dart';
import '../../providers/ventas_provider.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);
final _dateFmt = DateFormat('hh:mm a', 'es');

class VentasTab extends StatelessWidget {
  const VentasTab({super.key});

  @override
  Widget build(BuildContext context) {
    final ventas = context.watch<VentasProvider>();

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: ventas.loading
          ? const Center(child: OroLoading())
          : ventas.ventasHoy.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.receipt_long_outlined, size: 64, color: AppColors.muted.withOpacity(0.3)),
                      const SizedBox(height: 16),
                      const Text('Sin ventas hoy', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.muted)),
                      const SizedBox(height: 8),
                      const Text('Registra tu primera venta del día', style: TextStyle(fontSize: 13, color: AppColors.muted)),
                    ],
                  ),
                )
              : OroRefreshIndicator(
                  onRefresh: () => ventas.loadData(),
                  child: ListView(
                    padding: const EdgeInsets.all(20),
                    children: [
                      Row(
                        children: [
                          const Text('Ventas del día', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.dark)),
                          const Spacer(),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
                            child: Text('${ventas.ventasHoy.length}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      ...ventas.ventasHoy.map((v) => _VentaCard(venta: v)),
                    ],
                  ),
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(context),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Nueva venta', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }

  void _showForm(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => const _VentaForm(),
    );
  }
}

class _VentaCard extends StatelessWidget {
  final Venta venta;
  const _VentaCard({required this.venta});

  @override
  Widget build(BuildContext context) {
    final synced = venta.syncStatus == 'synced';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white, borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Expanded(child: Text(venta.clienteNombre ?? 'Cliente', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.dark))),
            if (!synced) const Icon(Icons.cloud_upload_outlined, size: 16, color: AppColors.offlineText),
            const SizedBox(width: 8),
            Text(_dateFmt.format(venta.createdAt), style: const TextStyle(fontSize: 11, color: AppColors.muted)),
          ]),
          const SizedBox(height: 8),
          Wrap(spacing: 6, children: venta.items.map((item) => Text('${item.productName} x${item.cantidadKg}kg', style: const TextStyle(fontSize: 12, color: AppColors.muted))).toList()),
          const SizedBox(height: 8),
          Row(children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: AppColors.inputBg, borderRadius: BorderRadius.circular(8)),
              child: Text(venta.metodoPago, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.muted)),
            ),
            const Spacer(),
            Text(_fmt.format(venta.total), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.primaryDark)),
          ]),
        ],
      ),
    );
  }
}

class _VentaForm extends StatefulWidget {
  const _VentaForm();
  @override
  State<_VentaForm> createState() => _VentaFormState();
}

class _VentaFormState extends State<_VentaForm> {
  String? _clienteId;
  String? _clienteNombre;
  String _metodoPago = 'EFECTIVO';
  String _notas = '';
  final List<_ItemForm> _items = [_ItemForm()];

  @override
  Widget build(BuildContext context) {
    final ventas = context.read<VentasProvider>();
    final clientes = ventas.clientes;
    final productos = ventas.productos;

    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Nueva Venta', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark)),
            const SizedBox(height: 20),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Cliente'),
              items: clientes.map((c) => DropdownMenuItem(value: c.id, child: Text(c.nombre))).toList(),
              onChanged: (v) => setState(() { _clienteId = v; _clienteNombre = clientes.firstWhere((c) => c.id == v).nombre; }),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Método de pago'),
              value: _metodoPago,
              items: const [
                DropdownMenuItem(value: 'EFECTIVO', child: Text('Efectivo')),
                DropdownMenuItem(value: 'TRANSFERENCIA', child: Text('Transferencia')),
                DropdownMenuItem(value: 'CREDITO', child: Text('Crédito')),
              ],
              onChanged: (v) => setState(() => _metodoPago = v ?? 'EFECTIVO'),
            ),
            const SizedBox(height: 16),
            const Text('PRODUCTOS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.muted, letterSpacing: 2)),
            const SizedBox(height: 8),
            ..._items.asMap().entries.map((entry) {
              final i = entry.key;
              final item = entry.value;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.inputBg, borderRadius: BorderRadius.circular(14)),
                child: Column(children: [
                  DropdownButtonFormField<String>(
                    decoration: const InputDecoration(labelText: 'Producto', isDense: true),
                    items: productos.map((p) => DropdownMenuItem(value: p.id, child: Text(p.name))).toList(),
                    onChanged: (v) { item.productTypeId = v ?? ''; item.productName = productos.firstWhere((p) => p.id == v).name; },
                  ),
                  const SizedBox(height: 8),
                  Row(children: [
                    Expanded(child: TextField(decoration: const InputDecoration(labelText: 'Kg', isDense: true), keyboardType: TextInputType.number, onChanged: (v) => setState(() => item.cantidadKg = double.tryParse(v) ?? 0))),
                    const SizedBox(width: 8),
                    Expanded(child: TextField(decoration: const InputDecoration(labelText: 'Precio/Kg', isDense: true), keyboardType: TextInputType.number, onChanged: (v) => setState(() => item.precioUnitario = double.tryParse(v) ?? 0))),
                  ]),
                  if (item.cantidadKg > 0 && item.precioUnitario > 0)
                    Padding(padding: const EdgeInsets.only(top: 4), child: Align(alignment: Alignment.centerRight, child: Text('Subtotal: ${_fmt.format(item.cantidadKg * item.precioUnitario)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryDark)))),
                  if (i > 0) Align(alignment: Alignment.centerRight, child: IconButton(icon: const Icon(Icons.remove_circle_outline, color: AppColors.error, size: 20), onPressed: () => setState(() => _items.removeAt(i)))),
                ]),
              );
            }),
            TextButton.icon(onPressed: () => setState(() => _items.add(_ItemForm())), icon: const Icon(Icons.add, size: 18), label: const Text('Agregar producto')),
            const SizedBox(height: 8),
            TextField(decoration: const InputDecoration(labelText: 'Notas (opcional)'), onChanged: (v) => _notas = v),
            const SizedBox(height: 8),
            if (_items.any((i) => i.cantidadKg > 0 && i.precioUnitario > 0))
              Align(alignment: Alignment.centerRight, child: Text('Total: ${_fmt.format(_items.fold<double>(0, (s, i) => s + i.cantidadKg * i.precioUnitario))}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primaryDark))),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity, height: 50,
              child: ElevatedButton(
                onPressed: _clienteId == null || !_items.any((i) => i.productTypeId.isNotEmpty && i.cantidadKg > 0) ? null : () async {
                  final ventaItems = _items.where((i) => i.productTypeId.isNotEmpty && i.cantidadKg > 0).map((i) => VentaItem(productTypeId: i.productTypeId, productName: i.productName, cantidadKg: i.cantidadKg, precioUnitario: i.precioUnitario)).toList();
                  await context.read<VentasProvider>().createVenta(clienteId: _clienteId!, clienteNombre: _clienteNombre!, metodoPago: _metodoPago, items: ventaItems, notas: _notas.isEmpty ? null : _notas);
                  if (context.mounted) Navigator.pop(context);
                },
                child: const Text('Registrar Venta'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ItemForm { String productTypeId = ''; String productName = ''; double cantidadKg = 0; double precioUnitario = 0; }
