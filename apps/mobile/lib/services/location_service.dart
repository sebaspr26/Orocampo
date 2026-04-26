import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'api_service.dart';

class LocationService {
  static final LocationService _instance = LocationService._();
  static LocationService get instance => _instance;

  LocationService._();

  Timer? _timer;
  bool _running = false;
  String _horarioInicio = '05:00';
  String _horarioFin = '22:00';

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

  bool _isDentroDeHorario() {
    final now = DateTime.now();
    final hhmm = '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    return hhmm.compareTo(_horarioInicio) >= 0 && hhmm.compareTo(_horarioFin) <= 0;
  }

  Future<void> _fetchSettings() async {
    try {
      final res = await ApiService.instance.get('/location/settings');
      final settings = res.data['settings'];
      _horarioInicio = settings['horarioInicio'] ?? '05:00';
      _horarioFin = settings['horarioFin'] ?? '22:00';
    } catch (_) {}
  }

  Future<void> start() async {
    if (_running) return;

    final hasPermission = await _checkPermissions();
    if (!hasPermission) return;

    await _fetchSettings();
    _running = true;

    _sendLocation();
    _timer = Timer.periodic(const Duration(seconds: 15), (_) => _sendLocation());
  }

  Future<void> _sendLocation() async {
    if (!_isDentroDeHorario()) return;

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
