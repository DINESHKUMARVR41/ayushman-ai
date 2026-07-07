import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class SyncService {
  static final SyncService _instance = SyncService._internal();
  factory SyncService() => _instance;
  SyncService._internal();

  Database? _database;
  bool _isSyncing = false;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await initDatabase();
    return _database!;
  }

  Future<Database> initDatabase() async {
    String dbPath = await getDatabasesPath();
    String path = join(dbPath, 'ayushman_offline.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        // Create an offline sync queue table
        await db.execute('''
          CREATE TABLE sync_queue (
            id TEXT PRIMARY KEY,
            facilityId TEXT,
            itemName TEXT,
            category TEXT,
            quantity INTEGER,
            unit TEXT,
            operatorEmail TEXT,
            timestamp TEXT,
            synced INTEGER DEFAULT 0
          )
        ''');
      },
    );
  }

  // Queue a stock update while offline
  Future<void> queueUpdate({
    required String facilityId,
    required String itemName,
    required String category,
    required int quantity,
    required String unit,
    required String operatorEmail,
  }) async {
    final db = await database;
    final String uniqueId = DateTime.now().millisecondsSinceEpoch.toString();
    final String timestamp = DateTime.now().toIso8601String();

    await db.insert(
      'sync_queue',
      {
        'id': uniqueId,
        'facilityId': facilityId,
        'itemName': itemName,
        'category': category,
        'quantity': quantity,
        'unit': unit,
        'operatorEmail': operatorEmail,
        'timestamp': timestamp,
        'synced': 0
      },
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // Retrieve all unsynced items in the local queue
  Future<List<Map<String, dynamic>>> getUnsyncedItems() async {
    final db = await database;
    return await db.query('sync_queue', where: 'synced = 0');
  }

  // Trigger background sync to the Express cloud server
  Future<bool> synchronizeWithServer(String serverUrl) async {
    if (_isSyncing) return false;
    _isSyncing = true;

    try {
      final unsynced = await getUnsyncedItems();
      if (unsynced.isEmpty) {
        _isSyncing = false;
        return true; // nothing to sync
      }

      final response = await http.post(
        Uri.parse('$serverUrl/api/sync'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'queue': unsynced}),
      );

      if (response.statusCode == 200) {
        final result = jsonDecode(response.body);
        if (result['success'] == true) {
          final db = await database;
          // Mark synchronized items in the SQLite database
          for (var item in unsynced) {
            await db.update(
              'sync_queue',
              {'synced': 1},
              where: 'id = ?',
              whereArgs: [item['id']],
            );
          }
          _isSyncing = false;
          return true;
        }
      }
    } catch (e) {
      print('Offline Synchronization Failed: $e');
    }

    _isSyncing = false;
    return false;
  }
}
