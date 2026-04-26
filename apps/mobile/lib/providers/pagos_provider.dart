import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/pago.dart';
import '../services/db_service.dart';
import '../services/sync_service.dart';

class PagosProvider extends ChangeNotifier {
  List<Pago> _pagos = [];
  bool _loading = false;
  final _uuid = const Uuid();

  List<Pago> get pagos => _pagos;
  bool get loading => _loading;

  List<Pago> get pagosHoy {
    final hoy = DateTime.now();
    return _pagos.where((p) =>
      p.fecha.year == hoy.year &&
      p.fecha.month == hoy.month &&
      p.fecha.day == hoy.day
    ).toList();
  }

  double get totalCobradoHoy => pagosHoy.fold(0, (sum, p) => sum + p.monto);

  Future<void> loadData() async {
    _loading = true;
    notifyListeners();

    final db = await DbService.instance.database;
    final rows = await db.query('pagos', orderBy: 'fecha DESC');
    _pagos = rows.map((r) => Pago.fromDb(r)).toList();

    _loading = false;
    notifyListeners();
  }

  Future<Pago> createPago({
    required String clienteId,
    required String clienteNombre,
    String? ventaId,
    required double monto,
    required String metodoPago,
    String? notas,
    String? fotoPath,
  }) async {
    final pago = Pago(
      id: _uuid.v4(),
      clienteId: clienteId,
      clienteNombre: clienteNombre,
      ventaId: ventaId,
      monto: monto,
      metodoPago: metodoPago,
      fecha: DateTime.now(),
      notas: notas,
      fotoPath: fotoPath,
    );

    final db = await DbService.instance.database;
    await db.insert('pagos', pago.toDb());
    _pagos.insert(0, pago);
    notifyListeners();

    await SyncService.instance.enqueue('POST', '/pagos', pago.toApiBody());
    return pago;
  }
}
