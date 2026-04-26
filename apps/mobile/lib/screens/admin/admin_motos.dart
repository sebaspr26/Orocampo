import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../config/app_theme.dart';
import '../../widgets/oro_loading.dart';
import '../../widgets/oro_refresh_indicator.dart';
import '../../services/api_service.dart';

final _dateFmt = DateFormat('dd/MM/yy');

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

  @override
  Widget build(BuildContext context) {
    if (_loading) return const Center(child: OroLoading());

    return OroRefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.all(20),
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
                ..._alertas.map((a) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Text('${a['placa']} — ${a['tipo']}: ${a['mensaje'] ?? 'Vence pronto'}', style: const TextStyle(fontSize: 12, color: AppColors.offlineText)),
                )),
              ]),
            ),
            const SizedBox(height: 16),
          ],
          ..._motos.map((m) {
            final active = m['isActive'] == true;
            return Container(
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
                  if (m['marca'] != null) Text(m['marca'], style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                  const SizedBox(height: 4),
                  Row(children: [
                    _DocBadge('TM', m['tecnoFin']),
                    const SizedBox(width: 6),
                    _DocBadge('SOAT', m['soatFin']),
                  ]),
                ])),
                if (!active) const Text('Inactiva', style: TextStyle(fontSize: 10, color: AppColors.muted, fontWeight: FontWeight.w600)),
              ]),
            );
          }),
        ],
      ),
    );
  }
}

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
