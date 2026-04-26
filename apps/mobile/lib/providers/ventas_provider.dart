import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';
import '../models/venta.dart';
import '../models/cliente.dart';
import '../models/producto.dart';
import '../services/db_service.dart';
import '../services/sync_service.dart';
import '../services/api_service.dart';
import '../services/connectivity_service.dart';

class VentasProvider extends ChangeNotifier {
  List<Venta> _ventas = [];
  List<Cliente> _clientes = [];
  List<Producto> _productos = [];
  bool _loading = false;
  final _uuid = const Uuid();

  List<Venta> get ventas => _ventas;
  List<Cliente> get clientes => _clientes;
  List<Producto> get productos => _productos;
  bool get loading => _loading;

  List<Venta> get ventasHoy {
    final hoy = DateTime.now();
    return _ventas.where((v) =>
      v.createdAt.year == hoy.year &&
      v.createdAt.month == hoy.month &&
      v.createdAt.day == hoy.day
    ).toList();
  }

  double get totalVentasHoy => ventasHoy.fold(0, (sum, v) => sum + v.total);

  Future<void> loadData() async {
    _loading = true;
    notifyListeners();

    final db = await DbService.instance.database;

    // Cargar cache de clientes y productos
    if (ConnectivityService.instance.isOnline) {
      try {
        final [clientesRes, productosRes] = await Future.wait([
          ApiService.instance.get('/clientes'),
          ApiService.instance.get('/product-types'),
        ]);

        final clientesList = (clientesRes.data['clientes'] as List?) ?? [];
        final productosList = (productosRes.data['productTypes'] as List?) ?? [];

        await db.delete('clientes');
        for (final c in clientesList) {
          await db.insert('clientes', Cliente.fromJson(c).toDb());
        }

        await db.delete('productos');
        for (final p in productosList) {
          await db.insert('productos', Producto.fromJson(p).toDb());
        }
      } catch (_) {}
    }

    // Leer del cache local
    final clienteRows = await db.query('clientes', where: 'is_active = 1');
    _clientes = clienteRows.map((r) => Cliente(
      id: r['id'] as String,
      nombre: r['nombre'] as String,
      telefono: r['telefono'] as String?,
      direccion: r['direccion'] as String?,
      esMostrador: r['es_mostrador'] == 1,
    )).toList();

    final prodRows = await db.query('productos');
    _productos = prodRows.map((r) => Producto(id: r['id'] as String, name: r['name'] as String)).toList();

    // Cargar ventas locales
    final ventaRows = await db.query('ventas', orderBy: 'created_at DESC');
    _ventas = ventaRows.map((r) => Venta.fromDb(r)).toList();

    _loading = false;
    notifyListeners();
  }

  Future<Venta> createVenta({
    required String clienteId,
    required String clienteNombre,
    required String metodoPago,
    required List<VentaItem> items,
    String? notas,
  }) async {
    final total = items.fold<double>(0, (sum, i) => sum + i.subtotal);
    final venta = Venta(
      id: _uuid.v4(),
      clienteId: clienteId,
      clienteNombre: clienteNombre,
      metodoPago: metodoPago,
      total: total,
      items: items,
      notas: notas,
      createdAt: DateTime.now(),
    );

    final db = await DbService.instance.database;
    await db.insert('ventas', venta.toDb());
    _ventas.insert(0, venta);
    notifyListeners();

    await SyncService.instance.enqueue('POST', '/ventas', venta.toApiBody());
    return venta;
  }
}
