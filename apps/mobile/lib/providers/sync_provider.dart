import 'dart:async';
import 'package:flutter/material.dart';
import '../services/sync_service.dart';

class SyncProvider extends ChangeNotifier {
  int _pendingCount = 0;
  bool _isSyncing = false;
  StreamSubscription? _sub;

  int get pendingCount => _pendingCount;
  bool get isSyncing => _isSyncing;

  Future<void> init() async {
    _pendingCount = await SyncService.instance.pendingCount();
    _sub = SyncService.instance.onPendingCountChange.listen((count) {
      _pendingCount = count;
      _isSyncing = SyncService.instance.isSyncing;
      notifyListeners();
    });
    notifyListeners();
  }

  Future<void> syncNow() async {
    _isSyncing = true;
    notifyListeners();
    await SyncService.instance.processQueue();
    _pendingCount = await SyncService.instance.pendingCount();
    _isSyncing = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
