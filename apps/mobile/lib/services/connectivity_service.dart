import 'dart:async';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  static final ConnectivityService _instance = ConnectivityService._();
  static ConnectivityService get instance => _instance;

  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _controller = StreamController<bool>.broadcast();
  bool _isOnline = false;

  ConnectivityService._();

  bool get isOnline => _isOnline;
  Stream<bool> get onStatusChange => _controller.stream;

  Future<bool> _hasRealConnectivity() async {
    try {
      final result = await InternetAddress.lookup('google.com')
          .timeout(const Duration(seconds: 5));
      return result.isNotEmpty && result[0].rawAddress.isNotEmpty;
    } catch (_) {
      return false;
    }
  }

  void _setOnline(bool online) {
    if (online != _isOnline) {
      _isOnline = online;
      _controller.add(online);
    }
  }

  Future<void> init() async {
    // Siempre verificar con DNS real (connectivity_plus falla en Waydroid)
    _isOnline = await _hasRealConnectivity();

    _connectivity.onConnectivityChanged.listen((results) async {
      bool online = !results.contains(ConnectivityResult.none);
      if (!online) {
        online = await _hasRealConnectivity();
      }
      _setOnline(online);
    });
  }

  void dispose() {
    _controller.close();
  }
}
