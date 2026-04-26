import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DbService {
  static final DbService _instance = DbService._();
  static DbService get instance => _instance;

  Database? _db;

  DbService._();

  Future<Database> get database async {
    _db ??= await _initDb();
    return _db!;
  }

  Future<Database> _initDb() async {
    final path = join(await getDatabasesPath(), 'orocampo.db');
    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE sync_queue (
            id TEXT PRIMARY KEY,
            method TEXT NOT NULL,
            endpoint TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            status TEXT DEFAULT 'pending',
            attempts INTEGER DEFAULT 0,
            last_error TEXT
          )
        ''');

        await db.execute('''
          CREATE TABLE clientes (
            id TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            telefono TEXT,
            direccion TEXT,
            es_mostrador INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1
          )
        ''');

        await db.execute('''
          CREATE TABLE productos (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
          )
        ''');

        await db.execute('''
          CREATE TABLE ventas (
            id TEXT PRIMARY KEY,
            server_id TEXT,
            cliente_id TEXT NOT NULL,
            cliente_nombre TEXT,
            metodo_pago TEXT NOT NULL,
            total REAL NOT NULL,
            estado TEXT NOT NULL DEFAULT 'PENDIENTE',
            notas TEXT,
            items_json TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            sync_status TEXT DEFAULT 'pending'
          )
        ''');

        await db.execute('''
          CREATE TABLE pagos (
            id TEXT PRIMARY KEY,
            server_id TEXT,
            cliente_id TEXT NOT NULL,
            cliente_nombre TEXT,
            venta_id TEXT,
            monto REAL NOT NULL,
            metodo_pago TEXT NOT NULL,
            fecha INTEGER NOT NULL,
            notas TEXT,
            foto_path TEXT,
            sync_status TEXT DEFAULT 'pending'
          )
        ''');

        await db.execute('''
          CREATE TABLE devoluciones (
            id TEXT PRIMARY KEY,
            server_id TEXT,
            cliente_id TEXT NOT NULL,
            cliente_nombre TEXT,
            venta_id TEXT,
            motivo TEXT NOT NULL,
            items_json TEXT NOT NULL,
            created_at INTEGER NOT NULL,
            sync_status TEXT DEFAULT 'pending'
          )
        ''');

        await db.execute('''
          CREATE TABLE ruta (
            id TEXT PRIMARY KEY,
            nombre TEXT NOT NULL
          )
        ''');

        await db.execute('''
          CREATE TABLE ruta_clientes (
            id TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            telefono TEXT,
            direccion TEXT,
            visitado INTEGER DEFAULT 0,
            entregado INTEGER DEFAULT 0,
            fecha_visita TEXT
          )
        ''');

        await db.execute('''
          CREATE TABLE notifications (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL,
            is_read INTEGER DEFAULT 0
          )
        ''');
      },
    );
  }

  Future<void> clearAll() async {
    final db = await database;
    await db.delete('sync_queue');
    await db.delete('clientes');
    await db.delete('productos');
    await db.delete('ventas');
    await db.delete('pagos');
    await db.delete('devoluciones');
    await db.delete('ruta');
    await db.delete('ruta_clientes');
    await db.delete('notifications');
  }
}
