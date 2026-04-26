import 'dart:convert';

class DevolucionItem {
  final String productTypeId;
  final String productName;
  final double cantidadKg;
  final String razon;

  DevolucionItem({
    required this.productTypeId,
    required this.productName,
    required this.cantidadKg,
    required this.razon,
  });

  Map<String, dynamic> toJson() => {
    'productTypeId': productTypeId,
    'productName': productName,
    'cantidadKg': cantidadKg,
    'razon': razon,
  };

  factory DevolucionItem.fromJson(Map<String, dynamic> json) => DevolucionItem(
    productTypeId: json['productTypeId'],
    productName: json['productName'] ?? '',
    cantidadKg: (json['cantidadKg'] as num).toDouble(),
    razon: json['razon'],
  );
}

class Devolucion {
  final String id;
  final String? serverId;
  final String clienteId;
  final String? clienteNombre;
  final String? ventaId;
  final String motivo;
  final List<DevolucionItem> items;
  final DateTime createdAt;
  final String syncStatus;

  Devolucion({
    required this.id,
    this.serverId,
    required this.clienteId,
    this.clienteNombre,
    this.ventaId,
    required this.motivo,
    required this.items,
    required this.createdAt,
    this.syncStatus = 'pending',
  });

  factory Devolucion.fromDb(Map<String, dynamic> row) => Devolucion(
    id: row['id'],
    serverId: row['server_id'],
    clienteId: row['cliente_id'],
    clienteNombre: row['cliente_nombre'],
    ventaId: row['venta_id'],
    motivo: row['motivo'],
    items: (jsonDecode(row['items_json']) as List).map((e) => DevolucionItem.fromJson(e)).toList(),
    createdAt: DateTime.fromMillisecondsSinceEpoch(row['created_at']),
    syncStatus: row['sync_status'],
  );

  Map<String, dynamic> toDb() => {
    'id': id,
    'server_id': serverId,
    'cliente_id': clienteId,
    'cliente_nombre': clienteNombre,
    'venta_id': ventaId,
    'motivo': motivo,
    'items_json': jsonEncode(items.map((e) => e.toJson()).toList()),
    'created_at': createdAt.millisecondsSinceEpoch,
    'sync_status': syncStatus,
  };

  Map<String, dynamic> toApiBody() => {
    '_localId': id,
    'clienteId': clienteId,
    'ventaId': ventaId,
    'motivo': motivo,
    'items': items.map((e) => {
      'productTypeId': e.productTypeId,
      'cantidadKg': e.cantidadKg,
      'razon': e.razon,
    }).toList(),
  };
}
