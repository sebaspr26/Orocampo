import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

class LocationService {
  static final LocationService _instance = LocationService._();
  static LocationService get instance => _instance;

  LocationService._();

  Timer? _timer;
  bool _running = false;

  bool get isRunning => _running;

  Future<bool> _checkPermissions() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return false;
    }
    if (permission == LocationPermission.deniedForever) return false;

    if (!await Geolocator.isLocationServiceEnabled()) return false;
    return true;
  }

  Future<void> start() async {
    if (_running) return;

    final hasPermission = await _checkPermissions();
    if (!hasPermission) return;

    _running = true;
    _sendLocation();
    _timer = Timer.periodic(const Duration(seconds: 15), (_) => _sendLocation());
  }

  Future<void> _sendLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(accuracy: LocationAccuracy.high, timeLimit: Duration(seconds: 10)),
      );
      await ApiService.instance.post('/location', data: {
        'lat': position.latitude,
        'lng': position.longitude,
      });
    } catch (_) {}
  }

  void stop() {
    _timer?.cancel();
    _timer = null;
    _running = false;
  }
}
