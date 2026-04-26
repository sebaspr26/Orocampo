import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../config/app_theme.dart';
import '../../services/api_service.dart';

class AdminTracking extends StatefulWidget {
  const AdminTracking({super.key});
  @override
  State<AdminTracking> createState() => _AdminTrackingState();
}

class _AdminTrackingState extends State<AdminTracking> {
  final MapController _mapController = MapController();
  Timer? _timer;
  List<_DomiciliarioLocation> _locations = [];
  List<LatLng> _routeHistory = [];
  String? _selectedUserId;
  String? _selectedName;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchLocations();
    _timer = Timer.periodic(const Duration(seconds: 10), (_) => _fetchLocations());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _fetchLocations() async {
    try {
      final res = await ApiService.instance.get('/location/all');
      final list = (res.data['locations'] as List).map((e) {
        final loc = e['location'];
        return _DomiciliarioLocation(
          userId: e['userId'],
          name: e['name'] ?? 'Sin nombre',
          lat: loc != null ? (loc['lat'] as num).toDouble() : null,
          lng: loc != null ? (loc['lng'] as num).toDouble() : null,
          updatedAt: loc != null ? DateTime.parse(loc['createdAt']) : null,
        );
      }).toList();
      if (mounted) setState(() { _locations = list; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _fetchHistory(String userId, String name) async {
    try {
      final res = await ApiService.instance.get('/location/$userId/history');
      final history = (res.data['history'] as List)
          .map((e) => LatLng((e['lat'] as num).toDouble(), (e['lng'] as num).toDouble()))
          .toList();
      if (mounted) {
        setState(() {
          _selectedUserId = userId;
          _selectedName = name;
          _routeHistory = history;
        });
      }
    } catch (_) {}
  }

  void _clearSelection() {
    setState(() {
      _selectedUserId = null;
      _selectedName = null;
      _routeHistory = [];
    });
  }

  String _timeAgo(DateTime? dt) {
    if (dt == null) return 'sin datos';
    final diff = DateTime.now().difference(dt);
    if (diff.inSeconds < 60) return 'hace ${diff.inSeconds}s';
    if (diff.inMinutes < 60) return 'hace ${diff.inMinutes}min';
    return 'hace ${diff.inHours}h';
  }

  @override
  Widget build(BuildContext context) {
    final withLocation = _locations.where((l) => l.lat != null).toList();
    final center = withLocation.isNotEmpty
        ? LatLng(withLocation.first.lat!, withLocation.first.lng!)
        : const LatLng(4.6097, -74.0817);

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primaryDark))
          : Stack(
              children: [
                FlutterMap(
                  mapController: _mapController,
                  options: MapOptions(initialCenter: center, initialZoom: 13),
                  children: [
                    TileLayer(
                      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                      userAgentPackageName: 'com.orocampo.mobile',
                    ),
                    if (_routeHistory.length > 1)
                      PolylineLayer(polylines: [
                        Polyline(points: _routeHistory, color: AppColors.primaryDark, strokeWidth: 3),
                      ]),
                    MarkerLayer(
                      markers: withLocation.map((loc) => Marker(
                        point: LatLng(loc.lat!, loc.lng!),
                        width: 120,
                        height: 56,
                        child: GestureDetector(
                          onTap: () => _fetchHistory(loc.userId, loc.name),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: _selectedUserId == loc.userId ? AppColors.primaryDark : Colors.white,
                                  borderRadius: BorderRadius.circular(10),
                                  boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 6)],
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      loc.name.split(' ').first,
                                      style: TextStyle(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: _selectedUserId == loc.userId ? Colors.white : AppColors.dark,
                                      ),
                                    ),
                                    Text(
                                      _timeAgo(loc.updatedAt),
                                      style: TextStyle(
                                        fontSize: 9,
                                        color: _selectedUserId == loc.userId ? Colors.white70 : AppColors.muted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Icon(Icons.location_on, color: AppColors.primaryDark, size: 22),
                            ],
                          ),
                        ),
                      )).toList(),
                    ),
                  ],
                ),
                if (_selectedName != null)
                  Positioned(
                    top: 12, left: 12, right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 10)],
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.route_rounded, color: AppColors.primaryDark, size: 20),
                          const SizedBox(width: 8),
                          Expanded(child: Text('Ruta de $_selectedName', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.dark))),
                          Text('${_routeHistory.length} puntos', style: const TextStyle(fontSize: 12, color: AppColors.muted)),
                          const SizedBox(width: 8),
                          GestureDetector(
                            onTap: _clearSelection,
                            child: const Icon(Icons.close_rounded, color: AppColors.muted, size: 20),
                          ),
                        ],
                      ),
                    ),
                  ),
                if (withLocation.isEmpty && !_loading)
                  Center(
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      margin: const EdgeInsets.all(32),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                      child: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.location_off_rounded, size: 48, color: AppColors.muted),
                          SizedBox(height: 12),
                          Text('Sin ubicaciones activas', style: TextStyle(fontWeight: FontWeight.w700, color: AppColors.dark)),
                          SizedBox(height: 4),
                          Text('Los domiciliarios aparecen aqui cuando estan en horario laboral', textAlign: TextAlign.center, style: TextStyle(fontSize: 13, color: AppColors.muted)),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
    );
  }
}

class _DomiciliarioLocation {
  final String userId;
  final String name;
  final double? lat;
  final double? lng;
  final DateTime? updatedAt;

  _DomiciliarioLocation({required this.userId, required this.name, this.lat, this.lng, this.updatedAt});
}
