class Pago {
  final String id;
  final String? serverId;
  final String clienteId;
  final String? clienteNombre;
  final String? ventaId;
  final double monto;
  final String metodoPago;
  final DateTime fecha;
  final String? notas;
  final String? fotoPath;
  final String syncStatus;

  Pago({
    required this.id,
    this.serverId,
    required this.clienteId,
    this.clienteNombre,
    this.ventaId,
    required this.monto,
    required this.metodoPago,
    required this.fecha,
    this.notas,
    this.fotoPath,
    this.syncStatus = 'pending',
  });

  factory Pago.fromDb(Map<String, dynamic> row) => Pago(
    id: row['id'],
    serverId: row['server_id'],
    clienteId: row['cliente_id'],
    clienteNombre: row['cliente_nombre'],
    ventaId: row['venta_id'],
    monto: (row['monto'] as num).toDouble(),
    metodoPago: row['metodo_pago'],
    fecha: DateTime.fromMillisecondsSinceEpoch(row['fecha']),
    notas: row['notas'],
    fotoPath: row['foto_path'],
    syncStatus: row['sync_status'],
  );

  Map<String, dynamic> toDb() => {
    'id': id,
    'server_id': serverId,
    'cliente_id': clienteId,
    'cliente_nombre': clienteNombre,
    'venta_id': ventaId,
    'monto': monto,
    'metodo_pago': metodoPago,
    'fecha': fecha.millisecondsSinceEpoch,
    'notas': notas,
    'foto_path': fotoPath,
    'sync_status': syncStatus,
  };

  Map<String, dynamic> toApiBody() => {
    '_localId': id,
    'clienteId': clienteId,
    'ventaId': ventaId,
    'monto': monto,
    'metodoPago': metodoPago,
    'notas': notas,
  };
}
