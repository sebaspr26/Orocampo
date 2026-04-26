import 'dart:async';
import 'dart:convert';
import 'package:uuid/uuid.dart';
import 'db_service.dart';
import 'api_service.dart';
import 'connectivity_service.dart';

class SyncService {
  static final SyncService _instance = SyncService._();
  static SyncService get instance => _instance;

  final _uuid = const Uuid();
  bool _isSyncing = false;
  StreamSubscription? _connectivitySub;
  final _changeController = StreamController<int>.broadcast();

  Stream<int> get onPendingCountChange => _changeController.stream;
  bool get isSyncing => _isSyncing;

  SyncService._();

  void init() {
    _connectivitySub = ConnectivityService.instance.onStatusChange.listen((online) {
      if (online) processQueue();
    });
  }

  Future<String> enqueue(String method, String endpoint, Map<String, dynamic> body) async {
    final db = await DbService.instance.database;
    final id = _uuid.v4();
    await db.insert('sync_queue', {
      'id': id,
      'method': method,
      'endpoint': endpoint,
      'body': jsonEncode(body),
      'created_at': DateTime.now().millisecondsSinceEpoch,
      'status': 'pending',
      'attempts': 0,
    });
    _notifyChange();
    // Si hay internet, sincronizar inmediatamente
    if (ConnectivityService.instance.isOnline) {
      Future.microtask(() => processQueue());
    }
    return id;
  }

  Future<int> pendingCount() async {
    final db = await DbService.instance.database;
    final result = await db.rawQuery(
      "SELECT COUNT(*) as count FROM sync_queue WHERE status = 'pending'",
    );
    return result.first['count'] as int;
  }

  Future<void> processQueue() async {
    if (_isSyncing || !ConnectivityService.instance.isOnline) return;
    _isSyncing = true;

    try {
      final db = await DbService.instance.database;
      final pending = await db.query(
        'sync_queue',
        where: "status = 'pending'",
        orderBy: 'created_at ASC',
      );

      for (final item in pending) {
        try {
          final method = item['method'] as String;
          final endpoint = item['endpoint'] as String;
          final body = jsonDecode(item['body'] as String);

          dynamic response;
          switch (method) {
            case 'POST':
              response = await ApiService.instance.post(endpoint, data: body);
              break;
            case 'PATCH':
              response = await ApiService.instance.patch(endpoint, data: body);
              break;
            case 'DELETE':
              response = await ApiService.instance.delete(endpoint);
              break;
          }

          // Actualizar ID del server si viene en la respuesta
          if (response?.data != null && response.data is Map) {
            final serverData = response.data as Map<String, dynamic>;
            await _updateLocalWithServerId(item, serverData);
          }

          await db.delete('sync_queue', where: 'id = ?', whereArgs: [item['id']]);
        } catch (e) {
          final attempts = (item['attempts'] as int) + 1;
          if (attempts >= 5) {
            await db.update(
              'sync_queue',
              {'status': 'failed', 'attempts': attempts, 'last_error': e.toString()},
              where: 'id = ?', whereArgs: [item['id']],
            );
          } else {
            await db.update(
              'sync_queue',
              {'attempts': attempts, 'last_error': e.toString()},
              where: 'id = ?', whereArgs: [item['id']],
            );
          }
        }
      }
    } finally {
      _isSyncing = false;
      _notifyChange();
    }
  }

  Future<void> _updateLocalWithServerId(Map<String, dynamic> queueItem, Map<String, dynamic> serverData) async {
    final db = await DbService.instance.database;
    final body = jsonDecode(queueItem['body'] as String);
    final localId = body['_localId'] as String?;
    if (localId == null) return;

    final endpoint = queueItem['endpoint'] as String;
    String? table;
    String? serverId;

    if (endpoint.contains('/ventas')) {
      table = 'ventas';
      serverId = serverData['venta']?['id'];
    } else if (endpoint.contains('/pagos')) {
      table = 'pagos';
      serverId = serverData['pago']?['id'];
    } else if (endpoint.contains('/devoluciones')) {
      table = 'devoluciones';
      serverId = serverData['devolucion']?['id'];
    }

    if (table != null && serverId != null) {
      await db.update(
        table,
        {'server_id': serverId, 'sync_status': 'synced'},
        where: 'id = ?', whereArgs: [localId],
      );
    }
  }

  Future<void> _notifyChange() async {
    final count = await pendingCount();
    _changeController.add(count);
  }

  void dispose() {
    _connectivitySub?.cancel();
    _changeController.close();
  }
}
