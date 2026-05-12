import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

class LocationService {
  static final LocationService _instance = LocationService._();
  static LocationService get instance => _instance;

  LocationService._();

  StreamSubscription<Position>? _positionSub;
  bool _running = false;

  bool get isRunning => _running;

  Future<void> start() async {
    if (_running) return;

    try {
      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) return;
      }
      if (permission == LocationPermission.deniedForever) return;
      if (!await Geolocator.isLocationServiceEnabled()) return;

      _running = true;

      final androidSettings = AndroidSettings(
        accuracy: LocationAccuracy.high,
        intervalDuration: const Duration(seconds: 15),
        foregroundNotificationConfig: const ForegroundNotificationConfig(
          notificationTitle: 'OROCAMPO',
          notificationText: 'Rastreo de ubicación activo',
          enableWakeLock: true,
          setOngoing: true,
          notificationChannelName: 'Rastreo de ubicación',
        ),
      );

      _positionSub = Geolocator.getPositionStream(
        locationSettings: androidSettings,
      ).listen((position) {
        _sendLocation(position);
      });
    } catch (_) {
      _running = false;
    }
  }

  Future<void> _sendLocation(Position position) async {
    try {
      await ApiService.instance.post('/location', data: {
        'lat': position.latitude,
        'lng': position.longitude,
      });
    } catch (_) {}
  }

  void stop() {
    _positionSub?.cancel();
    _positionSub = null;
    _running = false;
  }
}
