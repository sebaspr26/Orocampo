import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:image_picker/image_picker.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../models/pago.dart';
import '../../providers/pagos_provider.dart';
import '../../providers/ventas_provider.dart';

final _fmt = NumberFormat.currency(locale: 'es_CO', symbol: '\$', decimalDigits: 0);
final _dateFmt = DateFormat('hh:mm a', 'es');

class PagosTab extends StatelessWidget {
  const PagosTab({super.key});

  @override
  Widget build(BuildContext context) {
    final pagos = context.watch<PagosProvider>();

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: pagos.loading
          ? const Center(child: OroLoading())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
                  child: _SummaryCard(label: 'Cobrado hoy', value: _fmt.format(pagos.totalCobradoHoy), count: pagos.pagosHoy.length, color: AppColors.success, icon: Icons.check_circle_outline),
                ),
                Expanded(
                  child: pagos.pagosHoy.isEmpty
                      ? Center(child: Column(mainAxisSize: MainAxisSize.min, children: [
                          Icon(Icons.payments_outlined, size: 64, color: AppColors.muted.withOpacity(0.3)),
                          const SizedBox(height: 16),
                          const Text('Sin cobros hoy', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.muted)),
                        ]))
                      : OroRefreshIndicator(
                          onRefresh: () => pagos.loadData(),
                          child: ListView.builder(
                            padding: const EdgeInsets.fromLTRB(20, 8, 20, 80),
                            itemCount: pagos.pagosHoy.length,
                            itemBuilder: (context, i) => _PagoCard(pago: pagos.pagosHoy[i]),
                          ),
                        ),
                ),
              ],
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => showModalBottomSheet(
          context: context, isScrollControlled: true, backgroundColor: Colors.white,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
          builder: (_) => const _PagoForm(),
        ),
        backgroundColor: AppColors.primaryDark, foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Nuevo pago', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String label, value;
  final int count;
  final Color color;
  final IconData icon;
  const _SummaryCard({required this.label, required this.value, required this.count, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(18)),
      child: Row(children: [
        Icon(icon, color: color, size: 28),
        const SizedBox(width: 14),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: TextStyle(fontSize: 12, color: color, fontWeight: FontWeight.w600)),
          Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: color)),
        ]),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: color.withOpacity(0.15), borderRadius: BorderRadius.circular(12)),
          child: Text('$count', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: color)),
        ),
      ]),
    );
  }
}

class _PagoCard extends StatelessWidget {
  final Pago pago;
  const _PagoCard({required this.pago});

  @override
  Widget build(BuildContext context) {
    final synced = pago.syncStatus == 'synced';
    return Container(
      margin: const EdgeInsets.only(bottom: 12), padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12, offset: const Offset(0, 4))]),
      child: Row(children: [
        Container(width: 40, height: 40, decoration: BoxDecoration(color: AppColors.success.withOpacity(0.1), borderRadius: BorderRadius.circular(12)), child: const Icon(Icons.payments_rounded, color: AppColors.success, size: 20)),
        const SizedBox(width: 12),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(pago.clienteNombre ?? 'Cliente', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.dark)),
          Row(children: [
            Text(pago.metodoPago, style: const TextStyle(fontSize: 11, color: AppColors.muted)),
            const SizedBox(width: 8),
            Text(_dateFmt.format(pago.fecha), style: const TextStyle(fontSize: 11, color: AppColors.muted)),
          ]),
        ])),
        if (pago.fotoPath != null) Padding(
          padding: const EdgeInsets.only(right: 8),
          child: GestureDetector(
            onTap: () => _showFoto(context, pago.fotoPath!),
            child: const Icon(Icons.image_outlined, size: 18, color: AppColors.primaryDark),
          ),
        ),
        if (!synced) const Padding(padding: EdgeInsets.only(right: 8), child: Icon(Icons.cloud_upload_outlined, size: 16, color: AppColors.offlineText)),
        Text(_fmt.format(pago.monto), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.success)),
      ]),
    );
  }

  void _showFoto(BuildContext context, String path) {
    showDialog(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(18),
          child: Image.file(File(path), fit: BoxFit.contain),
        ),
      ),
    );
  }
}

class _PagoForm extends StatefulWidget {
  const _PagoForm();
  @override
  State<_PagoForm> createState() => _PagoFormState();
}

class _PagoFormState extends State<_PagoForm> {
  String? _clienteId;
  String? _clienteNombre;
  String _metodoPago = 'EFECTIVO';
  double _monto = 0;
  String _notas = '';
  File? _foto;
  final _picker = ImagePicker();

  Future<void> _tomarFoto() async {
    final picked = await _picker.pickImage(source: ImageSource.camera, maxWidth: 1200, imageQuality: 75);
    if (picked == null) return;
    final dir = await getApplicationDocumentsDirectory();
    final fileName = 'pago_${DateTime.now().millisecondsSinceEpoch}.jpg';
    final saved = await File(picked.path).copy(p.join(dir.path, fileName));
    setState(() => _foto = saved);
  }

  Future<void> _elegirFoto() async {
    final picked = await _picker.pickImage(source: ImageSource.gallery, maxWidth: 1200, imageQuality: 75);
    if (picked == null) return;
    final dir = await getApplicationDocumentsDirectory();
    final fileName = 'pago_${DateTime.now().millisecondsSinceEpoch}.jpg';
    final saved = await File(picked.path).copy(p.join(dir.path, fileName));
    setState(() => _foto = saved);
  }

  @override
  Widget build(BuildContext context) {
    final ventas = context.read<VentasProvider>();
    final clientes = ventas.clientes.where((c) => !c.esMostrador).toList();

    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: SingleChildScrollView(
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Nuevo Pago', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark)),
          const SizedBox(height: 20),
          DropdownButtonFormField<String>(
            decoration: const InputDecoration(labelText: 'Cliente'),
            items: clientes.map((c) => DropdownMenuItem(value: c.id, child: Text(c.nombre))).toList(),
            onChanged: (v) => setState(() { _clienteId = v; _clienteNombre = clientes.firstWhere((c) => c.id == v).nombre; }),
          ),
          const SizedBox(height: 16),
          TextField(decoration: const InputDecoration(labelText: 'Monto'), keyboardType: TextInputType.number, onChanged: (v) => _monto = double.tryParse(v) ?? 0),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            decoration: const InputDecoration(labelText: 'Método de pago'), value: _metodoPago,
            items: const [DropdownMenuItem(value: 'EFECTIVO', child: Text('Efectivo')), DropdownMenuItem(value: 'TRANSFERENCIA', child: Text('Transferencia'))],
            onChanged: (v) => setState(() => _metodoPago = v ?? 'EFECTIVO'),
          ),
          const SizedBox(height: 16),
          TextField(decoration: const InputDecoration(labelText: 'Notas (opcional)'), onChanged: (v) => _notas = v),
          const SizedBox(height: 16),

          // Foto del comprobante
          const Text('COMPROBANTE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: AppColors.muted, letterSpacing: 2)),
          const SizedBox(height: 8),
          if (_foto != null) ...[
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: Stack(
                children: [
                  Image.file(_foto!, height: 180, width: double.infinity, fit: BoxFit.cover),
                  Positioned(
                    top: 8, right: 8,
                    child: GestureDetector(
                      onTap: () => setState(() => _foto = null),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(color: Colors.black54, shape: BoxShape.circle),
                        child: const Icon(Icons.close, color: Colors.white, size: 18),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ] else
            Row(children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _tomarFoto,
                  icon: const Icon(Icons.camera_alt_outlined, size: 18),
                  label: const Text('Cámara'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primaryDark,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _elegirFoto,
                  icon: const Icon(Icons.photo_library_outlined, size: 18),
                  label: const Text('Galería'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primaryDark,
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
            ]),

          const SizedBox(height: 24),
          SizedBox(width: double.infinity, height: 50, child: ElevatedButton(
            onPressed: _clienteId == null || _monto <= 0 ? null : () async {
              await context.read<PagosProvider>().createPago(
                clienteId: _clienteId!, clienteNombre: _clienteNombre!, monto: _monto, metodoPago: _metodoPago,
                notas: _notas.isEmpty ? null : _notas, fotoPath: _foto?.path,
              );
              if (context.mounted) Navigator.pop(context);
            },
            child: const Text('Registrar Pago'),
          )),
        ]),
      ),
    );
  }
}
