import 'dart:convert';

class VentaItem {
  final String productTypeId;
  final String productName;
  final double cantidadKg;
  final double precioUnitario;
  double get subtotal => cantidadKg * precioUnitario;

  VentaItem({
    required this.productTypeId,
    required this.productName,
    required this.cantidadKg,
    required this.precioUnitario,
  });

  Map<String, dynamic> toJson() => {
    'productTypeId': productTypeId,
    'productName': productName,
    'cantidadKg': cantidadKg,
    'precioUnitario': precioUnitario,
  };

  factory VentaItem.fromJson(Map<String, dynamic> json) => VentaItem(
    productTypeId: json['productTypeId'],
    productName: json['productName'] ?? '',
    cantidadKg: (json['cantidadKg'] as num).toDouble(),
    precioUnitario: (json['precioUnitario'] as num).toDouble(),
  );
}

class Venta {
  final String id;
  final String? serverId;
  final String clienteId;
  final String? clienteNombre;
  final String metodoPago;
  final double total;
  final String estado;
  final String? notas;
  final List<VentaItem> items;
  final DateTime createdAt;
  final String syncStatus;

  Venta({
    required this.id,
    this.serverId,
    required this.clienteId,
    this.clienteNombre,
    required this.metodoPago,
    required this.total,
    this.estado = 'PENDIENTE',
    this.notas,
    required this.items,
    required this.createdAt,
    this.syncStatus = 'pending',
  });

  factory Venta.fromDb(Map<String, dynamic> row) => Venta(
    id: row['id'],
    serverId: row['server_id'],
    clienteId: row['cliente_id'],
    clienteNombre: row['cliente_nombre'],
    metodoPago: row['metodo_pago'],
    total: (row['total'] as num).toDouble(),
    estado: row['estado'],
    notas: row['notas'],
    items: (jsonDecode(row['items_json']) as List).map((e) => VentaItem.fromJson(e)).toList(),
    createdAt: DateTime.fromMillisecondsSinceEpoch(row['created_at']),
    syncStatus: row['sync_status'],
  );

  Map<String, dynamic> toDb() => {
    'id': id,
    'server_id': serverId,
    'cliente_id': clienteId,
    'cliente_nombre': clienteNombre,
    'metodo_pago': metodoPago,
    'total': total,
    'estado': estado,
    'notas': notas,
    'items_json': jsonEncode(items.map((e) => e.toJson()).toList()),
    'created_at': createdAt.millisecondsSinceEpoch,
    'sync_status': syncStatus,
  };

  Map<String, dynamic> toApiBody() => {
    '_localId': id,
    'clienteId': clienteId,
    'metodoPago': metodoPago,
    'notas': notas,
    'items': items.map((e) => {
      'productTypeId': e.productTypeId,
      'cantidadKg': e.cantidadKg,
      'precioUnitario': e.precioUnitario,
    }).toList(),
  };
}
