import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _dateFmt = DateFormat('dd/MM/yy');
final _dateFmtFull = DateFormat('dd/MM/yyyy');

class AdminMotos extends StatefulWidget {
  const AdminMotos({super.key});
  @override
  State<AdminMotos> createState() => _AdminMotosState();
}

class _AdminMotosState extends State<AdminMotos> {
  List<dynamic> _motos = [];
  List<dynamic> _alertas = [];
  bool _loading = true;

  @override
  void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final [motosRes, alertasRes] = await Future.wait([
        ApiService.instance.get('/motos'),
        ApiService.instance.get('/motos/alertas'),
      ]);
      setState(() {
        _motos = (motosRes.data['motos'] as List?) ?? [];
        _alertas = (alertasRes.data['alertas'] as List?) ?? [];
        _loading = false;
      });
    } catch (_) { setState(() => _loading = false); }
  }

  void _showMotoDetail(Map<String, dynamic> moto) {
    showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _MotoDetail(moto: moto, onChanged: _load),
    );
  }

  void _showMotoForm([Map<String, dynamic>? moto]) {
    showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (_) => _MotoForm(moto: moto, onSaved: _load),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    return Stack(
      children: [
        OroRefreshIndicator(
          onRefresh: _load,
          child: ListView(
            padding: const EdgeInsets.fromLTRB(20, 20, 20, 90),
            children: [
              if (_alertas.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(color: AppColors.offlineBg, borderRadius: BorderRadius.circular(14)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    const Row(children: [
                      Icon(Icons.warning_amber_rounded, size: 18, color: AppColors.offlineText),
                      SizedBox(width: 8),
                      Text('Alertas de documentos', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.offlineText)),
                    ]),
                    const SizedBox(height: 8),
                    ..._alertas.map((a) {
                      final dias = a['diasRestantes'];
                      final msg = dias != null ? (dias < 0 ? 'Vencido hace ${-dias} dias' : 'Vence en $dias dias') : (a['mensaje'] ?? 'Vence pronto');
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 4),
                        child: Text('${a['placa']} — ${a['tipo']}: $msg', style: const TextStyle(fontSize: 12, color: AppColors.offlineText)),
                      );
                    }),
                  ]),
                ),
                const SizedBox(height: 16),
              ],
              ..._motos.map((m) {
                final active = m['isActive'] == true;
                return GestureDetector(
                  onTap: () => _showMotoDetail(Map<String, dynamic>.from(m)),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: active ? Colors.white : Colors.white.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 8)],
                    ),
                    child: Row(children: [
                      Container(width: 44, height: 44, decoration: BoxDecoration(
                        color: active ? AppColors.primary.withOpacity(0.1) : AppColors.inputBg,
                        borderRadius: BorderRadius.circular(12),
                      ), child: Icon(Icons.two_wheeler_rounded, color: active ? AppColors.primaryDark : AppColors.muted, size: 24)),
                      const SizedBox(width: 14),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(m['placa'] ?? '', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: active ? AppColors.dark : AppColors.muted, letterSpacing: 1)),
                        if (m['picoYPlaca'] != null && m['picoYPlaca'].toString().isNotEmpty)
                          Text('Pico y placa: ${m['picoYPlaca']}', style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                        const SizedBox(height: 4),
                        Row(children: [
                          _DocBadge('TM', m['fechaFinTecno']),
                          const SizedBox(width: 6),
                          _DocBadge('SOAT', m['fechaFinSeguro']),
                        ]),
                      ])),
                      if (!active) const Text('Inactiva', style: TextStyle(fontSize: 10, color: AppColors.muted, fontWeight: FontWeight.w600)),
                      const SizedBox(width: 4),
                      const Icon(Icons.chevron_right_rounded, color: AppColors.muted, size: 20),
                    ]),
                  ),
                );
              }),
            ],
          ),
        ),
        Positioned(
          right: 20,
          bottom: 20,
          child: FloatingActionButton.extended(
            onPressed: () => _showMotoForm(),
            backgroundColor: AppColors.primaryDark,
            icon: const Icon(Icons.add, color: Colors.white),
            label: const Text('Nueva Moto', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ),
      ],
    );
  }
}

// --- Detail bottom sheet ---

class _MotoDetail extends StatefulWidget {
  final Map<String, dynamic> moto;
  final VoidCallback onChanged;
  const _MotoDetail({required this.moto, required this.onChanged});
  @override
  State<_MotoDetail> createState() => _MotoDetailState();
}

class _MotoDetailState extends State<_MotoDetail> {
  bool _toggling = false;
  bool _deleting = false;

  Future<void> _toggle() async {
    setState(() => _toggling = true);
    try {
      await ApiService.instance.patch('/motos/${widget.moto['id']}/toggle', data: {});
      widget.onChanged();
      if (mounted) Navigator.pop(context);
    } catch (_) {
      setState(() => _toggling = false);
    }
  }

  Future<void> _delete() async {
    final confirm = await showDialog<bool>(context: context, builder: (ctx) => AlertDialog(
      title: const Text('Eliminar moto'),
      content: Text('Eliminar ${widget.moto['placa']}? Esta accion no se puede deshacer.'),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancelar')),
        TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Eliminar', style: TextStyle(color: AppColors.error))),
      ],
    ));
    if (confirm != true) return;
    setState(() => _deleting = true);
    try {
      await ApiService.instance.delete('/motos/${widget.moto['id']}');
      widget.onChanged();
      if (mounted) Navigator.pop(context);
    } catch (_) {
      setState(() => _deleting = false);
    }
  }

  String _fmtDate(dynamic raw) {
    if (raw == null) return '—';
    final d = DateTime.tryParse(raw.toString());
    return d != null ? _dateFmtFull.format(d) : '—';
  }

  @override
  Widget build(BuildContext context) {
    final m = widget.moto;
    final active = m['isActive'] == true;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Expanded(child: Text(m['placa'] ?? '', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.dark, letterSpacing: 1))),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: active ? AppColors.successBg : AppColors.errorBg,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(active ? 'Activa' : 'Inactiva', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: active ? AppColors.success : AppColors.error)),
          ),
        ]),
        const SizedBox(height: 20),
        _DetailRow('Pico y Placa', m['picoYPlaca']?.toString() ?? '—'),
        _DetailRow('Inicio Tecnomecanica', _fmtDate(m['fechaInicioTecno'])),
        _DetailRow('Fin Tecnomecanica', _fmtDate(m['fechaFinTecno'])),
        _DetailRow('Inicio SOAT', _fmtDate(m['fechaInicioSeguro'])),
        _DetailRow('Fin SOAT', _fmtDate(m['fechaFinSeguro'])),
        if (m['notas'] != null && m['notas'].toString().isNotEmpty) ...[
          const SizedBox(height: 8),
          Text('Notas', style: const TextStyle(fontSize: 12, color: AppColors.muted)),
          const SizedBox(height: 2),
          Text(m['notas'], style: const TextStyle(fontSize: 14, color: AppColors.dark)),
        ],
        const SizedBox(height: 24),
        Row(children: [
          Expanded(child: OutlinedButton.icon(
            onPressed: () {
              Navigator.pop(context);
              Future.microtask(() {
                showModalBottomSheet(context: context, isScrollControlled: true, backgroundColor: Colors.white,
                  shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
                  builder: (_) => _MotoForm(moto: m, onSaved: widget.onChanged),
                );
              });
            },
            icon: const Icon(Icons.edit_outlined, size: 18),
            label: const Text('Editar'),
          )),
          const SizedBox(width: 10),
          Expanded(child: ElevatedButton.icon(
            onPressed: _toggling ? null : _toggle,
            style: ElevatedButton.styleFrom(backgroundColor: active ? AppColors.muted : AppColors.primaryDark),
            icon: _toggling
              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
              : Icon(active ? Icons.block : Icons.check_circle_outline, size: 18, color: Colors.white),
            label: Text(active ? 'Desactivar' : 'Activar', style: const TextStyle(color: Colors.white)),
          )),
        ]),
        const SizedBox(height: 10),
        SizedBox(width: double.infinity, child: TextButton.icon(
          onPressed: _deleting ? null : _delete,
          icon: _deleting
            ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.error))
            : const Icon(Icons.delete_outline, size: 18, color: AppColors.error),
          label: const Text('Eliminar moto', style: TextStyle(color: AppColors.error)),
        )),
        const SizedBox(height: 8),
      ]),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final String label;
  final String value;
  const _DetailRow(this.label, this.value);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      Text(label, style: const TextStyle(fontSize: 13, color: AppColors.muted)),
      Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.dark)),
    ]),
  );
}

// --- Form bottom sheet ---

class _MotoForm extends StatefulWidget {
  final Map<String, dynamic>? moto;
  final VoidCallback onSaved;
  const _MotoForm({this.moto, required this.onSaved});
  @override
  State<_MotoForm> createState() => _MotoFormState();
}

class _MotoFormState extends State<_MotoForm> {
  late final TextEditingController _placaCtrl;
  late final TextEditingController _picoCtrl;
  late final TextEditingController _notasCtrl;
  DateTime? _inicioTecno;
  DateTime? _inicioSeguro;
  bool _saving = false;

  bool get _isEdit => widget.moto != null;

  @override
  void initState() {
    super.initState();
    final m = widget.moto;
    _placaCtrl = TextEditingController(text: m?['placa'] ?? '');
    _picoCtrl = TextEditingController(text: m?['picoYPlaca'] ?? '');
    _notasCtrl = TextEditingController(text: m?['notas'] ?? '');
    if (m?['fechaInicioTecno'] != null) _inicioTecno = DateTime.tryParse(m!['fechaInicioTecno'].toString());
    if (m?['fechaInicioSeguro'] != null) _inicioSeguro = DateTime.tryParse(m!['fechaInicioSeguro'].toString());
  }

  @override
  void dispose() { _placaCtrl.dispose(); _picoCtrl.dispose(); _notasCtrl.dispose(); super.dispose(); }

  Future<void> _save() async {
    final placa = _placaCtrl.text.trim().toUpperCase();
    if (placa.isEmpty) return;
    setState(() => _saving = true);
    try {
      final body = <String, dynamic>{
        'placa': placa,
        'picoYPlaca': _picoCtrl.text.trim(),
        'notas': _notasCtrl.text.trim(),
        if (_inicioTecno != null) 'fechaInicioTecno': _inicioTecno!.toIso8601String(),
        if (_inicioSeguro != null) 'fechaInicioSeguro': _inicioSeguro!.toIso8601String(),
      };
      if (_isEdit) {
        await ApiService.instance.patch('/motos/${widget.moto!['id']}', data: body);
      } else {
        await ApiService.instance.post('/motos', data: body);
      }
      widget.onSaved();
      if (mounted) Navigator.pop(context);
    } catch (_) {
      setState(() => _saving = false);
    }
  }

  Future<void> _pickDate({required DateTime? current, required ValueChanged<DateTime> onPicked}) async {
    final d = await showDatePicker(
      context: context,
      initialDate: current ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime.now().add(const Duration(days: 730)),
    );
    if (d != null) setState(() => onPicked(d));
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: SingleChildScrollView(child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(_isEdit ? 'Editar Moto' : 'Nueva Moto', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.dark)),
        const SizedBox(height: 20),
        TextField(
          controller: _placaCtrl,
          textCapitalization: TextCapitalization.characters,
          decoration: const InputDecoration(labelText: 'Placa'),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _picoCtrl,
          decoration: const InputDecoration(labelText: 'Pico y Placa (dia de la semana)'),
        ),
        const SizedBox(height: 16),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Inicio Tecnomecanica', style: TextStyle(fontSize: 12, color: AppColors.muted)),
          subtitle: Text(_inicioTecno != null ? _dateFmtFull.format(_inicioTecno!) : 'Sin seleccionar', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: _inicioTecno != null ? AppColors.dark : AppColors.muted)),
          trailing: const Icon(Icons.calendar_today, color: AppColors.primaryDark),
          onTap: () => _pickDate(current: _inicioTecno, onPicked: (d) => _inicioTecno = d),
        ),
        ListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Inicio SOAT', style: TextStyle(fontSize: 12, color: AppColors.muted)),
          subtitle: Text(_inicioSeguro != null ? _dateFmtFull.format(_inicioSeguro!) : 'Sin seleccionar', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: _inicioSeguro != null ? AppColors.dark : AppColors.muted)),
          trailing: const Icon(Icons.calendar_today, color: AppColors.primaryDark),
          onTap: () => _pickDate(current: _inicioSeguro, onPicked: (d) => _inicioSeguro = d),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _notasCtrl,
          decoration: const InputDecoration(labelText: 'Notas'),
          maxLines: 3,
          minLines: 1,
        ),
        const SizedBox(height: 24),
        SizedBox(width: double.infinity, height: 50, child: ElevatedButton(
          onPressed: _saving ? null : _save,
          child: _saving
            ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : Text(_isEdit ? 'Guardar Cambios' : 'Crear Moto'),
        )),
      ])),
    );
  }
}

// --- Doc badge ---

class _DocBadge extends StatelessWidget {
  final String label;
  final dynamic fecha;
  const _DocBadge(this.label, this.fecha);

  @override
  Widget build(BuildContext context) {
    Color bg = AppColors.inputBg;
    Color fg = AppColors.muted;
    String text = label;

    if (fecha != null) {
      final date = DateTime.tryParse(fecha.toString());
      if (date != null) {
        final days = date.difference(DateTime.now()).inDays;
        if (days < 0) { bg = AppColors.errorBg; fg = AppColors.error; text = '$label Vencido'; }
        else if (days <= 30) { bg = AppColors.offlineBg; fg = AppColors.offlineText; text = '$label ${_dateFmt.format(date)}'; }
        else { bg = AppColors.successBg; fg = AppColors.success; text = '$label OK'; }
      }
    } else {
      text = '$label —';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(6)),
      child: Text(text, style: TextStyle(fontSize: 9, fontWeight: FontWeight.w700, color: fg)),
    );
  }
}
