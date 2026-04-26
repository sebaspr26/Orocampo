import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../config/app_theme.dart';
import '../../services/api_service.dart';

const _markerColors = [
  Color(0xFFE53935), // rojo
  Color(0xFF1E88E5), // azul
  Color(0xFF43A047), // verde
  Color(0xFFFF8F00), // naranja
  Color(0xFF8E24AA), // morado
  Color(0xFF00ACC1), // cyan
  Color(0xFFD81B60), // rosa
  Color(0xFF3949AB), // indigo
];

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
  bool _refreshCooldown = false;

  Color _colorFor(int index) => _markerColors[index % _markerColors.length];

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

  Future<void> _manualRefresh() async {
    if (_refreshCooldown) return;
    setState(() => _refreshCooldown = true);
    await _fetchLocations();
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) setState(() => _refreshCooldown = false);
    });
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

    // Color del domiciliario seleccionado para la polyline
    final selectedIndex = _locations.indexWhere((l) => l.userId == _selectedUserId);
    final routeColor = selectedIndex >= 0 ? _colorFor(selectedIndex) : AppColors.primaryDark;

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
                        Polyline(points: _routeHistory, color: routeColor, strokeWidth: 4),
                      ]),
                    MarkerLayer(
                      markers: withLocation.asMap().entries.map((entry) {
                        final i = _locations.indexOf(entry.value);
                        final loc = entry.value;
                        final color = _colorFor(i);
                        final selected = _selectedUserId == loc.userId;
                        return Marker(
                          point: LatLng(loc.lat!, loc.lng!),
                          width: 130,
                          height: 80,
                          alignment: Alignment.bottomCenter,
                          child: GestureDetector(
                            onTap: () => _fetchHistory(loc.userId, loc.name),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: color, width: selected ? 2.5 : 1.5),
                                    boxShadow: [BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 8, offset: const Offset(0, 2))],
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Container(
                                        width: 8, height: 8,
                                        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                                      ),
                                      const SizedBox(width: 6),
                                      Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Text(
                                            loc.name.split(' ').first,
                                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: color),
                                          ),
                                          Text(
                                            _timeAgo(loc.updatedAt),
                                            style: const TextStyle(fontSize: 9, color: AppColors.muted),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                CustomPaint(
                                  size: const Size(14, 10),
                                  painter: _ArrowPainter(color: color),
                                ),
                              ],
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ],
                ),
                // Barra selección
                if (_selectedName != null)
                  Positioned(
                    top: 12, left: 12, right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: routeColor.withValues(alpha: 0.3)),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 10)],
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 10, height: 10,
                            decoration: BoxDecoration(color: routeColor, shape: BoxShape.circle),
                          ),
                          const SizedBox(width: 10),
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
                // Botón refresh
                Positioned(
                  bottom: 16, right: 16,
                  child: GestureDetector(
                    onTap: _manualRefresh,
                    child: Container(
                      width: 48, height: 48,
                      decoration: BoxDecoration(
                        color: _refreshCooldown ? AppColors.muted : AppColors.primaryDark,
                        shape: BoxShape.circle,
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.2), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: Icon(
                        _refreshCooldown ? Icons.hourglass_top_rounded : Icons.refresh_rounded,
                        color: Colors.white, size: 22,
                      ),
                    ),
                  ),
                ),
                // Leyenda de colores
                if (_locations.isNotEmpty)
                  Positioned(
                    bottom: 16, left: 12,
                    child: Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 8)],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: _locations.asMap().entries.map((entry) {
                          final color = _colorFor(entry.key);
                          final loc = entry.value;
                          final hasLoc = loc.lat != null;
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 2),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 10, height: 10,
                                  decoration: BoxDecoration(
                                    color: hasLoc ? color : AppColors.muted,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  loc.name.split(' ').first,
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                    color: hasLoc ? AppColors.dark : AppColors.muted,
                                  ),
                                ),
                                if (!hasLoc) const Text(' (offline)', style: TextStyle(fontSize: 9, color: AppColors.muted)),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                  ),
                // Empty state
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

class _ArrowPainter extends CustomPainter {
  final Color color;
  const _ArrowPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..color = color..style = PaintingStyle.fill;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(size.width / 2, size.height)
      ..lineTo(size.width, 0)
      ..close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _ArrowPainter old) => old.color != color;
}

class _DomiciliarioLocation {
  final String userId;
  final String name;
  final double? lat;
  final double? lng;
  final DateTime? updatedAt;

  _DomiciliarioLocation({required this.userId, required this.name, this.lat, this.lng, this.updatedAt});
}
