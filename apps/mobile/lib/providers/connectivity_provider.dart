import 'dart:async';
import 'package:flutter/material.dart';
import '../services/connectivity_service.dart';

class ConnectivityProvider extends ChangeNotifier {
  bool _isOnline = true;
  StreamSubscription? _sub;

  bool get isOnline => _isOnline;

  void init() {
    _isOnline = ConnectivityService.instance.isOnline;
    _sub = ConnectivityService.instance.onStatusChange.listen((online) {
      _isOnline = online;
      notifyListeners();
    });
  }

  @override
  void dispose() {
    _sub?.cancel();
    super.dispose();
  }
}
