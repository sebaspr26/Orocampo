import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../models/user.dart';
import '../services/auth_service.dart';
import '../services/api_service.dart';
import '../services/db_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _user;
  bool _loading = false;
  String? _error;
  bool _initialized = false;

  User? get user => _user;
  bool get loading => _loading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  bool get initialized => _initialized;

  Future<void> init() async {
    await AuthService.instance.getDeviceToken();
    final authenticated = await AuthService.instance.isAuthenticated();
    if (authenticated) {
      _user = AuthService.instance.currentUser;
    }
    _initialized = true;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _loading = true;
    _error = null;
    notifyListeners();

    try {
      final deviceToken = await AuthService.instance.getDeviceToken();
      final res = await ApiService.instance.dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
          'platform': 'mobile',
          'deviceToken': deviceToken,
        },
      );

      final data = res.data;
      final user = User.fromJson(data['user']);

      await AuthService.instance.saveSession(data['token'], user);
      _user = user;
      _loading = false;
      notifyListeners();
      return true;
    } on DioException catch (e) {
      if (e.response != null) {
        _error = e.response?.data['error'] ?? 'Error de autenticación';
      } else {
        // Sin conexión: intentar login offline
        final cachedUser = await AuthService.instance.loadCachedUser();
        if (cachedUser != null) {
          _user = cachedUser;
          _loading = false;
          notifyListeners();
          return true;
        }
        _error = 'Sin conexión a internet';
      }
      _loading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    // Notificar al backend para liberar la sesión móvil
    try {
      await ApiService.instance.post('/auth/logout');
    } catch (_) {}
    await AuthService.instance.logout();
    await DbService.instance.clearAll();
    _user = null;
    notifyListeners();
  }
}
