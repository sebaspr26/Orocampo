import 'package:flutter/material.dart';
import '../models/ruta.dart';
import '../models/cliente.dart';
import '../services/api_service.dart';
import '../services/db_service.dart';
import '../services/connectivity_service.dart';

class RutaProvider extends ChangeNotifier {
  Ruta? _ruta;
  List<Cliente> _clientes = [];
  final Map<String, bool> _visitados = {};
  final Map<String, bool> _entregados = {};
  bool _loading = false;

  Ruta? get ruta => _ruta;
  List<Cliente> get clientes => _clientes;
  bool get loading => _loading;

  bool isVisitado(String clienteId) => _visitados[clienteId] ?? false;
  bool isEntregado(String clienteId) => _entregados[clienteId] ?? false;

  int get totalClientes => _clientes.length;
  int get visitadosCount => _visitados.values.where((v) => v).length;
  int get entregadosCount => _entregados.values.where((v) => v).length;

  Future<void> loadRuta() async {
    _loading = true;
    notifyListeners();

    try {
      if (ConnectivityService.instance.isOnline) {
        final res = await ApiService.instance.get('/rutas/me');
        final data = res.data['ruta'];
        if (data != null) {
          _ruta = Ruta.fromJson(data);
          _clientes = _ruta!.clientes;
          await _cacheRuta();
        }
      } else {
        await _loadFromCache();
      }
      await _loadVisitasHoy();
    } catch (_) {
      await _loadFromCache();
      await _loadVisitasHoy();
    }

    _loading = false;
    notifyListeners();
  }

  Future<void> toggleVisitado(String clienteId) async {
    _visitados[clienteId] = !(_visitados[clienteId] ?? false);
    await _saveVisita(clienteId);
    notifyListeners();
  }

  Future<void> toggleEntregado(String clienteId) async {
    _entregados[clienteId] = !(_entregados[clienteId] ?? false);
    if (_entregados[clienteId]!) _visitados[clienteId] = true;
    await _saveVisita(clienteId);
    notifyListeners();
  }

  Future<void> _cacheRuta() async {
    final db = await DbService.instance.database;
    await db.delete('ruta');
    await db.delete('ruta_clientes');
    if (_ruta != null) {
      await db.insert('ruta', {'id': _ruta!.id, 'nombre': _ruta!.nombre});
      for (final c in _clientes) {
        await db.insert('ruta_clientes', {
          'id': c.id, 'nombre': c.nombre,
          'telefono': c.telefono, 'direccion': c.direccion,
        });
      }
    }
  }

  Future<void> _loadFromCache() async {
    final db = await DbService.instance.database;
    final rutas = await db.query('ruta', limit: 1);
    if (rutas.isNotEmpty) {
      final clienteRows = await db.query('ruta_clientes');
      _clientes = clienteRows.map((r) => Cliente(
        id: r['id'] as String,
        nombre: r['nombre'] as String,
        telefono: r['telefono'] as String?,
        direccion: r['direccion'] as String?,
      )).toList();
      _ruta = Ruta(id: rutas.first['id'] as String, nombre: rutas.first['nombre'] as String, clientes: _clientes);
    }
  }

  Future<void> _loadVisitasHoy() async {
    final db = await DbService.instance.database;
    final hoy = DateTime.now().toIso8601String().substring(0, 10);
    final rows = await db.query('ruta_clientes', where: "fecha_visita = ?", whereArgs: [hoy]);
    for (final r in rows) {
      _visitados[r['id'] as String] = r['visitado'] == 1;
      _entregados[r['id'] as String] = r['entregado'] == 1;
    }
  }

  Future<void> _saveVisita(String clienteId) async {
    final db = await DbService.instance.database;
    final hoy = DateTime.now().toIso8601String().substring(0, 10);
    await db.update('ruta_clientes', {
      'visitado': _visitados[clienteId] == true ? 1 : 0,
      'entregado': _entregados[clienteId] == true ? 1 : 0,
      'fecha_visita': hoy,
    }, where: 'id = ?', whereArgs: [clienteId]);
  }
}
