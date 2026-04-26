import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/devolucion.dart';
import '../services/db_service.dart';
import '../services/sync_service.dart';

class DevolucionesProvider extends ChangeNotifier {
  List<Devolucion> _devoluciones = [];
  bool _loading = false;
  final _uuid = const Uuid();

  List<Devolucion> get devoluciones => _devoluciones;
  bool get loading => _loading;

  Future<void> loadData() async {
    _loading = true;
    notifyListeners();

    final db = await DbService.instance.database;
    final rows = await db.query('devoluciones', orderBy: 'created_at DESC');
    _devoluciones = rows.map((r) => Devolucion.fromDb(r)).toList();

    _loading = false;
    notifyListeners();
  }

  Future<Devolucion> createDevolucion({
    required String clienteId,
    required String clienteNombre,
    String? ventaId,
    required String motivo,
    required List<DevolucionItem> items,
  }) async {
    final devolucion = Devolucion(
      id: _uuid.v4(),
      clienteId: clienteId,
      clienteNombre: clienteNombre,
      ventaId: ventaId,
      motivo: motivo,
      items: items,
      createdAt: DateTime.now(),
    );

    final db = await DbService.instance.database;
    await db.insert('devoluciones', devolucion.toDb());
    _devoluciones.insert(0, devolucion);
    notifyListeners();

    await SyncService.instance.enqueue('POST', '/devoluciones', devolucion.toApiBody());
    return devolucion;
  }
}
