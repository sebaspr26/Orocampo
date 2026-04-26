import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../models/devolucion.dart';
import '../../providers/devoluciones_provider.dart';
import '../../providers/ventas_provider.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);

const _razones = [
  {'value': 'CLIENTE_RECHAZO', 'label': 'Rechazo del cliente'},
  {'value': 'VENCIDO', 'label': 'Producto vencido'},
  {'value': 'MAL_ESTADO', 'label': 'Mal estado'},
  {'value': 'EXCESO', 'label': 'Exceso de producto'},
];

class DevolucionesTab extends StatelessWidget {
  const DevolucionesTab({super.key});

  @override
  Widget build(BuildContext context) {
    final devProvider = context.watch<DevolucionesProvider>();

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: devProvider.loading
          ? const Center(child: OroLoading())
          : devProvider.devoluciones.isEmpty
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.assignment_return_outlined, size: 64, color: AppColors.muted.withOpacity(0.3)),
                      const SizedBox(height: 16),
                      const Text('Sin devoluciones', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.muted)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: devProvider.devoluciones.length,
                  itemBuilder: (context, i) {
                    final d = devProvider.devoluciones[i];
                    return _DevolucionCard(devolucion: d);
                  },
                ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(context),
        backgroundColor: AppColors.primaryDark,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Nueva devolución', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }

  void _showForm(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => const _DevolucionForm(),
    );
  }
}

class _DevolucionCard extends StatelessWidget {
  final Devolucion devolucion;
  const _DevolucionCard({required this.devolucion});

  @override
  Widget build(BuildContext context) {
    final synced = devolucion.syncStatus == 'synced';
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12, offset: const Offset(0, 4))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(child: Text(devolucion.clienteNombre ?? 'Cliente', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.dark))),
              if (!synced) const Icon(Icons.cloud_upload_outlined, size: 16, color: AppColors.offlineText),
            ],
          ),
          const SizedBox(height: 4),
          Text(devolucion.motivo, style: const TextStyle(fontSize: 12, color: AppColors.muted)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            children: devolucion.items.map((item) => Chip(
              label: Text('${item.productName} · ${item.cantidadKg}kg', style: const TextStyle(fontSize: 11)),
              backgroundColor: AppColors.inputBg,
              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              visualDensity: VisualDensity.compact,
            )).toList(),
          ),
        ],
      ),
    );
  }
}

class _DevolucionForm extends StatefulWidget {
  const _DevolucionForm();
  @override
  State<_DevolucionForm> createState() => _DevolucionFormState();
}

class _DevolucionFormState extends State<_DevolucionForm> {
  String? _clienteId;
  String? _clienteNombre;
  String _motivo = '';
  final List<_ItemForm> _items = [_ItemForm()];

  @override
  Widget build(BuildContext context) {
    final ventas = context.read<VentasProvider>();
    final clientes = ventas.clientes.where((c) => !c.esMostrador).toList();
    final productos = ventas.productos;

    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Nueva Devolución', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark)),
            const SizedBox(height: 20),

            DropdownButtonFormField<String>(
              decoration: const InputDecoration(labelText: 'Cliente'),
              items: clientes.map((c) => DropdownMenuItem(value: c.id, child: Text(c.nombre))).toList(),
              onChanged: (v) => setState(() { _clienteId = v; _clienteNombre = clientes.firstWhere((c) => c.id == v).nombre; }),
            ),
            const SizedBox(height: 16),

            TextField(
              decoration: const InputDecoration(labelText: 'Motivo general'),
              onChanged: (v) => _motivo = v,
            ),
            const SizedBox(height: 16),

            const Text('ITEMS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.muted, letterSpacing: 2)),
            const SizedBox(height: 8),

            ..._items.asMap().entries.map((entry) {
              final i = entry.key;
              final item = entry.value;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppColors.inputBg, borderRadius: BorderRadius.circular(14)),
                child: Column(
                  children: [
                    DropdownButtonFormField<String>(
                      decoration: const InputDecoration(labelText: 'Producto', isDense: true),
                      items: productos.map((p) => DropdownMenuItem(value: p.id, child: Text(p.name))).toList(),
                      onChanged: (v) { item.productTypeId = v ?? ''; item.productName = productos.firstWhere((p) => p.id == v).name; },
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(child: TextField(
                          decoration: const InputDecoration(labelText: 'Kg', isDense: true),
                          keyboardType: TextInputType.number,
                          onChanged: (v) => item.cantidadKg = double.tryParse(v) ?? 0,
                        )),
                        const SizedBox(width: 8),
                        Expanded(child: DropdownButtonFormField<String>(
                          decoration: const InputDecoration(labelText: 'Razón', isDense: true),
                          items: _razones.map((r) => DropdownMenuItem(value: r['value'], child: Text(r['label']!, style: const TextStyle(fontSize: 12)))).toList(),
                          onChanged: (v) => item.razon = v ?? '',
                        )),
                      ],
                    ),
                    if (i > 0) Align(
                      alignment: Alignment.centerRight,
                      child: IconButton(icon: const Icon(Icons.remove_circle_outline, color: AppColors.error, size: 20), onPressed: () => setState(() => _items.removeAt(i))),
                    ),
                  ],
                ),
              );
            }),

            TextButton.icon(
              onPressed: () => setState(() => _items.add(_ItemForm())),
              icon: const Icon(Icons.add, size: 18),
              label: const Text('Agregar item'),
            ),
            const SizedBox(height: 20),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _clienteId == null || _motivo.isEmpty ? null : () async {
                  final devItems = _items.where((i) => i.productTypeId.isNotEmpty && i.cantidadKg > 0).map((i) =>
                    DevolucionItem(productTypeId: i.productTypeId, productName: i.productName, cantidadKg: i.cantidadKg, razon: i.razon),
                  ).toList();
                  if (devItems.isEmpty) return;
                  await context.read<DevolucionesProvider>().createDevolucion(
                    clienteId: _clienteId!, clienteNombre: _clienteNombre!, motivo: _motivo, items: devItems,
                  );
                  if (context.mounted) Navigator.pop(context);
                },
                child: const Text('Registrar Devolución'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ItemForm {
  String productTypeId = '';
  String productName = '';
  double cantidadKg = 0;
  String razon = 'CLIENTE_RECHAZO';
}
